import {
  EXAMPLE_SENTENCE_COUNT,
  type Correction,
  type ExampleSentenceItem,
  type ExampleSentenceRequest,
  type ExampleSentenceResponse,
  type SpeechRequest,
  type TranslationDirection,
  type TranslationRequest,
  type TranslationResponse,
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

export class ExampleSentencesApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ExampleSentencesApiError'
  }
}

export const EXAMPLES_GENERIC_ERROR_MESSAGE =
  'Could not generate examples. Please try again.'

const EXAMPLES_HTTP_ERROR_MESSAGES: Record<number, string> = {
  422: 'Examples cannot be generated for this text.',
  429: 'Too many example requests. Please try again shortly.',
  502: 'The example service is currently unavailable.',
  504: 'The example service timed out. Please try again.',
}

export class SpeechApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SpeechApiError'
  }
}

export const SPEECH_GENERIC_ERROR_MESSAGE =
  'Could not play audio. Please try again.'

const SPEECH_HTTP_ERROR_MESSAGES: Record<number, string> = {
  422: 'This text cannot be read aloud.',
  429: 'Too many audio requests. Please try again shortly.',
  502: 'The audio service is currently unavailable.',
  504: 'The audio service timed out. Please try again.',
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

function isExampleSentenceItem(value: unknown): value is ExampleSentenceItem {
  return (
    isRecord(value) &&
    typeof value.german === 'string' &&
    typeof value.translation === 'string'
  )
}

function isExampleSentenceResponse(
  value: unknown,
): value is ExampleSentenceResponse {
  return (
    isRecord(value) &&
    typeof value.germanText === 'string' &&
    Array.isArray(value.sentences) &&
    value.sentences.length === EXAMPLE_SENTENCE_COUNT &&
    value.sentences.every(isExampleSentenceItem)
  )
}

interface PostJsonOptions<TResponse> {
  path: string
  body: unknown
  signal?: AbortSignal
  httpErrorMessages: Record<number, string>
  genericMessage: string
  unreachableMessage: string
  isValidResponse: (value: unknown) => value is TResponse
  createError: (message: string) => Error
}

async function postJson<TResponse>({
  path,
  body,
  signal,
  httpErrorMessages,
  genericMessage,
  unreachableMessage,
  isValidResponse,
  createError,
}: PostJsonOptions<TResponse>): Promise<TResponse> {
  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      signal,
    })
  } catch (error) {
    if (signal?.aborted) {
      throw error
    }
    throw createError(unreachableMessage)
  }

  if (!response.ok) {
    throw createError(httpErrorMessages[response.status] ?? genericMessage)
  }

  let data: unknown
  try {
    data = await response.json()
  } catch (error) {
    if (signal?.aborted) {
      throw error
    }
    throw createError(genericMessage)
  }

  if (!isValidResponse(data)) {
    throw createError(genericMessage)
  }

  return data
}

export function translateText(
  request: TranslationRequest,
  signal?: AbortSignal,
): Promise<TranslationResponse> {
  return postJson({
    path: '/api/v1/translate',
    body: request,
    signal,
    httpErrorMessages: HTTP_ERROR_MESSAGES,
    genericMessage: GENERIC_ERROR_MESSAGE,
    unreachableMessage:
      'Could not reach the translation service. Check your connection and try again.',
    isValidResponse: isTranslationResponse,
    createError: (message) => new TranslationApiError(message),
  })
}

export function generateExampleSentences(
  request: ExampleSentenceRequest,
  signal?: AbortSignal,
): Promise<ExampleSentenceResponse> {
  return postJson({
    path: '/api/v1/example-sentences',
    body: request,
    signal,
    httpErrorMessages: EXAMPLES_HTTP_ERROR_MESSAGES,
    genericMessage: EXAMPLES_GENERIC_ERROR_MESSAGE,
    unreachableMessage:
      'Could not reach the example service. Check your connection and try again.',
    isValidResponse: isExampleSentenceResponse,
    createError: (message) => new ExampleSentencesApiError(message),
  })
}

export async function fetchSpeechAudio(
  request: SpeechRequest,
  signal?: AbortSignal,
): Promise<Blob> {
  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}/api/v1/speech`, {
      body: JSON.stringify(request),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      signal,
    })
  } catch (error) {
    if (signal?.aborted) {
      throw error
    }
    throw new SpeechApiError(
      'Could not reach the audio service. Check your connection and try again.',
    )
  }

  if (!response.ok) {
    throw new SpeechApiError(
      SPEECH_HTTP_ERROR_MESSAGES[response.status] ??
        SPEECH_GENERIC_ERROR_MESSAGE,
    )
  }

  const contentType = response.headers.get('Content-Type') ?? ''
  if (!contentType.startsWith('audio/mpeg')) {
    throw new SpeechApiError(SPEECH_GENERIC_ERROR_MESSAGE)
  }

  try {
    return await response.blob()
  } catch (error) {
    if (signal?.aborted) {
      throw error
    }
    throw new SpeechApiError(SPEECH_GENERIC_ERROR_MESSAGE)
  }
}
