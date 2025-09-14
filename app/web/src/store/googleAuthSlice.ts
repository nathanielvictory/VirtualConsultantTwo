// src/store/googleAuthSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface GoogleAuthState {
    accessToken: string | null;
    expiresAt: number | null; // epoch ms
    scopes: string[];
    status: 'idle' | 'loading' | 'authenticated' | 'error';
    error?: string;
}

const initialState: GoogleAuthState = {
    accessToken: null,
    expiresAt: null,
    scopes: [],
    status: 'idle',
    error: undefined,
};

const googleAuthSlice = createSlice({
    name: 'googleAuth',
    initialState,
    reducers: {
        beginGoogleAuth(state) {
            state.status = 'loading';
            state.error = undefined;
        },
        setGoogleToken(
            state,
            action: PayloadAction<{ accessToken: string; expiresIn: number; scopes: string[] }>
        ) {
            const now = Date.now();
            state.accessToken = action.payload.accessToken;
            state.expiresAt = now + action.payload.expiresIn * 1000;
            state.scopes = action.payload.scopes;
            state.status = 'authenticated';
            state.error = undefined;
        },
        googleAuthError(state, action: PayloadAction<string>) {
            state.status = 'error';
            state.error = action.payload;
        },
        clearGoogleAuth(state) {
            state.accessToken = null;
            state.expiresAt = null;
            state.scopes = [];
            state.status = 'idle';
            state.error = undefined;
        },
    },
});

export const {
    beginGoogleAuth,
    setGoogleToken,
    googleAuthError,
    clearGoogleAuth,
} = googleAuthSlice.actions;

export default googleAuthSlice.reducer;
