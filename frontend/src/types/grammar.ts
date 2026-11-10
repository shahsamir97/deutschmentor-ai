export interface GrammarExplanationRequest {
    sentences: string[];
}

export interface GrammarPoint {
    explanation: string;
    rule_ids: string[];
}

export interface SentenceExplanation {
    sentence: string;
    points: GrammarPoint[];
}

export interface GrammarExplanationResponse {
    explanations: SentenceExplanation[];
}