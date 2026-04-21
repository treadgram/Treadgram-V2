# India Sports Club Discovery Portal

A production-ready web portal for discovering running clubs and other sports clubs across India. Users can browse by city and sport, view club profiles with maps and schedules, submit new clubs, claim ownership, and attend events.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React 19)                        │
│  ┌─────────┐  ┌──────────┐  ┌────────────┐  ┌──────────────┐  │
│  │  Pages  │  │Components│  │ tRPC hooks │  │ useAnalytics │  │
│  │ Home    │  │ ClubCard │  │ trpc.*     │  │ page views   │  │
│  │ Explore │  │ Filter   │  │ useQuery   │  │ outbound     │  │
│  │ Profile │  │ Skeleton │  │ useMutation│  │ click track  │  │
│  │ Admin   │  │ Navbar   │  └────────────┘  └──────────────┘  │
│  └─────────┘  └──────────┘                                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │ tRPC over HTTP /api/trpc
┌───────────────────────────▼─────────────────────────────────────┐
│                     SERVER (Express + tRPC)                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    tRPC Routers                          │  │
│  │  clubs · sessions · events · claims · reviews · analytics│  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Middleware / Procedures                     │  │
│  │  publicProcedure · protectedProcedure · adminProcedure   │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   db.ts Query Helpers                    │  │
│  │  listClubs · getClubBySlug · createClub · approveClub    │  │
│  │  listSessions · createSession · listUpcomingEvents       │  │
│  │  submitClaim · approveClaim · createReview               │  │
│  │  trackAnalyticsEvent · getAnalyticsSummary               │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │ Drizzle ORM
┌───────────────────────────▼─────────────────────────────────────┐
│                    DATABASE (MySQL / TiDB)                      │
│  users · clubs · sessions · events · claims · reviews          │
│  analyticsEvents                                               │
└─────────────────────────────────────────────────────────────────┘
                            │ Google Maps Proxy
┌───────────────────────────▼─────────────────────────────────────┐
│              Maps (Manus Google Maps Proxy)                     │
│  MapView component · Geocoding · Places · Directions            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### `clubs`
| Column | Type | Description |
|---|---|---|
| id | int PK | Auto-increment primary key |
| slug | varchar(255) UNIQUE | URL-safe identifier (e.g. `chennai-runners`) |
| name | varchar(255) | Club display name |
| city | varchar(64) | City key (e.g. `chennai`) |
| cityLabel | varchar(64) | Display label (e.g. `Chennai`) |
| sport | varchar(64) | Sport key (e.g. `running`) |
| sportLabel | varchar(64) | Display label (e.g. `Running`) |
| description | text | Full description (markdown) |
| shortDescription | varchar(512) | One-line summary for cards |
| status | enum | `pending` / `approved` / `rejected` |
| verified | boolean | Moderator-verified badge |
| beginnerFriendly | boolean | Welcoming to beginners |
| pricingType | enum | `free` / `paid` / `donation` |
| monthlyFeeInr | int | Monthly fee in INR (if paid) |
| lat / lng | decimal | GPS coordinates |
| address | varchar(512) | Street address |
| instagramUrl | varchar(512) | Instagram profile URL |
| whatsappUrl | varchar(512) | WhatsApp group invite URL |
| websiteUrl | varchar(512) | External website |
| submittedBy | int FK→users | User who submitted |
| ownedBy | int FK→users | Verified club owner |
| avgRating | decimal | Computed average rating |
| reviewCount | int | Number of reviews |
| viewCount | int | Profile page views |

### `sessions`
Weekly recurring training sessions for a club.

| Column | Type | Description |
|---|---|---|
| id | int PK | |
| clubId | int FK→clubs | Parent club |
| dayOfWeek | int | 0=Sunday … 6=Saturday |
| startTime | varchar(5) | HH:MM format |
| endTime | varchar(5) | HH:MM format |
| locationName | varchar(255) | Venue name |
| lat / lng | decimal | Session-specific GPS |
| notes | text | Additional notes |

### `events`
One-off events and open sessions.

