import json
import time
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Any

from providers.composio_provider import ComposioProvider, IntegrationDefinition
from schemas.integrations import (
    Integration,
    IntegrationConnectionResponse,
    IntegrationStatusSummary,
    IntegrationSyncAllResponse,
    IntegrationSyncResponse,
)
from utils.logging import get_logger

logger = get_logger(__name__)

if TYPE_CHECKING:
    from providers.redis_provider import RedisProvider


class IntegrationService:
    def __init__(self, composio_provider: ComposioProvider, redis_provider: "RedisProvider | None" = None) -> None:
        self.composio_provider = composio_provider
        self.redis_provider = redis_provider

    async def list_integrations(self, user_id: str) -> list[Integration]:
        cached = await self._get_cached_integrations(user_id)
        if cached is not None:
            return cached

        integrations = [await self._build_integration(user_id, definition) for definition in self.composio_provider.definitions()]
        await self._cache_integrations(user_id, integrations)
        return integrations

    async def get_integration(self, user_id: str, slug: str) -> Integration:
        definition = self.composio_provider.definition(slug)
        return await self._build_integration(user_id, definition)

    async def connect(self, user_id: str, slug: str) -> IntegrationConnectionResponse:
        start = time.perf_counter()
        result = await self.composio_provider.connect(user_id=user_id, slug=slug)
        await self._invalidate_user_cache(user_id)
        integration = await self.get_integration(user_id, slug)
        self._log_action(user_id, slug, "connect", start)
        return IntegrationConnectionResponse(integration=integration, **result)

    async def disconnect(self, user_id: str, slug: str) -> Integration:
        start = time.perf_counter()
        await self.composio_provider.disconnect(user_id=user_id, slug=slug)
        await self._delete_last_sync(user_id, slug)
        await self._invalidate_user_cache(user_id)
        integration = await self.get_integration(user_id, slug)
        self._log_action(user_id, slug, "disconnect", start)
        return integration

    async def sync(self, user_id: str, slug: str) -> IntegrationSyncResponse:
        start = time.perf_counter()
        items = await self.composio_provider.sync(user_id=user_id, slug=slug)
        synced_at = datetime.now(timezone.utc)
        await self._set_last_sync(user_id, slug, synced_at)
        await self._invalidate_user_cache(user_id)
        integration = await self.get_integration(user_id, slug)
        self._log_action(user_id, slug, "sync", start)
        return IntegrationSyncResponse(integration=integration, items=items, synced_at=synced_at, count=len(items))

    async def sync_all(self, user_id: str) -> IntegrationSyncAllResponse:
        start = time.perf_counter()
        results: list[IntegrationSyncResponse] = []
        for integration in await self.list_integrations(user_id):
            if integration.connected:
                results.append(await self.sync(user_id, integration.slug))
        synced_at = datetime.now(timezone.utc)
        self._log_action(user_id, "all", "sync_all", start)
        return IntegrationSyncAllResponse(synced_at=synced_at, results=results)

    async def integration_status(self, user_id: str) -> IntegrationStatusSummary:
        integrations = await self.list_integrations(user_id)
        last_sync_values = [integration.last_sync for integration in integrations if integration.last_sync]
        connected = sum(1 for integration in integrations if integration.connected)
        return IntegrationStatusSummary(
            connected=connected,
            available=len(integrations),
            last_sync=max(last_sync_values) if last_sync_values else None,
            healthy=True,
        )

    async def available_actions(self, user_id: str, slug: str) -> list[str]:
        integration = await self.get_integration(user_id, slug)
        return integration.available_actions

    async def _build_integration(self, user_id: str, definition: IntegrationDefinition) -> Integration:
        connected = await self.composio_provider.is_connected(user_id=user_id, slug=definition.slug)
        last_sync = await self._get_last_sync(user_id, definition.slug)
        return Integration(
            id=definition.id,
            name=definition.name,
            slug=definition.slug,
            description=definition.description,
            icon=definition.icon,
            status="connected" if connected else "available",
            connected=connected,
            last_sync=last_sync,
            available_actions=list(definition.available_actions),
        )

    async def _get_cached_integrations(self, user_id: str) -> list[Integration] | None:
        client = self._redis_client()
        if not client:
            return None
        cached = await client.get(self._integrations_cache_key(user_id))
        if not cached:
            return None
        return [Integration.model_validate(item) for item in json.loads(cached)]

    async def _cache_integrations(self, user_id: str, integrations: list[Integration]) -> None:
        client = self._redis_client()
        if not client:
            return
        payload = json.dumps([integration.model_dump(mode="json") for integration in integrations])
        await client.setex(
            self._integrations_cache_key(user_id),
            self.composio_provider.settings.integration_cache_ttl_seconds,
            payload,
        )

    async def _invalidate_user_cache(self, user_id: str) -> None:
        client = self._redis_client()
        if client:
            await client.delete(self._integrations_cache_key(user_id))

    async def _set_last_sync(self, user_id: str, slug: str, synced_at: datetime) -> None:
        client = self._redis_client()
        if client:
            await client.set(self._last_sync_key(user_id, slug), synced_at.isoformat())

    async def _get_last_sync(self, user_id: str, slug: str) -> datetime | None:
        client = self._redis_client()
        if not client:
            return None
        value = await client.get(self._last_sync_key(user_id, slug))
        return datetime.fromisoformat(value) if value else None

    async def _delete_last_sync(self, user_id: str, slug: str) -> None:
        client = self._redis_client()
        if client:
            await client.delete(self._last_sync_key(user_id, slug))

    def _redis_client(self) -> Any:
        return self.redis_provider.client if self.redis_provider and self.redis_provider.client else None

    def _integrations_cache_key(self, user_id: str) -> str:
        return f"integrations:{user_id}:metadata"

    def _last_sync_key(self, user_id: str, slug: str) -> str:
        return f"integrations:{user_id}:{slug}:last_sync"

    def _log_action(self, user_id: str, integration: str, action: str, start: float) -> None:
        logger.info(
            "integration_action user_id=%s integration=%s action=%s execution_time_ms=%.2f",
            user_id,
            integration,
            action,
            (time.perf_counter() - start) * 1000,
        )
