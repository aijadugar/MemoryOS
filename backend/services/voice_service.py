from __future__ import annotations

import json
import logging
import re
import time
from pathlib import PurePosixPath
from typing import TYPE_CHECKING
from uuid import uuid4

from config.settings import Settings
from schemas.chat import ChatRequest
from schemas.voice import SpeechToTextData, TextToSpeechData, VoiceChatData, VoiceInfo
from utils.exceptions import AppError

if TYPE_CHECKING:
    from providers.elevenlabs_provider import ElevenLabsProvider
    from providers.redis_provider import RedisProvider
    from providers.storage_provider import StorageProvider
    from services.chat_service import ChatService
    from services.llm_service import LLMService
    from services.memory_service import MemoryService

logger = logging.getLogger(__name__)

SUPPORTED_AUDIO_FORMATS = {"wav", "mp3", "m4a", "ogg"}


class VoiceService:
    def __init__(
        self,
        settings: Settings,
        chat_service: ChatService,
        llm_service: LLMService,
        memory_service: MemoryService,
        elevenlabs_provider: ElevenLabsProvider,
        storage_provider: StorageProvider,
        redis_provider: RedisProvider | None = None,
    ) -> None:
        self.settings = settings
        self.chat_service = chat_service
        self.llm_service = llm_service
        self.memory_service = memory_service
        self.elevenlabs_provider = elevenlabs_provider
        self.storage_provider = storage_provider
        self.redis_provider = redis_provider

    async def voice_chat(
        self,
        user_id: str,
        text: str | None = None,
        conversation_id: str | None = None,
        audio_filename: str | None = None,
        audio_content: bytes | None = None,
        audio_content_type: str | None = None,
    ) -> VoiceChatData:
        started_at = time.perf_counter()
        transcript = text.strip() if text else None
        audio_duration = None

        if audio_content is not None:
            if not audio_filename:
                raise AppError(message="Audio filename is required", error="audio_filename_required", status_code=400)
            self._validate_audio(audio_filename, len(audio_content))
            transcript = (await self.speech_to_text(audio_filename, audio_content, audio_content_type)).transcript

        if not transcript:
            raise AppError(message="Text or audio is required", error="voice_input_required", status_code=400)

        chat_response = await self.chat_service.create_chat(
            user_id=user_id,
            request=ChatRequest(message=transcript, conversation_id=conversation_id),
        )
        audio = await self.text_to_speech(user_id=user_id, text=chat_response.message, conversation_id=chat_response.conversation_id)

        logger.info(
            "voice_chat_completed user_id=%s conversation_id=%s audio_duration=%s processing_time=%.3fs",
            user_id,
            chat_response.conversation_id,
            audio_duration,
            time.perf_counter() - started_at,
        )

        return VoiceChatData(
            text=chat_response.message,
            transcript=transcript,
            audio_url=audio.audio_url,
            conversation_id=chat_response.conversation_id,
        )

    async def text_to_speech(self, user_id: str, text: str, conversation_id: str | None = None) -> TextToSpeechData:
        cleaned = text.strip()
        if not cleaned:
            raise AppError(message="Text is required", error="voice_text_required", status_code=400)

        audio_content = await self.elevenlabs_provider.synthesize(cleaned)
        audio_url = await self._store_generated_audio(user_id=user_id, content=audio_content, conversation_id=conversation_id)
        return TextToSpeechData(audio_url=audio_url, text=cleaned)

    async def speech_to_text(self, filename: str, content: bytes, content_type: str | None = None) -> SpeechToTextData:
        self._validate_audio(filename, len(content))
        transcript = await self.elevenlabs_provider.transcribe(filename=filename, content=content, content_type=content_type)
        return SpeechToTextData(transcript=transcript)

    async def voices(self) -> VoiceInfo:
        return VoiceInfo.model_validate(await self.elevenlabs_provider.configured_voice())

    async def _store_generated_audio(self, user_id: str, content: bytes, conversation_id: str | None = None) -> str:
        audio_id = str(uuid4())
        storage_path = f"{user_id}/{conversation_id or 'standalone'}/{audio_id}.mp3"
        await self.storage_provider.upload_to_bucket(
            self.settings.supabase_voice_bucket,
            storage_path,
            content,
            "audio/mpeg",
        )
        signed_url = await self.storage_provider.create_signed_url(
            self.settings.supabase_voice_bucket,
            storage_path,
            self.settings.voice_audio_url_ttl_seconds,
        )
        await self._cache_audio_metadata(audio_id, user_id, conversation_id, storage_path, len(content))
        return signed_url

    async def _cache_audio_metadata(
        self,
        audio_id: str,
        user_id: str,
        conversation_id: str | None,
        storage_path: str,
        size: int,
    ) -> None:
        if not self.redis_provider or not self.redis_provider.client:
            return

        await self.redis_provider.client.setex(
            f"voice:audio:{audio_id}",
            self.settings.voice_cache_ttl_seconds,
            json.dumps(
                {
                    "user_id": user_id,
                    "conversation_id": conversation_id,
                    "storage_path": storage_path,
                    "size": size,
                }
            ),
        )

    def _validate_audio(self, filename: str, file_size: int) -> None:
        if file_size <= 0:
            raise AppError(message="Uploaded audio is empty", error="empty_audio", status_code=400)

        file_type = PurePosixPath(filename).suffix.lower().lstrip(".")
        if file_type not in SUPPORTED_AUDIO_FORMATS:
            raise AppError(message="Unsupported audio format", error="unsupported_audio_format", status_code=400)

        max_bytes = self.settings.voice_max_audio_size_mb * 1024 * 1024
        if file_size > max_bytes:
            raise AppError(message="Uploaded audio is too large", error="audio_too_large", status_code=413)

        if not re.search(r"\S", filename):
            raise AppError(message="Audio filename is required", error="audio_filename_required", status_code=400)
