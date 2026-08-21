import { supabase } from './supabaseClient'
import type { Community, Opportunity, Poll, Post, Student, StudyGroup } from '../types'

/**
 * PHASE 13 DATA LAYER
 * -------------------
 * All domain data now lives in Postgres (see supabase/schema.sql) instead of
 * the old src/data/*.ts mock arrays. The pure, synchronous business logic in
 * peopleService/recommendationService/searchService/nexusNowService/
 * opportunityService was deliberately NOT rewritten to be async everywhere —
 * that logic is correct and well-tested, and the only thing that changed is
 * where its input data comes from. This module is that new source: it fetches
 * everything the current session is allowed to see (Row Level Security
 * enforces that at the database layer — a non-discoverable profile simply
 * never arrives here) into an in-memory cache, and the same pure functions
 * that used to close over a static import now close over this cache's
 * accessors instead.
 *
 * The cache is rebuilt from Supabase on login and after any mutation that
 * could affect it, so "does it survive a refresh" is answered by Supabase's
 * persistence, not by anything in this file — a hard refresh just re-runs
 * loadAll() against the same database rows.
 */

let profiles: Student[] = []
let communities: Community[] = []
let posts: Post[] = []
let studyGroups: StudyGroup[] = []
let studyGroupSeekers: { studentId: string; courseCode: string }[] = []
let opportunities: Opportunity[] = []
let poll: Poll | null = null
let pollVoteCounts: Record<string, number> = {}
let myPollVote: string | null = null

export function getProfiles(): Student[] {
  return profiles
}
export function getCommunities(): Community[] {
  return communities
}
export function getPosts(): Post[] {
  return posts
}
export function getStudyGroups(): StudyGroup[] {
  return studyGroups
}
export function getStudyGroupSeekers(): { studentId: string; courseCode: string }[] {
  return studyGroupSeekers
}
export function getOpportunities(): Opportunity[] {
  return opportunities
}
export function getPoll(): Poll | null {
  return poll
}
export function getPollVoteCounts(): Record<string, number> {
  return pollVoteCounts
}
export function getMyPollVote(): string | null {
  return myPollVote
}
export function getStudentById(id: string): Student | undefined {
  return profiles.find((p) => p.id === id)
}
export function getCommunityById(id: string): Community | undefined {
  return communities.find((c) => c.id === id)
}
export function getPostById(id: string): Post | undefined {
  return posts.find((p) => p.id === id)
}
export function getOpportunityById(id: string): Opportunity | undefined {
  return opportunities.find((o) => o.id === id)
}
export function getPostsByCommunity(communityId: string): Post[] {
  return posts.filter((p) => p.communityId === communityId)
}
export function getStudyGroupsByCourse(courseCode: string): StudyGroup[] {
  return studyGroups.filter((g) => g.courseCode === courseCode)
}

function mapProfile(row: any, currentUserId: string): Student {
  return {
    id: row.id,
    name: row.real_name,
    displayName: row.display_name,
    pseudonymous: row.pseudonymous,
    major: row.major,
    year: row.year,
    courses: row.courses ?? [],
    interests: row.interests ?? [],
    skills: row.skills ?? [],
    lookingFor: row.looking_for ?? [],
    bio: row.bio,
    avatarColor: row.avatar_color,
    communities: (row.community_members ?? []).map((m: any) => m.community_id),
    availableFor: row.available_for ?? [],
    portfolio: (row.portfolio_items ?? []).map((p: any) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      link: p.link ?? undefined,
      placeholderColor: p.placeholder_color,
    })),
    role: row.role,
    verified: row.verified,
    discoverable: row.id === currentUserId ? row.discoverable : true, // row wouldn't be here at all if false and not self
  }
}

function mapCommunity(row: any): Community {
  const memberCount = row.community_members?.[0]?.count ?? 0
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description,
    memberCount,
    tags: row.tags ?? [],
    recentActivitySummary: row.recent_activity_summary,
    color: row.color,
    courseCode: row.course_code ?? undefined,
    createdBy: row.created_by ?? undefined,
    pendingReview: row.pending_review,
  }
}

function mapPost(row: any, currentUserId: string): Post {
  const likes: { user_id: string }[] = row.post_likes ?? []
  const saves: { user_id: string }[] = row.post_saves ?? []
  return {
    id: row.id,
    communityId: row.community_id,
    authorId: row.author_id,
    title: row.title,
    body: row.body,
    tags: row.tags ?? [],
    createdAt: formatRelative(row.created_at),
    likes: likes.length,
    likedByMe: likes.some((l) => l.user_id === currentUserId),
    savedByMe: saves.some((s) => s.user_id === currentUserId),
    comments: (row.comments ?? [])
      .slice()
      .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((c: any) => ({
        id: c.id,
        authorId: c.author_id,
        body: c.body,
        createdAt: formatRelative(c.created_at),
        likes: 0,
      })),
  }
}

function mapStudyGroup(row: any): StudyGroup {
  return {
    id: row.id,
    courseCode: row.course_code,
    title: row.title,
    memberIds: (row.study_group_members ?? []).map((m: any) => m.user_id),
    capacity: row.capacity,
    meetingTime: row.meeting_time,
    location: row.location,
    description: row.description,
    createdBy: row.created_by,
  }
}

