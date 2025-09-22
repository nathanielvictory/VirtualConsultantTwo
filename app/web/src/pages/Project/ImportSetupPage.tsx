import * as React from "react";
import {
    Alert,
    Box,
    Button,
    Container,
    Paper,
    Snackbar,
    Stack,
    TextField,
    Tooltip,
    Typography,
    Chip,
    LinearProgress,
} from "@mui/material";
import ProjectStepper from "./ProjectStepper";
import { useParams, Link as RouterLink } from "react-router-dom";

import { useAppSelector } from "../../store/hooks";
import {
    useGetApiProjectsByIdQuery,
    usePatchApiProjectsByIdMutation,
} from "../../api/projectsApi";
import {
    usePostApiQueueTaskSurveyDataMutation,
    useGetApiTasksByIdQuery,
    type TaskJobStatus,
} from "../../api/tasksApi";

export default function ImportSetupPage() {
    const selectedProjectId = useAppSelector((s) => s.selected.projectId);
    const { id: routeId } = useParams<{ id: string }>();
    const numericId =
        (selectedProjectId as number | undefined) ??
        (routeId ? Number(routeId) : undefined);

    const {
        data: project,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useGetApiProjectsByIdQuery(
        { id: numericId as number },
        { skip: numericId == null }
    );

    const [patchProject, { isLoading: isSaving }] =
        usePatchApiProjectsByIdMutation();

    // queue + task tracking
    const [queueSurveyData, { isLoading: isQueuing }] =
        usePostApiQueueTaskSurveyDataMutation();

    const [queuedTaskId, setQueuedTaskId] = React.useState<number | null>(null);

    // poll the task if we have an id and it's not in a terminal state
    const {
        data: task,
    } = useGetApiTasksByIdQuery(
        { id: queuedTaskId as number },
        {
            skip: queuedTaskId == null,
            // polling interval will be turned off once we detect terminal state below
            pollingInterval: 2000,
        }
    );

    const terminal = isTerminal(task?.status);
    React.useEffect(() => {
        // stop polling once terminal by clearing the task id if you prefer
        // (or keep it to continue showing final status)
        // no-op here; RTK Query will still poll unless we change skip—so we’ll keep the id
        // and rely on the UI not showing "in progress" loaders when terminal.
    }, [terminal]);

    // context editor state
    const [context, setContext] = React.useState<string>("");
    const [snack, setSnack] = React.useState<{
        open: boolean;
        msg: string;
        severity: "success" | "info" | "error";
    }>({ open: false, msg: "", severity: "success" });

    React.useEffect(() => {
        if (project) setContext(project.projectContext ?? "");
    }, [project?.id]); // load once per project

    const originalContext = project?.projectContext ?? "";
    const isDirty = context !== originalContext;

    const onSave = async () => {
        if (!numericId) return;
        try {
            await patchProject({
                id: numericId,
                updateProjectDto: { projectContext: context },
            }).unwrap();
            setSnack({ open: true, msg: "Project context saved.", severity: "success" });
            refetch();
        } catch {
            setSnack({ open: true, msg: "Failed to save context.", severity: "error" });
        }
    };

    const onRefreshData = async () => {
        if (!numericId) return;
        try {
            const res = await queueSurveyData({
                queueCreateSurveyDataTaskDto: { projectId: numericId },
            }).unwrap();

            // try to read task id from body (preferred)
            let newTaskId: number | null =
                (res as any)?.id ??
                (typeof (res as any) === "object" ? (res as any)?.taskId : null);

            // if your API returns the task id in a header, expose it in your baseQuery;
            // here we just fall back to null if missing.
            if (newTaskId == null) {
                // TODO: adapt if your API returns the id differently
            }

            if (newTaskId != null) {
                setQueuedTaskId(newTaskId);
                setSnack({
                    open: true,
                    msg: `Refresh queued (task #${newTaskId}).`,
                    severity: "info",
                });
            } else {
                setSnack({
                    open: true,
                    msg: "Refresh queued. (Task ID not returned by API.)",
                    severity: "info",
                });
            }
        } catch {
            setSnack({
                open: true,
                msg: "Failed to queue refresh.",
                severity: "error",
            });
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            <ProjectStepper active="import" />

            <Paper
                sx={{
                    p: { xs: 2, md: 3 },
                    mt: 2,
                    borderRadius: 3,
                    border: (t) => `1px solid ${t.palette.divider}`,
                }}
            >
                {/* Header */}
                <Stack spacing={0.75} sx={{ mb: 2 }}>
                    <Typography variant="h6">Import & Setup</Typography>
                    <Typography color="text.secondary">
                        Edit your project’s context and refresh survey data.
                    </Typography>
                </Stack>

                {/* Project summary */}
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
                    {numericId == null ? (
                        <Typography color="text.secondary">No project selected.</Typography>
                    ) : isError ? (
                        <Alert severity="error" sx={{ mb: 0 }}>
                            Failed to load project.{" "}
                            <Button size="small" onClick={refetch}>
                                Retry
                            </Button>
                        </Alert>
                    ) : (
                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            justifyContent="space-between"
                            gap={1}
                            alignItems={{ xs: "flex-start", sm: "center" }}
                        >
                            <Stack spacing={0.5}>
                                <Typography variant="subtitle1">{project?.name ?? "—"}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Project ID: {project?.id ?? "—"} • KB: {project?.kbid ?? "—"}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Last refreshed:{" "}
                                    {project?.lastRefreshed
                                        ? new Date(project.lastRefreshed).toLocaleString()
                                        : "—"}
                                </Typography>
                            </Stack>

                            <Tooltip title="Queues a background survey-data refresh and tracks progress">
                <span>
                  <Button
                      variant="outlined"
                      onClick={onRefreshData}
                      disabled={numericId == null || isFetching || isQueuing}
                  >
                    {isQueuing ? "Queuing…" : "Refresh Data"}
                  </Button>
                </span>
                            </Tooltip>
                        </Stack>
                    )}
                </Box>

                {/* Task status (shown when we have a queued task id) */}
                {queuedTaskId != null && (
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
                                <Typography variant="subtitle2">Refresh Status</Typography>
                                <Chip
                                    size="small"
                                    label={task?.status ?? "Queued"}
                                    color={
                                        task?.status === "Succeeded"
                                            ? "success"
                                            : task?.status === "Failed" || task?.status === "Canceled"
                                                ? "error"
                                                : "default"
                                    }
                                    variant={task?.status === "Succeeded" ? "filled" : "outlined"}
                                />
                                <Typography variant="body2" color="text.secondary">
                                    Task #{queuedTaskId}
                                </Typography>
                            </Stack>

                            {task?.progress != null && (
                                <Box>
                                    <LinearProgress variant="determinate" value={clamp(task.progress ?? 0, 0, 100)} />
                                    <Typography variant="caption" color="text.secondary">
                                        {Math.round(clamp(task.progress ?? 0, 0, 100))}% • {task?.jobType ?? "SurveyData"}
                                    </Typography>
                                </Box>
                            )}

                            <Typography variant="caption" color="text.secondary">
                                {formatTimeline(task)}
                            </Typography>
                        </Stack>
                    </Box>
                )}

                {/* Context editor */}
                <Stack spacing={2}>
                    <Typography variant="subtitle1">Project Context</Typography>
                    <TextField
                        label="Context"
                        placeholder="Describe goals, constraints, audience, domain vocabulary…"
                        multiline
                        minRows={6}
                        fullWidth
                        value={context}
                        disabled={isLoading || numericId == null}
                        onChange={(e) => setContext(e.target.value)}
                        helperText={`${context.length}/10,000`}
                        inputProps={{ maxLength: 10000 }}
                    />

                    {/* Actions */}
                    <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                        <Button
                            variant="contained"
                            onClick={onSave}
                            disabled={!isDirty || isSaving || numericId == null}
                        >
                            {isSaving ? "Saving…" : "Save Context"}
                        </Button>
                        <Button
                            variant="text"
                            onClick={() => setContext(originalContext)}
                            disabled={!isDirty || isSaving}
                        >
                            Reset
                        </Button>
                        <Box sx={{ flex: 1 }} />
                        <Button
                            variant="outlined"
                            component={RouterLink}
                            to={`/projects/${numericId ?? ""}/insights`}
                            disabled={isSaving || numericId == null}
                        >
                            Confirm & Continue
                        </Button>
                    </Stack>
                </Stack>
            </Paper>

            <Snackbar
                open={snack.open}
                autoHideDuration={3000}
                onClose={() => setSnack((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setSnack((s) => ({ ...s, open: false }))}
                    severity={snack.severity}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Container>
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
