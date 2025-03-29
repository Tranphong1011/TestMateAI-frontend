import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface JiraProject {
  id: string;
  name: string;
  key: string;
  type: string;
}

interface JiraState {
  projects: JiraProject[];
  selectedProject: JiraProject | null;
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  availableIntegrations: {
    tool: string;
    projects: JiraProject[];
    selected_project: string[];
  }[];
}

const initialState: JiraState = {
  projects: [],
  selectedProject: null,
  loading: false,
  error: null,
  isConnected: false,
  availableIntegrations: [],
};

export const getJiraConnectUrl = createAsyncThunk(
  'jira/getConnectUrl',
  async (userId: string) => {
    const response = await fetch(`https://127.0.0.1:7000/api/v1/jira/connect?user_id=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to get Jira connect URL');
    }
    const data = await response.json();
    return data.oauth_url;
  }
);

export const fetchAvailableIntegrations = createAsyncThunk(
  'jira/fetchAvailableIntegrations',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('JWT token is missing');
      }

      const response = await fetch('https://127.0.0.1:7000/api/v1/get-available-integrations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch integrations');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch integrations');
    }
  }
);

export const selectProject = createAsyncThunk(
  'jira/selectProject',
  async (project: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('JWT token is missing');
      }

      const response = await fetch('https://127.0.0.1:7000/api/v1/select-project', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ project }),
      });

      if (!response.ok) {
        throw new Error('Failed to select project');
      }

      const data = await response.json();
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
    setProjects: (state, action) => {
      state.projects = action.payload;
    },
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload;
    },
    clearJiraState: (state) => {
      state.projects = [];
      state.selectedProject = null;
      state.error = null;
      state.isConnected = false;
      state.availableIntegrations = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getJiraConnectUrl.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getJiraConnectUrl.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(getJiraConnectUrl.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to get Jira connect URL';
      })
      .addCase(fetchAvailableIntegrations.fulfilled, (state, action) => {
        state.availableIntegrations = action.payload;
        // Update projects and connection status based on available integrations
        const jiraIntegration = action.payload.find((integration: any) => integration.tool === 'jira');
        if (jiraIntegration) {
          state.projects = jiraIntegration.projects;
          state.isConnected = true;
          if (jiraIntegration.selected_project?.length > 0) {
            state.selectedProject = jiraIntegration.projects.find(
              (p: JiraProject) => p.name === jiraIntegration.selected_project[0]
            ) || null;
          }
        }
      })
      .addCase(fetchAvailableIntegrations.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(selectProject.fulfilled, (state, action) => {
        const selectedProject = state.projects.find(p => p.name === action.payload.project);
        if (selectedProject) {
          state.selectedProject = selectedProject;
        }
      })
      .addCase(selectProject.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setProjects, setConnectionStatus, clearJiraState } = jiraSlice.actions;
export default jiraSlice.reducer; 