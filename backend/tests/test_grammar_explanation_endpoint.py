from collections.abc import Iterator
from unittest.mock import AsyncMock

import pytest
from fastapi.testclient import TestClient

from app.api.dependencies import get_grammar_explanation_service
from app.main import app
from app.schemas.grammar_explanation import (
    GrammarExplanationRequest,
    GrammarExplanationResponse,
    GrammarPoint,
    SentenceExplanation,
)
from app.services.grammar_explanation_service import GrammarExplanationService

URL = "/api/v1/grammar/grammar_explanation"
PAYLOAD = {
    "sentences": [
        "Ich fahre mit dem Bus.",
        "Der Bus kommt um acht Uhr.",
    ]
}


@pytest.fixture
def service() -> AsyncMock:
    mock = AsyncMock(spec=GrammarExplanationService)
    mock.explain.return_value = GrammarExplanationResponse(
        explanations=[
            SentenceExplanation(
                sentence=PAYLOAD["sentences"][0],
                points=[
                    GrammarPoint(
                        explanation="mit takes the dative case.",
                        rule_ids=["grammar-dative-mit"],
                    )
                ],
            ),
            SentenceExplanation(sentence=PAYLOAD["sentences"][1], points=[]),
        ]
    )
    return mock


@pytest.fixture
def client(service: AsyncMock) -> Iterator[TestClient]:
    app.dependency_overrides[get_grammar_explanation_service] = lambda: service
    yield TestClient(app)
    app.dependency_overrides.clear()


def test_grammar_explanation_returns_service_result(client, service):
    response = client.post(URL, json=PAYLOAD)

    assert response.status_code == 200
    assert response.json()["explanations"][0]["points"][0]["rule_ids"] == [
        "grammar-dative-mit"
    ]
    service.explain.assert_awaited_once_with(
        GrammarExplanationRequest(**PAYLOAD)
    )


def test_grammar_explanation_requires_exactly_two_sentences(client):
    response = client.post(URL, json={"sentences": ["Nur ein Satz."]})

    assert response.status_code == 422
