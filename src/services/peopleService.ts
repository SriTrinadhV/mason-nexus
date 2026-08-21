import { getCommunityById, getProfiles } from './dataStore'
import type { Student } from '../types'
import { mockDelay } from './mockDelay'

export interface PeopleMatch {
  student: Student
  sharedClasses: string[]
  sharedInterests: string[]
  sharedSkills: string[]
  sharedCommunities: string[]
  score: number
  reasonText: string
}

function joinNames(items: string[]): string {
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}

/**
 * Builds the "why this person" text from the same signals that produce the
 * match score, so the explanation always matches the real reason someone was
 * recommended. Priority follows the score weighting (courses > skills >
 * interests > communities); major and lookingFor are weaker, unscored
 * signals used only as a fallback when none of the scored signals overlap.
 */
function buildReasonText(
  student: Student,
  other: Student,
  sharedClasses: string[],
  sharedSkills: string[],
  sharedInterests: string[],
  sharedCommunities: string[],
): string {
  const clauses: { clause: string; full: string }[] = []

  if (sharedClasses.length) {
    const names = joinNames(sharedClasses)
    clauses.push({ clause: `share ${names}`, full: `You share ${names}.` })
  }
  if (sharedSkills.length) {
    const names = joinNames(sharedSkills)
    const noun = sharedSkills.length > 1 ? 'skills' : 'a skill'
    clauses.push({ clause: `both have ${names} as ${noun}`, full: `You both have ${names} as ${noun}.` })
  }
  if (sharedInterests.length) {
    const phrase = sharedInterests.length > 1 ? `interests in ${joinNames(sharedInterests)}` : `an interest in ${sharedInterests[0]}`
    clauses.push({ clause: `share ${phrase}`, full: `You share ${phrase}.` })
  }
  if (sharedCommunities.length) {
    const names = sharedCommunities.map((id) => getCommunityById(id)?.name).filter((n): n is string => Boolean(n))
    if (names.length) {
      const joined = joinNames(names)
      clauses.push({ clause: `are both in ${joined}`, full: `You're both in ${joined}.` })
    }
  }

  if (clauses.length === 1) return clauses[0].full
  if (clauses.length >= 2) return `You ${clauses[0].clause} and ${clauses[1].clause}.`

  if (student.major === other.major) return `You both study ${student.major}.`

  const sharedGoals = student.lookingFor.filter((g) => other.lookingFor.includes(g))
  if (sharedGoals.length) return `You're both looking for ${joinNames(sharedGoals)}.`

  return 'New to your network at Mason.'
}

/**
 * SIMULATED AI FEATURE — people matching. Unchanged scoring logic; `pool`
 * now defaults to the live, RLS-filtered profile cache instead of a static
 * mock array — a non-discoverable student was never fetched into that cache
 * in the first place (see profiles_select policy in schema.sql), so this
 * filter is defense-in-depth, not the only thing standing between a hidden
 * profile and this function.
 */
export function matchPeople(student: Student, pool: Student[] = getProfiles()): PeopleMatch[] {
  return pool
    .filter((s) => s.id !== student.id && s.discoverable !== false)
    .map((s) => {
      const sharedClasses = student.courses.filter((c) => s.courses.includes(c))
      const sharedInterests = student.interests.filter((i) => s.interests.includes(i))
      const sharedSkills = student.skills.filter((sk) => s.skills.includes(sk))
      const sharedCommunities = student.communities.filter((c) => s.communities.includes(c))
      const score = sharedClasses.length * 3 + sharedInterests.length * 2 + sharedSkills.length * 2 + sharedCommunities.length
      const reasonText = buildReasonText(student, s, sharedClasses, sharedSkills, sharedInterests, sharedCommunities)

      return { student: s, sharedClasses, sharedInterests, sharedSkills, sharedCommunities, score, reasonText }
    })
    .sort((a, b) => b.score - a.score)
}

export function discoverPeople(student: Student): Promise<PeopleMatch[]> {
  return mockDelay(matchPeople(student).filter((m) => m.score > 0))
}
