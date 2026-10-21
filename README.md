<p align="center">
  <strong>English</strong> | <a href="README.zh-CN.md">中文</a> | <a href="README.ja.md">日本語</a> | <a href="README.ko.md">한국어</a> | <a href="README.ru.md">Русский</a> | <a href="README.es.md">Español</a> | <a href="README.tr.md">Türkçe</a> | <a href="README.ar.md">العربية</a> | <a href="README.id.md">Bahasa Indonesia</a> | <a href="README.ta.md">தமிழ்</a> | <a href="README.hi.md">हिन्दी</a>
</p>

# Anastomotic™ - Open Source AI Desktop Agent

Anastomotic is an open source AI desktop agent that automates file management, document creation, and browser tasks locally on your machine. Bring your own API keys (OpenAI, Anthropic, Google, xAI) or run local models via Ollama.

<p align="center">
  <strong>Runs locally on your machine. Bring your own API keys or local models. MIT licensed.</strong>
</p>

<p align="center">
  <a href="https://github.com/anastomotic-ai/anastomotic/releases">Anastomotic releases</a>
</p>

<br />

---

<br />

## What makes it different

<table>
<tr>
<td width="50%" valign="top" align="center">

### It runs locally

<div align="left">

- Your task history and settings are stored on your machine
- You decide which folders it can touch
- Cloud models receive task content and tool results needed to carry out your request; local models are available

</div>

</td>
<td width="50%" valign="top" align="center">

### You bring your own AI

<div align="left">

