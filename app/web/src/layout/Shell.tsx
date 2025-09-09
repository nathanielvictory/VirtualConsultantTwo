import { useState, type  ReactNode } from "react";
import { Box } from "@mui/material";
import TopBar from "../components/TopBar";
import SideNav from "../components/SideNav";

export default function Shell({ children, mode, toggleMode }: { children: ReactNode; mode: "light" | "dark"; toggleMode: () => void }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    return (
        <Box sx={{ display: "flex" }}>
            <TopBar onMenu={() => setMobileOpen(true)} mode={mode} toggleMode={toggleMode} />
            <SideNav mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
            <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, mt: 8, ml: { md: `280px` } }}>
                {children}
            </Box>
        </Box>
    );
}