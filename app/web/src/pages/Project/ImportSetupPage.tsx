import { Container, Paper, Stack, Typography, Button, TextField, Divider, Checkbox, FormControlLabel, Alert } from "@mui/material";
import ProjectStepper from "./ProjectStepper";
import { useParams } from "react-router-dom";

export default function ImportSetupPage() {
    const { id = "vc-001" } = useParams();
    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            <ProjectStepper active="import" />

            <Paper sx={{ p: 3 }}>
                <Typography variant="h6">Import from Data System</Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>Select a project and confirm mappings. This is static UI for now.</Typography>

                <Stack spacing={2}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                        <TextField fullWidth label="Source Project" placeholder="Search…" />
                        <Button variant="outlined">Preview sample</Button>
                    </Stack>

                    <Divider />
                    <Typography variant="subtitle1">Variable mapping</Typography>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                        <TextField fullWidth label="Respondent ID" />
                        <TextField fullWidth label="Timestamp" />
                        <TextField fullWidth label="Weight" />
                    </Stack>
                    <FormControlLabel control={<Checkbox defaultChecked />} label="Redact PII fields" />
                </Stack>

                <Alert severity="info" sx={{ mt: 2 }}>Validation: 0 blockers, 3 warnings.</Alert>

                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Button variant="contained" href={`/projects/${id}/insights`}>Confirm & Continue</Button>
                    <Button variant="text">Save draft</Button>
                </Stack>
            </Paper>
        </Container>
    );
}