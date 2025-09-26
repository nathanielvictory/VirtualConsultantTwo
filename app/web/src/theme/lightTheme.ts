// src/theme/lightTheme.ts
import { createTheme, type ThemeOptions } from "@mui/material/styles";
import { commonTokens } from "./tokens.common";

const lightOptions: ThemeOptions = {
    palette: {
        mode: "light",
        primary: {
            main: "#d32f2f", // company red
            light: "#ef5350",
            dark: "#b71c1c",
            contrastText: "#ffffff",
        },
        secondary: {
            main: "#9e9e9e",
            contrastText: "#ffffff",
        },
        background: {
            default: "#ffffff",
            paper: "#fafafa",
        },
        text: {
            primary: "#111827", // almost-black
            secondary: "#374151", // slate
        },
    },

    components: {
        MuiCssBaseline: {
            styleOverrides: {
                a: {
                    color: "#d32f2f",
                    textDecoration: "none",
                    "&:hover": {
                        color: "#870606",
                        textDecoration: "underline",
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: "linear-gradient(90deg, #d32f2f 0%, #ffffff 100%)",
                    color: "#111827",
                    boxShadow: "none",
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    borderRadius: 8,
                    fontWeight: 500,
                },
                containedPrimary: {
                    background: "linear-gradient(90deg, #d32f2f 0%, #ef5350 100%)",
                    color: "#fff",
                    "&:hover": {
                        background: "linear-gradient(90deg, #b71c1c 0%, #d32f2f 100%)",
                    },
                },
                outlinedPrimary: {
                    borderColor: "#d32f2f",
                    color: "#d32f2f",
                    "&:hover": {
                        borderColor: "#b71c1c",
                        color: "#b71c1c",
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                },
            },
        },
        MuiTypography: {
            styleOverrides: {
                root: {
                    color: "#111827",
                },
            },
        },
    },
};

export const lightTheme = createTheme({
    ...commonTokens,
    ...lightOptions,
});
