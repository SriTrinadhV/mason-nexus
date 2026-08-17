import { opportunities } from '../data/opportunities'
import { students } from '../data/students'
import type { Opportunity, Student } from '../types'
import { mockDelay } from './mockDelay'

export function listOpportunities(): Promise<Opportunity[]> {
  return mockDelay([...opportunities])
}

export function getOpportunity(id: string): Promise<Opportunity | undefined> {
  return mockDelay(opportunities.find((o) => o.id === id))
}

export function expressInterest(opportunityId: string, studentId: string): Promise<Opportunity | undefined> {
  const opp = opportunities.find((o) => o.id === opportunityId)
  if (opp && !opp.interestedStudentIds.includes(studentId)) {
    opp.interestedStudentIds.push(studentId)
  }
  return mockDelay(opp, 400)
}

/**
 * SIMULATED AI FEATURE — opportunity matching by skill overlap.
 */
export function matchingSkills(student: Student, opportunity: Opportunity): string[] {
  return opportunity.requiredSkills.filter((skill) => student.skills.includes(skill))
}

export function getOpportunitiesMatchingStudent(student: Student): (Opportunity & { matchedSkills: string[] })[] {
  return opportunities
    .map((o) => ({ ...o, matchedSkills: matchingSkills(student, o) }))
    .filter((o) => o.matchedSkills.length > 0)
    .sort((a, b) => b.matchedSkills.length - a.matchedSkills.length)
}

export function getRecommendedPeopleForOpportunity(opportunity: Opportunity): { student: Student; matchedSkills: string[] }[] {
  return students
    .map((s) => ({ student: s, matchedSkills: matchingSkills(s, opportunity) }))
    .filter((m) => m.matchedSkills.length > 0 && m.student.id !== opportunity.postedBy && m.student.discoverable !== false)
    .sort((a, b) => b.matchedSkills.length - a.matchedSkills.length)
}
