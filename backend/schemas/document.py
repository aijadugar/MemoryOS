from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict


class DocumentStatus(StrEnum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"


class Document(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    filename: str
    file_type: str
    file_size: int
    created_at: datetime | None = None
    uploaded_by: str
    summary: str | None = None
    keywords: list[str] = []
    language: str | None = None
    reading_time: int | None = None
    status: DocumentStatus
    storage_url: str
    suggested_title: str | None = None
    progress: int = 0
    metadata: dict[str, object] = {}


class DocumentSummary(BaseModel):
    id: str
    summary: str | None = None
    status: DocumentStatus


class DocumentKeywords(BaseModel):
    id: str
    keywords: list[str] = []
    status: DocumentStatus


class DocumentStatistics(BaseModel):
    total_documents: int
    total_size: int
    supported_formats: list[str]
    recent_uploads: list[Document]


class DocumentResponse(BaseModel):
    success: bool = True
    data: Document


class DocumentsResponse(BaseModel):
    success: bool = True
    data: list[Document]


class DocumentSummaryResponse(BaseModel):
    success: bool = True
    data: DocumentSummary


class DocumentKeywordsResponse(BaseModel):
    success: bool = True
    data: DocumentKeywords


class DocumentStatisticsResponse(BaseModel):
    success: bool = True
    data: DocumentStatistics


class DeleteDocumentResponse(BaseModel):
    success: bool = True
    message: str = "Document deleted"
