import { useId } from 'react'

import type { SpeechController } from '../hooks/useSpeech'
import { SpeakerButton } from './SpeakerButton'
import {
  EXAMPLE_SENTENCE_COUNT,
  MAX_GERMAN_TEXT_LENGTH,
  type ExampleSentencesState,
} from '../types/translation'

interface ExampleSentencesProps {
  germanText: string
  state: ExampleSentencesState
  speech: SpeechController
  onGenerate: () => void
}

export function ExampleSentences({
  germanText,
  state,
  speech,
  onGenerate,
}: ExampleSentencesProps) {
  const hintId = useId()
  const isLoading = state.status === 'loading'
  const isTooLong = germanText.length > MAX_GERMAN_TEXT_LENGTH
  const showButton = state.status !== 'success'

  return (
    <section
      aria-busy={isLoading}
      aria-label="Example sentences"
      className="mt-4 rounded-xl bg-slate-50 p-4"
    >
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          German examples
        </h3>
        {showButton && (
          <button
            aria-describedby={isTooLong ? hintId : undefined}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-emerald-800 bg-white px-4 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading || isTooLong}
            onClick={onGenerate}
            type="button"
          >
            {isLoading ? (
              <>
                <span
                  aria-hidden="true"
                  className="size-4 animate-spin rounded-full border-2 border-emerald-800/30 border-t-emerald-800"
                />
                Generating examples
              </>
            ) : (
              `Generate ${EXAMPLE_SENTENCE_COUNT} Examples`
            )}
          </button>
        )}
      </div>

      {isTooLong && (
        <p className="mt-2 text-xs text-slate-500" id={hintId}>
          Examples are available for German text up to{' '}
          {MAX_GERMAN_TEXT_LENGTH} characters.
        </p>
      )}

      <div aria-live="polite" role="status">
        {isLoading && (
          <p className="mt-3 text-sm text-slate-600">
            Generating example sentences…
          </p>
        )}
        {state.status === 'success' && (
          <>
            <p className="sr-only">
              {state.sentences.length} example sentences generated.
            </p>
            <ol className="mt-3 space-y-3">
              {state.sentences.map((sentence, index) => (
                <li
                  className="rounded-lg border border-slate-200 bg-white p-3"
                  key={sentence.german}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-base leading-7 text-slate-800" lang="de">
                      {sentence.german}
                    </p>
                    <SpeakerButton
                      id={`example-${index}`}
                      speech={speech}
                      text={sentence.german}
                    />
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-500" lang="en">
                    {sentence.translation}
                  </p>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>

      {state.status === 'error' && (
        <p
          className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {state.message}
        </p>
      )}
    </section>
  )
}
