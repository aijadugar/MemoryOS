from pydantic import BaseModel, Field, field_validator


MAX_VOICE_TEXT_LENGTH = 8000


class VoiceChatRequest(BaseModel):
    text: str | None = Field(default=None, max_length=MAX_VOICE_TEXT_LENGTH)
    conversation_id: str | None = Field(default=None, max_length=128)

    @field_validator("text")
    @classmethod
    def text_must_not_be_blank(cls, value: str | None) -> str | None:
        if value is None:
            return value
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Text cannot be empty")
        return cleaned


class TextToSpeechRequest(BaseModel):
    text: str = Field(min_length=1, max_length=MAX_VOICE_TEXT_LENGTH)

    @field_validator("text")
    @classmethod
    def text_must_not_be_blank(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Text cannot be empty")
        return cleaned


class VoiceChatData(BaseModel):
    text: str
    transcript: str | None = None
    audio_url: str
    conversation_id: str


class TextToSpeechData(BaseModel):
    audio_url: str
    text: str


class SpeechToTextData(BaseModel):
    transcript: str


class VoiceInfo(BaseModel):
    configured: bool
    voice_id: str | None = None
    name: str | None = None
    category: str | None = None
    settings: dict[str, object] = {}
    models: dict[str, object] = {}


class VoiceChatResponse(BaseModel):
    success: bool = True
    data: VoiceChatData


class TextToSpeechResponse(BaseModel):
    success: bool = True
    data: TextToSpeechData


class SpeechToTextResponse(BaseModel):
    success: bool = True
    data: SpeechToTextData


class VoicesResponse(BaseModel):
    success: bool = True
    data: VoiceInfo
