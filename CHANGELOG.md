# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.1.0] - 2026-07-17

## [1.0.0] - 2026-07-16

### Added
- Initial project scaffold: Next.js App Router, Prisma schema, layered
  server architecture (domain / repositories / services / notifiers).
- Error ingestion endpoint with fingerprint-based grouping.
- API key generation and hashing.
- In-memory rate limiting on the ingestion endpoint.
- User authentication (signup/login) with NextAuth credentials provider.
- Project creation flow with API key generation.
- Error dashboard with search, status/severity filters, URL-synced state, and cursor pagination.
- Error detail view showing individual occurrences with expandable stack traces and cursor pagination.
- Resolve/ignore/reopen status actions on error dashboard and detail view with optimistic UI, RBAC enforcement, and toast notifications.
- Project overview page with 14-day error volume chart and top-5 error groups list.
- Team management page with role-based invite, role change, and member removal, enforcing RBAC server-side.
- Landing page redesign with animated terminal mockup and light/dark theme support.
- Login/signup page redesign matching the landing page design system.
- Dashboard shell with sidebar navigation, command palette, and user profile settings.
- Email notifications via Brevo for critical errors and team invites.
- Slack webhook notification channel for critical errors and team invitations using a composite notifier.
- Complete Docker build configuration (`Dockerfile` and `docker-compose.yml`) for development and production environments.
- CI/CD workflow (`ci.yml`) for automated linting, typechecking, testing, and Docker image build validation.
- Saved search views in the errors dashboard, allowing custom filters to be saved, applied, and deleted.