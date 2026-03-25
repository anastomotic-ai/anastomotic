<p align="center">
  <a href="README.md">English</a> | <strong>中文</strong> | <a href="README.ja.md">日本語</a> | <a href="README.ko.md">한국어</a> | <a href="README.ru.md">Русский</a> | <a href="README.es.md">Español</a> | <a href="README.tr.md">Türkçe</a> | <a href="README.ar.md">العربية</a> | <a href="README.id.md">Bahasa Indonesia</a> | <a href="README.ta.md">தமிழ்</a> | <a href="README.hi.md">हिन्दी</a>
</p>

# Anastomotic™ - 开源 AI 桌面代理

Anastomotic 是一款开源 AI 桌面代理，可在您的本地机器上自动化文件管理、文档创建和浏览器任务。使用您自己的 API 密钥（OpenAI、Anthropic、Google、xAI）或通过 Ollama 运行本地模型。

<p align="center">
  <strong>在您的机器上本地运行。使用您自己的 API 密钥或本地模型。MIT 许可证。</strong>
</p>

<p align="center">
  <a href="https://downloads.anastomotic.ai/downloads/0.4.8/macos/Anastomotic-0.4.8-mac-arm64.dmg"><strong>下载 Mac 版（Apple Silicon）</strong></a>
  ·
  <a href="https://downloads.anastomotic.ai/downloads/0.4.8/macos/Anastomotic-0.4.8-mac-x64.dmg"><strong>下载 Mac 版（Intel）</strong></a>
  ·
  <a href="https://downloads.anastomotic.ai/downloads/0.4.8/windows/Anastomotic-0.4.8-win-x64.exe"><strong>下载 Windows 11 版</strong></a>
  ·
  <a href="https://downloads.anastomotic.ai/downloads/0.4.8/linux/Anastomotic-0.4.8-linux-arm64.AppImage"><strong>下载 Linux 版（ARM64）</strong></a>
  ·
  <a href="https://downloads.anastomotic.ai/downloads/0.4.8/linux/Anastomotic-0.4.8-linux-x86_64.AppImage"><strong>下载 Linux 版（x64）</strong></a>
  ·
  <a href="https://downloads.anastomotic.ai/downloads/0.4.8/linux/Anastomotic-0.4.8-linux-amd64.deb"><strong>下载 Linux 版（.deb x64）</strong></a>
  ·
  <a href="https://www.anastomotic.ai/">Anastomotic 官网</a>
  ·
  <a href="https://www.anastomotic.ai/blog/">Anastomotic 博客</a>
  ·
  <a href="https://github.com/RajdeepKushwaha5/accomplish/releases">Anastomotic 发布版本</a>
</p>

<br />

---

<br />

## 有何不同

<table>
<tr>
<td width="50%" valign="top" align="center">

### 🖥️ 本地运行

<div align="left">

- 您的文件保留在您的机器上
- 您决定它可以访问哪些文件夹
- 不会向 Anastomotic（或任何人）发送任何数据

</div>

</td>
<td width="50%" valign="top" align="center">

### 🔑 自带 AI

<div align="left">

