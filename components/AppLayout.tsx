'use client'

import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-slate-900 border-x-4 border-slate-100 max-w-[1920px] mx-auto">
      <Header />
      
      {/* Decorative double line below header as seen in wireframe */}
      <div className="w-full px-8 pb-4">
        <div className="w-full h-px bg-slate-800" />
        <div className="w-full h-[2px]" />
        <div className="w-full h-px bg-slate-800" />
      </div>

      <div className="flex flex-1 overflow-hidden px-2 pb-6 max-w-[1600px] mx-auto w-full">
        <Sidebar />
        
        <main className="flex-1 px-4 py-2 flex flex-col">
          {/* Light blue main container with rounded corners and border matching wireframe */}
          <div className="flex-1 bg-[#e6effb] border border-blue-200 rounded-[2rem] shadow-sm overflow-hidden flex flex-col relative">
            <div className="absolute inset-0 overflow-y-auto p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
