from collections.abc import Iterator
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient
from pydantic import SecretStr

from app.api.dependencies import get_translation_service
from app.core.config import Settings
from app.main import app
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
PAYLOAD = {"text": SECRET_TEXT, "direction": "de-en"}


@pytest.fixture
def service() -> AsyncMock:
    mock = AsyncMock(spec=TranslationService)
    mock.translate.return_value = TranslationResponse(
        translatedText="I have a secret password",
        germanText=SECRET_TEXT,
        correction=Correction(
            hasError=False, suggestion=None, explanation=None
        ),
    )
    return mock


@pytest.fixture
def client(service: AsyncMock) -> Iterator[TestClient]:
    app.dependency_overrides[get_translation_service] = lambda: service
    yield TestClient(app)
    app.dependency_overrides.clear()


def test_translate_returns_service_result(client, service):
    response = client.post("/api/v1/translate", json=PAYLOAD)

    assert response.status_code == 200
    assert response.json() == {
        "translatedText": "I have a secret password",
        "germanText": SECRET_TEXT,
        "correction": {
            "hasError": False,
            "suggestion": None,
            "explanation": None,
        },
    }
    service.translate.assert_awaited_once_with(
        TranslationRequest(**PAYLOAD)
    )


@pytest.mark.parametrize(
    "payload",
    [
        {"text": "", "direction": "de-en"},
        {"text": "a" * 1001, "direction": "de-en"},
        {"text": "Hallo", "direction": "de-fr"},
        {"direction": "de-en"},
    ],
)
def test_translate_rejects_invalid_requests(client, service, payload):
    response = client.post("/api/v1/translate", json=payload)

    assert response.status_code == 422
    service.translate.assert_not_awaited()


@pytest.mark.parametrize(
    ("error", "status_code"),
    [
        (TranslationTimeoutError("provider secret"), 504),
        (TranslationRateLimitError("provider secret"), 429),
        (TranslationProviderError("provider secret"), 502),
        (TranslationParseError("provider secret"), 502),
    ],
)
def test_translate_maps_service_errors_to_safe_responses(
    client, service, error, status_code
):
    service.translate.side_effect = error

    response = client.post("/api/v1/translate", json=PAYLOAD)

    assert response.status_code == status_code
    assert "provider secret" not in response.text
    assert SECRET_TEXT not in response.text


def test_cors_allows_development_origin(client):
    response = client.options(
        "/api/v1/translate",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )

    assert response.status_code == 200
    assert (
        response.headers["access-control-allow-origin"]
        == "http://localhost:5173"
    )


def test_cors_rejects_unknown_origin(client):
    response = client.options(
        "/api/v1/translate",
        headers={
            "Origin": "https://evil.example",
            "Access-Control-Request-Method": "POST",
        },
    )

    assert "access-control-allow-origin" not in response.headers


def test_lifespan_closes_openai_client():
    settings = Settings(
        openai_api_key=SecretStr("test-key"),
        openai_model="test-model",
        _env_file=None,
    )

    with patch("app.main.get_settings", return_value=settings), TestClient(app):
        client = app.state.openai_client
        assert not client.is_closed()

    assert client.is_closed()
