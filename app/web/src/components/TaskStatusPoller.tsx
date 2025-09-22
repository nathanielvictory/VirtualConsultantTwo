import { Box, Chip, LinearProgress, Stack, Typography } from "@mui/material";
import { useGetApiTasksByIdQuery, type TaskJobStatus } from "../api/tasksApi";
import { useState } from "react";

export type TaskStatusPollerProps = {
    taskId: number;
    pollIntervalMs?: number;          // default 2000
    onComplete?: (opts: { taskId: number; status?: TaskJobStatus }) => void;
    title?: string;                   // heading shown above status
    hideWhenSucceeded?: boolean;      // auto-hide UI after success
};

export default function TaskStatusPoller({
                                             taskId,
                                             pollIntervalMs = 2000,
                                             onComplete,
                                             title = "Task Status",
                                             hideWhenSucceeded = false,
                                         }: TaskStatusPollerProps) {
    // --- internal control state (no effects) ---
    const [currentTaskId, setCurrentTaskId] = useState<number>(taskId);
    const [isPolling, setIsPolling] = useState<boolean>(!!taskId);
    const [completedOnce, setCompletedOnce] = useState<boolean>(false);

    // Reset internal state if the incoming taskId changes (no useEffect)
    if (currentTaskId !== taskId) {
        setCurrentTaskId(taskId);
        setIsPolling(!!taskId);
        setCompletedOnce(false);
    }

    const { data: task } = useGetApiTasksByIdQuery(
        { id: taskId },
        {
            skip: !taskId,
            // Poll while active; stop when terminal
            pollingInterval: isPolling ? pollIntervalMs : 0,
            refetchOnMountOrArgChange: true,
        }
    );

    if (!taskId) return null;

    // Check for terminal status and stop polling (no useEffect)
    const status: TaskJobStatus | "Queued" = (task?.status as any) ?? "Queued";
    const terminal = isTerminal(task?.status);

    if (terminal && !completedOnce) {
        setCompletedOnce(true);
        setIsPolling(false);
        // fire callback exactly once
        onComplete?.({ taskId, status: task?.status });
    }

    if (hideWhenSucceeded && task?.status === "Succeeded") return null;

    const color =
        status === "Succeeded" ? "success" :
            status === "Failed" || status === "Canceled" ? "error" : "default";

    return (
        <Box
            sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                border: (t) => `1px dashed ${t.palette.divider}`,
            }}
        >
            <Stack spacing={1}>
                <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                    <Typography variant="subtitle2">{title}</Typography>
                    <Chip
                        size="small"
                        label={status}
                        color={color as any}
                        variant={status === "Succeeded" ? "filled" : "outlined"}
                    />
                    <Typography variant="body2" color="text.secondary">
                        Task #{taskId}
                    </Typography>
                </Stack>

                {typeof task?.progress === "number" && (
                    <Box>
                        <LinearProgress variant="determinate" value={clamp(task.progress, 0, 100)} />
                        <Typography variant="caption" color="text.secondary">
                            {Math.round(clamp(task.progress, 0, 100))}% • {task?.jobType ?? "—"}
                        </Typography>
                    </Box>
                )}

                <Typography variant="caption" color="text.secondary">
                    {formatTimeline(task)}
                </Typography>
            </Stack>
        </Box>
    );
}

/* ---------- helpers ---------- */

function isTerminal(status?: TaskJobStatus) {
    return status === "Succeeded" || status === "Failed" || status === "Canceled";
}
function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}
function ts(s?: string | null) {
    return s ? new Date(s).toLocaleString() : "—";
}
function formatTimeline(task?: {
    createdAt?: string;
    startedAt?: string | null;
    completedAt?: string | null;
}) {
    if (!task) return `Created: — • Started: — • Completed: —`;
    return `Created: ${ts(task.createdAt)} • Started: ${ts(task.startedAt)} • Completed: ${ts(task.completedAt)}`;
}
