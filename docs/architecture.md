# Architecture

Source baseline: 21 October 2026. Older viewpoint diagrams contain stale package versions and migration counts; use manifests and source as the authority.

## Workspace map

| Workspace                       | Responsibility                                                                                      | Starting points                                                                                       |
| ------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `apps/web`                      | React UI, routing, Zustand state, settings, messages and permission dialogs                         | `src/client/pages/`, `src/client/stores/`, `src/client/lib/anastomotic.ts`                            |
| `apps/desktop`                  | Electron lifecycle, preload API, IPC handlers, platform integrations and daemon bootstrap           | `src/main/index.ts`, `src/preload/index.ts`, `src/main/ipc/handlers/`, `src/main/daemon-bootstrap.ts` |
| `apps/daemon`                   | Background execution, storage, permissions, scheduling and RPC                                      | `src/index.ts`, `src/task-service.ts`, `src/permission-service.ts`, `src/websocket.ts`                |
| `packages/agent-core`           | Task manager, OpenCode adapter, types, providers, storage, migrations, skills and sandbox providers | `src/index.ts`, `src/common.ts`, `src/factories/`, `src/internal/`, `src/opencode/`, `src/storage/`   |
| `packages/agent-core/mcp-tools` | Browser/desktop automation, permissions, questions, task lifecycle and progress tools               | Individual tool manifests and source                                                                  |

Agent core is an internal ESM workspace package, currently marked private. Internal imports require `.js` extensions. MCP tools have a separate install/bundle lifecycle and are not all top-level pnpm workspaces.

## Task flow

1. A user configures a provider and submits a prompt in the web UI.
2. The typed UI wrapper calls Electron's preload bridge. Main IPC handlers validate inputs and coordinate tasks and storage.
3. The runtime configures OpenCode with the model, credentials, working directory, skills and tools, then launches it through `node-pty`.
4. OpenCode contacts the selected AI provider and invokes built-in tools or MCP tools. Permission and question services route requests back to the user.
5. Callbacks deliver messages, progress and completion events to the renderer; SQLite persists task state and history.

Desktop attempts a child daemon and falls back to an in-process daemon. Read `src/main/daemon-bootstrap.ts` before changing execution ownership. Do not assume every desktop handler has migrated to RPC: trace the specific handler and callbacks.

## Storage and trust boundaries

- Renderer configuration disables Node integration and enables context isolation. Privileged operations pass through preload and IPC.
- SQLite repositories and versioned migrations live in agent core. Add a migration instead of modifying a released one; inspect the migrations index for the actual current version.
- `src/storage/secure-storage.ts` uses AES-256-GCM with machine-derived key material. This is not OS keychain storage.
- Local persistence does not imply local inference: cloud providers receive task context; browsers and connectors contact external services.
- Permission dialogs and OS isolation are different mechanisms. Disabled sandbox mode passes commands through. Native Windows/Linux mode sets environment flags; that alone does not establish OS-enforced filesystem or network isolation. Inspect `src/sandbox/` before claiming enforcement.

## Build and development

Node is pinned in `.nvmrc`, pnpm in root `package.json`. Root `pnpm dev` runs preflight, starts Vite on port 5173, then starts desktop development. Web builds to `apps/web/dist/client`, which Electron embeds in packaged builds. `pnpm dev:web` starts the UI server; desktop capabilities still require a compatible privileged bridge.

Node tests and Electron use different native module ABIs. Desktop setup can rebuild the shared SQLite dependency for Electron, breaking Node tests until rebuilt for Node. See [CONTRIBUTING.md](../CONTRIBUTING.md). Avoid native rebuilds concurrently with tests or desktop startup.

### Spawning npx/node in main process

Packaged apps must use their bundled Node environment. Follow the helpers in `apps/desktop/src/main/utils/` and existing subprocess code to add the bundled binary directory to PATH.

## Changing a feature

- UI/state belongs in web; reuse existing UI primitives.
- New desktop capabilities usually touch shared types, an IPC handler, preload, the web wrapper and its caller. Keep the contract synchronized.
- Reusable execution/storage/provider logic belongs in agent core; export intentional public APIs from its entry points.
- Daemon changes must account for child-process startup, in-process fallback and permission delivery.
- Run workspace checks and typecheck/lint/format for code changes. See [AGENTS.md](../AGENTS.md).
