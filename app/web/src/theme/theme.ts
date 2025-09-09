import { createTheme, type ThemeOptions } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material";

export const getDesignTokens = (mode: PaletteMode): ThemeOptions => ({
    palette: {
        mode,
        ...(mode === "light"
            ? {
                primary: { main: "#E11D2E" }, // Victory red
                secondary: { main: "#111827" }, // near-black
                text: { primary: "#0B0F19", secondary: "#4B5563" },
                background: { default: "#F7F8FA", paper: "#FFFFFF" },
            }
            : {
                primary: { main: "#F05252" }, // softer red in dark
                secondary: { main: "#E5E7EB" },
                text: { primary: "#E5E7EB", secondary: "#9CA3AF" },
                background: { default: "#0B0F19", paper: "#0F172A" },
            }),
        divider: mode === "light" ? "#E5E7EB" : "#1F2937",
    },
    shape: { borderRadius: 14 },
    typography: {
        fontFamily: [
            "Inter",
            "-apple-system",
            "BlinkMacSystemFont",
            "Segoe UI",
            "Roboto",
            "Helvetica",
            "Arial",
            "sans-serif",
        ].join(","),
        h1: { fontWeight: 800, letterSpacing: -0.5 },
        h2: { fontWeight: 700, letterSpacing: -0.25 },
        h3: { fontWeight: 700 },
        button: { fontWeight: 600 },
    },
});

const getComponentOverrides = (mode: PaletteMode): ThemeOptions["components"] => ({
    MuiAppBar: {
        styleOverrides: {
            root: {
                backdropFilter: "saturate(1.15) blur(8px)",
            },
        },
    },
    MuiDrawer: {
        styleOverrides: {
            paper: {
                backgroundImage:
                    mode === "light"
                        ? "linear-gradient(180deg, #ffffff 0%, #f7f8fa 100%)"
                        : "linear-gradient(180deg, #0f172a 0%, #0b0f19 100%)",
            },
        },
    },
    MuiListSubheader: {
        styleOverrides: {
            root: { fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, opacity: 0.7 },
        },
    },
    MuiListItemButton: {
        styleOverrides: {
            root: {
                borderRadius: 10,
                "&.Mui-selected": {
                    color: mode === "light" ? "#111827" : "#E5E7EB",
                    backgroundImage:
                        mode === "light"
                            ? "linear-gradient(90deg, rgba(225,29,46,.12), rgba(225,29,46,.06))"
                            : "linear-gradient(90deg, rgba(240,82,82,.18), rgba(240,82,82,.08))",
                    "& .MuiListItemIcon-root": { color: "inherit" },
                },
            },
        },
    },
    MuiTabs: {
        styleOverrides: {
            indicator: { height: 3, borderRadius: 3 },
            root: { minHeight: 42 },
        },
    },
    MuiTab: {
        styleOverrides: {
            root: { textTransform: "none", fontWeight: 600, minHeight: 42 },
        },
    },
    MuiCard: {
        styleOverrides: {
            root: {
                backdropFilter: "saturate(1.2) blur(6px)",
                boxShadow: "0 10px 30px rgba(2,6,23,.08), 0 2px 6px rgba(2,6,23,.06)",
                border: "1px solid rgba(2,6,23,.06)",
            },
        },
    },
    MuiCardHeader: {
        styleOverrides: {
            root: { paddingBottom: 0 },
            title: { fontWeight: 700 },
            subheader: { color: mode === "light" ? "#6B7280" : "#9CA3AF" },
        },
    },
    MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
            root: { textTransform: "none", fontWeight: 600, borderRadius: 12 },
            contained: { boxShadow: "0 6px 14px rgba(225,29,46,.22)" },
        },
    },
    MuiPaper: { styleOverrides: { root: { borderRadius: 16 } } },
    MuiAvatar: { styleOverrides: { colorDefault: { backgroundColor: "#111827" } } },
});

export const createAppTheme = (mode: PaletteMode) => {
    const base = createTheme(getDesignTokens(mode));
    return createTheme(base, { components: getComponentOverrides(mode) });
};