import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface AuthUser {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  roles: string[]
  department?: string
  stationCode?: string
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  // Actions
  setUser: (user: AuthUser) => void
  clearUser: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) =>
        set({ user, isAuthenticated: true, isLoading: false }, false, 'setUser'),

      clearUser: () =>
        set({ user: null, isAuthenticated: false, isLoading: false }, false, 'clearUser'),

      setLoading: (isLoading) => set({ isLoading }, false, 'setLoading'),
    }),
    { name: 'rased-auth-store' },
  ),
)
