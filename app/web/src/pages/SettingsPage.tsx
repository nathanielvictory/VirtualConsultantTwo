import { Container, Typography, Divider, Box, TextField, Button } from "@mui/material";

export default function SettingsPage() {
    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h5" fontWeight={800} gutterBottom>Settings</Typography>
            <Typography color="text.secondary" gutterBottom>This is a placeholder settings page. Add forms, toggles, and preferences here.</Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: "grid", gap: 2 }}>
                <TextField label="Full name" fullWidth />
                <TextField label="Email" fullWidth />
                <Button variant="contained" sx={{ width: 200 }}>Save changes</Button>
            </Box>
        </Container>
    );
}