# India Sports Club Discovery Portal — TODO

## Phase 1: Schema & Theme
- [x] Design system: color tokens, typography, global CSS (saffron/teal palette)
- [x] Database schema: clubs, sessions, events, claims, reviews, analyticsEvents tables
- [x] Run db:push migration

## Phase 2: Backend / tRPC Routers
- [x] clubs router: list, get, search/filter, submit, update, approve, reject, adminList, adminStats
- [x] sessions router: list by club, create, update, delete
- [x] events router: list upcoming, create, update, delete
- [x] claims router: submit claim, approve claim, reject claim, list pending, myClaims
- [x] reviews router: list by club, create review, delete review
- [x] analytics router: track page views, outbound clicks, search events, summary

## Phase 3: Core UI Components
- [x] Global layout with navbar and footer
- [x] ClubCard component with verified badge, sport chip, pricing tag
- [x] FilterPanel (city, sport, beginner-friendly, pricing, verified) with debounced search
- [x] LoadingSkeleton components (ClubCardSkeleton, ClubGridSkeleton)
- [x] EmptyState component
- [x] Pagination component

## Phase 4: Public Discovery Pages
- [x] Homepage: hero, stats, featured clubs, city grid, sport categories
- [x] /explore — full directory with search + filters + pagination
- [x] /india/:city — city landing page
- [x] /india/:city/:sportSlug — SEO-friendly sport-in-city listing

## Phase 5: Club Profile Page
- [x] /clubs/:slug — full club profile page
- [x] Map integration (Google Maps via Manus proxy)
- [x] Weekly schedule display
- [x] Upcoming events list
- [x] Reviews section with star ratings
- [x] Instagram / WhatsApp contact links with analytics tracking

## Phase 6: Auth Flows
- [x] Login via Manus OAuth (email/password + magic link)
- [x] Protected route wrapper (redirects to login)
- [x] User profile menu in navbar

## Phase 7: Club Admin Workflow
- [x] /submit — club submission form (multi-step)
- [x] /clubs/:slug/claim — claim club flow with proof text
- [x] /my-clubs — manage owned clubs dashboard
- [x] /my-clubs/:id/edit — edit club details, sessions, events (tabbed)

## Phase 8: Admin / Moderator Dashboard
- [x] /admin — dashboard overview with stats (pending, approved, rejected)
- [x] Pending submissions list with approve/reject actions
- [x] Pending claims list with approve/reject actions
- [x] All clubs management table with verified badge toggle
- [x] Analytics summary panel

## Phase 9: Seed, Analytics & Tests
- [x] Seed script (scripts/seed.ts) with 10 example clubs across cities/sports
- [x] 14 weekly sessions seeded
- [x] 5 upcoming events seeded
- [x] Analytics: page view tracking hook (useAnalytics)
- [x] Analytics: outbound click tracking (Instagram/WhatsApp)
- [x] Vitest: 30 tests across auth, clubs, events, analytics, claims, reviews — all passing

## Phase 10: Final Polish
- [ ] README with setup guide and env vars
- [x] Error boundaries and 404 page
- [x] All routes wired in App.tsx
- [x] Final checkpoint


## Rebranding to TreadGram (Black + Purple-Blue Gradient)
- [x] Update CSS design tokens: black background, purple-blue gradient accents
- [x] Update app name to TreadGram in Navbar, Footer, and metadata
- [x] Update logo/branding colors (gradient from primary to accent)
- [x] Verify all pages render correctly with new theme
- [x] All 30 tests passing with new branding


## Updates: Sports List, Homepage Layout, and Chennai Clubs
- [x] Remove swimming, football, cricket from sports list; add badminton and pickleball
- [x] Update homepage: make 'browse by city' smaller, remove 'browse by sport' section
- [x] Rename 'upcoming events' to 'nearest to you' with Chennai city mention
- [x] Add 9 Chennai running clubs with events to database (Cloka, Pace and Blaze, Vamos, Voko, Styd, Batclub, Project Vanta, Vault Club, Fitrx)
- [x] All 30 tests passing
