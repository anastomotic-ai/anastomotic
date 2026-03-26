/**
 * Anastomotic API - Interface to the Electron main process
 *
 * This module provides type-safe access to the Anastomotic API
 * exposed by the preload script via contextBridge.
 */

import type {
  Task,
  TaskConfig,
  TaskUpdateEvent,
  TaskStatus,
  PermissionRequest,
  PermissionResponse,
  TaskProgress,
  ApiKeyConfig,
  TaskMessage,
  BedrockCredentials,
  VertexCredentials,
  ProviderSettings,
  ProviderId,
  ProviderType,
  ConnectedProvider,
  TodoItem,
  ToolSupportStatus,
  Skill,
  McpConnector,
  FileAttachmentInfo,
  CloudBrowserConfig,
  Workspace,
  WorkspaceCreateInput,
  WorkspaceUpdateInput,
  KnowledgeNote,
  KnowledgeNoteCreateInput,
  KnowledgeNoteUpdateInput,
  ScheduledTask,
  CostSummary,
  CostBreakdown,
  CostRecord,
  Pipeline,
  PipelineCreateInput,
  PipelineUpdateInput,
  PipelineRun,
  MemoryEntry,
  MemorySearchResult,
  MemoryStats,
  BehavioralPreference,
  FileWatcherConfig,
  ProactiveAlert,
  ProactiveConfig,
  Team,
  TeamMember,
  SharedWorkspace,
  AuditLogEntry,
  InstalledPlugin,
  MediaAttachment,
  StructuredOutput,
  LocalModelConfig,
  OfflineQueueItem,
} from '@anastomotic_ai/agent-core/common';
import type { StoredFavorite } from '@anastomotic_ai/agent-core';

// Define the API interface
interface AnastomoticAPI {
  // App info
  getVersion(): Promise<string>;
  getPlatform(): Promise<string>;

  // Shell
  openExternal(url: string): Promise<void>;

  // Task operations
  startTask(config: TaskConfig): Promise<Task>;
  cancelTask(taskId: string): Promise<void>;
  interruptTask(taskId: string): Promise<void>;
  getTask(taskId: string): Promise<Task | null>;
  listTasks(): Promise<Task[]>;
  deleteTask(taskId: string): Promise<void>;
  clearTaskHistory(): Promise<void>;

  // Permission responses
  respondToPermission(response: PermissionResponse): Promise<void>;

  // Session management
  resumeSession(
    sessionId: string,
    prompt: string,
    taskId?: string,
    attachments?: FileAttachmentInfo[],
  ): Promise<Task>;

  // Settings
  getApiKeys(): Promise<ApiKeyConfig[]>;
  addApiKey(
    provider: ProviderType | 'elevenlabs',
    key: string,
    label?: string,
  ): Promise<ApiKeyConfig>;
  removeApiKey(id: string): Promise<void>;
  getNotificationsEnabled(): Promise<boolean>;
  setNotificationsEnabled(enabled: boolean): Promise<void>;
  getDebugMode(): Promise<boolean>;
  setDebugMode(enabled: boolean): Promise<void>;
  getAutoLearnEnabled(): Promise<boolean>;
  setAutoLearnEnabled(enabled: boolean): Promise<void>;
  getTheme(): Promise<string>;
  setTheme(theme: string): Promise<void>;
  onThemeChange?(callback: (data: { theme: string; resolved: string }) => void): () => void;
  getAppSettings(): Promise<{ debugMode: boolean; onboardingComplete: boolean; theme: string }>;
  getCloudBrowserConfig(): Promise<CloudBrowserConfig | null>;
  setCloudBrowserConfig(config: CloudBrowserConfig | null): Promise<void>;
  getOpenAiBaseUrl(): Promise<string>;
  setOpenAiBaseUrl(baseUrl: string): Promise<void>;
  getOpenAiOauthStatus(): Promise<{ connected: boolean; expires?: number }>;
  loginOpenAiWithChatGpt(): Promise<{ ok: boolean; openedUrl?: string }>;
  getSlackMcpOauthStatus(): Promise<{ connected: boolean; pendingAuthorization: boolean }>;
  loginSlackMcp(): Promise<{ ok: boolean }>;
  logoutSlackMcp(): Promise<void>;
  getCopilotOAuthStatus(): Promise<{ connected: boolean; username?: string; expiresAt?: number }>;
  loginGithubCopilot(): Promise<{
    ok: boolean;
    userCode?: string;
    verificationUri?: string;
    expiresIn?: number;
  }>;
  logoutGithubCopilot(): Promise<void>;

