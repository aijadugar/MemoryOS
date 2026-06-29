from openai import AsyncOpenAI

from config.settings import Settings
from utils.exceptions import AppError


class OpenAIProvider:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.client = self._create_client()

    def _create_client(self) -> AsyncOpenAI | None:
        if not self.settings.openai_api_key:
            return None

        return AsyncOpenAI(
            api_key=self.settings.openai_api_key,
            timeout=self.settings.openai_timeout_seconds,
        )

    def get_client(self) -> AsyncOpenAI:
        if not self.client:
            raise AppError(
                message="OpenAI provider is not configured",
                error="openai_provider_unavailable",
                status_code=503,
            )

        return self.client
