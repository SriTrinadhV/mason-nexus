import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { signup } from '../services/authService'
import { useApp } from '../context/AppContext'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signIn } = useApp()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await signup(email, password)
    setLoading(false)
    if (result.success) {
      signIn()
      navigate('/onboarding')
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f8f6] px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-mason-green-600 text-sm font-bold text-white">
            M
          </div>
          <span className="font-semibold text-gray-900">Mason Commons</span>
        </Link>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="mb-1 text-xl font-semibold text-gray-900">Create your account</h1>
          <p className="mb-5 text-sm text-gray-500">Sign up with your GMU email to get started.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                GMU email
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="yourname@masonlive.gmu.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="focus-ring w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="focus-ring w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="focus-ring w-full rounded-lg bg-mason-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-mason-green-700 disabled:opacity-60"
            >
              {loading ? 'Verifying GMU email…' : 'Create account'}
            </button>
          </form>

          <div className="mt-4 flex items-start gap-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
            <ShieldCheck size={15} className="mt-0.5 shrink-0 text-gray-400" />
            <span>GMU email verification is simulated for this prototype — any @gmu.edu or @masonlive.gmu.edu address is accepted.</span>
          </div>
        </div>
        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-mason-green-700 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
