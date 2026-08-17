import { students } from '../data/students'
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

/**
 * SIMULATED AI FEATURE — people matching.
 * Score is a simple weighted overlap of classes, interests, skills, and
 * communities. Production would likely use embeddings + activity signals,
 * but this keeps the "why" fully explainable, which matters more for a
 * prototype than sophistication.
 */
export function matchPeople(student: Student, pool: Student[] = students): PeopleMatch[] {
  return pool
    .filter((s) => s.id !== student.id)
    .map((s) => {
      const sharedClasses = student.courses.filter((c) => s.courses.includes(c))
      const sharedInterests = student.interests.filter((i) => s.interests.includes(i))
      const sharedSkills = student.skills.filter((sk) => s.skills.includes(sk))
      const sharedCommunities = student.communities.filter((c) => s.communities.includes(c))
      const score = sharedClasses.length * 3 + sharedInterests.length * 2 + sharedSkills.length * 2 + sharedCommunities.length

      const parts: string[] = []
      if (sharedClasses.length) parts.push(`${sharedClasses.length} class${sharedClasses.length > 1 ? 'es' : ''}`)
      if (sharedInterests.length) parts.push(`${sharedInterests.length} interest${sharedInterests.length > 1 ? 's' : ''}`)
      if (sharedSkills.length) parts.push(`${sharedSkills.length} skill${sharedSkills.length > 1 ? 's' : ''}`)
      const reasonText = parts.length ? `You share ${parts.join(' and ')}.` : 'New to your network at Mason.'

      return { student: s, sharedClasses, sharedInterests, sharedSkills, sharedCommunities, score, reasonText }
    })
    .sort((a, b) => b.score - a.score)
}

export function discoverPeople(student: Student): Promise<PeopleMatch[]> {
  return mockDelay(matchPeople(student).filter((m) => m.score > 0))
}
