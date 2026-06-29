from fastapi import APIRouter

from api.dependencies.auth import current_user
from schemas.auth import CurrentUserResponse, SessionResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me", response_model=CurrentUserResponse)
async def read_current_user(user: current_user) -> CurrentUserResponse:
    return CurrentUserResponse.model_validate(user)


@router.get("/session", response_model=SessionResponse)
async def read_session(user: current_user) -> SessionResponse:
    return SessionResponse(authenticated=True, user=user)
