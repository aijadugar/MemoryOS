from fastapi import APIRouter

from api.routes.auth import router as auth_router
from api.routes.chat import router as chat_router
from api.routes.users import router as users_router
from api.routes.v1 import router as v1_router
from api.routes.workspace import router as workspace_router

api_router = APIRouter()
api_router.include_router(v1_router)
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(workspace_router)
api_router.include_router(chat_router)