  // API Key management
  hasApiKey(): Promise<boolean>;
  setApiKey(key: string): Promise<void>;
  getApiKey(): Promise<string | null>;
  validateApiKey(key: string): Promise<{ valid: boolean; error?: string }>;
  validateApiKeyForProvider(
    provider: string,
    key: string,
    options?: Record<string, unknown>,
  ): Promise<{ valid: boolean; error?: string }>;
  clearApiKey(): Promise<void>;

  // Multi-provider API keys
  getAllApiKeys(): Promise<Record<string, { exists: boolean; prefix?: string }>>;
  hasAnyApiKey(): Promise<boolean>;

  // Onboarding
  getOnboardingComplete(): Promise<boolean>;
  setOnboardingComplete(complete: boolean): Promise<void>;

  // OpenCode CLI
  checkOpenCodeCli(): Promise<{
    installed: boolean;
    version: string | null;
    installCommand: string;
  }>;
  getOpenCodeVersion(): Promise<string | null>;

  // Model selection
  getSelectedModel(): Promise<{
    provider: string;
    model: string;
    baseUrl?: string;
    deploymentName?: string;
  } | null>;
  setSelectedModel(model: {
    provider: string;
    model: string;
    baseUrl?: string;
    deploymentName?: string;
  }): Promise<void>;

  // Ollama configuration
  testOllamaConnection(url: string): Promise<{
    success: boolean;
    models?: Array<{
      id: string;
      displayName: string;
      size: number;
      toolSupport?: ToolSupportStatus;
    }>;
    error?: string;
  }>;
  getOllamaConfig(): Promise<{
    baseUrl: string;
    enabled: boolean;
    lastValidated?: number;
    models?: Array<{
      id: string;
      displayName: string;
      size: number;
      toolSupport?: ToolSupportStatus;
    }>;
  } | null>;
  setOllamaConfig(
    config: {
      baseUrl: string;
      enabled: boolean;
      lastValidated?: number;
      models?: Array<{
        id: string;
        displayName: string;
        size: number;
        toolSupport?: ToolSupportStatus;
      }>;
    } | null,
  ): Promise<void>;

  // Azure Foundry configuration
  getAzureFoundryConfig(): Promise<{
    baseUrl: string;
    deploymentName: string;
    authType: 'api-key' | 'entra-id';
    enabled: boolean;
    lastValidated?: number;
  } | null>;
  setAzureFoundryConfig(
    config: {
      baseUrl: string;
      deploymentName: string;
      authType: 'api-key' | 'entra-id';
      enabled: boolean;
      lastValidated?: number;
    } | null,
  ): Promise<void>;
  testAzureFoundryConnection(config: {
    endpoint: string;
    deploymentName: string;
    authType: 'api-key' | 'entra-id';
    apiKey?: string;
  }): Promise<{ success: boolean; error?: string }>;
  saveAzureFoundryConfig(config: {
    endpoint: string;
    deploymentName: string;
    authType: 'api-key' | 'entra-id';
    apiKey?: string;
  }): Promise<void>;

  // Dynamic model fetching (generic, config-driven)
  fetchProviderModels(
    providerId: string,
    options?: { baseUrl?: string; zaiRegion?: string },
  ): Promise<{
    success: boolean;
    models?: Array<{ id: string; name: string }>;
    error?: string;
  }>;

