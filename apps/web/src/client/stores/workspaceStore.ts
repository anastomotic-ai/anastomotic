import { create } from 'zustand';
import { createLogger } from '../lib/logger';

const logger = createLogger('WorkspaceStore');
import type {
  Workspace,
  WorkspaceCreateInput,
  WorkspaceUpdateInput,
} from '@anastomotic_ai/agent-core/common';
import { getAnastomotic } from '../lib/anastomotic';

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  isLoading: boolean;
  isSwitching: boolean;

  loadWorkspaces: () => Promise<void>;
  switchWorkspace: (id: string) => Promise<void>;
  createWorkspace: (input: WorkspaceCreateInput) => Promise<Workspace | null>;
  updateWorkspace: (id: string, input: WorkspaceUpdateInput) => Promise<Workspace | null>;
  deleteWorkspace: (id: string) => Promise<boolean>;
  setActiveWorkspaceId: (id: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  activeWorkspaceId: null,
  isLoading: false,
  isSwitching: false,

  loadWorkspaces: async () => {
    set({ isLoading: true });
    try {
      const api = getAnastomotic();
      const [workspaces, activeId] = await Promise.all([
        api.listWorkspaces(),
        api.getActiveWorkspaceId(),
      ]);
      set({ workspaces, activeWorkspaceId: activeId, isLoading: false });
    } catch (err) {
      logger.error('Failed to load workspaces:', err);
      set({ isLoading: false });
    }
  },

  switchWorkspace: async (id: string) => {
    if (id === get().activeWorkspaceId) {
      return;
    }
    set({ isSwitching: true });
    try {
      const api = getAnastomotic();
      const result = await api.switchWorkspace(id);
      if (result.success) {
        set({ activeWorkspaceId: id, isSwitching: false });
      } else {
        logger.warn('Workspace switch rejected:', result.reason);
        set({ isSwitching: false });
      }
    } catch (err) {
      logger.error('Failed to switch workspace:', err);
      set({ isSwitching: false });
    }
  },

  createWorkspace: async (input: WorkspaceCreateInput) => {
    try {
      const api = getAnastomotic();
      const workspace = await api.createWorkspace(input);
      set((state) => ({
        workspaces: [...state.workspaces, workspace],
      }));
      return workspace;
    } catch (err) {
      logger.error('Failed to create workspace:', err);
      return null;
    }
  },

  updateWorkspace: async (id: string, input: WorkspaceUpdateInput) => {
    try {
      const api = getAnastomotic();
      const updated = await api.updateWorkspace(id, input);
      if (updated) {
        set((state) => ({
          workspaces: state.workspaces.map((w) => (w.id === id ? updated : w)),
        }));
      }
      return updated;
    } catch (err) {
      logger.error('Failed to update workspace:', err);
      return null;
    }
  },

  deleteWorkspace: async (id: string) => {
    try {
      const api = getAnastomotic();
      const deleted = await api.deleteWorkspace(id);
      if (deleted) {
        set((state) => ({
          workspaces: state.workspaces.filter((w) => w.id !== id),
        }));
      }
      return deleted;
    } catch (err) {
      logger.error('Failed to delete workspace:', err);
      return false;
    }
  },

  setActiveWorkspaceId: (id: string) => {
    set({ activeWorkspaceId: id });
  },
}));

// Subscribe to workspace events
let unsubscribeWorkspaceChanged: (() => void) | undefined;

if (typeof window !== 'undefined' && window.anastomotic) {
  unsubscribeWorkspaceChanged?.();
  const unsub = window.anastomotic.onWorkspaceChanged?.((data: { workspaceId: string }) => {
    useWorkspaceStore.getState().setActiveWorkspaceId(data.workspaceId);
  });
  if (unsub) {
    unsubscribeWorkspaceChanged = unsub;
  }
}

import.meta.hot?.dispose(() => {
  unsubscribeWorkspaceChanged?.();
  unsubscribeWorkspaceChanged = undefined;
});
