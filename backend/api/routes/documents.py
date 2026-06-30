from fastapi import APIRouter, BackgroundTasks, Depends, File, UploadFile

from api.dependencies.auth import current_user
from config.dependencies import get_document_service
from schemas.document import (
    DeleteDocumentResponse,
    DocumentKeywords,
    DocumentKeywordsResponse,
    DocumentResponse,
    DocumentStatisticsResponse,
    DocumentSummary,
    DocumentSummaryResponse,
    DocumentsResponse,
)
from services.document_service import DocumentService
from workers.document_worker import process_document_upload

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    user: current_user,
    file: UploadFile = File(...),
    document_service: DocumentService = Depends(get_document_service),
) -> DocumentResponse:
    document = await document_service.upload_document(user.id, file)
    await file.seek(0)
    content = await file.read()
    background_tasks.add_task(process_document_upload, document_service, user.id, document.id, content)
    return DocumentResponse(data=document)


@router.get("", response_model=DocumentsResponse)
async def list_documents(
    user: current_user,
    document_service: DocumentService = Depends(get_document_service),
) -> DocumentsResponse:
    documents = await document_service.list_documents(user.id)
    return DocumentsResponse(data=documents)


@router.get("/stats", response_model=DocumentStatisticsResponse)
async def document_statistics(
    user: current_user,
    document_service: DocumentService = Depends(get_document_service),
) -> DocumentStatisticsResponse:
    stats = await document_service.document_statistics(user.id)
    return DocumentStatisticsResponse(data=stats)


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    user: current_user,
    document_service: DocumentService = Depends(get_document_service),
) -> DocumentResponse:
    document = await document_service.get_document(user.id, document_id)
    return DocumentResponse(data=document)


@router.delete("/{document_id}", response_model=DeleteDocumentResponse)
async def delete_document(
    document_id: str,
    user: current_user,
    document_service: DocumentService = Depends(get_document_service),
) -> DeleteDocumentResponse:
    await document_service.delete_document(user.id, document_id)
    return DeleteDocumentResponse()


@router.get("/{document_id}/summary", response_model=DocumentSummaryResponse)
async def get_document_summary(
    document_id: str,
    user: current_user,
    document_service: DocumentService = Depends(get_document_service),
) -> DocumentSummaryResponse:
    document = await document_service.get_document(user.id, document_id)
    return DocumentSummaryResponse(data=DocumentSummary(id=document.id, summary=document.summary, status=document.status))


@router.get("/{document_id}/keywords", response_model=DocumentKeywordsResponse)
async def get_document_keywords(
    document_id: str,
    user: current_user,
    document_service: DocumentService = Depends(get_document_service),
) -> DocumentKeywordsResponse:
    document = await document_service.get_document(user.id, document_id)
    return DocumentKeywordsResponse(data=DocumentKeywords(id=document.id, keywords=document.keywords, status=document.status))
