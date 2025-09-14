import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Paper, Stack, Typography, Divider, Box,
} from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import { useAppSelector } from '../../store/hooks';
import DeckSheetPanel from '../../components/google/DeckSheetPanel';

export default function HomePage() {
    const navigate = useNavigate();
    const token = useAppSelector((s) => s.googleAuth.accessToken);

    // Redirect to settings if not connected
    useEffect(() => {
        if (!token) {
            navigate('/settings', { replace: true });
        }
    }, [token, navigate]);

    if (!token) {
        // Brief guard render while redirecting
        return null;
    }

    return (
        <Container maxWidth={false} sx={{ py: 4 }}>
            <Paper>
                <Stack spacing={2} sx={{ p: { xs: 2.5, md: 3 } }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <HomeIcon />
                        <Typography variant="h5">Home</Typography>
                    </Stack>

                    <Typography color="text.secondary">
                        Connected to Google. Use the panel below to create a Doc and append text.
                    </Typography>
                </Stack>
            </Paper>

            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 } }}>
                    <Stack spacing={2}>
                        <Typography variant="h6">Docs Playground</Typography>
                        <Divider />
                        <DeckSheetPanel />
                    </Stack>
                </Paper>
            </Box>
        </Container>
    );
}
