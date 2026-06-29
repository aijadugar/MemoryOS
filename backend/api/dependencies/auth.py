from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from config.dependencies import get_auth_service
from schemas.auth import AuthenticatedUser
from services.auth_service import AuthService

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> AuthenticatedUser:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"message": "Authorization bearer token is required", "error": "missing_bearer_token"},
        )

    return await auth_service.get_current_user(credentials.credentials)


current_user = Annotated[AuthenticatedUser, Depends(get_current_user)]
