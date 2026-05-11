import { NextRequest, NextResponse } from 'next/server'
import { MOCK_USERS } from '@/lib/mockData'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  if (process.env.NODE_ENV === 'development') {
    const user = MOCK_USERS.find(u => u.id === id)
    if (user) {
      return NextResponse.json(user)
    }
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // In production, proxy to backend BFF
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}
