import { useId } from 'react'

import type {
  TranslationDirection,
  TranslationResponse,
} from '../types/translation'

interface TranslationResultProps {
  direction: TranslationDirection
  response: TranslationResponse | null
  isLoading: boolean
  onApplySuggestion: (suggestion: string) => void
}

export function TranslationResult({
  direction,
  response,
  isLoading,
  onApplySuggestion,
}: TranslationResultProps) {
  const targetLanguage = direction === 'de-en' ? 'English' : 'German'
  const suggestionHintId = useId()

  return (
    <section
      aria-busy={isLoading}
      aria-label="Translation result"
      aria-live="polite"
      className="flex min-h-[290px] flex-col rounded-xl bg-slate-50 p-4"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {targetLanguage} translation
        </h3>
      </div>

      {response ? (
        <div className="flex-1">
          <p className="whitespace-pre-wrap text-base leading-7 text-slate-800">
            {response.translatedText}
          </p>
          {response.correction?.hasError && (
            <aside className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-900">
                German language note
              </p>
              {response.correction.suggestion && (
                <>
                  <button
                    aria-describedby={suggestionHintId}
                    className="mt-2 w-full rounded-md border border-amber-300 bg-white px-3 py-2 text-left text-sm font-medium text-slate-800 transition hover:border-emerald-700 hover:text-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isLoading}
                    onClick={() =>
                      onApplySuggestion(response.correction?.suggestion ?? '')
                    }
                    type="button"
                  >
                    {response.correction.suggestion}
                  </button>
                  <p
                    className="mt-1 text-xs text-slate-500"
                    id={suggestionHintId}
                  >
                    Select the suggestion to use it as your input text.
                  </p>
                </>
              )}
              {response.correction.explanation && (
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {response.correction.explanation}
                </p>
              )}
            </aside>
          )}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center px-3 py-8 text-center">
          {isLoading ? (
            <>
              <span
                aria-hidden="true"
                className="mb-3 size-6 animate-spin rounded-full border-2 border-emerald-800/20 border-t-emerald-800"
              />
              <p className="text-sm font-medium text-slate-700">
                Preparing your translation
              </p>
            </>
          ) : (
            <>
              <span
                aria-hidden="true"
                className="mb-3 grid size-10 place-items-center rounded-full bg-white text-lg text-emerald-800 shadow-sm"
              >
                Aa
              </span>
              <p className="text-sm font-medium text-slate-700">
                Your translation will appear here
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Enter text on the left to get started.
              </p>
            </>
          )}
        </div>
      )}
    </section>
  )
}
