import { useState } from 'react'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { TranslationForm } from './components/TranslationForm'
import { TranslationResult } from './components/TranslationResult'
import { getTranslationExamples, translateText } from './services/api'
import type {
  TranslationDirection,
  TranslationResponse,
} from './types/translation'

function App() {
  const [direction, setDirection] = useState<TranslationDirection>('de-en')
  const [result, setResult] = useState<TranslationResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleTranslate(text: string) {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await translateText({ text, direction })
      setResult(response)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Translation failed. Please try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  function handleDirectionChange(nextDirection: TranslationDirection) {
    setDirection(nextDirection)
    setResult(null)
    setError(null)
  }

  const sourceLanguage = direction === 'de-en' ? 'German' : 'English'
  const targetLanguage = direction === 'de-en' ? 'English' : 'German'
  const examples = getTranslationExamples(direction)

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#f7f8fa] text-slate-900">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-100/70 via-[#f7f8fa] to-[#f7f8fa]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 sm:px-8">
        <header className="flex items-center justify-between py-6">
          <a
            className="flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700"
            href="/"
            aria-label="DeutschMentor home"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-800 text-sm font-bold tracking-tight text-white shadow-sm">
              DM
            </span>
            <span className="text-base font-semibold tracking-tight">
              DeutschMentor
              <span className="ml-1 font-normal text-slate-500">AI</span>
            </span>
          </a>
          <span className="hidden items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-600 sm:inline-flex">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Your language companion
          </span>
        </header>

        <section className="mx-auto mt-10 w-full max-w-3xl flex-1 pb-12 sm:mt-16">
          <div className="mb-9 text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
              A clearer way to communicate
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Find the right words.
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
              Explore sample translations between German and English. Try the
              examples below to preview the experience.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_18px_60px_-32px_rgba(15,23,42,0.28)] sm:p-7">
            <div className="mb-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Translation
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {sourceLanguage} to {targetLanguage}
                </p>
              </div>
              <LanguageSwitcher
                direction={direction}
                disabled={isLoading}
                onDirectionChange={handleDirectionChange}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <TranslationForm
                key={direction}
                direction={direction}
                examples={examples}
                isLoading={isLoading}
                error={error}
                onTranslate={handleTranslate}
              />
              <TranslationResult
                direction={direction}
                response={result}
                isLoading={isLoading}
              />
            </div>
          </div>

          <p className="mt-5 text-center text-xs leading-5 text-slate-500">
            Demo mode: sample phrases only. Custom translations aren&apos;t
            connected yet.
          </p>
        </section>

        <footer className="border-t border-slate-200/80 py-5 text-center text-xs text-slate-500">
          DeutschMentor AI <span aria-hidden="true">·</span> Built for better
          conversations
        </footer>
      </div>
    </main>
  )
}

export default App
