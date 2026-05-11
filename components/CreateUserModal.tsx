'use client'

import { useUserManagementStore } from '@/store/userManagementStore'
import { X, UserPlus } from 'lucide-react'

export function CreateUserModal() {
  const { createModalOpen, closeCreateModal } = useUserManagementStore()

  if (!createModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <UserPlus className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Add New User</h2>
          </div>
          <button
            onClick={closeCreateModal}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <form className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username</label>
              <input 
                type="text" 
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-[#1e90ff] focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 bg-slate-50 focus:bg-white" 
                placeholder="e.g. jdoe"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">First Name</label>
                <input 
                  type="text" 
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-[#1e90ff] focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 bg-slate-50 focus:bg-white" 
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Last Name</label>
                <input 
                  type="text" 
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-[#1e90ff] focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 bg-slate-50 focus:bg-white" 
                  placeholder="Doe"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input 
                type="email" 
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-[#1e90ff] focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 bg-slate-50 focus:bg-white" 
                placeholder="john.doe@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Role Designation</label>
              <select className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-[#1e90ff] focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all bg-slate-50 focus:bg-white appearance-none cursor-pointer">
                <option value="">Select a role...</option>
                <option value="EXCISE_OFFICER">Excise Officer</option>
                <option value="AUDITOR">Auditor</option>
                <option value="DATA_ENTRY_OPERATOR">Data Entry Operator</option>
                <option value="SUPER_ADMIN">Super Administrator</option>
              </select>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={closeCreateModal}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={closeCreateModal}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-[#1e90ff] rounded-xl hover:bg-blue-600 transition-all shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/30 active:scale-[0.98] flex items-center"
          >
            Create User
          </button>
        </div>
      </div>
    </div>
  )
}
