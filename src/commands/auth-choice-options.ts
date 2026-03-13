import type { AuthProfileStore } from "../agents/auth-profiles.js";
import { AUTH_CHOICE_LEGACY_ALIASES_FOR_CLI } from "./auth-choice-legacy.js";
import { ONBOARD_PROVIDER_AUTH_FLAGS } from "./onboard-provider-auth-flags.js";
import type { AuthChoice, AuthChoiceGroupId } from "./onboard-types.js";

export type { AuthChoiceGroupId };

export type AuthChoiceOption = {
  value: AuthChoice;
  label: string;
  hint?: string;
};
export type AuthChoiceGroup = {
  value: AuthChoiceGroupId;
  label: string;
  hint?: string;
  options: AuthChoiceOption[];
};

const AUTH_CHOICE_GROUP_DEFS: {
  value: AuthChoiceGroupId;
  label: string;
  hint?: string;
  choices: AuthChoice[];
}[] = [
  {
    value: "openai",
    label: "OpenAI",
    hint: "Codex OAuth + API key",
    choices: ["openai-codex", "openai-api-key"],
  },
  {
    value: "anthropic",
    label: "Anthropic",
    hint: "setup-token + API key",
    choices: ["token", "apiKey"],
  },
  {
    value: "chutes",
    label: "Chutes",
    hint: "OAuth",
    choices: ["chutes"],
  },
  {
    value: "vllm",
    label: "vLLM",
    hint: "Local/self-hosted OpenAI-compatible",
    choices: ["vllm"],
  },
  {
    value: "ollama",
    label: "Ollama",
    hint: "Cloud and local open models",
    choices: ["ollama"],
  },
  {
    value: "minimax",
    label: "MiniMax",
    hint: "M2.5 (recommended)",
    choices: ["minimax-portal", "minimax-api", "minimax-api-key-cn", "minimax-api-lightning"],
  },
  {
    value: "moonshot",
    label: "Moonshot AI (Kimi K2.5)",
    hint: "Kimi K2.5 + Kimi Coding",
    choices: ["moonshot-api-key", "moonshot-api-key-cn", "kimi-code-api-key"],
  },
  {
    value: "google",
    label: "Google",
    hint: "Gemini API key + OAuth",
    choices: ["gemini-api-key", "google-gemini-cli"],
  },
  {
    value: "xai",
    label: "xAI (Grok)",
    hint: "API key",
    choices: ["xai-api-key"],
  },
  {
    value: "mistral",
    label: "Mistral AI",
    hint: "API key",
    choices: ["mistral-api-key"],
  },
  {
    value: "volcengine",
    label: "Volcano Engine",
    hint: "API key",
    choices: ["volcengine-api-key"],
  },
  {
    value: "byteplus",
    label: "BytePlus",
    hint: "API key",
    choices: ["byteplus-api-key"],
  },
  {
    value: "openrouter",
    label: "OpenRouter",
    hint: "API key",
    choices: ["openrouter-api-key"],
  },
  {
    value: "kilocode",
    label: "Kilo Gateway",
    hint: "API key (OpenRouter-compatible)",
    choices: ["kilocode-api-key"],
  },
  {
    value: "qwen",
    label: "Qwen",
    hint: "OAuth",
    choices: ["qwen-portal"],
  },
  {
    value: "zai",
    label: "GLM Web",
    hint: "GLM Coding Plan / Global / CN",
    choices: ["zai-coding-global", "zai-coding-cn", "zai-global", "zai-cn"],
  },
  {
    value: "qianfan",
    label: "Qianfan",
    hint: "API key",
    choices: ["qianfan-api-key"],
  },
  {
    value: "modelstudio",
    label: "Alibaba Cloud Model Studio",
    hint: "Coding Plan API key (CN / Global)",
    choices: ["modelstudio-api-key-cn", "modelstudio-api-key"],
  },
  {
    value: "copilot",
    label: "Copilot",
    hint: "GitHub + local proxy",
    choices: ["github-copilot", "copilot-proxy"],
  },
  {
    value: "ai-gateway",
    label: "Vercel AI Gateway",
    hint: "API key",
    choices: ["ai-gateway-api-key"],
  },
  {
    value: "opencode",
    label: "OpenCode",
    hint: "Shared API key for Zen + Go catalogs",
    choices: ["opencode-zen", "opencode-go"],
  },
  {
    value: "xiaomi",
    label: "Xiaomi",
    hint: "API key",
    choices: ["xiaomi-api-key"],
  },
  {
    value: "synthetic",
    label: "Synthetic",
    hint: "Anthropic-compatible (multi-model)",
    choices: ["synthetic-api-key"],
  },
  {
    value: "together",
    label: "Together AI",
    hint: "API key",
    choices: ["together-api-key"],
  },
  {
    value: "huggingface",
    label: "Hugging Face",
    hint: "Inference API (HF token)",
    choices: ["huggingface-api-key"],
  },
  {
    value: "venice",
    label: "Venice AI",
    hint: "Privacy-focused (uncensored models)",
    choices: ["venice-api-key"],
  },
  {
    value: "litellm",
    label: "LiteLLM",
    hint: "Unified LLM gateway (100+ providers)",
    choices: ["litellm-api-key"],
  },
  {
    value: "cloudflare-ai-gateway",
    label: "Cloudflare AI Gateway",
    hint: "Account ID + Gateway ID + API key",
    choices: ["cloudflare-ai-gateway-api-key"],
  },
  {
    value: "custom",
    label: "Custom Provider",
    hint: "Any OpenAI or Anthropic compatible endpoint",
    choices: ["custom-api-key"],
  },
  {
    value: "siliconflow-global",
    label: "SiliconFlow (International)",
    hint: "DeepSeek, Qwen, Llama (API key)",
    choices: ["siliconflow-global-api-key"],
  },
  {
    value: "siliconflow-cn",
    label: "SiliconFlow (China)",
    hint: "DeepSeek, Qwen, Llama (API key)",
    choices: ["siliconflow-cn-api-key"],
  },
  {
    value: "deepseek-web",
    label: "DeepSeek Browser",
    hint: "Uses cookies (V3/R1 thinking)",
    choices: ["deepseek-web"],
  },
  {
    value: "doubao-web",
    label: "Doubao",
    hint: "Browser-based authentication",
    choices: ["doubao-web"],
  },
  {
    value: "claude-web",
    label: "Claude Web",
    hint: "Free access via browser session",
    choices: ["claude-web"],
  },
  {
    value: "chatgpt-web",
    label: "ChatGPT Web",
    hint: "Browser-based authentication",
    choices: ["chatgpt-web"],
  },
  {
    value: "qwen-web",
    label: "Qwen Web (International)",
    hint: "chat.qwen.ai — Browser-based authentication",
    choices: ["qwen-web"],
  },
  {
    value: "qwen-cn-web",
    label: "Qwen Web (国内版)",
    hint: "qianwen.com — 通过浏览器认证",
    choices: ["qwen-cn-web"],
  },
  {
    value: "kimi-web",
    label: "Kimi Web",
    hint: "Moonshot via browser",
    choices: ["kimi-web"],
  },
  {
    value: "gemini-web",
    label: "Gemini Web",
    hint: "Google Gemini via browser",
    choices: ["gemini-web"],
  },
  {
    value: "grok-web",
    label: "Grok Web",
    hint: "xAI Grok via browser",
    choices: ["grok-web"],
  },
  {
    value: "glm-web",
    label: "GLM Web (智谱清言)",
    hint: "chatglm.cn browser-based",
    choices: ["glm-web"],
  },
  {
    value: "glm-intl-web",
    label: "GLM Web (International)",
    hint: "chat.z.ai — Browser-based authentication",
    choices: ["glm-intl-web"],
  },
  {
    value: "manus",
    label: "Manus",
    hint: "API key",
    choices: ["manus-api-key"],
  },
];

