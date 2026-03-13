import type { OpenClawConfig } from "../config/config.js";
import { coerceSecretRef, resolveSecretInputRef } from "../config/types.secrets.js";
import {
  DEFAULT_COPILOT_API_BASE_URL,
  resolveCopilotApiToken,
} from "../providers/github-copilot-token.js";
import { normalizeOptionalSecretInput } from "../utils/normalize-secret-input.js";
import { ensureAuthProfileStore, listProfilesForProvider } from "./auth-profiles.js";
import { discoverBedrockModels } from "./bedrock-discovery.js";
import {
  buildCloudflareAiGatewayModelDefinition,
  resolveCloudflareAiGatewayBaseUrl,
} from "./cloudflare-ai-gateway.js";
import {
  buildHuggingfaceProvider,
  buildKilocodeProviderWithDiscovery,
  buildOllamaProvider,
  buildVeniceProvider,
  buildVercelAiGatewayProvider,
  buildVllmProvider,
  resolveOllamaApiBase,
} from "./models-config.providers.discovery.js";
import {
  buildBytePlusCodingProvider,
  buildBytePlusProvider,
  buildDoubaoCodingProvider,
  buildDoubaoProvider,
  buildKimiCodingProvider,
  buildKilocodeProvider,
  buildMinimaxPortalProvider,
  buildMinimaxProvider,
  buildModelStudioProvider,
  buildMoonshotProvider,
  buildNvidiaProvider,
  buildOpenAICodexProvider,
  buildOpenrouterProvider,
  buildQianfanProvider,
  buildQwenPortalProvider,
  buildSyntheticProvider,
  buildTogetherProvider,
  buildXiaomiProvider,
  QIANFAN_BASE_URL,
  QIANFAN_DEFAULT_MODEL_ID,
  XIAOMI_DEFAULT_MODEL_ID,
} from "./models-config.providers.static.js";
export {
  buildKimiCodingProvider,
  buildKilocodeProvider,
  buildNvidiaProvider,
  buildModelStudioProvider,
  buildQianfanProvider,
  buildXiaomiProvider,
  MODELSTUDIO_BASE_URL,
  MODELSTUDIO_DEFAULT_MODEL_ID,
  QIANFAN_BASE_URL,
  QIANFAN_DEFAULT_MODEL_ID,
  XIAOMI_DEFAULT_MODEL_ID,
} from "./models-config.providers.static.js";
import {
  MINIMAX_OAUTH_MARKER,
  OLLAMA_LOCAL_AUTH_MARKER,
  QWEN_OAUTH_MARKER,
  isNonSecretApiKeyMarker,
  resolveNonEnvSecretRefApiKeyMarker,
  resolveNonEnvSecretRefHeaderValueMarker,
  resolveEnvSecretRefHeaderValueMarker,
} from "./model-auth-markers.js";
import { resolveAwsSdkEnvVarName, resolveEnvApiKey } from "./model-auth.js";
import { OLLAMA_NATIVE_BASE_URL } from "./ollama-stream.js";
import {
  discoverSiliconFlowModels,
  SILICONFLOW_GLOBAL_BASE_URL,
  SILICONFLOW_CN_BASE_URL,
} from "./siliconflow-models.js";
import {
  buildSyntheticModelDefinition,
  SYNTHETIC_BASE_URL,
  SYNTHETIC_MODEL_CATALOG,
} from "./synthetic-models.js";
import {
  TOGETHER_BASE_URL,
  TOGETHER_MODEL_CATALOG,
  buildTogetherModelDefinition,
} from "./together-models.js";
import { discoverVeniceModels, VENICE_BASE_URL } from "./venice-models.js";

type ModelsConfig = NonNullable<OpenClawConfig["models"]>;
export type ProviderConfig = NonNullable<ModelsConfig["providers"]>[string];

const MINIMAX_PORTAL_BASE_URL = "https://api.minimax.io/anthropic";
const MINIMAX_DEFAULT_MODEL_ID = "MiniMax-M2.1";
const MINIMAX_DEFAULT_VISION_MODEL_ID = "MiniMax-VL-01";
const MINIMAX_DEFAULT_CONTEXT_WINDOW = 200000;
const MINIMAX_DEFAULT_MAX_TOKENS = 8192;
const MINIMAX_OAUTH_PLACEHOLDER = "minimax-oauth";
// Pricing: MiniMax doesn't publish public rates. Override in models.json for accurate costs.
const MINIMAX_API_COST = {
  input: 15,
  output: 60,
  cacheRead: 2,
  cacheWrite: 10,
};

type ProviderModelConfig = NonNullable<ProviderConfig["models"]>[number];

function buildMinimaxModel(params: {
  id: string;
  name: string;
  reasoning: boolean;
  input: ProviderModelConfig["input"];
}): ProviderModelConfig {
  return {
    id: params.id,
    name: params.name,
    reasoning: params.reasoning,
    input: params.input,
    cost: MINIMAX_API_COST,
    contextWindow: MINIMAX_DEFAULT_CONTEXT_WINDOW,
    maxTokens: MINIMAX_DEFAULT_MAX_TOKENS,
  };
}

function buildMinimaxTextModel(params: {
  id: string;
  name: string;
  reasoning: boolean;
}): ProviderModelConfig {
  return buildMinimaxModel({ ...params, input: ["text"] });
}

const XIAOMI_BASE_URL = "https://api.xiaomimimo.com/anthropic";
export const XIAOMI_DEFAULT_MODEL_ID = "mimo-v2-flash";
const XIAOMI_DEFAULT_CONTEXT_WINDOW = 262144;
const XIAOMI_DEFAULT_MAX_TOKENS = 8192;
const XIAOMI_DEFAULT_COST = {
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
};

const MOONSHOT_BASE_URL = "https://api.moonshot.ai/v1";
const MOONSHOT_DEFAULT_MODEL_ID = "kimi-k2.5";
const MOONSHOT_DEFAULT_CONTEXT_WINDOW = 256000;
const MOONSHOT_DEFAULT_MAX_TOKENS = 8192;
const MOONSHOT_DEFAULT_COST = {
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
};

const QWEN_PORTAL_BASE_URL = "https://portal.qwen.ai/v1";
const QWEN_PORTAL_OAUTH_PLACEHOLDER = "qwen-oauth";
const QWEN_PORTAL_DEFAULT_CONTEXT_WINDOW = 128000;
const QWEN_PORTAL_DEFAULT_MAX_TOKENS = 8192;
const QWEN_PORTAL_DEFAULT_COST = {
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
};

const OLLAMA_BASE_URL = OLLAMA_NATIVE_BASE_URL;
const OLLAMA_API_BASE_URL = OLLAMA_BASE_URL;
const OLLAMA_DEFAULT_CONTEXT_WINDOW = 128000;
const OLLAMA_DEFAULT_MAX_TOKENS = 8192;
const OLLAMA_DEFAULT_COST = {
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
};

const VLLM_BASE_URL = "http://127.0.0.1:8000/v1";
const VLLM_DEFAULT_CONTEXT_WINDOW = 128000;
const VLLM_DEFAULT_MAX_TOKENS = 8192;
const VLLM_DEFAULT_COST = {
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
};

export const QIANFAN_BASE_URL = "https://qianfan.baidubce.com/v2";
export const QIANFAN_DEFAULT_MODEL_ID = "deepseek-v3.2";
const QIANFAN_DEFAULT_CONTEXT_WINDOW = 98304;
const QIANFAN_DEFAULT_MAX_TOKENS = 32768;
const QIANFAN_DEFAULT_COST = {
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
};

export const DEEPSEEK_WEB_BASE_URL = "https://chat.deepseek.com";
export const DEEPSEEK_WEB_DEFAULT_MODEL_ID = "deepseek-chat";
const DEEPSEEK_WEB_DEFAULT_CONTEXT_WINDOW = 64000;
const DEEPSEEK_WEB_DEFAULT_MAX_TOKENS = 8192;
const DEEPSEEK_WEB_DEFAULT_COST = {
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
};

export const DOUBAO_WEB_BASE_URL = "https://www.doubao.com";
export const DOUBAO_WEB_DEFAULT_MODEL_ID = "doubao-seed-2.0";
const DOUBAO_WEB_DEFAULT_CONTEXT_WINDOW = 64000;
const DOUBAO_WEB_DEFAULT_MAX_TOKENS = 8192;
const DOUBAO_WEB_DEFAULT_COST = {
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
};

export const CLAUDE_WEB_BASE_URL = "https://claude.ai";
export const CLAUDE_WEB_DEFAULT_MODEL_ID = "claude-sonnet-4-6";
const CLAUDE_WEB_DEFAULT_CONTEXT_WINDOW = 200000;
const CLAUDE_WEB_DEFAULT_MAX_TOKENS = 8192;
const CLAUDE_WEB_DEFAULT_COST = {
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
};

export const CHATGPT_WEB_BASE_URL = "https://chatgpt.com";
export const CHATGPT_WEB_DEFAULT_MODEL_ID = "gpt-4";
const CHATGPT_WEB_DEFAULT_CONTEXT_WINDOW = 128000;
const CHATGPT_WEB_DEFAULT_MAX_TOKENS = 4096;
const CHATGPT_WEB_DEFAULT_COST = {
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
};