  // OpenRouter configuration
  fetchOpenRouterModels(): Promise<{
    success: boolean;
    models?: Array<{ id: string; name: string; provider: string; contextLength: number }>;
    error?: string;
  }>;

  // LiteLLM configuration
  testLiteLLMConnection(
    url: string,
    apiKey?: string,
  ): Promise<{
    success: boolean;
    models?: Array<{ id: string; name: string; provider: string; contextLength: number }>;
    error?: string;
  }>;
  fetchLiteLLMModels(): Promise<{
    success: boolean;
    models?: Array<{ id: string; name: string; provider: string; contextLength: number }>;
    error?: string;
  }>;
  getLiteLLMConfig(): Promise<{
    baseUrl: string;
    enabled: boolean;
    lastValidated?: number;
    models?: Array<{ id: string; name: string; provider: string; contextLength: number }>;
  } | null>;
  setLiteLLMConfig(
    config: {
      baseUrl: string;
      enabled: boolean;
      lastValidated?: number;
      models?: Array<{ id: string; name: string; provider: string; contextLength: number }>;
    } | null,
  ): Promise<void>;

  // LM Studio configuration
  testLMStudioConnection(url: string): Promise<{
    success: boolean;
    models?: Array<{ id: string; name: string; toolSupport: ToolSupportStatus }>;
    error?: string;
  }>;
  fetchLMStudioModels(): Promise<{
    success: boolean;
    models?: Array<{ id: string; name: string; toolSupport: ToolSupportStatus }>;
    error?: string;
  }>;
  getLMStudioConfig(): Promise<{
    baseUrl: string;
    enabled: boolean;
    lastValidated?: number;
    models?: Array<{ id: string; name: string; toolSupport: ToolSupportStatus }>;
  } | null>;
  setLMStudioConfig(
    config: {
      baseUrl: string;
      enabled: boolean;
      lastValidated?: number;
      models?: Array<{ id: string; name: string; toolSupport: ToolSupportStatus }>;
    } | null,
  ): Promise<void>;

  // NVIDIA NIM configuration
  testNimConnection(
    url: string,
    apiKey: string,
  ): Promise<{
    success: boolean;
    models?: Array<{ id: string; name: string; provider: string; contextLength: number }>;
    error?: string;
  }>;
  fetchNimModels(): Promise<{
    success: boolean;
    models?: Array<{ id: string; name: string; provider: string; contextLength: number }>;
    error?: string;
  }>;

  // Custom OpenAI-compatible endpoint configuration
  testCustomConnection(
    baseUrl: string,
    apiKey?: string,
  ): Promise<{ success: boolean; error?: string }>;

  // Bedrock configuration
  validateBedrockCredentials(credentials: string): Promise<{ valid: boolean; error?: string }>;
  saveBedrockCredentials(credentials: string): Promise<ApiKeyConfig>;
  getBedrockCredentials(): Promise<BedrockCredentials | null>;
  fetchBedrockModels(credentials: string): Promise<{
    success: boolean;
    models: Array<{ id: string; name: string; provider: string }>;
    error?: string;
  }>;

  // Vertex AI configuration
  validateVertexCredentials(credentials: string): Promise<{ valid: boolean; error?: string }>;
  saveVertexCredentials(credentials: string): Promise<ApiKeyConfig>;
  getVertexCredentials(): Promise<VertexCredentials | null>;
  fetchVertexModels(credentials: string): Promise<{
    success: boolean;
    models: Array<{ id: string; name: string; provider: string }>;
    error?: string;
  }>;
  detectVertexProject(): Promise<{ success: boolean; projectId: string | null }>;
  listVertexProjects(): Promise<{
    success: boolean;
    projects: Array<{ projectId: string; name: string }>;
    error?: string;
  }>;

  // E2E Testing
  isE2EMode(): Promise<boolean>;