const PROVIDER_AUTH_CHOICE_OPTION_HINTS: Partial<Record<AuthChoice, string>> = {
  "litellm-api-key": "Unified gateway for 100+ LLM providers",
  "cloudflare-ai-gateway-api-key": "Account ID + Gateway ID + API key",
  "venice-api-key": "Privacy-focused inference (uncensored models)",
  "together-api-key": "Access to Llama, DeepSeek, Qwen, and more open models",
  "huggingface-api-key": "Inference Providers — OpenAI-compatible chat",
  "opencode-zen": "Shared OpenCode key; curated Zen catalog",
  "opencode-go": "Shared OpenCode key; Kimi/GLM/MiniMax Go catalog",
};

const PROVIDER_AUTH_CHOICE_OPTION_LABELS: Partial<Record<AuthChoice, string>> = {
  "moonshot-api-key": "Kimi API key (.ai)",
  "moonshot-api-key-cn": "Kimi API key (.cn)",
  "kimi-code-api-key": "Kimi Code API key (subscription)",
  "cloudflare-ai-gateway-api-key": "Cloudflare AI Gateway",
  "opencode-zen": "OpenCode Zen catalog",
  "opencode-go": "OpenCode Go catalog",
};

function buildProviderAuthChoiceOptions(): AuthChoiceOption[] {
  return ONBOARD_PROVIDER_AUTH_FLAGS.map((flag) => ({
    value: flag.authChoice,
    label: PROVIDER_AUTH_CHOICE_OPTION_LABELS[flag.authChoice] ?? flag.description,
    ...(PROVIDER_AUTH_CHOICE_OPTION_HINTS[flag.authChoice]
      ? { hint: PROVIDER_AUTH_CHOICE_OPTION_HINTS[flag.authChoice] }
      : {}),
  }));
}

