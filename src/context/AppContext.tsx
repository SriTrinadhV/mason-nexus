import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { getCurrentUser, students } from '../data/students'
import { communities } from '../data/communities'
import { initialNotifications } from '../data/notifications'
import type { AppNotification, OnboardingData, Student } from '../types'

interface AppContextValue {
  authStatus: 'signed_out' | 'signed_in'
  onboarded: boolean
  currentUser: Student
  notifications: AppNotification[]
  unreadCount: number
  signIn: () => void
  signOut: () => void
  completeOnboarding: (data: OnboardingData) => void
  updateProfile: (partial: Partial<Student>) => void
  joinCommunity: (communityId: string) => void
  leaveCommunity: (communityId: string) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [authStatus, setAuthStatus] = useState<'signed_out' | 'signed_in'>('signed_out')
  const [onboarded, setOnboarded] = useState(false)
  const [currentUser, setCurrentUser] = useState<Student>(() => getCurrentUser())
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications)

  const signIn = useCallback(() => setAuthStatus('signed_in'), [])
  const signOut = useCallback(() => {
    setAuthStatus('signed_out')
    setOnboarded(false)
  }, [])

  const completeOnboarding = useCallback((data: OnboardingData) => {
    setCurrentUser((prev) => ({
      ...prev,
      major: data.major,
      year: data.year,
      courses: data.courses,
      interests: data.interests,
      skills: data.skills,
      lookingFor: data.lookingFor,
    }))
    setOnboarded(true)
  }, [])

  const updateProfile = useCallback((partial: Partial<Student>) => {
    setCurrentUser((prev) => ({ ...prev, ...partial }))
  }, [])

  const joinCommunity = useCallback((communityId: string) => {
    setCurrentUser((prev) => {
      if (prev.communities.includes(communityId)) return prev
      const community = communities.find((c) => c.id === communityId)
      if (community) community.memberCount += 1
      return { ...prev, communities: [...prev.communities, communityId] }
    })
  }, [])

  const leaveCommunity = useCallback((communityId: string) => {
    setCurrentUser((prev) => {
      if (!prev.communities.includes(communityId)) return prev
      const community = communities.find((c) => c.id === communityId)
      if (community) community.memberCount = Math.max(0, community.memberCount - 1)
      return { ...prev, communities: prev.communities.filter((c) => c !== communityId) }
    })
  }, [])

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  // Keep the shared mock students array in sync with edits made to "me" so
  // other prototype screens (people discovery, community member lists) stay consistent.
  useMemo(() => {
    const idx = students.findIndex((s) => s.id === currentUser.id)
    if (idx >= 0) students[idx] = currentUser
  }, [currentUser])

  const unreadCount = notifications.filter((n) => !n.read).length

  const value: AppContextValue = {
    authStatus,
    onboarded,
    currentUser,
    notifications,
    unreadCount,
    signIn,
    signOut,
    completeOnboarding,
    updateProfile,
    joinCommunity,
    leaveCommunity,
    markNotificationRead,
    markAllNotificationsRead,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
