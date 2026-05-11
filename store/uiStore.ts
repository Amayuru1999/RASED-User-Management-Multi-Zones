import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface UIState {
  sidebarCollapsed: boolean
  sidebarMobileOpen: boolean
  // Actions
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleMobileSidebar: () => void
  closeMobileSidebar: () => void
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      sidebarCollapsed: false,
      sidebarMobileOpen: false,

      toggleSidebar: () =>
        set(
          (state) => ({ sidebarCollapsed: !state.sidebarCollapsed }),
          false,
          'toggleSidebar',
        ),

      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }, false, 'setSidebarCollapsed'),

      toggleMobileSidebar: () =>
        set(
          (state) => ({ sidebarMobileOpen: !state.sidebarMobileOpen }),
          false,
          'toggleMobileSidebar',
        ),

      closeMobileSidebar: () =>
        set({ sidebarMobileOpen: false }, false, 'closeMobileSidebar'),
    }),
    { name: 'rased-ui-store' },
  ),
)
