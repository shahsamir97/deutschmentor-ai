import asyncio
import logging
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import httpx
import pytest
from openai import APITimeoutError, InternalServerError, RateLimitError

from app.schemas.translation import (
    Correction,
    TranslationRequest,
    TranslationResponse,
)
from app.services.translation_service import (
    TranslationParseError,
    TranslationProviderError,
    TranslationRateLimitError,
    TranslationService,
    TranslationTimeoutError,
)

SECRET_TEXT = "Ich habe ein geheimes Passwort"


def make_request(text: str = SECRET_TEXT) -> TranslationRequest:
    return TranslationRequest(text=text, direction="de-en")


def make_result(**overrides: object) -> TranslationResponse:
    data = {
        "originalText": "model-altered",
        "translatedText": "I have a secret password",
        "germanText": SECRET_TEXT,
        "correction": Correction(
            hasError=False, suggestion=None, explanation=None
        ),
    }
    return TranslationResponse(**{**data, **overrides})


def make_service(
    parsed: TranslationResponse | None = None,
    error: Exception | None = None,
) -> tuple[TranslationService, AsyncMock]:
    parse = AsyncMock(
        return_value=SimpleNamespace(output_parsed=parsed),
        side_effect=error,
    )
    client = MagicMock()
    client.responses.parse = parse
    return TranslationService(client=client, model="test-model"), parse


def timeout_error() -> Exception:
    return APITimeoutError(request=httpx.Request("POST", "https://x.test"))


def status_error(cls: type[Exception], status_code: int) -> Exception:
    response = httpx.Response(
        status_code, request=httpx.Request("POST", "https://x.test")
    )
    return cls("boom", response=response, body=None)


def test_translate_returns_parsed_result_and_keeps_original_text():
    service, parse = make_service(parsed=make_result())

    result = asyncio.run(service.translate(make_request()))

    assert result.originalText == SECRET_TEXT
    assert result.translatedText == "I have a secret password"
    kwargs = parse.await_args.kwargs
    assert kwargs["model"] == "test-model"
    assert kwargs["text_format"] is TranslationResponse
    assert kwargs["store"] is False
    assert SECRET_TEXT in kwargs["input"]


def test_translate_raises_when_parsed_output_is_missing():
    service, _ = make_service(parsed=None)

    with pytest.raises(TranslationParseError):
        asyncio.run(service.translate(make_request()))


@pytest.mark.parametrize(
    ("error", "expected"),
    [
        (timeout_error(), TranslationTimeoutError),
        (status_error(RateLimitError, 429), TranslationRateLimitError),
        (status_error(InternalServerError, 500), TranslationProviderError),
    ],
)
def test_translate_maps_provider_errors(error, expected):
    service, _ = make_service(error=error)

    with pytest.raises(expected):
        asyncio.run(service.translate(make_request()))


def test_translate_does_not_log_user_text(caplog):
    service, _ = make_service(error=status_error(RateLimitError, 429))

    with (
        caplog.at_level(logging.DEBUG),
        pytest.raises(TranslationRateLimitError),
    ):
        asyncio.run(service.translate(make_request()))

    assert caplog.records
    assert SECRET_TEXT not in caplog.text
    assert "boom" not in caplog.text
