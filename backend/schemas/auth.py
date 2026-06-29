from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AuthenticatedUser(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str | None = None
    name: str | None = None
    avatar_url: str | None = None
    created_at: datetime | None = None


class CurrentUserResponse(AuthenticatedUser):
    pass


class SessionResponse(BaseModel):
    authenticated: bool
    user: AuthenticatedUser
