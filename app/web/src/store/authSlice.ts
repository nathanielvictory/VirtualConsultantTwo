import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
    email: string | null;
}

const initialState: AuthState = {
    email: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login(state, action: PayloadAction<string>) {
            state.email = action.payload;
        },
        logout(state) {
            state.email = null;
        },
    },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
