# Contributing to Anastomotic

Thank you for your interest in contributing to Anastomotic! This document provides guidelines and instructions for contributing.

## Getting Started

Use Node.js 22.13.0 from `.nvmrc` and pnpm 9.15.0 from root `package.json`. The current frontend toolchain needs a recent Node release; older Node 20 instructions are stale. Pin the package manager rather than installing an unversioned global latest release.

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/anastomotic.git`
3. Install dependencies: `pnpm install --frozen-lockfile`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development

Read the [architecture map](docs/architecture.md), [project assessment](docs/project-assessment.md), and [December roadmap and project ideas](docs/roadmap-december-2026.md). For a first contribution, choose a small reproducible problem, explain your intended change in an issue, and keep the PR focused. Documentation, accessibility, reproducible bug reports and platform fixes are useful contributions too.

```bash
pnpm dev          # Run the desktop app in development mode
pnpm build        # Build all workspaces
pnpm typecheck    # Run TypeScript checks
pnpm lint         # Run linting
pnpm format:check # Check formatting
pnpm lint:text    # Check for em dashes and emojis
```

`pnpm dev:web` starts the UI server only; desktop features require the Electron bridge. Use `pnpm dev` for the complete local desktop application. Avoid `pnpm dev:clean` for ordinary startup: it clears stored application data.

### Native SQLite troubleshooting

If Node tests report `NODE_MODULE_VERSION` mismatch, desktop setup may have built `better-sqlite3` for Electron. Stop the app before switching native targets. Rebuild for Node with `pnpm rebuild better-sqlite3 --recursive`, then rerun the affected tests. If that command keeps an Electron-targeted binary, inspect inherited npm runtime/target configuration before rebuilding; a successful rebuild message alone does not establish that the ABI matches.

Desktop development validates native modules and may rebuild them for Electron again. Run tests and native rebuilds sequentially. On Windows, native compilation may require Visual Studio Build Tools; report the runtime versions and ABI error when asking for setup help. Use `pnpm -F @anastomotic/desktop test:e2e:native` for native Electron E2E tests; the Docker command requires Docker and Bash.

## Testing

Before opening a pull request, ensure your changes don't break existing functionality by running the appropriate tests:

### Web UI (apps/web)

```bash
pnpm -F @anastomotic/web test                    # Run all web tests
pnpm -F @anastomotic/web test:unit               # Unit tests only
pnpm -F @anastomotic/web test:integration        # Integration tests only
```

### Desktop App (apps/desktop)

```bash
pnpm -F @anastomotic/desktop test                # Run all desktop tests
pnpm -F @anastomotic/desktop test:unit           # Unit tests only
pnpm -F @anastomotic/desktop test:integration    # Integration tests only
pnpm -F @anastomotic/desktop test:e2e            # Docker-based E2E tests
```

### Core Logic (packages/agent-core)

```bash
pnpm -F @anastomotic_ai/agent-core test          # Run core tests
```

For a single non-watching core test run, use `pnpm -F @anastomotic_ai/agent-core exec vitest run`.

### Background Daemon (apps/daemon)

```bash
pnpm -F @anastomotic/daemon test
```

For code changes, run `pnpm typecheck`, `pnpm lint:eslint`, `pnpm lint:text`, `pnpm format:check`, and the affected workspace tests. Report existing failures with reproduction details instead of hiding them or weakening assertions. Real-provider checks require your own credentials; ordinary contributor tasks should have credential-free tests.

## Code Style

- TypeScript for all application code
- Follow existing patterns in the codebase
- Use meaningful variable and function names
- Keep functions focused and small

## Pull Request Process

1. Ensure your code builds without errors (`pnpm build`)
2. Run type checking (`pnpm typecheck`)
3. Update documentation if needed
4. Write a clear PR description explaining:
   - What the change does
   - Why it's needed
   - How to test it

## Commit Messages

Use clear, descriptive commit messages:

- `feat: add dark mode support`
- `fix: resolve crash on startup`
- `docs: update README with new instructions`
- `refactor: simplify task queue logic`

## Reporting Issues

When reporting issues, please include:

- OS and version
- Steps to reproduce
- Expected vs actual behavior
- Any error messages or logs

## Security

If you discover a security vulnerability, please see [SECURITY.md](SECURITY.md) for responsible disclosure guidelines.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
