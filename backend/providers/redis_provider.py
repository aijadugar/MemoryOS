from redis.asyncio import Redis

from config.settings import Settings


class RedisProvider:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.client = Redis.from_url(settings.redis_url, decode_responses=True) if settings.redis_url else None

    async def close(self) -> None:
        if self.client:
            await self.client.aclose()
