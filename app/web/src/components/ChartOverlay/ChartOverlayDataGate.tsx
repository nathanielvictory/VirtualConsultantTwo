// src/components/ChartOverlay/ChartOverlayDataGate.tsx
import * as React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import type { Survey, SurveyQuestion, CrosstabQuestion } from "../../types/survey";
import { useSurveyData } from "../../hooks/useSurveyData";
import { makeHorizontalOptions, makeVerticalOptions, selectCrosstabs, selectTopline } from "./surveyMemo.ts";

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
    // 1) Always call hooks in a stable order
    const { surveyData, isLoading, isError } = useSurveyData();

    // Compute memoized slices *unconditionally*, with safe fallbacks
    const topline = React.useMemo<SurveyQuestion[]>(
        () => (surveyData ? selectTopline(surveyData) : []),
        [surveyData]
    );

    const crosstabs = React.useMemo<CrosstabQuestion[]>(
        () => (surveyData ? selectCrosstabs(surveyData) : []),
        [surveyData]
    );

    const verticalOptions = React.useMemo<Opt[]>(
        () => makeVerticalOptions(crosstabs ?? []),
        [crosstabs]
    );

    const horizontalOptions = React.useMemo<Opt[]>(
        () => makeHorizontalOptions(crosstabs ?? []),
        [crosstabs]
    );

    // 2) Decide what to render afterward (no more hooks below this point)
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

    if (isError || !surveyData) {
        return (
            <>
                {errorFallback ?? (
                    <Box sx={{ p: 2 }}>
                        <Typography color="error">
                            Error loading survey data. Please ensure a project is selected and survey data has been processed.
                        </Typography>
                    </Box>
                )}
            </>
        );
    }

    // Ready
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
