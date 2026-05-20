import { Route, Routes } from 'react-router-dom'
import { ClaimsPage } from './pages/ClaimsPage'
import { DashboardPage } from './pages/DashboardPage'
import { FoundItemDetailPage } from './pages/FoundItemDetailPage'
import { FoundItemsPage } from './pages/FoundItemsPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { LostItemDetailPage } from './pages/LostItemDetailPage'
import { LostItemsPage } from './pages/LostItemsPage'
import { MatchesPage } from './pages/MatchesPage'
import { NewFoundItemPage } from './pages/NewFoundItemPage'
import { NewLostItemPage } from './pages/NewLostItemPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { MainLayout } from './components/MainLayout'
import { RegisterPage } from './pages/RegisterPage'
import { MyItemsPage } from './pages/MyItemsPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
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
          <Route path="/my-items" element={<MyItemsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
