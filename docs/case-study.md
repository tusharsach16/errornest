# Case Study: ErrorNest

## 1. Problem
Developers frequently remain unaware of critical production errors in their web applications until users encounter them and manually file reports or voice complaints. ErrorNest solves this pain point for small-to-medium development teams by providing a lightweight, centralized error-monitoring dashboard. Instead of relying on passive user feedback, it actively ingests, aggregates, and alerts on application errors in real time, enabling immediate developer resolution before the user experience degrades.

## 2. Approach
### Architectural Decisions
To keep modules clean and decoupled within the 7-day timebox, we implemented a SOLID-layered architecture. Concrete implementations in `src/server/repositories/` and `src/server/notifiers/` depend on abstract interfaces in `src/server/domain/`. This decoupling ensures:
- **Testability:** Core services (e.g., `src/server/services/ingestion.service.ts`) are unit-tested with in-memory fakes.
- **Swappability:** Storage or notifier platforms can be swapped by implementing interfaces without changing business logic.

For example, the notification system relies entirely on the `INotifier` interface:
```typescript
export interface INotifier {
  notifyNewCriticalError(project: Project, group: ErrorGroup): Promise<void>;
  notifyMemberInvited(project: Project, email: string, role: string): Promise<void>;
}
```

### Fingerprint-based Grouping
ErrorNest groups occurrences into `ErrorGroup` records using a fingerprint hash of the project, normalized message, and top stack frame. This simple message normalization approach is highly effective but lacks cross-version stack trace clustering, meaning minor variations in transient variables can split identical root-cause errors into separate groups.

### Explicit Timebox Trade-offs
To hit our deadline, we accepted three honest compromises:
- **In-memory Rate Limiting:** Request limits in `src/lib/rate-limit.ts` use an in-memory map. This was acceptable for a single-instance Vercel deployment and is easily swappable for Redis.
- **No Background Job Queue:** Alerts are sent inline in the request path. While slow at scale, it was acceptable for demo volumes. Because notification logic is isolated in `INotifier`, migrating to a queue later will require no service changes.
- **Deferred Email Verification:** We deferred email verification to prioritize core ingestion and RBAC dashboard features.

### AI-Assisted Workflow
We used an AI-assisted workflow with Claude in Antigravity. Adopting a spec-first approach with `docs/plan.md` established a clear contract, while milestone-based iterations kept code validation and integration tests green throughout.

## 3. Result
The completed project, deployed live at **https://errornest.vercel.app**, includes:
- **Authentication & RBAC:** Multi-tenant credential auth and server-enforced role-based access control (Owner, Admin, Member, Viewer) for teams.
- **Error Ingestion & Grouping:** Real-time ingestion endpoint with hashed API keys, in-memory rate-limiting, and fingerprint-based error grouping.
- **Dashboard & Workflows:** Dynamic dashboard with 14-day error volume charts, resolve/ignore workflows using optimistic UI, search filters, and cursor-based pagination.
- **Alerts & Collaboration:** Real-time client polling for team members, transactional email notifications via Brevo, and Slack Webhook notifications for critical errors and invites.

Next, we plan to enforce user email verification and implement automated cleanup of older resolved errors.

## 4. What I Learned
Working with an AI pair programmer at this scale highlighted the value of structured boundaries. Specifying interfaces in `src/server/domain/repositories.ts` before starting code generation kept logic clean and prevented the model from outputting bloated, monolithic files. 

Strict typing also caught structural issues early: Prisma's `JsonValue` return type for the `userContext` column in `schema.prisma` is a union including primitives, which caused compiler errors when assigned to our domain's `Record<string, unknown>` type. We resolved this by explicitly checking the type runtime in `prisma-error.repository.ts`, preventing potential serialization issues.

We also encountered the frustration of silently-invalid Tailwind classes, which fail to compile but don't throw runtime errors, teaching us to stick strictly to standard utilities. Finally, testing the Brevo integration revealed that transactional email delivery depends heavily on matching a verified sender domain in `EMAIL_FROM`, underscoring that third-party integrations require robust runtime error logging even when local unit tests pass.
