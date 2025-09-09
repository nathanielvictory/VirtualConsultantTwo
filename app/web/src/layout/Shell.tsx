// src/layout/Shell.tsx
import { useState, type ReactNode } from "react";
import { Box, Toolbar } from "@mui/material";
import TopBar from "./TopBar.tsx";
import SideNav, { DRAWER_WIDTH } from "./SideNav.tsx"; // export this constant from SideNav

export default function Shell({
                                  children,
                                  mode,
                                  toggleMode,
                              }: {
    children: ReactNode;
    mode: "light" | "dark";
    toggleMode: () => void;
}) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <Box sx={{ display: "flex", minHeight: "100dvh", bgcolor: "background.default" }}>
            <TopBar onMenu={() => setMobileOpen(true)} mode={mode} toggleMode={toggleMode} />
            <SideNav mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    minWidth: 0,
                    // Reserve horizontal space for the permanent drawer at md+
                    ml: { md: `${DRAWER_WIDTH}px` },
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
