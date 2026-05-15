export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING'

export interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  roles: string[]
  status: UserStatus
  nic?: string
  phone?: string
  department?: string
  stationCode?: string
}

export interface UserFilters {
  search: string
  status: string
  role: string
  page: number
  pageSize: number
}

export interface UsersResponse {
  users: User[]
  total: number
  totalPages: number
}
