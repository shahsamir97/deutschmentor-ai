import type { SentenceExplanation } from '../types/grammar'

interface GrammarExplanationProps {
  explanations: SentenceExplanation[]
}

export function GrammarExplanation({ explanations }: GrammarExplanationProps) {
  return (
    <ul className="mt-3 space-y-3">
      {explanations.map((item) => (
        <li
          className="rounded-lg border border-slate-200 bg-white p-3"
          key={item.sentence}
        >
          <p className="text-sm font-medium leading-6 text-slate-800" lang="de">
            {item.sentence}
          </p>
          {item.points.length === 0 ? (
            <p className="mt-2 text-sm leading-6 text-slate-500">
              No grammar point from our rules applies to this sentence.
            </p>
          ) : (
            <ul className="mt-2 space-y-2">
              {item.points.map((point) => (
                <li
                  className="text-sm leading-6 text-slate-700"
                  key={point.explanation}
                >
                  <p>{point.explanation}</p>
                  {point.rule_ids.length > 0 && (
                    <p className="mt-1 text-xs text-slate-500">
                      Rules: {point.rule_ids.join(', ')}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  )
}
