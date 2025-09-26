// src/pages/memoComponents/MemoCreator.tsx
import { useState } from 'react';
import {
    Box,
    Button,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useAppSelector } from '../../../store/hooks'; // adjust path as needed
import { useNavigate } from 'react-router-dom';

export type MemoCreatorProps = {
    /** Called when the mock "Create" succeeds. Returns the draft data. */
    onSuccess: () => void;
};

/**
 * MemoCreator (mock)
 * - Mock creator with a single "Name" input.
 * - Pressing Create invokes onSuccess with the draft, no API calls yet.
 */
export default function MemoCreator({ onSuccess }: MemoCreatorProps) {
    const [name, setName] = useState<string>('');
    const googleToken = useAppSelector((state) => state.googleAuth.accessToken);
    const navigate = useNavigate();

    if (!googleToken) {
        return (
            <Box>
                <Typography variant="h6" gutterBottom>
                    You must be authenticated with Google to create a memo
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

    return (
        <>
            <Typography variant="h6">Create a memo</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                This is a mock creator. Enter a name and click Create.
            </Typography>

            <Box sx={{ mt: 2 }}>
                <TextField
                    fullWidth
                    label="Name"
                    placeholder="e.g., Competitive analysis notes"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </Box>

            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button
                    variant="contained"
                    onClick={() => onSuccess()}
                    disabled={!name.trim()}
                >
                    Create
                </Button>
            </Stack>
        </>
    );
}
