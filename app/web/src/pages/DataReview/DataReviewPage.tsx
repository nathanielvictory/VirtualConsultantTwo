import { Container, Paper, Stack, Typography, TextField, ToggleButton, ToggleButtonGroup, Tabs, Tab, Box, Button } from "@mui/material";
import { useState } from "react";

export default function DataReviewPage() {
    const [tab, setTab] = useState(0);
    const [weights, setWeights] = useState("on");

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <Stack spacing={2}>
                <Paper sx={{ p: 2 }}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                        <TextField fullWidth label="Project" placeholder="Virtual Consultant" />
                        <TextField fullWidth label="Filter preset" placeholder="Gen Z • US" />
                        <ToggleButtonGroup value={weights} exclusive onChange={(_,v)=>v&&setWeights(v)}>
                            <ToggleButton value="on">Weights On</ToggleButton>
                            <ToggleButton value="off">Weights Off</ToggleButton>
                        </ToggleButtonGroup>
                    </Stack>
                </Paper>

                <Paper sx={{ p: 2 }}>
                    <Tabs value={tab} onChange={(_,v)=>setTab(v)}>
                        <Tab label="Summary" />
                        <Tab label="Crosstabs" />
                        <Tab label="Trends" />
                        <Tab label="Verbatims" />
                    </Tabs>
                    <Box sx={{ mt: 2 }}>
                        {tab === 0 && <Typography color="text.secondary">Toplines table placeholder</Typography>}
                        {tab === 1 && <Typography color="text.secondary">Crosstab grid placeholder</Typography>}
                        {tab === 2 && <Typography color="text.secondary">Trend chart placeholder</Typography>}
                        {tab === 3 && <Typography color="text.secondary">Verbatims list placeholder</Typography>}
                    </Box>
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                        <Button variant="outlined">Export CSV</Button>
                        <Button>Save as Focus</Button>
                    </Stack>
                </Paper>
            </Stack>
        </Container>
    );
}