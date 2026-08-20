import { Link } from 'react-router-dom'
import { Compass, MessageCircle, Sparkles, Users } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="flex items-center justify-between px-6 py-5 lg:px-12">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-mason-green-600 text-sm font-bold text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            M
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
            Mason Commons
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="focus-ring rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
            Log in
          </Link>
          <Link to="/signup" className="btn-primary px-4 py-2">
            Get Started
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 pb-16 pt-14 text-center lg:pt-20">
        <span className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-mason-gold-50 px-3 py-1 text-xs font-medium text-mason-gold-700 ring-1 ring-inset ring-mason-gold-100">
          <Sparkles size={13} /> Built for George Mason students — prototype
        </span>
        <h1
          className="mb-5 text-4xl font-bold leading-[1.1] tracking-tight text-gray-900 sm:text-6xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Find your people.
          <br className="hidden sm:block" /> Learn together. <span className="text-mason-green-600">Build what comes next.</span>
        </h1>
        <p className="mx-auto mb-9 max-w-2xl text-lg leading-relaxed text-gray-600">
          Discover communities, classmates, collaborators, and opportunities across GMU —
          matched to your classes, interests, and skills.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/signup" className="btn-primary w-full px-6 py-3 text-[15px] sm:w-auto">
            Get Started
          </Link>
          <Link to="/login" className="btn-secondary w-full px-6 py-3 text-[15px] sm:w-auto">
            Explore Communities
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-6 pb-24 sm:grid-cols-3">
        {[
          {
            icon: Users,
            title: 'Communities as the foundation',
            body: 'Class, club, and interest communities — the spaces where GMU life actually happens.',
          },
          {
            icon: Compass,
            title: 'Discovery as the intelligence',
            body: 'Recommendations explain why they\'re relevant — based only on what you choose to share.',
          },
          {
            icon: MessageCircle,
            title: 'Collaboration as the outcome',
            body: 'Turn a shared class or skill into a study group, a project, or a new connection.',
          },
        ].map((f) => (
          <div key={f.title} className="card p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-mason-green-50 text-mason-green-700">
              <f.icon size={19} />
            </div>
            <h3 className="mb-1.5 font-semibold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>
              {f.title}
            </h3>
            <p className="text-sm leading-relaxed text-gray-500">{f.body}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-gray-200 px-6 py-6 text-center text-xs text-gray-400">
        Mason Commons is a rough prototype for evaluating the GMU Student Community Platform concept — not an official GMU product.
      </footer>
    </div>
  )
}
