import * as React from "react";
import {
    Box,
    Chip,
    Container,
    Divider,
    IconButton,
    Paper,
    Skeleton,
    Stack,
    Tooltip,
    Typography,
    Button,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ProjectStepper from "./ProjectStepper";
import { Link as RouterLink } from "react-router-dom";

import { useAppSelector } from "../../store/hooks";
import { useGetApiProjectsByIdQuery } from "../../api/projectsApi";

export default function ProjectOverviewPage() {
    const projectId = useAppSelector((s) => s.selected.projectId);

    const {
        data: project,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useGetApiProjectsByIdQuery(
        { id: projectId as number },
        { skip: projectId == null }
    );

    const copy = (value?: string | number | null) => {
        if (value == null) return;
        navigator.clipboard?.writeText(String(value)).catch(() => {});
    };

    const formatDate = (iso?: string | null) => {
        if (!iso) return "—";
        const d = new Date(iso);
        return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
    };

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            <ProjectStepper active="overview" />

            <Paper
                elevation={0}
                sx={{
                    mt: 2,
                    p: { xs: 2, md: 3 },
                    borderRadius: 3,
                    border: (t) => `1px solid ${t.palette.divider}`,
                }}
            >
                {/* Header */}
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    justifyContent="space-between"
                    gap={1.5}
                >
                    <Stack spacing={0.5}>
                        <Typography variant="h5">
                            {isLoading ? <Skeleton width={240} /> : project?.name ?? "—"}
                        </Typography>

                        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                            <Typography variant="body2" color="text.secondary">
                                Project ID:&nbsp;
                                {isLoading ? (
                                    <Skeleton width={80} sx={{ display: "inline-block" }} />
                                ) : (
                                    project?.id ?? "—"
                                )}
                            </Typography>
                            <IconButton
                                aria-label="Copy project id"
                                size="small"
                                onClick={() => copy(project?.id)}
                                disabled={!project?.id}
                            >
                                <ContentCopyIcon fontSize="inherit" />
                            </IconButton>

                            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                            <Typography variant="body2" color="text.secondary">
                                KB ID:&nbsp;
                                {isLoading ? (
                                    <Skeleton width={140} sx={{ display: "inline-block" }} />
                                ) : (
                                    project?.kbid ?? "—"
                                )}
                            </Typography>
                            <IconButton
                                aria-label="Copy KB id"
                                size="small"
                                onClick={() => copy(project?.kbid)}
                                disabled={!project?.kbid}
                            >
                                <ContentCopyIcon fontSize="inherit" />
                            </IconButton>
                        </Stack>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                        {!isLoading && (
                            <Chip
                                label={project?.isActive ? "Active" : "Inactive"}
                                color={project?.isActive ? "success" : "default"}
                                variant={project?.isActive ? "filled" : "outlined"}
                                size="small"
                            />
                        )}
                        <Tooltip title="Refresh project details">
              <span>
                <IconButton onClick={() => refetch()} disabled={isFetching || projectId == null}>
                  <RefreshIcon />
                </IconButton>
              </span>
                        </Tooltip>
                    </Stack>
                </Stack>

                <Divider sx={{ my: 2.5 }} />

                {/* Content */}
                {projectId == null ? (
                    <EmptyState />
                ) : isError ? (
                    <ErrorState error={error} onRetry={refetch} />
                ) : (
                    // two-column layout without MUI Grid
                    <Stack direction={{ xs: "column", md: "row" }} gap={2.5}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <SectionTitle title="Details" />
                                <DetailRow label="Organization ID" value={project?.organizationId} loading={isLoading} />
                                <DetailRow label="Context" value={project?.projectContext} loading={isLoading} multiline />
                                <DetailRow label="Created" value={formatDate(project?.createdAt)} loading={isLoading} />
                                <DetailRow label="Updated" value={formatDate(project?.updatedAt)} loading={isLoading} />
                                <DetailRow label="Last Refreshed" value={formatDate(project?.lastRefreshed)} loading={isLoading} />
                            </Paper>
                        </Box>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <SectionTitle title="Quick Actions" />
                                <Stack direction="row" flexWrap="wrap" gap={1}>
                                    <Button
                                        component={RouterLink}
                                        to={`/projects/${projectId}/import`}
                                        variant="contained"
                                        disableElevation
                                    >
                                        Import & Setup
                                    </Button>
                                    <Button component={RouterLink} to={`/projects/${projectId}/insights`} variant="outlined">
                                        Insights
                                    </Button>
                                    <Button component={RouterLink} to={`/projects/${projectId}/memo`} variant="outlined">
                                        Memo
                                    </Button>
                                    <Button component={RouterLink} to={`/projects/${projectId}/slides`} variant="outlined">
                                        Slides
                                    </Button>
                                </Stack>


                            </Paper>
                        </Box>
                    </Stack>
                )}
            </Paper>
        </Container>
    );
}

/* ---------- Small presentational helpers ---------- */

function SectionTitle({ title }: { title: string }) {
    return (
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
            {title}
        </Typography>
    );
}

function DetailRow({
                       label,
                       value,
                       loading,
                       multiline,
                   }: {
    label: string;
    value?: React.ReactNode;
    loading?: boolean;
    multiline?: boolean;
}) {
    return (
        <Stack direction="row" spacing={2} sx={{ py: 0.75 }}>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 160 }}>
                {label}
            </Typography>
            <Box sx={{ flex: 1 }}>
                {loading ? (
                    <Skeleton width="60%" />
                ) : multiline ? (
                    <Typography sx={{ whiteSpace: "pre-wrap" }}>{value ?? "—"}</Typography>
                ) : (
                    <Typography>{value ?? "—"}</Typography>
                )}
            </Box>
        </Stack>
    );
}

function EmptyState() {
    return (
        <Box
            sx={{
                p: 4,
                border: (t) => `1px dashed ${t.palette.divider}`,
                borderRadius: 2,
                textAlign: "center",
                color: "text.secondary",
            }}
        >
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                No project selected
            </Typography>
            <Typography variant="body2">
                Choose a project to see its overview. Once selected, details will appear here.
            </Typography>
        </Box>
    );
}

function ErrorState({
                        error,
                        onRetry,
                    }: {
    error: unknown;
    onRetry: () => void;
}) {
    const message =
        typeof error === "object" && error && "status" in (error as any)
            ? `Failed to load project (${(error as any).status}).`
            : "Failed to load project.";
    return (
        <Box
            sx={{
                p: 4,
                border: (t) => `1px dashed ${t.palette.error.light}`,
                borderRadius: 2,
                textAlign: "center",
            }}
        >
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                {message}
            </Typography>
            <Button variant="outlined" onClick={onRetry}>
                Retry
            </Button>
        </Box>
    );
}
