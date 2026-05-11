import type { RasedRole } from './session'

export type Permission =
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'users:manage_roles'
  | 'licenses:read'
  | 'licenses:write'
  | 'licenses:approve'
  | 'licenses:revoke'
  | 'production:read'
  | 'production:write'
  | 'production:approve'
  | 'reports:read'
  | 'reports:export'
  | 'reports:create'
  | 'system:admin'
  | 'audit:read'

const ROLE_PERMISSIONS: Record<RasedRole, Permission[]> = {
  SUPER_ADMIN: [
    'users:read',
    'users:write',
    'users:delete',
    'users:manage_roles',
    'licenses:read',
    'licenses:write',
    'licenses:approve',
    'licenses:revoke',
    'production:read',
    'production:write',
    'production:approve',
    'reports:read',
    'reports:export',
    'reports:create',
    'system:admin',
    'audit:read',
  ],
  EXCISE_OFFICER: [
    'licenses:read',
    'licenses:write',
    'licenses:approve',
    'production:read',
    'production:write',
    'production:approve',
    'reports:read',
    'reports:export',
    'users:read',
  ],
  DATA_ENTRY_OPERATOR: [
    'licenses:read',
    'licenses:write',
    'production:read',
    'production:write',
    'reports:read',
  ],
  AUDITOR: [
    'licenses:read',
    'production:read',
    'reports:read',
    'reports:export',
    'audit:read',
    'users:read',
  ],
}

export function hasPermission(roles: RasedRole[], permission: Permission): boolean {
  return roles.some((role) => ROLE_PERMISSIONS[role]?.includes(permission) ?? false)
}

export function hasAnyPermission(roles: RasedRole[], permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(roles, p))
}

export function getPermissions(roles: RasedRole[]): Permission[] {
  const perms = new Set<Permission>()
  roles.forEach((role) => ROLE_PERMISSIONS[role]?.forEach((p) => perms.add(p)))
  return Array.from(perms)
}
