from time import perf_counter
from typing import Awaitable, Callable, TypeVar

from fastapi import APIRouter, Depends

from api.dependencies.auth import current_user
from config.dependencies import get_dashboard_service
from schemas.dashboard import (
    DashboardActivityItem,
    DashboardRecent,
    DashboardStats,
    DashboardSuggestions,
    DashboardSummary,
)
from services.dashboard_service import DashboardService
from utils.logging import get_logger

router = APIRouter(prefix="/dashboard", tags=["dashboard"])
logger = get_logger(__name__)
T = TypeVar("T")


async def _with_logging(user_id: str, endpoint: str, callback: Callable[[], Awaitable[T]]) -> T:
    started = perf_counter()
    try:
        return await callback()
    finally:
        elapsed_ms = (perf_counter() - started) * 1000
        logger.info("dashboard endpoint=%s user_id=%s execution_time_ms=%.2f", endpoint, user_id, elapsed_ms)


@router.get("/summary", response_model=DashboardSummary)
async def read_dashboard_summary(
    user: current_user,
    dashboard_service: DashboardService = Depends(get_dashboard_service),
) -> DashboardSummary:
    return await _with_logging(user.id, "summary", lambda: dashboard_service.get_summary(user.id))


@router.get("/activity", response_model=list[DashboardActivityItem])
async def read_dashboard_activity(
    user: current_user,
    dashboard_service: DashboardService = Depends(get_dashboard_service),
) -> list[DashboardActivityItem]:
    return await _with_logging(user.id, "activity", lambda: dashboard_service.get_activity(user.id))


@router.get("/stats", response_model=DashboardStats)
async def read_dashboard_stats(
    user: current_user,
    dashboard_service: DashboardService = Depends(get_dashboard_service),
) -> DashboardStats:
    return await _with_logging(user.id, "stats", lambda: dashboard_service.get_stats(user.id))


@router.get("/suggestions", response_model=DashboardSuggestions)
async def read_dashboard_suggestions(
    user: current_user,
    dashboard_service: DashboardService = Depends(get_dashboard_service),
) -> DashboardSuggestions:
    return await _with_logging(user.id, "suggestions", lambda: dashboard_service.get_suggestions(user.id))


@router.get("/recent", response_model=DashboardRecent)
async def read_dashboard_recent(
    user: current_user,
    dashboard_service: DashboardService = Depends(get_dashboard_service),
) -> DashboardRecent:
    return await _with_logging(user.id, "recent", lambda: dashboard_service.get_recent(user.id))
