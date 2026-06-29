from functools import lru_cache

from config.settings import Settings, get_settings


@lru_cache
def get_openai_provider():
    from providers.openai_provider import OpenAIProvider

    return OpenAIProvider(get_settings())


@lru_cache
def get_supabase_provider():
    from providers.supabase_provider import SupabaseProvider

    return SupabaseProvider(get_settings())


@lru_cache
def get_redis_provider():
    from providers.redis_provider import RedisProvider

    return RedisProvider(get_settings())


@lru_cache
def get_composio_provider():
    from providers.composio_provider import ComposioProvider

    return ComposioProvider(get_settings())


@lru_cache
def get_elevenlabs_provider():
    from providers.elevenlabs_provider import ElevenLabsProvider

    return ElevenLabsProvider(get_settings())


@lru_cache
def get_memory_provider():
    from providers.memory_provider import MockMemoryProvider

    try:
        redis_provider = get_redis_provider()
    except ModuleNotFoundError:
        redis_provider = None

    return MockMemoryProvider(redis_provider=redis_provider)


def get_auth_service():
    from services.auth_service import AuthService

    return AuthService(supabase_provider=get_supabase_provider())


def get_user_service():
    from services.user_service import UserService

    return UserService(supabase_provider=get_supabase_provider())


def get_workspace_service():
    from services.workspace_service import WorkspaceService

    return WorkspaceService(supabase_provider=get_supabase_provider())


def get_llm_service(settings: Settings = get_settings()):
    from services.llm_service import LLMService

    return LLMService(settings=settings, openai_provider=get_openai_provider())


def get_chat_service():
    from services.chat_service import ChatService

    return ChatService(llm_service=get_llm_service(), memory_service=get_memory_service())


def get_memory_service():
    from services.memory_service import MemoryService

    return MemoryService(memory_provider=get_memory_provider())


def get_dashboard_service():
    from services.dashboard_service import DashboardService

    return DashboardService()


def get_timeline_service():
    from services.timeline_service import TimelineService

    return TimelineService()


def get_graph_service():
    from services.graph_service import GraphService

    return GraphService()


def get_voice_service():
    from services.voice_service import VoiceService

    return VoiceService(elevenlabs_provider=get_elevenlabs_provider())


def get_integration_service():
    from services.integration_service import IntegrationService

    return IntegrationService(composio_provider=get_composio_provider())
