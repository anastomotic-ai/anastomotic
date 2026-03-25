<p align="center">
  <a href="README.md">English</a> | <a href="README.zh-CN.md">中文</a> | <strong>日本語</strong> | <a href="README.ko.md">한국어</a> | <a href="README.ru.md">Русский</a> | <a href="README.es.md">Español</a> | <a href="README.tr.md">Türkçe</a> | <a href="README.ar.md">العربية</a> | <a href="README.id.md">Bahasa Indonesia</a> | <a href="README.ta.md">தமிழ்</a> | <a href="README.hi.md">हिन्दी</a>
</p>

# Anastomotic™ - オープンソースAIデスクトップエージェント

Anastomoticは、お使いのマシン上でローカルにファイル管理、ドキュメント作成、ブラウザタスクを自動化するオープンソースAIデスクトップエージェントです。独自のAPIキー（OpenAI、Anthropic、Google、xAI）を使用するか、Ollama経由でローカルモデルを実行できます。

<p align="center">
  <strong>お使いのマシン上でローカルに実行。独自のAPIキーまたはローカルモデルを使用。MITライセンス。</strong>
</p>

<p align="center">
  <a href="https://downloads.anastomotic.ai/downloads/0.4.8/macos/Anastomotic-0.4.8-mac-arm64.dmg"><strong>Mac用ダウンロード（Apple Silicon）</strong></a>
  ·
  <a href="https://downloads.anastomotic.ai/downloads/0.4.8/macos/Anastomotic-0.4.8-mac-x64.dmg"><strong>Mac用ダウンロード（Intel）</strong></a>
  ·
  <a href="https://downloads.anastomotic.ai/downloads/0.4.8/windows/Anastomotic-0.4.8-win-x64.exe"><strong>Windows 11用ダウンロード</strong></a>
  ·
  <a href="https://downloads.anastomotic.ai/downloads/0.4.8/linux/Anastomotic-0.4.8-linux-arm64.AppImage"><strong>Linux用ダウンロード（ARM64）</strong></a>
  ·
  <a href="https://downloads.anastomotic.ai/downloads/0.4.8/linux/Anastomotic-0.4.8-linux-x86_64.AppImage"><strong>Linux用ダウンロード（x64）</strong></a>
  ·
  <a href="https://downloads.anastomotic.ai/downloads/0.4.8/linux/Anastomotic-0.4.8-linux-amd64.deb"><strong>Linux用ダウンロード（.deb x64）</strong></a>
  ·
  <a href="https://www.anastomotic.ai/">Anastomoticウェブサイト</a>
  ·
  <a href="https://www.anastomotic.ai/blog/">Anastomoticブログ</a>
  ·
  <a href="https://github.com/RajdeepKushwaha5/accomplish/releases">Anastomoticリリース</a>
</p>

<br />

---

<br />

## 他との違い

<table>
<tr>
<td width="50%" valign="top" align="center">

### 🖥️ ローカルで動作

<div align="left">

- ファイルはお使いのマシン上に保存
- アクセスできるフォルダを自分で決定
- Anastomotic（または他の誰か）にデータは送信されません

</div>

</td>
<td width="50%" valign="top" align="center">

### 🔑 自分のAIを使用

<div align="left">

