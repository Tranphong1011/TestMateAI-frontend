import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import projectReducer from './slices/projectSlice';
import jiraReducer from './slices/jiraSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'project', 'jira'], // Persist auth, project, and jira state
};

// Create persisted reducers
const persistedAuthReducer = persistReducer(persistConfig, authReducer);
const persistedProjectReducer = persistReducer(persistConfig, projectReducer);
const persistedJiraReducer = persistReducer(persistConfig, jiraReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    project: persistedProjectReducer,
    jira: persistedJiraReducer,
  },
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