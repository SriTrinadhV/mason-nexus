import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    'Missing Supabase environment variables. Copy .env.example to .env and fill in your project URL and anon key.',
  )
}

// Not parameterized with the generated Database type: this project hand-
// authors its own Student/Community/Post/... types (src/types/index.ts) as
// the real contract every component relies on, and every query result is
// mapped into those shapes in services/dataStore.ts. A generic Database type
// would only add strictness to the raw row shape in between, which isn't
// where this codebase's type safety guarantees actually live.
export const supabase = createClient(url, anonKey)
