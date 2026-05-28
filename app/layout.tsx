import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getIronSession } from 'iron-session'
import './globals.css'
import { AuthProvider } from '../components/AuthProvider'
import { AppLayout } from '../components/AppLayout'
import { refreshAccessToken } from '../lib/keycloak'
import { SessionData, SESSION_OPTIONS } from '../lib/session'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const BASE_PATH = '/users'

export const metadata: Metadata = {
  title: 'User Management | RASED',
  description: 'User Management Zone for RASED',
}

async function requireSession() {
  const session = await getIronSession<SessionData>(await cookies(), SESSION_OPTIONS)

  if (!session.accessToken) {
    redirect(`${BASE_PATH}/api/auth/login?returnUrl=${encodeURIComponent(BASE_PATH)}`)
  }

  const expiresAt = session.accessTokenExpiresAt || 0
  const twoMinutes = 2 * 60 * 1000

  if (expiresAt - Date.now() < twoMinutes) {
    const refreshed = await refreshAccessToken(session)
    if (!refreshed) {
      session.destroy()
      redirect(`${BASE_PATH}/api/auth/login?returnUrl=${encodeURIComponent(BASE_PATH)}`)
    }
    await session.save()
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireSession()

  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <AuthProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </AuthProvider>
      </body>
    </html>
  )
}
