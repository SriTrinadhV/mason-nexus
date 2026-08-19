import type { ReportReason } from '../types'
import { mockDelay } from './mockDelay'
import { generateId } from './id'

export interface Report {
  id: string
  targetType: 'post' | 'comment' | 'student' | 'community'
  targetId: string
  reason: ReportReason
  details?: string
  createdAt: string
  status: 'queued_for_review' | 'ai_flagged' | 'resolved'
}

const reports: Report[] = []

/**
 * SIMULATED moderation. Certain reasons are auto-flagged by a (fake) AI
 * classifier for priority review; everything still requires a human
 * moderator decision — the prototype never auto-bans or auto-removes content.
 */
export function submitReport(input: {
  targetType: Report['targetType']
  targetId: string
  reason: ReportReason
  details?: string
}): Promise<Report> {
  const highPriority: ReportReason[] = ['Harassment', 'Privacy/doxxing concern', 'Academic integrity concern']
  const report: Report = {
    id: generateId('report'),
    targetType: input.targetType,
    targetId: input.targetId,
    reason: input.reason,
    details: input.details,
    createdAt: 'Just now',
    status: highPriority.includes(input.reason) ? 'ai_flagged' : 'queued_for_review',
  }
  reports.push(report)
  return mockDelay(report, 500)
}
