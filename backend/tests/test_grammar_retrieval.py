import asyncio

from app.db.database import SessionLocal
from app.services.embedding_service import EmbeddingService
from app.services.grammar_retriever import GrammarRetriever


async def main():
    async with SessionLocal() as session:
        retriever = GrammarRetriever(session, EmbeddingService())

        rules = await retriever.retrieve("Das Buch liegt auf dem Tisch.")

        for rule in rules:
            print(rule.id, rule.title)

asyncio.run(main())