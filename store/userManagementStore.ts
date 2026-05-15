import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { User, UserFilters, UsersResponse } from '@/lib/userTypes'

interface UserManagementState {
  users: User[]
  totalUsers: number
  totalPages: number
  selectedUser: User | null
  filters: UserFilters
  isLoading: boolean
  isSubmitting: boolean
  editModalOpen: boolean
  createModalOpen: boolean
  
  // Actions
  setUsers: (response: UsersResponse) => void
  setFilters: (filters: Partial<UserFilters>) => void
  openEditModal: (user: User) => void
  closeEditModal: () => void
  openCreateModal: () => void
  closeCreateModal: () => void
  setLoading: (loading: boolean) => void
  setSubmitting: (submitting: boolean) => void
}

const DEFAULT_FILTERS: UserFilters = {
  search: '',
  status: 'ALL',
  role: 'ALL',
  page: 1,
  pageSize: 10,
}

export const useUserManagementStore = create<UserManagementState>()(
  devtools(
    immer((set) => ({
      users: [],
      totalUsers: 0,
      totalPages: 0,
      selectedUser: null,
      filters: DEFAULT_FILTERS,
      isLoading: false,
      isSubmitting: false,
      editModalOpen: false,
      createModalOpen: false,

      setUsers: (response) => set((state) => {
        state.users = response.users
        state.totalUsers = response.total
        state.totalPages = response.totalPages
      }),

      setFilters: (filters) => set((state) => {
        Object.assign(state.filters, filters)
        if (!('page' in filters)) state.filters.page = 1
      }),

      openEditModal: (user) => set((state) => {
        state.selectedUser = user
        state.editModalOpen = true
      }),

      closeEditModal: () => set((state) => {
        state.selectedUser = null
        state.editModalOpen = false
      }),

      openCreateModal: () => set((state) => {
        state.createModalOpen = true
      }),

      closeCreateModal: () => set((state) => {
        state.createModalOpen = false
      }),

      setLoading: (loading) => set((state) => {
        state.isLoading = loading
      }),

      setSubmitting: (submitting) => set((state) => {
        state.isSubmitting = submitting
      }),
    })),
    { name: 'rased-user-management-store' }
  )
)
