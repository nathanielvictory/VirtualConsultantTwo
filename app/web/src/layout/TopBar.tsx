import { AppBar, Toolbar, IconButton, Box, Breadcrumbs, Typography, Link as MLink, Badge, Tooltip, Avatar } from "@mui/material";
import { Brightness4 as DarkIcon, Brightness7 as LightIcon, Notifications as NotificationsIcon, Menu as MenuIcon } from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import { DRAWER_WIDTH } from "./SideNav";
import { useThemeMode } from "../theme/useThemeMode";
import { useAppSelector } from '../store/hooks';

export default function TopBar({ onMenu }: { onMenu: () => void }) {
    const location = useLocation();
    const { mode, toggleMode } = useThemeMode();
    const userEmail = useAppSelector((s) => s.auth.email);

    // Derived crumbs: /projects/:id/<step>
    const parts = location.pathname.split("/").filter(Boolean);
    const isProject = parts[0] === "projects" && parts[1];
    const step = parts[2];

    const stepLabelMap: Record<string, string> = {
        import: "Import & Setup",
        insights: "Insights",
        memo: "Memo",
        slides: "Slides",
    };

    return (
        <AppBar position="fixed" sx={{ ml: { md: `${DRAWER_WIDTH}px` }, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` } }}>
            <Toolbar sx={{ gap: 1 }}>
                <IconButton edge="start" onClick={onMenu} sx={{ display: { md: "none" } }} aria-label="Open navigation">
                    <MenuIcon />
                </IconButton>

                <Box sx={{ flexGrow: 1 }} />

                <Breadcrumbs sx={{ display: { xs: "none", md: "flex" } }} aria-label="breadcrumb">
                    <MLink underline="hover" color="inherit" component={Link} to="/">
                        Home
                    </MLink>
                    {isProject ? (
                        <>
                            <MLink underline="hover" color="inherit" component={Link} to={`/projects/${parts[1]}`}>
                                Project
                            </MLink>
                            {step && <Typography>{stepLabelMap[step] ?? step}</Typography>}
                        </>
                    ) : (
                        <Typography>{location.pathname === "/" ? "Home" : parts.join(" / ")}</Typography>
                    )}
                </Breadcrumbs>

                <IconButton onClick={toggleMode} aria-label="Toggle theme">{mode === "dark" ? <LightIcon /> : <DarkIcon />}</IconButton>
                <Tooltip title="Notifications">
                    <IconButton aria-label="Notifications">
                        <Badge variant="dot" color="secondary">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>
                </Tooltip>
                <Tooltip title="Account">
                    <IconButton component={Link} to="/settings" aria-label="Account settings">
                        <Avatar sx={{ width: 32, height: 32 }}>
                            {userEmail ? userEmail[0].toUpperCase() : "?"}
                        </Avatar>
                    </IconButton>
                </Tooltip>
            </Toolbar>
        </AppBar>
    );
}