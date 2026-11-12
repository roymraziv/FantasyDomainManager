#!/usr/bin/env python3
"""Deterministic triage of open npm Dependabot alerts.

Joins `npm audit --json` (what is fixable) against the repo's Dependabot alert
ledger (what GitHub is tracking, and the patched version each alert names), then
buckets the result and emits the exact `overrides` block to apply.

Only npm alerts against client/package-lock.json are actioned. Alerts from any
other ecosystem (e.g. NuGet in backend/) are reported as out of scope.

Exists so the classification is identical on every run instead of being
re-derived ad hoc. Stdlib only.
"""

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

SEMVER = re.compile(r"(\d+)\.(\d+)\.(\d+)")


def version_key(v):
    """Sort key for a version string. Prerelease tags are ignored."""
    m = SEMVER.search(v or "")
    return tuple(int(g) for g in m.groups()) if m else (0, 0, 0)


def run(cmd, cwd=None):
    p = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    return p.returncode, p.stdout, p.stderr


def npm_audit(client_dir):
    # npm audit exits non-zero whenever vulnerabilities exist, so rc is ignored.
    _, out, err = run(["npm", "audit", "--json"], cwd=client_dir)
    try:
        return json.loads(out)
    except json.JSONDecodeError:
        sys.exit(f"could not parse `npm audit --json` output:\n{err or out[:500]}")


def gh_alerts(repo):
    rc, out, err = run([
        "gh", "api", "--paginate",
        f"/repos/{repo}/dependabot/alerts?state=open&per_page=100",
    ])
    if rc != 0:
        sys.exit(f"gh api failed: {err.strip()}")
    # --paginate concatenates JSON arrays; normalise to one list.
    return json.loads(out.replace("][", ","))


def direct_deps(client_dir):
    pkg = json.loads((Path(client_dir) / "package.json").read_text())
    return set(pkg.get("dependencies", {})) | set(pkg.get("devDependencies", {}))


def triage(client_dir, repo):
    audit = npm_audit(client_dir)
    all_alerts = gh_alerts(repo)
    direct = direct_deps(client_dir)

    # Only npm alerts are actionable by this procedure; everything else is reported.
    alerts, out_of_scope = [], {}
    for a in all_alerts:
        eco = a["dependency"]["package"].get("ecosystem", "unknown")
        if eco == "npm":
            alerts.append(a)
        else:
            out_of_scope.setdefault(eco, []).append({
                "number": a["number"],
                "package": a["dependency"]["package"]["name"],
                "manifest": a["dependency"].get("manifest_path", ""),
                "severity": a["security_advisory"]["severity"],
            })

    # Bucket local audit entries by how they can be fixed.
    in_range, major_only, no_fix = set(), {}, set()
    for name, v in audit.get("vulnerabilities", {}).items():
        fix = v.get("fixAvailable")
        if fix is True:
            in_range.add(name)
        elif fix is False:
            no_fix.add(name)
        elif isinstance(fix, dict):
            major_only[name] = fix.get("name", name)

    # Highest patched version demanded per package across all its alerts.
    patched, by_pkg = {}, {}
    for a in alerts:
        pkg = a["dependency"]["package"]["name"]
        by_pkg.setdefault(pkg, []).append({
            "number": a["number"],
            "ghsa": a["security_advisory"]["ghsa_id"],
            "severity": a["security_advisory"]["severity"],
            "scope": a["dependency"].get("scope") or "unknown",
            "url": a["html_url"],
        })
        fpv = (a["security_vulnerability"].get("first_patched_version") or {}).get("identifier")
        if fpv and version_key(fpv) > version_key(patched.get(pkg, "")):
            patched[pkg] = fpv

    overrides, migration, unfixable, unmatched = {}, {}, {}, {}
    for pkg, entries in by_pkg.items():
        if pkg in no_fix:
            unfixable[pkg] = entries
        elif pkg in major_only and pkg in direct:
            # An override on a direct dep is a disguised major upgrade. Group it
            # under the root package npm names as the real fix.
            migration.setdefault(major_only[pkg], []).extend(entries)
        elif pkg in major_only or pkg in in_range:
            if pkg in patched:
                overrides[pkg] = patched[pkg]
            else:
                unmatched[pkg] = entries
        else:
            # Not in the local audit at all: already fixed here, or stale on GitHub.
            unmatched[pkg] = entries

    return {
        "alerts_open": len(all_alerts),
        "alerts_npm": len(alerts),
        "out_of_scope": {k: sorted(v, key=lambda e: e["number"]) for k, v in sorted(out_of_scope.items())},
        "audit_totals": audit.get("metadata", {}).get("vulnerabilities", {}),
        "overrides": dict(sorted(overrides.items())),
        "migration": {k: sorted(v, key=lambda e: e["number"]) for k, v in sorted(migration.items())},
        "unfixable": dict(sorted(unfixable.items())),
        "unmatched": dict(sorted(unmatched.items())),
        "alerts_by_package": by_pkg,
    }


def runtime_first(entries):
    return sorted(entries, key=lambda e: (e["scope"] != "runtime", e["number"]))


def as_text(r):
    lines = [
        f"Open Dependabot alerts: {r['alerts_open']} ({r['alerts_npm']} npm)",
        f"npm audit totals:       {r['audit_totals']}",
        "",
    ]

    lines.append(f"OVERRIDES TO APPLY ({len(r['overrides'])} packages)")
    if r["overrides"]:
        for pkg, ver in r["overrides"].items():
            nums = ",".join(f"#{e['number']}" for e in runtime_first(r["alerts_by_package"][pkg]))
            scopes = {e["scope"] for e in r["alerts_by_package"][pkg]}
            tag = "runtime" if "runtime" in scopes else "dev"
            lines.append(f"  {pkg:<32} {ver:<12} [{tag}] {nums}")
        lines += ["", "  overrides block:", "  " + json.dumps(r["overrides"], indent=2).replace("\n", "\n  ")]
    else:
        lines.append("  none")
    lines.append("")

    total = sum(len(v) for v in r["migration"].values())
    lines.append(f"NEEDS MAJOR UPGRADE ({total} alerts, not actioned)")
    for root, entries in r["migration"].items():
        lines.append(f"  {len(entries):>3} alerts -> upgrade {root} (major)")
    if not r["migration"]:
        lines.append("  none")
    lines.append("")

    lines.append(f"NO FIX AVAILABLE ({len(r['unfixable'])})")
    for pkg, entries in r["unfixable"].items():
        scopes = ",".join(sorted({e["scope"] for e in entries}))
        lines.append(f"  {pkg} [{scopes}]")
    if not r["unfixable"]:
        lines.append("  none")
    lines.append("")

    lines.append(f"UNMATCHED LOCALLY ({len(r['unmatched'])} packages) - fixed here or stale on GitHub")
    lines.append("")

    total = sum(len(v) for v in r["out_of_scope"].values())
    lines.append(f"OUT OF SCOPE - not npm ({total} alerts, not actioned)")
    for eco, entries in r["out_of_scope"].items():
        for e in entries:
            lines.append(f"  [{eco}] #{e['number']} {e['package']} ({e['severity']}) {e['manifest']}")
    if not r["out_of_scope"]:
        lines.append("  none")
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--client-dir", default="client")
    ap.add_argument("--repo", default="roymraziv/FantasyDomainManager")
    ap.add_argument("--format", choices=["text", "json"], default="text")
    args = ap.parse_args()

    result = triage(args.client_dir, args.repo)
    print(json.dumps(result, indent=2) if args.format == "json" else as_text(result))


if __name__ == "__main__":
    main()
