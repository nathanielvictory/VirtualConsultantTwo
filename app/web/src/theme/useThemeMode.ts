// src/theme/useThemeMode.ts
import { useMemo } from "react";
import { createAppTheme } from "./index";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { toggleThemeMode, setThemeMode } from "../store/settingsSlice";
import type { PaletteMode, Theme } from "@mui/material";

export function useThemeMode(): {
    mode: PaletteMode;
    toggleMode: () => void;
    setMode: (m: PaletteMode) => void;
    theme: Theme;
} {
    const mode = useAppSelector((s) => s.settings.themeMode);
    const dispatch = useAppDispatch();

    // If you prefer, you can memoize the ready-made theme objects,
    // but since they're stable singletons above, this memo is optional.
    const theme = useMemo(() => createAppTheme(mode), [mode]);

    return {
        mode,
        toggleMode: () => dispatch(toggleThemeMode()),
        setMode: (m: PaletteMode) => dispatch(setThemeMode(m)),
        theme,
    };
}
