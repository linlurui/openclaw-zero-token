/**
 * WeCom Configuration Adapter
 */

import type { OpenClawConfig } from "openclaw/plugin-sdk";
import type { ResolvedWeComAccount, WeComAccountConfig } from "./types.js";

const DEFAULT_ACCOUNT_ID = "default";

export function listWeComAccountIds(cfg: OpenClawConfig): string[] {
  const accounts = cfg.channels?.wecom?.accounts;
  if (!accounts || typeof accounts !== "object") {
    return [];
  }
  return Object.keys(accounts).filter((key) => {
    const account = accounts[key];
    return account && typeof account === "object";
  });
}

export function resolveWeComAccount(
  cfg: OpenClawConfig,
  accountId?: string | null,
): ResolvedWeComAccount {
  const accounts = cfg.channels?.wecom?.accounts as Record<string, WeComAccountConfig> | undefined;
  const id = accountId || DEFAULT_ACCOUNT_ID;

  if (!accounts || !accounts[id]) {
    return {
      accountId: id,
      config: {
        corpId: "",
        agentId: "",
        secret: "",
      },
    };
  }

  const config = accounts[id];
  return {
    accountId: id,
    config: {
      corpId: config.corpId || "",
      agentId: config.agentId || "",
      secret: config.secret || "",
      token: config.token,
      encodingAESKey: config.encodingAESKey,
      enabled: config.enabled ?? true,
      connectionMode: config.connectionMode ?? "webhook",
      dmPolicy: config.dmPolicy,
      groupPolicy: config.groupPolicy,
    },
  };
}

export function isWeComAccountConfigured(account: ResolvedWeComAccount): boolean {
  const { corpId, agentId, secret } = account.config;
  return Boolean(corpId && agentId && secret);
}

export function isWeComAccountEnabled(account: ResolvedWeComAccount): boolean {
  return account.config.enabled !== false;
}

export function applyWeComAccountConfig(
  cfg: OpenClawConfig,
  accountId: string,
  input: Partial<WeComAccountConfig>,
): OpenClawConfig {
  const accounts = { ...cfg.channels?.wecom?.accounts } as Record<string, WeComAccountConfig>;
  const existing = accounts[accountId] || {};

  accounts[accountId] = {
    ...existing,
    ...input,
  };

  return {
    ...cfg,
    channels: {
      ...cfg.channels,
      wecom: {
        ...cfg.channels?.wecom,
        accounts,
      },
    },
  };
}

export function deleteWeComAccount(cfg: OpenClawConfig, accountId: string): OpenClawConfig {
  const accounts = { ...cfg.channels?.wecom?.accounts } as Record<string, WeComAccountConfig>;
  delete accounts[accountId];

  return {
    ...cfg,
    channels: {
      ...cfg.channels,
      wecom: {
        ...cfg.channels?.wecom,
        accounts,
      },
    },
  };
}
