/**
 * WeCom Channel Plugin Entry Point
 */

import type { ChannelPlugin, ChannelMeta, ChannelCapabilities } from "openclaw/plugin-sdk";
import {
  listWeComAccountIds,
  resolveWeComAccount,
  isWeComAccountConfigured,
  isWeComAccountEnabled,
} from "./config.js";
import { wecomOutbound } from "./outbound.js";
import type { ResolvedWeComAccount } from "./types.js";

const WECOM_META: ChannelMeta = {
  id: "wecom",
  label: "WeCom",
  selectionLabel: "WeCom (企业微信)",
  detailLabel: "WeCom Bot",
  docsPath: "/channels/wecom",
  docsLabel: "wecom",
  blurb: "企业微信应用消息推送，支持文本、Markdown、卡片消息。",
  systemImage: "message",
  aliases: ["企业微信", "qywx", "work_wechat"],
};

const WECOM_CAPABILITIES: ChannelCapabilities = {
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
  location: true,
  contacts: true,
  markdown: true,
};

export const wecomPlugin: ChannelPlugin<ResolvedWeComAccount> = {
  id: "wecom",
  meta: WECOM_META,
  capabilities: WECOM_CAPABILITIES,

  config: {
    listAccountIds: listWeComAccountIds,
    resolveAccount: resolveWeComAccount,
    defaultAccountId: () => "default",
    isConfigured: isWeComAccountConfigured,
    isEnabled: isWeComAccountEnabled,
    unconfiguredReason: (account) => {
      if (!account.config.corpId) return "缺少企业 ID (corpId)";
      if (!account.config.agentId) return "缺少应用 ID (agentId)";
      if (!account.config.secret) return "缺少应用密钥 (secret)";
      return "未配置";
    },
    disabledReason: (account) => {
      if (account.config.enabled === false) return "已禁用";
      return "未启用";
    },
    describeAccount: (account) => ({
      accountId: account.accountId,
      enabled: account.config.enabled !== false,
      configured: isWeComAccountConfigured(account),
      label: `WeCom (${account.config.agentId})`,
    }),
  },

  outbound: wecomOutbound,

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
      configured: isWeComAccountConfigured(params.account),
      label: `WeCom (${params.account.config.agentId})`,
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
      if (!ctx.account.config.token) {
        warnings.push("未配置 Token，Webhook 回调验签可能失败");
      }
      if (!ctx.account.config.encodingAESKey) {
        warnings.push("未配置 EncodingAESKey，消息加密解密不可用");
      }
      return warnings;
    },
  },
};

export default wecomPlugin;
