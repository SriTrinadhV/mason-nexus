// Core domain types for the Mason Commons prototype.
// These map roughly 1:1 to what would become API response shapes in production.

export type Intent =
  | 'study'
  | 'meet'
  | 'ask'
  | 'collaborate'
  | 'discover'
  | 'offer_skill'

export interface IntentOption {
  id: Intent
  label: string
  emoji: string
  description: string
}

export type CommunityCategory = 'class' | 'club' | 'interest'

export interface Community {
  id: string
  name: string
  category: CommunityCategory
  description: string
  memberCount: number
  tags: string[]
  recentActivitySummary: string
  color: string // tailwind-safe accent token used for the card
  courseCode?: string // for class communities
  createdBy?: string // studentId, for student-created interest/club communities
  pendingReview?: boolean
}

export interface Student {
  id: string
  name: string
  displayName: string
  pseudonymous: boolean
  major: string
  year: 'Freshman' | 'Sophomore' | 'Junior' | 'Senior' | 'Graduate'
  courses: string[]
  interests: string[]
  skills: string[]
  lookingFor: LookingForOption[]
  bio: string
  avatarColor: string
  communities: string[] // community ids
  availableFor: string[] // e.g. "Study groups", "Hackathon teams"
  portfolio: PortfolioItem[]
  role: 'Student' | 'Moderator' | 'Community Organizer'
  verified: boolean // GMU email verification (mocked)
}

export type LookingForOption =
  | 'Study partners'
  | 'Communities'
  | 'Friends'
  | 'Collaboration'
  | 'Opportunities'
  | 'People with similar interests'

export interface PortfolioItem {
  id: string
  title: string
  description: string
  link?: string
  placeholderColor: string
}

export type PostTag =
  | 'Question'
  | 'Study Help'
  | 'Resource'
  | 'Discussion'
  | 'Project'
  | 'Collaboration'

export interface Comment {
  id: string
  authorId: string
  body: string
  createdAt: string
  likes: number
}

export interface Post {
  id: string
  communityId: string
  authorId: string
  title: string
  body: string
  tags: PostTag[]
  createdAt: string
  likes: number
  likedByMe?: boolean
  savedByMe?: boolean
  comments: Comment[]
}

export interface StudyGroup {
  id: string
  courseCode: string
  title: string
  memberIds: string[]
  capacity: number
  meetingTime: string
  location: string
  description: string
  createdBy: string
}

export interface Opportunity {
  id: string
  title: string
  description: string
  requiredSkills: string[]
  communityContext: string
  postedBy: string
  interestedStudentIds: string[]
  createdAt: string
}

export type NotificationType =
  | 'reply'
  | 'study_group'
  | 'community_recommendation'
  | 'collaboration_interest'
  | 'opportunity_match'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  body: string
  createdAt: string
  read: boolean
  linkTo?: string
}

export interface Recommendation {
  id: string
  kind: 'community' | 'person' | 'study_group' | 'opportunity' | 'discussion' | 'event'
  title: string
  reason: string
  linkTo: string
  meta?: string
}

export type ReportReason =
  | 'Spam'
  | 'Harassment'
  | 'Inappropriate content'
  | 'Privacy/doxxing concern'
  | 'Academic integrity concern'

export interface OnboardingData {
  major: string
  year: Student['year']
  courses: string[]
  interests: string[]
  skills: string[]
  lookingFor: LookingForOption[]
}