- Use your own API key (OpenAI, Anthropic, etc.)
- Or run with [Ollama](https://ollama.com) (no API key needed)
- No subscription, no upsell
- It's a tool - not a service

</div>

</td>
</tr>
<tr>
<td width="50%" valign="top" align="center">

### It's open source

<div align="left">

- Every line of code is on GitHub
- MIT licensed
- Change it, fork it, break it, fix it

</div>

</td>
<td width="50%" valign="top" align="center">

### It acts, not just chats

<div align="left">

- File management
- Document creation
- Custom automations
- Skill learning

</div>

</td>
</tr>
</table>

<br />

---

<br />

## Features

### Core Capabilities

| Feature              | Description                                                 |
| :------------------- | :---------------------------------------------------------- |
| **File Management**  | Sort, rename, and move files based on content or rules      |
| **Document Writing** | Write, summarize, or rewrite documents with AI              |
| **Tool Connections** | Integrate with Notion, Google Drive, Dropbox via local APIs |
| **Custom Skills**    | Define repeatable workflows and save them as skills         |
| **Full Control**     | Approve every action, view logs, stop anytime               |

### Advanced Features

| Feature                    | Description                                                                                                  |
| :------------------------- | :----------------------------------------------------------------------------------------------------------- |
| **Scheduled Tasks**        | Schedule AI tasks with cron expressions - run daily reports, weekly cleanups, or hourly checks automatically |
| **Cost Tracking**          | Monitor token usage and API costs per task with detailed breakdowns by model and provider                    |
| **Auto-Learning**          | Automatically extracts reusable insights from completed tasks and applies them to improve future results     |
| **Multi-Agent Pipelines**  | Orchestrate multi-step workflows with sequential, parallel, or conditional agent pipelines                   |
| **Git-Aware Code Agent**   | Detects current branch and repo status - suggests git-related actions contextually on the home screen        |
| **Export & Share Results** | Export task results as Markdown, JSON, or plain text - or copy to clipboard with one click                   |
| **Smart Task Suggestions** | Heuristic suggestion engine on the home page that recommends follow-up tasks based on recent activity        |
| **Skill Marketplace**      | Browse and install community skills from a curated marketplace with one-click install                        |
| **Notification Webhooks**  | Send HTTP POST notifications to Slack, Discord, or any webhook URL on task completion or failure             |

<br />

---

<br />

## What it actually does

|                                                                    |                                                                      |                                                                         |
| :----------------------------------------------------------------- | :------------------------------------------------------------------- | :---------------------------------------------------------------------- |
| **File Management**                                                | **Document Writing**                                                 | **Tool Connections**                                                    |
| Sort, rename, and move files based on content or rules you give it | Prompt it to write, summarize, or rewrite documents                  | Works with Notion, Google Drive, Dropbox, and more (through local APIs) |
|                                                                    |                                                                      |                                                                         |
| **Custom Skills**                                                  | **Full Control**                                                     |                                                                         |
| Define repeatable workflows, save them as skills                   | You approve every action. You can see logs. You can stop it anytime. |                                                                         |

<br />

## Use cases

- Clean up messy folders by project, file type, or date
- Draft, summarize, and rewrite docs, reports, and meeting notes
- Automate browser workflows like research and form entry
- Generate weekly updates from files and notes
- Prepare meeting materials from docs and calendars

<br />

## Supported models and providers

- Anthropic (Claude)
- OpenAI (GPT)
- Google AI (Gemini)
- xAI (Grok)
- DeepSeek
- Moonshot AI (Kimi)
- Z.AI (GLM)
- MiniMax
- Venice.ai
- Amazon Bedrock
- Azure Foundry
- OpenRouter
- LiteLLM
- Ollama (local models)
- LM Studio (local models)

<br />

## Privacy and local-first

Anastomotic runs locally on your machine and stores task history locally. When you select a cloud AI provider, prompts and relevant file content or tool results are sent to that provider. Browser tasks and connectors communicate with the services you use. Local models are available; review your chosen model, tools, and connectors when working with private data.

<br />

## System requirements

- macOS (Apple Silicon)
- macOS (Intel)
- Windows 11
- Ubuntu (ARM64)
- Ubuntu (x64)

<br />

---

<br />

## How to use it

> **Takes 2 minutes to set up.**

| Step  | Action              | Details                                                                                                           |
| :---: | ------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **1** | **Install the App** | Download the DMG and drag it into Applications                                                                    |
| **2** | **Connect Your AI** | Use your own Google, OpenAI, Anthropic (or other) API key - or sign in with ChatGPT (Plus/Pro). No subscriptions. |
| **3** | **Give It Access**  | Choose which folders it can see. You stay in control.                                                             |
| **4** | **Start Working**   | Ask it to summarize a doc, clean a folder, or create a report. You approve everything.                            |

<br />

<br />

---

<br />

## FAQ

**Does Anastomotic run locally?**  
Yes. Anastomotic runs locally on your machine and you control which folders it can access.

**Do I need an API key?**  
You can use your own API keys (OpenAI, Anthropic, Google, xAI, etc.) or run local models via Ollama.

**Is Anastomotic free?**  
Yes. Anastomotic is open source and MIT licensed.

**Which platforms are supported?**
macOS (Apple Silicon), macOS (Intel), Windows 11, Ubuntu ARM64, and Ubuntu x64 are supported.

<br />

---

<br />

## Development

```bash
pnpm install
pnpm dev
```

See [Contributing](CONTRIBUTING.md) for setup, platform notes, and verification, and the [December 2026 roadmap](docs/roadmap-december-2026.md) for proposed release goals and contributor projects.

<details>
<summary><strong>Prerequisites</strong></summary>

- Node.js 22.13.0 (see `.nvmrc`; the current Vite toolchain requires a recent Node.js release)
- pnpm 9.15.0 (pinned in `packageManager`)

</details>

<details>
<summary><strong>All Commands</strong></summary>

| Command                                      | Description                            |
| -------------------------------------------- | -------------------------------------- |
| `pnpm dev`                                   | Run desktop app in dev mode            |
| `pnpm dev:clean`                             | Dev mode with clean start              |
| `pnpm build`                                 | Build all workspaces                   |
| `pnpm build:desktop`                         | Build desktop app only                 |
| `pnpm -F @anastomotic/desktop package:win`   | Build Windows installer (x64)          |
| `pnpm -F @anastomotic/desktop package:linux` | Build Linux artifacts (AppImage + deb) |
| `pnpm lint`                                  | TypeScript checks                      |
| `pnpm typecheck`                             | Type validation                        |
| `pnpm -F @anastomotic/desktop test:e2e`      | Playwright E2E tests                   |

</details>

<details>
<summary><strong>Environment Variables</strong></summary>

| Variable          | Description                        |
| ----------------- | ---------------------------------- |
| `CLEAN_START=1`   | Clear all stored data on app start |
| `E2E_SKIP_AUTH=1` | Skip onboarding flow (for testing) |

</details>

<details>
<summary><strong>Architecture</strong></summary>

```
apps/
  desktop/        # Electron main process and preload bridge
  web/            # React interface, embedded by desktop
  daemon/         # Background task execution service
packages/
  agent-core/     # Agent runtime, storage, providers, types, and MCP tools
```

The desktop app uses Electron with a React UI bundled via Vite. Its agent runtime spawns OpenCode CLI using `node-pty` to execute tasks. API keys are encrypted locally with AES-256-GCM and a machine-derived key.

See [docs/architecture.md](docs/architecture.md) for architecture and [the project assessment](docs/project-assessment.md) for observed limitations and verification results.

</details>

<br />

---

<br />

## Contributing

Contributions welcome! Feel free to open a PR.

```bash
# Fork → Clone → Branch → Commit → Push → PR
git checkout -b feature/amazing-feature
git commit -m 'Add amazing feature'
git push origin feature/amazing-feature
```

<br />

---

<br />

<div align="center">

**[Anastomotic releases](https://github.com/anastomotic-ai/anastomotic/releases)** · **[Issues](https://github.com/anastomotic-ai/anastomotic/issues)** · **[Twitter](https://x.com/ANASTOMOTIC_ai)**

<br />

MIT License · Built by [Anastomotic](https://github.com/anastomotic-ai)

<br />

**Keywords:** AI agent, AI desktop agent, desktop automation, file management, document creation, browser automation, local-first, macOS, linux, ubuntu, privacy-first, open source, Electron, computer use, AI assistant, workflow automation, OpenAI, Anthropic, Google, xAI, Claude, GPT-4, Ollama

</div>
