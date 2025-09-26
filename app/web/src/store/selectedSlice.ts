// src/store/selectedSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type SelectedState = {
    projectId: number | null;
    memoId: number | null;
    slidedeckId: number | null;
};

const initialState: SelectedState = {
    projectId: null,
    memoId: null,
    slidedeckId: null,
};

const selectedSlice = createSlice({
    name: 'selected',
    initialState,
    reducers: {
        setProjectId(state, action: PayloadAction<number | null>) {
            if(state.projectId !== action.payload) {
                state.projectId = action.payload;
                state.memoId = null;
                state.slidedeckId = null;
            }
        },
        setMemoId(state, action: PayloadAction<number | null>) {
            state.memoId = action.payload;
        },
        setSlidedeckId(state, action: PayloadAction<number | null>) {
            state.slidedeckId = action.payload;
        },
        clearAll(state) {
            state.projectId = null;
            state.memoId = null;
            state.slidedeckId = null;
        },
    },
});

export const { setProjectId, setMemoId, setSlidedeckId, clearAll } = selectedSlice.actions;
export default selectedSlice.reducer;

// Selectors
export const selectProjectId = (s: { selected: SelectedState }) => s.selected.projectId;