function mapOpportunity(row: any): Opportunity {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    requiredSkills: row.required_skills ?? [],
    communityContext: row.community_context,
    postedBy: row.posted_by,
    interestedStudentIds: (row.opportunity_interest ?? []).map((i: any) => i.user_id),
    createdAt: formatRelative(row.created_at),
  }
}

// Timestamps are stored as real timestamptz values now (not the old
// hand-authored relative strings) — this reproduces the same "2h ago" style
// display the UI already expects, computed from the real created_at.
export function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.round(diffMs / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}

export async function loadAll(currentUserId: string): Promise<void> {
  const [profilesRes, communitiesRes, postsRes, groupsRes, seekersRes, oppsRes, pollsRes] = await Promise.all([
    supabase.from('profiles').select('*, community_members(community_id), portfolio_items(*)'),
    supabase.from('communities').select('*, community_members(count)'),
    supabase.from('posts').select('*, comments(*), post_likes(user_id), post_saves(user_id)'),
    supabase.from('study_groups').select('*, study_group_members(user_id)'),
    supabase.from('study_group_seekers').select('*'),
    supabase.from('opportunities').select('*, opportunity_interest(user_id)'),
    supabase.from('polls').select('*, poll_options(*)').limit(1).maybeSingle(),
  ])

  if (profilesRes.error) throw profilesRes.error
  if (communitiesRes.error) throw communitiesRes.error
  if (postsRes.error) throw postsRes.error
  if (groupsRes.error) throw groupsRes.error
  if (seekersRes.error) throw seekersRes.error
  if (oppsRes.error) throw oppsRes.error
  if (pollsRes.error) throw pollsRes.error

  profiles = (profilesRes.data ?? []).map((r) => mapProfile(r, currentUserId))
  communities = (communitiesRes.data ?? []).map(mapCommunity)
  posts = (postsRes.data ?? []).map((r) => mapPost(r, currentUserId))
  studyGroups = (groupsRes.data ?? []).map(mapStudyGroup)
  studyGroupSeekers = (seekersRes.data ?? []).map((r: any) => ({ studentId: r.user_id, courseCode: r.course_code }))
  opportunities = (oppsRes.data ?? []).map(mapOpportunity)

  if (pollsRes.data) {
    poll = {
      id: pollsRes.data.id,
      question: pollsRes.data.question,
      options: (pollsRes.data.poll_options ?? []).map((o: any) => ({ id: o.id, label: o.label })),
    }
    await refreshPollVotes(currentUserId)
  } else {
    poll = null
  }
}

export async function refreshPollVotes(currentUserId: string): Promise<void> {
  if (!poll) return
  const { data, error } = await supabase.from('poll_votes').select('option_id, user_id').eq('poll_id', poll.id)
  if (error) throw error
  const counts: Record<string, number> = {}
  for (const opt of poll.options) counts[opt.id] = 0
  let mine: string | null = null
  for (const row of data ?? []) {
    counts[row.option_id] = (counts[row.option_id] ?? 0) + 1
    if (row.user_id === currentUserId) mine = row.option_id
  }
  pollVoteCounts = counts
  myPollVote = mine
}

export async function refreshProfiles(currentUserId: string): Promise<void> {
  const { data, error } = await supabase.from('profiles').select('*, community_members(community_id), portfolio_items(*)')
  if (error) throw error
  profiles = (data ?? []).map((r) => mapProfile(r, currentUserId))
}

// Cheaper than refreshProfiles(): after an action that only changes the
// caller's own row (profile edits, join/leave, poll votes), refetching all
// profiles' embedded joins just to reflect one field is a multi-second
// round trip for no reason. This patches just that one row in place.
export async function refreshOneProfile(userId: string): Promise<void> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, community_members(community_id), portfolio_items(*)')
    .eq('id', userId)
    .single()
  if (error) throw error
  const mapped = mapProfile(data, userId)
  const idx = profiles.findIndex((p) => p.id === userId)
  if (idx >= 0) profiles[idx] = mapped
  else profiles = [...profiles, mapped]
}

export async function refreshCommunities(): Promise<void> {
  const { data, error } = await supabase.from('communities').select('*, community_members(count)')
  if (error) throw error
  communities = (data ?? []).map(mapCommunity)
}

export async function refreshPosts(currentUserId: string): Promise<void> {
  const { data, error } = await supabase.from('posts').select('*, comments(*), post_likes(user_id), post_saves(user_id)')
  if (error) throw error
  posts = (data ?? []).map((r) => mapPost(r, currentUserId))
}

export async function refreshStudyGroups(): Promise<void> {
  const { data, error } = await supabase.from('study_groups').select('*, study_group_members(user_id)')
  if (error) throw error
  studyGroups = (data ?? []).map(mapStudyGroup)
}

export async function refreshOpportunities(): Promise<void> {
  const { data, error } = await supabase.from('opportunities').select('*, opportunity_interest(user_id)')
  if (error) throw error
  opportunities = (data ?? []).map(mapOpportunity)
}

export function reset(): void {
  profiles = []
  communities = []
  posts = []
  studyGroups = []
  studyGroupSeekers = []
  opportunities = []
  poll = null
  pollVoteCounts = {}
  myPollVote = null
}
