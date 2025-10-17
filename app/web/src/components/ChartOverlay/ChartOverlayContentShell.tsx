// src/components/ChartOverlay/ChartOverlayContentShell.tsx
import ChartOverlayDataGate from "./ChartOverlayDataGate";
import ChartOverlayContent from "./ChartOverlayContent";

interface ChartOverlayContentShellProps {
    /** Whether to display the survey text within the overlay content */
    showSurveyText?: boolean;
}

/** Glue: fetch/memo via DataGate, then render the content. */
export default function ChartOverlayContentShell({ showSurveyText = false }: ChartOverlayContentShellProps) {
    return (
        <ChartOverlayDataGate>
            {({ survey, topline, verticalOptions, horizontalOptions }) => (
                <ChartOverlayContent
                    survey={survey}
                    topline={topline}
                    verticalOptions={verticalOptions}
                    horizontalOptions={horizontalOptions}
                    showSurveyText={showSurveyText}
                />
            )}
        </ChartOverlayDataGate>
    );
}
