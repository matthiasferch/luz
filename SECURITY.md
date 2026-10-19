# Dependency security notes

Reviewed on 2026-10-19 against the committed lockfile. Run `npm audit` and
`npm audit --omit=dev` to reassess after dependency changes.

## Remaining development advisory

The audit reports ten high-severity package findings from the same underlying advisory
through development-server and stylesheet-linter dependencies:

`webpack-cli → webpack-dev-server → http-proxy-middleware → micromatch → braces`

`stylelint-config-standard → stylelint-config-recommended → stylelint → globby / fast-glob → micromatch → braces`

The underlying advisory is
[GHSA-vfj7-8cjw-p6xm / CVE-2026-93687](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).
Deeply nested brace patterns can exhaust the stack and terminate the Node.js
process. The advisory covers `braces <=3.0.3` and lists no patched version as of
the review date. These are ten affected dependency records, not ten independent
vulnerabilities. The production dependency audit reports zero findings.

These chains belong to development tooling, not the shipped engine runtime. The
editor configuration does not define proxy routes or accept user-provided glob
patterns. Stylelint receives repository-controlled file patterns. This limits the identified exposure but does not establish that every
possible development-server configuration is safe.

Until a compatible fix is available, use the development server only in a trusted
local development environment. Do not expose it as a public hosting service or
pass untrusted patterns to the affected tooling. Reassess this decision before
adding proxy routes, accepting external pattern input, or changing deployment.

The current npm force-fix suggestions include downgrading webpack-dev-server to
1.14.1, webpack-cli to 6.0.1, and Stylelint to 7.7.0. Those breaking downgrades are not a validated fix
for this workspace; do not apply them automatically. This advisory is documented
and tracked, not suppressed or treated as resolved.

When a fix becomes available, update the affected dependency chain and lockfile,
rerun both audits, run `npm run check`, and smoke-test the editor development
server. Update this note with the new result.
