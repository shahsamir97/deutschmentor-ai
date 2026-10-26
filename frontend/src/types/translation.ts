
export type TranslationDirection =
  | "de-en"
  | "en-de";

export const MAX_TRANSLATION_TEXT_LENGTH = 1000;

export interface TranslationRequest {
  text: string;
  direction: TranslationDirection;
}

export interface Correction {
  hasError: boolean;
  suggestion: string | null;
  explanation: string | null;
}

export interface TranslationResponse {
  originalText: string;
  translatedText: string;
  germanText: string;
  correction: Correction | null;
}
