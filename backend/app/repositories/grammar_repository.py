from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.grammar_rule import GrammarRule

class GrammarRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def search_similar(
            self, 
            embedding: list[float], 
            limit: int = 5,
            max_distance: float = 0.3,
            ) -> list[GrammarRule]:
         distance = GrammarRule.embedding.cosine_distance(embedding)
         
         statement = (
            select(GrammarRule)
            .where(GrammarRule.embedding.is_not(None))
            .where(distance <= max_distance)
            .order_by(distance)
            .limit(limit)
        )
         
         result = await self.session.scalars(statement)
         return list(result.all())
