from datetime import UTC, datetime
from time import perf_counter
from typing import TYPE_CHECKING
from uuid import uuid4

from schemas.chat import (
    ChatHistoryDeleteResponse,
    ChatHistoryMessage,
    ChatHistoryResponse,
    ChatRequest,
    ChatResponse,
    ChatTitleRequest,
    ChatTitleResponse,
)
from schemas.llm import LLMMessage
from schemas.memory import MemoryResponse
from utils.exceptions import AppError
from utils.logging import get_logger

if TYPE_CHECKING:
    from services.llm_service import LLMService
    from services.memory_service import MemoryService

logger = get_logger(__name__)

SYSTEM_PROMPT = (
    "You are MemoryOS, an enterprise intelligence assistant. "
    "Answer professionally and use previous memory whenever available. "
    "Never invent information; say when information is unavailable or uncertain."
)

CHAT_MEMORY_TYPE = "chat_message"


class ChatService:
    def __init__(self, llm_service: "LLMService", memory_service: "MemoryService") -> None:
        self.llm_service = llm_service
        self.memory_service = memory_service

    async def create_chat(self, user_id: str, request: ChatRequest) -> ChatResponse:
        started_at = perf_counter()
        conversation_id = request.conversation_id or str(uuid4())
        memories = await self.memory_service.recall(user_id=user_id, query=request.message)
        all_memories = await self.memory_service.list_memories(user_id)
        conversation_memories = self._filter_chat_memories(all_memories.memories, conversation_id)
        messages = self._build_messages(memories.memories, conversation_memories, request.message)

        try:
            llm_response = await self.llm_service.chat(messages=messages, system_prompt=SYSTEM_PROMPT)
        except AppError as exc:
            raise AppError(message=exc.message, error=exc.error, status_code=502) from exc

        timestamp = datetime.now(UTC)
        await self._remember_message(user_id, conversation_id, "user", request.message, timestamp)
        await self._remember_message(user_id, conversation_id, "assistant", llm_response.content, timestamp)

        usage = {"prompt_tokens": None, "completion_tokens": None}
        logger.info(
            "Chat completed conversation_id=%s user_id=%s execution_time_ms=%.2f model=%s token_usage=%s",
            conversation_id,
            user_id,
            (perf_counter() - started_at) * 1000,
            llm_response.model,
            usage,
        )

        return ChatResponse(
            conversation_id=conversation_id,
            message=llm_response.content,
            sources=[],
            timestamp=timestamp,
            usage=usage,
        )

    async def history(self, user_id: str) -> ChatHistoryResponse:
        memories = await self.memory_service.list_memories(user_id)
        messages = [
            self._to_history_message(memory)
            for memory in memories.memories
            if memory.metadata.get("type") == CHAT_MEMORY_TYPE
        ]
        messages.sort(key=lambda message: message.timestamp)
        return ChatHistoryResponse(messages=messages)

    async def clear_history(self, user_id: str) -> ChatHistoryDeleteResponse:
        memories = await self.memory_service.list_memories(user_id)
        chat_memories = [memory for memory in memories.memories if memory.metadata.get("type") == CHAT_MEMORY_TYPE]
        deleted = 0
        for memory in chat_memories:
            response = await self.memory_service.forget(user_id, memory.id)
            if response.deleted:
                deleted += 1

        return ChatHistoryDeleteResponse(deleted=deleted)

    async def generate_title(self, request: ChatTitleRequest) -> ChatTitleResponse:
        try:
            response = await self.llm_service.generate_title(request.message)
        except AppError as exc:
            raise AppError(message=exc.message, error=exc.error, status_code=502) from exc

        return ChatTitleResponse(title=response.title)

    def _build_messages(
        self,
        recalled_memories: list[MemoryResponse],
        conversation_memories: list[MemoryResponse],
        current_message: str,
    ) -> list[LLMMessage]:
        messages: list[LLMMessage] = []
        memory_context = self._format_memory_context(recalled_memories)
        if memory_context:
            messages.append(LLMMessage(role="user", content=f"Relevant memory:\n{memory_context}"))

        for memory in sorted(conversation_memories, key=lambda item: item.created_at):
            role = str(memory.metadata.get("role", "user"))
            if role in {"user", "assistant"}:
                messages.append(LLMMessage(role=role, content=memory.content))

        messages.append(LLMMessage(role="user", content=current_message))
        return messages

    def _format_memory_context(self, memories: list[MemoryResponse]) -> str:
        return "\n".join(f"- {memory.content}" for memory in memories[:10])

    def _filter_chat_memories(self, memories: list[MemoryResponse], conversation_id: str) -> list[MemoryResponse]:
        return [
            memory
            for memory in memories
            if memory.metadata.get("type") == CHAT_MEMORY_TYPE
            and memory.metadata.get("conversation_id") == conversation_id
        ]

    async def _remember_message(
        self,
        user_id: str,
        conversation_id: str,
        role: str,
        content: str,
        timestamp: datetime,
    ) -> None:
        await self.memory_service.remember(
            user_id=user_id,
            content=content,
            metadata={
                "type": CHAT_MEMORY_TYPE,
                "conversation_id": conversation_id,
                "role": role,
                "timestamp": timestamp.isoformat(),
            },
        )

    def _to_history_message(self, memory: MemoryResponse) -> ChatHistoryMessage:
        return ChatHistoryMessage(
            id=memory.id,
            conversation_id=str(memory.metadata.get("conversation_id", "")),
            role=str(memory.metadata.get("role", "user")),
            message=memory.content,
            timestamp=memory.created_at,
        )
