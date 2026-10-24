import { useState, type SubmitEvent } from 'react'
import type { TranslationDirection } from '../types/translation'

interface TranslationExample {
  text: string
  label: string
}

interface TranslationFormProps {
  direction: TranslationDirection
  examples: TranslationExample[]
  isLoading: boolean
  error: string | null
  onTranslate: (text: string) => void
}

const MAX_TEXT_LENGTH = 5000

export function TranslationForm({
  direction,
  examples,
  isLoading,
  error,
  onTranslate,
}: TranslationFormProps) {
  const [text, setText] = useState(examples[0]?.text ?? '')

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (text.trim()) {
      onTranslate(text.trim())
    }
  }

  const sourceLanguage = direction === 'de-en' ? 'German' : 'English'
  const placeholder =
    direction === 'de-en'
      ? 'Schreib oder füge deinen Text hier ein …'
      : 'Type or paste your text here …'

  return (
    <form className="flex min-h-[290px] flex-col" onSubmit={handleSubmit}>
      <label
        className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500"
        htmlFor="sourceText"
      >
        {sourceLanguage} text
      </label>
      <textarea
        className="min-h-40 flex-1 resize-y rounded-xl border border-slate-200 bg-white p-4 text-base leading-7 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 disabled:bg-slate-50"
        disabled={isLoading}
        id="sourceText"
        maxLength={MAX_TEXT_LENGTH}
        name="sourceText"
        onChange={(event) => setText(event.target.value)}
        placeholder={placeholder}
        required
        value={text}
      />
      <div className="mt-3">
        <p className="mb-2 text-xs font-medium text-slate-500">
          Try a sample
        </p>
        <div className="flex flex-wrap gap-2">
          {examples.map((example) => (
            <button
              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 transition hover:border-emerald-700 hover:text-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
              key={example.text}
              onClick={() => setText(example.text)}
              type="button"
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          Up to {MAX_TEXT_LENGTH.toLocaleString()} characters
        </p>
        <button
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-800 px-5 text-sm font-semibold text-white transition hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? (
            <>
              <span
                aria-hidden="true"
                className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              />
              Translating
            </>
          ) : (
            <>
              Translate
              <span aria-hidden="true">→</span>
            </>
          )}
        </button>
      </div>
      {error && (
        <p
          className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      )}
    </form>
  )
}
