import { supabase } from './supabaseClient'
import { getStudyGroups, getStudyGroupSeekers, refreshStudyGroups } from './dataStore'
import type { StudyGroup } from '../types'
import { mockDelay } from './mockDelay'

export function listStudyGroups(courseCode?: string): Promise<StudyGroup[]> {
  const result = courseCode ? getStudyGroups().filter((g) => g.courseCode === courseCode) : getStudyGroups()
  return mockDelay([...result])
}

export function getSeekersForCourse(courseCode: string) {
  return getStudyGroupSeekers().filter((s) => s.courseCode === courseCode)
}

/**
 * Capacity is enforced atomically in the database (join_study_group() in
 * schema.sql row-locks the group before checking capacity), not just here —
 * this call can genuinely fail (e.g. the group filled up between page load
 * and click), which callers surface via the rejected promise.
 */
export async function joinStudyGroup(groupId: string, _studentId: string): Promise<StudyGroup | undefined> {
  const { error } = await supabase.rpc('join_study_group', { p_group_id: groupId })
  if (error) throw error
  await refreshStudyGroups()
  return getStudyGroups().find((g) => g.id === groupId)
}

export async function createStudyGroup(input: {
  courseCode: string
  title: string
  meetingTime: string
  location: string
  description: string
  capacity: number
  createdBy: string
}): Promise<StudyGroup> {
  const { data, error } = await supabase
    .from('study_groups')
    .insert({
      course_code: input.courseCode,
      title: input.title,
      meeting_time: input.meetingTime,
      location: input.location,
      description: input.description,
      capacity: input.capacity,
      created_by: input.createdBy,
    })
    .select('id')
    .single()
  if (error) throw error

  // The creator is auto-added as a member by a database trigger
  // (add_creator_as_member in schema.sql), matching the old mock behavior.
  await refreshStudyGroups()
  const created = getStudyGroups().find((g) => g.id === data.id)
  if (!created) throw new Error('Study group created but could not be re-fetched')
  return created
}
