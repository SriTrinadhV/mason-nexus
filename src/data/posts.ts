import type { Post } from '../types'

// Timestamps are relative strings for prototype readability rather than real Date objects.
export const posts: Post[] = [
  {
    id: 'post-1',
    communityId: 'cs310',
    authorId: 'maria-gonzalez',
    title: 'Does anyone understand the recursion assignment?',
    body: 'Stuck on problem 3 — the recursive tree traversal. My base case keeps infinite-looping and I can\'t tell if it\'s the base case or the recursive call that\'s wrong. Anyone want to compare notes before the deadline?',
    tags: ['Question', 'Study Help'],
    createdAt: '2h ago',
    likes: 14,
    comments: [
      {
        id: 'c1',
        authorId: 'jordan-lee',
        body: 'Check whether your base case fires before or after you check for a null node — that got me too.',
        createdAt: '1h ago',
        likes: 5,
      },
      {
        id: 'c2',
        authorId: 'devon-brooks',
        body: 'Same boat. Want to do a call tonight?',
        createdAt: '45m ago',
        likes: 2,
      },
    ],
  },
  {
    id: 'post-2',
    communityId: 'cs310',
    authorId: 'jordan-lee',
    title: 'Recursion base cases — a mental model that finally clicked for me',
    body: 'Wrote up how I think about base cases after struggling with the same thing everyone in this course struggles with. Sharing in case it helps: think of it as "what\'s the smallest version of this problem I can answer without recursing?"',
    tags: ['Resource', 'Study Help'],
    createdAt: '1d ago',
    likes: 41,
    comments: [
      {
        id: 'c3',
        authorId: 'maria-gonzalez',
        body: 'This is a great explanation, wish I saw it before the assignment was due.',
        createdAt: '20h ago',
        likes: 6,
      },
    ],
  },
  {
    id: 'post-3',
    communityId: 'cs310',
    authorId: 'devon-brooks',
    title: 'Anyone else building something outside of the assignments?',
    body: 'Working on a small roguelike in Python for fun and could use a second pair of eyes on my collision logic. Not homework related, just wanted to see if anyone else in the class does side projects.',
    tags: ['Project', 'Discussion'],
    createdAt: '3d ago',
    likes: 9,
    comments: [],
  },
  {
    id: 'post-4',
    communityId: 'cs330',
    authorId: 'chris-nguyen',
    title: 'DFA to regex conversion — worked example',
    body: 'Posting a worked example of state elimination since a few people asked about it after lecture. Let me know if it\'s useful.',
    tags: ['Resource'],
    createdAt: '6h ago',
    likes: 22,
    comments: [],
  },
  {
    id: 'post-5',
    communityId: 'math125',
    authorId: 'maria-gonzalez',
    title: 'Induction proof structure — quick reference',
    body: 'Made a one-page cheat sheet for induction proof structure ahead of the midterm. Base case, inductive hypothesis, inductive step — happy to share the doc.',
    tags: ['Resource', 'Study Help'],
    createdAt: '5h ago',
    likes: 18,
    comments: [],
  },
  {
    id: 'post-6',
    communityId: 'ai-at-mason',
    authorId: 'chris-nguyen',
    title: 'Intro to transformers — beginner-friendly thread',
    body: 'A lot of new members have been asking where to start with transformer architectures. Starting a thread to collect good beginner resources — drop your favorites.',
    tags: ['Discussion', 'Resource'],
    createdAt: '4h ago',
    likes: 33,
    comments: [
      {
        id: 'c4',
        authorId: 'alex-johnson',
        body: 'The Illustrated Transformer is what finally made attention click for me.',
        createdAt: '2h ago',
        likes: 8,
      },
    ],
  },
  {
    id: 'post-7',
    communityId: 'photography-club',
    authorId: 'sam-rivera',
    title: 'Golden hour shoot at the Quad — tomorrow!',
    body: 'Reminder that we\'re meeting at the Quad tomorrow at 6:45 PM for the golden hour shoot. Bring whatever camera you\'ve got, phones welcome.',
    tags: ['Discussion'],
    createdAt: '1d ago',
    likes: 27,
    comments: [],
  },
  {
    id: 'post-8',
    communityId: 'student-startups',
    authorId: 'priya-patel',
    title: 'Looking for a technical co-founder — study-matching app idea',
    body: 'Been sketching out an app that matches students into study groups automatically based on courses and availability. Have the UX mapped out in Figma, need someone comfortable with Python/backend to help validate feasibility.',
    tags: ['Collaboration', 'Project'],
    createdAt: '8h ago',
    likes: 19,
    comments: [
      {
        id: 'c5',
        authorId: 'chris-nguyen',
        body: 'This is close to something I looked at for my capstone — happy to chat.',
        createdAt: '3h ago',
        likes: 4,
      },
    ],
  },
  {
    id: 'post-9',
    communityId: 'hiking-club',
    authorId: 'ben-carter',
    title: 'Fall trip schedule is up',
    body: 'Posted the fall trip schedule — Great Falls this weekend, Shenandoah in three weeks. Sign-ups are in the events tab.',
    tags: ['Discussion'],
    createdAt: '2d ago',
    likes: 31,
    comments: [],
  },
  {
    id: 'post-10',
    communityId: 'cs310',
    authorId: 'alex-johnson',
    title: 'Anyone up for a CS 310 study session this week?',
    body: 'Trying to get ahead of the midterm. Thinking Fenwick Library, maybe Thursday evening. Who\'s in?',
    tags: ['Study Help'],
    createdAt: '30m ago',
    likes: 6,
    comments: [],
  },
]

export function getPostsByCommunity(communityId: string): Post[] {
  return posts.filter((p) => p.communityId === communityId)
}

export function getPostById(id: string): Post | undefined {
  return posts.find((p) => p.id === id)
}