export const QWEN_WEB_BASE_URL = "https://chat.qwen.ai";
export const QWEN_WEB_DEFAULT_MODEL_ID = "qwen-max";
const QWEN_WEB_DEFAULT_CONTEXT_WINDOW = 32000;
const QWEN_WEB_DEFAULT_MAX_TOKENS = 8192;
const QWEN_WEB_DEFAULT_COST = {
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
};

export const KIMI_WEB_BASE_URL = "https://www.kimi.com";
export const KIMI_WEB_DEFAULT_MODEL_ID = "moonshot-v1-32k";
const KIMI_WEB_DEFAULT_CONTEXT_WINDOW = 32000;
const KIMI_WEB_DEFAULT_MAX_TOKENS = 4096;
const KIMI_WEB_DEFAULT_COST = {
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
};

export const GEMINI_WEB_BASE_URL = "https://gemini.google.com";
export const GEMINI_WEB_DEFAULT_MODEL_ID = "gemini-pro";
const GEMINI_WEB_DEFAULT_CONTEXT_WINDOW = 32000;
const GEMINI_WEB_DEFAULT_MAX_TOKENS = 8192;
const GEMINI_WEB_DEFAULT_COST = {
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
};

export const GROK_WEB_BASE_URL = "https://grok.com";
export const GROK_WEB_DEFAULT_MODEL_ID = "grok-2";
const GROK_WEB_DEFAULT_CONTEXT_WINDOW = 32000;
const GROK_WEB_DEFAULT_MAX_TOKENS = 4096;
const GROK_WEB_DEFAULT_COST = {
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
};

export const Z_WEB_BASE_URL = "https://chatglm.cn";
export const Z_WEB_DEFAULT_MODEL_ID = "glm-4-plus";
const Z_WEB_DEFAULT_CONTEXT_WINDOW = 128000;
const Z_WEB_DEFAULT_MAX_TOKENS = 4096;
const Z_WEB_DEFAULT_COST = {
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
};

export const GLM_INTL_WEB_BASE_URL = "https://chat.z.ai";
export const GLM_INTL_WEB_DEFAULT_MODEL_ID = "glm-4-plus";
const GLM_INTL_WEB_DEFAULT_CONTEXT_WINDOW = 128000;
const GLM_INTL_WEB_DEFAULT_MAX_TOKENS = 4096;
const GLM_INTL_WEB_DEFAULT_COST = {
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
};

const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";
const NVIDIA_DEFAULT_MODEL_ID = "nvidia/llama-3.1-nemotron-70b-instruct";
const NVIDIA_DEFAULT_CONTEXT_WINDOW = 131072;
const NVIDIA_DEFAULT_MAX_TOKENS = 4096;
const NVIDIA_DEFAULT_COST = {
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
};

interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details?: {
    family?: string;
    parameter_size?: string;
  };
}

interface OllamaTagsResponse {
  models: OllamaModel[];
}

type VllmModelsResponse = {
  data?: Array<{
    id?: string;
  }>;
};

/**
 * Derive the Ollama native API base URL from a configured base URL.
 *
 * Users typically configure `baseUrl` with a `/v1` suffix (e.g.
 * `http://192.168.20.14:11434/v1`) for the OpenAI-compatible endpoint.
 * The native Ollama API lives at the root (e.g. `/api/tags`), so we
 * strip the `/v1` suffix when present.
 */
export function resolveOllamaApiBase(configuredBaseUrl?: string): string {
  if (!configuredBaseUrl) {
    return OLLAMA_API_BASE_URL;
  }
  // Strip trailing slash, then strip /v1 suffix if present
  const trimmed = configuredBaseUrl.replace(/\/+$/, "");
  return trimmed.replace(/\/v1$/i, "");
}

async function discoverOllamaModels(baseUrl?: string): Promise<ModelDefinitionConfig[]> {
  // Skip Ollama discovery in test environments
  if (process.env.VITEST || process.env.NODE_ENV === "test") {
    return [];
  }
  try {
    const apiBase = resolveOllamaApiBase(baseUrl);
    const response = await fetch(`${apiBase}/api/tags`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      console.warn(`Failed to discover Ollama models: ${response.status}`);
      return [];
    }
    const data = (await response.json()) as OllamaTagsResponse;
    if (!data.models || data.models.length === 0) {
      console.warn("No Ollama models found on local instance");
      return [];
    }
    return data.models.map((model) => {
      const modelId = model.name;
      const isReasoning =
        modelId.toLowerCase().includes("r1") || modelId.toLowerCase().includes("reasoning");
      return {
        id: modelId,
        name: modelId,
        reasoning: isReasoning,
        input: ["text"],
        cost: OLLAMA_DEFAULT_COST,
        contextWindow: OLLAMA_DEFAULT_CONTEXT_WINDOW,
        maxTokens: OLLAMA_DEFAULT_MAX_TOKENS,
      };
    });
  } catch (error) {
    console.warn(`Failed to discover Ollama models: ${String(error)}`);
    return [];
  }
}

async function discoverVllmModels(
  baseUrl: string,
  apiKey?: string,
): Promise<ModelDefinitionConfig[]> {
  // Skip vLLM discovery in test environments
  if (process.env.VITEST || process.env.NODE_ENV === "test") {
    return [];
  }

  const trimmedBaseUrl = baseUrl.trim().replace(/\/+$/, "");
  const url = `${trimmedBaseUrl}/models`;

  try {
    const trimmedApiKey = apiKey?.trim();
    const response = await fetch(url, {
      headers: trimmedApiKey ? { Authorization: `Bearer ${trimmedApiKey}` } : undefined,
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      console.warn(`Failed to discover vLLM models: ${response.status}`);
      return [];
    }
    const data = (await response.json()) as VllmModelsResponse;
    const models = data.data ?? [];
    if (models.length === 0) {
      console.warn("No vLLM models found on local instance");
      return [];
    }

    return models
      .map((m) => ({ id: typeof m.id === "string" ? m.id.trim() : "" }))
      .filter((m) => Boolean(m.id))
      .map((m) => {
        const modelId = m.id;
        const lower = modelId.toLowerCase();
        const isReasoning =
          lower.includes("r1") || lower.includes("reasoning") || lower.includes("think");
        return {
          id: modelId,
          name: modelId,
          reasoning: isReasoning,
          input: ["text"],
          cost: VLLM_DEFAULT_COST,
          contextWindow: VLLM_DEFAULT_CONTEXT_WINDOW,
          maxTokens: VLLM_DEFAULT_MAX_TOKENS,
        } satisfies ModelDefinitionConfig;
      });
  } catch (error) {
    console.warn(`Failed to discover vLLM models: ${String(error)}`);
    return [];
  }
}

function normalizeApiKeyConfig(value: string): string {
  const trimmed = value.trim();
  const match = /^\$\{([A-Z0-9_]+)\}$/.exec(trimmed);
  return match?.[1] ?? trimmed;
}

function resolveEnvApiKeyVarName(
  provider: string,
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  const resolved = resolveEnvApiKey(provider, env);
  if (!resolved) {
    return undefined;
  }
  const match = /^(?:env: |shell env: )([A-Z0-9_]+)$/.exec(resolved.source);
  return match ? match[1] : undefined;
}

function resolveAwsSdkApiKeyVarName(env: NodeJS.ProcessEnv = process.env): string {
  return resolveAwsSdkEnvVarName(env) ?? "AWS_PROFILE";
}

function normalizeHeaderValues(params: {
  headers: ProviderConfig["headers"] | undefined;
  secretDefaults:
    | {
        env?: string;
        file?: string;
        exec?: string;
      }
    | undefined;
}): { headers: ProviderConfig["headers"] | undefined; mutated: boolean } {
  const { headers } = params;
  if (!headers) {
    return { headers, mutated: false };
  }
  let mutated = false;
  const nextHeaders: Record<string, NonNullable<ProviderConfig["headers"]>[string]> = {};
  for (const [headerName, headerValue] of Object.entries(headers)) {
    const resolvedRef = resolveSecretInputRef({
      value: headerValue,
      defaults: params.secretDefaults,
    }).ref;
    if (!resolvedRef || !resolvedRef.id.trim()) {
      nextHeaders[headerName] = headerValue;
      continue;
    }
    mutated = true;
    nextHeaders[headerName] =
      resolvedRef.source === "env"
        ? resolveEnvSecretRefHeaderValueMarker(resolvedRef.id)
        : resolveNonEnvSecretRefHeaderValueMarker(resolvedRef.source);
  }
  if (!mutated) {
    return { headers, mutated: false };
  }
  return { headers: nextHeaders, mutated: true };
}

type ProfileApiKeyResolution = {
  apiKey: string;
  source: "plaintext" | "env-ref" | "non-env-ref";
  /** Optional secret value that may be used for provider discovery only. */
  discoveryApiKey?: string;
};

function toDiscoveryApiKey(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed || isNonSecretApiKeyMarker(trimmed)) {
    return undefined;
  }
  return trimmed;
}

