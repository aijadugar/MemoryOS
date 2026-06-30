from services.document_service import DocumentService


async def process_document_upload(
    document_service: DocumentService,
    user_id: str,
    document_id: str,
    content: bytes,
) -> None:
    await document_service.process_document(user_id=user_id, document_id=document_id, content=content)
