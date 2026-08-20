# Mason Nexus

Mason Nexus is a student community platform concept built around the George Mason University ecosystem — a central point where students, communities, study groups, skills, and opportunities come together.

It's a frontend prototype: all data is mocked and held in memory, and authentication is simulated (any `@gmu.edu` or `@masonlive.gmu.edu` email and any password will work). There is no backend, database, or real account system.

## Key features

- **Communities** — class, club, and interest communities with join/leave, member counts, discussions, and posts/comments
- **People discovery** — matches classmates by shared courses, skills, interests, and communities, with a specific, explainable reason for every match (no black-box recommendations)
- **Study groups** — browse, join (with capacity limits), and create study groups tied to specific courses
- **Opportunities** — peer collaboration requests students can post and express interest in
- **Search** — a single search across communities, people, posts, study groups, and opportunities, with course-code-aware ranking and accent-insensitive matching
- **Notifications** — a session-reactive activity feed for actions like joining a community or expressing interest in an opportunity
- **Privacy controls** — a discoverability toggle that excludes a student from People discovery, matching, and search when turned off
- **Onboarding** — a guided first-run flow that captures major, year, courses, interests, skills, and goals
- **Responsive UI** — a green-and-white Mason-inspired design system that works down to mobile widths

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for dev server and build
- [React Router](https://reactrouter.com/) (`HashRouter`)
- [Tailwind CSS v4](https://tailwindcss.com/) (CSS-first `@theme` configuration)
- [lucide-react](https://lucide.dev/) for icons
- [oxlint](https://oxc.rs/) for linting

## Running locally

```bash
npm install
npm run dev
```

The dev server starts at `http://localhost:5173` by default.

## Available commands

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Type-check (`tsc -b`) and build for production |
| `npm run lint` | Run oxlint over the project |
| `npm run preview` | Preview the production build locally |

## Status

This is a rough working prototype for evaluating the Mason Nexus concept, not an official George Mason University product. Nothing entered into it is persisted beyond the current browser session.
