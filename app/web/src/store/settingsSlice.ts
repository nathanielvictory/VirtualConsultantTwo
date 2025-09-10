import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { PaletteMode } from '@mui/material';

export interface SettingsState {
    themeMode: PaletteMode;
}

export function createInitialSettings(prefersDark: boolean): SettingsState {
    return { themeMode: prefersDark ? 'dark' : 'light' };
}

const settingsSlice = createSlice({
    name: 'settings',
    initialState: { themeMode: 'light' } as SettingsState, // safe default
    reducers: {
        setThemeMode(state, action: PayloadAction<PaletteMode>) {
            state.themeMode = action.payload;
        },
        toggleThemeMode(state) {
            state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
        },
    },
});

export const { setThemeMode, toggleThemeMode } = settingsSlice.actions;
export default settingsSlice.reducer;
