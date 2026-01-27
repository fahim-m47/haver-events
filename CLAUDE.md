# CLAUDE.md

## Project Overview
HaverEvents is a centralized campus events platform for Haverford College, serving ~1,500 students. Users can browse, post, save, and share campus events. Replaces scattered email communications with centralized event discovery.

## Architecture Overview

**Tech stack:** Next.js 14+ (App Router), Supabase, Tailwind CSS, shadcn/ui, Vercel

```
haver_events/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Auth routes (login, callback)
│   ├── (main)/             # Main app routes
│   └── api/                # API routes if needed
├── components/
│   ├── ui/                 # shadcn/ui base components
│   ├── events/             # Event-related components
│   ├── blasts/             # Blast-related components
│   └── layout/             # Layout components
├── lib/
│   └── supabase/           # Supabase clients (browser, server, admin)
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
├── actions/                # Server Actions
└── docs/                   # Project documentation
```

### Database Schema
- **users**: id, email, name, avatar_url, is_verified_host, created_at
- **events**: id, creator_id, title, description, location, start_time, end_time, image_url, link, created_at, updated_at
- **favorites**: id, user_id, event_id, created_at (unique constraint on user_id + event_id)
- **blasts**: id, event_id, creator_id, content, created_at

See `docs/architecture.md` for full schema, RLS policies, and system diagrams.

### Authentication
- Google OAuth via Supabase
- Restricted to @haverford.edu emails only
- Public access: browsing events, viewing details
- Auth required: posting events, saving events, sending blasts

## Design Style Guide

**Tech stack:** Next.js (App Router), Tailwind CSS, shadcn/ui

**Visual style:**
- Clean, minimal interface - dark theme (black/red Haverford colors)
- Use shadcn components for consistency
- Responsive design (mobile-first)
- No light mode for MVP

**Component patterns:**
- shadcn/ui for all interactive elements (buttons, inputs, cards)
- Tailwind for layout and spacing
- Keep components focused and small

## Product & UX Guidelines

**Core UX principles:**
- Speed over perfection - get events discovered fast
- No auth gate for browsing - sign in only when saving/posting
- One-click favorite - easy to save events
- Host blasts replace email updates

**Copy tone:**
- Casual, friendly, student-focused
- Brief labels and instructions
- Helpful error messages that suggest next steps

## Constraints & Policies

**Security - MUST follow:**
- NEVER expose Supabase keys to the client - server-side only
- ALWAYS use environment variables for secrets
- NEVER commit `.env.local` or any file with API keys
- Validate and sanitize all user input
- Implement RLS on ALL Supabase tables

**Code quality:**
- TypeScript strict mode
- Run `npm run lint` before committing
- No `any` types without justification

**Dependencies:**
- Prefer shadcn components over adding new UI libraries
- Minimize external dependencies for MVP

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Run development server
npm run build        # Build for production
npm run lint         # Run linter
npm run type-check   # Type check
```

### Documentation Guidelines
- [Project Specification](docs/HaverEvents_PRD.md) - Full requirements, API specs, tech details
- [Architecture](docs/architecture.md) - System design and data flow
- [Changelog](docs/changelog.md) - Version history
- [Project Status](docs/project_status.md) - Current progress
- Update items in docs folder after major milestones and major additions to the project
