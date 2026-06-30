from fastapi import APIRouter, Depends

from api.dependencies.auth import current_user
from config.dependencies import get_integration_service
from schemas.integrations import (
    IntegrationActionsResponse,
    IntegrationConnectionResponse,
    IntegrationListResponse,
    IntegrationResponse,
    IntegrationStatusSummary,
    IntegrationSyncAllResponse,
    IntegrationSyncResponse,
)
from services.integration_service import IntegrationService

router = APIRouter(prefix="/integrations", tags=["integrations"])


@router.get("", response_model=IntegrationListResponse)
async def list_integrations(
    user: current_user,
    integration_service: IntegrationService = Depends(get_integration_service),
) -> IntegrationListResponse:
    integrations = await integration_service.list_integrations(user.id)
    return IntegrationListResponse(data=integrations)


@router.get("/status", response_model=IntegrationStatusSummary)
async def read_integration_status(
    user: current_user,
    integration_service: IntegrationService = Depends(get_integration_service),
) -> IntegrationStatusSummary:
    return await integration_service.integration_status(user.id)


@router.post("/sync-all", response_model=IntegrationSyncAllResponse)
async def sync_all_integrations(
    user: current_user,
    integration_service: IntegrationService = Depends(get_integration_service),
) -> IntegrationSyncAllResponse:
    return await integration_service.sync_all(user.id)


@router.get("/{slug}", response_model=IntegrationResponse)
async def read_integration(
    slug: str,
    user: current_user,
    integration_service: IntegrationService = Depends(get_integration_service),
) -> IntegrationResponse:
    integration = await integration_service.get_integration(user.id, slug)
    return IntegrationResponse(data=integration)


@router.get("/{slug}/actions", response_model=IntegrationActionsResponse)
async def read_available_actions(
    slug: str,
    user: current_user,
    integration_service: IntegrationService = Depends(get_integration_service),
) -> IntegrationActionsResponse:
    actions = await integration_service.available_actions(user.id, slug)
    return IntegrationActionsResponse(data=actions)


@router.post("/{slug}/connect", response_model=IntegrationConnectionResponse)
async def connect_integration(
    slug: str,
    user: current_user,
    integration_service: IntegrationService = Depends(get_integration_service),
) -> IntegrationConnectionResponse:
    return await integration_service.connect(user.id, slug)


@router.post("/{slug}/disconnect", response_model=IntegrationResponse)
async def disconnect_integration(
    slug: str,
    user: current_user,
    integration_service: IntegrationService = Depends(get_integration_service),
) -> IntegrationResponse:
    integration = await integration_service.disconnect(user.id, slug)
    return IntegrationResponse(data=integration)


@router.post("/{slug}/sync", response_model=IntegrationSyncResponse)
async def sync_integration(
    slug: str,
    user: current_user,
    integration_service: IntegrationService = Depends(get_integration_service),
) -> IntegrationSyncResponse:
    return await integration_service.sync(user.id, slug)
