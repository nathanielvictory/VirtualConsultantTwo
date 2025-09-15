// src/store/authSlice.ts (backend auth)
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../api/authApi';

type BackendAuthState = {
    email: string | null;
    accessToken: string | null;
    tokenType: string | null;
    expiresAt: number | null;
};

const initialState: BackendAuthState = {
    email: null,
    accessToken: null,
    tokenType: null,
    expiresAt: null,
};

const slice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setEmail(state, action: PayloadAction<string | null>) {
            state.email = action.payload;
        },
        clearBackendAuth(state) {
            state.accessToken = null;
            state.tokenType = null;
            state.expiresAt = null;
            state.email = null;
        },
        // ⬇️ minimal addition used by the refresh helper
        setBackendToken(
            state,
            action: PayloadAction<{ accessToken: string; tokenType?: string; expiresIn?: number }>
        ) {
            state.accessToken = action.payload.accessToken ?? null;
            state.tokenType = action.payload.tokenType ?? 'Bearer';
            state.expiresAt = action.payload.expiresIn
                ? Date.now() + action.payload.expiresIn * 1000
                : null;
        },
    },
    extraReducers: (builder) => {
        builder.addMatcher(
            authApi.endpoints.postApiAuthToken.matchFulfilled,
            (state, { payload }) => {
                state.accessToken = payload.access_token ?? null;
                state.tokenType = payload.token_type ?? 'Bearer';
                state.expiresAt = payload.expires_in ? Date.now() + payload.expires_in * 1000 : null;
            }
        );
        builder.addMatcher(
            authApi.endpoints.postApiAuthRefresh.matchFulfilled,
            (state, { payload }) => {
                state.accessToken = payload.access_token ?? null;
                state.tokenType = payload.token_type ?? 'Bearer';
                state.expiresAt = payload.expires_in ? Date.now() + payload.expires_in * 1000 : null;
            }
        );
        builder.addMatcher(authApi.endpoints.postApiAuthLogout.matchFulfilled, (state) => {
            state.accessToken = null;
            state.tokenType = null;
            state.expiresAt = null;
        });
    },
});

export const { setEmail, clearBackendAuth, setBackendToken } = slice.actions;
export default slice.reducer;
