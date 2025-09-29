// src/pages/SlidedeckPage.tsx
import { useMemo, useState } from "react";
import {
    Box,
    Button,
    Container,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store";
import { setSlidedeckId } from "../../store/selectedSlice";
import ProjectStepper from "./ProjectStepper";
import SlidedeckSelector from "./slidedeckComponents/SlidedeckSelector";
import SlidedeckCreator from "./slidedeckComponents/SlidedeckCreator";
import { useGetApiSlidedecksByIdQuery } from "../../api/slidedecksApi";
import { getSlidesEditUrl } from '../../integrations/google/slidesApi/presentations.ts';

// ⬇️ adjust this import to your actual file/name (“Dialogue” vs “Dialog”)
import GenerateSlidedeckDialogue from "./slidedeckComponents/GenerateSlidedeckDialog.tsx";

// ⬇️ NEW: poller for background task status
import TaskStatusPoller from "../../components/TaskStatusPoller";
import GoogleSlidesExpander from "./slidedeckComponents/GoogleSlidesExpander.tsx";
import GoogleSheetsExpander from "./slidedeckComponents/GoogleSheetsExpander.tsx"
import {getSheetsEditUrl} from "../../integrations/google/sheetsApi/spreadsheets.ts";

export type SlidedeckViewMode = "Selecting" | "Creating";

export default function SlidedeckPage() {
    const dispatch = useDispatch();
    const projectId =
        useSelector((s: RootState) => s.selected.projectId) ?? null;
    const slidedeckId = useSelector(
        (s: RootState) => s.selected.slidedeckId as number | null
    );

    const [mode, setMode] = useState<SlidedeckViewMode>("Selecting");
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [showGenerateDialog, setShowGenerateDialog] = useState(false);

    const [currentTaskId, setCurrentTaskId] = useState<number | null>(null);

    const { data: currentSlidedeck, isFetching } = useGetApiSlidedecksByIdQuery(
        { id: slidedeckId as number },
        { skip: slidedeckId == null }
    );

    const currentName = useMemo(() => {
        if (slidedeckId == null) return "—";
        if (isFetching) return "Loading...";
        return currentSlidedeck?.name ?? String(slidedeckId);
    }, [slidedeckId, isFetching, currentSlidedeck?.name]);

    const dialogTitle =
        mode === "Selecting" ? "Select a slidedeck" : "Create a new slidedeck";

    const openSelecting = () => {
        setMode("Selecting");
        setDialogOpen(true);
    };

    const openCreating = () => {
        setMode("Creating");
        setDialogOpen(true);
    };

    const closeDialog = () => setDialogOpen(false);

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            {/* Keep stepper alignment with Insights page */}
            <ProjectStepper active="slides" />

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
                    <Typography variant="h6">Slidedecks</Typography>

                    <Tooltip title="Generate a slidedeck from your project context">
                        {/* Tooltip needs a focusable child even when disabled */}
                        <span>
              <Button
                  variant="outlined"
                  startIcon={<AutoAwesomeIcon />}
                  onClick={() => setShowGenerateDialog(true)}
                  disabled={!projectId}
              >
                Generate Slidedeck
              </Button>
            </span>
                    </Tooltip>
                </Stack>

                {/* Current slidedeck summary + actions */}
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", md: "center" }}
                    gap={1.5}
                    sx={{ mb: 1 }}
                >
                    <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Currently selected slidedeck:{" "}
                            {currentSlidedeck?.presentationId ? (
                                <a
                                    href={getSlidesEditUrl(currentSlidedeck.presentationId)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {currentName}
                                </a>
                            ) : (
                                currentName
                            )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Associated Google Sheet:{" "}
                            {currentSlidedeck?.sheetsId ? (
                                <a
                                    href={getSheetsEditUrl(currentSlidedeck.sheetsId)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {currentName} Sheet
                                </a>
                            ) : (
                                currentName
                            )}
                        </Typography>
                    </Box>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                        <Button variant="outlined" onClick={openSelecting}>
                            Select Slidedeck
                        </Button>
                        <Button variant="contained" onClick={openCreating}>
                            Create New Slidedeck
                        </Button>
                    </Stack>
                </Stack>
            </Box>

            {/* Select/Create dialog (unchanged behavior, polished container above) */}
            <Dialog
                open={isDialogOpen}
                onClose={closeDialog}
                fullWidth
                maxWidth="md"
                aria-labelledby="slidedeck-dialog-title"
                keepMounted
            >
                <DialogTitle id="slidedeck-dialog-title">{dialogTitle}</DialogTitle>

                <DialogContent dividers>
                    {mode === "Selecting" && (
                        <SlidedeckSelector
                            projectId={projectId}
                            slidedeckId={slidedeckId}
                            onSelect={(id) => {
                                dispatch(setSlidedeckId(id));
                                closeDialog();
                            }}
                            showTitle={false}
                            showCurrent
                            variant="default"
                        />
                    )}

                    {mode === "Creating" && (
                        <SlidedeckCreator
                            onSuccess={(newId: number | null) => {
                                if (newId != null) dispatch(setSlidedeckId(newId));
                                closeDialog();
                            }}
                        />
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={closeDialog}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Generate slidedeck dialog */}
            {showGenerateDialog && (
                <GenerateSlidedeckDialogue
                    memoId={slidedeckId ?? undefined}
                    onCancel={() => setShowGenerateDialog(false)}
                    onSuccess={(taskId: number) => {
                        setCurrentTaskId(taskId);
                        setShowGenerateDialog(false);
                    }}
                />
            )}

            {/* ⬇️ NEW: show the task status poller if a task is running */}
            {
                currentTaskId &&
                <Box sx={{ mt: 2 }}>
                    <TaskStatusPoller taskId={currentTaskId} key={currentTaskId}/>
                </Box>
            }
            {
                slidedeckId &&
                <>
                <Box sx={{ mt: 3 }}>
                    <GoogleSlidesExpander />
                </Box>
                <Box sx={{ mt: 3 }}>
                    <GoogleSheetsExpander />
                </Box>
                </>

            }
        </Container>
    );
}
