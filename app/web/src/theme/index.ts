// src/theme/index.ts
import type { PaletteMode, Theme } from "@mui/material";
import { lightTheme } from "./lightTheme";
import { darkTheme } from "./darkTheme";

export const createAppTheme = (mode: PaletteMode): Theme =>
    mode === "dark" ? darkTheme : lightTheme;
