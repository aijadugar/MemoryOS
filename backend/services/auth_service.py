from datetime import datetime
from typing import Any

from fastapi import HTTPException, status
from starlette.concurrency import run_in_threadpool

from providers.supabase_provider import SupabaseProvider
from schemas.auth import AuthenticatedUser


class AuthService:
    def __init__(self, supabase_provider: SupabaseProvider) -> None:
        self.supabase_provider = supabase_provider

    async def verify_access_token(self, token: str) -> Any:
        if not self.supabase_provider.client:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"message": "Authentication provider is not configured", "error": "auth_provider_unavailable"},
            )

        try:
            response = await run_in_threadpool(self.supabase_provider.client.auth.get_user, token)
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"message": "Invalid token", "error": "invalid_token"},
            ) from exc

        user = getattr(response, "user", None)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"message": "Invalid token", "error": "invalid_token"},
            )

        return user

    async def get_current_user(self, token: str) -> AuthenticatedUser:
        user = await self.verify_access_token(token)
        return self._to_authenticated_user(user)

    async def get_user_profile(self, user_id: str) -> AuthenticatedUser | None:
        return None

    def _to_authenticated_user(self, user: Any) -> AuthenticatedUser:
        metadata = getattr(user, "user_metadata", None) or {}
        identities = getattr(user, "identities", None) or []
        identity_data = self._first_identity_data(identities)

        return AuthenticatedUser(
            id=str(getattr(user, "id")),
            email=getattr(user, "email", None),
            name=metadata.get("name") or metadata.get("full_name") or identity_data.get("name") or identity_data.get("full_name"),
            avatar_url=metadata.get("avatar_url") or metadata.get("picture") or identity_data.get("avatar_url") or identity_data.get("picture"),
            created_at=self._parse_datetime(getattr(user, "created_at", None)),
        )

    def _first_identity_data(self, identities: list[Any]) -> dict[str, Any]:
        if not identities:
            return {}

        first_identity = identities[0]
        return getattr(first_identity, "identity_data", None) or {}

    def _parse_datetime(self, value: Any) -> datetime | None:
        if value is None or isinstance(value, datetime):
            return value

        if isinstance(value, str):
            normalized = value.replace("Z", "+00:00")
            try:
                return datetime.fromisoformat(normalized)
            except ValueError:
                return None

        return None
