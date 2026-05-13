import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  message: string;
  detail?: string;
  timestamp: string;
  read: boolean;
}

interface NotificationState {
  items: Notification[];
}

const initialState: NotificationState = { items: [] };

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (
      state,
      action: PayloadAction<{ message: string; detail?: string }>
    ) => {
      state.items.unshift({
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
      });
      if (state.items.length > 50) state.items = state.items.slice(0, 50);
    },
    markAllRead: (state) => {
      state.items = state.items.map((n) => ({ ...n, read: true }));
    },
    clearAll: (state) => {
      state.items = [];
    },
  },
});

export const { addNotification, markAllRead, clearAll } = notificationSlice.actions;
export default notificationSlice.reducer;
