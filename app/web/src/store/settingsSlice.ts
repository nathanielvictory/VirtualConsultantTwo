import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { PaletteMode } from '@mui/material';

export interface SettingsState {
    themeMode: PaletteMode;
    overlayVisible: boolean;
}

export function createInitialSettings(prefersDark: boolean): SettingsState {
    return {
        themeMode: prefersDark ? 'dark' : 'light',
        overlayVisible: false, // default: hidden
    };
}

const settingsSlice = createSlice({
    name: 'settings',
    initialState: {
        themeMode: 'light',
        overlayVisible: false,
    } as SettingsState, // safe default
    reducers: {
        setThemeMode(state, action: PayloadAction<PaletteMode>) {
            state.themeMode = action.payload;
        },
        toggleThemeMode(state) {
            state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
        },
        setOverlayVisible(state, action: PayloadAction<boolean>) {
            state.overlayVisible = action.payload;
        },
        toggleOverlay(state) {
            state.overlayVisible = !state.overlayVisible;
        },
    },
});

export const {
    setThemeMode,
    toggleThemeMode,
    setOverlayVisible,
    toggleOverlay,
} = settingsSlice.actions;

export default settingsSlice.reducer;
