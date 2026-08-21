import { supabase } from './supabaseClient'
import type { AppNotification } from '../types'

/**
 * Notifications are per-user rows in Postgres (RLS: recipient_id = auth.uid()
 * for both select and update — see supabase/schema.sql). They are only ever
 * INSERTed by the SECURITY DEFINER action functions (join_community,
 * express_opportunity_interest) as a side effect of a real event, never by
 * this service directly, so a duplicate/idempotent action can't produce a
 * duplicate notification and a user can never see or mark another user's.
 */
export async function listNotifications(): Promise<AppNotification[]> {
  const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapNotification)
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id)
  if (error) throw error
}

export async function markAllNotificationsRead(): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return
  const { error } = await supabase.from('notifications').update({ read: true }).eq('recipient_id', user.id).eq('read', false)
  if (error) throw error
}

function mapNotification(row: any): AppNotification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    createdAt: formatRelative(row.created_at),
    read: row.read,
    linkTo: row.link_to ?? undefined,
  }
}

function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.round(diffMs / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}
