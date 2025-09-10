import {
    Box, Paper, Stack, Typography, TextField, InputAdornment, Button,
} from "@mui/material";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../store/hooks";
import { login } from "../../store/authSlice";
import vmodLogo from "/vmod_logo.png";

export default function LoginPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation() as { state?: { from?: Location } };

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState(""); // kept for form completeness

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        dispatch(login(email));
        const to = location.state?.from?.pathname ?? "/";
        navigate(to, { replace: true });
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

                        <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
                            <Stack spacing={2}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    InputProps={{ startAdornment: <InputAdornment position="start">📧</InputAdornment> }}
                                />
                                <TextField
                                    fullWidth
                                    label="Password"
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    InputProps={{ startAdornment: <InputAdornment position="start">🔒</InputAdornment> }}
                                />
                                <Button type="submit" variant="contained" fullWidth>
                                    Sign in
                                </Button>
                            </Stack>
                        </Box>
                    </Stack>
                </Paper>
            </Box>
        </Box>
    );
}
