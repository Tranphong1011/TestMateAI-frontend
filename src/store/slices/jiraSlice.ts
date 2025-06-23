import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { setActiveProject } from './projectSlice';
import { API_URL } from '@/utils/config';

interface JiraState {
  projects: string[];
  selectedProject: string | null;
  loading: boolean;
  error: string | null;
  isConnected: boolean;
}

const initialState: JiraState = {
  projects: [],
  selectedProject: null,
  loading: false,
  error: null,
  isConnected: false,
};

export const getJiraProjects = createAsyncThunk(
  'jira/getProjects',
  async (userId: string) => {
    const response = await fetch(`${API_URL}/jira/projects?user_id=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch Jira projects');
    }
    const data = await response.json();
    return data.projects;
  }
);

export const selectProject = createAsyncThunk(
  'jira/selectProject',
  async ({ project, userId }: { project: string; userId: string }, { rejectWithValue, dispatch }) => {
    try {
      const response = await fetch(`${API_URL}/jira/select-project?user_id=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ project }),
      });

      if (!response.ok) {
        throw new Error('Failed to select project');
      }

      const data = await response.json();
      
      // Dispatch action to update project slice
      dispatch(setActiveProject({ 
        projectKey: project,
        projectName: data.project // Assuming the API returns project details
      }));

      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to select project');
    }
  }
);

const jiraSlice = createSlice({
  name: 'jira',
  initialState,
  reducers: {
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload;
    },
    clearJiraState: (state) => {
      state.projects = [];
      state.selectedProject = null;
      state.error = null;
      state.isConnected = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getJiraProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getJiraProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
        state.isConnected = true;
      })
      .addCase(getJiraProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch Jira projects';
      })
      .addCase(selectProject.fulfilled, (state, action) => {
        state.selectedProject = action.payload.project;
      })
      .addCase(selectProject.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setConnectionStatus, clearJiraState } = jiraSlice.actions;
export default jiraSlice.reducer; 