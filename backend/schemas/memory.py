from datetime import datetime

from pydantic import BaseModel, Field


class MemoryCreate(BaseModel):
    user_id: str = Field(min_length=1)
    content: str = Field(min_length=1)
    metadata: dict[str, object] = Field(default_factory=dict)


class MemoryResponse(BaseModel):
    id: str
    user_id: str
    content: str
    created_at: datetime
    metadata: dict[str, object] = Field(default_factory=dict)


class MemorySearchRequest(BaseModel):
    user_id: str = Field(min_length=1)
    query: str = Field(min_length=1)


class MemorySearchResponse(BaseModel):
    memories: list[MemoryResponse]


class MemoryListResponse(BaseModel):
    memories: list[MemoryResponse]


class MemoryDeleteResponse(BaseModel):
    id: str
    deleted: bool
