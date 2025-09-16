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
    Button,
    Stack,
} from "@mui/material";
import {
    Home as HomeIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    ExpandLess,
    ExpandMore,
    Folder as FolderIcon,
    Insights as InsightsIcon,
    Description as DescriptionIcon,
    Slideshow as SlideshowIcon,
    CloudUpload as CloudUploadIcon,
    TableChart as TableChartIcon,
} from "@mui/icons-material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { Link, useNavigate } from "react-router-dom";
import Brand from "./Brand";
import { clearBackendAuth } from "../store/authSlice";
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

    const handleSignOut = () => {
        dispatch(clearBackendAuth());
        onClose?.();
        navigate("/login", { replace: true });
    };

    // Mock: single active project (replace with your store later)
    const activeProjectId = "vc-001";
    const projectBase = `/projects/${activeProjectId}`;

    const nav = [
        { label: "Home", icon: <HomeIcon />, to: "/" },
        { label: "Data Review", icon: <TableChartIcon />, to: "/data-review" },
        { label: "Settings", icon: <SettingsIcon />, to: "/settings" },
        { label: "Admin", icon: <AdminPanelSettingsIcon />, to: "/admin" },
    ];

    const content = (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Box sx={{ p: 2 }}>
                <Brand />
            </Box>
            <Divider />

            <List sx={{ p: 1 }} subheader={<ListSubheader disableSticky>Workspace</ListSubheader>}>
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

            <List sx={{ p: 1 }} subheader={<ListSubheader disableSticky>Projects</ListSubheader>}>
                {/* New project CTA */}
                <Stack direction="row" sx={{ px: 1, pb: 1 }}>
                    <Button
                        size="small"
                        variant="outlined"
                        fullWidth
                        onClick={() => navigate("/projects/new")}
                    >
                        + New Project
                    </Button>
                </Stack>

                {/* Active project group */}
                <ListItemButton onClick={() => setOpenProjects((o) => !o)} sx={{ borderRadius: 2, mb: 0.5 }}>
                    <ListItemIcon>
                        <FolderIcon />
                    </ListItemIcon>
                    <ListItemText primary="Virtual Consultant" secondary="Active" />
                    {openProjects ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={openProjects} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItemButton component={Link} to={projectBase} sx={{ ml: 4, borderRadius: 2, mb: 0.5 }} onClick={onClose}>
                            <ListItemIcon>
                                <FolderIcon />
                            </ListItemIcon>
                            <ListItemText primary="Overview" />
                        </ListItemButton>
                        <ListItemButton component={Link} to={`${projectBase}/import`} sx={{ ml: 4, borderRadius: 2, mb: 0.5 }} onClick={onClose}>
                            <ListItemIcon>
                                <CloudUploadIcon />
                            </ListItemIcon>
                            <ListItemText primary="Import & Setup" />
                        </ListItemButton>
                        <ListItemButton component={Link} to={`${projectBase}/insights`} sx={{ ml: 4, borderRadius: 2, mb: 0.5 }} onClick={onClose}>
                            <ListItemIcon>
                                <InsightsIcon />
                            </ListItemIcon>
                            <ListItemText primary="Insights" />
                        </ListItemButton>
                        <ListItemButton component={Link} to={`${projectBase}/memo`} sx={{ ml: 4, borderRadius: 2, mb: 0.5 }} onClick={onClose}>
                            <ListItemIcon>
                                <DescriptionIcon />
                            </ListItemIcon>
                            <ListItemText primary="Memo" />
                        </ListItemButton>
                        <ListItemButton component={Link} to={`${projectBase}/slides`} sx={{ ml: 4, borderRadius: 2, mb: 0.5 }} onClick={onClose}>
                            <ListItemIcon>
                                <SlideshowIcon />
                            </ListItemIcon>
                            <ListItemText primary="Slides" />
                        </ListItemButton>
                    </List>
                </Collapse>
            </List>

            <Box sx={{ flexGrow: 1 }} />
            <Divider />
            <Box sx={{ p: 2 }}>
                <Chip icon={<LogoutIcon />} label="Sign out" variant="outlined" color="primary" clickable onClick={handleSignOut} />
            </Box>
        </Box>
    );

    return (
        <>
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onClose}
                ModalProps={{ keepMounted: true }}
                sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": { width: DRAWER_WIDTH } }}
            >
                {content}
            </Drawer>
            <Drawer
                variant="permanent"
                open
                sx={{ display: { xs: "none", md: "block" }, "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" } }}
            >
                {content}
            </Drawer>
        </>
    );
}