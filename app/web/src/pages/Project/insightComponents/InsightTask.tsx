import * as React from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    LinearProgress,
    Paper,
    Stack,
    Typography,
    Skeleton,
} from "@mui/material";
import {
    useGetApiTasksByIdQuery,
    type TaskDetailDto,
} from "../../../api/tasksApi";
import { useGetApiInsightsByIdQuery } from "../../../api/insightsApi";

const TERMINAL: Array<TaskDetailDto["status"]> = ["Succeeded", "Failed", "Canceled"];

type InsightTaskProps = {
    taskId: number;
    pollEveryMs?: number;
    highlight?: boolean;
    onCompleted?: (taskId: number, task: TaskDetailDto) => void;
    onDismiss?: (taskId: number) => void;
};

function parsePayload(payloadJson?: string | null): { focus: string | null; numberOfInsights: number | null } {
    try {
        if (!payloadJson) return { focus: null, numberOfInsights: null };
        const obj = JSON.parse(payloadJson);
        return {
            numberOfInsights: typeof obj.number_of_insights === "number" ? obj.number_of_insights : null,
            focus: typeof obj.focus === "string" && obj.focus.trim().length ? obj.focus : null,
        };
    } catch {
        return { focus: null, numberOfInsights: null };
    }
}

function InsightPreview({ insightId }: { insightId: number }) {
    const { data, isLoading, isError } = useGetApiInsightsByIdQuery({ id: insightId });
    if (isLoading) {
        return (
            <Stack spacing={0.5} sx={{ py: 0.5 }}>
                <Skeleton width="40%" />
                <Skeleton />
            </Stack>
        );
    }
    if (isError || !data) {
        return (
            <Typography variant="body2" color="text.secondary">
                (Could not load insight #{insightId})
            </Typography>
        );
    }
    return (
        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
            {data.content}
        </Typography>
    );
}

export default function InsightTask({
                                        taskId,
                                        pollEveryMs = 1500,
                                        highlight = false,
                                        onCompleted,
                                        onDismiss,
                                    }: InsightTaskProps) {
    const { data, isLoading, isError, refetch } = useGetApiTasksByIdQuery({ id: taskId });

    // Poll while not terminal
    React.useEffect(() => {
        if (!data || TERMINAL.includes(data.status as any)) return;
        const id = window.setInterval(() => void refetch(), Math.max(500, pollEveryMs));
        return () => window.clearInterval(id);
    }, [data, pollEveryMs, refetch]);

    // One-time notify on terminal
    const hasNotifiedRef = React.useRef(false);
    React.useEffect(() => {
        if (!data) return;
        if (TERMINAL.includes(data.status as any) && !hasNotifiedRef.current) {
            hasNotifiedRef.current = true;
            onCompleted?.(taskId, data);
        }
    }, [data, onCompleted, taskId]);

    const payload = parsePayload(data?.payloadJson);
    const terminal = data && TERMINAL.includes(data.status as any);
    const succeeded = data?.status === "Succeeded";
    const failed = data?.status === "Failed";

    const insightArtifacts = React.useMemo(
        () => (data?.artifacts ?? []).filter((a) => a.resourceType === "Insight" && a.createdResourceId != null),
        [data?.artifacts]
    );

    const totalTokens = insightArtifacts.reduce(
        (sum, a) => sum + (typeof a.totalTokens === "number" ? a.totalTokens : 0),
        0
    );
    const dollars = (totalTokens / 1000) * 0.00015;
    const centsDisplay = `${(dollars * 100).toFixed(1)}¢`;

    return (
        <Paper
            variant="outlined"
            sx={{
                p: 1.5,
                borderRadius: 2,
                ...(highlight ? (t) => ({ outline: `2px solid ${t.palette.primary.main}` }) : {}),
            }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                <Stack spacing={0.75} flex={1} minWidth={0}>
                    {/* Header row */}
                    <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                        <Typography variant="subtitle2" noWrap>
                            Task #{taskId}
                        </Typography>
                        <Chip
                            size="small"
                            label={data?.status ?? (isLoading ? "Loading…" : isError ? "Error" : "—")}
                            color={
                                succeeded ? "success" : failed ? "error" : data?.status === "Running" ? "info" : "default"
                            }
                            variant="outlined"
                        />
                        {typeof data?.progress === "number" && !terminal && (
                            <Typography variant="caption" color="text.secondary">
                                {Math.round((data.progress ?? 0) * 100)}%
                            </Typography>
                        )}
                    </Stack>

                    {/* Summary line for succeeded tasks */}
                    {succeeded && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Total insights: <b>{insightArtifacts.length}</b> • Total tokens:{" "}
                            <b>{totalTokens}</b> • Estimated cost: <b>{centsDisplay}</b>
                        </Typography>
                    )}

                    {/* Pending details */}
                    {!terminal && (
                        <>
                            <Typography variant="body2" color="text.secondary">
                                {payload.focus ? `Focus: ${payload.focus}` : "No focus provided."}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {payload.numberOfInsights != null
                                    ? `Requested ${payload.numberOfInsights} insight(s).`
                                    : "Letting the AI agent choose focus & count."}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                                <LinearProgress />
                            </Box>
                        </>
                    )}

                    {/* Terminal details */}
                    {terminal && (
                        <Box sx={{ mt: 0.5 }}>
                            {succeeded ? (
                                <Stack spacing={0.75}>
                                    {insightArtifacts.length > 0 ? (
                                        insightArtifacts.map((a) => (
                                            <Box
                                                key={a.id}
                                                sx={{
                                                    p: 1,
                                                    border: (t) => `1px solid ${t.palette.divider}`,
                                                    borderRadius: 1.5,
                                                }}
                                            >
                                                <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" sx={{ mb: 0.5 }}>
                                                    <Chip size="small" label={`Insight #${a.createdResourceId}`} />
                                                    {typeof a.totalTokens === "number" && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            {a.totalTokens} tokens
                                                        </Typography>
                                                    )}
                                                    {a.createdAt && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            • {new Date(a.createdAt).toLocaleString()}
                                                        </Typography>
                                                    )}
                                                </Stack>
                                                <InsightPreview insightId={a.createdResourceId as number} />
                                            </Box>
                                        ))
                                    ) : (
                                        <Alert severity="info" variant="outlined">
                                            Task succeeded, but no insight artifacts were returned.
                                        </Alert>
                                    )}
                                </Stack>
                            ) : failed ? (
                                <Alert severity="error" variant="outlined">
                                    {data?.errorMessage || "Task failed."}
                                </Alert>
                            ) : (
                                <Alert severity="warning" variant="outlined">
                                    Task was canceled.
                                </Alert>
                            )}
                        </Box>
                    )}
                </Stack>

                {/* Right-side actions */}
                <Stack alignItems="flex-end" gap={1} flexShrink={0}>
                    {terminal && (
                        <Button size="small" variant="outlined" onClick={() => onDismiss?.(taskId)}>
                            Dismiss
                        </Button>
                    )}
                </Stack>
            </Stack>
        </Paper>
    );
}
