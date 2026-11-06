
import asyncio

from app.services.embedding_service import EmbeddingService


async def main():
    service = EmbeddingService()

    embedding = await service.embed_text(
        "The preposition mit requires Dativ."
    )

    print("Dimensions:", len(embedding))


asyncio.run(main())
