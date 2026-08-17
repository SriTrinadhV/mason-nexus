import { mockDelay } from './mockDelay'

/**
 * MOCKED — no real authentication infrastructure.
 * Simulates GMU email verification and account creation for prototype purposes only.
 * A production version would replace this with real GMU SSO / email verification.
 */

export interface MockAuthResult {
  success: boolean
  message: string
}

export function login(email: string, _password: string): Promise<MockAuthResult> {
  const isGmuEmail = /@(gmu\.edu|masonlive\.gmu\.edu)$/i.test(email.trim())
  if (!email.trim()) {
    return mockDelay({ success: false, message: 'Enter your GMU email to continue.' }, 300)
  }
  if (!isGmuEmail) {
    return mockDelay(
      { success: false, message: 'This prototype simulates GMU email verification — use an @gmu.edu or @masonlive.gmu.edu address.' },
      500,
    )
  }
  return mockDelay({ success: true, message: 'Welcome back!' }, 600)
}

export function signup(email: string, _password: string): Promise<MockAuthResult> {
  const isGmuEmail = /@(gmu\.edu|masonlive\.gmu\.edu)$/i.test(email.trim())
  if (!isGmuEmail) {
    return mockDelay(
      { success: false, message: 'This prototype simulates GMU email verification — use an @gmu.edu or @masonlive.gmu.edu address.' },
      500,
    )
  }
  return mockDelay({ success: true, message: 'GMU identity verified (simulated).' }, 800)
}
