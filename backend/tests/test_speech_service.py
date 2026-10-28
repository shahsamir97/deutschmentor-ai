import asyncio
import functools
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest
from google.api_core import exceptions as google_exceptions
from google.auth import exceptions as auth_exceptions
from google.cloud import texttospeech

from app.schemas.speech import SpeechRequest
from app.services.speech_service import (
    RateLimiter,
    SpeechProviderError,
    SpeechRateLimitError,
    SpeechService,
    SpeechTimeoutError,
)

SECRET_TEXT = "Geheimwort"


def run_async(test):
    @functools.wraps(test)
    def wrapper(*args, **kwargs):
        return asyncio.run(test(*args, **kwargs))

    return wrapper


@pytest.fixture
def client() -> MagicMock:
    mock = MagicMock()
    mock.synthesize_speech = AsyncMock(
        return_value=SimpleNamespace(audio_content=b"mp3")
    )
    mock.transport.close = AsyncMock()
    return mock


def request(text: str = "Guten Tag", rate: float = 1.0) -> SpeechRequest:
    return SpeechRequest(text=text, speakingRate=rate)


@run_async
async def test_synthesize_uses_fixed_german_voice_and_mp3(client):
    service = SpeechService(client=client)

    assert await service.synthesize(request(rate=0.85)) == b"mp3"

    kwargs = client.synthesize_speech.await_args.kwargs
    assert kwargs["voice"].language_code == "de-DE"
    assert kwargs["voice"].name == "de-DE-Neural2-G"
    assert kwargs["audio_config"].audio_encoding == (
        texttospeech.AudioEncoding.MP3
    )
    assert kwargs["audio_config"].speaking_rate == 0.85
    assert kwargs["input"].text == "Guten Tag"
    assert kwargs["timeout"] == service.timeout_seconds


@run_async
async def test_cache_hits_on_normalized_text_and_separates_rates(client):
    service = SpeechService(client=client)

    await service.synthesize(request("Guten   Tag"))
    await service.synthesize(request(" Guten Tag "))
    assert client.synthesize_speech.await_count == 1

    await service.synthesize(request("Guten Tag", 0.85))
    assert client.synthesize_speech.await_count == 2


@run_async
async def test_cache_is_bounded(client):
    service = SpeechService(client=client, cache_max_entries=1)

    await service.synthesize(request("Eins"))
    await service.synthesize(request("Zwei"))
    await service.synthesize(request("Eins"))

    assert client.synthesize_speech.await_count == 3


@pytest.mark.parametrize(
    ("error", "expected"),
    [
        (google_exceptions.DeadlineExceeded("x"), SpeechTimeoutError),
        (google_exceptions.ResourceExhausted("x"), SpeechRateLimitError),
        (google_exceptions.InternalServerError("x"), SpeechProviderError),
        (
            auth_exceptions.DefaultCredentialsError("x"),
            SpeechProviderError,
        ),
    ],
)
@run_async
async def test_errors_are_mapped_and_not_cached(client, error, expected):
    client.synthesize_speech.side_effect = error
    service = SpeechService(client=client)

    with pytest.raises(expected):
        await service.synthesize(request())

    client.synthesize_speech.side_effect = None
    assert await service.synthesize(request()) == b"mp3"


@run_async
async def test_empty_audio_is_an_error(client):
    client.synthesize_speech.return_value = SimpleNamespace(audio_content=b"")
    service = SpeechService(client=client)

    with pytest.raises(SpeechProviderError):
        await service.synthesize(request())


@run_async
async def test_errors_do_not_log_text(client, caplog):
    client.synthesize_speech.side_effect = google_exceptions.InternalServerError(
        SECRET_TEXT
    )
    service = SpeechService(client=client)

    with pytest.raises(SpeechProviderError):
        await service.synthesize(request(SECRET_TEXT))

    assert SECRET_TEXT not in caplog.text


@run_async
async def test_close_closes_transport(client):
    service = SpeechService(client=client)

    await service.close()

    client.transport.close.assert_awaited_once()


def test_rate_limiter_blocks_after_limit_per_client():
    limiter = RateLimiter(max_requests=2, window_seconds=60)

    assert limiter.allow("a")
    assert limiter.allow("a")
    assert not limiter.allow("a")
    assert limiter.allow("b")
