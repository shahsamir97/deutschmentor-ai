import asyncio
import json
from pathlib import Path

from sqlalchemy import select

from app.core.config import get_settings
from app.db.database import SessionLocal
from app.db.models.grammar_rule import GrammarRule
from app.schemas.grammar_rule_input import GrammarRuleInput
from app.services.embedding_service import EmbeddingService

DATA_PATH = Path(__file__).resolve().parents[2] / "data" / "grammar_rules.json"


async def main():
    data = json.loads(DATA_PATH.read_text())

    async with SessionLocal() as session:
        for item in data:
            rule = GrammarRuleInput.model_validate(item)
            await session.merge(GrammarRule(**rule.model_dump()))
        await session.commit()

    embedding_service = EmbeddingService()
    settings = get_settings()

    async with SessionLocal() as session:
        result = await session.execute(
            select(GrammarRule).where(GrammarRule.embedding.is_(None))
        )
        for rule in result.scalars().all():
            text_to_embed = f"{rule.title}\n{rule.topic}\n{rule.content}"
            rule.embedding = await embedding_service.embed_text(text_to_embed)
            rule.embedding_model = settings.embedding_model
        await session.commit()


if __name__ == "__main__":
    asyncio.run(main())
    print("Ingestion complete.")