function resolveApiKeyFromCredential(
  cred: ReturnType<typeof ensureAuthProfileStore>["profiles"][string] | undefined,
  env: NodeJS.ProcessEnv = process.env,
): ProfileApiKeyResolution | undefined {
  if (!cred) {
    return undefined;
  }
  if (cred.type === "api_key") {
    const keyRef = coerceSecretRef(cred.keyRef);
    if (keyRef && keyRef.id.trim()) {
      if (keyRef.source === "env") {
        const envVar = keyRef.id.trim();
        return {
          apiKey: envVar,
          source: "env-ref",
          discoveryApiKey: toDiscoveryApiKey(env[envVar]),
        };
      }
      return {
        apiKey: resolveNonEnvSecretRefApiKeyMarker(keyRef.source),
        source: "non-env-ref",
      };
    }
    if (cred.key?.trim()) {
      return {
        apiKey: cred.key,
        source: "plaintext",
        discoveryApiKey: toDiscoveryApiKey(cred.key),
      };
    }
    return undefined;
  }
  if (cred.type === "token") {
    const tokenRef = coerceSecretRef(cred.tokenRef);
    if (tokenRef && tokenRef.id.trim()) {
      if (tokenRef.source === "env") {
        const envVar = tokenRef.id.trim();
        return {
          apiKey: envVar,
          source: "env-ref",
          discoveryApiKey: toDiscoveryApiKey(env[envVar]),
        };
      }
      return {
        apiKey: resolveNonEnvSecretRefApiKeyMarker(tokenRef.source),
        source: "non-env-ref",
      };
    }
    if (cred.token?.trim()) {
      return {
        apiKey: cred.token,
        source: "plaintext",
        discoveryApiKey: toDiscoveryApiKey(cred.token),
      };
    }
  }
  return undefined;
}

function resolveApiKeyFromProfiles(params: {
  provider: string;
  store: ReturnType<typeof ensureAuthProfileStore>;
  env?: NodeJS.ProcessEnv;
}): ProfileApiKeyResolution | undefined {
  const ids = listProfilesForProvider(params.store, params.provider);
  for (const id of ids) {
    const resolved = resolveApiKeyFromCredential(params.store.profiles[id], params.env);
    if (resolved) {
      return resolved;
    }
  }
  return undefined;
}

export function normalizeGoogleModelId(id: string): string {
  if (id === "gemini-3-pro") {
    return "gemini-3-pro-preview";
  }
  if (id === "gemini-3-flash") {
    return "gemini-3-flash-preview";
  }
  if (id === "gemini-3.1-pro") {
    return "gemini-3.1-pro-preview";
  }
  if (id === "gemini-3.1-flash-lite") {
    return "gemini-3.1-flash-lite-preview";
  }
  // Preserve compatibility with earlier OpenClaw docs/config that pointed at a
  // non-existent Gemini Flash preview ID. Google's current Flash text model is
  // `gemini-3-flash-preview`.
  if (id === "gemini-3.1-flash" || id === "gemini-3.1-flash-preview") {
    return "gemini-3-flash-preview";
  }
  return id;
}

const ANTIGRAVITY_BARE_PRO_IDS = new Set(["gemini-3-pro", "gemini-3.1-pro", "gemini-3-1-pro"]);

export function normalizeAntigravityModelId(id: string): string {
  if (ANTIGRAVITY_BARE_PRO_IDS.has(id)) {
    return `${id}-low`;
  }
  return id;
}

function normalizeProviderModels(
  provider: ProviderConfig,
  normalizeId: (id: string) => string,
): ProviderConfig {
  let mutated = false;
  const models = provider.models.map((model) => {
    const nextId = normalizeId(model.id);
    if (nextId === model.id) {
      return model;
    }
    mutated = true;
    return { ...model, id: nextId };
  });
  return mutated ? { ...provider, models } : provider;
}

function normalizeGoogleProvider(provider: ProviderConfig): ProviderConfig {
  return normalizeProviderModels(provider, normalizeGoogleModelId);
}

function normalizeAntigravityProvider(provider: ProviderConfig): ProviderConfig {
  return normalizeProviderModels(provider, normalizeAntigravityModelId);
}

export function normalizeProviders(params: {
  providers: ModelsConfig["providers"];
  agentDir: string;
  env?: NodeJS.ProcessEnv;
  secretDefaults?: {
    env?: string;
    file?: string;
    exec?: string;
  };
  secretRefManagedProviders?: Set<string>;
}): ModelsConfig["providers"] {
  const { providers } = params;
  if (!providers) {
    return providers;
  }
  const env = params.env ?? process.env;
  const authStore = ensureAuthProfileStore(params.agentDir, {
    allowKeychainPrompt: false,
  });
  let mutated = false;
  const next: Record<string, ProviderConfig> = {};

  for (const [key, provider] of Object.entries(providers)) {
    const normalizedKey = key.trim();
    if (!normalizedKey) {
      mutated = true;
      continue;
    }
    if (normalizedKey !== key) {
      mutated = true;
    }
    let normalizedProvider = provider;
    const normalizedHeaders = normalizeHeaderValues({
      headers: normalizedProvider.headers,
      secretDefaults: params.secretDefaults,
    });
    if (normalizedHeaders.mutated) {
      mutated = true;
      normalizedProvider = { ...normalizedProvider, headers: normalizedHeaders.headers };
    }
    const configuredApiKey = normalizedProvider.apiKey;
    const configuredApiKeyRef = resolveSecretInputRef({
      value: configuredApiKey,
      defaults: params.secretDefaults,
    }).ref;
    const profileApiKey = resolveApiKeyFromProfiles({
      provider: normalizedKey,
      store: authStore,
      env,
    });

    if (configuredApiKeyRef && configuredApiKeyRef.id.trim()) {
      const marker =
        configuredApiKeyRef.source === "env"
          ? configuredApiKeyRef.id.trim()
          : resolveNonEnvSecretRefApiKeyMarker(configuredApiKeyRef.source);
      if (normalizedProvider.apiKey !== marker) {
        mutated = true;
        normalizedProvider = { ...normalizedProvider, apiKey: marker };
      }
      params.secretRefManagedProviders?.add(normalizedKey);
    } else if (typeof configuredApiKey === "string") {
      // Fix common misconfig: apiKey set to "${ENV_VAR}" instead of "ENV_VAR".
      const normalizedConfiguredApiKey = normalizeApiKeyConfig(configuredApiKey);
      if (normalizedConfiguredApiKey !== configuredApiKey) {
        mutated = true;
        normalizedProvider = {
          ...normalizedProvider,
          apiKey: normalizedConfiguredApiKey,
        };
      }
      if (isNonSecretApiKeyMarker(normalizedConfiguredApiKey)) {
        params.secretRefManagedProviders?.add(normalizedKey);
      }
      if (
        profileApiKey &&
        profileApiKey.source !== "plaintext" &&
        normalizedConfiguredApiKey === profileApiKey.apiKey
      ) {
        params.secretRefManagedProviders?.add(normalizedKey);
      }
    }

    // Reverse-lookup: if apiKey looks like a resolved secret value (not an env
    // var name), check whether it matches the canonical env var for this provider.
    // This prevents resolveConfigEnvVars()-resolved secrets from being persisted
    // to models.json as plaintext. (Fixes #38757)
    const currentApiKey = normalizedProvider.apiKey;
    if (
      typeof currentApiKey === "string" &&
      currentApiKey.trim() &&
      !ENV_VAR_NAME_RE.test(currentApiKey.trim())
    ) {
      const envVarName = resolveEnvApiKeyVarName(normalizedKey, env);
      if (envVarName && env[envVarName] === currentApiKey) {
        mutated = true;
        normalizedProvider = { ...normalizedProvider, apiKey: envVarName };
        params.secretRefManagedProviders?.add(normalizedKey);
      }
    }

    // If a provider defines models, pi's ModelRegistry requires apiKey to be set.
    // Fill it from the environment or auth profiles when possible.
    const hasModels =
      Array.isArray(normalizedProvider.models) && normalizedProvider.models.length > 0;
    const normalizedApiKey = normalizeOptionalSecretInput(normalizedProvider.apiKey);
    const hasConfiguredApiKey = Boolean(normalizedApiKey || normalizedProvider.apiKey);
    if (hasModels && !hasConfiguredApiKey) {
      const authMode =
        normalizedProvider.auth ?? (normalizedKey === "amazon-bedrock" ? "aws-sdk" : undefined);
      if (authMode === "aws-sdk") {
        const apiKey = resolveAwsSdkApiKeyVarName(env);
        mutated = true;
        normalizedProvider = { ...normalizedProvider, apiKey };
      } else {
        const fromEnv = resolveEnvApiKeyVarName(normalizedKey, env);
        const apiKey = fromEnv ?? profileApiKey?.apiKey;
        if (apiKey?.trim()) {
          if (profileApiKey && profileApiKey.source !== "plaintext") {
            params.secretRefManagedProviders?.add(normalizedKey);
          }
          mutated = true;
          normalizedProvider = { ...normalizedProvider, apiKey };
        }
      }
    }

    if (normalizedKey === "google") {
      const googleNormalized = normalizeGoogleProvider(normalizedProvider);
      if (googleNormalized !== normalizedProvider) {
        mutated = true;
      }
      normalizedProvider = googleNormalized;
    }

    // Consolidate "qwen web" (with space) into "qwen-web" to fix duplicate provider display
    const outputKey = normalizedKey === "qwen web" ? "qwen-web" : normalizedKey;
    if (outputKey !== normalizedKey) {
      mutated = true;
    }
    const existing = next[outputKey];
    if (existing && Array.isArray(existing.models) && Array.isArray(normalizedProvider.models)) {
      const seen = new Set(
        (existing.models as Array<{ id?: string }>).map((m) => m.id).filter(Boolean),
      );
      const extra = (normalizedProvider.models as Array<{ id?: string }>).filter(
        (m) => m.id && !seen.has(m.id),
      );
      if (extra.length > 0) {
        mutated = true;
        next[outputKey] = {
          ...existing,
          ...normalizedProvider,
          models: [...(existing.models ?? []), ...extra],
        };
      } else {
        next[outputKey] = { ...existing, ...normalizedProvider };
      }
    } else if (existing) {
      next[outputKey] = { ...existing, ...normalizedProvider };
    } else {
      next[outputKey] = normalizedProvider;
    }
  }

  return mutated ? next : providers;
}

