import { useState } from 'react';
import {
    Box,
    Button,
    Container,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ProjectStepper from "./ProjectStepper";
import { useParams } from "react-router-dom";

import {useAppDispatch, useAppSelector} from "../../store/hooks";
import CreateInsight from "./insightComponents/CreateInsight";
import InsightsList from "./insightComponents/InsightsList";
import GenerateInsightsDialog from "./insightComponents/GenerateInsightsDialog";
import InsightTaskList from "./insightComponents/InsightTaskList.tsx";
import { insightsApi } from "../../api/insightsApi";

export default function InsightsPage() {
    const selectedProjectId = useAppSelector((s) => s.selected.projectId);
    const { id: routeId } = useParams<{ id: string }>();
    const projectId =
        (selectedProjectId as number | undefined) ?? (routeId ? Number(routeId) : undefined);
    const dispatch = useAppDispatch();
    // UI state for dialog + pending tasks
    const [showGenerateDialog, setShowGenerateDialog] = useState(false);
    const [hasPendingTask, setHasPendingTask] = useState(false);

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            <ProjectStepper active="insights" />

            <Box
                sx={{
                    p: { xs: 2, md: 3 },
                    mt: 2,
                    borderRadius: 3,
                    border: (t) => `1px solid ${t.palette.divider}`,
                    bgcolor: "background.paper",
                }}
            >
                {/* Header / actions */}
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    gap={1.5}
                    sx={{ mb: 2 }}
                >
                    <Typography variant="h6">Insights</Typography>

                    <Tooltip title="Generate insights with background task">
            <span>
              <Button
                  variant="outlined"
                  startIcon={<AutoAwesomeIcon />}
                  onClick={() => setShowGenerateDialog(true)}
                  disabled={!projectId}
              >
                Generate Insights
              </Button>
            </span>
                    </Tooltip>
                </Stack>

                {/* Pending tasks view (next step) */}
                {hasPendingTask && (
                    <InsightTaskList
                        projectId={projectId}
                        listPollEveryMs={2000}
                        taskPollEveryMs={1500}
                        onAnyTaskCompleted={() => {
                            console.log("Task completed")
                            dispatch(insightsApi.util.invalidateTags(["Insights"]));
                        }}
                        onComplete={() => {
                            setHasPendingTask(false);
                        }}
                    />
                )}


                {/* Create insight */}
                <CreateInsight
                    projectId={projectId}
                    defaultSource="User"
                    onCreated={() => {
                        // InsightsList handles its own refetch.
                    }}
                />

                {/* List */}
                <InsightsList projectId={projectId} />
            </Box>

            {showGenerateDialog && (
                <GenerateInsightsDialog
                    projectId={projectId}
                    onCancel={() => setShowGenerateDialog(false)}
                    onSuccess={() => {
                        setShowGenerateDialog(false);
                        setHasPendingTask(true);
                    }}
                />
            )}
        </Container>
    );
}
