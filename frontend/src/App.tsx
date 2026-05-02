import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ClaimsPage } from './pages/ClaimsPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { FoundItemDetailPage } from './pages/found-items/FoundItemDetailPage'
import { FoundItemsPage } from './pages/found-items/FoundItemsPage'
import { NewFoundItemPage } from './pages/found-items/NewFoundItemPage'
import { LostItemDetailPage } from './pages/lost-items/LostItemDetailPage'
import { LostItemsPage } from './pages/lost-items/LostItemsPage'
import { NewLostItemPage } from './pages/lost-items/NewLostItemPage'
import { MatchesPage } from './pages/MatchesPage'
import { NotificationsPage } from './pages/NotificationsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/lost-items" element={<LostItemsPage />} />
        <Route path="/lost-items/new" element={<NewLostItemPage />} />
        <Route path="/lost-items/:id" element={<LostItemDetailPage />} />
        <Route path="/found-items" element={<FoundItemsPage />} />
        <Route path="/found-items/new" element={<NewFoundItemPage />} />
        <Route path="/found-items/:id" element={<FoundItemDetailPage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/claims" element={<ClaimsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>
    </Routes>
  )
}
