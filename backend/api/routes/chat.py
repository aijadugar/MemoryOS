from typing import Any

from fastapi import APIRouter, Depends

from api.dependencies.auth import current_user
from config.dependencies import get_chat_service
from schemas.chat import (
    ChatHistoryDeleteResponse,
    ChatHistoryResponse,
    ChatRequest,
    ChatResponse,
    ChatTitleRequest,
    ChatTitleResponse,
)

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def create_chat(
    request: ChatRequest,
    user: current_user,
    chat_service: Any = Depends(get_chat_service),
) -> ChatResponse:
    return await chat_service.create_chat(user_id=user.id, request=request)


@router.get("/history", response_model=ChatHistoryResponse)
async def read_chat_history(
    user: current_user,
    chat_service: Any = Depends(get_chat_service),
) -> ChatHistoryResponse:
    return await chat_service.history(user_id=user.id)


@router.delete("/history", response_model=ChatHistoryDeleteResponse)
async def clear_chat_history(
    user: current_user,
    chat_service: Any = Depends(get_chat_service),
) -> ChatHistoryDeleteResponse:
    return await chat_service.clear_history(user_id=user.id)


@router.post("/title", response_model=ChatTitleResponse)
async def generate_chat_title(
    request: ChatTitleRequest,
    user: current_user,
    chat_service: Any = Depends(get_chat_service),
) -> ChatTitleResponse:
    _ = user
    return await chat_service.generate_title(request=request)
