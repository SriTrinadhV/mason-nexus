import type { AppNotification } from '../types'

export const initialNotifications: AppNotification[] = [
  {
    id: 'n1',
    type: 'reply',
    title: 'Jordan Lee replied to your comment',
    body: 'In "Intro to transformers — beginner-friendly thread"',
    createdAt: '10m ago',
    read: false,
    linkTo: '/communities/ai-at-mason',
  },
  {
    id: 'n2',
    type: 'study_group',
    title: 'A CS 310 study group is forming',
    body: '4 students have joined the Thursday 6 PM group at Fenwick Library',
    createdAt: '1h ago',
    read: false,
    linkTo: '/study-groups',
  },
  {
    id: 'n3',
    type: 'opportunity_match',
    title: 'A new opportunity matches your skills',
    body: '"Need a video editor for our hackathon demo reel" matches your Video Editing skill',
    createdAt: '3h ago',
    read: false,
    linkTo: '/opportunities',
  },
  {
    id: 'n4',
    type: 'community_recommendation',
    title: 'Photography Club was recommended for you',
    body: 'Matches your interest in photography',
    createdAt: '1d ago',
    read: true,
    linkTo: '/communities/photography-club',
  },
  {
    id: 'n5',
    type: 'collaboration_interest',
    title: 'Priya Patel is interested in your Python skills',
    body: 'On "Looking for a technical co-founder — study-matching app idea"',
    createdAt: '2d ago',
    read: true,
    linkTo: '/communities/student-startups',
  },
]
