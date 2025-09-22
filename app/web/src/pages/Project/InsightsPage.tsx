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

import { useAppSelector } from "../../store/hooks";
import CreateInsight from "./insightComponents/CreateInsight";
import InsightsList from "./insightComponents/InsightsList";
import GenerateInsightsDialog from "./insightComponents/GenerateInsightsDialog";
import InsightTaskList from "./insightComponents/InsightTaskList.tsx";
// (coming next)
// import InsightTaskList from "./insightComponents/InsightTaskList";

export default function InsightsPage() {
    const selectedProjectId = useAppSelector((s) => s.selected.projectId);
    const { id: routeId } = useParams<{ id: string }>();
    const projectId =
        (selectedProjectId as number | undefined) ?? (routeId ? Number(routeId) : undefined);

    // UI state for dialog + pending tasks
    const [showGenerateDialog, setShowGenerateDialog] = useState(false);
    const [hasPendingTask, setHasPendingTask] = useState(true);
    const [lastQueuedTaskId, setLastQueuedTaskId] = useState<number | null>(null);
    const [listRefreshKey, setListRefreshKey] = useState(0);

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
                {true && (
                    <InsightTaskList
                        projectId={projectId}
                        highlightTaskId={lastQueuedTaskId}
                        listPollEveryMs={2000}
                        taskPollEveryMs={1500}
                        onAnyTaskCompleted={() => {
                            // bump key to remount <InsightsList> and trigger fresh fetch
                            setListRefreshKey((k) => k + 1);
                        }}
                        onComplete={() => {
                            setHasPendingTask(false);
                            setLastQueuedTaskId(null);
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
                <InsightsList key={listRefreshKey} projectId={projectId} />
            </Box>

            {showGenerateDialog && (
                <GenerateInsightsDialog
                    open
                    projectId={projectId}
                    onCancel={() => setShowGenerateDialog(false)}
                    onSuccess={(taskId) => {
                        setShowGenerateDialog(false);
                        setHasPendingTask(true);
                        setLastQueuedTaskId(taskId);
                    }}
                />
            )}
        </Container>
    );
}
