import * as React from "react";
import { Autocomplete, TextField, Stack } from "@mui/material";
import type { FilterOptionsState } from "@mui/material";

export interface QuestionAutocompleteProps<T extends object> {
    items: T[];
    value: T | null;
    onChange: (next: T | null) => void;

    /** Key for varname (defaults to "question_varname") */
    varKey?: keyof T;
    /** Key for text (defaults to "question_text") */
    textKey?: keyof T;

    label?: string;
    placeholder?: string;
    size?: "small" | "medium";
    disabled?: boolean;
}

/** Basic subsequence fuzzy score; higher is better. -Infinity if no match. */
function fuzzyScore(haystack: string, needle: string): number {
    const h = haystack.toLowerCase();
    const n = needle.toLowerCase().trim();
    if (!n) return 0;
    let score = 0;
    let i = 0;
    for (let c = 0; c < n.length; c++) {
        const pos = h.indexOf(n[c], i);
        if (pos === -1) return Number.NEGATIVE_INFINITY;
        score += 5 - Math.min(4, pos - i);
        i = pos + 1;
    }
    return score - h.length * 0.001;
}

function getField<T extends object>(item: T | null | undefined, key: keyof T): string {
    const v = item?.[key as keyof T] as unknown;
    return v == null ? "" : String(v);
}

export default function QuestionAutocomplete<T extends object>(props: QuestionAutocompleteProps<T>) {
    const {
        items,
        value,
        onChange,
        varKey,
        textKey,
        label = "Select question",
        placeholder,
        size = "small",
        disabled,
    } = props;

    // Defaults assume conventional keys; cast is safe if caller keeps defaults
    const vKey = (varKey ?? ("question_varname" as unknown as keyof T));
    const tKey = (textKey ?? ("question_text" as unknown as keyof T));

    const filterOptions = React.useCallback(
        (options: T[], state: FilterOptionsState<T>) => {
            const q = state.inputValue.trim().toLowerCase();
            if (!q) return options;

            return [...options]
                .map((o) => {
                    const s1 = fuzzyScore(getField(o, vKey), q);
                    const s2 = fuzzyScore(getField(o, tKey), q);
                    return { o, s: Math.max(s1, s2) };
                })
                .filter(({ s }) => s !== Number.NEGATIVE_INFINITY)
                .sort((a, b) => b.s - a.s)
                .map(({ o }) => o);
        },
        [vKey, tKey]
    );

    return (
        <Stack direction="row" spacing={1} alignItems="center">
            <Autocomplete<T, false, false, false>
                fullWidth
                options={items}
                value={value}
                onChange={(_, v) => onChange(v)}
                getOptionLabel={(o) => getField(o, vKey)}
                filterOptions={filterOptions}
                isOptionEqualToValue={(a, b) =>
                    getField(a, vKey) === getField(b, vKey) &&
                    getField(a, tKey) === getField(b, tKey)
                }
                renderInput={(params) => (
                    <TextField {...params} label={label} placeholder={placeholder} size={size} />
                )}
                renderOption={(liProps, option) => (
                    <li {...liProps}>
                        <Stack sx={{ py: 0.5 }}>
                            <span>{getField(option, vKey)}</span>
                            {getField(option, tKey) ? (
                                <span style={{ opacity: 0.7, fontSize: 12 }}>{getField(option, tKey)}</span>
                            ) : null}
                        </Stack>
                    </li>
                )}
                disabled={disabled}
            />
        </Stack>
    );
}
