
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.api.translation import router as translation_router

app = FastAPI(
    title="DeutschMentor AI API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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
