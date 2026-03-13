/**
 * QQ Guild Configuration Adapter
 */

import type { OpenClawConfig } from "openclaw/plugin-sdk";
import type { ResolvedQQGuildAccount, QQGuildAccountConfig } from "./types.js";

const DEFAULT_ACCOUNT_ID = "default";

export function listQQGuildAccountIds(cfg: OpenClawConfig): string[] {
  const accounts = cfg.channels?.qqguild?.accounts;
  if (!accounts || typeof accounts !== "object") {
    return [];
  }
  return Object.keys(accounts).filter((key) => {
    const account = accounts[key];
    return account && typeof account === "object";
  });
}

export function resolveQQGuildAccount(
  cfg: OpenClawConfig,
  accountId?: string | null,
): ResolvedQQGuildAccount {
  const accounts = cfg.channels?.qqguild?.accounts as Record<string, QQGuildAccountConfig> | undefined;
  const id = accountId || DEFAULT_ACCOUNT_ID;

  if (!accounts || !accounts[id]) {
    return {
      accountId: id,
      config: {
        appId: "",
        appSecret: "",
      },
    };
  }

  const config = accounts[id];
  return {
    accountId: id,
    config: {
      appId: config.appId || "",
      appSecret: config.appSecret || "",
      token: config.token,
      enabled: config.enabled ?? true,
      sandbox: config.sandbox ?? false,
      dmPolicy: config.dmPolicy,
      groupPolicy: config.groupPolicy,
    },
  };
}

export function isQQGuildAccountConfigured(account: ResolvedQQGuildAccount): boolean {
  const { appId, appSecret } = account.config;
  return Boolean(appId && appSecret);
}

export function isQQGuildAccountEnabled(account: ResolvedQQGuildAccount): boolean {
  return account.config.enabled !== false;
}

export function applyQQGuildAccountConfig(
  cfg: OpenClawConfig,
  accountId: string,
  input: Partial<QQGuildAccountConfig>,
): OpenClawConfig {
  const accounts = { ...cfg.channels?.qqguild?.accounts } as Record<string, QQGuildAccountConfig>;
  const existing = accounts[accountId] || {};

  accounts[accountId] = {
    ...existing,
    ...input,
  };

  return {
    ...cfg,
    channels: {
      ...cfg.channels,
      qqguild: {
        ...cfg.channels?.qqguild,
        accounts,
      },
    },
  };
}

export function deleteQQGuildAccount(cfg: OpenClawConfig, accountId: string): OpenClawConfig {
  const accounts = { ...cfg.channels?.qqguild?.accounts } as Record<string, QQGuildAccountConfig>;
  delete accounts[accountId];

  return {
    ...cfg,
    channels: {
      ...cfg.channels,
      qqguild: {
        ...cfg.channels?.qqguild,
        accounts,
      },
    },
  };
}
