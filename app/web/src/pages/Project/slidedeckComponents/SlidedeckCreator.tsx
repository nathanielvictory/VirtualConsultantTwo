// src/pages/slidedeckComponents/SlidedeckCreator.tsx
import { useState, useMemo } from 'react';
import {
    Box,
    Button,
    Stack,
    TextField,
    Typography,
    Alert,
    CircularProgress,
} from '@mui/material';
import { useAppSelector } from '../../../store/hooks';
import { useNavigate } from 'react-router-dom';
import { useCreateSlidedeckWithGoogleAssets } from '../../../hooks/useCreateSlidedeckWithGoogleAssets';

export type SlidedeckCreatorProps = {
    onSuccess: (slidedeckId: number | null) => void; // <-- updated
};

export default function SlidedeckCreator({ onSuccess }: SlidedeckCreatorProps) {
    const [name, setName] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);

    const googleToken = useAppSelector((state) => state.googleAuth.accessToken);
    const projectId = useAppSelector((state) => state.selected.projectId);

    const navigate = useNavigate();
    const { create, isLoading, isError, error } = useCreateSlidedeckWithGoogleAssets();

    const busy = useMemo(() => isLoading || submitting, [isLoading, submitting]);

    if (!googleToken) {
        return (
            <Box>
                <Typography variant="h6" gutterBottom>
                    You must be authenticated with Google to create a slidedeck
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/settings')}
                >
                    Go to Settings
                </Button>
            </Box>
        );
    }

    if (!projectId) {
        return (
            <Box>
                <Typography variant="h6" gutterBottom>
                    No project selected
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Please select a project before creating a slidedeck.
                </Typography>
            </Box>
        );
    }

    const handleCreate = async () => {
        if (busy) return;
        setSubmitting(true);
        try {
            const { slidedeck } = await create({
                projectId,
                name: (name && name.trim()) || 'Untitled',
            });
            // assuming create returns the new slidedeck object with an `id` field
            if (slidedeck?.id) {
                onSuccess(slidedeck.id);
            } else {
                console.warn('No id returned from create', slidedeck);
                onSuccess(null);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Typography variant="h6">Create a slidedeck</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Enter a name and click Create. We’ll create a Google Doc and link it to your slidedeck.
            </Typography>

            <Box sx={{ mt: 2 }} aria-busy={busy}>
                <TextField
                    fullWidth
                    label="Name"
                    placeholder="e.g., Competitive analysis notes"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={busy}
                />
            </Box>

            {isError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {typeof (error as any)?.data === 'string'
                        ? (error as any).data
                        : (error as any)?.data?.message ||
                        (error as any)?.error ||
                        'Failed to create slidedeck.'}
                </Alert>
            )}

            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button
                    variant="contained"
                    onClick={handleCreate}
                    disabled={busy}
                    startIcon={
                        busy ? <CircularProgress size={18} thickness={5} /> : undefined
                    }
                >
                    {busy ? 'Creating…' : 'Create'}
                </Button>
                <Button
                    variant="outlined"
                    onClick={() => setName('')}
                    disabled={busy || !name}
                >
                    Reset
                </Button>
            </Stack>
        </>
    );
}
