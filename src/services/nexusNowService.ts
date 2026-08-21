import { getCommunities, getCommunityById, getOpportunities, getPosts, getPostsByCommunity, getStudyGroupSeekers } from './dataStore'
import type { Post, Recommendation, Student } from '../types'
import { mockDelay } from './mockDelay'
import { matchPeople, type PeopleMatch } from './peopleService'

/**
 * NEXUS NOW — the campus pulse layer.
 *
 * Every function here is deterministic and derived entirely from the same
 * live data the rest of the app now reads from Supabase (post likes/
 * comments, community post volume, opportunity interest counts, study-group
 * seekers) — there is still no real analytics pipeline or trending
 * algorithm, just a prototype-honest ranking over real persisted activity,
 * consistent with the "SIMULATED AI LAYER" documented in
 * recommendationService.ts. Only the data source changed in Phase 13; the
 * ranking logic itself is untouched.
 *
 * Nothing here duplicates matching/discoverability logic: "Your Next
 * Connection" calls straight into peopleService's matchPeople(), which
 * already enforces self-exclusion and reads from a profile cache that Row
 * Level Security has already filtered for discoverability.
 */

function postEngagementScore(post: Post): number {
  return post.likes + post.comments.length * 3
}

/**
 * TRENDING AT MASON — the highest-engagement discussion, the community with
 * the most active posts right now, and the opportunity attracting the most
 * interest. Ranked by real engagement, not curated.
 */
export function getTrendingAtMason(limit = 3): Recommendation[] {
  const scored: (Recommendation & { score: number })[] = []
  const posts = getPosts()
  const communities = getCommunities()
  const opportunities = getOpportunities()

  const topPost = [...posts].sort((a, b) => postEngagementScore(b) - postEngagementScore(a))[0]
  if (topPost) {
    const community = getCommunityById(topPost.communityId)
    if (community) {
      scored.push({
        id: `trend-post-${topPost.id}`,
        kind: 'discussion',
        title: `"${topPost.title}"`,
        reason: `Trending in ${community.name} — ${topPost.likes} likes, ${topPost.comments.length} comment${topPost.comments.length === 1 ? '' : 's'}`,
        linkTo: `/communities/${community.id}`,
        meta: community.name,
        score: postEngagementScore(topPost),
      })
    }
  }

  const communityActivity = communities
    .map((c) => {
      const communityPosts = getPostsByCommunity(c.id)
      return { community: c, postCount: communityPosts.length, score: communityPosts.reduce((sum, p) => sum + postEngagementScore(p), 0) }
    })
    .filter((c) => c.postCount > 0)
    .sort((a, b) => b.score - a.score)
  const topCommunity = communityActivity[0]
  if (topCommunity) {
    scored.push({
      id: `trend-community-${topCommunity.community.id}`,
      kind: 'community',
      title: topCommunity.community.name,
      reason: `${topCommunity.postCount} active discussion${topCommunity.postCount === 1 ? '' : 's'} right now`,
      linkTo: `/communities/${topCommunity.community.id}`,
      meta: topCommunity.community.category,
      score: topCommunity.score,
    })
  }

  const topOpportunity = [...opportunities].sort((a, b) => b.interestedStudentIds.length - a.interestedStudentIds.length)[0]
  if (topOpportunity && topOpportunity.interestedStudentIds.length > 0) {
    scored.push({
      id: `trend-opp-${topOpportunity.id}`,
      kind: 'opportunity',
      title: topOpportunity.title,
      reason: `${topOpportunity.interestedStudentIds.length} student${topOpportunity.interestedStudentIds.length === 1 ? '' : 's'} interested`,
      linkTo: `/opportunities/${topOpportunity.id}`,
      meta: topOpportunity.communityContext,
      score: topOpportunity.interestedStudentIds.length * 5,
    })
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ score: _score, ...item }) => item)
}

/**
 * HAPPENING NOW — timely, actionable campus-wide signals (not filtered to
 * the viewer's own courses/skills — that personalization already lives in
 * the "For You" feed). `excludePostIds` keeps this from repeating whatever
 * Trending already surfaced when both are shown together.
 */
export function getHappeningNow(excludePostIds: ReadonlySet<string> = new Set(), limit = 3): Recommendation[] {
  const items: Recommendation[] = []
  const communities = getCommunities()
  const posts = getPosts()
  const studyGroupSeekers = getStudyGroupSeekers()

  if (studyGroupSeekers.length > 0) {
    const courseCounts = new Map<string, number>()
    for (const seeker of studyGroupSeekers) courseCounts.set(seeker.courseCode, (courseCounts.get(seeker.courseCode) ?? 0) + 1)
    const [topCourse, count] = [...courseCounts.entries()].sort((a, b) => b[1] - a[1])[0]
    items.push({
      id: 'happening-seekers',
      kind: 'study_group',
      title: `${count} student${count === 1 ? '' : 's'} looking for a ${topCourse} study partner`,
      reason: 'Say yes and you could be their study buddy this week',
      linkTo: '/study-groups',
      meta: topCourse,
    })
  }

  const eventCommunity = communities.find((c) => /tomorrow|this weekend|tonight|closes friday|thursday/i.test(c.recentActivitySummary))
  if (eventCommunity) {
    items.push({
      id: `happening-event-${eventCommunity.id}`,
      kind: 'event',
      title: eventCommunity.recentActivitySummary,
      reason: `Happening in ${eventCommunity.name}`,
      linkTo: `/communities/${eventCommunity.id}`,
      meta: eventCommunity.name,
    })
  }

  const collabPost = posts.find((p) => !excludePostIds.has(p.id) && (p.tags.includes('Collaboration') || p.tags.includes('Project')))
  if (collabPost) {
    const community = getCommunityById(collabPost.communityId)
    if (community) {
      items.push({
        id: `happening-collab-${collabPost.id}`,
        kind: 'discussion',
        title: `"${collabPost.title}"`,
        reason: `Someone in ${community.name} is looking for collaborators`,
        linkTo: `/communities/${community.id}`,
        meta: community.name,
      })
    }
  }

  return items.slice(0, limit)
}

export interface NexusNowPulse {
  trending: Recommendation[]
  happeningNow: Recommendation[]
}

export function getNexusNowPulse(): NexusNowPulse {
  const trending = getTrendingAtMason()
  const usedPostIds = new Set(
    trending.filter((item) => item.id.startsWith('trend-post-')).map((item) => item.id.replace('trend-post-', '')),
  )
  return { trending, happeningNow: getHappeningNow(usedPostIds) }
}

export function getNexusNowPulseAsync(): Promise<NexusNowPulse> {
  return mockDelay(getNexusNowPulse(), 450)
}

/**
 * YOUR NEXT CONNECTION — a thin, intentional wrapper around matchPeople() so
 * every consumer of "who should I meet right now" goes through the exact
 * same discoverability-safe, self-excluding logic Phase 7 already built,
 * rather than a parallel implementation.
 */
export function getYourNextConnection(student: Student, limit = 2): PeopleMatch[] {
  return matchPeople(student)
    .filter((m) => m.score > 0)
    .slice(0, limit)
}

export function getYourNextConnectionAsync(student: Student): Promise<PeopleMatch[]> {
  return mockDelay(getYourNextConnection(student), 400)
}
