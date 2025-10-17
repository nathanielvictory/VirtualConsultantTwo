// src/components/ChartOverlay/ChartOverlaySelectors.tsx
import * as React from "react";
import {
    Box,
    Typography,
    ToggleButton,
    ToggleButtonGroup,
} from "@mui/material";
import type { SurveyQuestion } from "../../types/survey";
import QuestionAutocomplete from "../QuestionAutocomplete";
import type { Opt } from "./ChartOverlayDataGate";
import type { ChartOverlaySelection } from "./surveyMemo.ts";

type Mode = "topline" | "crosstab";

type Props = {
    topline: SurveyQuestion[];
    verticalOptions: Opt[];
    horizontalOptions: Opt[];

    /** Initial mode; default "topline" */
    defaultMode?: Mode;

    /** Optional initial selections by varname */
    initialToplineVarname?: string;
    initialVerticalVarname?: string;
    initialHorizontalVarname?: string;

    /** Notified whenever the selection (incl. mode) changes */
    onChange?: (selection: ChartOverlaySelection) => void;

    /** Optional title shown above selectors */
    title?: React.ReactNode;
};

export default function ChartOverlaySelectors({
                                                  topline,
                                                  verticalOptions,
                                                  horizontalOptions,
                                                  defaultMode = "topline",
                                                  initialToplineVarname,
                                                  initialVerticalVarname,
                                                  initialHorizontalVarname,
                                                  onChange,
                                                  title = "Select Question(s)",
                                              }: Props) {
    // ----- Helpers -----
    const findToplineByVar = React.useCallback(
        (v?: string | null) =>
            v ? topline.find((q) => q.question_varname === v) ?? null : null,
        [topline]
    );

    const findOptByVar = React.useCallback(
        (v?: string | null, list?: Opt[]) =>
            v && list ? list.find((o) => o.question_varname === v) ?? null : null,
        []
    );

    // ----- Initial state (parent remounts via key, so no syncing needed) -----
    const [mode, setMode] = React.useState<Mode>(defaultMode);

    const [toplineSel, setToplineSel] = React.useState<SurveyQuestion | null>(() => {
        const fromInit = findToplineByVar(initialToplineVarname);
        return fromInit ?? topline[0] ?? null;
    });

    const [vertSel, setVertSel] = React.useState<Opt | null>(() => {
        const fromInit = findOptByVar(initialVerticalVarname, verticalOptions);
        return fromInit ?? verticalOptions[0] ?? null;
    });

    const [horizSel, setHorizSel] = React.useState<Opt | null>(() => {
        const fromInit = findOptByVar(initialHorizontalVarname, horizontalOptions);
        return fromInit ?? horizontalOptions[0] ?? null;
    });

    // ----- Handlers emit onChange immediately -----
    const emitTopline = (next: SurveyQuestion | null) => {
        setToplineSel(next);
        if (onChange) onChange({ mode: "topline", topline: next });
    };

    const emitCrosstab = (nextV: Opt | null, nextH: Opt | null) => {
        if (onChange) onChange({ mode: "crosstab", vertical: nextV, horizontal: nextH });
    };

    const handleModeChange = (_: unknown, next: Mode | null) => {
        if (!next) return;
        setMode(next);
        if (!onChange) return;
        if (next === "topline") {
            onChange({ mode: "topline", topline: toplineSel });
        } else {
            onChange({ mode: "crosstab", vertical: vertSel, horizontal: horizSel });
        }
    };

    const handleVertChange = (v: Opt | null) => {
        setVertSel(v);
        emitCrosstab(v, horizSel);
    };

    const handleHorizChange = (v: Opt | null) => {
        setHorizSel(v);
        emitCrosstab(vertSel, v);
    };

    // ----- Markup (no Paper; minimal internal styling; parent controls page chrome) -----
    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateRows: "auto auto",
                rowGap: 1, // minimal internal breathing room; feel free to remove if parent fully controls gap
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    minHeight: 40,
                }}
            >
                <Typography variant="subtitle1" component="div">
                    {title}
                </Typography>

                <ToggleButtonGroup
                    value={mode}
                    exclusive
                    onChange={handleModeChange}
                    size="small"
                    aria-label="Visualization mode"
                    sx={{
                        borderRadius: 1.5,
                        overflow: "hidden",
                        "& .MuiToggleButton-root": {
                            textTransform: "none",
                            px: 1.25,
                        },
                    }}
                >
                    <ToggleButton value="topline" aria-label="Topline">
                        Topline
                    </ToggleButton>
                    <ToggleButton value="crosstab" aria-label="Crosstab">
                        Crosstab
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {mode === "topline" ? (
                <QuestionAutocomplete<SurveyQuestion>
                    items={topline}
                    value={toplineSel}
                    onChange={emitTopline}
                    label="Topline question"
                    placeholder="Search by varname or text…"
                    size="small"
                />
            ) : (
                <Box
                    sx={{
                        display: "grid",
                        gap: 1, // minimal internal spacing between the two inputs
                    }}
                >
                    <QuestionAutocomplete<Opt>
                        items={verticalOptions}
                        value={vertSel}
                        onChange={handleVertChange}
                        label="Vertical question"
                        placeholder="Search vertical…"
                        size="small"
                    />
                    <QuestionAutocomplete<Opt>
                        items={horizontalOptions}
                        value={horizSel}
                        onChange={handleHorizChange}
                        label="Horizontal question"
                        placeholder="Search horizontal…"
                        size="small"
                    />
                </Box>
            )}
        </Box>
    );
}
