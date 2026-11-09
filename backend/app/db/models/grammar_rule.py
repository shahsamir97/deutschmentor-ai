from pgvector.sqlalchemy import VECTOR
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class GrammarRule(Base):
    __tablename__ = "grammar_rules"

    id: Mapped[str] = mapped_column(
        String(100),
        primary_key=True
    )

    topic: Mapped[str] = mapped_column(String(100))
    level: Mapped[str] = mapped_column(String(10))
    title: Mapped[str] = mapped_column(String(200))
    content: Mapped[str] = mapped_column(Text)
    source: Mapped[str] = mapped_column(Text)

    embedding_model: Mapped[str | None] = mapped_column(
    String(100),
    nullable=True,
    )

    embedding: Mapped[list[float] | None] = mapped_column(
    VECTOR(1536),
    nullable=True,
    )