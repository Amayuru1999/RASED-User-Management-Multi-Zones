import type { User, UserFilters } from '@/lib/userTypes'

export type UserDirectoryIcon = 'eye' | 'edit' | 'plus' | 'search' | 'shield_alert' | 'users'
export type UserDirectoryTone = 'primary' | 'warning' | 'neutral'
export type UserDirectoryFormatter = 'none' | 'role_label'
export type UserDirectoryFilterRenderer = 'search_input' | 'select'
export type UserDirectoryColumnRenderer = 'avatar_text' | 'tag_list' | 'badge' | 'text'
export type UserDirectoryActionKind = 'navigate' | 'noop'

export interface UserDirectoryOption {
  label: string
  value: string
}

export interface UserDirectoryPrimaryAction {
  label: string
  icon: UserDirectoryIcon
  tone: UserDirectoryTone
  action: {
    kind: 'navigate'
    hrefTemplate: string
  }
}

export interface UserDirectoryFilterConfig {
  key: keyof UserFilters
  label: string
  renderer: UserDirectoryFilterRenderer
  placeholder?: string
  options?: UserDirectoryOption[]
  widthClassName?: string
}

export interface UserDirectoryAvatarTextColumnConfig {
  key: string
  header: string
  renderer: 'avatar_text'
  titleTemplate: string
  subtitleField: keyof User
  initialsFields: Array<keyof User>
}

export interface UserDirectoryTagListColumnConfig {
  key: string
  header: string
  renderer: 'tag_list'
  valueField: keyof User
  emptyText?: string
  labelFormatter?: UserDirectoryFormatter
  iconWhenValue?: Partial<Record<string, UserDirectoryIcon>>
}

export interface UserDirectoryBadgeColumnConfig {
  key: string
  header: string
  renderer: 'badge'
  valueField: keyof User
  variants: Record<string, string>
}

export interface UserDirectoryTextColumnConfig {
  key: string
  header: string
  renderer: 'text'
  valueField: keyof User
  emptyText?: string
  formatter?: UserDirectoryFormatter
}

export type UserDirectoryColumnConfig =
  | UserDirectoryAvatarTextColumnConfig
  | UserDirectoryTagListColumnConfig
  | UserDirectoryBadgeColumnConfig
  | UserDirectoryTextColumnConfig

export interface UserDirectoryRowActionConfig {
  key: string
  label: string
  icon: UserDirectoryIcon
  tone: UserDirectoryTone
  action: {
    kind: UserDirectoryActionKind
    hrefTemplate?: string
  }
}

export interface UserDirectoryUiConfig {
  title: string
  titleIcon: UserDirectoryIcon
  description: string
  primaryAction: UserDirectoryPrimaryAction
  filters: UserDirectoryFilterConfig[]
  table: {
    columns: UserDirectoryColumnConfig[]
    rowActions: UserDirectoryRowActionConfig[]
  }
}

export const DEFAULT_USER_DIRECTORY_UI_CONFIG: UserDirectoryUiConfig = {
  title: 'User Management',
  titleIcon: 'users',
  description: 'Manage system users, roles, and access permissions.',
  primaryAction: {
    label: 'Add New User',
    icon: 'plus',
    tone: 'primary',
    action: {
      kind: 'navigate',
      hrefTemplate: '/new',
    },
  },
  filters: [
    {
      key: 'search',
      label: 'Search',
      renderer: 'search_input',
      placeholder: 'Search users...',
      widthClassName: 'w-full sm:w-64',
    },
    {
      key: 'status',
      label: 'Status',
      renderer: 'select',
      widthClassName: 'w-full sm:w-48',
      options: [
        { label: 'All Statuses', value: 'ALL' },
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Inactive', value: 'INACTIVE' },
        { label: 'Suspended', value: 'SUSPENDED' },
        { label: 'Pending', value: 'PENDING' },
      ],
    },
    {
      key: 'role',
      label: 'Role',
      renderer: 'select',
      widthClassName: 'w-full sm:w-48',
      options: [
        { label: 'All Roles', value: 'ALL' },
        { label: 'Super Admin', value: 'SUPER_ADMIN' },
        { label: 'Excise Officer', value: 'EXCISE_OFFICER' },
        { label: 'Auditor', value: 'AUDITOR' },
        { label: 'Data Entry Operator', value: 'DATA_ENTRY_OPERATOR' },
      ],
    },
  ],
  table: {
    columns: [
      {
        key: 'user_identity',
        header: 'User',
        renderer: 'avatar_text',
        titleTemplate: '{firstName} {lastName}',
        subtitleField: 'email',
        initialsFields: ['firstName', 'lastName'],
      },
      {
        key: 'roles',
        header: 'Role',
        renderer: 'tag_list',
        valueField: 'roles',
        labelFormatter: 'role_label',
        iconWhenValue: {
          SUPER_ADMIN: 'shield_alert',
        },
      },
      {
        key: 'status',
        header: 'Status',
        renderer: 'badge',
        valueField: 'status',
        variants: {
          ACTIVE: 'bg-green-100 text-green-800',
          INACTIVE: 'bg-slate-100 text-slate-800',
          SUSPENDED: 'bg-red-100 text-red-800',
          PENDING: 'bg-yellow-100 text-yellow-800',
        },
      },
      {
        key: 'department',
        header: 'Department',
        renderer: 'text',
        valueField: 'department',
        emptyText: '-',
      },
    ],
    rowActions: [
      {
        key: 'view',
        label: 'View',
        icon: 'eye',
        tone: 'primary',
        action: {
          kind: 'navigate',
          hrefTemplate: '/{id}',
        },
      },
      {
        key: 'edit',
        label: 'Edit',
        icon: 'edit',
        tone: 'warning',
        action: {
          kind: 'noop',
        },
      },
    ],
  },
}
