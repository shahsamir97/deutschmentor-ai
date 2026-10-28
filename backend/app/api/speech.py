from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.api.dependencies import (
    check_speech_rate_limit,
    get_speech_service,
)
from app.schemas.speech import SpeechRequest
from app.services.speech_service import (
    SpeechError,
    SpeechRateLimitError,
    SpeechService,
    SpeechTimeoutError,
)

router = APIRouter(tags=["Speech"])


@router.post(
    "/speech",
    response_class=Response,
    responses={200: {"content": {"audio/mpeg": {}}}},
    dependencies=[Depends(check_speech_rate_limit)],
)
async def synthesize_speech(
    request: SpeechRequest,
    service: Annotated[SpeechService, Depends(get_speech_service)],
) -> Response:
    try:
        audio = await service.synthesize(request)
    except SpeechTimeoutError as exc:
        raise HTTPException(
            status.HTTP_504_GATEWAY_TIMEOUT,
            "The speech service timed out. Please try again.",
        ) from exc
    except SpeechRateLimitError as exc:
        raise HTTPException(
            status.HTTP_429_TOO_MANY_REQUESTS,
            "Too many speech requests. Please try again shortly.",
        ) from exc
    except SpeechError as exc:
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY,
            "The speech service is currently unavailable.",
        ) from exc
    return Response(content=audio, media_type="audio/mpeg")
