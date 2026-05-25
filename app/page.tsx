import { UserDirectoryPage } from '@/components/UserDirectoryPage'
import { getUsers } from '@/lib/userRepository'
import { DEFAULT_USER_DIRECTORY_UI_CONFIG } from '@/lib/userDirectoryUiConfig'

export default async function UserManagementPage() {
  const allUsersResponse = await getUsers({
    search: '',
    status: 'ALL',
    role: 'ALL',
    page: 1,
    pageSize: 1000,
  })

  return (
    <UserDirectoryPage
      initialUsers={allUsersResponse.users}
      uiConfig={DEFAULT_USER_DIRECTORY_UI_CONFIG}
    />
  )
}
