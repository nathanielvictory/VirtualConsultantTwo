import { Container, Paper, Stack, Typography, Button, Select, MenuItem, FormControl, InputLabel, ImageList, ImageListItem, Box } from "@mui/material";
import ProjectStepper from "./ProjectStepper";

export default function SlidesPage() {
    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <ProjectStepper active="slides" />

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <Paper sx={{ flex: 1, p: 2 }}>
                    <Typography variant="subtitle1">Template</Typography>
                    <FormControl fullWidth sx={{ mt: 1 }}>
                        <InputLabel id="theme-label">Theme</InputLabel>
                        <Select labelId="theme-label" defaultValue="Executive">
                            <MenuItem value="Executive">Executive Readout</MenuItem>
                            <MenuItem value="Deep Dive">Deep Dive</MenuItem>
                            <MenuItem value="Board">Board Deck</MenuItem>
                        </Select>
                    </FormControl>
                    <Button fullWidth variant="contained" sx={{ mt: 2 }}>Create deck</Button>
                    <Button fullWidth sx={{ mt: 1 }}>Update deck</Button>
                </Paper>

                <Box flex={2}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>Slide preview (static)</Typography>
                        <ImageList cols={3} gap={8}>
                            {[1, 2, 3].map((i) => (
                                <ImageListItem key={i} sx={{ bgcolor: "action.hover", height: 140, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 1 }}>
                                    <Typography>Slide {i}</Typography>
                                </ImageListItem>
                            ))}
                        </ImageList>
                    </Paper>
                </Box>
            </Stack>
        </Container>
    );
}