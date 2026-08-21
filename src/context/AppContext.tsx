import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../services/supabaseClient'
import * as dataStore from '../services/dataStore'
import { login as loginRequest, logout as logoutRequest, signup as signupRequest, type AuthResult } from '../services/authService'
import { completeOnboarding as completeOnboardingRequest, updateProfile as updateProfileRequest } from '../services/profileService'
import { expressInterest } from '../services/opportunityService'
import {
  listNotifications,
  markAllNotificationsRead as markAllNotificationsReadRequest,
  markNotificationRead as markNotificationReadRequest,
} from '../services/notificationService'
import type { AppNotification, OnboardingData, Opportunity, Student } from '../types'

export type Theme = 'light' | 'dark'
const THEME_STORAGE_KEY = 'mason-nexus-theme'

function getStoredTheme(): Theme {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

const BLANK_STUDENT: Student = {
  id: '',
  name: '',
  displayName: '',
  pseudonymous: false,
  major: '',
  year: 'Sophomore',
  courses: [],
  interests: [],
  skills: [],
  lookingFor: [],
  bio: '',
  avatarColor: 'mason-green-500',
  communities: [],
  availableFor: [],
  portfolio: [],
  role: 'Student',
  verified: false,
  discoverable: true,
}

interface AppContextValue {
  authStatus: 'signed_out' | 'signed_in'
  sessionLoading: boolean
  onboarded: boolean
  currentUser: Student
  notifications: AppNotification[]
  unreadCount: number
  login: (email: string, password: string) => Promise<AuthResult>
  signup: (name: string, email: string, password: string) => Promise<AuthResult>
  signOut: () => void
  completeOnboarding: (data: OnboardingData) => Promise<void>
  updateProfile: (partial: Partial<Student>) => Promise<void>
  joinCommunity: (communityId: string) => Promise<void>
  leaveCommunity: (communityId: string) => Promise<void>
  recordOpportunityInterest: (opportunityId: string) => Promise<Opportunity | undefined>
  markNotificationRead: (id: string) => Promise<void>
  markAllNotificationsRead: () => Promise<void>
  pollVoteCounts: Record<string, number>
  myPollVote: string | null
  voteInPoll: (optionId: string) => Promise<void>
  refreshData: () => Promise<void>
  theme: Theme
  setTheme: (theme: Theme) => void
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [authStatus, setAuthStatus] = useState<'signed_out' | 'signed_in'>('signed_out')
  const [sessionLoading, setSessionLoading] = useState(true)
  const [onboarded, setOnboarded] = useState(false)
  const [currentUser, setCurrentUser] = useState<Student>(BLANK_STUDENT)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [pollVoteCounts, setPollVoteCounts] = useState<Record<string, number>>({})
  const [myPollVote, setMyPollVote] = useState<string | null>(null)
  const [theme, setThemeState] = useState<Theme>(getStoredTheme)

  // Applies to <html> so every existing bg-white/text-gray-*/bg-mason-* class
  // resolves through the dark-mode token overrides in index.css — no
  // per-component dark: classes needed. Works on public and protected pages
  // alike since this runs regardless of auth state, and persists via
  // localStorage rather than Supabase (no server round trip, no schema
  // change, survives sign-out).
  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Storage unavailable (private browsing, quota) — theme still applies
      // for this session, just won't persist across a reload.
    }
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    // Only runs once on mount to sync with the inline anti-flash script in
    // index.html; setTheme() handles every subsequent change itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Loads every table the current session is allowed to see (Row Level
  // Security decides that, not this function) into dataStore's in-memory
  // cache, then mirrors the pieces this context exposes reactively. This is
  // the single entry point every "I just signed in" path goes through.
  const load = useCallback(async (userId: string) => {
    await dataStore.loadAll(userId)
    const student = dataStore.getStudentById(userId)
    if (student) setCurrentUser(student)
    setPollVoteCounts(dataStore.getPollVoteCounts())
    setMyPollVote(dataStore.getMyPollVote())
    setNotifications(await listNotifications())
  }, [])

  const refreshCurrentUser = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    await dataStore.refreshOneProfile(user.id)
    const student = dataStore.getStudentById(user.id)
    if (student) setCurrentUser(student)
  }, [])

  const refreshNotifications = useCallback(async () => {
    setNotifications(await listNotifications())
  }, [])

  // Session restoration (page refresh) and sign-out are driven by Supabase's
  // own auth event stream. Sign-IN is deliberately NOT handled here (see
  // login()/signup() below) — routing those through this async listener
  // instead would race against the caller's immediate navigate() call.
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') {
        if (session) {
          ;(async () => {
            // A failed initial load must never leave the app stuck on the
            // SessionGate spinner forever — fall back to signed-out (the
            // user can retry via a normal login) rather than hanging.
            try {
              const { data: profileRow } = await supabase.from('profiles').select('onboarded').eq('id', session.user.id).single()
              await load(session.user.id)
              setOnboarded(profileRow?.onboarded ?? false)
              setAuthStatus('signed_in')
            } catch (err) {
              console.error('Failed to load session data:', err)
              setAuthStatus('signed_out')
            } finally {
              setSessionLoading(false)
            }
          })()
        } else {
          setAuthStatus('signed_out')
          setSessionLoading(false)
        }
      } else if (event === 'SIGNED_OUT') {
        dataStore.reset()
        setCurrentUser(BLANK_STUDENT)
        setNotifications([])
        setPollVoteCounts({})
        setMyPollVote(null)
        setOnboarded(false)
        setAuthStatus('signed_out')
      }
    })
    return () => subscription.unsubscribe()
  }, [load])

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const result = await loginRequest(email, password)
      if (!result.success) return result
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        try {
          const { data: profileRow } = await supabase.from('profiles').select('onboarded').eq('id', user.id).single()
          await load(user.id)
          setOnboarded(profileRow?.onboarded ?? false)
          setAuthStatus('signed_in')
        } catch (err) {
          console.error('Failed to load account data after login:', err)
          return { success: false, message: 'Signed in, but could not load your data. Please try again.' }
        }
      }
      return result
    },
    [load],
  )

  const signup = useCallback(
    async (name: string, email: string, password: string): Promise<AuthResult> => {
      const result = await signupRequest(name, email, password)
      if (!result.success) return result
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        try {
          await load(user.id)
          setOnboarded(false)
          setAuthStatus('signed_in')
        } catch (err) {
          console.error('Failed to load account data after signup:', err)
          return { success: false, message: 'Account created, but could not load your data. Please try logging in.' }
        }
      }
      return result
    },
    [load],
  )

  const signOut = useCallback(() => {
    logoutRequest()
  }, [])

  const completeOnboarding = useCallback(
    async (data: OnboardingData) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      await completeOnboardingRequest(user.id, data)
      await refreshCurrentUser()
      setOnboarded(true)
    },
    [refreshCurrentUser],
  )

  const updateProfile = useCallback(
    async (partial: Partial<Student>) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      await updateProfileRequest(user.id, partial)
      await refreshCurrentUser()
    },
    [refreshCurrentUser],
  )

  // Idempotency (join twice, rapid double-join, join -> leave -> join) is now
  // guaranteed by the database (join_community/leave_community in
  // supabase/schema.sql use a composite primary key + ON CONFLICT DO
  // NOTHING), not by a client-side ref — see that file for why this is
  // actually a stronger guarantee than the old StrictMode-safe ref pattern,
  // which only protected a single browser tab.
  const joinCommunity = useCallback(
    async (communityId: string) => {
      const { error } = await supabase.rpc('join_community', { p_community_id: communityId })
      if (error) throw error
      await dataStore.refreshCommunities()
      await refreshCurrentUser()
      await refreshNotifications()
    },
    [refreshCurrentUser, refreshNotifications],
  )

  const leaveCommunity = useCallback(
    async (communityId: string) => {
      const { error } = await supabase.rpc('leave_community', { p_community_id: communityId })
      if (error) throw error
      await dataStore.refreshCommunities()
      await refreshCurrentUser()
    },
    [refreshCurrentUser],
  )

  const recordOpportunityInterest = useCallback(
    async (opportunityId: string) => {
      const result = await expressInterest(opportunityId, currentUser.id)
      await refreshNotifications()
      return result
    },
    [currentUser.id, refreshNotifications],
  )

  const markNotificationRead = useCallback(async (id: string) => {
    await markNotificationReadRequest(id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const markAllNotificationsRead = useCallback(async () => {
    await markAllNotificationsReadRequest()
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  // Vote-or-change-vote is a single atomic UPSERT at the database level
  // (vote_in_poll's ON CONFLICT ... DO UPDATE in schema.sql) — totals are
  // always recomputed from the real vote rows afterward, so there's no
  // client-side counter to desynchronize under rapid/duplicate clicks.
  const voteInPoll = useCallback(async (optionId: string) => {
    const poll = dataStore.getPoll()
    if (!poll) return
    const { error } = await supabase.rpc('vote_in_poll', { p_poll_id: poll.id, p_option_id: optionId })
    if (error) throw error
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) await dataStore.refreshPollVotes(user.id)
    setPollVoteCounts(dataStore.getPollVoteCounts())
    setMyPollVote(dataStore.getMyPollVote())
  }, [])

  const refreshData = useCallback(async () => {
    if (currentUser.id) await load(currentUser.id)
  }, [currentUser.id, load])

  const unreadCount = notifications.filter((n) => !n.read).length

  const value: AppContextValue = {
    authStatus,
    sessionLoading,
    onboarded,
    currentUser,
    notifications,
    unreadCount,
    login,
    signup,
    signOut,
    completeOnboarding,
    updateProfile,
    joinCommunity,
    leaveCommunity,
    recordOpportunityInterest,
    markNotificationRead,
    markAllNotificationsRead,
    pollVoteCounts,
    myPollVote,
    voteInPoll,
    refreshData,
    theme,
    setTheme,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
