from fastapi import APIRouter, Depends

from api.dependencies.auth import current_user
from config.dependencies import get_workspace_service
from schemas.workspace import WorkspaceMembersResponse, WorkspaceResponse, WorkspaceSummaryResponse
from services.workspace_service import WorkspaceService

router = APIRouter(prefix="/workspace", tags=["workspace"])


@router.get("", response_model=WorkspaceResponse)
async def read_workspace(
    user: current_user,
    workspace_service: WorkspaceService = Depends(get_workspace_service),
) -> WorkspaceResponse:
    workspace = await workspace_service.get_workspace(user.id)
    return WorkspaceResponse(data=workspace)


@router.get("/members", response_model=WorkspaceMembersResponse)
async def read_workspace_members(
    user: current_user,
    workspace_service: WorkspaceService = Depends(get_workspace_service),
) -> WorkspaceMembersResponse:
    workspace_id = await workspace_service.get_workspace_id_for_user(user.id)
    members = await workspace_service.get_workspace_members(workspace_id)
    return WorkspaceMembersResponse(data=members)


@router.get("/summary", response_model=WorkspaceSummaryResponse)
async def read_workspace_summary(
    user: current_user,
    workspace_service: WorkspaceService = Depends(get_workspace_service),
) -> WorkspaceSummaryResponse:
    workspace_id = await workspace_service.get_workspace_id_for_user(user.id)
    summary = await workspace_service.get_workspace_summary(workspace_id)
    return WorkspaceSummaryResponse(data=summary)
