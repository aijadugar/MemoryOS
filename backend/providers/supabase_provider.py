from config.settings import Settings
from utils.exceptions import AppError


class SupabaseProvider:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.client = self._create_client()

    def _create_client(self) -> object | None:
        if not self.settings.supabase_url or not self.settings.supabase_key:
            return None

        from supabase import create_client

        return create_client(self.settings.supabase_url, self.settings.supabase_key)

    def _require_client(self) -> object:
        if not self.client:
            raise AppError(
                message="Database provider is not configured",
                error="database_provider_unavailable",
                status_code=503,
            )

        return self.client

    async def select_one(self, table: str, filters: dict[str, object], columns: str = "*") -> dict[str, object] | None:
        from starlette.concurrency import run_in_threadpool

        def query() -> object:
            request = self._require_client().table(table).select(columns)
            for key, value in filters.items():
                request = request.eq(key, value)
            return request.maybe_single().execute()

        response = await run_in_threadpool(query)
        return getattr(response, "data", None)

    async def select_many(
        self,
        table: str,
        filters: dict[str, object],
        columns: str = "*",
        order_by: str | None = None,
    ) -> list[dict[str, object]]:
        from starlette.concurrency import run_in_threadpool

        def query() -> object:
            request = self._require_client().table(table).select(columns)
            for key, value in filters.items():
                request = request.eq(key, value)
            if order_by:
                request = request.order(order_by)
            return request.execute()

        response = await run_in_threadpool(query)
        return getattr(response, "data", None) or []

    async def insert_one(
        self,
        table: str,
        data: dict[str, object],
        columns: str = "*",
    ) -> dict[str, object] | None:
        from starlette.concurrency import run_in_threadpool

        def query() -> object:
            return self._require_client().table(table).insert(data).select(columns).maybe_single().execute()

        response = await run_in_threadpool(query)
        return getattr(response, "data", None)

    async def update_one(
        self,
        table: str,
        filters: dict[str, object],
        data: dict[str, object],
        columns: str = "*",
    ) -> dict[str, object] | None:
        from starlette.concurrency import run_in_threadpool

        def query() -> object:
            request = self._require_client().table(table).update(data).select(columns)
            for key, value in filters.items():
                request = request.eq(key, value)
            return request.maybe_single().execute()

        response = await run_in_threadpool(query)
        return getattr(response, "data", None)

    async def delete_one(
        self,
        table: str,
        filters: dict[str, object],
        columns: str = "*",
    ) -> dict[str, object] | None:
        from starlette.concurrency import run_in_threadpool

        def query() -> object:
            request = self._require_client().table(table).delete().select(columns)
            for key, value in filters.items():
                request = request.eq(key, value)
            return request.maybe_single().execute()

        response = await run_in_threadpool(query)
        return getattr(response, "data", None)

    async def count(self, table: str, filters: dict[str, object]) -> int:
        from starlette.concurrency import run_in_threadpool

        def query() -> object:
            request = self._require_client().table(table).select("*", count="exact", head=True)
            for key, value in filters.items():
                request = request.eq(key, value)
            return request.execute()

        response = await run_in_threadpool(query)
        return int(getattr(response, "count", 0) or 0)
