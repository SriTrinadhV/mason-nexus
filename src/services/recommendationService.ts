import { communities } from '../data/communities'
import { posts } from '../data/posts'
import { studyGroups, studyGroupSeekers } from '../data/studyGroups'
import { opportunities } from '../data/opportunities'
import { students, getStudentById } from '../data/students'
import type { Community, Intent, Recommendation, Student } from '../types'
import { mockDelay } from './mockDelay'
import { matchPeople } from './peopleService'
import { matchingSkills } from './opportunityService'

/**
 * SIMULATED AI LAYER
 * ------------------
 * Every function here is deterministic, rule-based, and fully explainable —
 * there is no model in the loop. Each recommendation carries a `reason`
 * string surfaced directly in the UI so the "why am I seeing this" question
 * is always answerable. A production version would likely swap the scoring
 * logic for a real recommender while keeping this same "reason" contract.
 *
 * Recommendations are based only on profile and activity information the
 * student chose to share during onboarding — see OnboardingPage.
 */

export function getRecommendedCommunities(student: Student): { community: Community; reason: string }[] {
  const joined = new Set(student.communities)
  const results: { community: Community; reason: string }[] = []

  for (const c of communities) {
    if (joined.has(c.id)) continue
    if (c.courseCode && student.courses.includes(c.courseCode)) {
      results.push({ community: c, reason: `Recommended because you're enrolled in ${c.courseCode}.` })
      continue
    }
    const matchedTag = c.tags.find((t) => student.interests.includes(t))
    if (matchedTag) {
      results.push({ community: c, reason: `Matches your interest in ${matchedTag}.` })
      continue
    }
    const matchedSkillTag = c.tags.find((t) => student.skills.includes(t))
    if (matchedSkillTag) {
      results.push({ community: c, reason: `Matches your skill in ${matchedSkillTag}.` })
    }
  }
  return results
}

export function getForYouFeed(student: Student): Recommendation[] {
  const items: Recommendation[] = []

  // Study group seekers in the student's own courses
  for (const course of student.courses) {
    const seekers = studyGroupSeekers.filter((s) => s.courseCode === course && s.studentId !== student.id)
    if (seekers.length > 0) {
      items.push({
        id: `rec-seekers-${course}`,
        kind: 'study_group',
        title: `${seekers.length} student${seekers.length > 1 ? 's are' : ' is'} looking for a ${course} study group`,
        reason: `Recommended because you're enrolled in ${course}.`,
        linkTo: '/study-groups',
        meta: course,
      })
    }
  }

  // Recommended communities (top 2)
  const recCommunities = getRecommendedCommunities(student).slice(0, 2)
  for (const { community, reason } of recCommunities) {
    items.push({
      id: `rec-comm-${community.id}`,
      kind: 'community',
      title: `${community.name} — ${community.recentActivitySummary.toLowerCase()}`,
      reason,
      linkTo: `/communities/${community.id}`,
      meta: community.category,
    })
  }

  // Relevant discussion in one of their classes
  const classPost = posts.find((p) => {
    const community = communities.find((c) => c.id === p.communityId)
    return community?.courseCode && student.courses.includes(community.courseCode) && p.tags.includes('Question')
  })
  if (classPost) {
    const community = communities.find((c) => c.id === classPost.communityId)
    items.push({
      id: `rec-post-${classPost.id}`,
      kind: 'discussion',
      title: `A discussion in ${community?.name} may be relevant: "${classPost.title}"`,
      reason: `Recommended because you're enrolled in ${community?.courseCode}.`,
      linkTo: `/communities/${classPost.communityId}`,
    })
  }

  // Opportunity matching a skill
  const matchedOpportunity = opportunities.find((o) => matchingSkills(student, o).length > 0)
  if (matchedOpportunity) {
    const skills = matchingSkills(student, matchedOpportunity)
    items.push({
      id: `rec-opp-${matchedOpportunity.id}`,
      kind: 'opportunity',
      title: matchedOpportunity.title,
      reason: `Matches your ${skills.join(', ')} skill${skills.length > 1 ? 's' : ''}.`,
      linkTo: `/opportunities/${matchedOpportunity.id}`,
    })
  }

  // Club/interest event for a shared interest, from a community not yet joined
  const eventCommunity = communities.find(
    (c) => !student.communities.includes(c.id) && c.tags.some((t) => student.interests.includes(t)) && c.recentActivitySummary.toLowerCase().includes('event'),
  )
  if (eventCommunity) {
    items.push({
      id: `rec-event-${eventCommunity.id}`,
      kind: 'event',
      title: `${eventCommunity.name} has an event coming up`,
      reason: `Matches your interest in ${eventCommunity.tags.find((t) => student.interests.includes(t))}.`,
      linkTo: `/communities/${eventCommunity.id}`,
    })
  }

  // A person recommendation
  const topMatch = matchPeople(student, students).find((m) => m.score > 0)
  if (topMatch) {
    items.push({
      id: `rec-person-${topMatch.student.id}`,
      kind: 'person',
      title: `${topMatch.student.displayName} may be a good person to know`,
      reason: topMatch.reasonText,
      linkTo: '/discover/people',
    })
  }

  return items
}

