const ALLOWED_RETURN_PATHS = ['/dashboard', '/users', '/licenses', '/production', '/reports', '/settings']

export function sanitizeReturnUrl(value: string | null | undefined, fallback: string) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return fallback
  }

  return ALLOWED_RETURN_PATHS.some((path) => value === path || value.startsWith(`${path}/`))
    ? value
    : fallback
}