const BASE_AUTH_CHOICE_OPTIONS: ReadonlyArray<AuthChoiceOption> = [
  {
    value: "token",
    label: "Anthropic token (paste setup-token)",
    hint: "run `claude setup-token` elsewhere, then paste the token here",
  },
  {
    value: "openai-codex",
    label: "OpenAI Codex (ChatGPT OAuth)",
  },
  { value: "chutes", label: "Chutes (OAuth)" },
  {
    value: "vllm",
    label: "vLLM (custom URL + model)",
    hint: "Local/self-hosted OpenAI-compatible server",
  },
  {
    value: "ollama",
    label: "Ollama",
    hint: "Cloud and local open models",
  },
  ...buildProviderAuthChoiceOptions(),
  {
    value: "moonshot-api-key-cn",
    label: "Kimi API key (.cn)",
  },
  {
    value: "kimi-code-api-key",
    label: "Kimi Code API key (subscription)",
  },
  { value: "synthetic-api-key", label: "Synthetic API key" },
  {
    value: "venice-api-key",
    label: "Venice AI API key",
    hint: "Privacy-focused inference (uncensored models)",
  },
  {
    value: "manus-api-key",
    label: "Manus API key",
    hint: "Official Manus API (Credit-based, free tier)",
  },
  {
    value: "together-api-key",
    label: "Together AI API key",
    hint: "Access to Llama, DeepSeek, Qwen, and more open models",
  },
  {
    value: "huggingface-api-key",
    label: "Hugging Face API key (HF token)",
    hint: "Inference Providers — OpenAI-compatible chat",
  },
  {
    value: "github-copilot",
    label: "GitHub Copilot (GitHub device login)",
    hint: "Uses GitHub device flow",
  },
  { value: "gemini-api-key", label: "Google Gemini API key" },
  {
    value: "google-gemini-cli",
    label: "Google Gemini CLI OAuth",
    hint: "Unofficial flow; review account-risk warning before use",
  },
  { value: "zai-api-key", label: "Z.AI API key" },
  {
    value: "zai-coding-global",
    label: "Coding-Plan-Global",
    hint: "GLM Coding Plan Global (api.z.ai)",
  },
  {
    value: "zai-coding-cn",
    label: "Coding-Plan-CN",
    hint: "GLM Coding Plan CN (open.bigmodel.cn)",
  },
  {
    value: "zai-global",
    label: "Global",
    hint: "Z.AI Global (api.z.ai)",
  },
  {
    value: "zai-cn",
    label: "CN",
    hint: "Z.AI CN (open.bigmodel.cn)",
  },
  {
    value: "xiaomi-api-key",
    label: "Xiaomi API key",
  },
  {
    value: "minimax-portal",
    label: "MiniMax OAuth",
    hint: "Oauth plugin for MiniMax",
  },
  { value: "qwen-portal", label: "Qwen OAuth" },
  {
    value: "copilot-proxy",
    label: "Copilot Proxy (local)",
    hint: "Local proxy for VS Code Copilot models",
  },
  { value: "apiKey", label: "Anthropic API key" },
  {
    value: "opencode-zen",
    label: "OpenCode Zen catalog",
    hint: "Claude, GPT, Gemini via opencode.ai/zen",
  },
  { value: "minimax-api", label: "MiniMax M2.5" },
  {
    value: "minimax-api-key-cn",
    label: "MiniMax M2.5 (CN)",
    hint: "China endpoint (api.minimaxi.com)",
  },
  {
    value: "minimax-api-lightning",
    label: "MiniMax M2.5 Highspeed",
    hint: "Official fast tier (legacy: Lightning)",
  },
  { value: "qianfan-api-key", label: "Qianfan API key" },
  {
    value: "modelstudio-api-key-cn",
    label: "Coding Plan API Key for China (subscription)",
    hint: "Endpoint: coding.dashscope.aliyuncs.com",
  },
  {
    value: "modelstudio-api-key",
    label: "Coding Plan API Key for Global/Intl (subscription)",
    hint: "Endpoint: coding-intl.dashscope.aliyuncs.com",
  },
  {
    value: "siliconflow-global-api-key",
    label: "SiliconFlow (International)",
    hint: "deepseek-ai/DeepSeek-V3",
  },
  {
    value: "siliconflow-cn-api-key",
    label: "SiliconFlow (China)",
    hint: "deepseek-ai/DeepSeek-V3",
  },
  {
    value: "deepseek-web",
    label: "DeepSeek Browser (Cookie auth)",
    hint: "Access DeepSeek V3/R1 via logged-in session",
  },
  {
    value: "doubao-web",
    label: "Doubao Browser",
    hint: "Access Doubao via browser session (like Claude)",
  },
  {
    value: "claude-web",
    label: "Claude Web (Free)",
    hint: "Access Claude via browser session cookie",
  },
  {
    value: "chatgpt-web",
    label: "ChatGPT Browser",
    hint: "Access ChatGPT via browser session",
  },
  {
    value: "qwen-web",
    label: "Qwen Browser (International)",
    hint: "Access Qwen via chat.qwen.ai",
  },
  {
    value: "qwen-cn-web",
    label: "Qwen Browser (国内版)",
    hint: "通过 qianwen.com 访问通义千问",
  },
  {
    value: "kimi-web",
    label: "Kimi Browser",
    hint: "Access Moonshot Kimi via browser",
  },
  {
    value: "gemini-web",
    label: "Gemini Browser",
    hint: "Access Google Gemini via browser",
  },
  {
    value: "grok-web",
    label: "Grok Browser",
    hint: "Access xAI Grok via browser",
  },
  {
    value: "glm-web",
    label: "Z Browser (智谱清言)",
    hint: "Access chatglm.cn via browser",
  },
  {
    value: "glm-intl-web",
    label: "GLM Browser (International)",
    hint: "Access chat.z.ai via browser",
  },
  {
    value: "manus-api-key",
    label: "Manus API",
    hint: "Official Manus API (Credit-based)",
  },
  { value: "custom-api-key", label: "Custom Provider" },
];

