import re
from abc import ABC, abstractmethod
from collections import Counter, defaultdict
from datetime import datetime
from typing import Any, TYPE_CHECKING

from schemas.graph import Edge, Graph, GraphNodeType, GraphPosition, GraphStatistics, Node
from schemas.memory import MemoryResponse
from utils.exceptions import AppError
from utils.logging import get_logger

if TYPE_CHECKING:
    from providers.supabase_provider import SupabaseProvider
    from services.memory_service import MemoryService
    from services.user_service import UserService
    from services.workspace_service import WorkspaceService

logger = get_logger(__name__)

STOP_WORDS = {
    "about",
    "after",
    "again",
    "also",
    "because",
    "before",
    "between",
    "could",
    "from",
    "have",
    "into",
    "just",
    "like",
    "more",
    "need",
    "should",
    "that",
    "their",
    "there",
    "these",
    "this",
    "through",
    "with",
    "would",
    "your",
}


class GraphProvider(ABC):
    @abstractmethod
    async def build_graph(self, user_id: str) -> Graph:
        pass


class MockGraphProvider(GraphProvider):
    def __init__(
        self,
        memory_service: "MemoryService",
        workspace_service: "WorkspaceService",
        user_service: "UserService",
        supabase_provider: "SupabaseProvider",
    ) -> None:
        self.memory_service = memory_service
        self.workspace_service = workspace_service
        self.user_service = user_service
        self.supabase_provider = supabase_provider

    async def build_graph(self, user_id: str) -> Graph:
        if not user_id:
            raise AppError(message="User id is required", error="graph_user_id_required", status_code=400)

        nodes: dict[str, Node] = {}
        edges: dict[str, Edge] = {}

        user = await self.user_service.get_current_user(user_id)
        user_node_id = self._node_id(GraphNodeType.USER, user.id)
        self._add_node(
            nodes,
            Node(
                id=user_node_id,
                label=user.display_name or user.email or "User",
                type=GraphNodeType.USER,
                description=user.email,
                metadata={"user_id": user.id, "avatar": user.avatar},
                created_at=user.created_at,
            ),
        )

        workspace = await self.workspace_service.get_workspace(user_id)
        workspace_node_id = self._node_id(GraphNodeType.WORKSPACE, workspace.id)
        self._add_node(
            nodes,
            Node(
                id=workspace_node_id,
                label=workspace.name or "Workspace",
                type=GraphNodeType.WORKSPACE,
                description=workspace.current_plan,
                metadata={
                    "workspace_id": workspace.id,
                    "members_count": workspace.members_count,
                    "memory_count": workspace.memory_count,
                    "integration_count": workspace.integration_count,
                },
                created_at=workspace.created_at,
            ),
        )
        self._add_edge(edges, user_node_id, workspace_node_id, "owns")

        memories = (await self.memory_service.list_memories(user_id)).memories
        conversation_memory_ids: dict[str, list[str]] = defaultdict(list)
        keyword_memory_ids: dict[str, list[str]] = defaultdict(list)

        for index, memory in enumerate(memories):
            memory_node_id = self._node_id(GraphNodeType.MEMORY, memory.id)
            self._add_node(
                nodes,
                Node(
                    id=memory_node_id,
                    label=self._title(memory.content),
                    type=GraphNodeType.MEMORY,
                    description=memory.content,
                    metadata=memory.metadata | {"memory_id": memory.id},
                    created_at=memory.created_at,
                ),
            )
            self._add_edge(edges, workspace_node_id, memory_node_id, "contains")
            self._add_edge(edges, user_node_id, memory_node_id, "created")

            conversation_id = self._conversation_id(memory, index)
            conversation_memory_ids[conversation_id].append(memory_node_id)
            conversation_node_id = self._node_id(GraphNodeType.CONVERSATION, conversation_id)
            self._add_node(
                nodes,
                Node(
                    id=conversation_node_id,
                    label=str(memory.metadata.get("conversation_title") or f"Conversation {len(conversation_memory_ids)}"),
                    type=GraphNodeType.CONVERSATION,
                    description="Chat conversation inferred from memory history",
                    metadata={"conversation_id": conversation_id},
                    created_at=memory.created_at,
                ),
            )
            self._add_edge(edges, workspace_node_id, conversation_node_id, "has conversation")
            self._add_edge(edges, conversation_node_id, memory_node_id, "produced")

            for keyword in self._extract_keywords(memory.content):
                keyword_node_id = self._node_id(GraphNodeType.KEYWORD, keyword)
                keyword_memory_ids[keyword_node_id].append(memory_node_id)
                self._add_node(
                    nodes,
                    Node(
                        id=keyword_node_id,
                        label=keyword,
                        type=GraphNodeType.KEYWORD,
                        description=f"Keyword mentioned in {len(keyword_memory_ids[keyword_node_id])} memories",
                        metadata={"keyword": keyword},
                    ),
                )
                self._add_edge(edges, memory_node_id, keyword_node_id, "mentions", weight=0.7)

        for topic, count in self._topic_counts(memories).items():
            topic_node_id = self._node_id(GraphNodeType.TOPIC, topic)
            self._add_node(
                nodes,
                Node(
                    id=topic_node_id,
                    label=topic.title(),
                    type=GraphNodeType.TOPIC,
                    description=f"Topic inferred from {count} memory entries",
                    metadata={"topic": topic, "occurrences": count},
                ),
            )
            self._add_edge(edges, workspace_node_id, topic_node_id, "has topic", weight=float(count))
            for memory in memories:
                if topic in memory.content.casefold():
                    self._add_edge(edges, self._node_id(GraphNodeType.MEMORY, memory.id), topic_node_id, "relates to")

        for document in await self._list_documents(user_id, workspace.id):
            document_id = str(document.get("id"))
            document_node_id = self._node_id(GraphNodeType.DOCUMENT, document_id)
            title = str(document.get("title") or document.get("name") or document.get("filename") or "Document")
            self._add_node(
                nodes,
                Node(
                    id=document_node_id,
                    label=title,
                    type=GraphNodeType.DOCUMENT,
                    description=str(document.get("description") or document.get("summary") or ""),
                    metadata={"document_id": document_id, "source": document.get("source")},
                    created_at=self._parse_datetime(document.get("created_at")),
                    updated_at=self._parse_datetime(document.get("updated_at")),
                ),
            )
            self._add_edge(edges, workspace_node_id, document_node_id, "contains")

        positioned_nodes = self._position_nodes(list(nodes.values()))
        graph_edges = list(edges.values())
        return Graph(
            nodes=positioned_nodes,
            edges=graph_edges,
            statistics=self._statistics(positioned_nodes, graph_edges),
        )

    async def _list_documents(self, user_id: str, workspace_id: str) -> list[dict[str, Any]]:
        try:
            documents = await self.supabase_provider.select_many("documents", {"workspace_id": workspace_id})
            if documents:
                return documents
            return await self.supabase_provider.select_many("documents", {"user_id": user_id})
        except AppError as exc:
            logger.info("Graph document source unavailable for user %s: %s", user_id, exc.error)
            return []

    def _add_node(self, nodes: dict[str, Node], node: Node) -> None:
        if node.id not in nodes:
            nodes[node.id] = node

    def _add_edge(
        self,
        edges: dict[str, Edge],
        source: str,
        target: str,
        relationship: str,
        weight: float = 1,
    ) -> None:
        if source == target:
            return
        edge_id = f"{source}--{relationship}--{target}"
        edges.setdefault(edge_id, Edge(id=edge_id, source=source, target=target, relationship=relationship, weight=weight))

    def _conversation_id(self, memory: MemoryResponse, index: int) -> str:
        for key in ("conversation_id", "chat_id", "session_id"):
            value = memory.metadata.get(key)
            if value:
                return str(value)
        return f"memory-{memory.created_at.date().isoformat() if memory.created_at else index}"

    def _extract_keywords(self, text: str, limit: int = 6) -> list[str]:
        words = re.findall(r"[A-Za-z][A-Za-z0-9_-]{2,}", text.casefold())
        counts = Counter(word for word in words if word not in STOP_WORDS)
        return [word for word, _ in counts.most_common(limit)]

    def _topic_counts(self, memories: list[MemoryResponse], limit: int = 8) -> dict[str, int]:
        counts: Counter[str] = Counter()
        for memory in memories:
            counts.update(self._extract_keywords(memory.content, limit=4))
        return dict(counts.most_common(limit))

    def _position_nodes(self, nodes: list[Node]) -> list[Node]:
        lanes = {
            GraphNodeType.USER: 0,
            GraphNodeType.WORKSPACE: 1,
            GraphNodeType.CONVERSATION: 2,
            GraphNodeType.MEMORY: 3,
            GraphNodeType.DOCUMENT: 3,
            GraphNodeType.TOPIC: 4,
            GraphNodeType.KEYWORD: 5,
        }
        lane_counts: dict[str, int] = defaultdict(int)
        for node in nodes:
            lane = lanes.get(node.type, 6)
            row = lane_counts[str(lane)]
            lane_counts[str(lane)] += 1
            node.position = GraphPosition(x=lane * 260, y=row * 120)
        return nodes

    def _statistics(self, nodes: list[Node], edges: list[Edge]) -> GraphStatistics:
        return GraphStatistics(
            node_count=len(nodes),
            edge_count=len(edges),
            memory_nodes=sum(1 for node in nodes if node.type == GraphNodeType.MEMORY),
            conversation_nodes=sum(1 for node in nodes if node.type == GraphNodeType.CONVERSATION),
            topic_nodes=sum(1 for node in nodes if node.type == GraphNodeType.TOPIC),
            workspace_nodes=sum(1 for node in nodes if node.type == GraphNodeType.WORKSPACE),
        )

    def _title(self, content: str) -> str:
        compact = " ".join(content.split())
        return compact[:57] + "..." if len(compact) > 60 else compact

    def _node_id(self, node_type: GraphNodeType, value: str) -> str:
        safe_value = re.sub(r"[^A-Za-z0-9_.:-]+", "-", value.strip().casefold()).strip("-")
        return f"{node_type.value.lower()}:{safe_value}"

    def _parse_datetime(self, value: Any) -> datetime | None:
        if value is None or isinstance(value, datetime):
            return value
        if isinstance(value, str):
            try:
                return datetime.fromisoformat(value.replace("Z", "+00:00"))
            except ValueError:
                return None
        return None

