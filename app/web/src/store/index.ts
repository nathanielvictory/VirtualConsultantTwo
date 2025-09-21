// src/store/index.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
    persistReducer,
    persistStore,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import settingsReducer from './settingsSlice';
import authReducer from './authSlice';
import googleAuthReducer from './googleAuthSlice';
import selectedReducer from './selectedSlice'; // <-- NEW

import { emptySplitApi } from '../api/emptyApi';

const settingsPersistConfig = {
    key: 'settings',
    storage,
    version: 1,
    whitelist: ['themeMode'],
};

const authPersistConfig = {
    key: 'auth',
    storage,
    version: 1,
    whitelist: ['email'],
};

// Persist only the projectId so we remember the last selected project.
const selectedPersistConfig = {
    key: 'selected',
    storage,
    version: 1,
    whitelist: ['projectId'], // <-- only persist projectId
};

const rootReducer = combineReducers({
    settings: persistReducer(settingsPersistConfig, settingsReducer),
    auth: persistReducer(authPersistConfig, authReducer),
    googleAuth: googleAuthReducer,
    selected: persistReducer(selectedPersistConfig, selectedReducer), // <-- NEW
    [emptySplitApi.reducerPath]: emptySplitApi.reducer,
});

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefault) =>
        getDefault({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }).concat(emptySplitApi.middleware),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
