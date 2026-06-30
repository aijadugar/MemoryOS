from fastapi import APIRouter, Depends, File, Request, UploadFile

from api.dependencies.auth import current_user
from config.dependencies import get_voice_service
from schemas.voice import (
    SpeechToTextResponse,
    TextToSpeechRequest,
    TextToSpeechResponse,
    VoiceChatRequest,
    VoiceChatResponse,
    VoicesResponse,
)
from services.voice_service import VoiceService
from utils.exceptions import AppError

router = APIRouter(prefix="/voice", tags=["voice"])


@router.post("/chat", response_model=VoiceChatResponse)
async def voice_chat(
    request: Request,
    user: current_user,
    voice_service: VoiceService = Depends(get_voice_service),
) -> VoiceChatResponse:
    content_type = request.headers.get("content-type", "")

    if content_type.startswith("multipart/form-data"):
        form = await request.form()
        upload = form.get("audio") or form.get("file")
        text = form.get("text")
        conversation_id = form.get("conversation_id")

        if upload is not None and not hasattr(upload, "read"):
            raise AppError(message="Audio upload is invalid", error="invalid_audio_upload", status_code=400)

        if upload is not None and hasattr(upload, "read"):
            content = await upload.read()
            data = await voice_service.voice_chat(
                user_id=user.id,
                text=str(text) if text else None,
                conversation_id=str(conversation_id) if conversation_id else None,
                audio_filename=getattr(upload, "filename", None),
                audio_content=content,
                audio_content_type=getattr(upload, "content_type", None),
            )
            return VoiceChatResponse(data=data)

        data = await voice_service.voice_chat(
            user_id=user.id,
            text=str(text) if text else None,
            conversation_id=str(conversation_id) if conversation_id else None,
        )
        return VoiceChatResponse(data=data)

    payload = VoiceChatRequest.model_validate(await request.json())
    data = await voice_service.voice_chat(
        user_id=user.id,
        text=payload.text,
        conversation_id=payload.conversation_id,
    )
    return VoiceChatResponse(data=data)


@router.post("/text-to-speech", response_model=TextToSpeechResponse)
async def text_to_speech(
    payload: TextToSpeechRequest,
    user: current_user,
    voice_service: VoiceService = Depends(get_voice_service),
) -> TextToSpeechResponse:
    data = await voice_service.text_to_speech(user_id=user.id, text=payload.text)
    return TextToSpeechResponse(data=data)


@router.post("/speech-to-text", response_model=SpeechToTextResponse)
async def speech_to_text(
    user: current_user,
    audio: UploadFile = File(...),
    voice_service: VoiceService = Depends(get_voice_service),
) -> SpeechToTextResponse:
    _ = user
    data = await voice_service.speech_to_text(
        filename=audio.filename or "audio",
        content=await audio.read(),
        content_type=audio.content_type,
    )
    return SpeechToTextResponse(data=data)


@router.get("/voices", response_model=VoicesResponse)
async def voices(
    user: current_user,
    voice_service: VoiceService = Depends(get_voice_service),
) -> VoicesResponse:
    _ = user
    data = await voice_service.voices()
    return VoicesResponse(data=data)