function buildMinimaxProvider(): ProviderConfig {
  return {
    baseUrl: MINIMAX_PORTAL_BASE_URL,
    api: "anthropic-messages",
    models: [
      buildMinimaxTextModel({
        id: MINIMAX_DEFAULT_MODEL_ID,
        name: "MiniMax M2.1",
        reasoning: false,
      }),
      buildMinimaxTextModel({
        id: "MiniMax-M2.1-lightning",
        name: "MiniMax M2.1 Lightning",
        reasoning: false,
      }),
      buildMinimaxModel({
        id: MINIMAX_DEFAULT_VISION_MODEL_ID,
        name: "MiniMax VL 01",
        reasoning: false,
        input: ["text", "image"],
      }),
      buildMinimaxTextModel({
        id: "MiniMax-M2.5",
        name: "MiniMax M2.5",
        reasoning: true,
      }),
      buildMinimaxTextModel({
        id: "MiniMax-M2.5-Lightning",
        name: "MiniMax M2.5 Lightning",
        reasoning: true,
      }),
    ],
  };
}

function buildMinimaxPortalProvider(): ProviderConfig {
  return {
    baseUrl: MINIMAX_PORTAL_BASE_URL,
    api: "anthropic-messages",
    models: [
      buildMinimaxTextModel({
        id: MINIMAX_DEFAULT_MODEL_ID,
        name: "MiniMax M2.1",
        reasoning: false,
      }),
      buildMinimaxTextModel({
        id: "MiniMax-M2.5",
        name: "MiniMax M2.5",
        reasoning: true,
      }),
    ],
  };
}

function buildMoonshotProvider(): ProviderConfig {
  return {
    baseUrl: MOONSHOT_BASE_URL,
    api: "openai-completions",
    models: [
      {
        id: MOONSHOT_DEFAULT_MODEL_ID,
        name: "Kimi K2.5",
        reasoning: false,
        input: ["text"],
        cost: MOONSHOT_DEFAULT_COST,
        contextWindow: MOONSHOT_DEFAULT_CONTEXT_WINDOW,
        maxTokens: MOONSHOT_DEFAULT_MAX_TOKENS,
      },
    ],
  };
}

function buildQwenPortalProvider(): ProviderConfig {
  return {
    baseUrl: QWEN_PORTAL_BASE_URL,
    api: "openai-completions",
    models: [
      {
        id: "coder-model",
        name: "Qwen Coder",
        reasoning: false,
        input: ["text"],
        cost: QWEN_PORTAL_DEFAULT_COST,
        contextWindow: QWEN_PORTAL_DEFAULT_CONTEXT_WINDOW,
        maxTokens: QWEN_PORTAL_DEFAULT_MAX_TOKENS,
      },
      {
        id: "vision-model",
        name: "Qwen Vision",
        reasoning: false,
        input: ["text", "image"],
        cost: QWEN_PORTAL_DEFAULT_COST,
        contextWindow: QWEN_PORTAL_DEFAULT_CONTEXT_WINDOW,
        maxTokens: QWEN_PORTAL_DEFAULT_MAX_TOKENS,
      },
    ],
  };
}

function buildSyntheticProvider(): ProviderConfig {
  return {
    baseUrl: SYNTHETIC_BASE_URL,
    api: "anthropic-messages",
    models: SYNTHETIC_MODEL_CATALOG.map(buildSyntheticModelDefinition),
  };
}

export function buildXiaomiProvider(): ProviderConfig {
  return {
    baseUrl: XIAOMI_BASE_URL,
    api: "anthropic-messages",
    models: [
      {
        id: XIAOMI_DEFAULT_MODEL_ID,
        name: "Xiaomi MiMo V2 Flash",
        reasoning: false,
        input: ["text"],
        cost: XIAOMI_DEFAULT_COST,
        contextWindow: XIAOMI_DEFAULT_CONTEXT_WINDOW,
        maxTokens: XIAOMI_DEFAULT_MAX_TOKENS,
      },
    ],
  };
}

async function buildVeniceProvider(): Promise<ProviderConfig> {
  const models = await discoverVeniceModels();
  return {
    baseUrl: VENICE_BASE_URL,
    api: "openai-completions",
    models,
  };
}

async function buildOllamaProvider(configuredBaseUrl?: string): Promise<ProviderConfig> {
  const models = await discoverOllamaModels(configuredBaseUrl);
  return {
    baseUrl: resolveOllamaApiBase(configuredBaseUrl),
    api: "ollama",
    models,
  };
}

async function buildHuggingfaceProvider(apiKey?: string): Promise<ProviderConfig> {
  // Resolve env var name to value for discovery (GET /v1/models requires Bearer token).
  const resolvedSecret =
    apiKey?.trim() !== ""
      ? /^[A-Z][A-Z0-9_]*$/.test(apiKey!.trim())
        ? (process.env[apiKey!.trim()] ?? "").trim()
        : apiKey!.trim()
      : "";
  const models =
    resolvedSecret !== ""
      ? await discoverHuggingfaceModels(resolvedSecret)
      : HUGGINGFACE_MODEL_CATALOG.map(buildHuggingfaceModelDefinition);
  return {
    baseUrl: HUGGINGFACE_BASE_URL,
    api: "openai-completions",
    models,
  };
}

function buildTogetherProvider(): ProviderConfig {
  return {
    baseUrl: TOGETHER_BASE_URL,
    api: "openai-completions",
    models: TOGETHER_MODEL_CATALOG.map(buildTogetherModelDefinition),
  };
}

async function buildVllmProvider(params?: {
  baseUrl?: string;
  apiKey?: string;
}): Promise<ProviderConfig> {
  const baseUrl = (params?.baseUrl?.trim() || VLLM_BASE_URL).replace(/\/+$/, "");
  const models = await discoverVllmModels(baseUrl, params?.apiKey);
  return {
    baseUrl,
    api: "openai-completions",
    models,
  };
}
export function buildQianfanProvider(): ProviderConfig {
  return {
    baseUrl: QIANFAN_BASE_URL,
    api: "openai-completions",
    models: [
      {
        id: QIANFAN_DEFAULT_MODEL_ID,
        name: "DEEPSEEK V3.2",
        reasoning: true,
        input: ["text"],
        cost: QIANFAN_DEFAULT_COST,
        contextWindow: QIANFAN_DEFAULT_CONTEXT_WINDOW,
        maxTokens: QIANFAN_DEFAULT_MAX_TOKENS,
      },
      {
        id: "ernie-5.0-thinking-preview",
        name: "ERNIE-5.0-Thinking-Preview",
        reasoning: true,
        input: ["text", "image"],
        cost: QIANFAN_DEFAULT_COST,
        contextWindow: 119000,
        maxTokens: 64000,
      },
    ],
  };
}

export async function discoverDeepseekWebModels(params?: {
  apiKey?: string;
}): Promise<ModelDefinitionConfig[]> {
  if (params?.apiKey) {
    try {
      const auth = JSON.parse(params.apiKey);
      const { DeepSeekWebClient } = await import("../providers/deepseek-web-client.js");
      const client = new DeepSeekWebClient(auth);
      return (await client.discoverModels()) as ModelDefinitionConfig[];
    } catch (e) {
      console.warn("[DeepSeekWeb] Dynamic discovery failed, falling back to built-in list:", e);
    }
  }

  return [
    {
      id: "deepseek-chat",
      name: "DeepSeek V3 (Web)",
      reasoning: false,
      input: ["text"],
      cost: DEEPSEEK_WEB_DEFAULT_COST,
      contextWindow: DEEPSEEK_WEB_DEFAULT_CONTEXT_WINDOW,
      maxTokens: DEEPSEEK_WEB_DEFAULT_MAX_TOKENS,
    },
    {
      id: "deepseek-reasoner",
      name: "DeepSeek R1 (Web)",
      reasoning: true,
      input: ["text"],
      cost: DEEPSEEK_WEB_DEFAULT_COST,
      contextWindow: DEEPSEEK_WEB_DEFAULT_CONTEXT_WINDOW,
      maxTokens: DEEPSEEK_WEB_DEFAULT_MAX_TOKENS,
    },
    {
      id: "deepseek-chat-search",
      name: "DeepSeek V3 (Web + Search)",
      reasoning: false,
      input: ["text"],
      cost: DEEPSEEK_WEB_DEFAULT_COST,
      contextWindow: DEEPSEEK_WEB_DEFAULT_CONTEXT_WINDOW,
      maxTokens: DEEPSEEK_WEB_DEFAULT_MAX_TOKENS,
    },
    {
      id: "deepseek-reasoner-search",
      name: "DeepSeek R1 (Web + Search)",
      reasoning: true,
      input: ["text"],
      cost: DEEPSEEK_WEB_DEFAULT_COST,
      contextWindow: DEEPSEEK_WEB_DEFAULT_CONTEXT_WINDOW,
      maxTokens: DEEPSEEK_WEB_DEFAULT_MAX_TOKENS,
    },
  ];
}

