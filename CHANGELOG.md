# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

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


<!--
## [1.0.0] - YYYY-MM-DD
### Added
- Authentication, dashboard, and CRUD for error groups.
### Fixed
- ...
-->