- 独自のAPIキーを使用（OpenAI、Anthropicなど）
- または[Ollama](https://ollama.com)で実行（APIキー不要）
- サブスクリプションなし、アップセルなし
- サービスではなくツールです

</div>

</td>
</tr>
<tr>
<td width="50%" valign="top" align="center">

### 📖 オープンソース

<div align="left">

- すべてのコードがGitHubに公開
- MITライセンス
- 変更、フォーク、壊す、修正する、自由自在

</div>

</td>
<td width="50%" valign="top" align="center">

### ⚡ チャットだけでなく実行

<div align="left">

- ファイル管理
- ドキュメント作成
- カスタム自動化
- スキル学習

</div>

</td>
</tr>
</table>

<br />

---

<br />

## 実際にできること

|                                                            |                                                              |                                                            |
| :--------------------------------------------------------- | :----------------------------------------------------------- | :--------------------------------------------------------- |
| **📁 ファイル管理**                                        | **✍️ ドキュメント作成**                                      | **🔗 ツール連携**                                          |
| コンテンツやルールに基づいてファイルを整理、リネーム、移動 | ドキュメントの作成、要約、書き換えを指示                     | Notion、Google Drive、Dropboxなどと連携（ローカルAPI経由） |
|                                                            |                                                              |                                                            |
| **⚙️ カスタムスキル**                                      | **🛡️ 完全なコントロール**                                    |                                                            |
| 繰り返しワークフローを定義してスキルとして保存             | すべてのアクションを承認。ログを確認可能。いつでも停止可能。 |                                                            |

<br />

## ユースケース

- プロジェクト、ファイルタイプ、日付でフォルダを整理
- ドキュメント、レポート、会議メモの作成、要約、書き換え
- 調査やフォーム入力などのブラウザワークフローを自動化
- ファイルとメモから週次アップデートを生成
- ドキュメントとカレンダーから会議資料を準備

<br />

## 対応モデルとプロバイダー

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
- Ollama（ローカルモデル）
- LM Studio（ローカルモデル）

<br />

## プライバシーとローカルファースト

Anastomoticはお使いのマシン上でローカルに実行されます。ファイルはデバイス上に保存され、アクセスできるフォルダを選択できます。

<br />

## システム要件

- macOS（Apple Silicon）
- Windows 11
- Ubuntu (ARM64)
- Ubuntu (x64)

<br />

---

<br />

## 使い方

> **セットアップは2分で完了。**

| ステップ | アクション               | 詳細                                                                                                                      |
| :------: | ------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
|  **1**   | **アプリをインストール** | DMGをダウンロードしてアプリケーションフォルダにドラッグ                                                                   |
|  **2**   | **AIを接続**             | Google、OpenAI、Anthropic（またはその他）のAPIキーを使用、またはChatGPT（Plus/Pro）でサインイン。サブスクリプションなし。 |
|  **3**   | **アクセス権を付与**     | アクセス可能なフォルダを選択。あなたがコントロール。                                                                      |
|  **4**   | **作業開始**             | ドキュメントの要約、フォルダの整理、レポートの作成を依頼。すべてを承認。                                                  |

<br />

<br />

<div align="center">

[**Mac用ダウンロード（Apple Silicon）**](https://downloads.anastomotic.ai/downloads/0.4.8/macos/Anastomotic-0.4.8-mac-arm64.dmg) · [**Mac用ダウンロード（Intel）**](https://downloads.anastomotic.ai/downloads/0.4.8/macos/Anastomotic-0.4.8-mac-x64.dmg) · [**Windows 11用ダウンロード**](https://downloads.anastomotic.ai/downloads/0.4.8/windows/Anastomotic-0.4.8-win-x64.exe) · [**Linux用ダウンロード（ARM64）**](https://downloads.anastomotic.ai/downloads/0.4.8/linux/Anastomotic-0.4.8-linux-arm64.AppImage) · [**Linux用ダウンロード（x64）**](https://downloads.anastomotic.ai/downloads/0.4.8/linux/Anastomotic-0.4.8-linux-x86_64.AppImage) · [**Linux用ダウンロード（.deb x64）**](https://downloads.anastomotic.ai/downloads/0.4.8/linux/Anastomotic-0.4.8-linux-amd64.deb)

</div>

<br />

---

<br />

<br />

## よくある質問

**Anastomoticはローカルで動作しますか？**
はい。Anastomoticはお使いのマシン上でローカルに動作し、アクセスできるフォルダを制御できます。

**APIキーは必要ですか？**
独自のAPIキー（OpenAI、Anthropic、Google、xAIなど）を使用するか、Ollama経由でローカルモデルを実行できます。

**Anastomoticは無料ですか？**
はい。AnastomoticはオープンソースでMITライセンスです。

**どのプラットフォームに対応していますか？**
macOS（Apple Silicon）とWindows 11が利用可能です。 Ubuntu (ARM64) と Ubuntu (x64) もサポートされています。

<br />

---

<br />

## 開発

```bash
pnpm install
pnpm dev
```

以上です。

<details>
<summary><strong>前提条件</strong></summary>

- Node.js 20+
- pnpm 9+

</details>

<details>
<summary><strong>すべてのコマンド</strong></summary>

| コマンド                                     | 説明                                            |
| -------------------------------------------- | ----------------------------------------------- |
| `pnpm dev`                                   | 開発モードでデスクトップアプリを実行            |
| `pnpm dev:clean`                             | クリーンスタートで開発モード                    |
| `pnpm build`                                 | すべてのワークスペースをビルド                  |
| `pnpm build:desktop`                         | デスクトップアプリのみビルド                    |
| `pnpm -F @anastomotic/desktop package:win`   | Windows インストーラーをビルド (x64)            |
| `pnpm -F @anastomotic/desktop package:linux` | Linux アーティファクトをビルド (AppImage + deb) |
| `pnpm lint`                                  | TypeScriptチェック                              |
| `pnpm typecheck`                             | 型検証                                          |
| `pnpm -F @anastomotic/desktop test:e2e`      | Playwright E2Eテスト                            |

</details>

<details>
<summary><strong>環境変数</strong></summary>

| 変数              | 説明                                         |
| ----------------- | -------------------------------------------- |
| `CLEAN_START=1`   | アプリ起動時にすべての保存データをクリア     |
| `E2E_SKIP_AUTH=1` | オンボーディングフローをスキップ（テスト用） |

</details>

<details>
<summary><strong>アーキテクチャ</strong></summary>

```
apps/
  desktop/        # Electronアプリ（main + preload + renderer）
packages/
  shared/         # 共有TypeScript型
```

デスクトップアプリはViteでバンドルされたReact UIを持つElectronを使用しています。メインプロセスは`node-pty`を使用して[OpenCode](https://github.com/sst/opencode) CLIを生成してタスクを実行します。APIキーはOSキーチェーンに安全に保存されます。

詳細なアーキテクチャドキュメントは[CLAUDE.md](CLAUDE.md)を参照してください。

</details>

<br />

---

<br />

## コントリビューション

コントリビューション歓迎！お気軽にPRを開いてください。

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

**[Anastomoticウェブサイト](https://www.anastomotic.ai/)** · **[Anastomoticブログ](https://www.anastomotic.ai/blog/)** · **[Anastomoticリリース](https://github.com/RajdeepKushwaha5/accomplish/releases)** · **[Issues](https://github.com/RajdeepKushwaha5/accomplish/issues)** · **[Twitter](https://x.com/ANASTOMOTIC_ai)**

<br />

MITライセンス · [Anastomotic](https://www.anastomotic.ai)製

<br />

**キーワード：** AIエージェント、AIデスクトップエージェント、デスクトップ自動化、ファイル管理、ドキュメント作成、ブラウザ自動化、ローカルファースト、macOS、プライバシーファースト、オープンソース、Electron、コンピューター使用、AIアシスタント、ワークフロー自動化、OpenAI、Anthropic、Google、xAI、Claude、GPT-4、Ollama

</div>
