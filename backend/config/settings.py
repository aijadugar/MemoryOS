from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    app_name: str = "MemoryOS Backend"
    app_version: str = "0.1.0"
    debug: bool = False
    api_prefix: str = "/api/v1"
    log_level: str = "INFO"
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:3000", "http://localhost:5173"])

    openai_api_key: str | None = None
    openai_chat_model: str = "gpt-4.1-mini"
    openai_embedding_model: str = "text-embedding-3-small"
    openai_temperature: float = 0.2
    openai_timeout_seconds: float = 30.0

    supabase_url: str | None = None
    supabase_key: str | None = None
    supabase_documents_bucket: str = "documents"

    document_max_file_size_mb: int = 50
    document_cache_ttl_seconds: int = 300

    redis_url: str | None = None
    integration_cache_ttl_seconds: int = 300

    composio_api_key: str | None = None

    elevenlabs_api_key: str | None = None
    elevenlabs_voice_id: str | None = None
    elevenlabs_tts_model: str = "eleven_multilingual_v2"
    elevenlabs_stt_model: str = "scribe_v1"
    elevenlabs_output_format: str = "mp3_44100_128"
    elevenlabs_stability: float = 0.5
    elevenlabs_similarity_boost: float = 0.75
    supabase_voice_bucket: str = "voice"
    voice_max_audio_size_mb: int = 25
    voice_audio_url_ttl_seconds: int = 900
    voice_cache_ttl_seconds: int = 900


@lru_cache
def get_settings() -> Settings:
    return Settings()
