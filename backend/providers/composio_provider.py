import inspect
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

from config.settings import Settings
from schemas.integrations import NormalizedIntegrationItem
from utils.exceptions import AppError


@dataclass(frozen=True)
class IntegrationDefinition:
    id: str
    name: str
    slug: str
    description: str
    icon: str
    toolkit: str
    sync_actions: tuple[str, ...]
    available_actions: tuple[str, ...]


INTEGRATION_REGISTRY: dict[str, IntegrationDefinition] = {
    "github": IntegrationDefinition(
        id="github",
        name="GitHub",
        slug="github",
        description="Sync repositories, issues, pull requests, and code activity.",
        icon="github",
        toolkit="GITHUB",
        sync_actions=("GITHUB_LIST_REPOSITORIES", "GITHUB_LIST_ISSUES", "GITHUB_LIST_PULL_REQUESTS"),
        available_actions=("list_repositories", "list_issues", "list_pull_requests"),
    ),
    "gmail": IntegrationDefinition(
        id="gmail",
        name="Gmail",
        slug="gmail",
        description="Sync recent email threads and messages.",
        icon="mail",
        toolkit="GMAIL",
        sync_actions=("GMAIL_FETCH_EMAILS", "GMAIL_LIST_THREADS"),
        available_actions=("fetch_emails", "list_threads", "send_email"),
    ),
    "google-calendar": IntegrationDefinition(
        id="google-calendar",
        name="Google Calendar",
        slug="google-calendar",
        description="Sync calendar events and schedules.",
        icon="calendar",
        toolkit="GOOGLECALENDAR",
        sync_actions=("GOOGLECALENDAR_FIND_EVENT", "GOOGLECALENDAR_GET_CALENDAR"),
        available_actions=("find_events", "create_event", "update_event"),
    ),
    "google-drive": IntegrationDefinition(
        id="google-drive",
        name="Google Drive",
        slug="google-drive",
        description="Sync files, folders, and document metadata.",
        icon="folder",
        toolkit="GOOGLEDRIVE",
        sync_actions=("GOOGLEDRIVE_LIST_FILES",),
        available_actions=("list_files", "search_files", "download_file"),
    ),
    "slack": IntegrationDefinition(
        id="slack",
        name="Slack",
        slug="slack",
        description="Sync workspace channels, messages, and conversations.",
        icon="slack",
        toolkit="SLACK",
        sync_actions=("SLACK_LIST_CONVERSATIONS", "SLACK_FETCH_CONVERSATION_HISTORY"),
        available_actions=("list_conversations", "fetch_conversation_history", "send_message"),
    ),
    "notion": IntegrationDefinition(
        id="notion",
        name="Notion",
        slug="notion",
        description="Sync pages, databases, and workspace knowledge.",
        icon="notion",
        toolkit="NOTION",
        sync_actions=("NOTION_SEARCH_NOTION_PAGE", "NOTION_QUERY_DATABASE"),
        available_actions=("search_pages", "query_database", "create_page"),
    ),
}