export interface IntentResults {
  studyGroups?: ReturnType<typeof studyGroupsForStudent>
  classmates?: { student: Student; reason: string }[]
  communities?: { community: Community; reason: string }[]
  discussions?: typeof posts
  people?: ReturnType<typeof matchPeople>
  events?: { community: Community; reason: string }[]
  opportunities?: (typeof opportunities[number] & { matchedSkills: string[] })[]
  requesters?: { student: Student; reason: string }[]
}

function studyGroupsForStudent(student: Student) {
  return studyGroups.filter((g) => student.courses.includes(g.courseCode))
}

export function getIntentResults(student: Student, intent: Intent): IntentResults {
  switch (intent) {
    case 'study': {
      const groups = studyGroups.filter((g) => student.courses.includes(g.courseCode))
      const classmates = students
        .filter((s) => s.id !== student.id && s.discoverable !== false && s.courses.some((c) => student.courses.includes(c)))
        .map((s) => {
          const shared = s.courses.filter((c) => student.courses.includes(c))
          return { student: s, reason: `Also taking ${shared.join(', ')}` }
        })
      const classCommunities = communities.filter((c) => c.courseCode && student.courses.includes(c.courseCode))
      const discussions = posts.filter((p) => {
        const c = communities.find((cc) => cc.id === p.communityId)
        return c?.courseCode && student.courses.includes(c.courseCode)
      })
      return {
        studyGroups: groups,
        classmates,
        communities: classCommunities.map((community) => ({ community, reason: `You're enrolled in ${community.courseCode}` })),
        discussions,
      }
    }
    case 'meet': {
      const people = matchPeople(student, students).filter((m) => m.sharedInterests.length > 0 || m.sharedCommunities.length > 0)
      const interestCommunities = getRecommendedCommunities(student).filter(({ community }) => community.category !== 'class')
      return { people, communities: interestCommunities }
    }
    case 'ask': {
      const classCommunities = communities.filter((c) => c.courseCode && student.courses.includes(c.courseCode))
      const otherCommunities = communities.filter((c) => student.communities.includes(c.id) && c.category !== 'class')
      return {
        communities: [...classCommunities, ...otherCommunities].map((community) => ({
          community,
          reason: community.courseCode ? `You're enrolled in ${community.courseCode}` : `You're a member`,
        })),
      }
    }
    case 'collaborate': {
      const people = matchPeople(student, students).filter((m) => m.sharedSkills.length > 0 || m.sharedInterests.length > 0)
      const collabPosts = posts.filter((p) => p.tags.includes('Collaboration') || p.tags.includes('Project'))
      const matchedOpportunities = opportunities
        .map((o) => ({ ...o, matchedSkills: matchingSkills(student, o) }))
        .filter((o) => o.matchedSkills.length > 0)
      return { people, discussions: collabPosts, opportunities: matchedOpportunities }
    }
    case 'discover': {
      const recommended = getRecommendedCommunities(student)
      return { communities: recommended }
    }
    case 'offer_skill': {
      const matchedOpportunities = opportunities
        .map((o) => ({ ...o, matchedSkills: matchingSkills(student, o) }))
        .filter((o) => o.matchedSkills.length > 0)
        .sort((a, b) => b.matchedSkills.length - a.matchedSkills.length)
      const requesters = matchedOpportunities
        .map((o) => ({ student: getStudentById(o.postedBy)!, reason: `Posted "${o.title}"` }))
        .filter((r) => r.student)
      return { opportunities: matchedOpportunities, requesters }
    }
    default:
      return {}
  }
}

export function getForYouFeedAsync(student: Student) {
  return mockDelay(getForYouFeed(student), 500)
}

export function getIntentResultsAsync(student: Student, intent: Intent) {
  return mockDelay(getIntentResults(student, intent), 450)
}
