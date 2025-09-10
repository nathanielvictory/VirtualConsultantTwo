// src/layout/Shell.tsx
import { useState, type ReactNode } from "react";
import { Box, Toolbar } from "@mui/material";
import TopBar from "./TopBar.tsx";
import SideNav, { DRAWER_WIDTH } from "./SideNav.tsx"; // export this constant from SideNav

export default function Shell({ children }: { children: ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <Box sx={{ minHeight: "100dvh", display: "flex" }}>
            <TopBar onMenu={() => setMobileOpen(true)} />
            <SideNav mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

            <Box
                component="main"
                sx={{
                    flex: 1,                     // <-- take remaining horizontal space
                    ml: { md: `${DRAWER_WIDTH}px` },
                    display: "flex",             // <-- make a vertical flex column
                    flexDirection: "column",
                    minWidth: 0,                 // <-- prevent overflow from long content
                }}
            >
                {/* Reserve vertical space equal to AppBar height without hardcoding pixels */}
                <Toolbar />
                {/* No default padding here — pages decide their own spacing */}
                {children}
            </Box>
        </Box>
    );
}
