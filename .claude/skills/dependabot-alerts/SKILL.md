---
name: dependabot-alerts
description: Resolve open Dependabot / npm security alerts for the Next.js client. Runs `npm audit fix` first, pins the remainder with per-alert `overrides`, verifies the build, and opens a minimal draft PR. Use when asked to fix, triage, resolve, or clear Dependabot alerts, npm security alerts, or npm audit vulnerabilities.
---

# Resolving Dependabot alerts

This procedure covers npm alerts against `client/package-lock.json` only. Alerts in any
other ecosystem (NuGet in `backend/`) are out of scope: the triage script lists them and
they go in the report untouched.

This is a fixed, deterministic procedure. Follow the steps in order and do not improvise
around them. The point is that two runs a week apart behave the same way.

## Hard rules

- **Never run `npm audit fix --force`.** It performs breaking major upgrades.
- **Never investigate how long a package has been published.** The 7-day cooldown
  (`min-release-age=7` in `client/.npmrc`) is enforced by npm. If npm says a fix is
  blocked by release age, accept it, record it as deferred, and move on. No registry
  lookups, no publish-date checks, no date arithmetic.
- **Never override the cooldown on your own initiative.** Only if the user explicitly
  says an alert is urgent. See "Urgent escape hatch" at the bottom.
- **Never invent an `overrides` version.** Every value is copied from that alert's
  `first_patched_version`.
- **Never dismiss or close alerts.** Dependabot closes them itself once the fix
  reaches `main`.
- **Never touch NuGet packages or `.csproj` files** as part of this procedure.

## 0 — Preflight

Stop and report if any of these fails. Do not work around them.

```bash
npm -v                    # must be >= 11.10.0
git status --porcelain    # must be empty
gh auth status            # triage needs the Dependabot API
```

The npm floor is not cosmetic. Below 11.10.0, npm parses `min-release-age` and
**silently ignores it**: the run would install same-day packages while appearing to
respect the cooldown. If npm is too old, tell the user to run `npm i -g npm@11` and stop.
(npm 12 additionally requires Node >= 22.22.2, so it is not always an option.)

Then branch from a fresh `main`:

```bash
git fetch origin
git switch -c chore/dependabot-alerts-$(date +%F) origin/main
```

If that branch name is taken, suffix `-2`, `-3`.

## 1 — `npm audit fix`

Always the first action.

```bash
cd client && npm audit fix
```

**Judge this by its output, not its exit code.** npm exits non-zero whenever
vulnerabilities remain, and specifically when the cooldown blocked a patch it keeps the
vulnerable version, warns, and exits non-zero. That is an expected outcome, not a failure.

- lockfile changed → fixes applied
- output says a fix was blocked by release age → record the package as **deferred (cooldown)**

If the lockfile changed, commit it on its own:

```
Resolve N Dependabot alerts with npm audit fix
```

## 2 — Per-alert overrides for the remainder

Run the classifier from the repo root. It joins `npm audit --json` against the
Dependabot ledger and prints the exact overrides block to apply:

```bash
python3 .claude/skills/dependabot-alerts/scripts/triage.py
```

It takes ~1-2 minutes (network). Add `--format json` if you need to consume it
programmatically.

Copy its `overrides` block into `client/package.json`, merging with the existing
`overrides`. If a package already has an override, replace it only when the script's
version is higher; never lower an existing pin. The script has already excluded direct
dependencies needing a major bump (an override there is a disguised major upgrade), so
those stay unactioned and get reported under the migration bucket instead.

Then:

```bash
cd client && npm install
```

Two failure shapes, both handled by dropping one entry and retrying. **Cap at 5 retries
total**, then drop everything still unresolved and report it:

- **blocked by release age** → npm names the package. Drop that one override, record it
  as deferred (cooldown), retry. Do not check when it was published.
- **peer/resolution conflict** → drop that override, record it as "override rejected", retry.

Commit separately from step 1:

```
Pin transitive dependencies to patched versions from Dependabot alerts
```

## 3 — Verify

There is no PR CI in this repo, and merging a `client/` change to `main` deploys straight
to production via SST. This local build is the only gate, so do not skip it.

```bash
cd client && npm ci && npm run build
```

On failure, a bounded fallback. Do not bisect:

1. Revert the overrides commit, rebuild.
2. Still failing → revert the audit-fix commit too, report, and stop **without** opening a PR.

## 4 — Push and open the draft PR

If nothing changed in steps 1 and 2, skip the branch and PR entirely and just report.

```bash
git push -u origin <branch>
gh pr create --draft --base main --title "Resolve N Dependabot alerts"
```

If the environment doesn't allow `git push` (for example the Agent OS box), stop after
committing and hand the branch off through that environment's push process, using the
title and body below.

### PR body — audit-fix only

Keep it near-empty:

```markdown
## What

`npm audit fix` in `client/`. Lockfile only.

## Why

Resolves N open Dependabot alerts.

## Type of change

- [ ] Feature
- [ ] Bug fix
- [ ] Refactor
- [x] Infrastructure / CI
- [ ] Other

## Checklist

- [ ] Tests added or updated
- [ ] Migrations included (if schema changed)
- [x] No hardcoded secrets or credentials
- [x] `npm ci && npm run build` passes locally
```

Leave the untrue boxes unticked.

### PR body — when overrides are included

Same as above, with **What** amended to mention the overrides, plus this section
appended. The clarifying line is mandatory:

```markdown
## Overrides

Every version in `overrides` is the `first_patched_version` named by that specific
Dependabot alert. None were chosen by hand.

| Package | Pinned to | Alerts | Advisory |
|---|---|---|---|
| tar | 7.5.21 | #1, #2, #3 | GHSA-… |
```

Do not add attribution or "generated with" lines to commits or the PR body. Keep the body
scoped to this PR: no references to other branches or unrelated work.

## 5 — Report

Sections in this order, runtime-scope entries first within each:

1. **Fixed** — by `npm audit fix`
2. **Overridden** — package, pinned version, alert numbers
3. **Deferred (cooldown)** — packages only, plus the line: *no publish dates were checked;
   rerun in a few days*
4. **Needs major upgrade** — grouped by root package with alert counts, not listed individually
5. **No fix available**
6. **Unmatched** — count only, no investigation
7. **Out of scope (NuGet / other)** — alert number, package, severity. Not actioned.

Then the draft PR link (or the handed-off branch name).

## Urgent escape hatch (user-initiated only)

Only when the user explicitly says an alert is urgent: add that one package to
`min-release-age-exclude` in `client/.npmrc`, apply the fix, and call the exclusion out as
temporary in the PR body. Never do this on your own judgement, and never for convenience.
