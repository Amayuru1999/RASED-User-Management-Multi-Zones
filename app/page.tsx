import { UserDirectoryPage } from '@/components/UserDirectoryPage'
import { getUsers } from '@/lib/userRepository'
import { getUserDirectoryUiConfig } from '@/lib/userDirectoryUiConfigService'

export default async function UserManagementPage() {
  const [allUsersResponse, uiConfig] = await Promise.all([
    getUsers({
      search: '',
      status: 'ALL',
      role: 'ALL',
      page: 1,
      pageSize: 1000,
    }),
    getUserDirectoryUiConfig(),
  ])

  return (
    <UserDirectoryPage
      initialUsers={allUsersResponse.users}
      uiConfig={uiConfig}
    />
  )
}
