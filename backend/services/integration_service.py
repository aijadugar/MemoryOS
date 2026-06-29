from providers.composio_provider import ComposioProvider


class IntegrationService:
    def __init__(self, composio_provider: ComposioProvider) -> None:
        self.composio_provider = composio_provider

    async def list_integrations(self) -> None:
        return None

    async def execute_action(self) -> None:
        return None