export function formatAuthChoiceChoicesForCli(params?: {
  includeSkip?: boolean;
  includeLegacyAliases?: boolean;
}): string {
  const includeSkip = params?.includeSkip ?? true;
  const includeLegacyAliases = params?.includeLegacyAliases ?? false;
  const values = BASE_AUTH_CHOICE_OPTIONS.map((opt) => opt.value);

  if (includeSkip) {
    values.push("skip");
  }
  if (includeLegacyAliases) {
    values.push(...AUTH_CHOICE_LEGACY_ALIASES_FOR_CLI);
  }

  return values.join("|");
}

export function buildAuthChoiceOptions(params: {
  store: AuthProfileStore;
  includeSkip: boolean;
}): AuthChoiceOption[] {
  void params.store;
  const options: AuthChoiceOption[] = [...BASE_AUTH_CHOICE_OPTIONS];

  if (params.includeSkip) {
    options.push({ value: "skip", label: "Skip for now" });
  }

  return options;
}

export function buildAuthChoiceGroups(params: { store: AuthProfileStore; includeSkip: boolean }): {
  groups: AuthChoiceGroup[];
  skipOption?: AuthChoiceOption;
} {
  const options = buildAuthChoiceOptions({
    ...params,
    includeSkip: false,
  });
  const optionByValue = new Map<AuthChoice, AuthChoiceOption>(
    options.map((opt) => [opt.value, opt]),
  );

  const groups = AUTH_CHOICE_GROUP_DEFS.map((group) => ({
    ...group,
    options: group.choices
      .map((choice) => optionByValue.get(choice))
      .filter((opt): opt is AuthChoiceOption => Boolean(opt)),
  }));

  const skipOption = params.includeSkip
    ? ({ value: "skip", label: "Skip for now" } satisfies AuthChoiceOption)
    : undefined;

  return { groups, skipOption };
}
