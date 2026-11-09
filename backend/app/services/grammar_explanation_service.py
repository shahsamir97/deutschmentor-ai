from openai import AsyncOpenAI

from app.services.grammar_retriever import GrammarRetriever


class GrammarExplanationService:
    def __init__(
            self,
            retriever: GrammarRetriever,
            client: AsyncOpenAI,
            model: str
    ):
        self.retriever = retriever
        self.client = client
        self.model = model