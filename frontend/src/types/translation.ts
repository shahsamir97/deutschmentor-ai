
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
  translatedText: string;
  germanText: string;
  correction: Correction | null;
}

export const MAX_GERMAN_TEXT_LENGTH = 200;
export const EXAMPLE_SENTENCE_COUNT = 2;

export interface ExampleSentenceRequest {
  germanText: string;
}

export interface ExampleSentenceItem {
  german: string;
  translation: string;
}

export interface ExampleSentenceResponse {
  germanText: string;
  sentences: ExampleSentenceItem[];
}

export type ExampleSentencesState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; sentences: ExampleSentenceItem[] }
  | { status: "error"; message: string };

export type TranslationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; response: TranslationResponse }
  | { status: "error"; message: string };

export const MAX_SPEECH_TEXT_LENGTH = 500;

export type SpeakingRate = 1.0 | 0.85;

export interface SpeechRequest {
  text: string;
  speakingRate: SpeakingRate;
}
