// src/pages/memoComponents/GenerateMemoDialog.tsx
import * as React from "react";
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
} from "@mui/material";
import { usePostApiQueueTaskMemoMutation } from "../../../api/tasksApi";

type GenerateMemoDialogProps = {
    memoId?: number;
    onCancel: () => void;
    onSuccess: (taskId: number) => void; // pass back the returned ID
};

export default function GenerateMemoDialog({
                                               memoId,
                                               onCancel,
                                               onSuccess,
                                           }: GenerateMemoDialogProps) {
    // fresh defaults on each mount
    const [focus, setFocus] = React.useState<string>("");
    const [error, setError] = React.useState<string | null>(null);

    const [queueMemo, { isLoading }] = usePostApiQueueTaskMemoMutation();

    const handleSubmit = async () => {
        if (!memoId) return;
        setError(null);

        try {
            const res = await queueMemo({
                queueCreateMemoTaskDto: {
                    memoId,
                },
            }).unwrap();

            const newId = (res as any)?.id as number | undefined;
            if (newId == null) {
                setError("The task was queued, but no task id was returned.");
                return;
            }

            onSuccess(newId); // return the id
        } catch (e: any) {
            setError(e?.data?.message ?? "Failed to queue memo generation. Please try again.");
        }
    };

    return (
        <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
            <DialogTitle>Generate New Memo Content</DialogTitle>
            <DialogContent>
                <Stack gap={2} sx={{ mt: 1 }}>
                    {error && <Alert severity="error">{error}</Alert>}
                    <TextField
                        label="Focus (optional)"
                        placeholder="e.g., onboarding experience, key outcomes, risks"
                        value={focus}
                        onChange={(e) => setFocus(e.target.value)}
                        fullWidth
                        multiline
                        minRows={2}
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!memoId}
                >
                    {isLoading ? "Queuing…" : "Queue Task"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
