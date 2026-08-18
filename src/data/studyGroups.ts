import type { StudyGroup } from '../types'

export const studyGroups: StudyGroup[] = [
  {
    id: 'sg-1',
    courseCode: 'CS 310',
    title: 'CS 310 Midterm Study Group',
    memberIds: ['maria-gonzalez', 'jordan-lee', 'devon-brooks', 'chris-nguyen'],
    capacity: 6,
    meetingTime: 'Thursday, 6:00 PM',
    location: 'Fenwick Library, 2nd Floor',
    description: 'Working through past midterm problems together, focused on recursion and trees this week.',
    createdBy: 'maria-gonzalez',
  },
  {
    id: 'sg-2',
    courseCode: 'CS 330',
    title: 'CS 330 Proofs & Automata Group',
    memberIds: ['chris-nguyen', 'maria-gonzalez'],
    capacity: 5,
    meetingTime: 'Tuesday, 7:30 PM',
    location: 'Johnson Center, Room 240',
    description: 'Weekly working session on DFA/NFA conversions and induction proofs.',
    createdBy: 'chris-nguyen',
  },
  {
    id: 'sg-3',
    courseCode: 'MATH 125',
    title: 'MATH 125 Discrete Math Crew',
    memberIds: ['maria-gonzalez'],
    capacity: 4,
    meetingTime: 'Monday, 5:00 PM',
    location: 'Fenwick Library, Group Study Room B',
    description: 'Small group working through problem sets together, beginner-friendly pace.',
    createdBy: 'maria-gonzalez',
  },
  {
    id: 'sg-4',
    courseCode: 'CS 211',
    title: 'CS 211 Intro Programming Study Table',
    memberIds: ['devon-brooks'],
    capacity: 6,
    meetingTime: 'Wednesday, 4:00 PM',
    location: 'Johnson Center, Room 145',
    description: 'Weekly drop-in session working through labs and syntax questions together — beginner-friendly.',
    createdBy: 'devon-brooks',
  },
  {
    id: 'sg-5',
    courseCode: 'IT 305',
    title: 'IT 305 Database Design Group',
    memberIds: ['priya-patel'],
    capacity: 5,
    meetingTime: 'Friday, 2:00 PM',
    location: 'Nguyen Engineering Building, Room 108',
    description: 'Working through ER diagrams and normalization exercises ahead of the project milestone.',
    createdBy: 'priya-patel',
  },
]

// Students who have expressed intent to find a study partner but haven't joined a group yet.
// Used to power the "people looking for a study group" intent-based discovery module.
export const studyGroupSeekers: { studentId: string; courseCode: string }[] = [
  { studentId: 'devon-brooks', courseCode: 'CS 310' },
  { studentId: 'jordan-lee', courseCode: 'CS 310' },
  { studentId: 'maria-gonzalez', courseCode: 'CS 330' },
]

export function getStudyGroupsByCourse(courseCode: string): StudyGroup[] {
  return studyGroups.filter((g) => g.courseCode === courseCode)
}