  // Provider Settings API
  getProviderSettings(): Promise<ProviderSettings>;
  setActiveProvider(providerId: ProviderId | null): Promise<void>;
  getConnectedProvider(providerId: ProviderId): Promise<ConnectedProvider | null>;
  setConnectedProvider(providerId: ProviderId, provider: ConnectedProvider): Promise<void>;
  removeConnectedProvider(providerId: ProviderId): Promise<void>;
  updateProviderModel(providerId: ProviderId, modelId: string | null): Promise<void>;
  setProviderDebugMode(enabled: boolean): Promise<void>;
  getProviderDebugMode(): Promise<boolean>;

  // Todo operations
  getTodosForTask(taskId: string): Promise<TodoItem[]>;

  // Favorites
  addFavorite(taskId: string): Promise<void>;
  removeFavorite(taskId: string): Promise<void>;
  listFavorites(): Promise<StoredFavorite[]>;
  isFavorite(taskId: string): Promise<boolean>;

  // File attachments
  pickFolder(): Promise<string | null>;
  pickFiles(): Promise<FileAttachmentInfo[]>;
  getFilePath(file: File): string;
  processDroppedFiles(paths: string[]): Promise<FileAttachmentInfo[]>;

  // Event subscriptions
  onTaskUpdate(callback: (event: TaskUpdateEvent) => void): () => void;
  onTaskUpdateBatch?(
    callback: (event: { taskId: string; messages: TaskMessage[] }) => void,
  ): () => void;
  onPermissionRequest(callback: (request: PermissionRequest) => void): () => void;
  onTaskProgress(callback: (progress: TaskProgress) => void): () => void;
  onDebugLog(callback: (log: unknown) => void): () => void;
  onDebugModeChange?(callback: (data: { enabled: boolean }) => void): () => void;
  onTaskStatusChange?(callback: (data: { taskId: string; status: TaskStatus }) => void): () => void;
  onTaskSummary?(callback: (data: { taskId: string; summary: string }) => void): () => void;
  onTodoUpdate?(callback: (data: { taskId: string; todos: TodoItem[] }) => void): () => void;
  onAuthError?(callback: (data: { providerId: string; message: string }) => void): () => void;

  // Speech-to-Text
  speechIsConfigured(): Promise<boolean>;
  speechGetConfig(): Promise<{ enabled: boolean; hasApiKey: boolean; apiKeyPrefix?: string }>;
  speechValidate(apiKey?: string): Promise<{ valid: boolean; error?: string }>;
  speechTranscribe(
    audioData: ArrayBuffer,
    mimeType?: string,
  ): Promise<
    | {
        success: true;
        result: { text: string; confidence?: number; duration: number; timestamp: number };
      }
    | {
        success: false;
        error: { code: string; message: string };
      }
  >;

  // Logging
  logEvent(payload: {
    level?: string;
    message: string;
    context?: Record<string, unknown>;
  }): Promise<unknown>;
  exportLogs(): Promise<{ success: boolean; path?: string; error?: string; reason?: string }>;

  // Debug bug reporting
  captureScreenshot(): Promise<{
    success: boolean;
    data?: string;
    width?: number;
    height?: number;
    error?: string;
  }>;
  captureAxtree(): Promise<{ success: boolean; data?: string; error?: string }>;
  generateBugReport(data: {
    taskId?: string;
    taskPrompt?: string;
    taskStatus?: string;
    taskCreatedAt?: string;
    taskCompletedAt?: string;
    messages?: unknown[];
    debugLogs?: unknown[];
    screenshot?: string;
    axtree?: string;
    appVersion?: string;
    platform?: string;
  }): Promise<{ success: boolean; path?: string; error?: string; reason?: string }>;

  // Skills management
  getSkills(): Promise<Skill[]>;
  getEnabledSkills(): Promise<Skill[]>;
  setSkillEnabled(id: string, enabled: boolean): Promise<void>;
  getSkillContent(id: string): Promise<string | null>;
  getUserSkillsPath(): Promise<string>;
  pickSkillFile(): Promise<string | null>;
  addSkillFromFile(filePath: string): Promise<Skill>;
  pickSkillFolder(): Promise<string | null>;
  addSkillFromFolder(folderPath: string): Promise<Skill | null>;
  addSkillFromGitHub(rawUrl: string): Promise<Skill>;
  deleteSkill(id: string): Promise<void>;
  resyncSkills(): Promise<Skill[]>;
  openSkillInEditor(filePath: string): Promise<void>;
  showSkillInFolder(filePath: string): Promise<void>;

