import { NextResponse } from 'next/server'
import { getUserDirectoryUiConfig } from '@/lib/userDirectoryUiConfigService'

export async function GET() {
  const data = await getUserDirectoryUiConfig()
  return NextResponse.json(data)
}
