from collections.abc import Iterator
from unittest.mock import AsyncMock

import pytest
from fastapi.testclient import TestClient

from app.api.dependencies import get_speech_service
from app.main import app
from app.schemas.speech import SpeechRequest
from app.services.speech_service import (
    RateLimiter,
    SpeechProviderError,
    SpeechRateLimitError,
    SpeechService,
    SpeechTimeoutError,
)

PAYLOAD = {"text": "Ich habe morgen einen Termin.", "speakingRate": 1.0}


@pytest.fixture
def service() -> AsyncMock:
    mock = AsyncMock(spec=SpeechService)
    mock.synthesize.return_value = b"ID3-audio"
    return mock


@pytest.fixture
def client(service: AsyncMock) -> Iterator[TestClient]:
    app.dependency_overrides[get_speech_service] = lambda: service
    app.state.speech_rate_limiter = RateLimiter(100, 60)
    yield TestClient(app)
    app.dependency_overrides.clear()


def test_speech_returns_mp3(client, service):
    response = client.post("/api/v1/speech", json=PAYLOAD)

    assert response.status_code == 200
    assert response.headers["content-type"] == "audio/mpeg"
    assert response.content == b"ID3-audio"
    service.synthesize.assert_awaited_once_with(SpeechRequest(**PAYLOAD))


def test_speech_defaults_to_normal_rate(client, service):
    client.post("/api/v1/speech", json={"text": "Hallo"})

    assert service.synthesize.await_args.args[0].speakingRate == 1.0


@pytest.mark.parametrize(
    "payload",
    [
        {"text": ""},
        {"text": "   "},
        {"text": "123"},
        {"text": "a" * 501},
        {"text": "Hallo\x00"},
        {"text": "Hallo", "speakingRate": 0.5},
        {"text": "Hallo", "speakingRate": 2},
        {"text": 5},
        {},
    ],
)
def test_speech_rejects_invalid_requests(client, service, payload):
    response = client.post("/api/v1/speech", json=payload)

    assert response.status_code == 422
    service.synthesize.assert_not_awaited()


def test_speech_ignores_client_supplied_voice(client, service):
    response = client.post(
        "/api/v1/speech",
        json={**PAYLOAD, "voice": "en-US-Neural2-A", "languageCode": "en-US"},
    )

    assert response.status_code == 200
    assert not hasattr(service.synthesize.await_args.args[0], "voice")


@pytest.mark.parametrize(
    ("error", "status_code"),
    [
        (SpeechTimeoutError(), 504),
        (SpeechRateLimitError(), 429),
        (SpeechProviderError("secret detail"), 502),
    ],
)
def test_speech_maps_service_errors(client, service, error, status_code):
    service.synthesize.side_effect = error

    response = client.post("/api/v1/speech", json=PAYLOAD)

    assert response.status_code == status_code
    assert "secret detail" not in response.text


def test_speech_enforces_per_client_rate_limit(client, service):
    app.state.speech_rate_limiter = RateLimiter(1, 60)

    assert client.post("/api/v1/speech", json=PAYLOAD).status_code == 200
    assert client.post("/api/v1/speech", json=PAYLOAD).status_code == 429
    assert service.synthesize.await_count == 1
