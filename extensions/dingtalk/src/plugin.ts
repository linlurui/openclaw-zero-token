/**
 * DingTalk Channel Plugin Entry Point
 */

import type { ChannelPlugin, ChannelMeta, ChannelCapabilities } from "openclaw/plugin-sdk";
import {
  listDingTalkAccountIds,
  resolveDingTalkAccount,
  isDingTalkAccountConfigured,
  isDingTalkAccountEnabled,
} from "./config.js";
import { dingtalkOutbound } from "./outbound.js";
import type { ResolvedDingTalkAccount } from "./types.js";

const DINGTALK_META: ChannelMeta = {
  id: "dingtalk",
  label: "DingTalk",
  selectionLabel: "DingTalk (钉钉)",
  detailLabel: "DingTalk Bot",
  docsPath: "/channels/dingtalk",
  docsLabel: "dingtalk",
  blurb: "钉钉企业应用消息推送，支持文本、Markdown、OA 消息。",
  systemImage: "message",
  aliases: ["钉钉", "dd", "dingding"],
};

const DINGTALK_CAPABILITIES: ChannelCapabilities = {
  chatTypes: ["direct", "group"],
  polls: false,
  reactions: false,
  typing: false,
  readReceipts: false,
  threads: false,
  files: true,
  images: true,
  audio: true,
  video: true,
  location: false,
  contacts: true,
  markdown: true,
};

export const dingtalkPlugin: ChannelPlugin<ResolvedDingTalkAccount> = {
  id: "dingtalk",
  meta: DINGTALK_META,
  capabilities: DINGTALK_CAPABILITIES,

  config: {
    listAccountIds: listDingTalkAccountIds,
    resolveAccount: resolveDingTalkAccount,
    defaultAccountId: () => "default",
    isConfigured: isDingTalkAccountConfigured,
    isEnabled: isDingTalkAccountEnabled,
    unconfiguredReason: (account) => {
      if (!account.config.appKey) return "缺少 AppKey";
      if (!account.config.appSecret) return "缺少 AppSecret";
      if (!account.config.agentId) return "缺少 AgentId";
      return "未配置";
    },
    disabledReason: (account) => {
      if (account.config.enabled === false) return "已禁用";
      return "未启用";
    },
    describeAccount: (account) => ({
      accountId: account.accountId,
      enabled: account.config.enabled !== false,
      configured: isDingTalkAccountConfigured(account),
      label: `DingTalk (${account.config.agentId})`,
    }),
  },

  outbound: dingtalkOutbound,

  status: {
    resolveAccountState: (params) => {
      const { account, configured, enabled } = params;
      if (!configured) return "unconfigured";
      if (!enabled) return "disabled";
      return "active";
    },
    buildAccountSnapshot: (params) => ({
      accountId: params.account.accountId,
      enabled: params.account.config.enabled !== false,
      configured: isDingTalkAccountConfigured(params.account),
      label: `DingTalk (${params.account.config.agentId})`,
    }),
  },

  security: {
    resolveDmPolicy: (ctx) => {
      const policy = ctx.account.config.dmPolicy;
      if (policy === "none") return "none";
      if (policy === "all") return "all";
      return "paired";
    },
    collectWarnings: async (ctx) => {
      const warnings: string[] = [];
      // Add any security warnings here
      return warnings;
    },
  },
};

export default dingtalkPlugin;
