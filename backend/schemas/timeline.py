from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class TimelineEvent(BaseModel):
    id: str
    type: str
    title: str
    description: str
    timestamp: datetime
    icon: str
    source: str
    metadata: dict[str, Any] = Field(default_factory=dict)
    user_id: str


class TimelinePaginatedResponse(BaseModel):
    events: list[TimelineEvent] = Field(default_factory=list)
    page: int
    limit: int
    total: int
    has_next: bool


class TimelineGroupedResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    today: list[TimelineEvent] = Field(default_factory=list, alias="Today")
    yesterday: list[TimelineEvent] = Field(default_factory=list, alias="Yesterday")
    last_week: list[TimelineEvent] = Field(default_factory=list, alias="Last Week")
    older: list[TimelineEvent] = Field(default_factory=list, alias="Older")


class TimelineStats(BaseModel):
    today_events: int = 0
    week_events: int = 0
    month_events: int = 0
    most_common_source: str = "chat"
