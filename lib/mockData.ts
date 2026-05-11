import { User, UserFilters } from '../store/userManagementStore'

export const MOCK_USERS: User[] = [
  {
    id: 'u-1',
    username: 'kasun.s',
    email: 'kasun.s@excise.gov.lk',
    firstName: 'Kasun',
    lastName: 'Silva',
    roles: ['SUPER_ADMIN'],
    status: 'ACTIVE',
    nic: '198512345678',
    phone: '0712345678',
    department: 'IT',
  },
  {
    id: 'u-2',
    username: 'chamara.p',
    email: 'chamara.p@excise.gov.lk',
    firstName: 'Chamara',
    lastName: 'Perera',
    roles: ['EXCISE_OFFICER'],
    status: 'ACTIVE',
    nic: '881234567V',
    phone: '0771234567',
    department: 'Operations',
    stationCode: 'CMB-01',
  },
  {
    id: 'u-3',
    username: 'nuwan.w',
    email: 'nuwan.w@excise.gov.lk',
    firstName: 'Nuwan',
    lastName: 'Wijesinghe',
    roles: ['DATA_ENTRY_OPERATOR'],
    status: 'ACTIVE',
    nic: '921234567V',
    department: 'Licensing',
  },
  {
    id: 'u-4',
    username: 'amali.f',
    email: 'amali.f@excise.gov.lk',
    firstName: 'Amali',
    lastName: 'Fernando',
    roles: ['AUDITOR'],
    status: 'INACTIVE',
    nic: '199012345678',
    department: 'Audit',
  },
]

export function getMockUsers(filters: UserFilters) {
  let filtered = [...MOCK_USERS]

  if (filters.search) {
    const q = filters.search.toLowerCase()
    filtered = filtered.filter(
      (u) =>
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q)
    )
  }

  if (filters.status && filters.status !== 'ALL') {
    filtered = filtered.filter((u) => u.status === filters.status)
  }

  if (filters.role && filters.role !== 'ALL') {
    filtered = filtered.filter((u) => u.roles.includes(filters.role))
  }

  const start = (filters.page - 1) * filters.pageSize
  return {
    users: filtered.slice(start, start + filters.pageSize),
    total: filtered.length,
    totalPages: Math.ceil(filtered.length / filters.pageSize),
  }
}
