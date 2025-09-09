import { AppBar, Toolbar, IconButton, Box, Breadcrumbs, Typography, Link as MLink, Badge, Tooltip, Avatar, TextField, InputAdornment, Chip } from "@mui/material";
import { Brightness4 as DarkIcon, Brightness7 as LightIcon, Notifications as NotificationsIcon, Menu as MenuIcon, Search as SearchIcon } from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import Brand from "../components/Brand";

interface TopBarProps { onMenu: () => void; mode: "light" | "dark"; toggleMode: () => void; }

export default function TopBar({ onMenu, mode, toggleMode }: TopBarProps) {
    const location = useLocation();
    const path = location.pathname === "/" ? "Home" : location.pathname.replace("/", "");
    return (
        <AppBar position="fixed" elevation={0} sx={{
            backdropFilter: "saturate(1.2) blur(6px)",
            backgroundImage: (t) => t.palette.mode === "light"
                ? "linear-gradient(90deg, rgba(247,248,250,0.6), rgba(247,248,250,0.2))"
                : "linear-gradient(90deg, rgba(15,23,42,0.4), rgba(15,23,42,0.1))",
            borderBottom: (t) => `1px solid ${t.palette.divider}`,
        }}>
            <Toolbar sx={{ gap: 1 }}>
                <IconButton edge="start" onClick={onMenu} sx={{ display: { md: "none" } }}>
                    <MenuIcon />
                </IconButton>
                <Brand />
                <Box sx={{ flexGrow: 1 }} />
                <Breadcrumbs sx={{ display: { xs: "none", md: "flex" } }} aria-label="breadcrumb">
                    <MLink underline="hover" color="inherit" component={Link} to="/">Home</MLink>
                    <Typography color="text.primary">{path}</Typography>
                </Breadcrumbs>
                <TextField
                    size="small"
                    placeholder="Search projects, models, datasets…"
                    sx={{ ml: 2, width: { xs: 0, sm: 260, md: 360 }, display: { xs: "none", sm: "inline-flex" } }}
                    InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
                />
                <Chip label="Prod" size="small" sx={{ ml: 1 }} />
                <IconButton onClick={toggleMode} sx={{ ml: 1 }} aria-label="Toggle theme">
                    {mode === "dark" ? <LightIcon /> : <DarkIcon />}
                </IconButton>
                <Tooltip title="Notifications">
                    <IconButton>
                        <Badge variant="dot" color="secondary"><NotificationsIcon /></Badge>
                    </IconButton>
                </Tooltip>
                <Tooltip title="Account"><Avatar sx={{ width: 32, height: 32 }}>JD</Avatar></Tooltip>
            </Toolbar>
        </AppBar>
    );
}