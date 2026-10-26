
from typing import Literal

from pydantic import BaseModel, Field


class TranslationRequest(BaseModel):
    text: str = Field(min_length=1, max_length=1000)
    direction: Literal["de-en", "en-de"]


class Correction(BaseModel):
    hasError: bool
    suggestion: str | None
    explanation: str | None


class TranslationResponse(BaseModel):
    originalText: str
    translatedText: str
    germanText: str
    correction: Correction | None

