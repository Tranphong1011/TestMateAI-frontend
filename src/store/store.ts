import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import authReducer from './slices/authSlice';
import projectReducer from './slices/projectSlice';
import jiraReducer from './slices/jiraSlice';

const createNoopStorage = () => ({
  getItem(_key: string): Promise<string | null> { return Promise.resolve(null); },
  setItem(_key: string, _value: string): Promise<void> { return Promise.resolve(); },
  removeItem(_key: string): Promise<void> { return Promise.resolve(); },
});

const storage = typeof window !== 'undefined'
  ? require('redux-persist/lib/storage').default
  : createNoopStorage();

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'project', 'jira'], // Persist these reducers
};

// Combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
  project: projectReducer,
  jira: jiraReducer,
});

// Create a single persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 