import type { TranslationDirection } from '../types/translation'

interface LanguageSwitcherProps {
  direction: TranslationDirection
  disabled: boolean
  onDirectionChange: (direction: TranslationDirection) => void
}

const directions: {
  value: TranslationDirection
  label: string
}[] = [
  { value: 'de-en', label: 'German → English' },
  { value: 'en-de', label: 'English → German' },
]

export function LanguageSwitcher({
  direction,
  disabled,
  onDirectionChange,
}: LanguageSwitcherProps) {
  return (
    <div
      aria-label="Translation direction"
      className="inline-flex max-w-full rounded-lg bg-slate-100 p-1"
      role="group"
    >
      {directions.map(({ value, label }) => (
        <button
          aria-pressed={direction === value}
          className={`rounded-md px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm ${
            direction === value
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          disabled={disabled}
          key={value}
          onClick={() => onDirectionChange(value)}
          type="button"
        >
          {label}
        </button>
      ))}
    </div>
  )
}
