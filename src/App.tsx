import { Navigate, Route, Routes } from 'react-router-dom'
import { useApp } from './context/AppContext'
import AppShell from './components/layout/AppShell'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import OnboardingPage from './pages/OnboardingPage'
import HomePage from './pages/HomePage'
import CommunitiesPage from './pages/CommunitiesPage'
import CommunityDetailPage from './pages/CommunityDetailPage'
import DiscoverPage from './pages/DiscoverPage'
import PeoplePage from './pages/PeoplePage'
import StudyGroupsPage from './pages/StudyGroupsPage'
import OpportunitiesPage from './pages/OpportunitiesPage'
import OpportunityDetailPage from './pages/OpportunityDetailPage'
import SearchPage from './pages/SearchPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import NotificationsPage from './pages/NotificationsPage'

// While the initial session check is in flight (e.g. right after a hard
// refresh, before we know if a persisted Supabase session exists), the
// guards below must not redirect yet — authStatus still reads its default
// 'signed_out' at that point, and redirecting on it would bounce a genuinely
// signed-in user to /login for a flash before snapping back.
function SessionGate({ children }: { children: React.ReactNode }) {
  const { sessionLoading } = useApp()
  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-mason-green-600 border-t-transparent" />
      </div>
    )
  }
  return <>{children}</>
}

function RequireOnboardedUser({ children }: { children: React.ReactNode }) {
  const { authStatus, onboarded } = useApp()
  return (
    <SessionGate>
      {authStatus !== 'signed_in' ? (
        <Navigate to="/login" replace />
      ) : !onboarded ? (
        <Navigate to="/onboarding" replace />
      ) : (
        <>{children}</>
      )}
    </SessionGate>
  )
}

function RequireSignedIn({ children }: { children: React.ReactNode }) {
  const { authStatus } = useApp()
  return <SessionGate>{authStatus !== 'signed_in' ? <Navigate to="/login" replace /> : <>{children}</>}</SessionGate>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/onboarding"
        element={
          <RequireSignedIn>
            <OnboardingPage />
          </RequireSignedIn>
        }
      />

      <Route
        element={
          <RequireOnboardedUser>
            <AppShell />
          </RequireOnboardedUser>
        }
      >
        <Route path="/home" element={<HomePage />} />
        <Route path="/communities" element={<CommunitiesPage />} />
        <Route path="/communities/:id" element={<CommunityDetailPage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/discover/people" element={<PeoplePage />} />
        <Route path="/study-groups" element={<StudyGroupsPage />} />
        <Route path="/opportunities" element={<OpportunitiesPage />} />
        <Route path="/opportunities/:id" element={<OpportunityDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
