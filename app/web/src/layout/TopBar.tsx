// src/components/TopBar.tsx
import {
    AppBar,
    Toolbar,
    IconButton,
    Box,
    Breadcrumbs,
    Typography,
    Link as MLink,
    Badge,
    Tooltip,
    Avatar,
} from "@mui/material";
import {
    Brightness4 as DarkIcon,
    Brightness7 as LightIcon,
    Notifications as NotificationsIcon,
    Menu as MenuIcon,
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import { DRAWER_WIDTH } from "./SideNav.tsx";

interface TopBarProps {
    onMenu: () => void;
    mode: "light" | "dark";
    toggleMode: () => void;
}

export default function TopBar({ onMenu, mode, toggleMode }: TopBarProps) {
    const location = useLocation();
    const path = location.pathname === "/" ? "Home" : location.pathname.replace("/", "");

    return (
        <AppBar
            position="fixed"
            sx={{
                ml: { md: `${DRAWER_WIDTH}px` },
                width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
            }}
        >
            <Toolbar sx={{ gap: 1 }}>
                {/* Mobile menu */}
                <IconButton edge="start" onClick={onMenu} sx={{ display: { md: "none" } }} aria-label="Open navigation">
                    <MenuIcon />
                </IconButton>

                <Box sx={{ flexGrow: 1 }} />

                {/* Breadcrumbs */}
                <Breadcrumbs sx={{ display: { xs: "none", md: "flex" } }} aria-label="breadcrumb">
                    <MLink underline="hover" color="inherit" component={Link} to="/">
                        Home
                    </MLink>
                    <Typography>{path}</Typography>
                </Breadcrumbs>

                {/* Theme toggle */}
                <IconButton onClick={toggleMode} aria-label="Toggle theme">
                    {mode === "dark" ? <LightIcon /> : <DarkIcon />}
                </IconButton>

                {/* Notifications */}
                <Tooltip title="Notifications">
                    <IconButton aria-label="Notifications">
                        <Badge variant="dot" color="secondary">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>
                </Tooltip>

                {/* Profile -> settings */}
                <Tooltip title="Account">
                    <IconButton component={Link} to="/settings" aria-label="Account settings">
                        <Avatar sx={{ width: 32, height: 32 }}>JD</Avatar>
                    </IconButton>
                </Tooltip>
            </Toolbar>
        </AppBar>
    );
}
