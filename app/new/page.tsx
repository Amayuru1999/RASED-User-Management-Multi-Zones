'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, UserPlus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type CreateUserResponse = {
  user: {
    id: string
  }
  nationalIdUpload: {
    uploadUrl: string
    ref: string
    expiresInSeconds: number
  }
  error?: string
}

export default function CreateUserPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const nationalIdFile = formData.get('nationalIdFile')

    if (!(nationalIdFile instanceof File) || nationalIdFile.size === 0) {
      setError('Please select the National ID card PDF.')
      setSubmitting(false)
      return
    }

    if (nationalIdFile.type && nationalIdFile.type !== 'application/pdf') {
      setError('National ID card must be a PDF.')
      setSubmitting(false)
      return
    }

    try {
      const createResponse = await fetch('/users/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: String(formData.get('username') || ''),
          firstName: String(formData.get('firstName') || ''),
          lastName: String(formData.get('lastName') || ''),
          email: String(formData.get('email') || ''),
          phone: String(formData.get('phone') || ''),
          role: String(formData.get('role') || ''),
          department: String(formData.get('department') || ''),
          nic: String(formData.get('nic') || ''),
          nationalIdFileName: nationalIdFile.name,
        }),
      })
      const createPayload = (await createResponse.json()) as CreateUserResponse

      if (!createResponse.ok) {
        throw new Error(createPayload.error || 'Failed to create user.')
      }

      const uploadResponse = await fetch(createPayload.nationalIdUpload.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/pdf',
        },
        body: nationalIdFile,
      })

      if (!uploadResponse.ok) {
        throw new Error('User was created, but the National ID PDF upload failed. Retry before the link expires.')
      }

      await fetch(`/users/api/users/${createPayload.user.id}/national-id-document/complete`, {
        method: 'POST',
      })

      router.push('/')
      router.refresh()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to create user.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center">
            <UserPlus className="h-7 w-7 sm:h-8 sm:w-8 mr-3 text-primary flex-shrink-0" />
            Add New User
          </h1>
          <p className="text-slate-500 mt-2">
            Create a system user and assign their initial access role.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex w-full sm:w-auto items-center justify-center px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-lg font-medium text-slate-700">User Details</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            ) : null}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Username
              </label>
              <input
                name="username"
                type="text"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-[#1e90ff] focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 bg-slate-50 focus:bg-white"
                placeholder="e.g. jdoe"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  First Name
                </label>
                <input
                  name="firstName"
                  type="text"
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-[#1e90ff] focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 bg-slate-50 focus:bg-white"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Last Name
                </label>
                <input
                  name="lastName"
                  type="text"
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-[#1e90ff] focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 bg-slate-50 focus:bg-white"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-[#1e90ff] focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 bg-slate-50 focus:bg-white"
                  placeholder="john.doe@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Phone Number
                </label>
                <input
                  name="phone"
                  type="tel"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-[#1e90ff] focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 bg-slate-50 focus:bg-white"
                  placeholder="+94 77 123 4567"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Role Designation
                </label>
                <select
                  name="role"
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-[#1e90ff] focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all bg-slate-50 focus:bg-white cursor-pointer"
                >
                  <option value="">Select a role...</option>
                  <option value="EXCISE_OFFICER">Excise Officer</option>
                  <option value="AUDITOR">Auditor</option>
                  <option value="DATA_ENTRY_OPERATOR">Data Entry Operator</option>
                  <option value="SUPER_ADMIN">Super Administrator</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Department
                </label>
                <input
                  name="department"
                  type="text"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-[#1e90ff] focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 bg-slate-50 focus:bg-white"
                  placeholder="Excise Department"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  NIC Number
                </label>
                <input
                  name="nic"
                  type="text"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-[#1e90ff] focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 bg-slate-50 focus:bg-white"
                  placeholder="199012345678"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  National ID Card PDF
                </label>
                <input
                  name="nationalIdFile"
                  type="file"
                  accept="application/pdf,.pdf"
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 focus:border-[#1e90ff] focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3">
              <Link
                href="/"
                className="inline-flex justify-center px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex justify-center items-center px-5 py-2.5 text-sm font-semibold text-white bg-[#1e90ff] rounded-xl hover:bg-blue-600 transition-all shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4 mr-2" />
                {submitting ? 'Creating User...' : 'Create User'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
