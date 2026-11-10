
import { useEffect, useRef, useState } from "react";

import { explainGrammar } from "../services/api";
import { GrammarExplanation } from "./GrammarExplanation";

import type {
    GrammarExplanationResponse,
} from "../types/grammar";

interface GrammarSectionProps {
    sentences: [string, string];
}

export function GrammarSection({
    sentences,
}: GrammarSectionProps) {
    const [grammarResult, setGrammarResult] =
        useState<GrammarExplanationResponse | null>(null);

    const [isLoading, setIsLoading] = useState(false);

    const [error, setError] = useState<string | null>(null);

    const controllerRef = useRef<AbortController | null>(null);

    // Cancel requests when the sentences change or
    // the component is removed.
    useEffect(() => {
        controllerRef.current?.abort();
        controllerRef.current = null;

        return () => {
            controllerRef.current?.abort();
        };
    }, [sentences[0], sentences[1]]);

    async function handleExplainGrammar() {
        if (isLoading) return;

        // Cancel any previous request.
        controllerRef.current?.abort();

        const controller = new AbortController();
        controllerRef.current = controller;

        setIsLoading(true);
        setError(null);
        setGrammarResult(null);

        try {
            const result = await explainGrammar(
                { sentences },
                controller.signal
            );

            // Ignore results from canceled requests.
            if (controller.signal.aborted) return;

            setGrammarResult(result);
        } catch (err) {
            if (controller.signal.aborted) return;

            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to explain grammar."
            );
        } finally {
            // Only reset loading for the current request.
            if (controllerRef.current === controller) {
                controllerRef.current = null;
                setIsLoading(false);
            }
        }
    }

    return (
        <section
            className="mt-6 space-y-4"
            aria-label="German grammar explanations"
        >
            <button
                type="button"
                onClick={handleExplainGrammar}
                disabled={isLoading}
                aria-busy={isLoading}
                className="rounded-lg bg-blue-600 px-4 py-2
                   text-white transition-colors
                   hover:bg-blue-700
                   disabled:cursor-not-allowed
                   disabled:opacity-50"
            >
                {isLoading
                    ? "Explaining grammar..."
                    : "Explain Grammar"}
            </button>

            {error && (
                <p
                    role="alert"
                    className="text-sm text-red-600"
                >
                    {error}
                </p>
            )}

            {grammarResult && (
                <GrammarExplanation response={grammarResult} />
            )}
        </section>
    );
}