  // Skill Marketplace
  getMarketplaceCatalog(): Promise<
    Array<{
      id: string;
      name: string;
      description: string;
      author: string;
      category: string;
      githubUrl: string;
      downloads: number;
      stars: number;
      tags: string[];
      verified: boolean;
    }>
  >;
  searchMarketplace(
    query: string,
    category?: string,
  ): Promise<
    Array<{
      id: string;
      name: string;
      description: string;
      author: string;
      category: string;
      githubUrl: string;
      downloads: number;
      stars: number;
      tags: string[];
      verified: boolean;
    }>
  >;
  installMarketplaceSkill(githubUrl: string): Promise<Skill | null>;

  // Webhook Notifications
  getWebhooks(): Promise<
    Array<{
      url: string;
      label: string;
      events: string[];
      enabled: boolean;
    }>
  >;
  saveWebhooks(
    webhooks: Array<{
      url: string;
      label: string;
      events: string[];
      enabled: boolean;
    }>,
  ): Promise<void>;
  testWebhook(url: string, events: string[]): Promise<void>;

  // Deep Memory
  createMemory(input: {
    workspaceId?: string | null;
    scope: string;
    category: string;
    content: string;
    keywords?: string;
  }): Promise<MemoryEntry>;
  listMemories(workspaceId?: string, scope?: string, category?: string): Promise<MemoryEntry[]>;
  searchMemory(query: string, workspaceId?: string): Promise<MemorySearchResult[]>;
  deleteMemory(id: string): Promise<boolean>;
  clearMemories(workspaceId?: string): Promise<void>;
  getMemoryStats(workspaceId?: string): Promise<MemoryStats>;
  listPreferences(workspaceId?: string): Promise<BehavioralPreference[]>;
  upsertPreference(input: {
    workspaceId?: string | null;
    key: string;
    label: string;
    value: string;
  }): Promise<BehavioralPreference>;
  deletePreference(id: string): Promise<boolean>;

  // Proactive Agent
  createFileWatcher(input: {
    name: string;
    path: string;
    patterns: string[];
    action: string;
  }): Promise<FileWatcherConfig>;
  listFileWatchers(): Promise<FileWatcherConfig[]>;
  updateFileWatcherStatus(id: string, status: string): Promise<void>;
  deleteFileWatcher(id: string): Promise<boolean>;
  listAlerts(status?: string, limit?: number): Promise<ProactiveAlert[]>;
  dismissAlert(id: string): Promise<void>;
  clearDismissedAlerts(): Promise<void>;
  startProactiveAgent(config?: Partial<ProactiveConfig>): Promise<void>;
  stopProactiveAgent(): Promise<void>;
  getDefaultProactiveConfig(): Promise<ProactiveConfig>;

  // Team & Enterprise
  createTeam(input: { name: string; description: string; ownerId: string }): Promise<Team>;
  listTeams(): Promise<Team[]>;
  deleteTeam(id: string): Promise<boolean>;
  addTeamMember(input: {
    teamId: string;
    name: string;
    email: string;
    role: string;
  }): Promise<TeamMember>;
  listTeamMembers(teamId: string): Promise<TeamMember[]>;
  removeTeamMember(id: string): Promise<boolean>;
  shareWorkspace(teamId: string, workspaceId: string, sharedBy: string): Promise<SharedWorkspace>;
  listSharedWorkspaces(teamId: string): Promise<SharedWorkspace[]>;
  unshareWorkspace(id: string): Promise<boolean>;
  addAuditLog(input: {
    teamId: string;
    userId: string;
    action: string;
    resource: string;
    details: string;
  }): Promise<AuditLogEntry>;
  listAuditLog(teamId: string, limit?: number): Promise<AuditLogEntry[]>;

