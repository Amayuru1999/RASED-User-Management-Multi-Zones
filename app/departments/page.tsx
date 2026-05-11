'use client'

import { Building, Plus, MoreVertical } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DepartmentsManagement() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center">
            <Building className="h-8 w-8 mr-3 text-primary" />
            Departments & Stations
          </h1>
          <p className="text-slate-500 mt-2">
            Configure hierarchical organization structure and geographical excise stations.
          </p>
        </div>
        <button className="flex items-center px-5 py-2.5 bg-[#1e90ff] text-white font-medium rounded-xl hover:bg-blue-600 transition-all shadow-sm active:scale-[0.98]">
          <Plus className="h-5 w-5 mr-2" />
          Add Department
        </button>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-lg font-medium text-slate-700">Organization Structure</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 uppercase">
                <tr>
                  <th className="px-6 py-4 font-medium">Department Name</th>
                  <th className="px-6 py-4 font-medium">Head of Department</th>
                  <th className="px-6 py-4 font-medium">Staff Count</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: 'Headquarters - Licensing', head: 'Mr. Nimal Perera', count: 45 },
                  { name: 'Headquarters - Enforcement', head: 'Mrs. Samanthi Silva', count: 120 },
                  { name: 'Western Province - Colombo', head: 'Mr. Kasun Fernando', count: 85 },
                  { name: 'Central Province - Kandy', head: 'Mr. Chamara Bandara', count: 40 },
                ].map((dept, i) => (
                  <tr key={i} className="bg-white hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{dept.name}</div>
                      <div className="text-xs text-slate-500 mt-1">ID: DEPT-0{i+1}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{dept.head}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 font-semibold rounded-lg border border-blue-100 text-xs">
                        {dept.count} Users
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
