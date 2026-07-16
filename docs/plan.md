\# ErrorNest — plan.md



> A lightweight error-monitoring platform (Sentry-style). Apps send errors to

> ErrorNest via an API key; ErrorNest groups, stores, and visualizes them per

> project, with role-based team access.



Timebox: 7 days. Stack: Next.js (App Router) + TypeScript (strict) +

PostgreSQL + Prisma + Tailwind + Auth.js + Vercel.



\---



\## 1. User Stories



\- As a \*\*new user\*\*, I can sign up, verify my email, and log in.

\- As a \*\*project owner\*\*, I can create a project and get a unique ingestion

&#x20; API key for it.

\- As \*\*any client app\*\*, I can `POST` an error payload to the ingestion

&#x20; endpoint using that API key.

\- As a \*\*team member\*\*, I can be invited to a project with a role

&#x20; (owner / admin / member / viewer) that controls what I can do.

\- As a \*\*dashboard user\*\*, I can see:

&#x20; - error volume over time (chart)

&#x20; - a list of error groups, sorted by most recent / most frequent

&#x20; - a detail view of one error group showing all individual occurrences

\- As a \*\*dashboard user\*\*, I can search/filter errors by project, status

&#x20; (open/resolved/ignored), severity, and date range.

\- As an \*\*admin/owner\*\*, I can mark an error resolved/ignored, and manage

&#x20; team members' roles.

\- As an \*\*owner\*\*, I get an email when a new \*critical\* error group is

&#x20; first created.



\## 2. Core Entities \& Data Shapes



```

User            id, email, passwordHash, name, emailVerifiedAt, createdAt

Project         id, name, slug, ownerId, createdAt

ApiKey          id, projectId, key (hashed), createdAt, revokedAt?

ProjectMember   id, projectId, userId, role (OWNER|ADMIN|MEMBER|VIEWER)

ErrorGroup      id, projectId, fingerprint (hash), title, firstSeenAt,

&#x20;               lastSeenAt, occurrenceCount, status (OPEN|RESOLVED|IGNORED),

&#x20;               severity (INFO|WARNING|ERROR|CRITICAL)

ErrorEvent      id, errorGroupId, message, stackTrace, browser, url,

&#x20;               userContext (json), createdAt

Notification    id, projectId, errorGroupId, channel (EMAIL), sentAt

```



\*\*Fingerprinting rule (grouping logic):\*\* hash of `(project, error message

normalized, top stack frame)` → same hash = same `ErrorGroup`, just

increments `occurrenceCount` and appends an `ErrorEvent`.



\### Edge cases to design for

\- Same error fingerprint arriving in a burst (100 events/sec) — don't do

&#x20; 100 separate writes to `ErrorGroup`; batch-increment.

\- Ingestion with an invalid/revoked API key → 401, don't leak which part

&#x20; failed.

