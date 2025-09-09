import { useMemo, useState } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import { createAppTheme } from "./theme.ts";
import type { PaletteMode, Theme } from "@mui/material";

export function useThemeMode(): {
    mode: PaletteMode;
    toggleMode: () => void;
    theme: Theme;
} {
    const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
    const [mode, setMode] = useState<PaletteMode>(prefersDark ? "dark" : "light");
    const theme = useMemo(() => createAppTheme(mode), [mode]);
    const toggleMode = () => setMode((m) => (m === "light" ? "dark" : "light"));
    return { mode, toggleMode, theme };
}