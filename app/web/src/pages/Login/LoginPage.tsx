import {
    Box,
    Paper,
    Stack,
    Typography,
    TextField,
    InputAdornment,
    Button,
} from "@mui/material";
import vmodLogo from "/vmod_logo.png";

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
    return (
        // Full-screen, centers content; layout-only styles
        <Box
            component="main"
            sx={{
                position: "fixed",
                inset: 0,
                display: "grid",
                placeItems: "center",
                overflow: "auto",
            }}
        >
            {/* Natural width with a cap; no visual overrides */}
            <Box sx={{ width: "100%", maxWidth: 480, px: { xs: 2, sm: 0 } }}>
                {/* Paper uses theme defaults (shape, elevation, colors) */}
                <Paper>
                    {/* Internal spacing via Stack so theme spacing scales */}
                    <Stack spacing={3} sx={{ p: { xs: 3, sm: 4 } }} alignItems="center">
                        {/* Logo */}
                        <Box
                            component="img"
                            src={vmodLogo}
                            alt="Victory Modeling Logo"
                            sx={{ width: "100%", maxWidth: 220, height: "auto" }}
                        />

                        {/* Copy (no weight/color overrides so theme can control) */}
                        <Stack spacing={0.5} alignItems="center" sx={{ textAlign: "center", width: "100%" }}>
                            <Typography variant="h5">Welcome to Virtual Consultant</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Securely sign in to access your models and insights.
                            </Typography>
                        </Stack>

                        {/* Form */}
                        <Box
                            component="form"
                            onSubmit={(e) => {
                                e.preventDefault();
                                onLogin();
                            }}
                            sx={{ width: "100%" }}
                        >
                            <Stack spacing={2}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    required
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">📧</InputAdornment>,
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    label="Password"
                                    type="password"
                                    required
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">🔒</InputAdornment>,
                                    }}
                                />
                                {/* Use variant props only; no inline colors/shapes */}
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
