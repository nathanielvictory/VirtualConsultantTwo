import { useState } from "react";
import {
    Alert,
    Box,
    Button,
    Container,
    Paper,
    Snackbar,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";
import ProjectStepper from "./ProjectStepper";
import { useParams } from "react-router-dom";

import { useAppSelector } from "../../store/hooks";
import {
    useGetApiProjectsByIdQuery,
    usePatchApiProjectsByIdMutation,
} from "../../api/projectsApi";
import { usePostApiQueueTaskSurveyDataMutation } from "../../api/tasksApi";
import TaskStatusPoller from "../../components/TaskStatusPoller";
import ProjectContextEditor from "./components/ProjectContextEditor.tsx"


export default function ImportSetupPage() {
    const selectedProjectId = useAppSelector((s) => s.selected.projectId);
    const { id: routeId } = useParams<{ id: string }>();
    const numericId =
        (selectedProjectId as number | undefined) ??
        (routeId ? Number(routeId) : undefined);

    const {
        data: project,
        isLoading,
        isError,
        isFetching,
        refetch,
    } = useGetApiProjectsByIdQuery(
        { id: numericId as number },
        { skip: numericId == null }
    );

    const [patchProject, { isLoading: isSaving }] =
        usePatchApiProjectsByIdMutation();
    const [queueSurveyData, { isLoading: isQueuing }] =
        usePostApiQueueTaskSurveyDataMutation();

    const [taskId, setTaskId] = useState<number | null>(null);
    const [snack, setSnack] = useState<{
        open: boolean;
        msg: string;
        severity: "success" | "info" | "error";
    }>({
        open: false,
        msg: "",
        severity: "success",
    });

    const originalContext = project?.projectContext ?? "";

    const onSaveContext = async (nextContext: string) => {
        if (!numericId) return;
        try {
            await patchProject({
                id: numericId,
                updateProjectDto: { projectContext: nextContext },
            }).unwrap();
            setSnack({
                open: true,
                msg: "Project context saved.",
                severity: "success",
            });
            refetch();
        } catch {
            setSnack({
                open: true,
                msg: "Failed to save context.",
                severity: "error",
            });
        }
    };

    const onQueueRefresh = async () => {
        if (!numericId) return;
        try {
            const res = await queueSurveyData({
                queueCreateSurveyDataTaskDto: { projectId: numericId },
            }).unwrap();
            const newId = (res as any)?.id as number | undefined;
            if (newId) {
                setTaskId(newId);
                setSnack({
                    open: true,
                    msg: `Refresh queued (task #${newId}).`,
                    severity: "info",
                });
            } else {
                setSnack({
                    open: true,
                    msg: "Refresh queued (no task id in response).",
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
                            t.palette.mode === "light"
                                ? t.palette.grey[50]
                                : t.palette.background.default,
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
                                <Typography variant="subtitle1">
                                    {project?.name ?? "—"}
                                </Typography>
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
                      onClick={onQueueRefresh}
                      disabled={
                          numericId == null || isFetching || isQueuing
                      }
                  >
                    {isQueuing ? "Queuing…" : "Refresh Data"}
                  </Button>
                </span>
                            </Tooltip>
                        </Stack>
                    )}
                </Box>

                {/* Task status (reusable poller) */}
                {taskId != null && (
                    <TaskStatusPoller
                        taskId={taskId}
                        pollIntervalMs={2000}
                        title="Refresh Status"
                        onComplete={() => {
                            // after success/fail, refresh the project metadata (e.g., lastRefreshed)
                            refetch();
                        }}
                    />
                )}

                {/* Context editor */}
                <ProjectContextEditor
                    key={`ctx:${project?.id ?? "none"}:${originalContext}`}
                    originalContext={originalContext}
                    disabled={isLoading || numericId == null}
                    isSaving={isSaving}
                    numericId={numericId}
                    onSaveContext={onSaveContext}
                />
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
