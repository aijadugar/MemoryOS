from datetime import datetime

from pydantic import BaseModel, Field, field_validator


MAX_CHAT_MESSAGE_LENGTH = 8000


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=MAX_CHAT_MESSAGE_LENGTH)
    conversation_id: str | None = Field(default=None, max_length=128)

    @field_validator("message")
    @classmethod
    def message_must_not_be_blank(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Message cannot be empty")
        return cleaned


class ChatUsage(BaseModel):
    prompt_tokens: int | None = None
    completion_tokens: int | None = None


class ChatResponse(BaseModel):
    success: bool = True
    conversation_id: str
    message: str
    sources: list[str] = Field(default_factory=list)
    timestamp: datetime
    usage: ChatUsage = Field(default_factory=ChatUsage)


class ChatHistoryMessage(BaseModel):
    id: str
    conversation_id: str
    role: str
    message: str
    timestamp: datetime


class ChatHistoryResponse(BaseModel):
    success: bool = True
    messages: list[ChatHistoryMessage]


class ChatHistoryDeleteResponse(BaseModel):
    success: bool = True
    deleted: int


class ChatTitleRequest(BaseModel):
    message: str = Field(min_length=1, max_length=MAX_CHAT_MESSAGE_LENGTH)

    @field_validator("message")
    @classmethod
    def message_must_not_be_blank(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Message cannot be empty")
        return cleaned


class ChatTitleResponse(BaseModel):
    success: bool = True
    title: str