| Column | Type | Description |
|---|---|---|
| id | int PK | |
| clubId | int FK→clubs | Parent club |
| title | varchar(255) | Event title |
| description | text | Full description |
| datetimeUtc | datetime | Event datetime in UTC |
| isOpen | boolean | Open to non-members |
| locationName | varchar(255) | Venue name |
| registrationUrl | varchar(512) | External registration link |
| maxParticipants | int | Capacity limit |

### `claims`
Club ownership claims submitted by users.

| Column | Type | Description |
|---|---|---|
| id | int PK | |
| clubId | int FK→clubs | Club being claimed |
| userId | int FK→users | Claimant |
| status | enum | `pending` / `approved` / `rejected` |
| proofText | text | Written proof of ownership |
| moderatorNote | text | Admin decision note |

### `reviews`
User reviews and ratings for clubs.

| Column | Type | Description |
|---|---|---|
| id | int PK | |
| clubId | int FK→clubs | Reviewed club |
| userId | int FK→users | Reviewer |
| rating | int | 1–5 stars |
| comment | text | Review text |

### `analyticsEvents`
Lightweight analytics tracking.

| Column | Type | Description |
|---|---|---|
| id | int PK | |
| eventType | enum | `page_view` / `outbound_click` / `search` |
| path | varchar(512) | URL path or search query |
| target | varchar(64) | Link target (instagram, whatsapp) |
| clubId | int FK→clubs | Associated club (optional) |
| userId | int FK→users | Authenticated user (optional) |
| sessionId | varchar(64) | Anonymous session ID |

---

## Security Model

Access control is enforced at the tRPC procedure layer:

| Procedure Type | Access |
|---|---|
| `publicProcedure` | Anyone, no auth required |
| `protectedProcedure` | Authenticated users only (throws `UNAUTHORIZED`) |
| `adminProcedure` | Users with `role = 'admin'` or `role = 'moderator'` (throws `FORBIDDEN`) |

Additional business-logic guards:
- Club updates: only the `ownedBy` user or an admin can update club details
- Claim approval: only admins can approve/reject claims
- Review deletion: only the review author or an admin can delete a review
- Verified badge: only admins can toggle the verified status

---

## URL Structure

| Route | Description |
|---|---|
| `/` | Homepage with featured clubs and city/sport grid |
| `/explore` | Full directory with search and filters |
| `/india/:city` | City landing page (e.g. `/india/chennai`) |
| `/india/:city/:sportSlug` | Sport-in-city listing (e.g. `/india/chennai/running-clubs`) |
| `/clubs/:slug` | Club profile page (e.g. `/clubs/chennai-runners`) |
| `/events` | Upcoming open events across all clubs |
| `/submit` | Club submission form (auth required) |
| `/clubs/:slug/claim` | Claim club ownership (auth required) |
| `/my-clubs` | Club owner dashboard (auth required) |
| `/my-clubs/:id/edit` | Edit club details (auth + ownership required) |
| `/admin` | Admin/moderator dashboard (admin role required) |

---

## Local Setup

### Prerequisites
- Node.js 22+
- pnpm 10+
- MySQL 8+ or TiDB Cloud account

### 1. Clone and install

```bash
git clone <repo-url>
cd india-sports-clubs
pnpm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | MySQL connection string: `mysql://user:pass@host:3306/dbname` |
| `JWT_SECRET` | Random secret for session cookie signing (min 32 chars) |
| `VITE_APP_ID` | Manus OAuth application ID |
| `OAUTH_SERVER_URL` | Manus OAuth backend base URL |
| `VITE_OAUTH_PORTAL_URL` | Manus login portal URL |
| `OWNER_OPEN_ID` | Owner's Manus OpenID (gets auto-promoted to admin) |
| `OWNER_NAME` | Owner's display name |
| `BUILT_IN_FORGE_API_URL` | Manus built-in APIs URL (server-side) |
| `BUILT_IN_FORGE_API_KEY` | Manus built-in APIs bearer token (server-side) |
| `VITE_FRONTEND_FORGE_API_URL` | Manus built-in APIs URL (frontend) |
| `VITE_FRONTEND_FORGE_API_KEY` | Manus built-in APIs bearer token (frontend) |

