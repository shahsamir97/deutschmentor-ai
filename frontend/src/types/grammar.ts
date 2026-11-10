export interface GrammarExplanationRequest {
  sentences: string[]
}

export interface GrammarPoint {
  explanation: string
  rule_ids: string[]
}

export interface SentenceExplanation {
  sentence: string
  points: GrammarPoint[]
}

export interface GrammarExplanationResponse {
  explanations: SentenceExplanation[]
}

export type GrammarExplanationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; explanations: SentenceExplanation[] }
  | { status: 'error'; message: string }
