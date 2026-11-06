from pydantic import BaseModel, Field

class GrammarRuleInput(BaseModel):
    id: str
    topic: str
    level: str
    title: str
    content: str
    source: str