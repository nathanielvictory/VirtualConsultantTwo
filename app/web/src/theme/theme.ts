import { createTheme, type ThemeOptions } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material";

export const getDesignTokens = (mode: PaletteMode): ThemeOptions => ({
    palette: {
        mode,
        background: {
            default: mode === "light" ? "#ffffff" : "#121212",
        },
    },
});

export const createAppTheme = (mode: PaletteMode) =>
    createTheme(getDesignTokens(mode));
