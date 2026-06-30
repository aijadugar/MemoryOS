from datetime import UTC, datetime
from typing import TYPE_CHECKING

from schemas.dashboard import (
    DashboardActivityItem,
    DashboardRecent,
    DashboardRecentConversation,
    DashboardStats,
    DashboardSuggestions,
    DashboardSummary,
)
from schemas.llm import LLMMessage
from schemas.memory import MemoryResponse
from utils.exceptions import AppError
from utils.logging import get_logger

if TYPE_CHECKING:
    from services.llm_service import LLMService
    from services.memory_service import MemoryService
    from services.user_service import UserService
    from services.workspace_service import WorkspaceService

logger = get_logger(__name__)


class DashboardService:
    def __init__(
        self,
        memory_service: "MemoryService",
        workspace_service: "WorkspaceService",
        user_service: "UserService",
        llm_service: "LLMService",
    ) -> None:
        self.memory_service = memory_service
        self.workspace_service = workspace_service
        self.user_service = user_service
        self.llm_service = llm_service

    async def get_summary(self, user_id: str) -> DashboardSummary:
        workspace = await self.workspace_service.get_workspace(user_id)
        user = await self.user_service.get_current_user(user_id)
        stats = await self._get_stats(user_id)
        memories = await self._list_memories(user_id)
        last_activity = self._last_memory_timestamp(memories)
        user_name = user.display_name or user.email

        return DashboardSummary(
            workspace_name=workspace.name,
            user_name=user_name,
            welcome_message=self._welcome_message(user_name, stats.memories, stats.conversations),
            memory_count=stats.memories,
            conversation_count=stats.conversations,
            integration_count=stats.integrations,
            last_activity=last_activity,
            health_score=self._health_score(
                memories=stats.memories,
                conversations=stats.conversations,
                integrations=stats.integrations,
                last_activity=last_activity,
            ),
        )

    async def get_activity(self, user_id: str) -> list[DashboardActivityItem]:
        memories = await self._list_memories(user_id)
        recent = sorted(memories, key=lambda memory: memory.created_at, reverse=True)[:10]
        return [
            DashboardActivityItem(
                type=str(memory.metadata.get("type") or "memory"),
                title=self._activity_title(memory),
                timestamp=memory.created_at,
            )
            for memory in recent
        ]

    async def get_stats(self, user_id: str) -> DashboardStats:
        return await self._get_stats(user_id)

    async def get_suggestions(self, user_id: str) -> DashboardSuggestions:
        workspace = await self.workspace_service.get_workspace(user_id)
        user = await self.user_service.get_current_user(user_id)
        stats = await self._get_stats(user_id)
        fallback = self._fallback_suggestions(stats)

        prompt = (
            "Return 2 to 4 concise dashboard suggestions, one per line. "
            "Only suggest actions supported by chat, memories, workspace setup, or document upload. "
            "Do not mention unavailable integrations unless integration_count is greater than 0."
        )
        context = (
            f"User: {user.display_name or user.email or 'User'}\n"
            f"Workspace: {workspace.name or 'MemoryOS'}\n"
            f"Memories: {stats.memories}\n"
            f"Conversations: {stats.conversations}\n"
            f"Documents: {stats.documents}\n"
            f"Integrations: {stats.integrations}"
        )

        try:
            response = await self.llm_service.chat(
                messages=[LLMMessage(role="user", content=context)],
                system_prompt=prompt,
            )
        except AppError as exc:
            logger.info("Dashboard suggestions using fallback for user %s: %s", user_id, exc.error)
            return DashboardSuggestions(fallback)

        suggestions = self._clean_suggestions(response.content)
        return DashboardSuggestions(suggestions or fallback)

    async def get_recent(self, user_id: str) -> DashboardRecent:
        memories = sorted(await self._list_memories(user_id), key=lambda memory: memory.created_at, reverse=True)[:5]
        conversations = [
            DashboardRecentConversation(
                id=memory.id,
                title=self._activity_title(memory),
                timestamp=memory.created_at,
            )
            for memory in memories
            if str(memory.metadata.get("type") or "").casefold() == "chat"
        ][:5]

        return DashboardRecent(memories=memories, conversations=conversations, uploaded_files=[])

    async def _get_stats(self, user_id: str) -> DashboardStats:
        user_stats = await self.user_service.get_user_stats(user_id)
        memory_count = max(user_stats.memory_count, len(await self._list_memories(user_id)))
        return DashboardStats(
            documents=user_stats.document_count,
            memories=memory_count,
            conversations=user_stats.chat_count,
            integrations=user_stats.integration_count,
            graph_nodes=0,
        )

    async def _list_memories(self, user_id: str) -> list[MemoryResponse]:
        return (await self.memory_service.list_memories(user_id)).memories

    def _welcome_message(self, user_name: str | None, memory_count: int, conversation_count: int) -> str:
        if memory_count == 0 and conversation_count == 0:
            return "Welcome to MemoryOS. Start your first conversation."

        name = user_name or "there"
        return f"Welcome back, {name}. You have {conversation_count} conversations and {memory_count} stored memories."

    def _health_score(
        self,
        memories: int,
        conversations: int,
        integrations: int,
        last_activity: datetime | None,
    ) -> int:
        score = 40
        score += min(memories, 20)
        score += min(conversations * 2, 20)
        score += min(integrations * 5, 10)

        if last_activity:
            age_days = (datetime.now(UTC) - self._as_aware(last_activity)).days
            if age_days <= 7:
                score += 10
            elif age_days <= 30:
                score += 5

        if memories == 0:
            score -= 20
        if conversations == 0:
            score -= 15
        if integrations == 0:
            score -= 5
        if last_activity is None:
            score -= 10

        return max(0, min(100, score))

    def _fallback_suggestions(self, stats: DashboardStats) -> list[str]:
        suggestions: list[str] = []
        if stats.conversations > 0:
            suggestions.append("Continue your previous conversation.")
        else:
            suggestions.append("Start your first conversation.")
        if stats.documents == 0:
            suggestions.append("Upload project documentation.")
        if stats.memories == 0:
            suggestions.append("Create your first memory from a chat.")
        if stats.memories > 0:
            suggestions.append("Review recent memories.")
        return suggestions[:4]

    def _clean_suggestions(self, content: str) -> list[str]:
        suggestions: list[str] = []
        blocked_terms = {"github", "calendar", "composio", "voice", "timeline", "graph"}
        for line in content.splitlines():
            suggestion = line.strip().lstrip("-*0123456789. ")
            if not suggestion:
                continue
            if any(term in suggestion.casefold() for term in blocked_terms):
                continue
            suggestions.append(suggestion)
        return suggestions[:4]

    def _activity_title(self, memory: MemoryResponse) -> str:
        title = memory.metadata.get("title")
        if title:
            return str(title)

        content = " ".join(memory.content.split())
        if len(content) <= 80:
            return content
        return f"{content[:77]}..."

    def _last_memory_timestamp(self, memories: list[MemoryResponse]) -> datetime | None:
        if not memories:
            return None
        return max(memory.created_at for memory in memories)

    def _as_aware(self, value: datetime) -> datetime:
        if value.tzinfo is None:
            return value.replace(tzinfo=UTC)
        return value.astimezone(UTC)
