import type { Opportunity } from '../types'

export const opportunities: Opportunity[] = [
  {
    id: 'op-1',
    title: 'Need a video editor for our hackathon demo reel',
    description: 'Mason Developers is putting together a 2-minute highlight reel from HackGMU submissions. Need someone comfortable cutting footage together on a tight deadline (this weekend).',
    requiredSkills: ['Video Editing'],
    communityContext: 'Mason Developers',
    postedBy: 'chris-nguyen',
    interestedStudentIds: [],
    createdAt: '3h ago',
  },
  {
    id: 'op-2',
    title: 'Looking for a designer for our hackathon team',
    description: 'Small team of two CS majors building a study-matching tool for HackGMU. We can handle the backend but need someone who can own the UI and make it not look like a CS project.',
    requiredSkills: ['UI Design', 'Figma'],
    communityContext: 'Student Startups',
    postedBy: 'priya-patel',
    interestedStudentIds: [],
    createdAt: '1d ago',
  },
  {
    id: 'op-3',
    title: 'Need a photographer for our club showcase event',
    description: 'Photography Club\'s end-of-semester showcase needs someone to document the event itself (a little meta, we know). Free food and a photo credit.',
    requiredSkills: ['Photography'],
    communityContext: 'Photography Club',
    postedBy: 'sam-rivera',
    interestedStudentIds: ['taylor-morgan'],
    createdAt: '2d ago',
  },
  {
    id: 'op-4',
    title: 'Need a frontend developer for a student project',
    description: 'Building a small tool to help students track their degree progress against major requirements. Backend and data model are done — need help turning it into something usable.',
    requiredSkills: ['React', 'UI Design'],
    communityContext: 'Mason Developers',
    postedBy: 'jordan-lee',
    interestedStudentIds: [],
    createdAt: '5h ago',
  },
  {
    id: 'op-5',
    title: 'Python help wanted for a class project (paid in pizza)',
    description: 'Working on a data visualization side project and could use a second set of hands with Python and pandas for a few hours this week.',
    requiredSkills: ['Python'],
    communityContext: 'AI & Machine Learning at Mason',
    postedBy: 'maria-gonzalez',
    interestedStudentIds: [],
    createdAt: '9h ago',
  },
  {
    id: 'op-6',
    title: 'Need a marketing lead for our club rebrand',
    description: 'Student Startups is refreshing its branding ahead of demo day and could use someone to help plan the social media rollout.',
    requiredSkills: ['Marketing'],
    communityContext: 'Student Startups',
    postedBy: 'taylor-morgan',
    interestedStudentIds: [],
    createdAt: '1d ago',
  },
  {
    id: 'op-7',
    title: 'Looking for a teammate with product sense for a pitch competition',
    description: 'Putting together a team for the spring pitch competition — have the technical side covered, need someone who can help shape the pitch itself.',
    requiredSkills: ['Product Strategy'],
    communityContext: 'Student Startups',
    postedBy: 'priya-patel',
    interestedStudentIds: [],
    createdAt: '4h ago',
  },
]

export function getOpportunityById(id: string): Opportunity | undefined {
  return opportunities.find((o) => o.id === id)
}
