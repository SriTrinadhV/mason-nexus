import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { getCurrentUser, students } from '../data/students'
import { communities } from '../data/communities'
import { opportunities } from '../data/opportunities'
import { initialNotifications } from '../data/notifications'
import { initialPollVotes } from '../data/polls'
import { expressInterest } from '../services/opportunityService'
import { generateId } from '../services/id'
import type { AppNotification, OnboardingData, Opportunity, Student } from '../types'

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
  recordOpportunityInterest: (opportunityId: string) => Promise<Opportunity | undefined>
  addNotification: (input: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  pollVoteCounts: Record<string, number>
  myPollVote: string | null
  voteInPoll: (optionId: string) => void
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

  // Session-only notifications: created locally when a supported action
  // happens during the current session, exactly like every other piece of
  // mock state in this app (joined communities, posts, etc). They reset on a
  // full page reload — there is no backend, and nothing here pretends
  // otherwise.
  const addNotification = useCallback((input: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    setNotifications((prev) => [{ ...input, id: generateId('n'), createdAt: 'Just now', read: false }, ...prev])
  }, [])

  // joinCommunity/leaveCommunity previously mutated the shared `communities`
  // mock data (community.memberCount += 1) *inside* the functional updater
  // passed to setCurrentUser. React Strict Mode intentionally invokes state
  // updater functions twice in development to surface exactly this kind of
  // impurity, so the mutation ran twice per click (+2 / -2 instead of +1 / -1)
  // even though the returned state was only applied once. The fix: do the
  // one-time membership check and the memberCount mutation as a plain,
  // ordinary side effect in the callback body (which React never re-invokes),
  // and keep the setCurrentUser updater itself pure — it only computes and
  // returns state, so calling it twice (or any number of times) with the same
  // `prev` is safe and always yields the same result.
  //
  // That guard alone isn't enough against two *genuinely separate* calls
  // (rapid double-click, or two synchronous calls before React re-renders):
  // gating on `currentUser.communities` reads a value that only refreshes
  // after a render, so both calls can see the same stale "not yet a member"
  // state and both mutate memberCount. `memberCommunitiesRef` is a plain ref
  // — it updates synchronously, in the same tick, with no render involved —
  // so it's used as the atomic check-and-claim source for membership instead,
  // making join/leave idempotent no matter how close together they fire.
  const memberCommunitiesRef = useRef(new Set(currentUser.communities))

  const joinCommunity = useCallback(
    (communityId: string) => {
      if (memberCommunitiesRef.current.has(communityId)) return
      memberCommunitiesRef.current.add(communityId)
      const community = communities.find((c) => c.id === communityId)
      if (community) community.memberCount += 1
      setCurrentUser((prev) =>
        prev.communities.includes(communityId) ? prev : { ...prev, communities: [...prev.communities, communityId] },
      )
      if (community) {
        addNotification({
          type: 'community_joined',
          title: `You joined ${community.name}`,
          body: `You joined ${community.name}. Check out recent posts and discussions.`,
          linkTo: `/communities/${community.id}`,
        })
      }
    },
    [addNotification],
  )

  const leaveCommunity = useCallback((communityId: string) => {
    if (!memberCommunitiesRef.current.has(communityId)) return
    memberCommunitiesRef.current.delete(communityId)
    const community = communities.find((c) => c.id === communityId)
    if (community) community.memberCount = Math.max(0, community.memberCount - 1)
    setCurrentUser((prev) =>
      prev.communities.includes(communityId) ? { ...prev, communities: prev.communities.filter((c) => c !== communityId) } : prev,
    )
  }, [])

  const recordOpportunityInterest = useCallback(
    (opportunityId: string) => {
      const opp = opportunities.find((o) => o.id === opportunityId)
      const alreadyInterested = opp?.interestedStudentIds.includes(currentUser.id) ?? false
      return expressInterest(opportunityId, currentUser.id).then((updated) => {
        if (!alreadyInterested && updated) {
          addNotification({
            type: 'interest_recorded',
            title: 'Interest recorded',
            body: `You expressed interest in "${updated.title}". The poster will be able to see you're interested.`,
            linkTo: `/opportunities/${updated.id}`,
          })
        }
        return updated
      })
    },
    [currentUser, addNotification],
  )

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  // Nexus Now's campus poll. Same idempotency pattern as joinCommunity: a
  // ref tracks the user's current vote synchronously so a rapid double-click
  // (or a StrictMode double-invocation) can't double-decrement/increment the
  // tallies — the guard and the "what changed" logic live in the plain
  // callback body, and the state updater stays a pure function of prev.
  const [pollVoteCounts, setPollVoteCounts] = useState<Record<string, number>>(() => ({ ...initialPollVotes }))
  const [myPollVote, setMyPollVote] = useState<string | null>(null)
  const myPollVoteRef = useRef<string | null>(null)

  const voteInPoll = useCallback((optionId: string) => {
    const previous = myPollVoteRef.current
    if (previous === optionId) return
    myPollVoteRef.current = optionId
    setPollVoteCounts((prev) => {
      const next = { ...prev }
      if (previous) next[previous] = Math.max(0, (next[previous] ?? 0) - 1)
      next[optionId] = (next[optionId] ?? 0) + 1
      return next
    })
    setMyPollVote(optionId)
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
    recordOpportunityInterest,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    pollVoteCounts,
    myPollVote,
    voteInPoll,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
