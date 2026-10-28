from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.dependencies import create_openai_client
from app.api.example_sentences import router as example_sentence_router
from app.api.health import router as health_router
from app.api.translation import router as translation_router
from app.core.config import get_settings

DEVELOPMENT_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    client = create_openai_client(get_settings())
    app.state.openai_client = client
    try:
        yield
    finally:
        await client.close()


app = FastAPI(
    title="DeutschMentor AI API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=DEVELOPMENT_CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.include_router(
    health_router,
    prefix="/api/v1",
)
app.include_router(
    translation_router,
    prefix="/api/v1",
)
app.include_router(
    example_sentence_router,
    prefix="/api/v1",
)
