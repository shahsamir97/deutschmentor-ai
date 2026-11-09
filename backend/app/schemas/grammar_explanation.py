from pydantic import BaseModel, Field


class GrammarExplanationRequest(BaseModel):
    sentence: list[str] = Field(
        min_length=2,
        max_length=2,
    )

class GrammarPoint(BaseModel):
    explanation: str
    rule_ids: list[str]

class SentenceExplanation(BaseModel):
    sentence: str
    points: list[GrammarPoint]

class GrammarExplanationResponse(BaseModel):
    explanations: list[SentenceExplanation]