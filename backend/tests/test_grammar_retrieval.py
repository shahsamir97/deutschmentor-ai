import asyncio

from app.db.database import SessionLocal
from app.services.embedding_service import EmbeddingService
from app.services.grammar_retriever import GrammarRetriever


async def main():
    print("Retrieving grammar rules for the sentence: 'Ich fahre mit dem Bus'")
    async with SessionLocal() as session:
        retriever = GrammarRetriever(session, EmbeddingService())

        rules = await retriever.retrieve("Ich fahre mit dem Bus")

        for rule in rules:
            print(rule.id, rule.title)

asyncio.run(main())