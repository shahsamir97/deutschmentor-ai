from functools import lru_cache
from typing import Annotated

from fastapi import Depends
from openai import AsyncOpenAI, Timeout

from app.core.config import Settings, get_settings
from app.services.translation_service import TranslationService

CONNECT_TIMEOUT_SECONDS = 5.0


@lru_cache
def get_openai_client() -> AsyncOpenAI:
    settings = get_settings()
    return AsyncOpenAI(
        api_key=settings.openai_api_key.get_secret_value(),
        timeout=Timeout(
            settings.openai_timeout_seconds,
            connect=CONNECT_TIMEOUT_SECONDS,
        ),
        max_retries=settings.openai_max_retries,
    )


def get_translation_service(
    client: Annotated[AsyncOpenAI, Depends(get_openai_client)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> TranslationService:
    return TranslationService(client=client, model=settings.openai_model)
