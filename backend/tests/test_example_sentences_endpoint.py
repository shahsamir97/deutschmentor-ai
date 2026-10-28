from collections.abc import Iterator
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi.testclient import TestClient

from app.api.dependencies import (
    get_example_sentence_generation_service,
    get_openai_client,
)
from app.core.config import Settings, get_settings
from app.main import app
from app.schemas.example_sentences import (
    ExampleSentenceItem,
    ExampleSentenceRequest,
    ExampleSentenceResponse,
    GeneratedExampleSentences,
)
from app.services.example_sentence_generation_service import (
    ExampleSentenceGenerationParseError,
    ExampleSentenceGenerationProviderError,
    ExampleSentenceGenerationRateLimitError,
    ExampleSentenceGenerationRefusalError,
    ExampleSentenceGenerationService,
    ExampleSentenceGenerationTimeoutError,
)

SECRET_TEXT = "Geheimwort"
PAYLOAD = {"germanText": "Termin"}
RESPONSE = {
    "germanText": "Termin",
    "sentences": [
        {
            "german": "Ich habe morgen einen Termin beim Arzt.",
            "translation": "I have an appointment with the doctor tomorrow.",
        },
        {
            "german": "Hast du am Freitag einen Termin frei?",
            "translation": "Do you have a free appointment on Friday?",
        },
    ],
}


@pytest.fixture
def service() -> AsyncMock:
    mock = AsyncMock(spec=ExampleSentenceGenerationService)
    mock.generate.return_value = ExampleSentenceResponse(
        germanText="Termin",
        sentences=[ExampleSentenceItem(**s) for s in RESPONSE["sentences"]],
    )
    return mock


@pytest.fixture
def client(service: AsyncMock) -> Iterator[TestClient]:
    app.dependency_overrides[get_example_sentence_generation_service] = (
        lambda: service
    )
    yield TestClient(app)
    app.dependency_overrides.clear()


def test_examples_returns_service_result(client, service):
    response = client.post("/api/v1/example-sentences", json=PAYLOAD)

    assert response.status_code == 200
    assert response.json() == RESPONSE
    service.generate.assert_awaited_once_with(ExampleSentenceRequest(**PAYLOAD))


@pytest.mark.parametrize(
    "payload",
    [
        {"germanText": ""},
        {"germanText": "   "},
        {"germanText": "123"},
        {"germanText": "a" * 201},
        {"germanText": 5},
        {},
    ],
)
def test_examples_rejects_invalid_requests(client, service, payload):
    response = client.post("/api/v1/example-sentences", json=payload)

    assert response.status_code == 422
    service.generate.assert_not_awaited()


@pytest.mark.parametrize(
    ("error", "status_code"),
    [
        (ExampleSentenceGenerationTimeoutError("provider secret"), 504),
        (ExampleSentenceGenerationRateLimitError("provider secret"), 429),
        (ExampleSentenceGenerationRefusalError("provider secret"), 422),
        (ExampleSentenceGenerationProviderError("provider secret"), 502),
        (ExampleSentenceGenerationParseError("provider secret"), 502),
    ],
)
def test_examples_maps_service_errors_to_safe_responses(
    client, service, error, status_code
):
    service.generate.side_effect = error

    response = client.post(
        "/api/v1/example-sentences", json={"germanText": SECRET_TEXT}
    )

    assert response.status_code == status_code
    assert "provider secret" not in response.text
    assert SECRET_TEXT not in response.text


def test_examples_uses_injected_client_and_configured_model():
    parse = AsyncMock(
        return_value=SimpleNamespace(
            output_parsed=GeneratedExampleSentences(
                sentences=[ExampleSentenceItem(**s) for s in RESPONSE["sentences"]]
            ),
            output=[],
        )
    )
    openai_client = MagicMock()
    openai_client.responses.parse = parse
    app.dependency_overrides[get_openai_client] = lambda: openai_client
    app.dependency_overrides[get_settings] = lambda: Settings(
        openai_api_key="test-key", openai_model="configured-model", _env_file=None
    )

    try:
        response = TestClient(app).post("/api/v1/example-sentences", json=PAYLOAD)
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json() == RESPONSE
    assert parse.await_args.kwargs["model"] == "configured-model"
