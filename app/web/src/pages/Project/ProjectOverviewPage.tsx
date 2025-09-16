import { Container, Paper, Stack, Typography, Chip, Button, Divider, Box } from "@mui/material";
import ProjectStepper from "./ProjectStepper";
import { Link as RouterLink, useParams } from "react-router-dom";

export default function ProjectOverviewPage() {
    const { id = "vc-001" } = useParams();
    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            <ProjectStepper active="overview" />

            <Paper sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack>
                        <Typography variant="h5">Virtual Consultant</Typography>
                        <Typography variant="body2" color="text.secondary">Project ID: {id} • Last synced: —</Typography>
                    </Stack>
                    <Chip label="Draft" color="default" />
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <Box flex={1}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="subtitle1">Status</Typography>
                            <Typography>Import & Setup: <b>Not started</b></Typography>
                            <Typography>Insights: <b>Waiting for import</b></Typography>
                            <Typography>Memo: <b>Blocked</b></Typography>
                            <Typography>Slides: <b>Blocked</b></Typography>
                            <Button component={RouterLink} to={`/projects/${id}/import`} variant="contained" sx={{ mt: 2 }}>Start Import</Button>
                        </Paper>
                    </Box>

                    <Box flex={1}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="subtitle1">Shortcuts</Typography>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 1 }}>
                                <Button component={RouterLink} to={`/data-review`} variant="text">Open Data Review</Button>
                                <Button component={RouterLink} to={`/projects/${id}/insights`} variant="text">Insights</Button>
                                <Button component={RouterLink} to={`/projects/${id}/memo`} variant="text">Memo</Button>
                                <Button component={RouterLink} to={`/projects/${id}/slides`} variant="text">Slides</Button>
                            </Stack>
                        </Paper>
                    </Box>
                </Stack>
            </Paper>
        </Container>
    );
}