  // Plugin API
  installPlugin(input: {
    manifestId: string;
    name: string;
    version: string;
    description: string;
    author: string;
    entryPoint: string;
    hooks: Array<{ event: string; handler: string }>;
    permissions: string[];
  }): Promise<InstalledPlugin>;
  listPlugins(): Promise<InstalledPlugin[]>;
  getPlugin(id: string): Promise<InstalledPlugin | null>;
  updatePluginStatus(id: string, status: string): Promise<void>;
  uninstallPlugin(id: string): Promise<boolean>;

  // Multi-Modal Input/Output
  addMediaAttachment(input: {
    type: string;
    source: string;
    name: string;
    mimeType: string;
    sizeBytes: number;
    width?: number;
    height?: number;
    durationMs?: number;
  }): Promise<MediaAttachment>;
  listMediaAttachments(limit?: number): Promise<MediaAttachment[]>;
  deleteMediaAttachment(id: string): Promise<boolean>;
  addStructuredOutput(input: {
    taskId: string;
    outputType: string;
    title: string;
    data: string;
  }): Promise<StructuredOutput>;
  listStructuredOutputs(taskId: string): Promise<StructuredOutput[]>;
  deleteStructuredOutput(id: string): Promise<boolean>;

  // Offline-First / Local Models
  addLocalModel(input: {
    name: string;
    provider: string;
    modelId: string;
    endpoint: string;
    contextLength?: number;
    isDefault?: boolean;
  }): Promise<LocalModelConfig>;
  listLocalModels(): Promise<LocalModelConfig[]>;
  toggleLocalModel(id: string, enabled: boolean): Promise<void>;
  deleteLocalModel(id: string): Promise<boolean>;
  enqueueOfflineTask(input: {
    taskPrompt: string;
    priority?: number;
    localModelId?: string;
  }): Promise<OfflineQueueItem>;
  listOfflineQueue(status?: string): Promise<OfflineQueueItem[]>;
  updateQueueItemStatus(id: string, status: string, errorMessage?: string): Promise<void>;
  clearCompletedQueue(): Promise<void>;

  // Sandbox configuration
  getSandboxConfig(): Promise<{
    mode: 'disabled' | 'native' | 'docker';
    allowedPaths: string[];
    networkRestricted: boolean;
    allowedHosts: string[];
    dockerImage?: string;
    networkPolicy?: { allowOutbound: boolean; allowedHosts?: string[] };
  }>;
  setSandboxConfig(config: {
    mode: 'disabled' | 'native' | 'docker';
    allowedPaths: string[];
    networkRestricted: boolean;
    allowedHosts: string[];
    dockerImage?: string;
    networkPolicy?: { allowOutbound: boolean; allowedHosts?: string[] };
  }): Promise<void>;

  // MCP Connectors
  getConnectors(): Promise<McpConnector[]>;
  addConnector(name: string, url: string): Promise<McpConnector>;
  deleteConnector(id: string): Promise<void>;
  setConnectorEnabled(id: string, enabled: boolean): Promise<void>;
  startConnectorOAuth(connectorId: string): Promise<{ state: string; authUrl: string }>;
  completeConnectorOAuth(state: string, code: string): Promise<McpConnector>;
  disconnectConnector(connectorId: string): Promise<void>;
  onMcpAuthCallback?(callback: (url: string) => void): () => void;

  // Browser Preview API
  startBrowserPreview(taskId: string, pageName?: string): Promise<{ success: boolean }>;
  stopBrowserPreview(taskId: string): Promise<{ stopped: boolean }>;
  getBrowserPreviewStatus(): Promise<{ active: boolean }>;
  onBrowserFrame?(
    callback: (event: {
      taskId: string;
      pageName: string;
      frame: string;
      timestamp: number;
    }) => void,
  ): () => void;
  onBrowserNavigate?(
    callback: (event: { taskId: string; pageName: string; url: string }) => void,
  ): () => void;
  onBrowserStatus?(
    callback: (event: {
      taskId: string;
      pageName: string;
      status: string;
      message?: string;
    }) => void,
  ): () => void;

