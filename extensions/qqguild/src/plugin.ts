/**
 * QQ Guild Channel Plugin Entry Point
 */

import type { ChannelPlugin, ChannelMeta, ChannelCapabilities } from "openclaw/plugin-sdk";
import {
  listQQGuildAccountIds,
  resolveQQGuildAccount,
  isQQGuildAccountConfigured,
  isQQGuildAccountEnabled,
} from "./config.js";
import { qqguildOutbound } from "./outbound.js";
import type { ResolvedQQGuildAccount } from "./types.js";

const QQGUILD_META: ChannelMeta = {
  id: "qqguild",
  label: "QQ Guild",
  selectionLabel: "QQ Guild (QQ频道)",
  detailLabel: "QQ Guild Bot",
  docsPath: "/channels/qqguild",
  docsLabel: "qqguild",
  blurb: "QQ 频道机器人，支持文本、Embed、Markdown 消息。",
  systemImage: "bubble.left.and.bubble.right",
  aliases: ["QQ频道", "qq频道", "qqchannel"],
};

const QQGUILD_CAPABILITIES: ChannelCapabilities = {
  chatTypes: ["direct", "group"],
  polls: false,
  reactions: true,
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

export const qqguildPlugin: ChannelPlugin<ResolvedQQGuildAccount> = {
  id: "qqguild",
  meta: QQGUILD_META,
  capabilities: QQGUILD_CAPABILITIES,

  config: {
    listAccountIds: listQQGuildAccountIds,
    resolveAccount: resolveQQGuildAccount,
    defaultAccountId: () => "default",
    isConfigured: isQQGuildAccountConfigured,
    isEnabled: isQQGuildAccountEnabled,
    unconfiguredReason: (account) => {
      if (!account.config.appId) return "缺少 App ID";
      if (!account.config.appSecret) return "缺少 App Secret";
      return "未配置";
    },
    disabledReason: (account) => {
      if (account.config.enabled === false) return "已禁用";
      return "未启用";
    },
    describeAccount: (account) => ({
      accountId: account.accountId,
      enabled: account.config.enabled !== false,
      configured: isQQGuildAccountConfigured(account),
      label: `QQ Guild (${account.config.appId})`,
    }),
  },

  outbound: qqguildOutbound,

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
      configured: isQQGuildAccountConfigured(params.account),
      label: `QQ Guild (${params.account.config.appId})`,
    }),
  },

  security: {
    resolveDmPolicy: (ctx) => {
      const policy = ctx.account.config.dmPolicy;
      if (policy === "none") return "none";
      if (policy === "all") return "all";
      return "paired";
    },
    collectWarnings: async () => {
      return [];
    },
  },
};

export default qqguildPlugin;
