import { Container, Typography, Divider, Paper, Stack, Button, Chip } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { beginGoogleAuth, setGoogleToken, googleAuthError, clearGoogleAuth } from '../../store/authSlice';
import { requestAccessToken, revokeAccessToken, DEFAULT_SCOPES } from '../../integrations/google';

export default function SettingsPage() {
    const dispatch = useAppDispatch();
    const google = useAppSelector((s) => s.auth.google);

    const connected = !!google.accessToken;
    const expiresInSec =
        google.expiresAt ? Math.max(0, Math.floor((google.expiresAt - Date.now()) / 1000)) : null;

    async function handleConnect() {
        try {
            dispatch(beginGoogleAuth());
            const res = await requestAccessToken({ scopes: DEFAULT_SCOPES, prompt: 'consent' });
            dispatch(setGoogleToken({ accessToken: res.accessToken, expiresIn: res.expiresIn, scopes: DEFAULT_SCOPES }));
        } catch (e: any) {
            // error already normalized upstream; surface message only
            dispatch(googleAuthError(e?.message ?? 'Authorization failed.'));
        }
    }

    async function handleDisconnect() {
        if (!google.accessToken) return;
        try {
            await revokeAccessToken(google.accessToken);
        } catch {
            // best-effort revoke; proceed to clear local state
        } finally {
            dispatch(clearGoogleAuth());
        }
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h5" fontWeight={800} gutterBottom>
                Integrations & Auth
            </Typography>
            <Typography color="text.secondary" gutterBottom>
                Connect your Google account to allow this app to create Docs, Slides, and Sheets.
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Paper variant="outlined" sx={{ p: 3 }}>
                <Stack spacing={2}>
                    <Typography variant="h6">Google</Typography>

                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Typography variant="subtitle2">Scopes:</Typography>
                        {DEFAULT_SCOPES.map((s) => (
                            <Chip key={s} label={s.split('/').pop()} size="small" />
                        ))}
                    </Stack>

                    <Stack direction="row" spacing={2} alignItems="center">
                        {!connected ? (
                            <Button
                                variant="contained"
                                onClick={handleConnect}
                                disabled={google.status === 'loading'}
                            >
                                Connect Google
                            </Button>
                        ) : (
                            <>
                                <Button variant="outlined" color="error" onClick={handleDisconnect}>
                                    Disconnect
                                </Button>
                                <Chip color="success" label="Connected" />
                            </>
                        )}
                    </Stack>

                    {google.status === 'loading' && (
                        <Typography variant="body2">Authorizing…</Typography>
                    )}
                    {google.error && (
                        <Typography variant="body2" color="error">
                            {google.error}
                        </Typography>
                    )}

                    <Divider />

                    <Stack spacing={0.5}>
                        <Typography variant="subtitle2">Status</Typography>
                        <Typography variant="body2">
                            Token: {connected ? 'Received' : 'Not connected'}
                        </Typography>
                        {expiresInSec !== null && (
                            <Typography variant="body2">
                                Expires in: ~{Math.floor(expiresInSec / 60)}m {expiresInSec % 60}s
                            </Typography>
                        )}
                    </Stack>
                </Stack>
            </Paper>
        </Container>
    );
}
