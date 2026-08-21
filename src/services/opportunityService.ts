import { supabase } from './supabaseClient'
import { getOpportunities, getProfiles, refreshOpportunities } from './dataStore'
import type { Opportunity, Student } from '../types'
import { mockDelay } from './mockDelay'

export function listOpportunities(): Promise<Opportunity[]> {
  return mockDelay([...getOpportunities()])
}

export function getOpportunity(id: string): Promise<Opportunity | undefined> {
  return mockDelay(getOpportunities().find((o) => o.id === id))
}

export async function expressInterest(opportunityId: string, _studentId: string): Promise<Opportunity | undefined> {
  const { error } = await supabase.rpc('express_opportunity_interest', { p_opportunity_id: opportunityId })
  if (error) throw error
  await refreshOpportunities()
  return getOpportunities().find((o) => o.id === opportunityId)
}

/**
 * SIMULATED AI FEATURE — opportunity matching by skill overlap (unchanged).
 */
export function matchingSkills(student: Student, opportunity: Opportunity): string[] {
  return opportunity.requiredSkills.filter((skill) => student.skills.includes(skill))
}

export function getOpportunitiesMatchingStudent(student: Student): (Opportunity & { matchedSkills: string[] })[] {
  return getOpportunities()
    .map((o) => ({ ...o, matchedSkills: matchingSkills(student, o) }))
    .filter((o) => o.matchedSkills.length > 0)
    .sort((a, b) => b.matchedSkills.length - a.matchedSkills.length)
}

export function getRecommendedPeopleForOpportunity(opportunity: Opportunity): { student: Student; matchedSkills: string[] }[] {
  return getProfiles()
    .map((s) => ({ student: s, matchedSkills: matchingSkills(s, opportunity) }))
    .filter((m) => m.matchedSkills.length > 0 && m.student.id !== opportunity.postedBy && m.student.discoverable !== false)
    .sort((a, b) => b.matchedSkills.length - a.matchedSkills.length)
}
