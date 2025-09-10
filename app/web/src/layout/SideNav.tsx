// src/components/SideNav.tsx
import { useState } from "react";
import {
    Drawer,
    Box,
    Divider,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse,
    ListSubheader,
    Chip,
} from "@mui/material";
import {
    Home as HomeIcon,
    Dashboard as DashboardIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    ExpandLess,
    ExpandMore,
    Folder as FolderIcon,
    Insights as InsightsIcon,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import Brand from "./Brand.tsx";
import { logout } from "../store/authSlice";
import { useAppDispatch } from "../store/hooks";

export const DRAWER_WIDTH = 280;

export default function SideNav({
                                    mobileOpen,
                                    onClose,
                                }: {
    mobileOpen: boolean;
    onClose: () => void;
}) {
    const [openProjects, setOpenProjects] = useState(true);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleSignOut = () => {                                   // ⬅️
        dispatch(logout());
        onClose?.();
        navigate("/login", { replace: true });
    };

    const nav = [
        { label: "Home", icon: <HomeIcon />, to: "/" },
        { label: "Dashboard", icon: <DashboardIcon />, to: "/dashboard" },
        { label: "Settings", icon: <SettingsIcon />, to: "/settings" },
    ];

    const content = (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            {/* Brand always at the top */}
            <Box sx={{ p: 2 }}>
                <Brand />
            </Box>
            <Divider />
            <List
                sx={{ p: 1 }}
                subheader={<ListSubheader disableSticky>Workspace</ListSubheader>}
            >
                {nav.map((item) => (
                    <ListItemButton
                        key={item.to}
                        component={Link}
                        to={item.to}
                        sx={{ borderRadius: 2, mb: 0.5 }}
                        onClick={onClose}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.label} />
                    </ListItemButton>
                ))}
            </List>

            <List
                sx={{ p: 1 }}
                subheader={<ListSubheader disableSticky>Projects</ListSubheader>}
            >
                <ListItemButton
                    onClick={() => setOpenProjects((o) => !o)}
                    sx={{ borderRadius: 2, mb: 0.5 }}
                >
                    <ListItemIcon>
                        <FolderIcon />
                    </ListItemIcon>
                    <ListItemText primary="Virtual Consultant" secondary="Active" />
                    {openProjects ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={openProjects} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItemButton
                            component={Link}
                            to="/dashboard"
                            sx={{ ml: 4, borderRadius: 2, mb: 0.5 }}
                            onClick={onClose}
                        >
                            <ListItemIcon>
                                <InsightsIcon />
                            </ListItemIcon>
                            <ListItemText primary="Model Insights" />
                        </ListItemButton>
                        <ListItemButton
                            component={Link}
                            to="/dashboard"
                            sx={{ ml: 4, borderRadius: 2, mb: 0.5 }}
                            onClick={onClose}
                        >
                            <ListItemIcon>
                                <DashboardIcon />
                            </ListItemIcon>
                            <ListItemText primary="Experiments" />
                        </ListItemButton>
                    </List>
                </Collapse>
            </List>

            <Box sx={{ flexGrow: 1 }} />

            <Divider />

            <Box sx={{ p: 2 }}>
                <Chip
                    icon={<LogoutIcon />}
                    label="Sign out"
                    variant="outlined"
                    color="primary"
                    clickable
                    onClick={handleSignOut}
                />
            </Box>
        </Box>
    );

    return (
        <>
            {/* Mobile drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onClose}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: "block", md: "none" },
                    "& .MuiDrawer-paper": { width: DRAWER_WIDTH },
                }}
            >
                {content}
            </Drawer>

            {/* Permanent drawer */}
            <Drawer
                variant="permanent"
                open
                sx={{
                    display: { xs: "none", md: "block" },
                    "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
                }}
            >
                {content}
            </Drawer>
        </>
    );
}
