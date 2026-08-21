import { supabase } from './supabaseClient'
import type { OnboardingData, Student } from '../types'

/**
 * Writes to the signed-in user's own profiles row. RLS (profiles_update_own
 * in supabase/schema.sql) enforces that this can only ever affect the
 * caller's own row, regardless of what id-like data is passed around
 * client-side — there is no "edit someone else's profile" path here.
 */
export async function completeOnboarding(userId: string, data: OnboardingData): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      major: data.major,
      year: data.year,
      courses: data.courses,
      interests: data.interests,
      skills: data.skills,
      looking_for: data.lookingFor,
      onboarded: true,
    })
    .eq('id', userId)
  if (error) throw error
}

export async function updateProfile(userId: string, partial: Partial<Student>): Promise<void> {
  const patch: Record<string, unknown> = {}
  if (partial.bio !== undefined) patch.bio = partial.bio
  if (partial.interests !== undefined) patch.interests = partial.interests
  if (partial.skills !== undefined) patch.skills = partial.skills
  if (partial.pseudonymous !== undefined) patch.pseudonymous = partial.pseudonymous
  if (partial.displayName !== undefined) patch.display_name = partial.displayName
  if (partial.lookingFor !== undefined) patch.looking_for = partial.lookingFor
  if (partial.discoverable !== undefined) patch.discoverable = partial.discoverable
  if (Object.keys(patch).length === 0) return

  const { error } = await supabase.from('profiles').update(patch).eq('id', userId)
  if (error) throw error
}
