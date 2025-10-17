// src/components/ChartOverlay/ChartOverlayContent.tsx
import * as React from "react";
import type { Survey, SurveyQuestion } from "../../types/survey";
import type { Opt } from "./ChartOverlayDataGate";
import ChartOverlaySelectors from "./ChartOverlaySelectors";
import { getAnswerGrid, type ChartOverlaySelection } from "./surveyMemo.ts";
import AnswerGridDisplay from "./AnswerGridDisplay.tsx";

/** Dumb content that owns its own selection state. */
type Props = {
    survey: Survey;
    topline: SurveyQuestion[];
    verticalOptions: Opt[];
    horizontalOptions: Opt[];
    showSurveyText?: boolean; // <-- Added prop
};

export default function ChartOverlayContent({
                                                survey,
                                                topline,
                                                verticalOptions,
                                                horizontalOptions,
                                                showSurveyText = true, // <-- Default to true
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

    return (
        <>
            <ChartOverlaySelectors
                topline={topline}
                verticalOptions={verticalOptions}
                horizontalOptions={horizontalOptions}
                onChange={setSelection}
            />
            {showSurveyText && <AnswerGridDisplay grid={answerGrid} />}
        </>
    );
}
