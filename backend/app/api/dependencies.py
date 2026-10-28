from typing import Annotated

from fastapi import Depends, Request
from openai import AsyncOpenAI, Timeout

from app.core.config import Settings, get_settings
from app.services.example_sentence_generation_service import (
    ExampleSentenceGenerationService,
)
from app.services.translation_service import TranslationService

CONNECT_TIMEOUT_SECONDS = 5.0


def create_openai_client(settings: Settings) -> AsyncOpenAI:
    return AsyncOpenAI(
        api_key=settings.openai_api_key.get_secret_value(),
        timeout=Timeout(
            settings.openai_timeout_seconds,
            connect=CONNECT_TIMEOUT_SECONDS,
        ),
        max_retries=settings.openai_max_retries,
    )


def get_openai_client(request: Request) -> AsyncOpenAI:
    # The client is created once at startup and closed on shutdown.
    return request.app.state.openai_client


def get_translation_service(
    client: Annotated[AsyncOpenAI, Depends(get_openai_client)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> TranslationService:
    return TranslationService(client=client, model=settings.openai_model)


def get_example_sentence_generation_service(
    client: Annotated[AsyncOpenAI, Depends(get_openai_client)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> ExampleSentenceGenerationService:
    return ExampleSentenceGenerationService(
        client=client, model=settings.openai_model
    )
