import unicodedata
from typing import Annotated

from pydantic import BaseModel, StringConstraints, field_validator

EXAMPLE_SENTENCE_COUNT = 2
MAX_GERMAN_TEXT_LENGTH = 200


class ExampleSentenceRequest(BaseModel):
    germanText: Annotated[
        str,
        StringConstraints(
            strip_whitespace=True,
            min_length=1,
            max_length=MAX_GERMAN_TEXT_LENGTH,
        ),
    ]

    @field_validator("germanText")
    @classmethod
    def validate_text_content(cls, value: str) -> str:
        if not any(char.isalpha() for char in value):
            raise ValueError("germanText must contain letters")
        if any(unicodedata.category(char) == "Cc" for char in value):
            raise ValueError("germanText must not contain control characters")
        return value


class ExampleSentenceItem(BaseModel):
    german: str
    translation: str


class GeneratedExampleSentences(BaseModel):
    """Structured output requested from the model.

    The sentence count is verified by the service because array length
    limits are not reliably enforced by strict Structured Outputs.
    """

    sentences: list[ExampleSentenceItem]


class ExampleSentenceResponse(BaseModel):
    germanText: str
    sentences: list[ExampleSentenceItem]
