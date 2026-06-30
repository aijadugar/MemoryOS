from config.settings import Settings
from utils.exceptions import AppError


class ElevenLabsProvider:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.client = self._create_client()

    def _create_client(self) -> object | None:
        if not self.settings.elevenlabs_api_key:
            return None

        from elevenlabs.client import AsyncElevenLabs

        return AsyncElevenLabs(api_key=self.settings.elevenlabs_api_key)

    def get_client(self) -> object:
        if not self.client:
            raise AppError(
                message="ElevenLabs provider is not configured",
                error="elevenlabs_provider_unavailable",
                status_code=503,
            )

        return self.client

    async def synthesize(self, text: str) -> bytes:
        from elevenlabs import VoiceSettings

        if not self.settings.elevenlabs_voice_id:
            raise AppError(message="ElevenLabs voice is not configured", error="elevenlabs_voice_unavailable", status_code=503)

        try:
            chunks: list[bytes] = []
            audio = self.get_client().text_to_speech.convert(
                self.settings.elevenlabs_voice_id,
                text=text,
                model_id=self.settings.elevenlabs_tts_model,
                output_format=self.settings.elevenlabs_output_format,
                voice_settings=VoiceSettings(
                    stability=self.settings.elevenlabs_stability,
                    similarity_boost=self.settings.elevenlabs_similarity_boost,
                ),
            )
            async for chunk in audio:
                chunks.append(chunk)
            return b"".join(chunks)
        except AppError:
            raise
        except Exception as exc:
            raise AppError(message="Failed to synthesize speech", error="elevenlabs_tts_failed", status_code=502) from exc

    async def transcribe(self, filename: str, content: bytes, content_type: str | None = None) -> str:
        try:
            response = await self.get_client().speech_to_text.convert(
                model_id=self.settings.elevenlabs_stt_model,
                file=(filename, content, content_type),
            )
            transcript = getattr(response, "text", None)
            if not transcript:
                raise AppError(message="Speech recognition returned no transcript", error="speech_transcript_empty", status_code=502)
            return str(transcript).strip()
        except AppError:
            raise
        except Exception as exc:
            raise AppError(message="Failed to transcribe speech", error="elevenlabs_stt_failed", status_code=502) from exc

    async def configured_voice(self) -> dict[str, object]:
        voice_id = self.settings.elevenlabs_voice_id
        if not voice_id:
            return {"configured": False, "voice_id": None}

        try:
            voice = await self.get_client().voices.get(voice_id)
            return {
                "configured": True,
                "voice_id": voice_id,
                "name": getattr(voice, "name", None),
                "category": getattr(voice, "category", None),
                "settings": {
                    "stability": self.settings.elevenlabs_stability,
                    "similarity_boost": self.settings.elevenlabs_similarity_boost,
                },
                "models": {
                    "tts": self.settings.elevenlabs_tts_model,
                    "stt": self.settings.elevenlabs_stt_model,
                    "output_format": self.settings.elevenlabs_output_format,
                },
            }
        except AppError:
            raise
        except Exception as exc:
            raise AppError(message="Failed to load voice configuration", error="elevenlabs_voice_lookup_failed", status_code=502) from exc
