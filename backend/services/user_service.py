from datetime import datetime
from typing import Any

from providers.supabase_provider import SupabaseProvider
from schemas.user import UserProfile, UserStats
from utils.exceptions import AppError


class UserService:
    def __init__(self, supabase_provider: SupabaseProvider) -> None:
        self.supabase_provider = supabase_provider

    async def get_current_user(self, user_id: str) -> UserProfile:
        profile = await self.supabase_provider.select_one("profiles", {"id": user_id})
        if not profile:
            raise AppError(message="User profile not found", error="user_not_found", status_code=404)

        return self._to_user_profile(profile)

    async def update_profile(self, user_id: str, data: dict[str, Any]) -> UserProfile:
        update_data = {key: value for key, value in data.items() if value is not None}
        if not update_data:
            return await self.get_current_user(user_id)

        profile = await self.supabase_provider.update_one("profiles", {"id": user_id}, update_data)
        if not profile:
            raise AppError(message="User profile not found", error="user_not_found", status_code=404)

        return self._to_user_profile(profile)

    async def get_user_stats(self, user_id: str) -> UserStats:
        return UserStats(
            memory_count=await self.supabase_provider.count("memories", {"user_id": user_id}),
            document_count=await self.supabase_provider.count("documents", {"user_id": user_id}),
            integration_count=await self.supabase_provider.count("integrations", {"user_id": user_id}),
            chat_count=await self.supabase_provider.count("chats", {"user_id": user_id}),
        )

    def _to_user_profile(self, data: dict[str, Any]) -> UserProfile:
        return UserProfile(
            id=str(data.get("id")),
            email=data.get("email"),
            display_name=data.get("display_name") or data.get("name") or data.get("full_name"),
            avatar=data.get("avatar") or data.get("avatar_url"),
            created_at=self._parse_datetime(data.get("created_at")),
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