  // Daemon / Background Mode
  getRunInBackground(): Promise<boolean>;
  setRunInBackground(enabled: boolean): Promise<void>;
  getDaemonSocketPath(): Promise<string>;

  // Workspace management
  listWorkspaces(): Promise<Workspace[]>;
  getActiveWorkspaceId(): Promise<string | null>;
  switchWorkspace(workspaceId: string): Promise<{ success: boolean; reason?: string }>;
  createWorkspace(input: WorkspaceCreateInput): Promise<Workspace>;
  updateWorkspace(id: string, input: WorkspaceUpdateInput): Promise<Workspace | null>;
  deleteWorkspace(id: string): Promise<boolean>;
  onWorkspaceChanged?(callback: (data: { workspaceId: string }) => void): () => void;
  onWorkspaceDeleted?(callback: (data: { workspaceId: string }) => void): () => void;

  // Knowledge Notes
  listKnowledgeNotes(workspaceId: string): Promise<KnowledgeNote[]>;
  createKnowledgeNote(input: KnowledgeNoteCreateInput): Promise<KnowledgeNote>;
  updateKnowledgeNote(
    id: string,
    workspaceId: string,
    input: KnowledgeNoteUpdateInput,
  ): Promise<KnowledgeNote | null>;
  deleteKnowledgeNote(id: string, workspaceId: string): Promise<boolean>;

  // Scheduled Tasks
  createSchedule(cron: string, prompt: string): Promise<ScheduledTask>;
  listSchedules(): Promise<ScheduledTask[]>;
  cancelSchedule(scheduleId: string): Promise<boolean>;

  // Cost Tracking
  getCostSummary(sinceDate?: string): Promise<CostSummary>;
  getCostBreakdown(sinceDate?: string): Promise<CostBreakdown[]>;
  getCostForTask(taskId: string): Promise<CostRecord[]>;

  // Pipelines (Multi-Agent Orchestration)
  listPipelines(): Promise<Pipeline[]>;
  getPipeline(id: string): Promise<Pipeline | null>;
  createPipeline(input: PipelineCreateInput): Promise<Pipeline>;
  updatePipeline(id: string, input: PipelineUpdateInput): Promise<Pipeline | null>;
  deletePipeline(id: string): Promise<boolean>;
  listPipelineRuns(pipelineId?: string): Promise<PipelineRun[]>;
  getPipelineRun(runId: string): Promise<PipelineRun | null>;
  deletePipelineRun(runId: string): Promise<boolean>;
  startPipelineRun(pipelineId: string, prompt: string): Promise<PipelineRun>;
  onPipelineRunStatus(
    callback: (data: { pipelineId: string; runId?: string; status: string }) => void,
  ): () => void;
  onPipelineRunStep(
    callback: (data: {
      runId: string;
      stepIndex: number;
      stepLabel: string;
      status: string;
      error?: string;
    }) => void,
  ): () => void;

  // Smart Suggestions
  getSuggestions(): Promise<
    Array<{
      id: string;
      title: string;
      prompt: string;
      reason: string;
      confidence: 'high' | 'medium' | 'low';
    }>
  >;

  // Git
  getGitRepoInfo(directory: string): Promise<{
    branch: string;
    remoteUrl: string | null;
    isDirty: boolean;
    uncommittedCount: number;
    recentCommits: string[];
  } | null>;

  // WhatsApp integration
  getWhatsAppConfig(): Promise<{
    enabled: boolean;
    status: string;
    phoneNumber?: string;
    lastConnectedAt?: number;
  } | null>;
  connectWhatsApp(): Promise<void>;
  disconnectWhatsApp(): Promise<void>;
  setWhatsAppEnabled(enabled: boolean): Promise<void>;
  onWhatsAppQR(callback: (data: { qr: string; expiresAt: number }) => void): () => void;
  onWhatsAppStatus(callback: (data: { status: string; phone?: string }) => void): () => void;

