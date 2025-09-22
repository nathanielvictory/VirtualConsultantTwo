import * as React from "react";
import {
    Stack,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
} from "@mui/material";
import type { SurveyQuestion } from "../../../types/survey.ts";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip as ReTooltip,
} from "recharts";

type VizType = "bar" | "table";

export default function ToplinePreviewer({ question }: { question: SurveyQuestion | null }) {
    const [viz, setViz] = React.useState<VizType>("bar");

    const answers = question?.survey_answers ?? [];

    // Initialize selection once (parent should remount via `key` to reset)
    const [selected, setSelected] = React.useState<Set<number>>(() =>
        new Set(answers.map(a => a.answer_number))
    );

    const toggle = (n: number) =>
        setSelected(prev => {
            const next = new Set(prev);
            next.has(n) ? next.delete(n) : next.add(n);
            return next;
        });

    const data = React.useMemo(
        () =>
            answers
                .filter(a => selected.has(a.answer_number))
                .map(a => ({ label: a.answer_text, value: normalizePercent(a.percentage) })),
        [answers, selected]
    );

    return (
        <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center">
                <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel id="topline-viz-label">Visualization</InputLabel>
                    <Select<VizType>
                        labelId="topline-viz-label"
                        label="Visualization"
                        value={viz}
                        onChange={e => setViz(e.target.value as VizType)}
                    >
                        <MenuItem value="bar">Bar chart</MenuItem>
                        <MenuItem value="table">Table</MenuItem>
                    </Select>
                </FormControl>

                <Typography variant="body2" color="text.secondary">
                    {question ? `${question.question_varname} — ${question.question_text}` : "Select a question"}
                </Typography>
            </Stack>

            {answers.length > 0 && (
                <FormGroup row>
                    {answers.map(a => (
                        <FormControlLabel
                            key={a.answer_number}
                            control={
                                <Checkbox
                                    checked={selected.has(a.answer_number)}
                                    onChange={() => toggle(a.answer_number)}
                                    size="small"
                                />
                            }
                            label={a.answer_text}
                        />
                    ))}
                </FormGroup>
            )}

            {viz === "bar" ? (
                <Paper sx={{ p: 2 }}>
                    <div style={{ width: "100%", height: 320 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" tick={{ fontSize: 12 }} interval={0} />
                                <YAxis tickFormatter={(v) => `${v}%`} />
                                <ReTooltip formatter={(v: number) => `${v}%`} />
                                <Bar dataKey="value" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Paper>
            ) : (
                <Paper sx={{ p: 2 }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Answer</TableCell>
                                <TableCell align="right">Percentage</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((row, i) => (
                                <TableRow key={`${row.label}|${i}`}>
                                    <TableCell>{row.label}</TableCell>
                                    <TableCell align="right">{Math.round(row.value)}%</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            )}
        </Stack>
    );
}

function normalizePercent(v: number | undefined) {
    if (v == null || Number.isNaN(v)) return 0;
    return v > 1 ? v : v * 100;
}
