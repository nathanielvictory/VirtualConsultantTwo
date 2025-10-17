// src/pages/Dashboard/DashboardPage.tsx
import {
    Box,
    CircularProgress,
    Container,
    Paper,
    Stack,
    Typography,
    ToggleButton,
    ToggleButtonGroup,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import type {
    Survey,
    SurveyQuestion,
    CrosstabQuestion,
} from "../../types/survey";
import QuestionAutocomplete from "../../components/QuestionAutocomplete.tsx";
import ToplinePreviewer from "../DataReview/components/ToplinePreviewer.tsx";
import CrosstabPreviewer from "../DataReview/components/CrosstabPreviewer.tsx";
import { useSurveyData } from "../../hooks/useSurveyData";
import ChartOverlay from "../../components/ChartOverlay/ChartOverlay.tsx";

type Mode = "topline" | "crosstab";

type Opt = { question_varname: string; question_text: string };

export default function DataReviewPage() {
    const { surveyData, isLoading, isError } = useSurveyData();

    // Treat the hook result as the canonical survey object
    const survey = (surveyData ?? null) as Survey | null;

    // ----- Topline -----
    const topline: SurveyQuestion[] = useMemo(
        () => survey?.survey_topline ?? [],
        [survey]
    );
    const [toplineSelected, setToplineSelected] = useState<SurveyQuestion | null>(
        null
    );

    // Initialize/reset topline selection when topline data changes
    useEffect(() => {
        if (!topline.length) {
            setToplineSelected(null);
            return;
        }
        // keep current selection if it still exists, else default to first
        setToplineSelected((prev) => {
            if (!prev) return topline[0];
            const stillExists = topline.find(
                (q) => q.question_varname === prev.question_varname
            );
            return stillExists ?? topline[0];
        });
    }, [topline]);

    // ----- Crosstab -----
    const crosstabs: CrosstabQuestion[] = useMemo(
        () => survey?.survey_crosstab ?? [],
        [survey]
    );

    // unique vertical varnames + labels
    const verticalOptions: Opt[] = useMemo(() => {
        const m = new Map<string, Opt>();
        for (const ct of crosstabs) {
            if (!m.has(ct.vertical_varname)) {
                m.set(ct.vertical_varname, {
                    question_varname: ct.vertical_varname,
                    question_text: ct.vertical_question,
                });
            }
        }
        return [...m.values()];
    }, [crosstabs]);

    // unique horizontal varnames + labels
    const horizontalOptions: Opt[] = useMemo(() => {
        const m = new Map<string, Opt>();
        for (const ct of crosstabs) {
            if (!m.has(ct.horizontal_varname)) {
                m.set(ct.horizontal_varname, {
                    question_varname: ct.horizontal_varname,
                    question_text: ct.horizontal_question,
                });
            }
        }
        return [...m.values()];
    }, [crosstabs]);

    const [vertSel, setVertSel] = useState<Opt | null>(null);
    const [horizSel, setHorizSel] = useState<Opt | null>(null);

    // Initialize/reset crosstab selections when option lists change
    useEffect(() => {
        if (!verticalOptions.length) setVertSel(null);
        else {
            setVertSel((prev) => {
                if (!prev) return verticalOptions[0];
                const stillExists = verticalOptions.find(
                    (o) => o.question_varname === prev.question_varname
                );
                return stillExists ?? verticalOptions[0];
            });
        }
    }, [verticalOptions]);

    useEffect(() => {
        if (!horizontalOptions.length) setHorizSel(null);
        else {
            setHorizSel((prev) => {
                if (!prev) return horizontalOptions[0];
                const stillExists = horizontalOptions.find(
                    (o) => o.question_varname === prev.question_varname
                );
                return stillExists ?? horizontalOptions[0];
            });
        }
    }, [horizontalOptions]);

    const matchedCrosstab = useMemo(() => {
        if (!vertSel || !horizSel) return null;
        return (
            crosstabs.find(
                (q) =>
                    q.vertical_varname === vertSel.question_varname &&
                    q.horizontal_varname === horizSel.question_varname
            ) ?? null
        );
    }, [crosstabs, vertSel, horizSel]);

    // ----- Mode -----
    const [mode, setMode] = useState<Mode>("topline");

    // ----- Loading / Error -----
    if (isLoading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (isError || !survey) {
        return (
            <Typography sx={{ p: 2 }}>
                Error loading survey data. Please ensure you have a project selected and
                survey data has been processed.
            </Typography>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Stack spacing={2}>
                {/* Survey header */}
                <Paper>
                    <Stack spacing={1.5} sx={{ p: { xs: 2.5, md: 3 } }}>
                        <Typography variant="h5">Survey Overview</Typography>
                        <Stack direction="row" spacing={4} flexWrap="wrap">
                            <Labeled label="Name" value={survey?.name} />
                            <Labeled label="KBID" value={survey?.kbid} />
                            <Labeled label="Project Number" value={survey?.project_number} />
                        </Stack>
                    </Stack>
                </Paper>

                {/* Mode toggle + selectors */}
                <Paper>
                    <Stack spacing={2} sx={{ p: { xs: 2.5, md: 3 } }}>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Typography variant="h6">Results</Typography>
                            <ToggleButtonGroup
                                value={mode}
                                exclusive
                                onChange={(_, v) => v && setMode(v)}
                                size="small"
                            >
                                <ToggleButton value="topline">Topline</ToggleButton>
                                <ToggleButton value="crosstab">Crosstab</ToggleButton>
                            </ToggleButtonGroup>
                        </Stack>

                        {mode === "topline" ? (
                            <Stack spacing={2}>
                                <QuestionAutocomplete<SurveyQuestion>
                                    items={topline}
                                    value={toplineSelected}
                                    onChange={setToplineSelected}
                                    label="Topline question"
                                    placeholder="Search by varname or text…"
                                    size="small"
                                />
                                <ToplinePreviewer
                                    key={
                                        toplineSelected
                                            ? toplineSelected.question_varname
                                            : "none"
                                    }
                                    question={toplineSelected}
                                />
                            </Stack>
                        ) : (
                            <Stack spacing={2}>
                                <QuestionAutocomplete<Opt>
                                    items={verticalOptions}
                                    value={vertSel}
                                    onChange={setVertSel}
                                    label="Vertical question"
                                    placeholder="Search vertical…"
                                    size="small"
                                />
                                <QuestionAutocomplete<Opt>
                                    items={horizontalOptions}
                                    value={horizSel}
                                    onChange={setHorizSel}
                                    label="Horizontal question"
                                    placeholder="Search horizontal…"
                                    size="small"
                                />
                                <CrosstabPreviewer
                                    key={
                                        matchedCrosstab
                                            ? `${matchedCrosstab.vertical_varname}|${matchedCrosstab.horizontal_varname}`
                                            : "none"
                                    }
                                    question={matchedCrosstab}
                                />
                            </Stack>
                        )}
                    </Stack>
                </Paper>
            </Stack>
            <ChartOverlay />
        </Container>
    );
}

function Labeled({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
                {label}
            </Typography>
            <Typography>{value ?? "—"}</Typography>
        </Stack>
    );
}
