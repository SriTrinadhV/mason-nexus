import { supabase } from './supabaseClient'

/**
 * Real authentication via Supabase Auth. The GMU-domain check is enforced
 * server-side too (see enforce_gmu_email() in supabase/schema.sql) — this
 * client-side check only produces a faster, friendlier error message.
 *
 * Honest scope: this restricts signup to the gmu.edu/masonlive.gmu.edu email
 * domain. It does NOT perform real institutional SSO verification — there is
 * no access to GMU's identity systems in this project. "Verified" elsewhere
 * in the UI means "signed up with a GMU-domain email," nothing stronger.
 */

export interface AuthResult {
  success: boolean
  message: string
}

const GMU_EMAIL = /^[^@]+@(gmu\.edu|masonlive\.gmu\.edu)$/i

function friendlyError(message: string): string {
  if (/already registered/i.test(message)) return 'An account with this email already exists — try logging in instead.'
  if (/invalid login credentials/i.test(message)) return 'Incorrect email or password.'
  if (/gmu email/i.test(message)) return 'Use a GMU email address (@gmu.edu or @masonlive.gmu.edu) to sign up.'
  if (/password/i.test(message)) return message
  return message
}

export async function signup(name: string, email: string, password: string): Promise<AuthResult> {
  const trimmedEmail = email.trim()
  if (!name.trim()) return { success: false, message: 'Enter your name.' }
  if (!GMU_EMAIL.test(trimmedEmail)) {
    return { success: false, message: 'Use a GMU email address (@gmu.edu or @masonlive.gmu.edu) to sign up.' }
  }
  const { data, error } = await supabase.auth.signUp({
    email: trimmedEmail,
    password,
    options: { data: { full_name: name.trim() } },
  })
  if (error) return { success: false, message: friendlyError(error.message) }
  if (!data.session) {
    return {
      success: false,
      message: 'Account created — check your email to confirm it before logging in.',
    }
  }
  return { success: true, message: 'GMU email verified (domain check).' }
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const trimmedEmail = email.trim()
  if (!trimmedEmail) return { success: false, message: 'Enter your GMU email to continue.' }
  const { error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password })
  if (error) return { success: false, message: friendlyError(error.message) }
  return { success: true, message: 'Welcome back!' }
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut()
}
