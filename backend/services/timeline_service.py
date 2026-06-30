from collections import Counter
from datetime import UTC, date, datetime, timedelta
from typing import TYPE_CHECKING, Protocol

from schemas.memory import MemoryResponse
from schemas.timeline import (
    TimelineEvent,
    TimelineGroupedResponse,
    TimelinePaginatedResponse,
    TimelineStats,
)
from utils.logging import get_logger

if TYPE_CHECKING:
    from services.memory_service import MemoryService
    from services.user_service import UserService
    from services.workspace_service import WorkspaceService

logger = get_logger(__name__)
CHAT_MEMORY_TYPE = "chat_message"


class TimelineEventProvider(Protocol):
    async def get_events(self, user_id: str) -> list[TimelineEvent]:
        pass


class ChatEventProvider:
    def __init__(self, memory_service: "MemoryService") -> None:
        self.memory_service = memory_service

    async def get_events(self, user_id: str) -> list[TimelineEvent]:
        memories = (await self.memory_service.list_memories(user_id)).memories
        return [self._to_event(memory) for memory in memories if memory.metadata.get("type") == CHAT_MEMORY_TYPE]

    def _to_event(self, memory: MemoryResponse) -> TimelineEvent:
        role = str(memory.metadata.get("role") or "user")
        conversation_id = str(memory.metadata.get("conversation_id") or "")
        return TimelineEvent(
            id=f"chat:{memory.id}",
            type="chat",
            title=self._title(memory.content, role),
            description="Conversation message created",
            timestamp=memory.created_at,
            icon="message-circle",
            source="chat",
            metadata={
                "memory_id": memory.id,
                "conversation_id": conversation_id,
                "role": role,
            },
            user_id=memory.user_id,
        )

    def _title(self, content: str, role: str) -> str:
        prefix = "Asked AI" if role == "user" else "AI responded"
        cleaned = " ".join(content.split())
        if not cleaned:
            return prefix
        return f"{prefix}: {self._truncate(cleaned, 70)}"

    def _truncate(self, value: str, max_length: int) -> str:
        if len(value) <= max_length:
            return value
        return f"{value[: max_length - 3]}..."


class MemoryEventProvider:
    def __init__(self, memory_service: "MemoryService") -> None:
        self.memory_service = memory_service

    async def get_events(self, user_id: str) -> list[TimelineEvent]:
        memories = (await self.memory_service.list_memories(user_id)).memories
        return [self._to_event(memory) for memory in memories if memory.metadata.get("type") != CHAT_MEMORY_TYPE]

    def _to_event(self, memory: MemoryResponse) -> TimelineEvent:
        return TimelineEvent(
            id=f"memory:{memory.id}",
            type="memory",
            title=self._title(memory),
            description="Memory stored",
            timestamp=memory.created_at,
            icon="brain",
            source="memory",
            metadata={"memory_id": memory.id, **memory.metadata},
            user_id=memory.user_id,
        )

    def _title(self, memory: MemoryResponse) -> str:
        title = memory.metadata.get("title")
        if title:
            return str(title)
        cleaned = " ".join(memory.content.split())
        if len(cleaned) <= 80:
            return cleaned or "Memory stored"
        return f"{cleaned[:77]}..."


class UserActivityEventProvider:
    def __init__(self, user_service: "UserService") -> None:
        self.user_service = user_service

    async def get_events(self, user_id: str) -> list[TimelineEvent]:
        user = await self.user_service.get_current_user(user_id)
        if not user.created_at:
            return []

        return [
            TimelineEvent(
                id=f"user:{user.id}:created",
                type="user",
                title="User profile created",
                description="User joined MemoryOS",
                timestamp=user.created_at,
                icon="user",
                source="user",
                metadata={"email": user.email, "display_name": user.display_name},
                user_id=user.id,
            )
        ]


class WorkspaceActivityEventProvider:
    def __init__(self, workspace_service: "WorkspaceService") -> None:
        self.workspace_service = workspace_service

    async def get_events(self, user_id: str) -> list[TimelineEvent]:
        workspace = await self.workspace_service.get_workspace(user_id)
        if not workspace.created_at:
            return []

        return [
            TimelineEvent(
                id=f"workspace:{workspace.id}:created",
                type="workspace",
                title=f"Workspace created: {workspace.name or 'Untitled workspace'}",
                description="Workspace activity",
                timestamp=workspace.created_at,
                icon="briefcase",
                source="workspace",
                metadata={
                    "workspace_id": workspace.id,
                    "members_count": workspace.members_count,
                    "current_plan": workspace.current_plan,
                },
                user_id=user_id,
            )
        ]


