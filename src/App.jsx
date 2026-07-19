import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useUserAuth } from './context/UserAuthContext'
import AppLayout from './layouts/AppLayout'
import AdminLayout from './layouts/AdminLayout'

const Home = lazy(() => import('./pages/Home'))
const Members = lazy(() => import('./pages/Members'))
const JoinGuild = lazy(() => import('./pages/JoinGuild'))
const Tournaments = lazy(() => import('./pages/Tournaments'))
const Statistics = lazy(() => import('./pages/Statistics'))
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const UserLogin = lazy(() => import('./pages/UserLogin'))
const Profile = lazy(() => import('./pages/Profile'))
const SeedMastery = lazy(() => import('./pages/SeedMastery'))


function ProtectedAdmin({ children }) {
  const { adminAuthenticated, loading } = useAuth()
  if (loading) return null
  return adminAuthenticated ? children : <Navigate to="/admin/login" replace />
}

function ProtectedUser({ children }) {
  const { userAuthenticated, loading } = useUserAuth()
  if (loading) return null
  return userAuthenticated ? children : <Navigate to="/login" replace />
}

function LoadingScreen() {
  return (
    <div style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#e74c3c', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/login" element={<UserLogin />} />

        {/* Public/User routes */}
        <Route element={<ProtectedUser><AppLayout /></ProtectedUser>}>
          <Route index element={<Home />} />
          <Route path="members" element={<Members />} />
          <Route path="join" element={<JoinGuild />} />
          <Route path="tournaments" element={<Tournaments />} />
          <Route path="stats" element={<Statistics />} />
          <Route path="profile" element={<Profile />} />
          <Route path="seed" element={<SeedMastery />} />
        </Route>



        {/* Admin routes */}
        <Route element={<AdminLayout />}>
          <Route path="admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="admin/login" element={<AdminLogin />} />
          <Route path="admin/dashboard" element={
            <ProtectedAdmin><AdminDashboard /></ProtectedAdmin>
          } />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
