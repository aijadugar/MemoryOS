from datetime import datetime

from pydantic import BaseModel, ConfigDict


class WorkspaceOwner(BaseModel):
    id: str
    email: str | None = None
    display_name: str | None = None
    avatar: str | None = None


class Workspace(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str | None = None
    owner: WorkspaceOwner
    members_count: int = 0
    created_at: datetime | None = None
    current_plan: str | None = None
    memory_count: int = 0
    integration_count: int = 0


class WorkspaceMember(BaseModel):
    id: str
    user_id: str
    email: str | None = None
    display_name: str | None = None
    avatar: str | None = None
    role: str | None = None
    joined_at: datetime | None = None


class WorkspaceSummary(BaseModel):
    workspace_name: str | None = None
    members: int = 0
    total_memories: int = 0
    total_documents: int = 0
    total_integrations: int = 0
    total_chats: int = 0


class WorkspaceResponse(BaseModel):
    success: bool = True
    data: Workspace


class WorkspaceMembersResponse(BaseModel):
    success: bool = True
    data: list[WorkspaceMember]


class WorkspaceSummaryResponse(BaseModel):
    success: bool = True
    data: WorkspaceSummary
