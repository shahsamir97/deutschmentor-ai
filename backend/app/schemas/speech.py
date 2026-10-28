import unicodedata
from typing import Annotated, Literal

from pydantic import BaseModel, StringConstraints, field_validator

MAX_SPEECH_TEXT_LENGTH = 500
NORMAL_SPEAKING_RATE = 1.0
SLOW_SPEAKING_RATE = 0.85


class SpeechRequest(BaseModel):
    text: Annotated[
        str,
        StringConstraints(
            strip_whitespace=True,
            min_length=1,
            max_length=MAX_SPEECH_TEXT_LENGTH,
        ),
    ]
    speakingRate: Literal[1.0, 0.85] = NORMAL_SPEAKING_RATE

    @field_validator("text")
    @classmethod
    def validate_text_content(cls, value: str) -> str:
        value = unicodedata.normalize("NFC", value)
        if not any(char.isalpha() for char in value):
            raise ValueError("text must contain letters")
        if any(
            unicodedata.category(char) == "Cc" and not char.isspace()
            for char in value
        ):
            raise ValueError("text must not contain control characters")
        return " ".join(value.split())
