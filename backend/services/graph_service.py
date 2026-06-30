import json
from time import perf_counter
from typing import TYPE_CHECKING

from providers.graph_provider import GraphProvider
from schemas.graph import Edge, Graph, GraphExpandResponse, GraphNodeResponse, GraphStatistics, Node
from utils.exceptions import AppError
from utils.logging import get_logger

if TYPE_CHECKING:
    from providers.redis_provider import RedisProvider

logger = get_logger(__name__)


class GraphService:
    def __init__(self, graph_provider: GraphProvider, redis_provider: "RedisProvider | None" = None) -> None:
        self.graph_provider = graph_provider
        self.redis_provider = redis_provider
        self.cache_ttl_seconds = 60

    async def get_graph(self, user_id: str) -> Graph:
        started = perf_counter()
        graph = await self._get_cached_graph(user_id)
        if graph is None:
            graph = await self.graph_provider.build_graph(user_id)
            await self._cache_graph(user_id, graph)

        elapsed_ms = (perf_counter() - started) * 1000
        logger.info(
            "knowledge_graph user_id=%s node_count=%s edge_count=%s execution_time_ms=%.2f",
            user_id,
            graph.statistics.node_count,
            graph.statistics.edge_count,
            elapsed_ms,
        )
        return graph

    async def get_node(self, user_id: str, node_id: str) -> GraphNodeResponse:
        graph = await self.get_graph(user_id)
        node = self._find_node(graph, node_id)
        connected_edges = self._connected_edges(graph, node_id)
        related = self._related_nodes_from_edges(graph, connected_edges, node_id)
        return GraphNodeResponse(node=node, edges=connected_edges, related_nodes=related)

    async def search_nodes(self, user_id: str, query: str) -> list[Node]:
        if not query:
            raise AppError(message="Search query is required", error="graph_query_required", status_code=400)

        graph = await self.get_graph(user_id)
        normalized_query = query.casefold()
        return [
            node
            for node in graph.nodes
            if normalized_query in node.label.casefold()
            or normalized_query in (node.description or "").casefold()
            or any(normalized_query in str(value).casefold() for value in node.metadata.values())
        ]

    async def related_nodes(self, user_id: str, node_id: str) -> list[Node]:
        graph = await self.get_graph(user_id)
        self._find_node(graph, node_id)
        return self._related_nodes_from_edges(graph, self._connected_edges(graph, node_id), node_id)

    async def expand_node(self, user_id: str, node_id: str) -> GraphExpandResponse:
        graph = await self.get_graph(user_id)
        node = self._find_node(graph, node_id)
        connected_edges = self._connected_edges(graph, node_id)
        return GraphExpandResponse(
            nodes=[node, *self._related_nodes_from_edges(graph, connected_edges, node_id)],
            edges=connected_edges,
        )

    async def graph_statistics(self, user_id: str) -> GraphStatistics:
        graph = await self.get_graph(user_id)
        return graph.statistics

    def _find_node(self, graph: Graph, node_id: str) -> Node:
        for node in graph.nodes:
            if node.id == node_id:
                return node
        raise AppError(message="Graph node not found", error="graph_node_not_found", status_code=404)

    def _connected_edges(self, graph: Graph, node_id: str) -> list[Edge]:
        return [edge for edge in graph.edges if edge.source == node_id or edge.target == node_id]

    def _related_nodes_from_edges(self, graph: Graph, edges: list[Edge], node_id: str) -> list[Node]:
        related_ids = {edge.target if edge.source == node_id else edge.source for edge in edges}
        return [node for node in graph.nodes if node.id in related_ids]

    async def _get_cached_graph(self, user_id: str) -> Graph | None:
        redis_client = await self._get_redis_client()
        if not redis_client:
            return None

        try:
            payload = await redis_client.get(self._cache_key(user_id))
            return Graph.model_validate_json(payload) if payload else None
        except Exception as exc:
            logger.warning("Redis graph cache read failed for user %s: %s", user_id, exc.__class__.__name__)
            return None

    async def _cache_graph(self, user_id: str, graph: Graph) -> None:
        redis_client = await self._get_redis_client()
        if not redis_client:
            return

        try:
            await redis_client.setex(
                self._cache_key(user_id),
                self.cache_ttl_seconds,
                json.dumps(graph.model_dump(mode="json")),
            )
        except Exception as exc:
            logger.warning("Redis graph cache write failed for user %s: %s", user_id, exc.__class__.__name__)

    async def _get_redis_client(self) -> object | None:
        client = self.redis_provider.client if self.redis_provider else None
        if not client:
            return None

        try:
            await client.ping()
        except Exception as exc:
            logger.warning("Redis unavailable for graph cache: %s", exc.__class__.__name__)
            return None

        return client

    def _cache_key(self, user_id: str) -> str:
        return f"memoryos:graph:{user_id}"
