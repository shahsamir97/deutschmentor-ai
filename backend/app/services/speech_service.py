import asyncio
import logging
import time
from collections import OrderedDict, deque

from google.api_core import exceptions as google_exceptions
from google.auth import exceptions as auth_exceptions
from google.cloud import texttospeech

from app.schemas.speech import SpeechRequest

logger = logging.getLogger(__name__)

LANGUAGE_CODE = "de-DE"
VOICE_NAME = "de-DE-Neural2-G"


class SpeechError(Exception):
    """Base class for speech failures safe to surface to callers."""


class SpeechTimeoutError(SpeechError):
    pass


class SpeechRateLimitError(SpeechError):
    pass


class SpeechProviderError(SpeechError):
    pass


class SpeechService:
    """Synthesizes German MP3 audio with a bounded in-memory cache.

    The Google client is created lazily (Application Default Credentials)
    and reused until close() is called. Only successful results are cached.
    """

    def __init__(
        self,
        timeout_seconds: float = 10.0,
        cache_max_entries: int = 128,
        client: texttospeech.TextToSpeechAsyncClient | None = None,
    ) -> None:
        self.timeout_seconds = timeout_seconds
        self.cache_max_entries = cache_max_entries
        self._client = client
        self._cache: OrderedDict[tuple[str, str, float], bytes] = OrderedDict()

    def _get_client(self) -> texttospeech.TextToSpeechAsyncClient:
        if self._client is None:
            self._client = texttospeech.TextToSpeechAsyncClient()
        return self._client

    async def synthesize(self, request: SpeechRequest) -> bytes:
        key = (request.text, VOICE_NAME, request.speakingRate)
        cached = self._cache.get(key)
        if cached is not None:
            self._cache.move_to_end(key)
            return cached

        try:
            async with asyncio.timeout(self.timeout_seconds):
                response = await self._get_client().synthesize_speech(
                    input=texttospeech.SynthesisInput(text=request.text),
                    voice=texttospeech.VoiceSelectionParams(
                        language_code=LANGUAGE_CODE, name=VOICE_NAME
                    ),
                    audio_config=texttospeech.AudioConfig(
                        audio_encoding=texttospeech.AudioEncoding.MP3,
                        speaking_rate=request.speakingRate,
                    ),
                    timeout=self.timeout_seconds,
                )
        except (TimeoutError, google_exceptions.DeadlineExceeded) as exc:
            logger.warning("Speech synthesis timed out")
            raise SpeechTimeoutError from exc
        except google_exceptions.ResourceExhausted as exc:
            logger.warning("Speech provider quota exhausted")
            raise SpeechRateLimitError from exc
        except (
            google_exceptions.GoogleAPICallError,
            google_exceptions.RetryError,
            auth_exceptions.GoogleAuthError,
        ) as exc:
            logger.error("Speech provider error: %s", type(exc).__name__)
            raise SpeechProviderError from exc

        audio = response.audio_content
        if not audio:
            logger.error("Speech provider returned empty audio")
            raise SpeechProviderError

        self._cache[key] = audio
        while len(self._cache) > self.cache_max_entries:
            self._cache.popitem(last=False)
        return audio

    async def close(self) -> None:
        if self._client is not None:
            await self._client.transport.close()
            self._client = None


class RateLimiter:
    """Per-client sliding-window limiter held in process memory.

    State is per process: with several replicas the effective limit is
    multiplied by the replica count and resets on restart. Use an ingress
    or shared-store limiter for strict enforcement.
    """

    MAX_TRACKED_CLIENTS = 10_000

    def __init__(self, max_requests: int, window_seconds: float) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._hits: dict[str, deque[float]] = {}

    def allow(self, client_id: str) -> bool:
        now = time.monotonic()
        cutoff = now - self.window_seconds
        if len(self._hits) >= self.MAX_TRACKED_CLIENTS:
            self._hits = {
                key: hits
                for key, hits in self._hits.items()
                if hits and hits[-1] > cutoff
            }
        hits = self._hits.setdefault(client_id, deque())
        while hits and hits[0] <= cutoff:
            hits.popleft()
        if len(hits) >= self.max_requests:
            return False
        hits.append(now)
        return True
