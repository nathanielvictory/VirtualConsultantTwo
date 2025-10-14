// src/store/authSlice.ts (backend auth)
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../api/authApi';

type BackendAuthState = {
    email: string | null;
    accessToken: string | null;
    tokenType: string | null;
    expiresAt: number | null;
    role: string | null;
};

const initialState: BackendAuthState = (() => {
    try {
        const storedToken = localStorage.getItem('backendToken');
        if (storedToken) {
            const { accessToken, tokenType, expiresAt } = JSON.parse(storedToken);
            if (expiresAt && expiresAt > Date.now()) {
                return {
                    email: null, // Email is not persisted
                    accessToken,
                    tokenType,
                    expiresAt,
                    role: null, // Role is not persisted
                };
            }
        }
    } catch (e) {
        console.error("Could not load backend token from local storage", e);
    }
    return {
        email: null,
        accessToken: null,
        tokenType: null,
        expiresAt: null,
        role: null,
    };
})();

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
            state.role = null;
            localStorage.removeItem('backendToken');
        },
        // ⬇️ minimal addition used by the refresh helper
        setBackendToken(
            state,
            action: PayloadAction<{
                accessToken: string;
                tokenType?: string;
                expiresIn?: number;
                role?: string;
            }>
        ) {
            const { accessToken, tokenType, expiresIn, role } = action.payload;
            state.accessToken = accessToken;
            state.tokenType = tokenType ?? 'Bearer';
            state.expiresAt = expiresIn ? Date.now() + expiresIn * 1000 : null;
            state.role = role ?? null;

            // Persist to localStorage
            localStorage.setItem(
                'backendToken',
                JSON.stringify({
                    accessToken,
                    tokenType: state.tokenType,
                    expiresAt: state.expiresAt,
                })
            );
        },
    },
    extraReducers: (builder) => {
        builder.addMatcher(
            authApi.endpoints.postApiAuthToken.matchFulfilled,
            (state, { payload }) => {
                state.accessToken = payload.access_token ?? null;
                state.tokenType = payload.token_type ?? 'Bearer';
                state.expiresAt = payload.expires_in ? Date.now() + payload.expires_in * 1000 : null;
                state.role = (payload as any).role_label ?? null;
                if (state.accessToken) {
                    localStorage.setItem(
                        'backendToken',
                        JSON.stringify({
                            accessToken: state.accessToken,
                            tokenType: state.tokenType,
                            expiresAt: state.expiresAt,
                        })
                    );
                }
            }
        );
        builder.addMatcher(
            authApi.endpoints.postApiAuthRefresh.matchFulfilled,
            (state, { payload }) => {
                state.accessToken = payload.access_token ?? null;
                state.tokenType = payload.token_type ?? 'Bearer';
                state.expiresAt = payload.expires_in ? Date.now() + payload.expires_in * 1000 : null;
                state.role = (payload as any).role_label ?? null;
                if (state.accessToken) {
                    localStorage.setItem(
                        'backendToken',
                        JSON.stringify({
                            accessToken: state.accessToken,
                            tokenType: state.tokenType,
                            expiresAt: state.expiresAt,
                        })
                    );
                }
            }
        );
        builder.addMatcher(authApi.endpoints.postApiAuthLogout.matchFulfilled, (state) => {
            state.accessToken = null;
            state.tokenType = null;
            state.expiresAt = null;
            state.role = null;
            localStorage.removeItem('backendToken');
        });
    },
});

export const { setEmail, clearBackendAuth, setBackendToken } = slice.actions;
export default slice.reducer;