- 使用您自己的 API 密钥（OpenAI、Anthropic 等）
- 或使用 [Ollama](https://ollama.com) 运行（无需 API 密钥）
- 无订阅，无追加销售
- 这是一个工具——不是服务

</div>

</td>
</tr>
<tr>
<td width="50%" valign="top" align="center">

### 📖 开源

<div align="left">

- 每一行代码都在 GitHub 上
- MIT 许可证
- 修改它、分叉它、打破它、修复它

</div>

</td>
<td width="50%" valign="top" align="center">

### ⚡ 行动派，不只是聊天

<div align="left">

- 文件管理
- 文档创建
- 自定义自动化
- 技能学习

</div>

</td>
</tr>
</table>

<br />

---

<br />

## 实际功能

|                                                    |                                                      |                                                             |
| :------------------------------------------------- | :--------------------------------------------------- | :---------------------------------------------------------- |
| **📁 文件管理**                                    | **✍️ 文档撰写**                                      | **🔗 工具连接**                                             |
| 根据内容或您设定的规则对文件进行排序、重命名和移动 | 提示它撰写、总结或重写文档                           | 与 Notion、Google Drive、Dropbox 等配合使用（通过本地 API） |
|                                                    |                                                      |                                                             |
| **⚙️ 自定义技能**                                  | **🛡️ 完全控制**                                      |                                                             |
| 定义可重复的工作流程，保存为技能                   | 您批准每一个操作。您可以查看日志。您可以随时停止它。 |                                                             |

<br />

## 使用场景

- 按项目、文件类型或日期整理凌乱的文件夹
- 起草、总结和重写文档、报告和会议记录
- 自动化浏览器工作流程，如研究和表单填写
- 从文件和笔记生成每周更新
- 从文档和日历准备会议材料

<br />

## 支持的模型和提供商

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
- Ollama（本地模型）
- LM Studio（本地模型）

<br />

## 隐私和本地优先

Anastomotic 在您的机器上本地运行。您的文件保留在您的设备上，您可以选择它可以访问哪些文件夹。

<br />

## 系统要求

- macOS（Apple Silicon）
- Windows 11
- Ubuntu (ARM64)
- Ubuntu (x64)

<br />

---

<br />

## 如何使用

> **设置只需 2 分钟。**

| 步骤  | 操作             | 详情                                                                                               |
| :---: | ---------------- | -------------------------------------------------------------------------------------------------- |
| **1** | **安装应用**     | 下载 DMG 并将其拖入应用程序文件夹                                                                  |
| **2** | **连接您的 AI**  | 使用您自己的 Google、OpenAI、Anthropic（或其他）API 密钥——或使用 ChatGPT（Plus/Pro）登录。无订阅。 |
| **3** | **授予访问权限** | 选择它可以查看哪些文件夹。您保持控制权。                                                           |
| **4** | **开始工作**     | 让它总结文档、整理文件夹或创建报告。您批准所有操作。                                               |

<br />

<br />

<div align="center">

[**下载 Mac 版（Apple Silicon）**](https://downloads.anastomotic.ai/downloads/0.4.8/macos/Anastomotic-0.4.8-mac-arm64.dmg) · [**下载 Mac 版（Intel）**](https://downloads.anastomotic.ai/downloads/0.4.8/macos/Anastomotic-0.4.8-mac-x64.dmg) · [**下载 Windows 11 版**](https://downloads.anastomotic.ai/downloads/0.4.8/windows/Anastomotic-0.4.8-win-x64.exe) · [**下载 Linux 版（ARM64）**](https://downloads.anastomotic.ai/downloads/0.4.8/linux/Anastomotic-0.4.8-linux-arm64.AppImage) · [**下载 Linux 版（x64）**](https://downloads.anastomotic.ai/downloads/0.4.8/linux/Anastomotic-0.4.8-linux-x86_64.AppImage) · [**下载 Linux 版（.deb x64）**](https://downloads.anastomotic.ai/downloads/0.4.8/linux/Anastomotic-0.4.8-linux-amd64.deb)

</div>

<br />

---

<br />

<br />

## 常见问题

**Anastomotic 是本地运行的吗？**
是的。Anastomotic 在您的机器上本地运行，您可以控制它可以访问哪些文件夹。

**我需要 API 密钥吗？**
您可以使用您自己的 API 密钥（OpenAI、Anthropic、Google、xAI 等）或通过 Ollama 运行本地模型。

**Anastomotic 是免费的吗？**
是的。Anastomotic 是开源的，采用 MIT 许可证。

**支持哪些平台？**
macOS（Apple Silicon）和 Windows 11 现已可用。 Ubuntu (ARM64) 和 Ubuntu (x64) 同样支持。

<br />

---

<br />

## 开发

```bash
pnpm install
pnpm dev
```

就这样。

<details>
<summary><strong>前提条件</strong></summary>

- Node.js 20+
- pnpm 9+

</details>

<details>
<summary><strong>所有命令</strong></summary>

| 命令                                         | 描述                             |
| -------------------------------------------- | -------------------------------- |
| `pnpm dev`                                   | 在开发模式下运行桌面应用         |
| `pnpm dev:clean`                             | 干净启动的开发模式               |
| `pnpm build`                                 | 构建所有工作区                   |
| `pnpm build:desktop`                         | 仅构建桌面应用                   |
| `pnpm -F @anastomotic/desktop package:win`   | 构建 Windows 安装程序 (x64)      |
| `pnpm -F @anastomotic/desktop package:linux` | 构建 Linux 构件 (AppImage + deb) |
| `pnpm lint`                                  | TypeScript 检查                  |
| `pnpm typecheck`                             | 类型验证                         |
| `pnpm -F @anastomotic/desktop test:e2e`      | Playwright E2E 测试              |

</details>

<details>
<summary><strong>环境变量</strong></summary>

| 变量              | 描述                       |
| ----------------- | -------------------------- |
| `CLEAN_START=1`   | 应用启动时清除所有存储数据 |
| `E2E_SKIP_AUTH=1` | 跳过引导流程（用于测试）   |

</details>

<details>
<summary><strong>架构</strong></summary>

```
apps/
  desktop/        # Electron 应用（main + preload + renderer）
packages/
  shared/         # 共享 TypeScript 类型
```

桌面应用使用 Electron 和通过 Vite 打包的 React UI。主进程使用 `node-pty` 生成 [OpenCode](https://github.com/sst/opencode) CLI 来执行任务。API 密钥安全存储在操作系统密钥链中。

详细架构文档请参阅 [CLAUDE.md](CLAUDE.md)。

</details>

<br />

---

<br />

## 贡献

欢迎贡献！随时提交 PR。

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

**[Anastomotic 官网](https://www.anastomotic.ai/)** · **[Anastomotic 博客](https://www.anastomotic.ai/blog/)** · **[Anastomotic 发布版本](https://github.com/RajdeepKushwaha5/accomplish/releases)** · **[问题反馈](https://github.com/RajdeepKushwaha5/accomplish/issues)** · **[Twitter](https://x.com/ANASTOMOTIC_ai)**

<br />

MIT 许可证 · 由 [Anastomotic](https://www.anastomotic.ai) 构建

<br />

**关键词：** AI 代理、AI 桌面代理、桌面自动化、文件管理、文档创建、浏览器自动化、本地优先、macOS、隐私优先、开源、Electron、计算机使用、AI 助手、工作流自动化、OpenAI、Anthropic、Google、xAI、Claude、GPT-4、Ollama

</div>
