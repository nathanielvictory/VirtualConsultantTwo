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

// Persist configs
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

const rootReducer = combineReducers({
    settings: persistReducer(settingsPersistConfig, settingsReducer),
    auth: persistReducer(authPersistConfig, authReducer),
});

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefault) =>
        getDefault({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
