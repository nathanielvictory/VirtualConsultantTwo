// src/theme/darkTheme.ts
import { createTheme, type ThemeOptions } from "@mui/material/styles";
import { commonTokens } from "./tokens.common";

/**
 * Reusable tokens just for dark mode (patterns/gradients).
 * These are strings to keep overrides tidy and consistent.
 */
const darkTokens = {
    // Subtle black base with deep-red vignette & dotted grid
    // Layer 1: dark radial red vignette
    // Layer 2: faint diagonal red gradient
    // Layer 3: ultra-subtle dotted grid (using radial-gradient as dots)
    appBackground: [
        "radial-gradient(1200px 800px at 100% -10%, rgba(139,0,0,0.18), transparent 60%)",
        "linear-gradient(135deg, rgba(139,0,0,0.08) 0%, rgba(0,0,0,0) 60%)",
        "radial-gradient(1px 1px at 20px 20px, rgba(255,255,255,0.04), rgba(0,0,0,0) 1px)"
    ].join(", "),
    // Rich red for primary surfaces (buttons, selected states)
    primaryGradient: "linear-gradient(90deg, #b71c1c 0%, #d32f2f 50%, #ef5350 100%)",
    primaryGradientHover: "linear-gradient(90deg, #8b0000 0%, #b71c1c 50%, #d32f2f 100%)",
    // Card overlay to separate from the busy background
    cardOverlay: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
};

const darkOptions: ThemeOptions = {
    palette: {
        mode: "dark",
        // Keep the base very dark; use slightly warmer blacks to avoid harshness
        background: {
            default: "#0b0b0c",
            paper: "#111113",
        },
        // Use a *lighter* red as primary so it pops on dark backgrounds
        primary: {
            main: "#ef5350",     // visible on black
            light: "#ff7961",
            dark: "#b71c1c",     // deep red for accents/patterns
            contrastText: "#ffffff",
        },
        secondary: {
            main: "#9ca3af",     // cool gray for subtle accents
            contrastText: "#0b0b0c",
        },
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
        // Global background & typography smoothing
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: "#0b0b0c",
                    backgroundImage: darkTokens.appBackground,
                    backgroundAttachment: "fixed",
                    backgroundSize: "auto, auto, 40px 40px", // dot grid size on layer 3
                    color: "rgba(255,255,255,0.92)",
                    WebkitFontSmoothing: "antialiased",
                    MozOsxFontSmoothing: "grayscale",
                },
                // Respect reduced motion — make gradients static-ish on hover
                "@media (prefers-reduced-motion: reduce)": {
                    "*": { transition: "none !important", animation: "none !important" },
                },
            },
        },

        // Top bar: glossy black with a deep-red edge highlight
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

        // Primary buttons: rich red gradient with crisp focus ring
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

        // Cards/Paper: subtle red-tinted overlay, thin border for structure
        MuiPaper: {
            styleOverrides: {
                root: {
                    background:
                        `${darkTokens.cardOverlay}, linear-gradient(0deg, rgba(255,255,255,0.02), rgba(255,255,255,0.02))`,
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
                    // faint red corner glow
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

        // Inputs with clear focus & larger click targets
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
                track: {
                    backgroundColor: "rgba(255,255,255,0.2)",
                },
            },
        },

        MuiDivider: {
            styleOverrides: { root: { borderColor: "rgba(255,255,255,0.08)" } },
        },

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
                        background:
                            "linear-gradient(90deg, rgba(239,83,80,0.18), rgba(239,83,80,0.06))",
                    },
                    "&.Mui-selected:hover": {
                        background:
                            "linear-gradient(90deg, rgba(239,83,80,0.26), rgba(239,83,80,0.1))",
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
