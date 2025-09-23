import * as React from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    Alert,
    FormControlLabel,
    Checkbox,
} from "@mui/material";
import { usePostApiQueueTaskInsightsMutation } from "../../../api/insightsApi";

type GenerateInsightsDialogProps = {
    projectId?: number;
    onCancel: () => void;
    onSuccess: () => void;
};

export default function GenerateInsightsDialog({
                                                   projectId,
                                                   onCancel,
                                                   onSuccess,
                                               }: GenerateInsightsDialogProps) {
    // fresh defaults on each mount
    const [count, setCount] = React.useState<number>(1);
    const [focus, setFocus] = React.useState<string>("");
    const [autoFocusMode, setAutoFocusMode] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const [queueInsights, { isLoading }] = usePostApiQueueTaskInsightsMutation();

    const validCount = Number.isFinite(count) && count >= 1 && count <= 5;
    const canSubmit = !!projectId && !isLoading && (autoFocusMode || validCount);

    const handleSubmit = async () => {
        if (!projectId || !canSubmit) return;
        setError(null);

        try {
            const res = await queueInsights({
                queueCreateInsightsTaskDto: {
                    projectId,
                    numberOfInsights: autoFocusMode ? null : count,
                    focus: autoFocusMode
                        ? null
                        : focus.trim()
                            ? focus.trim()
                            : null,
                },
            }).unwrap();

            const newId = (res as any)?.id as number | undefined;
            if (newId == null) {
                setError("The task was queued, but no task id was returned.");
                return;
            }
            onSuccess();
        } catch (e: any) {
            setError(e?.data?.message ?? "Failed to queue insights. Please try again.");
        }
    };

    return (
        <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
            <DialogTitle>Generate Insights</DialogTitle>
            <DialogContent>
                <Stack gap={2} sx={{ mt: 1 }}>
                    {error && <Alert severity="error">{error}</Alert>}

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={autoFocusMode}
                                onChange={(e) => setAutoFocusMode(e.target.checked)}
                            />
                        }
                        label="Let the AI Agent find focuses"
                    />

                    {!autoFocusMode && (
                        <>
                            <TextField
                                label="Focus (optional)"
                                placeholder="e.g., usability pains in onboarding"
                                value={focus}
                                onChange={(e) => setFocus(e.target.value)}
                                fullWidth
                                multiline
                                minRows={2}
                            />

                            <TextField
                                label="Number of insights"
                                type="number"
                                inputProps={{ min: 1, max: 5, step: 1 }}
                                value={count}
                                onChange={(e) => setCount(Number(e.target.value))}
                                fullWidth
                                required
                                helperText="1–5"
                            />
                        </>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} disabled={isLoading}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit} disabled={!canSubmit}>
                    {isLoading ? "Queuing…" : "Queue Task"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
