from datetime import date, datetime, time
from time import perf_counter
from typing import Awaitable, Callable, TypeVar

from fastapi import APIRouter, Depends, Query

from api.dependencies.auth import current_user
from config.dependencies import get_timeline_service
from schemas.timeline import (
    TimelineEvent,
    TimelineGroupedResponse,
    TimelinePaginatedResponse,
    TimelineStats,
)
from services.timeline_service import TimelineService
from utils.logging import get_logger

router = APIRouter(prefix="/timeline", tags=["timeline"])
logger = get_logger(__name__)
T = TypeVar("T")


async def _with_logging(user_id: str, endpoint: str, callback: Callable[[], Awaitable[T]]) -> T:
    started = perf_counter()
    try:
        return await callback()
    finally:
        elapsed_ms = (perf_counter() - started) * 1000
        logger.info("timeline endpoint=%s user_id=%s execution_time_ms=%.2f", endpoint, user_id, elapsed_ms)


@router.get("", response_model=TimelinePaginatedResponse)
async def read_timeline(
    user: current_user,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    timeline_service: TimelineService = Depends(get_timeline_service),
) -> TimelinePaginatedResponse:
    return await _with_logging(user.id, "list", lambda: timeline_service.get_events_paginated(user.id, page, limit))


@router.get("/recent", response_model=list[TimelineEvent])
async def read_recent_timeline_events(
    user: current_user,
    timeline_service: TimelineService = Depends(get_timeline_service),
) -> list[TimelineEvent]:
    return await _with_logging(user.id, "recent", lambda: timeline_service.get_recent_events(user.id, limit=20))


@router.get("/search", response_model=list[TimelineEvent])
async def search_timeline_events(
    user: current_user,
    q: str = Query(min_length=1),
    timeline_service: TimelineService = Depends(get_timeline_service),
) -> list[TimelineEvent]:
    return await _with_logging(user.id, "search", lambda: timeline_service.search_events(user.id, q))


@router.get("/filter", response_model=list[TimelineEvent])
async def filter_timeline_events(
    user: current_user,
    type: str | None = Query(default=None),
    source: str | None = Query(default=None),
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    timeline_service: TimelineService = Depends(get_timeline_service),
) -> list[TimelineEvent]:
    return await _with_logging(
        user.id,
        "filter",
        lambda: timeline_service.filter_events(
            user_id=user.id,
            event_type=type,
            source=source,
            date_from=datetime.combine(date_from, time.min) if date_from else None,
            date_to=datetime.combine(date_to, time.max) if date_to else None,
        ),
    )


@router.get("/grouped", response_model=TimelineGroupedResponse, response_model_by_alias=True)
async def read_grouped_timeline_events(
    user: current_user,
    timeline_service: TimelineService = Depends(get_timeline_service),
) -> TimelineGroupedResponse:
    return await _with_logging(user.id, "grouped", lambda: timeline_service.group_events_by_date(user.id))


@router.get("/stats", response_model=TimelineStats)
async def read_timeline_stats(
    user: current_user,
    timeline_service: TimelineService = Depends(get_timeline_service),
) -> TimelineStats:
    return await _with_logging(user.id, "stats", lambda: timeline_service.get_stats(user.id))
