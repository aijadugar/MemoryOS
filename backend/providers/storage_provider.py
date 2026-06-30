from starlette.concurrency import run_in_threadpool

from config.settings import Settings
from providers.supabase_provider import SupabaseProvider
from utils.exceptions import AppError


class StorageProvider:
    def __init__(self, settings: Settings, supabase_provider: SupabaseProvider) -> None:
        self.settings = settings
        self.supabase_provider = supabase_provider
        self.bucket = settings.supabase_documents_bucket

    async def upload(self, path: str, content: bytes, content_type: str | None = None) -> str:
        return await self.upload_to_bucket(self.bucket, path, content, content_type)

    async def upload_to_bucket(
        self,
        bucket: str,
        path: str,
        content: bytes,
        content_type: str | None = None,
    ) -> str:
        def query() -> str:
            client = self.supabase_provider._require_client()
            options = {"content-type": content_type or "application/octet-stream", "upsert": "false"}
            client.storage.from_(bucket).upload(path, content, options)
            return client.storage.from_(bucket).get_public_url(path)

        try:
            return await run_in_threadpool(query)
        except Exception as exc:
            raise AppError(
                message="Failed to store uploaded file",
                error="storage_upload_failed",
                status_code=502,
            ) from exc

    async def create_signed_url(self, bucket: str, path: str, expires_in: int) -> str:
        def query() -> str:
            response = self.supabase_provider._require_client().storage.from_(bucket).create_signed_url(path, expires_in)
            if isinstance(response, dict):
                return str(response.get("signedURL") or response.get("signed_url") or response.get("data", {}).get("signedUrl"))
            signed_url = getattr(response, "signed_url", None) or getattr(response, "signedURL", None)
            return str(signed_url or response)

        try:
            signed_url = await run_in_threadpool(query)
        except Exception as exc:
            raise AppError(
                message="Failed to create audio URL",
                error="storage_signed_url_failed",
                status_code=502,
            ) from exc

        if not signed_url or signed_url == "None":
            raise AppError(message="Failed to create audio URL", error="storage_signed_url_failed", status_code=502)
        return signed_url

    async def delete(self, path: str) -> None:
        def query() -> None:
            self.supabase_provider._require_client().storage.from_(self.bucket).remove([path])

        try:
            await run_in_threadpool(query)
        except Exception as exc:
            raise AppError(
                message="Failed to delete stored file",
                error="document_storage_delete_failed",
                status_code=502,
            ) from exc
