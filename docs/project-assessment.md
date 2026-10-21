# Project assessment

Reviewed 21 October 2026, starting at local commit `c362627`. This is a source and automated-check baseline, not a claim that every feature or platform has been exercised.

## What the project is

Anastomotic is an MIT-licensed desktop automation assistant. Its React interface is embedded in Electron, with a background daemon and shared TypeScript agent core. It configures and supervises OpenCode rather than implementing a complete independent model/tool runtime. Cloud providers and local model endpoints are supported through provider integrations. Its potential value is repeatable desktop work with visible progress, user control and a choice of model.

The source includes task history, workspaces, permissions, skills, browser automation, desktop control, scheduled tasks, cost records, pipelines, memory/preferences, connectors, offline queues, plugin records and team records. Presence of UI/types/storage is not proof of a complete operational feature. For example, plugin and offline IPC handlers include record-management operations; execution, synchronization and recovery need separate end-to-end verification. Pipeline execution is wired to the task manager and callbacks, but real-provider reliability remains unmeasured.

## Evidence and current status

Environment: Windows, Node 22.13.0 (from `.nvmrc`) and pnpm 9.15.0 (from `packageManager`).

| Check                     | Observed result                                                      |
| ------------------------- | -------------------------------------------------------------------- |
| `pnpm typecheck`          | Passed all four workspaces                                           |
| `pnpm lint:eslint`        | Passed                                                               |
| `pnpm build`              | Passed after pinning Tailwind CSS to v3                              |
| Agent-core tests          | 39 files, 669 tests passed                                           |
| Daemon tests              | 3 files, 17 tests passed                                             |
| Web unit tests            | 11 files, 240 tests passed                                           |
| Web integration tests     | 4 files passed, 8 failed; 191 tests passed, 45 failed                |
| Desktop unit tests        | 12 files passed; 404 tests passed, 6 skipped                         |
| Desktop integration tests | 4 files passed, 4 failed; 141 tests passed, 19 failed (Windows only) |

The web integration failures come from test mocks that no longer match the client API. The desktop integration failures assume POSIX paths and binaries. The CI job and development container added by this review have not been executed on GitHub or Docker.

## Highest-priority findings

1. **Runtime setup:** the app needs native SQLite built for Electron (ABI 145), while core tests run under Node (ABI 127), and both share one binary. The desktop dev check now detects a mismatch and rebuilds for Electron. Long term, separate native targets or provide an explicit switching command.
2. **CI coverage:** existing path filters ignored web-only and daemon-only changes, and jobs did not run web or daemon tests. This review expands triggers and adds those suites. Existing Node 20 CI pins are replaced with `.nvmrc`; the development container moves to Node 22 with pinned pnpm.
3. **Test drift:** observed failures include POSIX-only path assumptions, UI/context assumptions, follow-up callback expectations and missing integration dependencies/mocks. Triage against intended behavior; do not simply update snapshots or suppress errors.
4. **Privacy accuracy:** cloud inference sends task context to providers. The English README incorrectly promised nothing was sent to anyone and described credentials as OS keychain storage. This review corrects those claims to match source. Other translations and organization-profile copy need the same review.
5. **Isolation claims:** native Windows/Linux sandbox code injects environment flags. That is insufficient evidence of OS-level enforcement. Audit direct shell/tool access, path canonicalization, symlinks and denial behavior before promising strict isolation.
6. **Contributor navigation:** the architecture guide was truncated, omitted the web workspace and described the private core package as published. This review replaces it with a source map and expands setup/verification instructions.
7. **Release/community readiness:** security policy references version 0.1.x while desktop is 0.3.8, and its reporting contact is indirect. Confirm actual supported versions and a monitored private contact. Named reviewers/mentors, conduct handling, triaged starter issues and tested download artifacts still require maintainer work.

## Recommended direction

Prove file summarization, approved folder organization and browser research before expanding the feature list. Ship fixture inputs and measurable completion criteria, then test with people who have never seen the code. Relevance in December will depend on repeatable outcomes, clear failure recovery and maintainability; today's model/provider count cannot establish it.

See the [December roadmap](roadmap-december-2026.md) for proposed dates, acceptance gates and contributor/mentoring ideas. GSoC organization selection is separate from making a repository contribution-friendly; no participation status is claimed. Official references: [organization process](https://summerofcode.withgoogle.com/how-it-works), [mentor guide](https://google.github.io/gsocguides/mentor/).

## Not yet verified

Paid-provider tasks, local model tool execution, full Electron UI interaction, all permission bypass cases, scheduler recovery, production installers/signing, download availability and macOS/Linux runtime behavior. These need dedicated validation before release claims. Automated unit passes alone do not establish them.
