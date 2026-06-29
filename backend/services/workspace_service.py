from datetime import datetime
from typing import Any

from providers.supabase_provider import SupabaseProvider
from schemas.workspace import Workspace, WorkspaceMember, WorkspaceOwner, WorkspaceSummary
from utils.exceptions import AppError


class WorkspaceService:
    def __init__(self, supabase_provider: SupabaseProvider) -> None:
        self.supabase_provider = supabase_provider

    async def get_workspace(self, user_id: str) -> Workspace:
        workspace = await self._get_user_workspace_record(user_id)
        workspace_id = str(workspace.get("id"))
        owner_id = str(workspace.get("owner_id") or user_id)
        owner = await self.supabase_provider.select_one("profiles", {"id": owner_id}) or {"id": owner_id}

        return Workspace(
            id=workspace_id,
            name=workspace.get("name"),
            owner=self._to_owner(owner),
            members_count=await self.supabase_provider.count("workspace_members", {"workspace_id": workspace_id}),
            created_at=self._parse_datetime(workspace.get("created_at")),
            current_plan=workspace.get("current_plan") or workspace.get("plan"),
            memory_count=await self.supabase_provider.count("memories", {"workspace_id": workspace_id}),
            integration_count=await self.supabase_provider.count("integrations", {"workspace_id": workspace_id}),
        )

    async def update_workspace(self, workspace_id: str) -> Workspace:
        workspace = await self.supabase_provider.select_one("workspaces", {"id": workspace_id})
        if not workspace:
            raise AppError(message="Workspace not found", error="workspace_not_found", status_code=404)

        owner_id = str(workspace.get("owner_id"))
        owner = await self.supabase_provider.select_one("profiles", {"id": owner_id}) or {"id": owner_id}
        return Workspace(
            id=str(workspace.get("id")),
            name=workspace.get("name"),
            owner=self._to_owner(owner),
            members_count=await self.supabase_provider.count("workspace_members", {"workspace_id": workspace_id}),
            created_at=self._parse_datetime(workspace.get("created_at")),
            current_plan=workspace.get("current_plan") or workspace.get("plan"),
            memory_count=await self.supabase_provider.count("memories", {"workspace_id": workspace_id}),
            integration_count=await self.supabase_provider.count("integrations", {"workspace_id": workspace_id}),
        )

    async def get_workspace_members(self, workspace_id: str) -> list[WorkspaceMember]:
        members = await self.supabase_provider.select_many("workspace_members", {"workspace_id": workspace_id})
        profiles = await self._profiles_by_member_ids(members)

        return [self._to_member(member, profiles.get(str(member.get("user_id")), {})) for member in members]

    async def get_workspace_summary(self, workspace_id: str) -> WorkspaceSummary:
        workspace = await self.supabase_provider.select_one("workspaces", {"id": workspace_id})
        if not workspace:
            raise AppError(message="Workspace not found", error="workspace_not_found", status_code=404)

        return WorkspaceSummary(
            workspace_name=workspace.get("name"),
            members=await self.supabase_provider.count("workspace_members", {"workspace_id": workspace_id}),
            total_memories=await self.supabase_provider.count("memories", {"workspace_id": workspace_id}),
            total_documents=await self.supabase_provider.count("documents", {"workspace_id": workspace_id}),
            total_integrations=await self.supabase_provider.count("integrations", {"workspace_id": workspace_id}),
            total_chats=await self.supabase_provider.count("chats", {"workspace_id": workspace_id}),
        )

    async def get_workspace_id_for_user(self, user_id: str) -> str:
        workspace = await self._get_user_workspace_record(user_id)
        return str(workspace.get("id"))

    async def _get_user_workspace_record(self, user_id: str) -> dict[str, Any]:
        owned_workspace = await self.supabase_provider.select_one("workspaces", {"owner_id": user_id})
        if owned_workspace:
            return owned_workspace

        membership = await self.supabase_provider.select_one("workspace_members", {"user_id": user_id})
        if not membership:
            raise AppError(message="Workspace not found", error="workspace_not_found", status_code=404)

        workspace_id = membership.get("workspace_id")
        workspace = await self.supabase_provider.select_one("workspaces", {"id": workspace_id})
        if not workspace:
            raise AppError(message="Workspace not found", error="workspace_not_found", status_code=404)

        return workspace

    async def _profiles_by_member_ids(self, members: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
        profiles: dict[str, dict[str, Any]] = {}
        for member in members:
            user_id = str(member.get("user_id"))
            profile = await self.supabase_provider.select_one("profiles", {"id": user_id})
            if profile:
                profiles[user_id] = profile
        return profiles

    def _to_owner(self, data: dict[str, Any]) -> WorkspaceOwner:
        return WorkspaceOwner(
            id=str(data.get("id")),
            email=data.get("email"),
            display_name=data.get("display_name") or data.get("name") or data.get("full_name"),
            avatar=data.get("avatar") or data.get("avatar_url"),
        )

    def _to_member(self, member: dict[str, Any], profile: dict[str, Any]) -> WorkspaceMember:
        return WorkspaceMember(
            id=str(member.get("id")),
            user_id=str(member.get("user_id")),
            email=profile.get("email"),
            display_name=profile.get("display_name") or profile.get("name") or profile.get("full_name"),
            avatar=profile.get("avatar") or profile.get("avatar_url"),
            role=member.get("role"),
            joined_at=self._parse_datetime(member.get("created_at") or member.get("joined_at")),
        )

    def _parse_datetime(self, value: Any) -> datetime | None:
        if value is None or isinstance(value, datetime):
            return value
        if isinstance(value, str):
            try:
                return datetime.fromisoformat(value.replace("Z", "+00:00"))
            except ValueError:
                return None
        return None
