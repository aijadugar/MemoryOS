from providers.memory_provider import BaseMemoryProvider
from schemas.memory import (
    MemoryCreate,
    MemoryDeleteResponse,
    MemoryListResponse,
    MemoryResponse,
    MemorySearchRequest,
    MemorySearchResponse,
)
from utils.exceptions import AppError
from utils.logging import get_logger

logger = get_logger(__name__)


class MemoryService:
    def __init__(self, memory_provider: BaseMemoryProvider) -> None:
        self.memory_provider = memory_provider

    async def remember(
        self,
        user_id: str,
        content: str,
        metadata: dict[str, object] | None = None,
    ) -> MemoryResponse:
        request = MemoryCreate(user_id=user_id, content=content, metadata=metadata or {})
        logger.info("Remembering memory for user %s", user_id)
        return await self.memory_provider.remember(request)

    async def recall(self, user_id: str, query: str) -> MemorySearchResponse:
        request = MemorySearchRequest(user_id=user_id, query=query)
        memories = await self.memory_provider.recall(request.user_id, request.query)
        return MemorySearchResponse(memories=memories)

    async def improve(self, user_id: str) -> MemoryListResponse:
        if not user_id:
            raise AppError(message="User id is required", error="memory_user_id_required", status_code=400)

        memories = await self.memory_provider.improve(user_id)
        return MemoryListResponse(memories=memories)

    async def forget(self, user_id: str, memory_id: str) -> MemoryDeleteResponse:
        if not user_id:
            raise AppError(message="User id is required", error="memory_user_id_required", status_code=400)
        if not memory_id:
            raise AppError(message="Memory id is required", error="memory_id_required", status_code=400)

        deleted = await self.memory_provider.forget(user_id, memory_id)
        return MemoryDeleteResponse(id=memory_id, deleted=deleted)

    async def search(self, user_id: str, query: str) -> MemorySearchResponse:
        request = MemorySearchRequest(user_id=user_id, query=query)
        memories = await self.memory_provider.search(request.user_id, request.query)
        return MemorySearchResponse(memories=memories)

    async def list_memories(self, user_id: str) -> MemoryListResponse:
        if not user_id:
            raise AppError(message="User id is required", error="memory_user_id_required", status_code=400)

        memories = await self.memory_provider.list_memories(user_id)
        return MemoryListResponse(memories=memories)
