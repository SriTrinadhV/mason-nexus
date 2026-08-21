import { supabase } from './supabaseClient'
import type { ReportReason } from '../types'

export interface Report {
  id: string
  targetType: 'post' | 'comment' | 'student' | 'community'
  targetId: string
  reason: ReportReason
  details?: string
  createdAt: string
  status: 'queued_for_review' | 'ai_flagged' | 'resolved'
}

/**
 * Reports are written straight to the database (reports table, RLS-gated to
 * the reporter's own rows — see supabase/schema.sql). The high-priority /
 * auto-flag classification is decided server-side by a trigger
 * (set_report_status), not by this client code, so it can't be spoofed by
 * sending a different status directly.
 */
export async function submitReport(input: {
  targetType: Report['targetType']
  targetId: string
  reason: ReportReason
  details?: string
}): Promise<Report> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('reports')
    .insert({ reporter_id: user.id, target_type: input.targetType, target_id: input.targetId, reason: input.reason, details: input.details })
    .select('*')
    .single()
  if (error) throw error

  return {
    id: data.id,
    targetType: data.target_type,
    targetId: data.target_id,
    reason: data.reason,
    details: data.details ?? undefined,
    createdAt: 'Just now',
    status: data.status,
  }
}