export async function buildDeepseekWebProvider(params?: {
  apiKey?: string;
}): Promise<ProviderConfig> {
  const models = await discoverDeepseekWebModels(params);
  return {
    baseUrl: DEEPSEEK_WEB_BASE_URL,
    api: "deepseek-web",
    models,
  };
}

export async function discoverDoubaoWebModels(params?: {
  apiKey?: string;
}): Promise<ModelDefinitionConfig[]> {
  if (params?.apiKey) {
    try {
      const auth = JSON.parse(params.apiKey);
      const { DoubaoWebClient } = await import("../providers/doubao-web-client.js");
      const client = new DoubaoWebClient(auth);
      return (await client.discoverModels()) as ModelDefinitionConfig[];
    } catch (e) {
      console.warn("[DoubaoWeb] Dynamic discovery failed, falling back to built-in list:", e);
    }
  }

  return [
    {
      id: "doubao-seed-2.0",
      name: "Doubao-Seed 2.0 (Web)",
      reasoning: true,
      input: ["text"],
      cost: DOUBAO_WEB_DEFAULT_COST,
      contextWindow: DOUBAO_WEB_DEFAULT_CONTEXT_WINDOW,
      maxTokens: DOUBAO_WEB_DEFAULT_MAX_TOKENS,
    },
    {
      id: "doubao-pro",
      name: "Doubao Pro (Web)",
      reasoning: false,
      input: ["text"],
      cost: DOUBAO_WEB_DEFAULT_COST,
      contextWindow: DOUBAO_WEB_DEFAULT_CONTEXT_WINDOW,
      maxTokens: DOUBAO_WEB_DEFAULT_MAX_TOKENS,
    },
  ];
}

export async function buildDoubaoWebProvider(params?: {
  apiKey?: string;
}): Promise<ProviderConfig> {
  const models = await discoverDoubaoWebModels(params);
  return {
    baseUrl: DOUBAO_WEB_BASE_URL,
    api: "doubao-web",
    models,
  };
}

export async function discoverClaudeWebModels(params?: {
  apiKey?: string;
}): Promise<ModelDefinitionConfig[]> {
  if (params?.apiKey) {
    try {
      const auth = JSON.parse(params.apiKey);
      const { ClaudeWebClientBrowser } = await import("../providers/claude-web-client-browser.js");
      const client = new ClaudeWebClientBrowser(auth);
      const models = (await client.discoverModels()) as ModelDefinitionConfig[];
      await client.close();
      return models;
    } catch (e) {
      console.warn("[ClaudeWeb] Dynamic discovery failed, falling back to built-in list:", e);
    }
  }

  return [
    {
      id: "claude-sonnet-4-6",
      name: "Claude Sonnet 4.6 (Web)",
      reasoning: false,
      input: ["text", "image"],
      cost: CLAUDE_WEB_DEFAULT_COST,
      contextWindow: CLAUDE_WEB_DEFAULT_CONTEXT_WINDOW,
      maxTokens: CLAUDE_WEB_DEFAULT_MAX_TOKENS,
    },
    {
      id: "claude-opus-4-6",
      name: "Claude Opus 4.6 (Web)",
      reasoning: false,
      input: ["text", "image"],
      cost: CLAUDE_WEB_DEFAULT_COST,
      contextWindow: CLAUDE_WEB_DEFAULT_CONTEXT_WINDOW,
      maxTokens: 16384,
    },
    {
      id: "claude-haiku-4-6",
      name: "Claude Haiku 4.6 (Web)",
      reasoning: false,
      input: ["text", "image"],
      cost: CLAUDE_WEB_DEFAULT_COST,
      contextWindow: CLAUDE_WEB_DEFAULT_CONTEXT_WINDOW,
      maxTokens: CLAUDE_WEB_DEFAULT_MAX_TOKENS,
    },
  ];
}

export async function buildClaudeWebProvider(params?: {
  apiKey?: string;
}): Promise<ProviderConfig> {
  const models = await discoverClaudeWebModels(params);
  return {
    baseUrl: CLAUDE_WEB_BASE_URL,
    api: "claude-web",
    models,
  };
}

export async function buildChatGPTWebProvider(params?: {
  apiKey?: string;
}): Promise<ProviderConfig> {
  return {
    baseUrl: CHATGPT_WEB_BASE_URL,
    api: "chatgpt-web",
    models: [
      {
        id: "gpt-4",
        name: "GPT-4 (Web)",
        reasoning: false,
        input: ["text", "image"],
        cost: CHATGPT_WEB_DEFAULT_COST,
        contextWindow: CHATGPT_WEB_DEFAULT_CONTEXT_WINDOW,
        maxTokens: CHATGPT_WEB_DEFAULT_MAX_TOKENS,
      },
      {
        id: "gpt-4-turbo",
        name: "GPT-4 Turbo (Web)",
        reasoning: false,
        input: ["text", "image"],
        cost: CHATGPT_WEB_DEFAULT_COST,
        contextWindow: CHATGPT_WEB_DEFAULT_CONTEXT_WINDOW,
        maxTokens: CHATGPT_WEB_DEFAULT_MAX_TOKENS,
      },
      {
        id: "gpt-3.5-turbo",
        name: "GPT-3.5 Turbo (Web)",
        reasoning: false,
        input: ["text"],
        cost: CHATGPT_WEB_DEFAULT_COST,
        contextWindow: 16000,
        maxTokens: 4096,
      },
    ],
  };
}

export async function buildQwenWebProvider(params?: {
  apiKey?: string;
}): Promise<ProviderConfig> {
  return {
    baseUrl: QWEN_WEB_BASE_URL,
    api: "qwen-web",
    models: [
      {
        id: "qwen3.5-plus",
        name: "Qwen 3.5 Plus",
        reasoning: false,
        input: ["text"],
        cost: QWEN_WEB_DEFAULT_COST,
        contextWindow: QWEN_WEB_DEFAULT_CONTEXT_WINDOW,
        maxTokens: QWEN_WEB_DEFAULT_MAX_TOKENS,
      },
      {
        id: "qwen3.5-turbo",
        name: "Qwen 3.5 Turbo",
        reasoning: false,
        input: ["text"],
        cost: QWEN_WEB_DEFAULT_COST,
        contextWindow: QWEN_WEB_DEFAULT_CONTEXT_WINDOW,
        maxTokens: QWEN_WEB_DEFAULT_MAX_TOKENS,
      },
    ],
  };
}

const QWEN_CN_WEB_BASE_URL = "https://chat2.qianwen.com";
const QWEN_CN_WEB_DEFAULT_COST = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
const QWEN_CN_WEB_DEFAULT_CONTEXT_WINDOW = 128000;
const QWEN_CN_WEB_DEFAULT_MAX_TOKENS = 4096;

export async function buildQwenCNWebProvider(params?: {
  apiKey?: string;
}): Promise<ProviderConfig> {
  return {
    baseUrl: QWEN_CN_WEB_BASE_URL,
    api: "qwen-cn-web",
    models: [
      {
        id: "Qwen3.5-Plus",
        name: "Qwen 3.5 Plus (国内版)",
        reasoning: false,
        input: ["text"],
        cost: QWEN_CN_WEB_DEFAULT_COST,
        contextWindow: QWEN_CN_WEB_DEFAULT_CONTEXT_WINDOW,
        maxTokens: QWEN_CN_WEB_DEFAULT_MAX_TOKENS,
      },
      {
        id: "Qwen3.5-Turbo",
        name: "Qwen 3.5 Turbo (国内版)",
        reasoning: false,
        input: ["text"],
        cost: QWEN_CN_WEB_DEFAULT_COST,
        contextWindow: QWEN_CN_WEB_DEFAULT_CONTEXT_WINDOW,
        maxTokens: QWEN_CN_WEB_DEFAULT_MAX_TOKENS,
      },
    ],
  };
}

