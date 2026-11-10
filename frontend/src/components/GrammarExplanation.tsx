
import type {
    GrammarExplanationResponse,
} from "../types/grammar";

interface GrammarExplanationProps {
    response: GrammarExplanationResponse;
}


export function GrammarExplanation({
    response,
}: GrammarExplanationProps) {
    return (
        <section aria-label="Grammar explanations">
            <h3 className="text-lg font-semibold">
                Grammar Explanation
            </h3>

            {response.explanations.map((item, index) => (
                <article
                    key={`${index}-${item.sentence}`}
                    className="mt-4 rounded-lg border p-4"
                >
                    <h4 className="font-medium">
                        {item.sentence}
                    </h4>

                    {item.points.length === 0 ? (
                        <p className="mt-2 text-sm">
                            No supported grammar explanation found.
                        </p>
                    ) : (
                        item.points.map((point, pointIndex) => (
                            <div
                                key={pointIndex}
                                className="mt-3 space-y-2"
                            >
                                <p>{point.explanation}</p>

                                <p className="text-xs text-gray-500">
                                    Rules: {point.rule_ids.join(", ")}
                                </p>
                            </div>
                        ))
                    )}
                </article>
            ))}
        </section>
    );
}
