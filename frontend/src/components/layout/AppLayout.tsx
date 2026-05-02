import { Outlet } from 'react-router-dom'
import { Footer } from './Footer'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="workspace">
        <Sidebar />
        <main className="content">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}
