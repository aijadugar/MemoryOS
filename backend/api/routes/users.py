from fastapi import APIRouter, Depends

from api.dependencies.auth import current_user
from config.dependencies import get_user_service
from schemas.user import UserProfileUpdate, UserResponse
from services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
async def read_user_me(
    user: current_user,
    user_service: UserService = Depends(get_user_service),
) -> UserResponse:
    profile = await user_service.get_current_user(user.id)
    return UserResponse(data=profile)


@router.patch("/me", response_model=UserResponse)
async def update_user_me(
    payload: UserProfileUpdate,
    user: current_user,
    user_service: UserService = Depends(get_user_service),
) -> UserResponse:
    profile = await user_service.update_profile(user.id, payload.model_dump(exclude_unset=True))
    return UserResponse(data=profile)
