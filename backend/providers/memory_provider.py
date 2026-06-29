import json
from abc import ABC, abstractmethod
from datetime import UTC, datetime
from typing import TYPE_CHECKING
from uuid import uuid4

from schemas.memory import MemoryCreate, MemoryResponse
from utils.exceptions import AppError
from utils.logging import get_logger

if TYPE_CHECKING:
    from providers.redis_provider import RedisProvider

logger = get_logger(__name__)


class BaseMemoryProvider(ABC):
    @abstractmethod
    async def remember(self, memory: MemoryCreate) -> MemoryResponse:
        pass

    @abstractmethod
    async def recall(self, user_id: str, query: str) -> list[MemoryResponse]:
        pass

    @abstractmethod
    async def improve(self, user_id: str) -> list[MemoryResponse]:
        pass

    @abstractmethod
    async def forget(self, user_id: str, memory_id: str) -> bool:
        pass

    @abstractmethod
    async def search(self, user_id: str, query: str) -> list[MemoryResponse]:
        pass

    @abstractmethod
    async def list_memories(self, user_id: str) -> list[MemoryResponse]:
        pass


class MockMemoryProvider(BaseMemoryProvider):
    def __init__(self, redis_provider: "RedisProvider | None" = None) -> None:
        self.redis_provider = redis_provider
        self._store: dict[str, list[MemoryResponse]] = {}

    async def remember(self, memory: MemoryCreate) -> MemoryResponse:
        item = MemoryResponse(
            id=str(uuid4()),
            user_id=memory.user_id,
            content=memory.content,
            created_at=datetime.now(UTC),
            metadata=memory.metadata,
        )
        memories = await self.list_memories(memory.user_id)
        memories.append(item)
        await self._save_user_memories(memory.user_id, memories)
        logger.info("Stored memory %s for user %s", item.id, memory.user_id)
        return item

    async def recall(self, user_id: str, query: str) -> list[MemoryResponse]:
        return await self.search(user_id, query)

    async def improve(self, user_id: str) -> list[MemoryResponse]:
        memories = await self.list_memories(user_id)
        logger.info("Improved memory set requested for user %s", user_id)
        return memories

    async def forget(self, user_id: str, memory_id: str) -> bool:
        memories = await self.list_memories(user_id)
        remaining = [memory for memory in memories if memory.id != memory_id]
        deleted = len(remaining) != len(memories)
        if deleted:
            await self._save_user_memories(user_id, remaining)
            logger.info("Deleted memory %s for user %s", memory_id, user_id)
        return deleted

    async def search(self, user_id: str, query: str) -> list[MemoryResponse]:
        memories = await self.list_memories(user_id)
        normalized_query = query.casefold()
        return [
            memory
            for memory in memories
            if normalized_query in memory.content.casefold()
            or any(normalized_query in str(value).casefold() for value in memory.metadata.values())
        ]

    async def list_memories(self, user_id: str) -> list[MemoryResponse]:
        redis_client = await self._get_redis_client()
        if redis_client:
            try:
                payload = await redis_client.get(self._key(user_id))
                if payload:
                    return [MemoryResponse.model_validate(item) for item in json.loads(payload)]
                return []
            except Exception as exc:
                logger.warning(
                    "Redis memory read failed; using in-memory store for user %s: %s",
                    user_id,
                    exc.__class__.__name__,
                )

        return list(self._store.get(user_id, []))

    async def _save_user_memories(self, user_id: str, memories: list[MemoryResponse]) -> None:
        redis_client = await self._get_redis_client()
        if redis_client:
            try:
                payload = json.dumps([memory.model_dump(mode="json") for memory in memories])
                await redis_client.set(self._key(user_id), payload)
                return
            except Exception as exc:
                logger.warning(
                    "Redis memory write failed; using in-memory store for user %s: %s",
                    user_id,
                    exc.__class__.__name__,
                )

        self._store[user_id] = list(memories)

    async def _get_redis_client(self) -> object | None:
        client = self.redis_provider.client if self.redis_provider else None
        if not client:
            return None

        try:
            await client.ping()
        except Exception as exc:
            logger.warning("Redis unavailable for memory provider; using in-memory store: %s", exc.__class__.__name__)
            return None

        return client

    def _key(self, user_id: str) -> str:
        if not user_id:
            raise AppError(message="User id is required", error="memory_user_id_required", status_code=400)

        return f"memoryos:memories:{user_id}"
