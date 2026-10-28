import pytest
from pydantic import ValidationError

from app.schemas.example_sentences import ExampleSentenceRequest


def test_example_request_accepts_and_strips_text():
    assert ExampleSentenceRequest(germanText="  Termin  ").germanText == "Termin"


def test_example_request_enforces_maximum_length():
    ExampleSentenceRequest(germanText="a" * 200)

    with pytest.raises(ValidationError):
        ExampleSentenceRequest(germanText="a" * 201)


@pytest.mark.parametrize(
    "text", ["", "   ", "1234", "!?", "Guten\nTag", "Guten\x00Tag"]
)
def test_example_request_rejects_invalid_text(text):
    with pytest.raises(ValidationError):
        ExampleSentenceRequest(germanText=text)