### 3. Run database migrations

```bash
pnpm db:push
```

### 4. Seed example data

```bash
npx tsx scripts/seed.ts
```

This inserts 10 sports clubs across 10 Indian cities, 14 weekly sessions, and 5 upcoming events.

### 5. Start development server

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`.

### 6. Run tests

```bash
pnpm test
```

30 tests across auth, clubs, events, analytics, claims, and reviews.

---

## Making a User an Admin

To promote a user to admin or moderator, update their role directly in the database:

```sql
-- Promote to admin (full access)
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';

-- Promote to moderator (same as admin for club moderation)
UPDATE users SET role = 'moderator' WHERE email = 'moderator@email.com';
```

Alternatively, the `OWNER_OPEN_ID` environment variable automatically promotes the owner to admin on first login.

---

## Project Structure

```
india-sports-clubs/
├── client/
│   └── src/
│       ├── components/
│       │   ├── clubs/
│       │   │   ├── ClubCard.tsx          # Club listing card
│       │   │   ├── ClubCardSkeleton.tsx  # Loading skeleton
│       │   │   ├── EmptyState.tsx        # No-results state
│       │   │   ├── FilterPanel.tsx       # Search + filter UI
│       │   │   └── Pagination.tsx        # Page navigation
│       │   ├── Navbar.tsx                # Top navigation
│       │   └── Footer.tsx                # Site footer
│       ├── hooks/
│       │   └── useAnalytics.ts           # Page view + click tracking
│       ├── pages/
│       │   ├── Home.tsx                  # Landing page
│       │   ├── Explore.tsx               # Full club directory
│       │   ├── CityPage.tsx              # /india/:city
│       │   ├── SportCityPage.tsx         # /india/:city/:sportSlug
│       │   ├── ClubProfile.tsx           # /clubs/:slug
│       │   ├── Events.tsx                # Upcoming events
│       │   ├── SubmitClub.tsx            # Club submission form
│       │   ├── ClaimClub.tsx             # Claim ownership
│       │   ├── MyClubs.tsx               # Owner dashboard
│       │   ├── EditClub.tsx              # Edit club (tabbed)
│       │   └── AdminDashboard.tsx        # Admin panel
│       └── App.tsx                       # Routes + layout
├── drizzle/
│   └── schema.ts                         # All table definitions
├── scripts/
│   └── seed.ts                           # Seed 10 example clubs
├── server/
│   ├── db.ts                             # All query helpers
│   ├── routers.ts                        # Root tRPC router
│   ├── routers/
│   │   ├── clubs.ts                      # Club CRUD + admin
│   │   ├── sessions.ts                   # Weekly sessions
│   │   ├── events.ts                     # One-off events
│   │   ├── claims.ts                     # Ownership claims
│   │   ├── reviews.ts                    # User reviews
│   │   └── analytics.ts                  # Event tracking
│   ├── clubs.test.ts                     # 30 vitest tests
│   └── auth.logout.test.ts               # Auth tests
├── shared/
│   └── constants.ts                      # Cities, sports lookup data
└── todo.md                               # Feature tracking
```

---

## Analytics

The portal tracks three event types:

| Event | Trigger | Data |
|---|---|---|
| `page_view` | Every route change | path, referrer, userAgent |
| `outbound_click` | Instagram/WhatsApp link click | target, clubId |
| `search` | Search query submitted | query string |

Analytics are viewable in the Admin Dashboard under the Analytics tab.

---

## Deployment

This project is hosted on Manus with built-in MySQL database. To deploy:

1. Create a checkpoint via the Management UI
2. Click **Publish** in the Management UI header
3. Configure a custom domain in Settings → Domains (optional)

For external deployment (Vercel + PlanetScale), replace `DATABASE_URL` with your PlanetScale connection string and deploy the `server/` directory as a Node.js service.
