import os

os.environ["OPENAI_API_KEY"] = "test-key"
os.environ["OPENAI_MODEL"] = "test-model"
os.environ["DATABASE_URL"] = "postgresql+asyncpg://localhost/test"
os.environ["EMBEDDING_MODEL"] = "test-embedding-model"
