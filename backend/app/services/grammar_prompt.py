from app.db.models.grammar_rule import GrammarRule

def build_grammar_prompt(
        sentence: str,
        rules: list[GrammarRule]
) -> str:
    context = "\n\n".join(
        f"Rule ID: {rule.id}\n"
        f"Title: {rule.title}\n"
        f"Content: {rule.content}\n"
        for rule in rules
    )

    return (
        f"German sentence:\n{sentence}\n\n"
        f"Retrieved grammar rules:\n{context}"
    )