from fastapi import APIRouter

from api.routes.auth import router as auth_router
from api.routes.chat import router as chat_router
from api.routes.dashboard import router as dashboard_router
from api.routes.documents import router as documents_router
from api.routes.graph import router as graph_router
from api.routes.integrations import router as integrations_router
from api.routes.timeline import router as timeline_router
from api.routes.users import router as users_router
from api.routes.v1 import router as v1_router
from api.routes.voice import router as voice_router
from api.routes.workspace import router as workspace_router

api_router = APIRouter()
api_router.include_router(v1_router)
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(workspace_router)
api_router.include_router(chat_router)
api_router.include_router(dashboard_router)
api_router.include_router(documents_router)
api_router.include_router(timeline_router)
api_router.include_router(graph_router)
api_router.include_router(integrations_router)
api_router.include_router(voice_router)
