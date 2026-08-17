import { studyGroups, studyGroupSeekers } from '../data/studyGroups'
import type { StudyGroup } from '../types'
import { mockDelay } from './mockDelay'

export function listStudyGroups(courseCode?: string): Promise<StudyGroup[]> {
  const result = courseCode ? studyGroups.filter((g) => g.courseCode === courseCode) : studyGroups
  return mockDelay([...result])
}

export function getSeekersForCourse(courseCode: string) {
  return studyGroupSeekers.filter((s) => s.courseCode === courseCode)
}

export function joinStudyGroup(groupId: string, studentId: string): Promise<StudyGroup | undefined> {
  const group = studyGroups.find((g) => g.id === groupId)
  if (group && !group.memberIds.includes(studentId) && group.memberIds.length < group.capacity) {
    group.memberIds.push(studentId)
  }
  return mockDelay(group, 400)
}

export function createStudyGroup(input: {
  courseCode: string
  title: string
  meetingTime: string
  location: string
  description: string
  capacity: number
  createdBy: string
}): Promise<StudyGroup> {
  const group: StudyGroup = {
    id: `sg-${Date.now()}`,
    courseCode: input.courseCode,
    title: input.title,
    memberIds: [input.createdBy],
    capacity: input.capacity,
    meetingTime: input.meetingTime,
    location: input.location,
    description: input.description,
    createdBy: input.createdBy,
  }
  studyGroups.unshift(group)
  return mockDelay(group, 500)
}
