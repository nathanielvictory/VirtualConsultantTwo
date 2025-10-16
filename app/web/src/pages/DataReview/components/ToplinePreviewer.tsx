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
    Tooltip as MuiTooltip,
} from "@mui/material";
import type { SurveyQuestion } from "../../../types/survey.ts";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip as ReTooltip,
    Legend,
} from "recharts";

type VizType = "pie" | "table";

const COLORS = [
    "#5B8FF9", "#5AD8A6", "#5D7092", "#F6BD16", "#E8684A",
    "#6DC8EC", "#9270CA", "#FF9D4D", "#269A99", "#FF99C3",
    "#A0D911", "#9254DE", "#13C2C2", "#FA8C16", "#FF4D4F",
    "#36CFC9", "#73D13D", "#597EF7", "#FFD666", "#69C0FF"
];

type ChartDatum = { label: string; value: number };

export default function ToplinePreviewer({ question }: { question: SurveyQuestion | null }) {
    const [viz, setViz] = React.useState<VizType>("pie");

    const answers = question?.survey_answers ?? [];

    // Initialize selection once (parent should remount via `key` to reset)
    const [selected, setSelected] = React.useState<Set<number>>(() => {
        const initial = answers.filter(a => !a.is_subtotal).map(a => a.answer_number);
        return new Set(initial);
    });

    const toggle = (n: number) =>
        setSelected(prev => {
            const next = new Set(prev);
            next.has(n) ? next.delete(n) : next.add(n);
            return next;
        });

    const data: ChartDatum[] = React.useMemo(
        () =>
            answers
                .filter(a => selected.has(a.answer_number))
                .map(a => ({
                    label: a.answer_text ?? "",
                    value: normalizePercent(a.percentage),
                })),
        [answers, selected]
    );

    // Rules you requested
    const numSlices = data.length;
    const isDonut = numSlices > 5;
    const longestLen = data.reduce((m, d) => Math.max(m, d.label.length), 0);
    const showSliceLabels = longestLen < 30; // add lines + labels if short

    // Truncate helper for legend labels
    const trunc = (s: string, n = 22) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

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
                        <MenuItem value="pie">Pie</MenuItem>
                        <MenuItem value="table">Table</MenuItem>
                    </Select>
                </FormControl>

                <Typography variant="body2" color="text.secondary">
                    {question
                        ? `${question.question_varname} — ${question.question_text}`
                        : "Select a question"}
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

            {viz === "pie" ? (
                <Paper sx={{ p: 2 }}>
                    <div style={{ width: "100%", height: 360 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    dataKey="value"
                                    nameKey="label"
                                    innerRadius={isDonut ? 70 : 0}
                                    outerRadius={120}
                                    labelLine={showSliceLabels}
                                    label={
                                        showSliceLabels
                                            ? ({ name, value }: { name?: string | number; value?: number | string }) =>
                                                `${String(name ?? "")}: ${Math.round(Number(value ?? 0))}%`
                                            : false
                                    }
                                >
                                    {data.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>

                                {/* Coerce to number to satisfy TS */}
                                <ReTooltip formatter={(v: number | string) => `${Number(v).toFixed(1)}%`} />

                                <Legend
                                    layout="vertical"
                                    align="right"
                                    verticalAlign="middle"
                                    wrapperStyle={{ maxHeight: 300, overflowY: "auto" }}
                                    formatter={(value: string) => {
                                        const text = trunc(value);
                                        return (
                                            <MuiTooltip title={value} arrow>
                                                <span>{text}</span>
                                            </MuiTooltip>
                                        );
                                    }}
                                />
                            </PieChart>
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
                                    <TableCell align="right">{Math.round(Number(row.value))}%</TableCell>
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
