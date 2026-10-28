import {
  MAX_SPEECH_TEXT_LENGTH,
  type SpeakingRate,
} from '../types/translation'
import type { SpeechController } from '../hooks/useSpeech'

interface SpeakerButtonProps {
  id: string
  text: string
  speech: SpeechController
}

const RATES: { rate: SpeakingRate; label: string; text: string }[] = [
  { rate: 1.0, label: 'Listen in German', text: '🔊' },
  { rate: 0.85, label: 'Listen in German, slowly', text: 'Slow' },
]

const BUTTON_CLASS =
  'inline-flex min-h-9 min-w-9 items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-emerald-900 transition hover:border-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 disabled:cursor-not-allowed disabled:opacity-50'

/** Speaker controls for German text only; never render for English. */
export function SpeakerButton({ id, text, speech }: SpeakerButtonProps) {
  const isTooLong = text.length > MAX_SPEECH_TEXT_LENGTH

  return (
    <span className="inline-flex shrink-0 items-center gap-1">
      {RATES.map(({ rate, label, text: content }) => {
        const buttonId = `${id}:${rate}`
        const isActive = speech.activeId === buttonId
        const isLoading = isActive && speech.status === 'loading'
        const isPlaying = isActive && speech.status === 'playing'
        return (
          <button
            aria-label={isPlaying ? `Stop: ${label}` : label}
            aria-pressed={isActive}
            className={BUTTON_CLASS}
            disabled={isTooLong}
            key={rate}
            onClick={() => speech.toggle(buttonId, text, rate)}
            title={isTooLong ? 'Text is too long to read aloud' : label}
            type="button"
          >
            {isLoading ? (
              <span
                aria-hidden="true"
                className="size-3 animate-spin rounded-full border-2 border-emerald-800/30 border-t-emerald-800"
              />
            ) : isPlaying ? (
              <span aria-hidden="true">■</span>
            ) : (
              <span aria-hidden="true">{content}</span>
            )}
          </button>
        )
      })}
    </span>
  )
}
