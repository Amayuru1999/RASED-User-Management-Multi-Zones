export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startUserManagementObservability } = await import('./lib/observability')
    startUserManagementObservability()
  }
}
