import {
    Container, Paper, Stack, Typography, Box,
} from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

export default function HomePage() {
    return (
        <Container maxWidth={false} sx={{ py: 4 }}>
            <Paper>
                <Stack spacing={2} sx={{ p: { xs: 2.5, md: 3 } }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <HomeIcon />
                        <Typography variant="h5">Home</Typography>
                    </Stack>

                    <Typography color="text.secondary">
                        Welcome to your workspace. Follow the steps below to connect your Google account and start working with projects and AI insights.
                    </Typography>
                </Stack>
            </Paper>

            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Google Authentication Section */}
                <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 } }}>
                    <Stack spacing={1.5}>
                        <Typography variant="h6">Google Authentication</Typography>
                        <Typography color="text.secondary">
                            Go to <strong>Settings</strong> and link your Google account in order to create and modify Google Docs and Slides.
                        </Typography>
                    </Stack>
                </Paper>

                {/* Project Selection Section */}
                <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 } }}>
                    <Stack spacing={1.5}>
                        <Typography variant="h6">Select a Project</Typography>
                        <Typography color="text.secondary">
                            Pick an existing project to get started with. You can update the data to match the default project of
                            <strong>reporting.victorymodeling.com</strong> using <strong>Data Refresh</strong>,
                            then get started with the AI Agent in <strong>Insights</strong>.
                        </Typography>
                    </Stack>
                </Paper>
            </Box>
        </Container>
    );
}
