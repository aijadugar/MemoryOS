from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class UserProfile(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str | None = None
    display_name: str | None = None
    avatar: str | None = None
    created_at: datetime | None = None


class UserProfileUpdate(BaseModel):
    display_name: str | None = Field(default=None, max_length=120)
    avatar: str | None = Field(default=None, max_length=2048)


class UserStats(BaseModel):
    memory_count: int = 0
    document_count: int = 0
    integration_count: int = 0
    chat_count: int = 0


class UserResponse(BaseModel):
    success: bool = True
    data: UserProfile
