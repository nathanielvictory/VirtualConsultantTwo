// src/components/ChartOverlay/ChartOverlayDataGate.tsx
import * as React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import type { Survey, SurveyQuestion, CrosstabQuestion } from "../../types/survey";
import { useSurveyData } from "../../hooks/useSurveyData";
import {makeHorizontalOptions, makeVerticalOptions, selectCrosstabs, selectTopline} from "./surveyMemo.ts";

export type Opt = { question_varname: string; question_text: string };

type ReadyData = {
    survey: Survey;
    topline: SurveyQuestion[];
    crosstabs: CrosstabQuestion[];
    verticalOptions: Opt[];
    horizontalOptions: Opt[];
};

type ChartOverlayDataGateProps = {
    /** Render-prop that receives memoized survey-derived data once ready */
    children: (data: ReadyData) => React.ReactNode;
    /** Optional custom loading UI */
    loadingFallback?: React.ReactNode;
    /** Optional custom error UI */
    errorFallback?: React.ReactNode;
};

export default function ChartOverlayDataGate({
                                                 children,
                                                 loadingFallback,
                                                 errorFallback,
                                             }: ChartOverlayDataGateProps) {
    const { surveyData, isLoading, isError } = useSurveyData();

    // ----- Loading -----
    if (isLoading) {
        return (
            <>
                {loadingFallback ?? (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100%",
                            minHeight: 240,
                        }}
                    >
                        <CircularProgress />
                    </Box>
                )}
            </>
        );
    }

    // ----- Error / Empty Survey -----
    if (isError || !surveyData) {
        return (
            <>
                {errorFallback ?? (
                    <Box sx={{ p: 2 }}>
                        <Typography color="error">
                            Error loading survey data. Please ensure a project is selected and survey
                            data has been processed.
                        </Typography>
                    </Box>
                )}
            </>
        );
    }

    // ----- Memoized slices for consumers -----
    const topline = React.useMemo(() => selectTopline(surveyData), [surveyData]);
    const crosstabs = React.useMemo(() => selectCrosstabs(surveyData), [surveyData]);

    const verticalOptions = React.useMemo<Opt[]>(
        () => makeVerticalOptions(crosstabs),
        [crosstabs]
    );

    const horizontalOptions = React.useMemo<Opt[]>(
        () => makeHorizontalOptions(crosstabs),
        [crosstabs]
    );

    return (
        <>
            {children({
                survey: surveyData,
                topline,
                crosstabs,
                verticalOptions,
                horizontalOptions,
            })}
        </>
    );
}
