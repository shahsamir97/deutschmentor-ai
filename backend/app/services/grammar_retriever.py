from app.services.embedding_service import EmbeddingService
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.grammar_repository import GrammarRepository


class GrammarRetriever:
    def __init__(self, session: AsyncSession, embeddings: EmbeddingService):
        self.repository = GrammarRepository(session)
        self.embeddings = embeddings

    async def retrieve(self, sentence: str):
        query_vector = await self.embeddings.embed_text(sentence)

        return await self.repository.search_similar(query_vector, limit=3)