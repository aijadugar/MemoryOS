from fastapi import APIRouter, Depends, Query

from api.dependencies.auth import current_user
from config.dependencies import get_graph_service
from schemas.graph import Graph, GraphExpandResponse, GraphNodeResponse, GraphStatistics, Node
from services.graph_service import GraphService

router = APIRouter(prefix="/graph", tags=["graph"])


@router.get("", response_model=Graph)
async def read_graph(
    user: current_user,
    graph_service: GraphService = Depends(get_graph_service),
) -> Graph:
    return await graph_service.get_graph(user.id)


@router.get("/node/{node_id}", response_model=GraphNodeResponse)
async def read_graph_node(
    node_id: str,
    user: current_user,
    graph_service: GraphService = Depends(get_graph_service),
) -> GraphNodeResponse:
    return await graph_service.get_node(user.id, node_id)


@router.get("/search", response_model=list[Node])
async def search_graph_nodes(
    user: current_user,
    q: str = Query(min_length=1),
    graph_service: GraphService = Depends(get_graph_service),
) -> list[Node]:
    return await graph_service.search_nodes(user.id, q)


@router.get("/related/{node_id}", response_model=list[Node])
async def read_related_graph_nodes(
    node_id: str,
    user: current_user,
    graph_service: GraphService = Depends(get_graph_service),
) -> list[Node]:
    return await graph_service.related_nodes(user.id, node_id)


@router.get("/expand/{node_id}", response_model=GraphExpandResponse)
async def expand_graph_node(
    node_id: str,
    user: current_user,
    graph_service: GraphService = Depends(get_graph_service),
) -> GraphExpandResponse:
    return await graph_service.expand_node(user.id, node_id)


@router.get("/stats", response_model=GraphStatistics)
async def read_graph_statistics(
    user: current_user,
    graph_service: GraphService = Depends(get_graph_service),
) -> GraphStatistics:
    return await graph_service.graph_statistics(user.id)
