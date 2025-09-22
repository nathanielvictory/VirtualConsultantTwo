import * as React from "react";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import {
    usePostApiInsightsMutation,
    type InsightSource,
} from "../../../api/insightsApi";

type CreateInsightProps = {
    projectId?: number;
    defaultSource?: InsightSource; // defaults to "User"
    placeholder?: string;
    onCreated?: (newInsightId: number) => void; // notify parent so it can refetch / page, etc.
};

export default function CreateInsight({
                                          projectId,
                                          defaultSource = "User",
                                          placeholder = "Add a new insight…",
                                          onCreated,
                                      }: CreateInsightProps) {
    const [text, setText] = React.useState("");
    const [createInsight, { isLoading: isCreating }] = usePostApiInsightsMutation();

    const canCreate = !!projectId && text.trim().length > 0 && !isCreating;

    const submit = async () => {
        if (!canCreate || !projectId) return;

        const payload = {
            projectId,
            content: text.trim(),
            source: defaultSource as InsightSource,
        };

        const res = await createInsight({ createInsightDto: payload }).unwrap();
        // best-effort: many APIs return the entity (id), but if not present we still fire callback
        const newId = (res as any)?.id as number | undefined;

        setText("");
        onCreated?.(newId ?? -1);
    };

    const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault();
            void submit();
        }
    };

    return (
        <Box
            sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                bgcolor: (t) =>
                    t.palette.mode === "light" ? t.palette.grey[50] : t.palette.background.default,
                border: (t) => `1px solid ${t.palette.divider}`,
            }}
        >
            <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
                <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    placeholder={placeholder}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={onKeyDown}
                />
                <Button variant="contained" onClick={submit} disabled={!canCreate}>
                    {isCreating ? "Adding…" : "Add"}
                </Button>
            </Stack>
            <Typography variant="caption" color="text.secondary">
                Source will be marked as <b>{defaultSource}</b>. Press <kbd>⌘/Ctrl</kbd>+<kbd>Enter</kbd> to submit.
            </Typography>
        </Box>
    );
}
