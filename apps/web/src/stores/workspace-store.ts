import { create } from "zustand"

type WorkspaceState = {
  activeWorkspaceId: string | null
  selectWorkspace: (workspaceId: string) => void
  clearWorkspace: () => void
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeWorkspaceId: null,
  selectWorkspace: (workspaceId) => set({ activeWorkspaceId: workspaceId }),
  clearWorkspace: () => set({ activeWorkspaceId: null }),
}))