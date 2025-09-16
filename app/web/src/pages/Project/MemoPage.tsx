import { Container, Paper, Stack, Typography, Button, Divider, List, ListItem, ListItemText, Alert, Box } from "@mui/material";
import ProjectStepper from "./ProjectStepper";
import { useParams } from "react-router-dom";

export default function MemoPage() {
    const { id = "vc-001" } = useParams();
    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <ProjectStepper active="memo" />

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <Paper sx={{ flex: 1, p: 2 }}>
                    <Typography variant="subtitle1">Outline</Typography>
                    <List dense>
                        {["Executive Summary", "Key Drivers", "Recommendations"].map((t) => (
                            <ListItem key={t}><ListItemText primary={t} /></ListItem>
                        ))}
                    </List>
                    <Button fullWidth variant="outlined">Add section</Button>
                </Paper>

                <Box flex={2}>
                    <Paper sx={{ p: 2, minHeight: 360 }}>
                        <Typography variant="subtitle1">Section: Executive Summary</Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="body2" color="text.secondary">Draft content placeholder…</Typography>
                    </Paper>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Button variant="contained">Draft section</Button>
                        <Button>Push to Google Doc</Button>
                    </Stack>
                    <Alert sx={{ mt: 1 }} severity="info">Google permissions requested at this step (placeholder).</Alert>
                </Box>

                <Paper sx={{ flex: 1, p: 2 }}>
                    <Typography variant="subtitle1">Insight Library</Typography>
                    <List dense>
                        {["Response time drives NPS", "Gen Z prefers chat"].map((t) => (
                            <ListItem key={t} secondaryAction={<Button size="small">Insert</Button>}>
                                <ListItemText primary={t} />
                            </ListItem>
                        ))}
                    </List>
                    <Button href={`/projects/${id}/slides`} variant="contained" fullWidth>Proceed to Slides</Button>
                </Paper>
            </Stack>
        </Container>
    );
}