import { create } from "zustand";

/**
 * ui.store — lightweight client-only UI state.
 * No persistence needed (resets to defaults on page reload is fine).
 */
interface UiStore {
  /** Whether the sidebar is open/expanded (desktop) or visible (mobile sheet). */
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
