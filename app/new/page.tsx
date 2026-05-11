'use client'

import Link from 'next/link'
import { ArrowLeft, Save, UserPlus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CreateUserPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center">
            <UserPlus className="h-8 w-8 mr-3 text-primary" />
            Add New User
          </h1>
          <p className="text-slate-500 mt-2">
            Create a system user and assign their initial access role.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-lg font-medium text-slate-700">User Details</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Username
              </label>
              <input
                type="text"
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
                  type="text"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-[#1e90ff] focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 bg-slate-50 focus:bg-white"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
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
                  type="email"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-[#1e90ff] focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 bg-slate-50 focus:bg-white"
                  placeholder="john.doe@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Phone Number
                </label>
                <input
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
                <select className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-[#1e90ff] focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all bg-slate-50 focus:bg-white cursor-pointer">
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
                  type="text"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-[#1e90ff] focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 bg-slate-50 focus:bg-white"
                  placeholder="Excise Department"
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
                className="inline-flex justify-center items-center px-5 py-2.5 text-sm font-semibold text-white bg-[#1e90ff] rounded-xl hover:bg-blue-600 transition-all shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/30 active:scale-[0.98]"
              >
                <Save className="h-4 w-4 mr-2" />
                Create User
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
