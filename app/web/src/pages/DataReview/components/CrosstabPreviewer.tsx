import * as React from "react";
import {
    Stack,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    Toolbar,
    Button,
    Chip,
    Tooltip,
} from "@mui/material";
import type { CrosstabQuestion } from "../../../types/survey.ts";
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

export default function CrosstabPreviewer({ question }: { question: CrosstabQuestion | null }) {
    const [viz, setViz] = React.useState<VizType>("bar");
    const cells = question?.crosstab_answers ?? [];

    // Extract unique vertical/horizontal answers (preserve first-seen order)
    const verticalAnswers = React.useMemo(() => {
        const seen = new Set<string>();
        const arr: string[] = [];
        for (const c of cells) {
            if (!seen.has(c.vertical_answer)) {
                seen.add(c.vertical_answer);
                arr.push(c.vertical_answer);
            }
        }
        return arr;
    }, [cells]);

    const horizontalAnswers = React.useMemo(() => {
        const seen = new Set<string>();
        const arr: string[] = [];
        for (const c of cells) {
            if (!seen.has(c.horizontal_answer)) {
                seen.add(c.horizontal_answer);
                arr.push(c.horizontal_answer);
            }
        }
        return arr;
    }, [cells]);

    const keyOf = React.useCallback((v: string, h: string) => `${v}||${h}`, []);

    // Fast lookup for percentages by (v,h)
    const pctByPair = React.useMemo(() => {
        const m = new Map<string, number | undefined>();
        for (const c of cells) {
            m.set(keyOf(c.vertical_answer, c.horizontal_answer), c.percentage);
        }
        return m;
    }, [cells, keyOf]);

    // Initialize selection: select all existing pairs
    const [selected, setSelected] = React.useState<Set<string>>(() => {
        const initial = cells
            .filter(c => !c.is_subtotal_vertical && !c.is_subtotal_horizontal)
            .map(c => keyOf(c.vertical_answer, c.horizontal_answer));
        return new Set(initial);
    });

    // If incoming cells change, reselect all available pairs
    React.useEffect(() => {
        const initial = cells
            .filter(c => !c.is_subtotal_vertical && !c.is_subtotal_horizontal)
            .map(c => keyOf(c.vertical_answer, c.horizontal_answer));
        setSelected(new Set(initial));
    }, [cells, keyOf])

    const togglePair = (k: string) =>
        setSelected(prev => {
            if (!pctByPair.has(k)) return prev; // ignore missing
            const next = new Set(prev);
            next.has(k) ? next.delete(k) : next.add(k);
            return next;
        });

    const toggleRow = (v: string) =>
        setSelected(prev => {
            const next = new Set(prev);
            let allOn = true;
            for (const h of horizontalAnswers) {
                const k = keyOf(v, h);
                if (pctByPair.has(k) && !next.has(k)) {
                    allOn = false;
                    break;
                }
            }
            for (const h of horizontalAnswers) {
                const k = keyOf(v, h);
                if (!pctByPair.has(k)) continue;
                if (allOn) next.delete(k);
                else next.add(k);
            }
            return next;
        });

    const toggleColumn = (h: string) =>
        setSelected(prev => {
            const next = new Set(prev);
            let allOn = true;
            for (const v of verticalAnswers) {
                const k = keyOf(v, h);
                if (pctByPair.has(k) && !next.has(k)) {
                    allOn = false;
                    break;
                }
            }
            for (const v of verticalAnswers) {
                const k = keyOf(v, h);
                if (!pctByPair.has(k)) continue;
                if (allOn) next.delete(k);
                else next.add(k);
            }
            return next;
        });

    const selectAll = () =>
        setSelected(new Set(cells.map(c => keyOf(c.vertical_answer, c.horizontal_answer))));
    const clearAll = () => setSelected(new Set());

    // Data consumed by visualizations below
    const vizData = React.useMemo(
        () =>
            cells
                .filter(c => selected.has(keyOf(c.vertical_answer, c.horizontal_answer)))
                .map(c => ({
                    label: `${c.vertical_answer} × ${c.horizontal_answer}`,
                    value: normalizePercent(c.percentage),
                })),
        [cells, selected, keyOf]
    );

    // Helpers to compute on/off counts for headers (for chips & indeterminate state)
    const rowCounts = React.useMemo(() => {
        const map = new Map<string, { on: number; total: number }>();
        for (const v of verticalAnswers) {
            let on = 0, total = 0;
            for (const h of horizontalAnswers) {
                const k = keyOf(v, h);
                if (pctByPair.has(k)) {
                    total++;
                    if (selected.has(k)) on++;
                }
            }
            map.set(v, { on, total });
        }
        return map;
    }, [verticalAnswers, horizontalAnswers, selected, pctByPair, keyOf]);

    const colCounts = React.useMemo(() => {
        const map = new Map<string, { on: number; total: number }>();
        for (const h of horizontalAnswers) {
            let on = 0, total = 0;
            for (const v of verticalAnswers) {
                const k = keyOf(v, h);
                if (pctByPair.has(k)) {
                    total++;
                    if (selected.has(k)) on++;
                }
            }
            map.set(h, { on, total });
        }
        return map;
    }, [verticalAnswers, horizontalAnswers, selected, pctByPair, keyOf]);

    return (
        <Stack spacing={2}>
            {/* Controls */}
            <Stack direction="row" spacing={2} alignItems="center" sx={{ flexWrap: "wrap" }}>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel id="crosstab-viz-label">Visualization</InputLabel>
                    <Select<VizType>
                        labelId="crosstab-viz-label"
                        label="Visualization"
                        value={viz}
                        onChange={e => setViz(e.target.value as VizType)}
                    >
                        <MenuItem value="bar">Bar chart</MenuItem>
                        <MenuItem value="table">Table</MenuItem>
                    </Select>
                </FormControl>
                <Typography variant="body2" color="text.secondary" sx={{ flex: 1, minWidth: 260 }}>
                    {question
                        ? `${question.vertical_varname} — ${question.vertical_question}  ×  ${question.horizontal_varname} — ${question.horizontal_question}`
                        : "Select a vertical and horizontal question"}
                </Typography>
            </Stack>

            {/* Matrix table (selection source of truth) */}
            {cells.length > 0 && (
                <Paper variant="outlined">
                    <Toolbar
                        sx={{
                            pl: { sm: 2 },
                            pr: { sm: 2 },
                            gap: 1,
                            flexWrap: "wrap",
                            justifyContent: "space-between",
                        }}
                    >
                        <Typography variant="subtitle2">
                            Selected {selected.size}/{pctByPair.size}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <Button size="small" onClick={selectAll}>Select all</Button>
                            <Button size="small" onClick={clearAll}>Clear all</Button>
                        </Stack>
                    </Toolbar>

                    <TableContainer>
                        <Table size="small" aria-label="Crosstab matrix (click values to toggle pair; click headers to toggle row/column)">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ width: "24%" }}>
                                        {/* Top-left corner cell label */}
                                        <Typography variant="subtitle2" color="text.secondary">
                                            {question?.vertical_varname ?? "Vertical"} ↓ / {question?.horizontal_varname ?? "Horizontal"} →
                                        </Typography>
                                    </TableCell>
                                    {horizontalAnswers.map((h) => {
                                        const { on, total } = colCounts.get(h) ?? { on: 0, total: 0 };
                                        const state =
                                            on === 0 ? "Off" : on === total ? "On" : "Some";
                                        return (
                                            <TableCell
                                                key={`h:${h}`}
                                                align="center"
                                                onClick={() => toggleColumn(h)}
                                                sx={{
                                                    cursor: total ? "pointer" : "default",
                                                    userSelect: "none",
                                                    bgcolor: state === "On" ? "success.light" : state === "Some" ? "warning.light" : undefined,
                                                    color: state === "On" ? "success.contrastText" : undefined,
                                                    "&:hover": { opacity: 0.9 },
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                                                    <Typography variant="subtitle2">{h}</Typography>
                                                    <Chip size="small" label={`${on}/${total}`} variant="outlined" />
                                                </Stack>
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {verticalAnswers.map((v) => {
                                    const rowCount = rowCounts.get(v) ?? { on: 0, total: 0 };
                                    return (
                                        <TableRow key={`row:${v}`} hover>
                                            {/* Row header (click to toggle whole row) */}
                                            <TableCell
                                                onClick={() => toggleRow(v)}
                                                sx={{
                                                    position: "sticky",
                                                    left: 0,
                                                    zIndex: 1,
                                                    bgcolor: "background.paper",
                                                    cursor: rowCount.total ? "pointer" : "default",
                                                    userSelect: "none",
                                                    whiteSpace: "nowrap",
                                                    borderRight: theme => `1px dashed ${theme.palette.divider}`,
                                                }}
                                            >
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Typography variant="subtitle2">{v}</Typography>
                                                    <Chip size="small" label={`${rowCount.on}/${rowCount.total}`} variant="outlined" />
                                                </Stack>
                                            </TableCell>

                                            {/* Cells */}
                                            {horizontalAnswers.map((h) => {
                                                const k = keyOf(v, h);
                                                const pct = pctByPair.get(k);
                                                const exists = pctByPair.has(k);
                                                const isOn = selected.has(k);
                                                const label = exists ? formatPercent(pct) : "—";
                                                return (
                                                    <TableCell
                                                        key={`cell:${k}`}
                                                        align="center"
                                                        onClick={() => exists && togglePair(k)}
                                                        sx={{
                                                            cursor: exists ? "pointer" : "not-allowed",
                                                            userSelect: "none",
                                                            opacity: exists ? (isOn ? 1 : 0.4) : 0.5,
                                                            "&:hover": exists ? { bgcolor: "action.hover" } : undefined,
                                                            transition: "opacity 120ms ease",
                                                        }}
                                                    >
                                                        {exists ? (
                                                            <Tooltip title={isOn ? "Click to hide this pair" : "Click to show this pair"}>
                                                                <span>{label}</span>
                                                            </Tooltip>
                                                        ) : (
                                                            <Typography variant="body2" color="text.disabled">—</Typography>
                                                        )}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {/* Visualization below uses the matrix selection */}
            {viz === "bar" ? (
                <Paper sx={{ p: 2 }}>
                    <div style={{ width: "100%", height: 320 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={vizData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} />
                                <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
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
                                <TableCell>Pair</TableCell>
                                <TableCell align="right">Percentage</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {vizData.map((row, i) => (
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
function formatPercent(v: number | undefined) {
    const n = normalizePercent(v);
    return n < 10 ? `${Math.round(n * 10) / 10}%` : `${Math.round(n)}%`;
}
