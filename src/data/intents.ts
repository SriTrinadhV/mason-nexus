import type { IntentOption } from '../types'

export const intentOptions: IntentOption[] = [
  { id: 'study', label: 'Study', description: 'Find study groups, classmates, and course resources' },
  { id: 'meet', label: 'Meet People', description: 'Find students who share your interests' },
  { id: 'ask', label: 'Ask a Question', description: 'Get help from your class communities' },
  { id: 'collaborate', label: 'Collaborate', description: 'Find teammates for a project or idea' },
  { id: 'discover', label: 'Find a Community', description: 'Browse classes, clubs, and interest groups' },
  { id: 'offer_skill', label: 'Offer a Skill', description: 'Find people or orgs who need what you can do' },
]

export function getIntentOption(id: string): IntentOption | undefined {
  return intentOptions.find((i) => i.id === id)
}
