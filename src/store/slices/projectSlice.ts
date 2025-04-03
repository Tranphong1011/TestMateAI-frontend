import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Project {
  id: string;
  name: string;
  description: string;
  type: string;
}

interface ProjectState {
  selectedProject: Project | null;
  activeProject: {
    projectKey: string | null;
    projectName: string | null;
  };
}

const initialState: ProjectState = {
  selectedProject: null,
  activeProject: {
    projectKey: null,
    projectName: null,
  },
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setSelectedProject: (state, action: PayloadAction<Project>) => {
      state.selectedProject = action.payload;
    },
    clearSelectedProject: (state) => {
      state.selectedProject = null;
    },
    setActiveProject: (state, action: PayloadAction<{ projectKey: string; projectName: string }>) => {
      state.activeProject = action.payload;
    },
    clearActiveProject: (state) => {
      state.activeProject = initialState.activeProject;
    },
  },
});

export const { setSelectedProject, clearSelectedProject, setActiveProject, clearActiveProject } = projectSlice.actions;
export default projectSlice.reducer; 