from langchain_openai import OpenAIEmbeddings

from app.core.config import get_settings


class EmbeddingService:
    def __init__(self):
        self.model = OpenAIEmbeddings(
            model=get_settings().embedding_model,
            api_key=get_settings().openai_api_key.get_secret_value(),
        )

    async def embed_text(
            self, text: str
    ) -> list[float]:
        return await self.model.aembed_query(text)