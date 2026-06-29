from config.settings import Settings


class ElevenLabsProvider:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.client = self._create_client()

    def _create_client(self) -> object | None:
        if not self.settings.elevenlabs_api_key:
            return None

        from elevenlabs.client import AsyncElevenLabs

        return AsyncElevenLabs(api_key=self.settings.elevenlabs_api_key)