  // HuggingFace Local LLM
  startHuggingFaceServer(modelId: string): Promise<{ success: boolean; error?: string }>;
  stopHuggingFaceServer(): Promise<{ success: boolean }>;
  getHuggingFaceServerStatus(): Promise<{
    running: boolean;
    modelId?: string;
    port?: number;
  }>;
  testHuggingFaceConnection(): Promise<{ success: boolean; error?: string }>;
  downloadHuggingFaceModel(modelId: string): Promise<{ success: boolean; error?: string }>;
  listHuggingFaceModels(): Promise<{
    cached: Array<{ id: string; displayName: string; downloaded: boolean; sizeBytes?: number }>;
    suggested: Array<{ id: string; displayName: string; downloaded: boolean; sizeBytes?: number }>;
  }>;
  deleteHuggingFaceModel(modelId: string): Promise<{ success: boolean; error?: string }>;
  getHuggingFaceConfig(): Promise<unknown>;
  setHuggingFaceConfig(config: unknown): Promise<void>;
  onHuggingFaceDownloadProgress(
    callback: (progress: { status: string; progress: number; error?: string }) => void,
  ): () => void;
}

interface AnastomoticShell {
  version: string;
  platform: string;
  isElectron: true;
}

// Extend Window interface
declare global {
  interface Window {
    anastomotic?: AnastomoticAPI;
    anastomoticShell?: AnastomoticShell;
  }
}

/**
 * Get the Anastomotic API
 * Throws if not running in Electron
 */
export function getAnastomotic() {
  if (!window.anastomotic) {
    throw new Error('Anastomotic API not available - not running in Electron');
  }
  return {
    ...window.anastomotic,

    validateBedrockCredentials: async (
      credentials: BedrockCredentials,
    ): Promise<{ valid: boolean; error?: string }> => {
      return window.anastomotic!.validateBedrockCredentials(JSON.stringify(credentials));
    },

    saveBedrockCredentials: async (credentials: BedrockCredentials): Promise<ApiKeyConfig> => {
      return window.anastomotic!.saveBedrockCredentials(JSON.stringify(credentials));
    },

    getBedrockCredentials: async (): Promise<BedrockCredentials | null> => {
      return window.anastomotic!.getBedrockCredentials();
    },

    fetchBedrockModels: (credentials: string) =>
      window.anastomotic!.fetchBedrockModels(credentials),

    validateVertexCredentials: async (
      credentials: VertexCredentials,
    ): Promise<{ valid: boolean; error?: string }> => {
      return window.anastomotic!.validateVertexCredentials(JSON.stringify(credentials));
    },

    saveVertexCredentials: async (credentials: VertexCredentials): Promise<ApiKeyConfig> => {
      return window.anastomotic!.saveVertexCredentials(JSON.stringify(credentials));
    },

    getVertexCredentials: async (): Promise<VertexCredentials | null> => {
      return window.anastomotic!.getVertexCredentials();
    },

    fetchVertexModels: (credentials: string) => window.anastomotic!.fetchVertexModels(credentials),

    detectVertexProject: () => window.anastomotic!.detectVertexProject(),

    listVertexProjects: () => window.anastomotic!.listVertexProjects(),
  };
}

/**
 * Check if running in Electron shell
 */
export function isRunningInElectron(): boolean {
  return window.anastomoticShell?.isElectron === true;
}

/**
 * Get shell version if available
 */
export function getShellVersion(): string | null {
  return window.anastomoticShell?.version ?? null;
}

/**
 * Get shell platform if available
 */
export function getShellPlatform(): string | null {
  return window.anastomoticShell?.platform ?? null;
}

/**
 * React hook to use the Anastomotic API
 */
export function useAnastomotic(): AnastomoticAPI {
  const api = window.anastomotic;
  if (!api) {
    throw new Error('Anastomotic API not available - not running in Electron');
  }
  return api;
}
