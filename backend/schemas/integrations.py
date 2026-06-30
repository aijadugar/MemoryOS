from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


IntegrationStatus = Literal["available", "connected", "expired", "error", "syncing"]


class NormalizedIntegrationItem(BaseModel):
    id: str
    source: str
    title: str
    content: str | None = None
    url: str | None = None
    author: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class Integration(BaseModel):
    id: str
    name: str
    slug: str
    description: str
    icon: str
    status: IntegrationStatus = "available"
    connected: bool = False
    last_sync: datetime | None = None
    available_actions: list[str] = Field(default_factory=list)


class IntegrationConnectionResponse(BaseModel):
    integration: Integration
    redirect_url: str | None = None
    connection_id: str | None = None
    status: str


class IntegrationSyncResponse(BaseModel):
    integration: Integration
    items: list[NormalizedIntegrationItem] = Field(default_factory=list)
    synced_at: datetime
    count: int


class IntegrationSyncAllResponse(BaseModel):
    synced_at: datetime
    results: list[IntegrationSyncResponse] = Field(default_factory=list)


class IntegrationStatusSummary(BaseModel):
    connected: int
    available: int
    last_sync: datetime | None = None
    healthy: bool


class IntegrationListResponse(BaseModel):
    data: list[Integration]


class IntegrationResponse(BaseModel):
    data: Integration


class IntegrationActionsResponse(BaseModel):
    data: list[str]
