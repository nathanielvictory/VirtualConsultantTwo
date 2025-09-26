// SideNav.tsx
import { useState, useMemo } from "react";
import {
    Drawer, Box, Divider, List, ListItemButton, ListItemIcon, ListItemText,
    Collapse, ListSubheader, Chip, Button, Stack
} from "@mui/material";
import {
    Home as HomeIcon, Settings as SettingsIcon, Logout as LogoutIcon,
    ExpandLess, ExpandMore, Folder as FolderIcon, Insights as InsightsIcon,
    Description as DescriptionIcon, Slideshow as SlideshowIcon,
    CloudUpload as CloudUploadIcon, TableChart as TableChartIcon,
} from "@mui/icons-material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { Link, useNavigate } from "react-router-dom";
import Brand from "./Brand";
import { clearBackendAuth } from "../store/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { useGetApiProjectsByIdQuery } from "../api/projectsApi";

export const DRAWER_WIDTH = 280;

// Small helper for an abbreviated date like "Jan 3, 2025"
function formatDateAbbrev(iso?: string) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(d);
}

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

    // NEW: get the selected projectId from Redux
    const projectId = useAppSelector((s) => s.selected.projectId);

    // NEW: fetch project details when we have an id
    const { data: project, isFetching: projLoading } = useGetApiProjectsByIdQuery({id: projectId as number}, {
        skip: projectId == null,
    });

    // NEW: derive display name and created date
    const projectName = projLoading ? "Loading…" : (project?.name ?? "—");
    const projectCreated = projLoading ? "…" : formatDateAbbrev(project?.createdAt);

    // NEW: build base route safely
    const projectBase = useMemo(
        () => (projectId != null ? `/projects/${projectId}` : "/projects/select"),
        [projectId]
    );

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
                <Stack direction="row" sx={{ px: 1, pb: 1 }}>
                    <Button
                        size="small"
                        variant="outlined"
                        fullWidth
                        onClick={() => navigate("/projects/select")}
                    >
                        Select Project
                    </Button>
                </Stack>

                {/* Only show the project folder dropdown if a project is selected */}
                {projectId != null && (
                    <>
                        {/* Project group header now shows Name + abbreviated CreatedAt */}
                        <ListItemButton
                            onClick={() => setOpenProjects((o) => !o)}
                            sx={{ borderRadius: 2, mb: 0.5 }}
                        >
                            <ListItemIcon>
                                <FolderIcon />
                            </ListItemIcon>
                            <ListItemText primary={projectName} secondary={projectCreated} />
                            {openProjects ? <ExpandLess /> : <ExpandMore />}
                        </ListItemButton>

                        <Collapse in={openProjects} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                <ListItemButton
                                    component={Link}
                                    to={projectBase}
                                    sx={{ ml: 4, borderRadius: 2, mb: 0.5 }}
                                    onClick={onClose}
                                >
                                    <ListItemIcon>
                                        <FolderIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Overview" />
                                </ListItemButton>
                                <ListItemButton
                                    component={Link}
                                    to={`${projectBase}/import`}
                                    sx={{ ml: 4, borderRadius: 2, mb: 0.5 }}
                                    onClick={onClose}
                                >
                                    <ListItemIcon>
                                        <CloudUploadIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Data Refresh" />
                                </ListItemButton>
                                <ListItemButton
                                    component={Link}
                                    to={`${projectBase}/insights`}
                                    sx={{ ml: 4, borderRadius: 2, mb: 0.5 }}
                                    onClick={onClose}
                                >
                                    <ListItemIcon>
                                        <InsightsIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Insights" />
                                </ListItemButton>
                                <ListItemButton
                                    component={Link}
                                    to={`${projectBase}/memo`}
                                    sx={{ ml: 4, borderRadius: 2, mb: 0.5 }}
                                    onClick={onClose}
                                >
                                    <ListItemIcon>
                                        <DescriptionIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Memos" />
                                </ListItemButton>
                                <ListItemButton
                                    component={Link}
                                    to={`${projectBase}/slides`}
                                    sx={{ ml: 4, borderRadius: 2, mb: 0.5 }}
                                    onClick={onClose}
                                >
                                    <ListItemIcon>
                                        <SlideshowIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Slidedecks" />
                                </ListItemButton>
                            </List>
                        </Collapse>
                    </>
                )}
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
