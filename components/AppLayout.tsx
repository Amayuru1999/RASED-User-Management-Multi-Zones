import { SharedAppLayout } from 'rased-shared-ui'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { SessionData, SESSION_OPTIONS } from '../lib/session'
import { UserManagementNavbar } from './UserManagementNavbar'

const BASE_PATH = '/users'

export async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, SESSION_OPTIONS)
  const userName = session.user ? `${session.user.firstName} ${session.user.lastName}` : 'test User'

  return (
    <SharedAppLayout userName={userName} logoutHref={`${BASE_PATH}/api/auth/logout`}>
      <div className="space-y-6">
        <UserManagementNavbar />
        {children}
      </div>
    </SharedAppLayout>
  )
}
