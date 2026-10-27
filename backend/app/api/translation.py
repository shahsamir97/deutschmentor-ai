from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_translation_service
from app.schemas.translation import (
    TranslationRequest,
    TranslationResponse,
)
from app.services.translation_service import (
    TranslationRateLimitError,
    TranslationService,
    TranslationServiceError,
    TranslationTimeoutError,
)

router = APIRouter(tags=["Translation"])


@router.post("/translate")
async def translate(
    request: TranslationRequest,
    service: Annotated[TranslationService, Depends(get_translation_service)],
) -> TranslationResponse:
    try:
        return await service.translate(request)
    except TranslationTimeoutError as exc:
        raise HTTPException(
            status.HTTP_504_GATEWAY_TIMEOUT,
            "The translation service timed out. Please try again.",
        ) from exc
    except TranslationRateLimitError as exc:
        raise HTTPException(
            status.HTTP_429_TOO_MANY_REQUESTS,
            "Too many translation requests. Please try again shortly.",
        ) from exc
    except TranslationServiceError as exc:
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY,
            "The translation service is currently unavailable.",
        ) from exc
