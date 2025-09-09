// src/pages/Home/HomePage.tsx
import {
    Container,
    Box,
    Paper,
    Stack,
    Typography,
    Button,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Divider,
    Chip,
} from "@mui/material";
import {
    Home as HomeIcon,
    CloudUpload,
    PlayCircle,
    Tune,
    AutoAwesome,
} from "@mui/icons-material";

export default function HomePage() {
    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Welcome / hero */}
            <Paper>
                <Stack spacing={2} sx={{ p: { xs: 2.5, md: 3 } }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <HomeIcon />
                        <Typography variant="h5">Welcome</Typography>
                    </Stack>

                    <Typography color="text.secondary">
                        This is your home screen. We’ll add content and visualizations here soon.
                    </Typography>

                    {/* Quick actions (examples only; wire up as needed) */}
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Button startIcon={<PlayCircle />} variant="contained">
                            Start
                        </Button>
                        <Button startIcon={<CloudUpload />} variant="outlined">
                            Upload
                        </Button>
                        <Button startIcon={<Tune />} variant="text">
                            Configure
                        </Button>
                    </Stack>

                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Chip size="small" label="Getting started" />
                        <Chip size="small" icon={<AutoAwesome />} label="Tips" />
                    </Stack>
                </Stack>
            </Paper>

            {/* Content rows */}
            <Box sx={{ mt: 2, display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 2 }}>
                {/* Left column */}
                <Box sx={{ flex: 2, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                    <Paper>
                        <Stack spacing={1.5} sx={{ p: { xs: 2, md: 2.5 } }}>
                            <Typography variant="h6">Recent activity</Typography>
                            <List>
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar>VM</Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary="Welcome to Victory Modeling" secondary="A moment ago" />
                                </ListItem>
                                <Divider component="li" />
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar>
                                            <CloudUpload />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary="No uploads yet" secondary="Upload a file to get started" />
                                </ListItem>
                                <Divider component="li" />
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar>
                                            <Tune />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary="No configurations yet" secondary="Set preferences in Settings" />
                                </ListItem>
                            </List>
                        </Stack>
                    </Paper>
                </Box>

                {/* Right column */}
                <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                    <Paper>
                        <Stack spacing={1} sx={{ p: { xs: 2, md: 2.5 } }}>
                            <Typography variant="h6">Shortcuts</Typography>
                            <Stack spacing={1}>
                                <Button fullWidth variant="contained" startIcon={<PlayCircle />}>
                                    Open Assistant
                                </Button>
                                <Button fullWidth variant="outlined" startIcon={<CloudUpload />}>
                                    Upload a Dataset
                                </Button>
                                <Button fullWidth variant="text" startIcon={<Tune />}>
                                    Settings
                                </Button>
                            </Stack>
                        </Stack>
                    </Paper>
                </Box>
            </Box>
        </Container>
    );
}
