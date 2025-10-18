// src/layout/Shell.tsx
import { useState, type ReactNode } from "react";
import { Box, Toolbar } from "@mui/material";
import TopBar from "./TopBar.tsx";
import SideNav, { DRAWER_WIDTH } from "./SideNav.tsx";
import { useAppSelector } from "../store/hooks";
import { ChartOverlay } from "../components/ChartOverlay";

export default function Shell({ children }: { children: ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const overlayVisible = useAppSelector((s) => s.settings.overlayVisible);

    return (
        <Box sx={{ minHeight: "100dvh" }}>
            <TopBar onMenu={() => setMobileOpen(true)} />
            <SideNav mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

            <Box
                component="main"
                sx={{ ml: { md: `${DRAWER_WIDTH}px` } }}
            >
                {/* Reserve vertical space equal to AppBar height without hardcoding pixels */}
                <Toolbar />
                {overlayVisible && <ChartOverlay />}
                {/* No default padding here — pages decide their own spacing */}
                {children}
            </Box>

        </Box>
    );
}