\- Stack trace missing (some errors won't have one) → still group by message.

\- A project with zero errors yet → explicit empty state with "send your

&#x20; first error" instructions + copyable curl example.

\- Deleting a project → cascade-delete its errors/events, but require

&#x20; explicit confirmation typing the project name.



\---



\## 3. Architecture — where SOLID actually shows up



Don't just apply SOLID as a buzzword — apply it where it earns its keep:

\*\*business logic (services) separated from data access (repositories)

separated from delivery (API routes/server actions).\*\* This is what a

reviewer means by "clear module boundaries."



```

src/

├── app/                        # routes only — thin, no business logic

│   ├── api/errors/ingest/route.ts

│   ├── (dashboard)/projects/\[id]/page.tsx

│   └── ...

├── server/

│   ├── domain/                 # pure types \& interfaces (no framework code)

│   │   ├── entities.ts         # ErrorGroup, ErrorEvent, Project types

│   │   └── repositories.ts     # IErrorRepository, IProjectRepository (interfaces)

│   ├── repositories/           # Prisma implementations of the interfaces

│   │   ├── prisma-error.repository.ts

│   │   └── prisma-project.repository.ts

│   ├── services/                # business logic, depends on interfaces only

│   │   ├── ingestion.service.ts    # dedupe + fingerprint + persist

│   │   ├── grouping.service.ts     # fingerprint algorithm (swappable)

│   │   ├── notification.service.ts # depends on INotifier interface

│   │   └── auth.service.ts

│   ├── notifiers/               # strategy pattern for alert channels

│   │   ├── email.notifier.ts    # implements INotifier

│   │   └── (future) slack.notifier.ts

│   └── lib/                     # db client, auth config, env validation

└── components/

```



\*\*How each SOLID principle maps to this:\*\*



\- \*\*S — Single Responsibility.\*\* `ingestion.service.ts` only decides \*what

&#x20; to store\*; `grouping.service.ts` only decides \*how to fingerprint\*;

&#x20; `prisma-error.repository.ts` only knows \*how to talk to Postgres\*. Each

&#x20; file has one reason to change.

\- \*\*O — Open/Closed.\*\* `notification.service.ts` depends on an `INotifier`

&#x20; interface. Adding Slack alerts later = add `slack.notifier.ts`, zero

&#x20; changes to existing code.

\- \*\*L — Liskov Substitution.\*\* Any class implementing `IErrorRepository`

&#x20; (Prisma today, maybe a test in-memory repo tomorrow) must be swappable

&#x20; without breaking `ingestion.service.ts`. This is also what makes the

&#x20; service layer unit-testable without a real database.

\- \*\*I — Interface Segregation.\*\* Don't have one giant `IRepository`. Split

&#x20; `IErrorRepository`, `IProjectRepository`, `IUserRepository` — a service

&#x20; only depends on the slice it actually needs.

\- \*\*D — Dependency Inversion.\*\* Services take repositories/notifiers as

&#x20; constructor params (interfaces), not concrete Prisma imports. Wire the

&#x20; concrete implementations once, at the route/server-action boundary

&#x20; (poor-man's DI — no need for a DI framework at this scale).



This structure is also \*why\* it scales well later: swapping Postgres

partitioning, adding a queue, or adding Redis caching only touches the

`repositories/` layer — services and routes don't change.



\---



\## 4. Scalability notes (design for it, don't over-build it now)



\- \*\*Indexes:\*\* composite index on `(projectId, fingerprint)` for grouping

&#x20; lookups; index on `(projectId, status, lastSeenAt)` for the dashboard

&#x20; list query.

\- \*\*Pagination:\*\* cursor-based on `ErrorEvent`/`ErrorGroup` lists (not

&#x20; offset) — offset degrades past \~10k rows per the handbook's own guidance.

\- \*\*Ingestion writes:\*\* keep the ingestion service's `persist()` method

&#x20; behind the `IErrorRepository` interface \*now\*, so if volume ever needs a

&#x20; queue (BullMQ+Redis) later, you swap the implementation, not the caller.

&#x20; Don't build the queue this week — just don't paint yourself into a

&#x20; corner.

\- \*\*Read/write split conceptually:\*\* dashboard reads are aggregate-heavy

&#x20; (counts, trends) — consider a lightweight materialized `dailyCount`

&#x20; rollup table updated on write, so charts don't scan raw events.

\- \*\*Rate limiting:\*\* token-bucket on the ingestion endpoint per API key,

&#x20; in-memory Map is fine for this scale (documented as a "swap for Redis at

&#x20; scale" comment).



\---



\## 5. API / Server Actions Surface



| Action | Method | Auth | Notes |

|---|---|---|---|

| Ingest error | POST `/api/errors/ingest` | API key header | public-facing, rate-limited |

| List projects | server action | session | scoped to membership |

| Create project | server action | session | generates API key |

| List error groups | server action | session + role | filters: status, severity, date |

| Get error group detail | server action | session + role | includes paginated events |

| Resolve/ignore error | server action | session + role >= MEMBER | |

| Invite member | server action | session + role >= ADMIN | |

| Update member role | server action | session + role == OWNER | |



\---



\## 6. Day-by-Day Plan (7 days, intense)



| Day | Deliverable |

|---|---|

| \*\*1\*\* | Repo + CI skeleton, deploy hello-world to Vercel. Prisma schema (section 2) + migration. Domain interfaces (`IErrorRepository`, `IProjectRepository`). Auth.js wired (signup/login/email verify). |

| \*\*2\*\* | Project CRUD (create project → generate API key). `prisma-project.repository.ts` + `project.service.ts`. Dashboard shell + nav (empty states designed first). |

| \*\*3\*\* | Ingestion endpoint: API key validation → `grouping.service.ts` (fingerprinting) → `ingestion.service.ts` → `prisma-error.repository.ts`. Write a seed/simulate script to fire fake errors for demo data. |

| \*\*4\*\* | Error list view: search/filter/sort/cursor-pagination, all 4 states (loading/empty/error/success). Error detail view with occurrence list. |

| \*\*5\*\* | Dashboard charts (volume over time, top groups) with Recharts. Resolve/ignore actions with optimistic UI + toast. |

| \*\*6\*\* | RBAC (ProjectMember roles enforced server-side in every action), team invite flow. Email notification on new critical error (`email.notifier.ts` implementing `INotifier`). Design polish pass (spacing/contrast/focus states). |

| \*\*7\*\* | SEO (meta/OG/sitemap/robots), mobile responsiveness + a11y pass, README + `docs/architecture.md` (explain the SOLID layering), CHANGELOG, LICENSE, record Loom demo, write case study, final QA, submit. |



\---



\## 7. Open Questions / Assumptions



\- Ingestion payload shape: assume `{ message, stackTrace?, severity?, url?,

&#x20; browser?, userContext? }` — confirm/adjust once you pick a "client SDK"

&#x20; stub format.

\- No real client apps will send errors — a seed script simulating realistic

&#x20; bursts is enough for the demo and grading.

\- Email via Brevo (formerly Sendinblue); swap-friendly since it's behind

&#x20; `INotifier`.

