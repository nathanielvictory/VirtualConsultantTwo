import { Container, Paper, Stack, Typography, Button, Chip, TextField, Divider, Card, CardContent, CardActions, Box } from "@mui/material";
import ProjectStepper from "./ProjectStepper";
import { useParams } from "react-router-dom";

const MockInsight = ({ i }: { i: number }) => (
    <Card variant="outlined">
        <CardContent>
            <Typography variant="subtitle1">Insight #{i}</Typography>
            <Typography color="text.secondary" variant="body2">Static description placeholder…</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip label="Tag A" size="small" />
                <Chip label="Tag B" size="small" />
            </Stack>
        </CardContent>
        <CardActions>
            <Button size="small">Refine</Button>
            <Button size="small">View data</Button>
            <Button size="small">Add to memo</Button>
        </CardActions>
    </Card>
);

export default function InsightsPage() {
    const { id = "vc-001" } = useParams();
    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <ProjectStepper active="insights" />

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <Paper sx={{ flex: 1, p: 2 }}>
                    <Typography variant="subtitle1">Focus</Typography>
                    <TextField label="What should we explore?" placeholder="Drivers of NPS among Gen Z" fullWidth sx={{ mt: 1 }} />
                    <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                        <Chip label="Gen Z" />
                        <Chip label="NPS" />
                    </Stack>
                    <Divider sx={{ my: 2 }} />
                    <Button fullWidth variant="contained">Generate insights</Button>
                    <Button fullWidth sx={{ mt: 1 }}>Add manual insight</Button>
                </Paper>

                <Box flex={2}>
                    <Stack spacing={1.5}>
                        {[1, 2, 3].map((i) => <MockInsight key={i} i={i} />)}
                    </Stack>
                </Box>

                <Paper sx={{ flex: 1, p: 2 }}>
                    <Typography variant="subtitle1">Selected for memo</Typography>
                    <Stack sx={{ mt: 1 }} spacing={1}>
                        <Chip label="Top driver" />
                        <Chip label="Segment diff" />
                    </Stack>
                    <Button href={`/projects/${id}/memo`} variant="contained" sx={{ mt: 2 }} fullWidth>Proceed to Memo</Button>
                </Paper>
            </Stack>
        </Container>
    );
}