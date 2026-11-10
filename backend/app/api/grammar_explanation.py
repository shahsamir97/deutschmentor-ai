
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, logger
from openai import APIError, APITimeoutError, RateLimitError

from app.api.dependencies import get_grammar_explanation_service
from app.schemas.grammar_explanation import (
    GrammarExplanationRequest,
    GrammarExplanationResponse,
)
from app.services.grammar_explanation_service import GrammarExplanationService

router = APIRouter(
    prefix="/grammar",
    tags=["Grammar Explanation"]
)

@router.post(
    "/grammar_explanation",
    response_model=GrammarExplanationResponse
)
async def explain_grammar(
    request: GrammarExplanationRequest,
    service: Annotated[GrammarExplanationService, Depends(
        get_grammar_explanation_service
    )],
) -> GrammarExplanationResponse:
    try:
        return await service.explain(request)
    except RateLimitError:
        raise HTTPException(
            status_code=503,
            detail="Grammar service temporarily unavailable"
        ) from None

    except (APITimeoutError, APIError, ValueError):
        logger.exception("Grammar explanation failed")

        raise HTTPException(
            status_code=502,
            detail="Unable to generate grammar explanation",
        ) from None