class TimelineService:
    def __init__(self, event_providers: list[TimelineEventProvider]) -> None:
        self.event_providers = event_providers

    async def get_recent_events(self, user_id: str, limit: int = 20) -> list[TimelineEvent]:
        events = await self._get_all_events(user_id)
        return events[:limit]

    async def get_events_paginated(self, user_id: str, page: int = 1, limit: int = 20) -> TimelinePaginatedResponse:
        events = await self._get_all_events(user_id)
        page = max(page, 1)
        limit = max(min(limit, 100), 1)
        start = (page - 1) * limit
        end = start + limit
        page_events = events[start:end]

        return TimelinePaginatedResponse(
            events=page_events,
            page=page,
            limit=limit,
            total=len(events),
            has_next=end < len(events),
        )

    async def search_events(self, user_id: str, query: str) -> list[TimelineEvent]:
        normalized = query.casefold().strip()
        if not normalized:
            return []

        events = await self._get_all_events(user_id)
        return [
            event
            for event in events
            if normalized in event.title.casefold() or normalized in event.description.casefold()
        ]

    async def filter_events(
        self,
        user_id: str,
        event_type: str | None = None,
        source: str | None = None,
        date_from: datetime | None = None,
        date_to: datetime | None = None,
    ) -> list[TimelineEvent]:
        events = await self._get_all_events(user_id)
        return [
            event
            for event in events
            if self._matches_filter(event, event_type, source, date_from, date_to)
        ]

    async def group_events_by_date(self, user_id: str) -> TimelineGroupedResponse:
        events = await self._get_all_events(user_id)
        today = datetime.now(UTC).date()
        yesterday = today - timedelta(days=1)
        week_start = today - timedelta(days=7)

        grouped = TimelineGroupedResponse()
        for event in events:
            event_date = self._as_aware(event.timestamp).date()
            if event_date == today:
                grouped.today.append(event)
            elif event_date == yesterday:
                grouped.yesterday.append(event)
            elif week_start <= event_date < yesterday:
                grouped.last_week.append(event)
            else:
                grouped.older.append(event)
        return grouped

    async def get_stats(self, user_id: str) -> TimelineStats:
        events = await self._get_all_events(user_id)
        today = datetime.now(UTC).date()
        week_start = today - timedelta(days=7)
        month_start = today - timedelta(days=30)
        sources = Counter(event.source for event in events)

        return TimelineStats(
            today_events=self._count_since(events, today),
            week_events=self._count_since(events, week_start),
            month_events=self._count_since(events, month_start),
            most_common_source=sources.most_common(1)[0][0] if sources else "chat",
        )

    async def _get_all_events(self, user_id: str) -> list[TimelineEvent]:
        events: list[TimelineEvent] = []
        for provider in self.event_providers:
            provider_events = await provider.get_events(user_id)
            events.extend(provider_events)

        return sorted(events, key=lambda event: self._as_aware(event.timestamp), reverse=True)

    def _matches_filter(
        self,
        event: TimelineEvent,
        event_type: str | None,
        source: str | None,
        date_from: datetime | None,
        date_to: datetime | None,
    ) -> bool:
        if event_type and event.type.casefold() != event_type.casefold():
            return False
        if source and event.source.casefold() != source.casefold():
            return False

        timestamp = self._as_aware(event.timestamp)
        if date_from and timestamp < self._as_aware(date_from):
            return False
        if date_to and timestamp > self._end_of_day_if_date_only(date_to):
            return False
        return True

    def _count_since(self, events: list[TimelineEvent], start_date: date) -> int:
        return sum(1 for event in events if self._as_aware(event.timestamp).date() >= start_date)

    def _as_aware(self, value: datetime) -> datetime:
        if value.tzinfo is None:
            return value.replace(tzinfo=UTC)
        return value.astimezone(UTC)

    def _end_of_day_if_date_only(self, value: datetime) -> datetime:
        aware = self._as_aware(value)
        if aware.time() == datetime.min.time():
            return aware.replace(hour=23, minute=59, second=59, microsecond=999999)
        return aware
