'use client'

import { useEffect, useState, type ComponentType } from 'react'
import { useRouter } from 'next/navigation'
import { useUserManagementStore } from '@/store/userManagementStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  renderSchemaNode,
  SchemaActionButton,
  SchemaFilters,
  SchemaRowActions,
  type SchemaRendererRegistry,
} from 'rased-shared-ui'
import {
  ChevronLeft,
  ChevronRight,
  Edit2,
  Eye,
  Plus,
  Search,
  ShieldAlert,
  Users,
} from 'lucide-react'
import { clsx } from 'clsx'
import type {
  UserDirectoryColumnConfig,
  UserDirectoryFilterConfig,
  UserDirectoryIcon,
  UserDirectoryPrimaryAction,
  UserDirectoryRowActionConfig,
  UserDirectoryTone,
  UserDirectoryUiConfig,
} from '@/lib/userDirectoryUiConfig'
import { DEFAULT_USER_DIRECTORY_UI_CONFIG } from '@/lib/userDirectoryUiConfig'
import type { User, UserFilters } from '@/lib/userTypes'

const ICON_REGISTRY = {
  edit: Edit2,
  eye: Eye,
  plus: Plus,
  search: Search,
  shield_alert: ShieldAlert,
  users: Users,
} satisfies Record<UserDirectoryIcon, ComponentType<{ className?: string }>>

const ACTION_TONE_CLASSES: Record<UserDirectoryTone, string> = {
  primary: 'text-slate-500 hover:text-[#1e90ff] hover:bg-blue-50 hover:border-blue-100',
  warning: 'text-slate-500 hover:text-accent hover:bg-amber-50 hover:border-amber-100',
  neutral: 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 hover:border-slate-200',
}

function getFilterValue(filters: UserFilters, key: keyof UserFilters) {
  const value = filters[key]
  return typeof value === 'string' ? value : String(value)
}

function formatValue(value: string, formatter?: 'none' | 'role_label') {
  if (!value) {
    return value
  }

  if (formatter === 'role_label') {
    return value.replaceAll('_', ' ')
  }

  return value
}

function buildHrefFromTemplate(template: string | undefined, user: User) {
  if (!template) {
    return '#'
  }

  return template.replaceAll(/\{(\w+)\}/g, (_, token: keyof User) => {
    const value = user[token]
    return value == null ? '' : String(value)
  })
}

function buildTextFromTemplate(template: string, user: User) {
  return template.replaceAll(/\{(\w+)\}/g, (_, token: keyof User) => {
    const value = user[token]
    return value == null ? '' : String(value)
  })
}

interface FilterRendererContext {
  filters: UserFilters
  setFilterValue: (key: keyof UserFilters, value: string) => void
}

interface ColumnRendererContext {
  user: User
}

