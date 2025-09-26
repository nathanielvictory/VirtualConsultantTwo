// src/theme/darkTheme.ts
import { createTheme, type ThemeOptions } from "@mui/material/styles";
import { commonTokens } from "./tokens.common";

const surfaceBase = "#111113"; // same as palette.background.paper

const darkTokens = {
    appBackground: [
        "radial-gradient(1200px 800px at 100% -10%, rgba(139,0,0,0.18), transparent 60%)",
        "linear-gradient(135deg, rgba(139,0,0,0.08) 0%, rgba(0,0,0,0) 60%)",
        "radial-gradient(1px 1px at 20px 20px, rgba(255,255,255,0.04), rgba(0,0,0,0) 1px)"
    ].join(", "),
    primaryGradient: "linear-gradient(90deg, #b71c1c 0%, #d32f2f 50%, #ef5350 100%)",
    primaryGradientHover: "linear-gradient(90deg, #8b0000 0%, #b71c1c 50%, #d32f2f 100%)",
    cardOverlay: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
};

const darkOptions: ThemeOptions = {
    palette: {
        mode: "dark",
        background: { default: "#0b0b0c", paper: surfaceBase },
        primary: {
            main: "#ef5350",
            light: "#ff7961",
            dark: "#b71c1c",
            contrastText: "#ffffff",
        },
        secondary: { main: "#9ca3af", contrastText: "#0b0b0c" },
        text: {
            primary: "rgba(255,255,255,0.92)",
            secondary: "rgba(255,255,255,0.67)",
            disabled: "rgba(255,255,255,0.38)",
        },
        divider: "rgba(255,255,255,0.12)",
        error: { main: "#ef4444" },
        warning: { main: "#f59e0b" },
        info: { main: "#60a5fa" },
        success: { main: "#34d399" },
    },

    shape: { borderRadius: 12 },

    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: "#0b0b0c",
                    backgroundImage: darkTokens.appBackground,
                    backgroundAttachment: "fixed",
                    backgroundSize: "auto, auto, 40px 40px",
                    color: "rgba(255,255,255,0.92)",
                    WebkitFontSmoothing: "antialiased",
                    MozOsxFontSmoothing: "grayscale",
                },
                "@media (prefers-reduced-motion: reduce)": {
                    "*": { transition: "none !important", animation: "none !important" },
                },
                a: {
                    color: "#ff9797",
                    textDecoration: "none",
                    "&:hover": { color: "#ffd1d1" },
                },
            },
        },

        MuiAppBar: {
            styleOverrides: {
                root: {
                    background:
                        "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0))," +
                        "linear-gradient(90deg, rgba(139,0,0,0.4), rgba(139,0,0,0) 60%)",
                    backdropFilter: "saturate(130%) blur(8px)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                },
            },
        },

        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
                root: {
                    textTransform: "none",
                    borderRadius: 10,
                    fontWeight: 600,
                    letterSpacing: 0.2,
                    transition: "background 200ms, box-shadow 200ms, transform 50ms",
                    "&:active": { transform: "translateY(1px)" },
                },
                containedPrimary: {
                    background: darkTokens.primaryGradient,
                    color: "#fff",
                    boxShadow: "0 6px 14px rgba(239,83,80,0.22)",
                    "&:hover": {
                        background: darkTokens.primaryGradientHover,
                        boxShadow: "0 8px 18px rgba(239,83,80,0.28)",
                    },
                    "&:focus-visible": {
                        outline: "2px solid rgba(239,83,80,0.8)",
                        outlineOffset: "2px",
                    },
                },
                outlinedPrimary: {
                    borderColor: "rgba(239,83,80,0.6)",
                    color: "#ffd7d7",
                    background:
                        "linear-gradient(#0b0b0c,#0b0b0c) padding-box," +
                        "linear-gradient(90deg, rgba(239,83,80,0.7), rgba(183,28,28,0.7)) border-box",
                    borderWidth: 1.5,
                    borderStyle: "solid",
                    "&:hover": {
                        borderColor: "rgba(239,83,80,0.9)",
                        color: "#fff",
                    },
                },
                textPrimary: {
                    color: "#ffb3b3",
                    "&:hover": { backgroundColor: "rgba(239,83,80,0.08)" },
                },
            },
        },

        // ✅ Solid base + overlay without nuking background-color
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundColor: surfaceBase,            // solid foundation
                    backgroundImage: `${darkTokens.cardOverlay}, linear-gradient(0deg, rgba(255,255,255,0.02), rgba(255,255,255,0.02))`,
                    backgroundBlendMode: "overlay, normal",
                    border: "1px solid rgba(255,255,255,0.06)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                },
            },
        },

        MuiCard: {
            styleOverrides: {
                root: {
                    overflow: "hidden",
                    position: "relative",
                    "::after": {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        background: "radial-gradient(300px 180px at 110% -10%, rgba(183,28,28,0.18), transparent 60%)",
                        pointerEvents: "none",
                    },
                },
            },
        },

        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    backgroundColor: "rgba(255,255,255,0.02)",
                    borderRadius: 10,
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(239,83,80,0.5)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(239,83,80,0.9)",
                        boxShadow: "0 0 0 3px rgba(239,83,80,0.2)",
                    },
                },
                input: { paddingTop: 12, paddingBottom: 12 },
                notchedOutline: { borderColor: "rgba(255,255,255,0.18)" },
            },
        },

        MuiFormLabel: {
            styleOverrides: {
                root: {
                    color: "rgba(255,255,255,0.67)",
                    "&.Mui-focused": { color: "#ffc6c6" },
                },
            },
        },

        MuiSwitch: {
            styleOverrides: {
                switchBase: {
                    "&.Mui-checked": {
                        color: "#fff",
                        "+ .MuiSwitch-track": {
                            background: darkTokens.primaryGradient,
                            opacity: 1,
                        },
                    },
                },
                track: { backgroundColor: "rgba(255,255,255,0.2)" },
            },
        },

        MuiDivider: { styleOverrides: { root: { borderColor: "rgba(255,255,255,0.08)" } } },

        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: "#1b1b1d",
                    color: "rgba(255,255,255,0.92)",
                    border: "1px solid rgba(255,255,255,0.08)",
                },
            },
        },

        MuiLink: {
            styleOverrides: { root: { color: "#ffb3b3", "&:hover": { color: "#ffd1d1" } } },
        },

        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    "&.Mui-selected": {
                        background: "linear-gradient(90deg, rgba(239,83,80,0.18), rgba(239,83,80,0.06))",
                    },
                    "&.Mui-selected:hover": {
                        background: "linear-gradient(90deg, rgba(239,83,80,0.26), rgba(239,83,80,0.1))",
                    },
                },
            },
        },

        // ---- Extra safety for overlay components (all use Paper inside) ----
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: surfaceBase,
                    backgroundImage: `${darkTokens.cardOverlay}, linear-gradient(0deg, rgba(255,255,255,0.02), rgba(255,255,255,0.02))`,
                    backdropFilter: "saturate(120%) blur(6px)",
                },
            },
        },
        MuiPopover: {
            styleOverrides: {
                paper: {
                    backgroundColor: surfaceBase,
                    backgroundImage: `${darkTokens.cardOverlay}, linear-gradient(0deg, rgba(255,255,255,0.02), rgba(255,255,255,0.02))`,
                },
            },
        },
        MuiMenu: {
            styleOverrides: {
                paper: {
                    backgroundColor: surfaceBase,
                    backgroundImage: `${darkTokens.cardOverlay}, linear-gradient(0deg, rgba(255,255,255,0.02), rgba(255,255,255,0.02))`,
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    backgroundColor: surfaceBase,
                    backgroundImage: `${darkTokens.cardOverlay}, linear-gradient(0deg, rgba(255,255,255,0.02), rgba(255,255,255,0.02))`,
                },
            },
        },
        MuiSnackbar: {
            styleOverrides: {
                root: {
                    "& .MuiPaper-root": {
                        backgroundColor: surfaceBase,
                        backgroundImage: "none",
                    },
                },
            },
        },
    },
};

export const darkTheme = createTheme({
    ...commonTokens,
    ...darkOptions,
});
