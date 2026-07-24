# Architecture

## Data model

```
User ──< ProjectMember >── Project ──< ApiKey
  │                            │
  ├──< Account                 ├──< ErrorGroup ──< ErrorEvent
  │                            │
  ├──< Session                 ├──< Notification
  │                            │
  └──< SavedSearch >───────────┘
```

- A `User` can belong to many `Project`s via `ProjectMember` (role: OWNER /
  ADMIN / MEMBER / VIEWER).
- A `Project` has one or more `ApiKey`s (hashed at rest) used by client apps
  to authenticate ingestion requests.
- Incoming errors are grouped into `ErrorGroup`s by a content fingerprint;
  each individual occurrence is an `ErrorEvent` under that group.
- `Notification` records when an alert was sent, to avoid duplicate emails.
- `SavedSearch` stores custom dashboard filters configured by a `User` for a `Project` for quick reuse.
- `Account` links OAuth provider identities (Google, GitHub) to a `User` via the NextAuth Prisma adapter.
- `Session` stores database-backed sessions (required by the adapter, though the app uses JWT strategy).

## Auth & authorization

Sessions are handled by Auth.js (credentials + Google/GitHub OAuth), stored as
JWTs in httpOnly cookies. OAuth providers use the NextAuth Prisma adapter to
persist linked `Account` records; the `User.passwordHash` field is optional so
OAuth-only users can exist without a password. When a user attempts OAuth sign-in
with an email that already has a credentials account, NextAuth returns an
`OAuthAccountNotLinked` error rather than silently merging — this is the secure
default to prevent account takeover via unverified OAuth emails.

Every mutating server action starts by calling
`RbacService.assertRole(projectId, userId, minRole)`, which looks up the
caller's `ProjectMember` role server-side — the client-sent role, if any, is
never trusted. Ingestion requests use a separate auth path: a hashed API
key, checked in the route handler before any service code runs.

## Where things live

| Layer | Location |
|---|---|
| Domain interfaces | `src/server/domain/` |
| Repository implementations | `src/server/repositories/` |
| Business logic (services) | `src/server/services/` |
| Notification channels | `src/server/notifiers/` |
| API routes | `src/app/api/` |
| Dashboard pages | `src/app/(dashboard)/` |
| Auth pages | `src/app/(auth)/` |

## Why the service/repository split

Services (`src/server/services/`) contain business logic and depend only on
repository **interfaces** (`src/server/domain/repositories.ts`), never on
Prisma directly. Concrete Prisma implementations live in
`src/server/repositories/`. This means:

- Services can be unit-tested with in-memory fakes, no database needed.
- Swapping storage (e.g. adding a cache layer, moving a hot table to Redis)
  touches one repository class, not every service that uses it.
- Adding new notification channels (Slack, webhooks) means writing a new
  class that implements `INotifier` — `IngestionService` and
  `notification.service.ts` don't change.

## Trade-offs made for the 7-day timebox

- **Grouping algorithm is intentionally simple** (message normalization +
  top stack frame hash). A production system would also cluster by error
  type across minor message variations — documented as a known limitation,
  not hidden.
- **Rate limiting is in-memory**, fine for a single server instance. The
  `checkRateLimit` function is isolated in `src/lib/rate-limit.ts`
  specifically so it can be swapped for Redis without touching callers.
- **No background job queue.** Email sending happens inline in the request
  path. At higher volume this would move to a queue (BullMQ + Redis) — the
  `INotifier` interface already isolates that change to one file.
