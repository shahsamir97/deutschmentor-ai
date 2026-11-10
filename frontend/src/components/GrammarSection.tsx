import { useEffect, useRef, useState } from 'react'

import {
    explainGrammar,
    GRAMMAR_GENERIC_ERROR_MESSAGE,
    GrammarApiError,
} from '../services/api'
import type { GrammarExplanationState } from '../types/grammar'
import { GrammarExplanation } from './GrammarExplanation'

interface GrammarSectionProps {
    sentences: string[]
}

// Remount with a new `key` when the sentences change to reset its state.
export function GrammarSection({ sentences }: GrammarSectionProps) {
    const [state, setState] = useState<GrammarExplanationState>({
        status: 'idle',
    })
    const activeRequest = useRef<AbortController | null>(null)
    const isLoading = state.status === 'loading'

    useEffect(() => () => activeRequest.current?.abort(), [])

    async function handleExplain() {
        activeRequest.current?.abort()
        const controller = new AbortController()
        activeRequest.current = controller
        setState({ status: 'loading' })

        try {
            const response = await explainGrammar({ sentences }, controller.signal)
            if (!controller.signal.aborted) {
                console.log(response)
                setState({ status: 'success', explanations: response.explanations })
            }
        } catch (requestError) {
            if (!controller.signal.aborted) {
                setState({
                    status: 'error',
                    message:
                        requestError instanceof GrammarApiError
                            ? requestError.message
                            : GRAMMAR_GENERIC_ERROR_MESSAGE,
                })
            }
        }
    }

    return (
        <section
            aria-busy={isLoading}
            aria-label="Grammar explanation"
            className="mt-4 border-t border-slate-200 pt-4"
        >
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Grammar
                </h4>
                {state.status !== 'success' && (
                    <button
                        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-emerald-800 bg-white px-4 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isLoading}
                        onClick={() => void handleExplain()}
                        type="button"
                    >
                        {isLoading ? (
                            <>
                                <span
                                    aria-hidden="true"
                                    className="size-4 animate-spin rounded-full border-2 border-emerald-800/30 border-t-emerald-800"
                                />
                                Explaining grammar
                            </>
                        ) : (
                            'Explain Grammar'
                        )}
                    </button>
                )}
            </div>

            <div aria-live="polite" role="status">
                {isLoading && (
                    <p className="mt-3 text-sm text-slate-600">
                        Explaining grammar…
                    </p>
                )}
                {state.status === 'success' && (
                    <GrammarExplanation explanations={state.explanations} />
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