class ComposioProvider:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.client = self._create_client()

    def _create_client(self) -> object | None:
        if not self.settings.composio_api_key:
            return None

        from composio import Composio

        return Composio(api_key=self.settings.composio_api_key)

    def definitions(self) -> list[IntegrationDefinition]:
        return list(INTEGRATION_REGISTRY.values())

    def definition(self, slug: str) -> IntegrationDefinition:
        try:
            return INTEGRATION_REGISTRY[slug]
        except KeyError as exc:
            raise AppError("Integration is not supported", "integration_not_found", 404) from exc

    async def is_connected(self, user_id: str, slug: str) -> bool:
        definition = self.definition(slug)
        if not self.client:
            return False

        try:
            result = await self._call_first(
                [
                    ("connected_accounts", "list"),
                    ("connections", "list"),
                ],
                {"entity_id": user_id, "toolkit": definition.toolkit},
                {"user_id": user_id, "toolkit": definition.toolkit},
            )
        except AppError:
            raise
        except Exception as exc:
            self._raise_provider_error(exc)

        accounts = self._items_from_result(result)
        return any(self._matches_toolkit(account, definition.toolkit) for account in accounts)

    async def connect(self, user_id: str, slug: str) -> dict[str, Any]:
        definition = self.definition(slug)
        self._require_client()

        try:
            result = await self._call_first(
                [
                    ("connected_accounts", "initiate"),
                    ("connected_accounts", "initiate_connection"),
                    ("connections", "initiate"),
                    ("connections", "create"),
                ],
                {"entity_id": user_id, "toolkit": definition.toolkit},
                {"user_id": user_id, "toolkit": definition.toolkit},
                {"app": definition.toolkit, "entity_id": user_id},
            )
        except AppError:
            raise
        except Exception as exc:
            self._raise_provider_error(exc, oauth=True)

        data = self._to_dict(result)
        return {
            "redirect_url": data.get("redirect_url") or data.get("url") or data.get("auth_url"),
            "connection_id": data.get("connection_id") or data.get("id"),
            "status": data.get("status") or "pending",
        }

    async def disconnect(self, user_id: str, slug: str) -> None:
        definition = self.definition(slug)
        self._require_client()

        try:
            await self._call_first(
                [
                    ("connected_accounts", "delete"),
                    ("connected_accounts", "disconnect"),
                    ("connections", "delete"),
                    ("connections", "disconnect"),
                ],
                {"entity_id": user_id, "toolkit": definition.toolkit},
                {"user_id": user_id, "toolkit": definition.toolkit},
            )
        except AppError:
            raise
        except Exception as exc:
            self._raise_provider_error(exc)

    async def sync(self, user_id: str, slug: str) -> list[NormalizedIntegrationItem]:
        definition = self.definition(slug)
        self._require_client()

        items: list[NormalizedIntegrationItem] = []
        for action in definition.sync_actions:
            try:
                result = await self._execute_action(user_id=user_id, action=action)
            except AppError:
                raise
            except Exception as exc:
                self._raise_provider_error(exc)

            for raw_item in self._items_from_result(result):
                items.append(self._normalize_item(definition.slug, raw_item))

        return items

    async def _execute_action(self, user_id: str, action: str) -> Any:
        return await self._call_first(
            [
                ("tools", "execute"),
                ("actions", "execute"),
            ],
            {"entity_id": user_id, "action": action, "params": {}},
            {"user_id": user_id, "action": action, "params": {}},
            {"action": action, "params": {}, "entity_id": user_id},
        )

    async def _call_first(self, paths: list[tuple[str, str]], *payloads: dict[str, Any]) -> Any:
        for owner_name, method_name in paths:
            owner = getattr(self.client, owner_name, None)
            method = getattr(owner, method_name, None) if owner is not None else None
            if method is None:
                continue
            for payload in payloads:
                try:
                    result = method(**payload)
                    if inspect.isawaitable(result):
                        result = await result
                    return result
                except TypeError:
                    continue
        raise AppError("Composio operation is unavailable for this SDK version", "composio_operation_unavailable", 502)

    def _require_client(self) -> None:
        if not self.client:
            raise AppError("Composio is not configured", "composio_not_configured", 503)

    def _raise_provider_error(self, exc: Exception, oauth: bool = False) -> None:
        message = str(exc).lower()
        if oauth or "oauth" in message or "authorization" in message:
            raise AppError("Integration authorization failed", "integration_oauth_failed", 400) from exc
        if "expired" in message or "unauthorized" in message:
            raise AppError("Integration connection has expired", "integration_connection_expired", 401) from exc
        if "rate" in message or "429" in message:
            raise AppError("Integration rate limit reached", "integration_rate_limited", 429) from exc
        if "timeout" in message or "network" in message or "connection" in message:
            raise AppError("Integration network request failed", "integration_network_failed", 503) from exc
        raise AppError("Integration provider request failed", "integration_provider_failed", 502) from exc

    def _items_from_result(self, result: Any) -> list[Any]:
        data = self._to_dict(result)
        for key in ("items", "data", "results", "messages", "files", "events", "repositories"):
            value = data.get(key)
            if isinstance(value, list):
                return value
        if isinstance(result, list):
            return result
        return [data] if data else []

    def _matches_toolkit(self, account: Any, toolkit: str) -> bool:
        data = self._to_dict(account)
        candidate = data.get("toolkit") or data.get("app") or data.get("app_name") or data.get("integration")
        return str(candidate or "").upper().replace("_", "").replace("-", "") == toolkit.upper()

    def _normalize_item(self, source: str, raw_item: Any) -> NormalizedIntegrationItem:
        data = self._to_dict(raw_item)
        item_id = str(data.get("id") or data.get("uuid") or data.get("threadId") or data.get("url") or hash(str(data)))
        title = str(data.get("title") or data.get("name") or data.get("subject") or data.get("summary") or item_id)
        content = data.get("content") or data.get("body") or data.get("text") or data.get("description")
        created_at = self._parse_datetime(data.get("created_at") or data.get("createdAt") or data.get("created"))
        updated_at = self._parse_datetime(data.get("updated_at") or data.get("updatedAt") or data.get("modifiedTime"))
        author = data.get("author") or data.get("sender") or data.get("user") or data.get("owner")

        return NormalizedIntegrationItem(
            id=item_id,
            source=source,
            title=title,
            content=str(content) if content is not None else None,
            url=data.get("url") or data.get("html_url") or data.get("webViewLink") or data.get("link"),
            author=str(author) if author is not None else None,
            created_at=created_at,
            updated_at=updated_at,
            metadata=data,
        )

    def _parse_datetime(self, value: Any) -> datetime | None:
        if isinstance(value, datetime):
            return value
        if not value:
            return None
        try:
            return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        except ValueError:
            return None

    def _to_dict(self, value: Any) -> dict[str, Any]:
        if value is None:
            return {}
        if isinstance(value, dict):
            return value
        if hasattr(value, "model_dump"):
            return value.model_dump()
        if hasattr(value, "dict"):
            return value.dict()
        if hasattr(value, "__dict__"):
            return {key: val for key, val in vars(value).items() if not key.startswith("_")}
        return {"value": value, "captured_at": datetime.now(timezone.utc).isoformat()}
