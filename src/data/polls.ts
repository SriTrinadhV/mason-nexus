import type { Poll } from '../types'

// A single active campus question, prototype-style — real production would
// likely rotate these weekly from a backend. One honest, working poll beats
// a fake rotation system for a prototype.
export const activePoll: Poll = {
  id: 'poll-study-spot',
  question: 'Which study spot actually gets you focused?',
  options: [
    { id: 'fenwick', label: 'Fenwick Library' },
    { id: 'johnson-center', label: 'Johnson Center' },
    { id: 'my-room', label: 'My room/apartment' },
    { id: 'off-campus', label: 'A coffee shop off campus' },
  ],
}

// Starting vote counts, representing other mock students' activity so the
// poll doesn't launch empty. This is demo data, not a real tally — the UI
// says so explicitly.
export const initialPollVotes: Record<string, number> = {
  fenwick: 38,
  'johnson-center': 21,
  'my-room': 15,
  'off-campus': 9,
}
