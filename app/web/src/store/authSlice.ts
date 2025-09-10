import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface GoogleAuthState {
    accessToken: string | null;
    expiresAt: number | null;   // epoch ms
    scopes: string[];
    status: 'idle' | 'loading' | 'authenticated' | 'error';
    error?: string;
}

export interface AuthState {
    email: string | null;
    google: GoogleAuthState;
}

const initialState: AuthState = {
    email: null,
    google: {
        accessToken: null,
        expiresAt: null,
        scopes: [],
        status: 'idle',
        error: undefined,
    },
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Internal auth
        login(state, action: PayloadAction<string>) {
            state.email = action.payload;
        },
        logout(state) {
            state.email = null;
            // Also clear Google token on logout
            state.google = { accessToken: null, expiresAt: null, scopes: [], status: 'idle' };
        },

        // Google auth
        beginGoogleAuth(state) {
            state.google.status = 'loading';
            state.google.error = undefined;
        },
        setGoogleToken(
            state,
            action: PayloadAction<{ accessToken: string; expiresIn: number; scopes: string[] }>
        ) {
            const now = Date.now();
            state.google.accessToken = action.payload.accessToken;
            state.google.expiresAt = now + action.payload.expiresIn * 1000;
            state.google.scopes = action.payload.scopes;
            state.google.status = 'authenticated';
            state.google.error = undefined;
        },
        googleAuthError(state, action: PayloadAction<string>) {
            state.google.status = 'error';
            state.google.error = action.payload;
        },
        clearGoogleAuth(state) {
            state.google = { accessToken: null, expiresAt: null, scopes: [], status: 'idle' };
        },
    },
});

export const {
    login,
    logout,
    beginGoogleAuth,
    setGoogleToken,
    googleAuthError,
    clearGoogleAuth,
} = authSlice.actions;

export default authSlice.reducer;