const FILTER_RENDERERS = {
  search_input: (filter: UserDirectoryFilterConfig, context: FilterRendererContext) => {
    const SearchIcon = ICON_REGISTRY.search

    return (
      <div key={filter.key} className={filter.widthClassName || 'w-full'}>
        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={filter.placeholder || 'Search...'}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={getFilterValue(context.filters, filter.key)}
            onChange={(event) => context.setFilterValue(filter.key, event.target.value)}
          />
        </div>
      </div>
    )
  },
  select: (filter: UserDirectoryFilterConfig, context: FilterRendererContext) => (
    <div key={filter.key} className={filter.widthClassName || 'w-full'}>
      <label className="sr-only" htmlFor={`user-directory-filter-${filter.key}`}>
        {filter.label}
      </label>
      <select
        id={`user-directory-filter-${filter.key}`}
        className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
        value={getFilterValue(context.filters, filter.key)}
        onChange={(event) => context.setFilterValue(filter.key, event.target.value)}
      >
        {(filter.options || []).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  ),
} satisfies SchemaRendererRegistry<
  UserDirectoryFilterConfig['renderer'],
  UserDirectoryFilterConfig,
  FilterRendererContext
>

const COLUMN_RENDERERS = {
  avatar_text: (column: Extract<UserDirectoryColumnConfig, { renderer: 'avatar_text' }>, context: ColumnRendererContext) => {
    const initials = column.initialsFields
      .map((field) => String(context.user[field] || '').trim())
      .filter(Boolean)
      .map((value) => value[0])
      .join('')

    return (
      <div className="flex items-center">
        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium mr-3">
          {initials || '--'}
        </div>
        <div>
          <div className="font-medium text-slate-900">{buildTextFromTemplate(column.titleTemplate, context.user)}</div>
          <div className="text-slate-500 text-xs">{String(context.user[column.subtitleField] || '-')}</div>
        </div>
      </div>
    )
  },
  tag_list: (column: Extract<UserDirectoryColumnConfig, { renderer: 'tag_list' }>, context: ColumnRendererContext) => {
    const value = context.user[column.valueField]
    const items = Array.isArray(value) ? value : []

    if (items.length === 0) {
      return column.emptyText || '-'
    }

    return (
      <div className="flex flex-wrap gap-1">
        {items.map((item) => {
          const iconName = column.iconWhenValue?.[item]
          const Icon = iconName ? ICON_REGISTRY[iconName] : null

          return (
            <span
              key={item}
              className="px-2 py-1 text-[10px] font-semibold bg-blue-50 text-blue-700 rounded-full border border-blue-200 flex items-center"
            >
              {Icon ? <Icon className="h-3 w-3 mr-1" /> : null}
              {formatValue(item, column.labelFormatter)}
            </span>
          )
        })}
      </div>
    )
  },
  badge: (column: Extract<UserDirectoryColumnConfig, { renderer: 'badge' }>, context: ColumnRendererContext) => {
    const value = String(context.user[column.valueField] || '')
    const variantClasses = column.variants[value] || 'bg-slate-100 text-slate-800'

    return (
      <span className={clsx('px-2.5 py-1 text-xs font-medium rounded-full', variantClasses)}>
        {value || '-'}
      </span>
    )
  },
  text: (column: Extract<UserDirectoryColumnConfig, { renderer: 'text' }>, context: ColumnRendererContext) => {
    const value = context.user[column.valueField]

    if (Array.isArray(value)) {
      return value.map((item) => formatValue(String(item), column.formatter)).join(', ')
    }

    if (value == null || value === '') {
      return column.emptyText || '-'
    }

    return formatValue(String(value), column.formatter)
  },
} satisfies SchemaRendererRegistry<
  UserDirectoryColumnConfig['renderer'],
  UserDirectoryColumnConfig,
  ColumnRendererContext
>

export default function UserManagement() {
  const router = useRouter()
  const {
    users,
    filters,
    isLoading,
    setUsers,
    setLoading,
    setFilters,
  } = useUserManagementStore()

  const [uiConfig, setUiConfig] = useState<UserDirectoryUiConfig>(DEFAULT_USER_DIRECTORY_UI_CONFIG)
  const [isUiConfigLoading, setIsUiConfigLoading] = useState(true)
  const [usersFetchError, setUsersFetchError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUiConfig() {
      setIsUiConfigLoading(true)
      try {
        const response = await fetch('/users/api/users/ui-config')
        if (response.ok) {
          const data: UserDirectoryUiConfig = await response.json()
          setUiConfig(data)
        }
      } catch (error) {
        console.error('Failed to fetch user directory UI config', error)
      } finally {
        setIsUiConfigLoading(false)
      }
    }

    fetchUiConfig()
  }, [])

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true)
      setUsersFetchError(null)
      try {
        const queryParams = new URLSearchParams({
          search: filters.search,
          status: filters.status,
          role: filters.role,
          page: filters.page.toString(),
          pageSize: filters.pageSize.toString(),
        })

        const response = await fetch(`/users/api/users?${queryParams}`)
        if (response.ok) {
          const data = await response.json()
          setUsers(data)
          return
        }

        const errorResponse = await response.json().catch(() => null)
        const errorMessage =
          typeof errorResponse?.error === 'string'
            ? errorResponse.error
            : `Failed to load users (${response.status})`
        setUsers({ users: [], total: 0, totalPages: 0 })
        setUsersFetchError(errorMessage)
      } catch (error) {
        setUsers({ users: [], total: 0, totalPages: 0 })
        setUsersFetchError('Failed to load users')
        console.error('Failed to fetch users', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [filters, setLoading, setUsers])

  const columns = uiConfig.table.columns
  const rowActions = uiConfig.table.rowActions
  const actionColumnEnabled = rowActions.length > 0
  const colSpan = columns.length + (actionColumnEnabled ? 1 : 0)

  const setFilterValue = (key: keyof UserFilters, value: string) => {
    setFilters({ [key]: value, page: 1 } as Partial<UserFilters>)
  }

  const executeAction = (action: UserDirectoryPrimaryAction | UserDirectoryRowActionConfig, user?: User) => {
    if (action.action.kind === 'navigate') {
      const href = user
        ? buildHrefFromTemplate(action.action.hrefTemplate, user)
        : action.action.hrefTemplate || '#'
      router.push(href)
    }
  }

  const TitleIcon = ICON_REGISTRY[uiConfig.titleIcon]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center">
            <TitleIcon className="h-8 w-8 mr-3 text-primary" />
            {uiConfig.title}
          </h1>
          <p className="text-slate-500 mt-2">{uiConfig.description}</p>
        </div>
        <SchemaActionButton
          action={uiConfig.primaryAction}
          iconRegistry={ICON_REGISTRY}
          toneClasses={ACTION_TONE_CLASSES}
          className="flex items-center px-5 py-2.5 bg-[#1e90ff] text-white font-medium rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-sm active:scale-[0.98]"
          onClick={() => executeAction(uiConfig.primaryAction)}
        />
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <CardTitle className="text-lg font-medium text-slate-700">User Directory</CardTitle>

            <div className="flex flex-wrap items-center w-full sm:w-auto gap-2">
              <SchemaFilters
                filters={uiConfig.filters}
                registry={FILTER_RENDERERS}
                context={{ filters, setFilterValue }}
              />
            </div>
          </div>
          {usersFetchError && (
            <p className="mt-3 text-sm text-red-600">{usersFetchError}</p>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 uppercase">
                <tr>
                  {columns.map((column) => (
                    <th key={column.key} className="px-6 py-3 font-medium">
                      {column.header}
                    </th>
                  ))}
                  {actionColumnEnabled ? <th className="px-6 py-3 font-medium text-right">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {isLoading || isUiConfigLoading ? (
                  <tr>
                    <td colSpan={colSpan} className="px-6 py-8 text-center text-slate-500">
                      <div className="flex items-center justify-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2"></div>
                        Loading user directory...
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={colSpan} className="px-6 py-8 text-center text-slate-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="bg-white border-b border-slate-100 hover:bg-slate-50/50">
                      {columns.map((column) => (
                        <td key={column.key} className="px-6 py-4 text-slate-600">
                          {renderSchemaNode(column, COLUMN_RENDERERS, { user })}
                        </td>
                      ))}
                      {actionColumnEnabled ? (
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <SchemaRowActions
                              actions={rowActions}
                              item={user}
                              iconRegistry={ICON_REGISTRY}
                              toneClasses={ACTION_TONE_CLASSES}
                              onActionClick={(action, currentUser) => executeAction(action, currentUser)}
                            />
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50/50">
            <span className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-900">{users.length}</span> results
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={filters.page === 1}
                onClick={() => setFilters({ page: filters.page - 1 })}
                className="inline-flex items-center px-3 py-1.5 border border-slate-200 text-slate-600 font-medium rounded-lg text-sm disabled:opacity-50 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </button>
              <div className="flex items-center px-3 py-1.5 border border-slate-200 bg-white font-semibold text-slate-700 rounded-lg text-sm shadow-sm">
                {filters.page}
              </div>
              <button
                onClick={() => setFilters({ page: filters.page + 1 })}
                className="inline-flex items-center px-3 py-1.5 border border-slate-200 text-slate-600 font-medium rounded-lg text-sm hover:bg-slate-50 transition-colors shadow-sm"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