export async function buildKimiWebProvider(params?: {
  apiKey?: string;
}): Promise<ProviderConfig> {
  return {
    baseUrl: KIMI_WEB_BASE_URL,
    api: "kimi-web",
    models: [
      {
        id: "moonshot-v1-8k",
        name: "Moonshot v1 8K (Web)",
        reasoning: false,
        input: ["text"],
        cost: KIMI_WEB_DEFAULT_COST,
        contextWindow: 8000,
        maxTokens: 4096,
      },
      {
        id: "moonshot-v1-32k",
        name: "Moonshot v1 32K (Web)",
        reasoning: false,
        input: ["text"],
        cost: KIMI_WEB_DEFAULT_COST,
        contextWindow: KIMI_WEB_DEFAULT_CONTEXT_WINDOW,
        maxTokens: KIMI_WEB_DEFAULT_MAX_TOKENS,
      },
      {
        id: "moonshot-v1-128k",
        name: "Moonshot v1 128K (Web)",
        reasoning: false,
        input: ["text"],
        cost: KIMI_WEB_DEFAULT_COST,
        contextWindow: 128000,
        maxTokens: 4096,
      },
    ],
  };
}

export async function buildGeminiWebProvider(params?: {
  apiKey?: string;
}): Promise<ProviderConfig> {
  return {
    baseUrl: GEMINI_WEB_BASE_URL,
    api: "gemini-web",
    models: [
      {
        id: "gemini-pro",
        name: "Gemini Pro (Web)",
        reasoning: false,
        input: ["text", "image"],
        cost: GEMINI_WEB_DEFAULT_COST,
        contextWindow: GEMINI_WEB_DEFAULT_CONTEXT_WINDOW,
        maxTokens: GEMINI_WEB_DEFAULT_MAX_TOKENS,
      },
      {
        id: "gemini-ultra",
        name: "Gemini Ultra (Web)",
        reasoning: false,
        input: ["text", "image"],
        cost: GEMINI_WEB_DEFAULT_COST,
        contextWindow: GEMINI_WEB_DEFAULT_CONTEXT_WINDOW,
        maxTokens: GEMINI_WEB_DEFAULT_MAX_TOKENS,
      },
    ],
  };
}

export async function buildGrokWebProvider(params?: {
  apiKey?: string;
}): Promise<ProviderConfig> {
  return {
    baseUrl: GROK_WEB_BASE_URL,
    api: "grok-web",
    models: [
      {
        id: "grok-1",
        name: "Grok 1 (Web)",
        reasoning: false,
        input: ["text"],
        cost: GROK_WEB_DEFAULT_COST,
        contextWindow: GROK_WEB_DEFAULT_CONTEXT_WINDOW,
        maxTokens: GROK_WEB_DEFAULT_MAX_TOKENS,
      },
      {
        id: "grok-2",
        name: "Grok 2 (Web)",
        reasoning: false,
        input: ["text"],
        cost: GROK_WEB_DEFAULT_COST,
        contextWindow: GROK_WEB_DEFAULT_CONTEXT_WINDOW,
        maxTokens: GROK_WEB_DEFAULT_MAX_TOKENS,
      },
    ],
  };
}

export async function buildZWebProvider(params?: {
  apiKey?: string;
}): Promise<ProviderConfig> {
  return {
    baseUrl: Z_WEB_BASE_URL,
    api: "glm-web",
    models: [
      {
        id: "glm-4-plus",
        name: "glm-4 Plus (Web)",
        reasoning: false,
        input: ["text"],
        cost: Z_WEB_DEFAULT_COST,
        contextWindow: Z_WEB_DEFAULT_CONTEXT_WINDOW,
        maxTokens: Z_WEB_DEFAULT_MAX_TOKENS,
      },
      {
        id: "glm-4-think",
        name: "glm-4 Think (Web)",
        reasoning: true,
        input: ["text"],
        cost: Z_WEB_DEFAULT_COST,
        contextWindow: Z_WEB_DEFAULT_CONTEXT_WINDOW,
        maxTokens: Z_WEB_DEFAULT_MAX_TOKENS,
      },
    ],
  };
}

export async function buildGlmIntlWebProvider(params?: {
  apiKey?: string;
}): Promise<ProviderConfig> {
  return {
    baseUrl: GLM_INTL_WEB_BASE_URL,
    api: "glm-intl-web",
    models: [
      {
        id: "glm-4-plus",
        name: "GLM-4 Plus (International)",
        reasoning: false,
        input: ["text"],
        cost: GLM_INTL_WEB_DEFAULT_COST,
        contextWindow: GLM_INTL_WEB_DEFAULT_CONTEXT_WINDOW,
        maxTokens: GLM_INTL_WEB_DEFAULT_MAX_TOKENS,
      },
      {
        id: "glm-4-think",
        name: "GLM-4 Think (International)",
        reasoning: true,
        input: ["text"],
        cost: GLM_INTL_WEB_DEFAULT_COST,
        contextWindow: GLM_INTL_WEB_DEFAULT_CONTEXT_WINDOW,
        maxTokens: GLM_INTL_WEB_DEFAULT_MAX_TOKENS,
      },
    ],
  };
}

const MANUS_API_DEFAULT_CONTEXT_WINDOW = 32000;
const MANUS_API_DEFAULT_MAX_TOKENS = 4096;
const MANUS_API_DEFAULT_COST = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };

export const MANUS_API_DEFAULT_MODEL_REF = "manus-api/manus-1.6";

export function buildManusApiProvider(): ProviderConfig {
  return {
    baseUrl: "https://api.manus.ai",
    api: "manus-api",
    models: [
      {
        id: "manus-1.6",
        name: "Manus 1.6 (API)",
        reasoning: false,
        input: ["text"],
        cost: MANUS_API_DEFAULT_COST,
        contextWindow: MANUS_API_DEFAULT_CONTEXT_WINDOW,
        maxTokens: MANUS_API_DEFAULT_MAX_TOKENS,
      },
      {
        id: "manus-1.6-lite",
        name: "Manus 1.6 Lite (API)",
        reasoning: false,
        input: ["text"],
        cost: MANUS_API_DEFAULT_COST,
        contextWindow: MANUS_API_DEFAULT_CONTEXT_WINDOW,
        maxTokens: MANUS_API_DEFAULT_MAX_TOKENS,
      },
    ],
  };
}

export function buildNvidiaProvider(): ProviderConfig {
  return {
    baseUrl: NVIDIA_BASE_URL,
    api: "openai-completions",
    models: [
      {
        id: NVIDIA_DEFAULT_MODEL_ID,
        name: "NVIDIA Llama 3.1 Nemotron 70B Instruct",
        reasoning: false,
        input: ["text"],
        cost: NVIDIA_DEFAULT_COST,
        contextWindow: NVIDIA_DEFAULT_CONTEXT_WINDOW,
        maxTokens: NVIDIA_DEFAULT_MAX_TOKENS,
      },
      {
        id: "meta/llama-3.3-70b-instruct",
        name: "Meta Llama 3.3 70B Instruct",
        reasoning: false,
        input: ["text"],
        cost: NVIDIA_DEFAULT_COST,
        contextWindow: 131072,
        maxTokens: 4096,
      },
      {
        id: "nvidia/mistral-nemo-minitron-8b-8k-instruct",
        name: "NVIDIA Mistral NeMo Minitron 8B Instruct",
        reasoning: false,
        input: ["text"],
        cost: NVIDIA_DEFAULT_COST,
        contextWindow: 8192,
        maxTokens: 2048,
      },
    ],
  };
}

export type ImplicitProviderParams = {
  agentDir: string;
  config?: OpenClawConfig;
  env?: NodeJS.ProcessEnv;
  explicitProviders?: Record<string, ProviderConfig> | null;
};

type ProviderApiKeyResolver = (provider: string) => {
  apiKey: string | undefined;
  discoveryApiKey?: string;
};

type ImplicitProviderContext = ImplicitProviderParams & {
  authStore: ReturnType<typeof ensureAuthProfileStore>;
  env: NodeJS.ProcessEnv;
  resolveProviderApiKey: ProviderApiKeyResolver;
};

type ImplicitProviderLoader = (
  ctx: ImplicitProviderContext,
) => Promise<Record<string, ProviderConfig> | undefined>;

function withApiKey(
  providerKey: string,
  build: (params: {
    apiKey: string;
    discoveryApiKey?: string;
  }) => ProviderConfig | Promise<ProviderConfig>,
): ImplicitProviderLoader {
  return async (ctx) => {
    const { apiKey, discoveryApiKey } = ctx.resolveProviderApiKey(providerKey);
    if (!apiKey) {
      return undefined;
    }
    return {
      [providerKey]: await build({ apiKey, discoveryApiKey }),
    };
  };
}

function withProfilePresence(
  providerKey: string,
  build: () => ProviderConfig | Promise<ProviderConfig>,
): ImplicitProviderLoader {
  return async (ctx) => {
    if (listProfilesForProvider(ctx.authStore, providerKey).length === 0) {
      return undefined;
    }
    return {
      [providerKey]: await build(),
    };
  };
}

function mergeImplicitProviderSet(
  target: Record<string, ProviderConfig>,
  additions: Record<string, ProviderConfig> | undefined,
): void {
  if (!additions) {
    return;
  }
  for (const [key, value] of Object.entries(additions)) {
    target[key] = value;
  }
}

