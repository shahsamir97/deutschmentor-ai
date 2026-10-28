import type {
  TranslationDirection,
  TranslationRequest,
  TranslationResponse,
} from '../types/translation'

export interface TranslationExample {
  label: string
  text: string
}

interface DemoTranslation {
  direction: TranslationDirection
  label: string
  sourceText: string
  translatedText: string
}

const demoTranslations: DemoTranslation[] = [
  {
    direction: 'de-en',
    label: 'A friendly greeting',
    sourceText: 'Guten Morgen! Wie geht es dir?',
    translatedText: 'Good morning! How are you?',
  },
  {
    direction: 'de-en',
    label: 'Learning German',
    sourceText: 'Ich lerne Deutsch, weil ich in Berlin arbeiten möchte.',
    translatedText: "I'm learning German because I want to work in Berlin.",
  },
  {
    direction: 'en-de',
    label: 'A friendly greeting',
    sourceText: 'Good morning! How are you?',
    translatedText: 'Guten Morgen! Wie geht es dir?',
  },
  {
    direction: 'en-de',
    label: 'Learning German',
    sourceText: "I'm learning German because I want to work in Berlin.",
    translatedText: 'Ich lerne Deutsch, weil ich in Berlin arbeiten möchte.',
  },
]

export function getTranslationExamples(
  direction: TranslationDirection,
): TranslationExample[] {
  return demoTranslations
    .filter((example) => example.direction === direction)
    .map(({ label, sourceText }) => ({ label, text: sourceText }))
}

export async function translateText(
  request: TranslationRequest,
): Promise<TranslationResponse> {
  await new Promise((resolve) => setTimeout(resolve, 250))

  const normalizedText = request.text.trim().toLocaleLowerCase()
  const match = demoTranslations.find(
    (example) =>
      example.direction === request.direction &&
      example.sourceText.toLocaleLowerCase() === normalizedText,
  )

  if (!match) {
    throw new Error(
      'Demo mode only translates the sample phrases. Choose an example below to try the interface.',
    )
  }

  return {
    translatedText: match.translatedText,
    germanText:
      request.direction === 'de-en' ? request.text : match.translatedText,
    correction: null,
  }
}
