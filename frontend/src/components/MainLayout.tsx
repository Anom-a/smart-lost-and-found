import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

export function MainLayout() {
  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Sidebar />
        <div className="space-y-4">
          <header className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <Navbar />
          </header>
          <main className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
