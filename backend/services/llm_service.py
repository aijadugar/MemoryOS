from typing import cast

from openai import APIConnectionError, APIStatusError, APITimeoutError, OpenAIError, RateLimitError
from openai.types.chat import ChatCompletionMessageParam
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from config.settings import Settings
from providers.openai_provider import OpenAIProvider
from schemas.llm import (
    LLMChatRequest,
    LLMChatResponse,
    LLMClassifyRequest,
    LLMClassifyResponse,
    LLMEmbeddingRequest,
    LLMEmbeddingResponse,
    LLMKeywordsRequest,
    LLMKeywordsResponse,
    LLMMessage,
    LLMSummarizeRequest,
    LLMSummarizeResponse,
    LLMTitleRequest,
    LLMTitleResponse,
)
from utils.exceptions import AppError


class LLMService:
    def __init__(self, settings: Settings, openai_provider: OpenAIProvider) -> None:
        self.settings = settings
        self.openai_provider = openai_provider
        self.chat_model = settings.openai_chat_model
        self.embedding_model = settings.openai_embedding_model
        self.temperature = settings.openai_temperature

    async def chat(self, messages: list[LLMMessage], system_prompt: str | None = None) -> LLMChatResponse:
        request = LLMChatRequest(messages=messages, system_prompt=system_prompt)
        prepared_messages = self._prepare_messages(request.messages, request.system_prompt)
        try:
            content = await self._create_chat_completion(prepared_messages)
        except OpenAIError as exc:
            self._raise_openai_error(exc)

        return LLMChatResponse(content=content, model=self.chat_model)

    async def summarize(self, text: str) -> LLMSummarizeResponse:
        request = LLMSummarizeRequest(text=text)
        content = await self._prompt(
            "Summarize the text clearly and concisely.",
            request.text,
        )

        return LLMSummarizeResponse(summary=content, model=self.chat_model)

    async def generate_title(self, text: str) -> LLMTitleResponse:
        request = LLMTitleRequest(text=text)
        content = await self._prompt(
            "Generate a concise title for the text. Return only the title.",
            request.text,
        )

        return LLMTitleResponse(title=content.strip().strip('"'), model=self.chat_model)

    async def extract_keywords(self, text: str) -> LLMKeywordsResponse:
        request = LLMKeywordsRequest(text=text)
        content = await self._prompt(
            "Extract the most important keywords from the text. Return a comma-separated list only.",
            request.text,
        )
        keywords = [keyword.strip() for keyword in content.split(",") if keyword.strip()]

        return LLMKeywordsResponse(keywords=keywords, model=self.chat_model)

    async def classify(self, text: str, categories: list[str]) -> LLMClassifyResponse:
        request = LLMClassifyRequest(text=text, categories=categories)
        categories_text = ", ".join(request.categories)
        content = await self._prompt(
            f"Classify the text into exactly one of these categories: {categories_text}. Return only the category.",
            request.text,
        )

        return LLMClassifyResponse(category=content.strip(), model=self.chat_model)

    async def embeddings(self, text: str) -> LLMEmbeddingResponse:
        request = LLMEmbeddingRequest(text=text)
        try:
            response = await self._create_embedding(request.text)
        except OpenAIError as exc:
            self._raise_openai_error(exc)

        return LLMEmbeddingResponse(
            embedding=response.data[0].embedding,
            model=self.embedding_model,
        )

    async def _prompt(self, system_prompt: str, text: str) -> str:
        response = await self.chat(
            messages=[LLMMessage(role="user", content=text)],
            system_prompt=system_prompt,
        )

        return response.content

    def _prepare_messages(
        self,
        messages: list[LLMMessage],
        system_prompt: str | None,
    ) -> list[ChatCompletionMessageParam]:
        prepared_messages = [message.model_dump() for message in messages]
        if system_prompt:
            prepared_messages.insert(0, LLMMessage(role="system", content=system_prompt).model_dump())

        return cast(list[ChatCompletionMessageParam], prepared_messages)

    @retry(
        retry=retry_if_exception_type((APIConnectionError, APITimeoutError, RateLimitError)),
        wait=wait_exponential(multiplier=1, min=1, max=8),
        stop=stop_after_attempt(3),
        reraise=True,
    )
    async def _create_chat_completion(self, messages: list[ChatCompletionMessageParam]) -> str:
        response = await self.openai_provider.get_client().chat.completions.create(
            model=self.chat_model,
            messages=messages,
            temperature=self.temperature,
        )

        content = response.choices[0].message.content
        if not content:
            raise AppError(
                message="LLM returned an empty response",
                error="llm_empty_response",
                status_code=502,
            )

        return content.strip()

    @retry(
        retry=retry_if_exception_type((APIConnectionError, APITimeoutError, RateLimitError)),
        wait=wait_exponential(multiplier=1, min=1, max=8),
        stop=stop_after_attempt(3),
        reraise=True,
    )
    async def _create_embedding(self, text: str) -> object:
        return await self.openai_provider.get_client().embeddings.create(
            model=self.embedding_model,
            input=text,
        )

    def _raise_openai_error(self, exc: OpenAIError) -> None:
        if isinstance(exc, RateLimitError):
            raise AppError(
                message="LLM provider rate limit exceeded",
                error="llm_rate_limited",
                status_code=429,
            ) from exc

        if isinstance(exc, (APIConnectionError, APITimeoutError)):
            raise AppError(
                message="LLM provider is temporarily unavailable",
                error="llm_provider_unavailable",
                status_code=503,
            ) from exc

        if isinstance(exc, APIStatusError):
            status_code = exc.status_code if 400 <= exc.status_code < 600 else 502
            raise AppError(
                message="LLM provider request failed",
                error="llm_provider_error",
                status_code=status_code,
            ) from exc

        raise AppError(
            message="LLM request failed",
            error="llm_error",
            status_code=502,
        ) from exc
