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
    Typography,
} from "@mui/material";
import { usePostApiQueueTaskSlidesMutation } from "../../../api/tasksApi";
import MemoSelector from "../memoComponents/MemoSelector";

/**
 * Dialog that queues generation of a slide deck from the *currently selected memo*.
 * - Exactly mirrors GenerateMemoDialog UX, but targets a Slidedeck task.
 * - If no memo is selected, the primary action is disabled.
 * - The parent page can render ../memoComponents/MemoSelector to control the selected memo.
 */

export type GenerateSlidedeckDialogProps = {
    /** Existing slidedeck to append to */
    slidedeckId?: number;
    /** Project context for memo search */
    projectId: number | null;
    /** (Optional) initial memo to use as the source for the slide deck */
    memoId?: number;
    onCancel: () => void;
    /** Called with the queued task id when successful */
    onSuccess: (taskId: number) => void;
};

export default function GenerateSlidedeckDialog({
                                                    slidedeckId,
                                                    projectId,
                                                    memoId,
                                                    onCancel,
                                                    onSuccess,
                                                }: GenerateSlidedeckDialogProps) {
    // fresh defaults on each mount
    const [focus, setFocus] = React.useState<string>("");
    const [error, setError] = React.useState<string | null>(null);
    const [selectedMemoId, setSelectedMemoId] = React.useState<number | null>(memoId ?? null);

    // NOTE: parity with memo dialog — we assume a parallel queue endpoint exists.
    // If your API name differs (e.g., usePostApiQueueTaskSlidesMutation), swap the import & call below.
    const [queueSlides, { isLoading }] = usePostApiQueueTaskSlidesMutation();

    const handleSubmit = async () => {
        if (!memoId || !slidedeckId) return;
        setError(null);

        try {
            const res = await queueSlides({
                queueCreateSlidesTaskDto: {
                    slidedeckId: slidedeckId!,
                    memoId: selectedMemoId!,
                    focus
                },
            }).unwrap();

            const newId = (res as any)?.id as number | undefined;
            if (newId == null) {
                setError("The task was queued, but no task id was returned.");
                return;
            }

            onSuccess(newId);
        } catch (e: any) {
            setError(
                e?.data?.message ??
                "Failed to queue slide deck generation. Please try again."
            );
        }
    };

    return (
        <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
            <DialogTitle>Generate New Slide Deck</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    A new slide deck will be generated from the content of the memo you select below and appended to the current slide deck. If either a memo or slide deck is not selected, please select them below.
                </Typography>
                <Stack gap={2} sx={{ mt: 1 }}>
                    {/* In-dialog memo picker so users don't have to navigate away */}
                    <MemoSelector
                        projectId={projectId}
                        memoId={selectedMemoId ?? undefined}
                        onSelect={setSelectedMemoId}
                        showTitle
                        showCurrent
                        variant="compact"
                    />
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
                    disabled={!selectedMemoId || !slidedeckId}
                >
                    {isLoading ? "Queuing…" : "Queue Task"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
