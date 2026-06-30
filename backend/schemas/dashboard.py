from datetime import datetime

from pydantic import BaseModel, Field, RootModel

from schemas.memory import MemoryResponse


class DashboardSummary(BaseModel):
    workspace_name: str | None = None
    user_name: str | None = None
    welcome_message: str
    memory_count: int = 0
    conversation_count: int = 0
    integration_count: int = 0
    last_activity: datetime | None = None
    health_score: int = Field(ge=0, le=100)


class DashboardActivityItem(BaseModel):
    type: str
    title: str
    timestamp: datetime


class DashboardStats(BaseModel):
    documents: int = 0
    memories: int = 0
    conversations: int = 0
    integrations: int = 0
    graph_nodes: int = 0


class DashboardSuggestions(RootModel[list[str]]):
    root: list[str] = Field(default_factory=list)


class DashboardRecentConversation(BaseModel):
    id: str
    title: str
    timestamp: datetime


class DashboardRecentFiles(BaseModel):
    files: list[str] = Field(default_factory=list)


class DashboardRecent(BaseModel):
    memories: list[MemoryResponse] = Field(default_factory=list)
    conversations: list[DashboardRecentConversation] = Field(default_factory=list)
    uploaded_files: list[str] = Field(default_factory=list)
