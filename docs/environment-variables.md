# Environment Variables

Backend settings are read from the environment or a `backend/.env` file
(never commit real values).

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes | – | OpenAI API key. Store it as a secret in deployments. |
| `OPENAI_MODEL` | Yes | – | Model used by the translation and example sentence generation services (must support Structured Outputs). |
| `OPENAI_TIMEOUT_SECONDS` | No | `30` | Read/write timeout for OpenAI requests. The connect timeout is fixed at 5 seconds. |
| `OPENAI_MAX_RETRIES` | No | `2` | SDK retries for transient failures (connection errors, 429, 5xx). Range 0-5. |

## Translation API errors

`POST /api/v1/translate` returns `504` on provider timeout, `429` when
rate limited, and `502` for other provider failures or unparseable
model output.

## Example sentence generation API

`POST /api/v1/example-sentences` accepts `{"germanText": "..."}` (1-200
characters after trimming, at least one letter, no control characters)
and returns the text with exactly two A1-A2 German example sentences and
their English translations. It reuses the OpenAI settings above and has
no additional configuration.

Errors: `422` for invalid input or when the model refuses to generate
examples, `504` on provider timeout, `429` when rate limited, and `502`
for other provider failures or unparseable model output. Error
responses never include provider messages.

## Speech (text-to-speech) API

`POST /api/v1/speech` accepts `{"text": "...", "speakingRate": 1.0}`
(1-500 characters after trimming, at least one letter, no control
characters; `speakingRate` is `1.0` or `0.85`) and returns `audio/mpeg`.
The language (`de-DE`) and voice (`de-DE-Neural2-G`) are fixed on the
server and cannot be chosen by the client.

Google Cloud Text-to-Speech authenticates with Application Default
Credentials (for example `GOOGLE_APPLICATION_CREDENTIALS` pointing at a
mounted service account key, or workload identity on Kubernetes). No
credentials belong in the repository.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SPEECH_TIMEOUT_SECONDS` | No | `10` | Timeout for a Google synthesis call. |
| `SPEECH_CACHE_MAX_ENTRIES` | No | `128` | Maximum cached audio clips (LRU, in memory, per process). `0` disables caching. Failures are never cached. |
| `SPEECH_RATE_LIMIT_REQUESTS` | No | `20` | Requests allowed per client within the window. |
| `SPEECH_RATE_LIMIT_WINDOW_SECONDS` | No | `60` | Rate limit window. |

Limitations: the rate limiter and cache live in process memory. With
several replicas (for example on Kubernetes) each replica enforces its
own limit and cache, so the effective limit is multiplied by the replica
count and resets on restart. Clients are identified by the direct peer
address, so behind an ingress/proxy all users may share one address
unless the server is configured to trust forwarded headers; enforce
strict limits at the ingress or with a shared store.

Errors: `422` for invalid input, `429` when the client or provider quota
is exceeded, `504` on provider timeout, and `502` for other provider or
credential failures. Error responses never include provider messages or
the submitted text.
