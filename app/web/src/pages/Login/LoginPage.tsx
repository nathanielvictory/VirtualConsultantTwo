import {
    Box, Paper, Stack, Typography, TextField, InputAdornment, Button, Alert,
} from "@mui/material";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../store/hooks";
import { setEmail } from "../../store/authSlice"; // backend auth slice
import { usePostApiAuthTokenMutation } from "../../api/authApi"; // generated
import vmodLogo from "/vmod_logo.png";

type LocationState = { state?: { from?: Location } };

export default function LoginPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation() as unknown as LocationState;

    const [email, setEmailInput] = useState("");
    const [password, setPassword] = useState("");
    const [submitError, setSubmitError] = useState<string | null>(null);

    const [loginMutation, { isLoading }] = usePostApiAuthTokenMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        try {
            // Hit /api/Auth/token (httpOnly refresh cookie will be set server-side)
            await loginMutation({
                body: {
                    username: email,
                    password,
                    grant_type: 'password'
                },
            }).unwrap();

            // persist just the email (token is handled by slice via matcher; not persisted)
            dispatch(setEmail(email));

            const to = location.state?.from?.pathname ?? "/";
            navigate(to, { replace: true });
        } catch (err: any) {
            // Minimal error surfacing
            const message =
                err?.data?.message ||
                err?.error ||
                "Sign-in failed. Check your credentials and try again.";
            setSubmitError(message);
        }
    };

    return (
        <Box component="main" sx={{ position: "fixed", inset: 0, display: "grid", placeItems: "center", overflow: "auto" }}>
            <Box sx={{ width: "100%", maxWidth: 480, px: { xs: 2, sm: 0 } }}>
                <Paper>
                    <Stack spacing={3} sx={{ p: { xs: 3, sm: 4 } }} alignItems="center">
                        <Box component="img" src={vmodLogo} alt="Victory Modeling Logo" sx={{ width: "100%", maxWidth: 220, height: "auto" }} />
                        <Stack spacing={0.5} alignItems="center" sx={{ textAlign: "center", width: "100%" }}>
                            <Typography variant="h5">Welcome to Virtual Consultant</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Securely sign in to access your models and insights.
                            </Typography>
                        </Stack>

                        {submitError && (
                            <Alert severity="error" sx={{ width: "100%" }}>
                                {submitError}
                            </Alert>
                        )}

                        <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
                            <Stack spacing={2}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    value={email}
                                    onChange={e => setEmailInput(e.target.value)}
                                    required
                                    autoComplete="username"
                                    InputProps={{ startAdornment: <InputAdornment position="start">📧</InputAdornment> }}
                                />
                                <TextField
                                    fullWidth
                                    label="Password"
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    InputProps={{ startAdornment: <InputAdornment position="start">🔒</InputAdornment> }}
                                />
                                <Button type="submit" variant="contained" fullWidth disabled={isLoading}>
                                    {isLoading ? "Signing in..." : "Sign in"}
                                </Button>
                            </Stack>
                        </Box>
                    </Stack>
                </Paper>
            </Box>
        </Box>
    );
}
