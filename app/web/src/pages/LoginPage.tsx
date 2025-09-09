import {
    Box,
    CardActions,
    Avatar,
    Typography,
    TextField,
    InputAdornment,
    Button,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
} from "@mui/material";
import { Login as LoginIcon, CheckCircle } from "@mui/icons-material";

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 2,
                background: (t) =>
                    t.palette.mode === "light"
                        ? "radial-gradient(1200px 600px at -10% -20%, #FDECEC 0%, #F7F8FA 55%, #FFFFFF 100%)"
                        : "radial-gradient(1200px 600px at -10% -20%, #25141A 0%, #0B0F19 60%, #0B0F19 100%)",
            }}
        >
            <Paper sx={{ width: "100%", maxWidth: 1100, overflow: "hidden" }}>
                {/* Two-column layout via flex (no Grid) */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                    }}
                >
                    {/* Left: form */}
                    <Box sx={{ flex: 1, p: 4 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <Avatar sx={{ bgcolor: "primary.main" }}>VC</Avatar>
                            <Typography variant="h5" fontWeight={800} letterSpacing={-0.3}>
                                Welcome to Virtual Consultant
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Securely sign in to access your models, insights, and virtual expert tools.
                        </Typography>

                        <Box
                            component="form"
                            onSubmit={(e) => {
                                e.preventDefault();
                                onLogin();
                            }}
                        >
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                margin="normal"
                                required
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">📧</InputAdornment>,
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Password"
                                type="password"
                                margin="normal"
                                required
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">🔒</InputAdornment>,
                                }}
                            />
                            <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 2 }}>
                                Sign in
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                fullWidth
                                sx={{ mt: 1 }}
                                startIcon={<LoginIcon />}
                            >
                                Continue with SSO
                            </Button>
                        </Box>

                        <CardActions sx={{ justifyContent: "space-between", px: 0, pb: 0, mt: 1 }}>
                            <Button size="small">Forgot password?</Button>
                            <Typography variant="caption" color="text.secondary">
                                By continuing you agree to our Terms.
                            </Typography>
                        </CardActions>
                    </Box>

                    {/* Right: selling points */}
                    <Box
                        sx={{
                            flex: 1,
                            p: 4,
                            background: (t) =>
                                t.palette.mode === "light"
                                    ? "linear-gradient(135deg,#fff, #FDECEC)"
                                    : "linear-gradient(135deg,#151a24,#25141A)",
                        }}
                    >
                        <Typography variant="h6" fontWeight={800} gutterBottom>
                            Why teams choose Virtual Consultant
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemIcon>
                                    <CheckCircle color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Model-aware Q&A and guidance"
                                    secondary="Grounded, consistent assistance across your workflows."
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <CheckCircle color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Secure by default"
                                    secondary="SSO, least-privilege access, and audit trails."
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <CheckCircle color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Dashboards & insights"
                                    secondary="Usage, quality, and ROI at a glance."
                                />
                            </ListItem>
                        </List>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
}