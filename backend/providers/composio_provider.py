from config.settings import Settings


class ComposioProvider:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.client = self._create_client()

    def _create_client(self) -> object | None:
        if not self.settings.composio_api_key:
            return None

        from composio import Composio

        return Composio(api_key=self.settings.composio_api_key)
