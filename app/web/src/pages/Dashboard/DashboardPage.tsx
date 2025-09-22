// src/pages/Dashboard/DashboardPage.tsx
import {
    Container,
    Paper,
    Stack,
    Typography,
    ToggleButton,
    ToggleButtonGroup,
} from "@mui/material";
import { useMemo, useState } from "react";
import type {
    Survey,
    SurveyQuestion,
    CrosstabQuestion,
} from "../../types/survey";
import surveyJson from "../../data/survey.json";
import QuestionAutocomplete from "../../components/QuestionAutocomplete.tsx";
import ToplinePreviewer from "../DataReview/components/ToplinePreviewer.tsx";
import CrosstabPreviewer from "../DataReview/components/CrosstabPreviewer.tsx";

type Mode = "topline" | "crosstab";

export default function DashboardPage() {
    const survey = surveyJson as Survey;

    // ----- Topline -----
    const topline: SurveyQuestion[] = survey?.survey_topline ?? [];
    const [toplineSelected, setToplineSelected] = useState<SurveyQuestion | null>(
        topline[0] ?? null
    );

    // ----- Crosstab -----
    const crosstabs: CrosstabQuestion[] = survey?.survey_crosstab ?? [];

    // unique vertical varnames + labels
    const verticalOptions = useMemo(() => {
        const m = new Map<string, { question_varname: string; question_text: string }>();
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
    const horizontalOptions = useMemo(() => {
        const m = new Map<string, { question_varname: string; question_text: string }>();
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

    type Opt = { question_varname: string; question_text: string };
    const [vertSel, setVertSel] = useState<Opt | null>(verticalOptions[0] ?? null);
    const [horizSel, setHorizSel] = useState<Opt | null>(horizontalOptions[0] ?? null);

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
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
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
                                    key={toplineSelected ? toplineSelected.question_varname : "none"}
                                    question={toplineSelected}
                                />
                            </Stack>
                        ) : (
                            <Stack spacing={2}>
                                <QuestionAutocomplete<{question_varname: string; question_text: string}>
                                    items={verticalOptions}
                                    value={vertSel}
                                    onChange={setVertSel}
                                    label="Vertical question"
                                    placeholder="Search vertical…"
                                    size="small"
                                />
                                <QuestionAutocomplete<{question_varname: string; question_text: string}>
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
