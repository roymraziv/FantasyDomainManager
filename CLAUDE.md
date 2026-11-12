# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# From backend/
dotnet build                                   # build all projects
dotnet run --project Api                       # run the API (https://localhost:5223, Swagger at /swagger)
dotnet ef migrations add <Name> --project Infrastructure --startup-project Api
dotnet ef database update --project Infrastructure --startup-project Api

# From client/
npm ci                                         # install from lockfile
npm run dev                                    # Next.js dev server (http://localhost:3000)
npm run build                                  # production build: the main check before any client PR
npm run lint
```

Never modify migration files or the model snapshot directly. Delete and recreate using the
commands above.

---

## Architecture

### Backend: 3-project .NET 8 solution at `backend/`

- **Core**: entities (`Models/`), DTOs, FluentValidation validators, extensions, and
  interface contracts (`Interfaces/`, `Services/I*.cs`). No EF Core references.
- **Infrastructure**: implements Core interfaces. `DomainDb` (EF Core DbContext, Npgsql),
  migrations, and services (JWT tokens, AWS SES email, email verification, password reset,
  financial calculation, input sanitization, database seeder).
- **Api**: top-level layer. Controllers, DI wiring in `Program.cs`, and
  `LambdaEntryPoint.cs` for AWS Lambda hosting.

Controllers inherit `BaseApiController` and work with `DomainDb` and services directly.
There is no MediatR or repository layer. Follow the existing pattern; don't introduce a new
one inside an unrelated change.

The README's "Project Structure" section predates the Core/Infrastructure/Api split. Trust
the code over it.

### Auth

- ASP.NET Identity (`User : IdentityUser`) + JWT. Go through `UserManager<User>` for users;
  never query the users table raw.
- Tokens come from `ITokenService` only. Handlers and controllers never build tokens by hand.
- Admin endpoints use `[Authorize(Policy = "RequireAdminRole")]`. Don't add
  `[AllowAnonymous]` outside the account/auth endpoints.
- All user-supplied text that gets stored goes through `InputSanitizationService`.

### Client: Next.js 16 App Router at `client/`

- React 19, TypeScript, Tailwind CSS 4.
- All API calls go through `client/lib/api.ts`. Shared types live in `client/types/models.ts`.
- Auth state lives in `client/contexts/AuthContext.tsx`.

---

## Deployment (read before merging anything)

There is no PR CI and no dev environment. **Merging to `main` deploys to production.**

- `backend/**` or `terraform/**` → `deploy-backend.yml`: publish, Terraform apply to Lambda,
  then run migrations and seed against the prod database (`RUN_SEED_ONLY`).
- `client/**` → `deploy-frontend.yml`: `npm ci` and `sst deploy --stage prod`.

Consequences:

- Local `dotnet build` / `npm run build` is the only gate. Run the relevant one before
  opening a PR, and say in the PR body that you did.
- Any destructive migration (drop table or column, type change, non-null column without a
  default on an existing table) runs against prod on merge. Call it out explicitly in the PR.
- Never push an empty or cosmetic commit just to trigger a deploy. Use `workflow_dispatch`
  on the backend workflow instead.

---

## Git, commits, and PRs

### Branches

- Never commit directly to `main`. Always branch from a fresh `origin/main`.
- Prefix by intent, kebab-case after the slash: `feature/`, `fix/`, `chore/`, `ci/`, `docs/`.
  Examples: `feature/domain-export`, `fix/cors-origins`, `chore/dependabot-alerts-2026-11-12`.
- One purpose per branch. Docs-only changes get their own `docs/` branch and PR.

### Commits

- Imperative mood, sentence case, no trailing period, no conventional-commit prefixes.
  Good: `Add troop wage validation`, `Fix CORS origin parsing for comma-separated list`.
  Bad: `fix again`, `update to trigger build`, `feat: stuff`.
- Say what changed, specifically enough that the log reads as a changelog. Subject line
  only for most commits; add a body only when the *why* isn't obvious from the diff.
- One logical change per commit. For a feature, split along natural seams: entity and
  migration, then service/controller, then client, then tests, then docs.
- Lockfile and dependency changes go in their own commits, separate from code changes.
- Never commit secrets, connection strings, or `appsettings.Development.json`.
- No AI attribution of any kind: no `Co-Authored-By`, no "Generated with" lines, in
  commits or PR bodies.

### Pull requests

- Open as a **draft** first. Roy reviews and merges; never merge, force-push, or delete
  branches yourself.
- Title: a plain sentence describing the outcome, same style as a commit subject
  (`Add user feedback form`, `Resolve 12 Dependabot alerts`).
- Body uses this structure, filled honestly. Leave untrue boxes unticked:

  ```markdown
  ## What

  <What the PR does, in a few lines.>

  ## Why

  <Why it's needed. Link an issue if there is one.>

  ## Type of change

  - [ ] Feature
  - [ ] Bug fix
  - [ ] Refactor
  - [ ] Infrastructure / CI
  - [ ] Other

  ## Checklist

  - [ ] Tests added or updated
  - [ ] Migrations included (if schema changed)
  - [ ] No hardcoded secrets or credentials
  - [ ] `dotnet build` / `npm run build` passes locally
  ```

- Keep the body scoped to this PR. No references to other branches, earlier attempts, or
  unrelated work.
- Keep PRs small and focused. If a change grows a second purpose, split it.
- PRs merge with a merge commit (`Merge pull request #N from ...`), so the branch's
  individual commits stay in history. Write them accordingly.

---

## Skills

- `/dependabot-alerts`: resolve open npm Dependabot alerts for `client/` with a fixed,
  repeatable procedure (`.claude/skills/dependabot-alerts/SKILL.md`). The npm cooldown it
  relies on is configured in `client/.npmrc`.

---

## Reference Docs

- `README.md`: product overview, API endpoints, security features (rate limiting, CSP,
  lockout), configuration keys, and local setup.
- `terraform/README.md`: Lambda / API Gateway infrastructure.
- `.github/workflows/README.md`: deploy workflows and required secrets.
