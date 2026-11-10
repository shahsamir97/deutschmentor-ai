from pydantic import BaseModel, Field, field_validator

class GrammarExplanationRequest(BaseModel):
    sentences: list[str] = Field(
        min_items=2,
        max_items=2,
    )

    @field_validator("sentences")
    @classmethod
    def validate_sentences(
        cls,
        sentences: list[str],
    ) -> list[str]:
        for sentence in sentences:
            if not sentence.strip():
                raise ValueError("Sentences cannot be empty or whitespace")

            if len(sentence) > 300:
                raise ValueError("Sentences cannot be longer than 300 characters")

        return sentences

class GrammarPoint(BaseModel):
    explanation: str
    rule_ids: list[str]

class SentenceExplanation(BaseModel):
    sentence: str
    points: list[GrammarPoint]

class GrammarExplanationResponse(BaseModel):
    explanations: list[SentenceExplanation]