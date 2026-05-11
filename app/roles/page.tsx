'use client'

import { ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function RolesManagement() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center">
          <ShieldAlert className="h-8 w-8 mr-3 text-[#c8902a]" />
          Roles & Permissions
        </h1>
        <p className="text-slate-500 mt-2">
          Manage system roles and their associated access permissions across all excise modules.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="md:col-span-1 space-y-4">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-lg font-medium text-slate-700">System Roles</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {['SUPER_ADMIN', 'EXCISE_OFFICER', 'AUDITOR', 'DATA_ENTRY_OPERATOR'].map((role, i) => (
                  <button 
                    key={role}
                    className={`w-full text-left px-6 py-4 transition-colors hover:bg-slate-50 ${i === 0 ? 'bg-blue-50/50 border-l-4 border-[#1e90ff]' : 'border-l-4 border-transparent'}`}
                  >
                    <div className="font-semibold text-slate-900">{role.replace('_', ' ')}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {i === 0 ? 'Full system access' : 'Restricted module access'}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Permissions Detail */}
        <div className="md:col-span-2">
          <Card className="shadow-sm border-slate-200 h-full">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium text-slate-700">SUPER ADMIN Permissions</CardTitle>
              <button className="px-4 py-2 bg-[#1e90ff] text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
                Edit Permissions
              </button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 border-b border-slate-100 pb-2">User Management Zone</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <input type="checkbox" defaultChecked className="h-4 w-4 rounded text-[#1e90ff] focus:ring-[#1e90ff]" />
                      <span className="text-sm font-medium text-slate-700">View Users</span>
                    </label>
                    <label className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <input type="checkbox" defaultChecked className="h-4 w-4 rounded text-[#1e90ff] focus:ring-[#1e90ff]" />
                      <span className="text-sm font-medium text-slate-700">Create Users</span>
                    </label>
                    <label className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <input type="checkbox" defaultChecked className="h-4 w-4 rounded text-[#1e90ff] focus:ring-[#1e90ff]" />
                      <span className="text-sm font-medium text-slate-700">Manage Roles</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 border-b border-slate-100 pb-2">License Management Zone</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <input type="checkbox" defaultChecked className="h-4 w-4 rounded text-[#1e90ff] focus:ring-[#1e90ff]" />
                      <span className="text-sm font-medium text-slate-700">View Licenses</span>
                    </label>
                    <label className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <input type="checkbox" defaultChecked className="h-4 w-4 rounded text-[#1e90ff] focus:ring-[#1e90ff]" />
                      <span className="text-sm font-medium text-slate-700">Approve Licenses</span>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