const SIMPLE_IMPLICIT_PROVIDER_LOADERS: ImplicitProviderLoader[] = [
  withApiKey("minimax", async ({ apiKey }) => ({ ...buildMinimaxProvider(), apiKey })),
  withApiKey("moonshot", async ({ apiKey }) => ({ ...buildMoonshotProvider(), apiKey })),
  withApiKey("kimi-coding", async ({ apiKey }) => ({ ...buildKimiCodingProvider(), apiKey })),
  withApiKey("synthetic", async ({ apiKey }) => ({ ...buildSyntheticProvider(), apiKey })),
  withApiKey("venice", async ({ apiKey }) => ({ ...(await buildVeniceProvider()), apiKey })),
  withApiKey("xiaomi", async ({ apiKey }) => ({ ...buildXiaomiProvider(), apiKey })),
  withApiKey("vercel-ai-gateway", async ({ apiKey }) => ({
    ...(await buildVercelAiGatewayProvider()),
    apiKey,
  })),
  withApiKey("together", async ({ apiKey }) => ({ ...buildTogetherProvider(), apiKey })),
  withApiKey("huggingface", async ({ apiKey, discoveryApiKey }) => ({
    ...(await buildHuggingfaceProvider(discoveryApiKey)),
    apiKey,
  })),
  withApiKey("qianfan", async ({ apiKey }) => ({ ...buildQianfanProvider(), apiKey })),
  withApiKey("modelstudio", async ({ apiKey }) => ({ ...buildModelStudioProvider(), apiKey })),
  withApiKey("openrouter", async ({ apiKey }) => ({ ...buildOpenrouterProvider(), apiKey })),
  withApiKey("nvidia", async ({ apiKey }) => ({ ...buildNvidiaProvider(), apiKey })),
  withApiKey("kilocode", async ({ apiKey }) => ({
    ...(await buildKilocodeProviderWithDiscovery()),
    apiKey,
  })),
];

const PROFILE_IMPLICIT_PROVIDER_LOADERS: ImplicitProviderLoader[] = [
  async (ctx) => {
    const envKey = resolveEnvApiKeyVarName("minimax-portal", ctx.env);
    const hasProfiles = listProfilesForProvider(ctx.authStore, "minimax-portal").length > 0;
    if (!envKey && !hasProfiles) {
      return undefined;
    }
    return {
      "minimax-portal": {
        ...buildMinimaxPortalProvider(),
        apiKey: MINIMAX_OAUTH_MARKER,
      },
    };
  },
  withProfilePresence("qwen-portal", async () => ({
    ...buildQwenPortalProvider(),
    apiKey: QWEN_OAUTH_MARKER,
  })),
  withProfilePresence("openai-codex", async () => buildOpenAICodexProvider()),
];

const PAIRED_IMPLICIT_PROVIDER_LOADERS: ImplicitProviderLoader[] = [
  async (ctx) => {
    const volcengineKey = ctx.resolveProviderApiKey("volcengine").apiKey;
    if (!volcengineKey) {
      return undefined;
    }
    return {
      volcengine: { ...buildDoubaoProvider(), apiKey: volcengineKey },
      "volcengine-plan": {
        ...buildDoubaoCodingProvider(),
        apiKey: volcengineKey,
      },
    };
  },
  async (ctx) => {
    const byteplusKey = ctx.resolveProviderApiKey("byteplus").apiKey;
    if (!byteplusKey) {
      return undefined;
    }
    return {
      byteplus: { ...buildBytePlusProvider(), apiKey: byteplusKey },
      "byteplus-plan": {
        ...buildBytePlusCodingProvider(),
        apiKey: byteplusKey,
      },
    };
  },
];

async function resolveCloudflareAiGatewayImplicitProvider(
  ctx: ImplicitProviderContext,
): Promise<Record<string, ProviderConfig> | undefined> {
  const cloudflareProfiles = listProfilesForProvider(ctx.authStore, "cloudflare-ai-gateway");
  for (const profileId of cloudflareProfiles) {
    const cred = ctx.authStore.profiles[profileId];
    if (cred?.type !== "api_key") {
      continue;
    }
    const accountId = cred.metadata?.accountId?.trim();
    const gatewayId = cred.metadata?.gatewayId?.trim();
    if (!accountId || !gatewayId) {
      continue;
    }
    const baseUrl = resolveCloudflareAiGatewayBaseUrl({ accountId, gatewayId });
    if (!baseUrl) {
      continue;
    }
    const envVarApiKey = resolveEnvApiKeyVarName("cloudflare-ai-gateway", ctx.env);
    const profileApiKey = resolveApiKeyFromCredential(cred, ctx.env)?.apiKey;
    const apiKey = envVarApiKey ?? profileApiKey ?? "";
    if (!apiKey) {
      continue;
    }
    return {
      "cloudflare-ai-gateway": {
        baseUrl,
        api: "anthropic-messages",
        apiKey,
        models: [buildCloudflareAiGatewayModelDefinition()],
      },
    };
  }
  return undefined;
}

async function resolveOllamaImplicitProvider(
  ctx: ImplicitProviderContext,
): Promise<Record<string, ProviderConfig> | undefined> {
  const ollamaKey = ctx.resolveProviderApiKey("ollama").apiKey;
  const explicitOllama = ctx.explicitProviders?.ollama;
  const hasExplicitModels =
    Array.isArray(explicitOllama?.models) && explicitOllama.models.length > 0;
  if (hasExplicitModels && explicitOllama) {
    return {
      ollama: {
        ...explicitOllama,
        baseUrl: resolveOllamaApiBase(explicitOllama.baseUrl),
        api: explicitOllama.api ?? "ollama",
        apiKey: ollamaKey ?? explicitOllama.apiKey ?? OLLAMA_LOCAL_AUTH_MARKER,
      },
    };
  }

  const ollamaBaseUrl = explicitOllama?.baseUrl;
  const hasExplicitOllamaConfig = Boolean(explicitOllama);
  const ollamaProvider = await buildOllamaProvider(ollamaBaseUrl, {
    quiet: !ollamaKey && !hasExplicitOllamaConfig,
  });
  if (ollamaProvider.models.length === 0 && !ollamaKey && !explicitOllama?.apiKey) {
    return undefined;
  }
  return {
    ollama: {
      ...ollamaProvider,
      apiKey: ollamaKey ?? explicitOllama?.apiKey ?? OLLAMA_LOCAL_AUTH_MARKER,
    },
  };
}

async function resolveVllmImplicitProvider(
  ctx: ImplicitProviderContext,
): Promise<Record<string, ProviderConfig> | undefined> {
  if (ctx.explicitProviders?.vllm) {
    return undefined;
  }
  const { apiKey: vllmKey, discoveryApiKey } = ctx.resolveProviderApiKey("vllm");
  if (!vllmKey) {
    return undefined;
  }
  return {
    vllm: {
      ...(await buildVllmProvider({ apiKey: discoveryApiKey })),
      apiKey: vllmKey,
    },
  };
}

