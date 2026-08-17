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

function RequireOnboardedUser({ children }: { children: React.ReactNode }) {
  const { authStatus, onboarded } = useApp()
  if (authStatus !== 'signed_in') return <Navigate to="/login" replace />
  if (!onboarded) return <Navigate to="/onboarding" replace />
  return <>{children}</>
}

function RequireSignedIn({ children }: { children: React.ReactNode }) {
  const { authStatus } = useApp()
  if (authStatus !== 'signed_in') return <Navigate to="/login" replace />
  return <>{children}</>
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
