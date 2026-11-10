import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

from app.services.grammar_retriever import GrammarRetriever


def test_retrieve_uses_embedding_to_search_for_similar_rules():
    sentence = "Das Buch liegt auf dem Tisch."
    vector = [0.1, 0.2]
    rules = [object()]
    session = MagicMock()
    embeddings = MagicMock()
    embeddings.embed_text = AsyncMock(return_value=vector)
    repository = MagicMock()
    repository.search_similar = AsyncMock(return_value=rules)

    with patch(
        "app.services.grammar_retriever.GrammarRepository", return_value=repository
    ) as repository_class:
        retriever = GrammarRetriever(session, embeddings)
        result = asyncio.run(retriever.retrieve(sentence))

    repository_class.assert_called_once_with(session)
    embeddings.embed_text.assert_awaited_once_with(sentence)
    repository.search_similar.assert_awaited_once_with(vector, limit=3)
    assert result == rules