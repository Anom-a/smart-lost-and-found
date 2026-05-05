import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

export function MainLayout() {
  return (
    <div className="min-h-screen bg-[#faf8ff]">
      <div className="mx-auto grid min-h-screen w-full max-w-[1280px] lg:grid-cols-[292px_1fr]">
        <Sidebar />
        <div className="min-w-0 border-l border-[#e2e1ed]">
          <header className="sticky top-0 z-20 border-b border-[#e2e1ed] bg-[#faf8ff]/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
            <Navbar />
          </header>
          <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
