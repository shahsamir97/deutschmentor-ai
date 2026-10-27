# Environment Variables

Backend settings are read from the environment or a `backend/.env` file
(never commit real values).

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes | – | OpenAI API key. Store it as a secret in deployments. |
| `OPENAI_MODEL` | Yes | – | Model used by the translation service (must support Structured Outputs). |
| `OPENAI_TIMEOUT_SECONDS` | No | `30` | Read/write timeout for OpenAI requests. The connect timeout is fixed at 5 seconds. |
| `OPENAI_MAX_RETRIES` | No | `2` | SDK retries for transient failures (connection errors, 429, 5xx). Range 0-5. |

## Translation API errors

`POST /api/v1/translate` returns `504` on provider timeout, `429` when
rate limited, and `502` for other provider failures or unparseable
model output.
