// src/components/ChartOverlay/ChartOverlayContent.tsx
import * as React from "react";
import type { Survey, SurveyQuestion } from "../../types/survey";
import type { Opt } from "./ChartOverlayDataGate";
import ChartOverlaySelectors from "./ChartOverlaySelectors";
import { getAnswerGrid, type ChartOverlaySelection } from "./surveyMemo.ts";
import AnswerGridDisplay from "./AnswerGridDisplay.tsx";
import ChartCreatorShell from "./ChartCreatorShell.tsx";

/** Dumb content that owns its own selection state. */
type Props = {
    survey: Survey;
    topline: SurveyQuestion[];
    verticalOptions: Opt[];
    horizontalOptions: Opt[];
    showSurveyText?: boolean;
};

function makeDefaultTitle(selection: ChartOverlaySelection): string {
    if (selection.mode === "topline") {
        const q = selection.topline;
        return q ? `${q.question_varname} Chart` : "";
    }
    // crosstab
    const v = selection.vertical;
    const h = selection.horizontal;
    return v && h ? `${v.question_varname} x ${h.question_varname} Chart` : "";
}

export default function ChartOverlayContent({
                                                survey,
                                                topline,
                                                verticalOptions,
                                                horizontalOptions,
                                                showSurveyText,
                                            }: Props) {
    const [selection, setSelection] = React.useState<ChartOverlaySelection>({
        mode: "topline",
        topline: topline[0] ?? null,
    });

    const answerGrid = React.useMemo(
        () =>
            getAnswerGrid(survey, selection, {
                filter_subtotal: true,
                include_headers: true,
            }),
        [survey, selection]
    );

    const defaultTitle = React.useMemo(() => makeDefaultTitle(selection), [selection]);

    return (
        <>
            <ChartOverlaySelectors
                topline={topline}
                verticalOptions={verticalOptions}
                horizontalOptions={horizontalOptions}
                onChange={setSelection}
            />
            {showSurveyText ? (
                <AnswerGridDisplay grid={answerGrid} />
            ) : (
                <ChartCreatorShell
                    type={selection.mode}
                    answerGrid={answerGrid}
                    defaultTitle={defaultTitle}
                />
            )}
        </>
    );
}