export async function resolveImplicitProviders(
  params: ImplicitProviderParams,
): Promise<ModelsConfig["providers"]> {
  const providers: Record<string, ProviderConfig> = {};
  const env = params.env ?? process.env;
  const authStore = ensureAuthProfileStore(params.agentDir, {
    allowKeychainPrompt: false,
  });
  const resolveProviderApiKey: ProviderApiKeyResolver = (
    provider: string,
  ): { apiKey: string | undefined; discoveryApiKey?: string } => {
    const envVar = resolveEnvApiKeyVarName(provider, env);
    if (envVar) {
      return {
        apiKey: envVar,
        discoveryApiKey: toDiscoveryApiKey(env[envVar]),
      };
    }
    const fromProfiles = resolveApiKeyFromProfiles({ provider, store: authStore, env });
    return {
      apiKey: fromProfiles?.apiKey,
      discoveryApiKey: fromProfiles?.discoveryApiKey,
    };
  };
  const context: ImplicitProviderContext = {
    ...params,
    authStore,
    env,
    resolveProviderApiKey,
  };

  for (const loader of SIMPLE_IMPLICIT_PROVIDER_LOADERS) {
    mergeImplicitProviderSet(providers, await loader(context));
  }
  for (const loader of PROFILE_IMPLICIT_PROVIDER_LOADERS) {
    mergeImplicitProviderSet(providers, await loader(context));
  }
  for (const loader of PAIRED_IMPLICIT_PROVIDER_LOADERS) {
    mergeImplicitProviderSet(providers, await loader(context));
  }
  mergeImplicitProviderSet(providers, await resolveCloudflareAiGatewayImplicitProvider(context));
  mergeImplicitProviderSet(providers, await resolveOllamaImplicitProvider(context));
  mergeImplicitProviderSet(providers, await resolveVllmImplicitProvider(context));

  if (!providers["github-copilot"]) {
    const implicitCopilot = await resolveImplicitCopilotProvider({
      agentDir: params.agentDir,
      env,
    });
    if (implicitCopilot) {
      providers["github-copilot"] = implicitCopilot;
    }
  }

  const implicitBedrock = await resolveImplicitBedrockProvider({
    agentDir: params.agentDir,
    config: params.config,
    env,
  });
  if (implicitBedrock) {
    const existing = providers["amazon-bedrock"];
    providers["amazon-bedrock"] = existing
      ? {
          ...implicitBedrock,
          ...existing,
          models:
            Array.isArray(existing.models) && existing.models.length > 0
              ? existing.models
              : implicitBedrock.models,
        }
      : implicitBedrock;
  }

  const siliconFlowGlobalVar = resolveEnvApiKeyVarName("siliconflow");
  const siliconFlowGlobalProfileKey = resolveApiKeyFromProfiles({
    provider: "siliconflow",
    store: authStore,
  });
  const siliconFlowGlobalKey = siliconFlowGlobalVar ?? siliconFlowGlobalProfileKey;
  if (siliconFlowGlobalKey) {
    const discoveryApiKey = siliconFlowGlobalVar
      ? (process.env[siliconFlowGlobalVar]?.trim() ?? "")
      : (siliconFlowGlobalProfileKey ?? "");

    providers.siliconflow = {
      baseUrl: SILICONFLOW_GLOBAL_BASE_URL,
      api: "openai-completions",
      apiKey: siliconFlowGlobalKey,
      models: await discoverSiliconFlowModels({
        baseUrl: SILICONFLOW_GLOBAL_BASE_URL,
        apiKey: discoveryApiKey,
      }),
    };
  }

  const siliconFlowCnVar = resolveEnvApiKeyVarName("siliconflow-cn");
  const siliconFlowCnProfileKey = resolveApiKeyFromProfiles({
    provider: "siliconflow-cn",
    store: authStore,
  });
  const siliconFlowCnKey = siliconFlowCnVar ?? siliconFlowCnProfileKey;
  if (siliconFlowCnKey) {
    const discoveryApiKey = siliconFlowCnVar
      ? (process.env[siliconFlowCnVar]?.trim() ?? "")
      : (siliconFlowCnProfileKey ?? "");

    providers["siliconflow-cn"] = {
      baseUrl: SILICONFLOW_CN_BASE_URL,
      api: "openai-completions",
      apiKey: siliconFlowCnKey,
      models: await discoverSiliconFlowModels({
        baseUrl: SILICONFLOW_CN_BASE_URL,
        apiKey: discoveryApiKey,
      }),
    };
  }
  const deepseekWebKey =
    resolveEnvApiKeyVarName("deepseek-web") ??
    resolveApiKeyFromProfiles({ provider: "deepseek-web", store: authStore });

  providers["deepseek-web"] = {
    ...(await buildDeepseekWebProvider({ apiKey: deepseekWebKey })),
    apiKey: deepseekWebKey,
  };

  const doubaoWebKey =
    resolveEnvApiKeyVarName("doubao-web") ??
    resolveApiKeyFromProfiles({ provider: "doubao-web", store: authStore });

  providers["doubao-web"] = {
    ...(await buildDoubaoWebProvider({ apiKey: doubaoWebKey })),
    apiKey: doubaoWebKey,
  };

  const claudeWebKey =
    resolveEnvApiKeyVarName("claude-web") ??
    resolveApiKeyFromProfiles({ provider: "claude-web", store: authStore });

  providers["claude-web"] = {
    ...(await buildClaudeWebProvider({ apiKey: claudeWebKey })),
    apiKey: claudeWebKey,
  };

  const chatgptWebKey =
    resolveEnvApiKeyVarName("chatgpt-web") ??
    resolveApiKeyFromProfiles({ provider: "chatgpt-web", store: authStore });

  providers["chatgpt-web"] = {
    ...(await buildChatGPTWebProvider({ apiKey: chatgptWebKey })),
    apiKey: chatgptWebKey,
  };

  const qwenWebKey =
    resolveEnvApiKeyVarName("qwen-web") ??
    resolveApiKeyFromProfiles({ provider: "qwen-web", store: authStore });

  providers["qwen-web"] = {
    ...(await buildQwenWebProvider({ apiKey: qwenWebKey })),
    apiKey: qwenWebKey,
  };

  const kimiWebKey =
    resolveEnvApiKeyVarName("kimi-web") ??
    resolveApiKeyFromProfiles({ provider: "kimi-web", store: authStore });

  providers["kimi-web"] = {
    ...(await buildKimiWebProvider({ apiKey: kimiWebKey })),
    apiKey: kimiWebKey,
  };

  const geminiWebKey =
    resolveEnvApiKeyVarName("gemini-web") ??
    resolveApiKeyFromProfiles({ provider: "gemini-web", store: authStore });

  providers["gemini-web"] = {
    ...(await buildGeminiWebProvider({ apiKey: geminiWebKey })),
    apiKey: geminiWebKey,
  };

  const grokWebKey =
    resolveEnvApiKeyVarName("grok-web") ??
    resolveApiKeyFromProfiles({ provider: "grok-web", store: authStore });

  providers["grok-web"] = {
    ...(await buildGrokWebProvider({ apiKey: grokWebKey })),
    apiKey: grokWebKey,
  };

  const zWebKey =
    resolveEnvApiKeyVarName("glm-web") ??
    resolveApiKeyFromProfiles({ provider: "glm-web", store: authStore });

  providers["glm-web"] = {
    ...(await buildZWebProvider({ apiKey: zWebKey })),
    apiKey: zWebKey,
  };

  const glmIntlWebKey =
    resolveEnvApiKeyVarName("glm-intl-web") ??
    resolveApiKeyFromProfiles({ provider: "glm-intl-web", store: authStore });

  if (glmIntlWebKey) {
    providers["glm-intl-web"] = {
      ...(await buildGlmIntlWebProvider({ apiKey: glmIntlWebKey })),
      apiKey: glmIntlWebKey,
    };
  }

  const manusApiKey =
    resolveEnvApiKeyVarName("manus-api") ??
    resolveApiKeyFromProfiles({ provider: "manus-api", store: authStore });

  providers["manus-api"] = {
    ...buildManusApiProvider(),
    apiKey: manusApiKey,
  };

  return providers;
}

export async function resolveImplicitCopilotProvider(params: {
  agentDir: string;
  env?: NodeJS.ProcessEnv;
}): Promise<ProviderConfig | null> {
  const env = params.env ?? process.env;
  const authStore = ensureAuthProfileStore(params.agentDir, {
    allowKeychainPrompt: false,
  });
  const hasProfile = listProfilesForProvider(authStore, "github-copilot").length > 0;
  const envToken = env.COPILOT_GITHUB_TOKEN ?? env.GH_TOKEN ?? env.GITHUB_TOKEN;
  const githubToken = (envToken ?? "").trim();

  if (!hasProfile && !githubToken) {
    return null;
  }

  let selectedGithubToken = githubToken;
  if (!selectedGithubToken && hasProfile) {
    // Use the first available profile as a default for discovery (it will be
    // re-resolved per-run by the embedded runner).
    const profileId = listProfilesForProvider(authStore, "github-copilot")[0];
    const profile = profileId ? authStore.profiles[profileId] : undefined;
    if (profile && profile.type === "token") {
      selectedGithubToken = profile.token?.trim() ?? "";
      if (!selectedGithubToken) {
        const tokenRef = coerceSecretRef(profile.tokenRef);
        if (tokenRef?.source === "env" && tokenRef.id.trim()) {
          selectedGithubToken = (env[tokenRef.id] ?? process.env[tokenRef.id] ?? "").trim();
        }
      }
    }
  }

  let baseUrl = DEFAULT_COPILOT_API_BASE_URL;
  if (selectedGithubToken) {
    try {
      const token = await resolveCopilotApiToken({
        githubToken: selectedGithubToken,
        env,
      });
      baseUrl = token.baseUrl;
    } catch {
      baseUrl = DEFAULT_COPILOT_API_BASE_URL;
    }
  }

  // We deliberately do not write pi-coding-agent auth.json here.
  // OpenClaw keeps auth in auth-profiles and resolves runtime availability from that store.

  // We intentionally do NOT define custom models for Copilot in models.json.
  // pi-coding-agent treats providers with models as replacements requiring apiKey.
  // We only override baseUrl; the model list comes from pi-ai built-ins.
  return {
    baseUrl,
    models: [],
  } satisfies ProviderConfig;
}

export async function resolveImplicitBedrockProvider(params: {
  agentDir: string;
  config?: OpenClawConfig;
  env?: NodeJS.ProcessEnv;
}): Promise<ProviderConfig | null> {
  const env = params.env ?? process.env;
  const discoveryConfig = params.config?.models?.bedrockDiscovery;
  const enabled = discoveryConfig?.enabled;
  const hasAwsCreds = resolveAwsSdkEnvVarName(env) !== undefined;
  if (enabled === false) {
    return null;
  }
  if (enabled !== true && !hasAwsCreds) {
    return null;
  }

  const region = discoveryConfig?.region ?? env.AWS_REGION ?? env.AWS_DEFAULT_REGION ?? "us-east-1";
  const models = await discoverBedrockModels({
    region,
    config: discoveryConfig,
  });
  if (models.length === 0) {
    return null;
  }

  return {
    baseUrl: `https://bedrock-runtime.${region}.amazonaws.com`,
    api: "bedrock-converse-stream",
    auth: "aws-sdk",
    models,
  } satisfies ProviderConfig;
}
