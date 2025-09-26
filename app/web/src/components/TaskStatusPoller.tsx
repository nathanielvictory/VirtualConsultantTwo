import { Box, Chip, LinearProgress, Stack, Typography } from "@mui/material";
import { useGetApiTasksByIdQuery, type TaskJobStatus } from "../api/tasksApi";
import { useState } from "react";
import TaskProgressBar from "./TaskProgressBar"; // ← adjust path

export type TaskStatusPollerProps = {
    taskId: number;
    pollIntervalMs?: number;
    onComplete?: (opts: { taskId: number; status?: TaskJobStatus }) => void;
    title?: string;
    hideWhenSucceeded?: boolean;
};

export default function TaskStatusPoller({
                                             taskId,
                                             pollIntervalMs = 2000,
                                             onComplete,
                                             title = "Task Status",
                                             hideWhenSucceeded = false,
                                         }: TaskStatusPollerProps) {
    const [currentTaskId, setCurrentTaskId] = useState<number>(taskId);
    const [isPolling, setIsPolling] = useState<boolean>(!!taskId);
    const [completedOnce, setCompletedOnce] = useState<boolean>(false);

    if (currentTaskId !== taskId) {
        setCurrentTaskId(taskId);
        setIsPolling(!!taskId);
        setCompletedOnce(false);
    }

    const { data: task } = useGetApiTasksByIdQuery(
        { id: taskId },
        {
            skip: !taskId,
            pollingInterval: isPolling ? pollIntervalMs : 0,
            refetchOnMountOrArgChange: true,
        }
    );

    if (!taskId) return null;

    const status: TaskJobStatus | "Queued" = (task?.status as any) ?? "Queued";
    const terminal = isTerminal(task?.status);

    if (terminal && !completedOnce) {
        setCompletedOnce(true);
        setIsPolling(false);
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

                {/* Progress UI */}
                {(status === "Queued" || status === "Running") && (
                    <Box>
                        {status === "Queued" && <LinearProgress />}

                        {status === "Running" &&
                            (task?.progress != null ? (
                                <TaskProgressBar progress={task?.progress} />
                            ) : (
                                <LinearProgress />
                            ))}
                    </Box>
                )}

                {/* Error message when failed */}
                {status === "Failed" && task?.errorMessage && (
                    <Typography variant="body2" color="error">
                        {task.errorMessage}
                    </Typography>
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
