from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_example_sentence_generation_service
from app.schemas.example_sentences import (
    ExampleSentenceRequest,
    ExampleSentenceResponse,
)
from app.services.example_sentence_generation_service import (
    ExampleSentenceGenerationError,
    ExampleSentenceGenerationRateLimitError,
    ExampleSentenceGenerationRefusalError,
    ExampleSentenceGenerationService,
    ExampleSentenceGenerationTimeoutError,
)

router = APIRouter(tags=["Example sentences"])


@router.post("/example-sentences")
async def generate_example_sentences(
    request: ExampleSentenceRequest,
    service: Annotated[
        ExampleSentenceGenerationService,
        Depends(get_example_sentence_generation_service),
    ],
) -> ExampleSentenceResponse:
    try:
        return await service.generate(request)
    except ExampleSentenceGenerationTimeoutError as exc:
        raise HTTPException(
            status.HTTP_504_GATEWAY_TIMEOUT,
            "The example sentence service timed out. Please try again.",
        ) from exc
    except ExampleSentenceGenerationRateLimitError as exc:
        raise HTTPException(
            status.HTTP_429_TOO_MANY_REQUESTS,
            "Too many example sentence requests. Please try again shortly.",
        ) from exc
    except ExampleSentenceGenerationRefusalError as exc:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT,
            "Examples cannot be generated for this text.",
        ) from exc
    except ExampleSentenceGenerationError as exc:
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY,
            "The example sentence service is currently unavailable.",
        ) from exc
