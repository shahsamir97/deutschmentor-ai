import pytest
from pydantic import ValidationError

from app.schemas.translation import TranslationRequest


def test_translation_request_rejects_empty_text():
    with pytest.raises(ValidationError):
        TranslationRequest(text="", direction="de-en")


def test_translation_request_rejects_unsupported_direction():
    with pytest.raises(ValidationError):
        TranslationRequest(text="Hallo", direction="de-fr")


def test_translation_request_enforces_maximum_text_length():
    TranslationRequest(text="a" * 1000, direction="de-en")

    with pytest.raises(ValidationError):
        TranslationRequest(text="a" * 1001, direction="de-en")
