/**
 * DingTalk Configuration Adapter
 */

import type { OpenClawConfig } from "openclaw/plugin-sdk";
import type { ResolvedDingTalkAccount, DingTalkAccountConfig } from "./types.js";

const DEFAULT_ACCOUNT_ID = "default";

export function listDingTalkAccountIds(cfg: OpenClawConfig): string[] {
  const accounts = cfg.channels?.dingtalk?.accounts;
  if (!accounts || typeof accounts !== "object") {
    return [];
  }
  return Object.keys(accounts).filter((key) => {
    const account = accounts[key];
    return account && typeof account === "object";
  });
}

export function resolveDingTalkAccount(
  cfg: OpenClawConfig,
  accountId?: string | null,
): ResolvedDingTalkAccount {
  const accounts = cfg.channels?.dingtalk?.accounts as Record<string, DingTalkAccountConfig> | undefined;
  const id = accountId || DEFAULT_ACCOUNT_ID;

  if (!accounts || !accounts[id]) {
    return {
      accountId: id,
      config: {
        appKey: "",
        appSecret: "",
      },
    };
  }

  const config = accounts[id];
  return {
    accountId: id,
    config: {
      appKey: config.appKey || "",
      appSecret: config.appSecret || "",
      agentId: config.agentId,
      enabled: config.enabled ?? true,
      connectionMode: config.connectionMode ?? "webhook",
      dmPolicy: config.dmPolicy,
      groupPolicy: config.groupPolicy,
    },
  };
}

export function isDingTalkAccountConfigured(account: ResolvedDingTalkAccount): boolean {
  const { appKey, appSecret, agentId } = account.config;
  return Boolean(appKey && appSecret && agentId);
}

export function isDingTalkAccountEnabled(account: ResolvedDingTalkAccount): boolean {
  return account.config.enabled !== false;
}

export function applyDingTalkAccountConfig(
  cfg: OpenClawConfig,
  accountId: string,
  input: Partial<DingTalkAccountConfig>,
): OpenClawConfig {
  const accounts = { ...cfg.channels?.dingtalk?.accounts } as Record<string, DingTalkAccountConfig>;
  const existing = accounts[accountId] || {};

  accounts[accountId] = {
    ...existing,
    ...input,
  };

  return {
    ...cfg,
    channels: {
      ...cfg.channels,
      dingtalk: {
        ...cfg.channels?.dingtalk,
        accounts,
      },
    },
  };
}

export function deleteDingTalkAccount(cfg: OpenClawConfig, accountId: string): OpenClawConfig {
  const accounts = { ...cfg.channels?.dingtalk?.accounts } as Record<string, DingTalkAccountConfig>;
  delete accounts[accountId];

  return {
    ...cfg,
    channels: {
      ...cfg.channels,
      dingtalk: {
        ...cfg.channels?.dingtalk,
        accounts,
      },
    },
  };
}
