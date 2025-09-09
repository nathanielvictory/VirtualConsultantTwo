import { Box, Typography } from "@mui/material";
import vmodLogo from '/vmod_logo.png'

export default function Brand() {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Box component="img" src={vmodLogo} alt="Victory Modeling" sx={{ height: 26, width: "auto" }} />
            <Typography variant="h6" fontWeight={800} letterSpacing={-0.5}>
                Virtual Consultant
            </Typography>
        </Box>
    );
}