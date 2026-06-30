from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, Field


class GraphNodeType(StrEnum):
    USER = "User"
    CONVERSATION = "Conversation"
    MEMORY = "Memory"
    DOCUMENT = "Document"
    WORKSPACE = "Workspace"
    TOPIC = "Topic"
    KEYWORD = "Keyword"


class GraphPosition(BaseModel):
    x: float = 0
    y: float = 0


class GraphNodeData(BaseModel):
    label: str
    type: str
    description: str | None = None
    metadata: dict[str, object] = Field(default_factory=dict)
    created_at: datetime | None = None
    updated_at: datetime | None = None


class Node(BaseModel):
    id: str
    label: str
    type: str
    description: str | None = None
    metadata: dict[str, object] = Field(default_factory=dict)
    created_at: datetime | None = None
    updated_at: datetime | None = None
    position: GraphPosition = Field(default_factory=GraphPosition)
    data: GraphNodeData | None = None

    def model_post_init(self, __context: object) -> None:
        if self.data is None:
            self.data = GraphNodeData(
                label=self.label,
                type=self.type,
                description=self.description,
                metadata=self.metadata,
                created_at=self.created_at,
                updated_at=self.updated_at,
            )


class Edge(BaseModel):
    id: str
    source: str
    target: str
    relationship: str
    weight: float = 1
    metadata: dict[str, object] = Field(default_factory=dict)
    label: str | None = None
    animated: bool = False

    def model_post_init(self, __context: object) -> None:
        if self.label is None:
            self.label = self.relationship


class GraphStatistics(BaseModel):
    node_count: int = 0
    edge_count: int = 0
    memory_nodes: int = 0
    conversation_nodes: int = 0
    topic_nodes: int = 0
    workspace_nodes: int = 0


class Graph(BaseModel):
    nodes: list[Node] = Field(default_factory=list)
    edges: list[Edge] = Field(default_factory=list)
    statistics: GraphStatistics = Field(default_factory=GraphStatistics)


class GraphNodeResponse(BaseModel):
    node: Node
    edges: list[Edge] = Field(default_factory=list)
    related_nodes: list[Node] = Field(default_factory=list)


class GraphExpandResponse(BaseModel):
    nodes: list[Node] = Field(default_factory=list)
    edges: list[Edge] = Field(default_factory=list)

