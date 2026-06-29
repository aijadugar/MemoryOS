from providers.elevenlabs_provider import ElevenLabsProvider


class VoiceService:
    def __init__(self, elevenlabs_provider: ElevenLabsProvider) -> None:
        self.elevenlabs_provider = elevenlabs_provider

    async def transcribe(self) -> None:
        return None

    async def synthesize(self) -> None:
        return None
