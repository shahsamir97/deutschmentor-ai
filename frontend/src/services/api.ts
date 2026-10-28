import type {
  Correction,
  TranslationDirection,
  TranslationRequest,
  TranslationResponse,
} from '../types/translation'

export interface TranslationExample {
  label: string
  text: string
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(
  /\/$/,
  '',
)

const translationExamples: Record<TranslationDirection, TranslationExample[]> =
  {
    'de-en': [
      {
        label: 'A friendly greeting',
        text: 'Guten Morgen! Wie geht es dir?',
      },
      {
        label: 'Learning German',
        text: 'Ich lerne Deutsch, weil ich in Berlin arbeiten möchte.',
      },
    ],
    'en-de': [
      {
        label: 'A friendly greeting',
        text: 'Good morning! How are you?',
      },
      {
        label: 'Learning German',
        text: "I'm learning German because I want to work in Berlin.",
      },
    ],
  }

export function getTranslationExamples(
  direction: TranslationDirection,
): TranslationExample[] {
  return translationExamples[direction]
}

export class TranslationApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TranslationApiError'
  }
}

export const GENERIC_ERROR_MESSAGE = 'Translation failed. Please try again.'

const HTTP_ERROR_MESSAGES: Record<number, string> = {
  422: 'Please check your text and try again.',
  429: 'Too many translation requests. Please try again shortly.',
  502: 'The translation service is currently unavailable.',
  504: 'The translation service timed out. Please try again.',
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string'
}

function isCorrection(value: unknown): value is Correction {
  return (
    isRecord(value) &&
    typeof value.hasError === 'boolean' &&
    isNullableString(value.suggestion) &&
    isNullableString(value.explanation)
  )
}

function isTranslationResponse(value: unknown): value is TranslationResponse {
  return (
    isRecord(value) &&
    typeof value.translatedText === 'string' &&
    typeof value.germanText === 'string' &&
    (value.correction === null || isCorrection(value.correction))
  )
}

export async function translateText(
  request: TranslationRequest,
  signal?: AbortSignal,
): Promise<TranslationResponse> {
  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}/api/v1/translate`, {
      body: JSON.stringify(request),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      signal,
    })
  } catch (error) {
    if (signal?.aborted) {
      throw error
    }
    throw new TranslationApiError(
      'Could not reach the translation service. Check your connection and try again.',
    )
  }

  if (!response.ok) {
    throw new TranslationApiError(
      HTTP_ERROR_MESSAGES[response.status] ?? GENERIC_ERROR_MESSAGE,
    )
  }

  let data: unknown
  try {
    data = await response.json()
  } catch (error) {
    if (signal?.aborted) {
      throw error
    }
    throw new TranslationApiError(GENERIC_ERROR_MESSAGE)
  }

  if (!isTranslationResponse(data)) {
    throw new TranslationApiError(GENERIC_ERROR_MESSAGE)
  }

  return data
}
