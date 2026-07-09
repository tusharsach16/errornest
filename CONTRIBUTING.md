# Contributing to ErrorNest

## Local setup

See the [Quick Start](README.md#quick-start) in the README.

## Branching & commits

- Branch per feature: `feat/error-grouping`, `fix/pagination-cursor`.
- Never push directly to `main`.
- Use [Conventional Commits](https://www.conventionalcommits.org/):
  `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- Keep commits small and reviewable — one logical change per commit.

## Before opening a PR

```bash
npm run lint
npm run typecheck
npm run test
```

All three must pass locally (they also run in CI on every push).

## PR description

Explain **what changed and why**, not just what — the reviewer's speed is
capped by how fast they can reconstruct your intent. Link any relevant
issue.

## Code style

- TypeScript strict mode, no `any`.
- Business logic goes in `src/server/services/`, data access in
  `src/server/repositories/` — services depend on the interfaces in
  `src/server/domain/`, never on Prisma directly. See
  [docs/architecture.md](docs/architecture.md) for the reasoning.
