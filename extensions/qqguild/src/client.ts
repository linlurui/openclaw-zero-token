/**
 * QQ Guild API Client
 * API Reference: https://bot.q.qq.com/wiki/develop/api/
 */

import * as crypto from "crypto";
import type {
  QQGuildAccessTokenResponse,
  QQGuildSendMessageParams,
  QQGuildSendMessageResponse,
  QQGuildGatewayInfo,
  QQGuildChannel,
  QQGuildGuild,
  ResolvedQQGuildAccount,
} from "./types.js";

const QQGUILD_API_BASE = "https://api.sgroup.qq.com";
const QQGUILD_SANDBOX_API_BASE = "https://sandbox.api.sgroup.qq.com";

type AccessTokenCache = {
  token: string;
  expiresAt: number;
};

const tokenCache = new Map<string, AccessTokenCache>();

function getApiBase(sandbox?: boolean): string {
  return sandbox ? QQGUILD_SANDBOX_API_BASE : QQGUILD_API_BASE;
}

export async function getAccessToken(account: ResolvedQQGuildAccount): Promise<string> {
  const { appId, appSecret, sandbox } = account.config;
  const cacheKey = `${appId}:${appSecret}`;

  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() + 60000) {
    return cached.token;
  }

  // QQ Guild uses Bot appid.token format for authorization
  // First we need to get the bot token via OAuth2
  const url = "https://bots.qq.com/app/getAppAccessToken";
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      appId,
      clientSecret: appSecret,
    }),
  });

  const data = (await response.json()) as QQGuildAccessTokenResponse & { retcode?: number };
  
  if (data.retcode && data.retcode !== 0) {
    throw new Error(`QQ Guild API error: ${JSON.stringify(data)}`);
  }

  // QQ Guild access token format: "QQBot {access_token}"
  const token = `QQBot ${data.access_token}`;
  
  tokenCache.set(cacheKey, {
    token,
    expiresAt: Date.now() + data.expires_in * 1000,
  });

  return token;
}

async function makeApiRequest<T>(
  account: ResolvedQQGuildAccount,
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const accessToken = await getAccessToken(account);
  const baseUrl = getApiBase(account.config.sandbox);
  const url = `${baseUrl}${path}`;

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: accessToken,
      "Content-Type": "application/json",
      "X-Union-Appid": account.config.appId,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();
  
  // Check for error response
  if (data.retcode && data.retcode !== 0) {
    throw new Error(`QQ Guild API error: ${data.msg || JSON.stringify(data)}`);
  }

  return data;
}

export async function sendMessage(
  account: ResolvedQQGuildAccount,
  channelId: string,
  params: QQGuildSendMessageParams,
): Promise<QQGuildSendMessageResponse> {
  return makeApiRequest<QQGuildSendMessageResponse>(
    account,
    "POST",
    `/channels/${channelId}/messages`,
    params,
  );
}

export async function sendDirectMessage(
  account: ResolvedQQGuildAccount,
  guildId: string,
  params: QQGuildSendMessageParams,
): Promise<QQGuildSendMessageResponse> {
  return makeApiRequest<QQGuildSendMessageResponse>(
    account,
    "POST",
    `/dms/${guildId}/messages`,
    params,
  );
}

export async function createDMSession(
  account: ResolvedQQGuildAccount,
  recipientId: string,
  sourceGuildId: string,
): Promise<{ guild_id: string }> {
  return makeApiRequest<{ guild_id: string }>(
    account,
    "POST",
    "/users/@me/dms",
    {
      recipient_id: recipientId,
      source_guild_id: sourceGuildId,
    },
  );
}

export async function getGateway(account: ResolvedQQGuildAccount): Promise<QQGuildGatewayInfo> {
  return makeApiRequest<QQGuildGatewayInfo>(account, "GET", "/gateway");
}

export async function getGatewayBot(account: ResolvedQQGuildAccount): Promise<QQGuildGatewayInfo> {
  return makeApiRequest<QQGuildGatewayInfo>(account, "GET", "/gateway/bot");
}

export async function getChannel(
  account: ResolvedQQGuildAccount,
  channelId: string,
): Promise<QQGuildChannel> {
  return makeApiRequest<QQGuildChannel>(account, "GET", `/channels/${channelId}`);
}

export async function getGuild(
  account: ResolvedQQGuildAccount,
  guildId: string,
): Promise<QQGuildGuild> {
  return makeApiRequest<QQGuildGuild>(account, "GET", `/guilds/${guildId}`);
}

export async function getGuildChannels(
  account: ResolvedQQGuildAccount,
  guildId: string,
): Promise<QQGuildChannel[]> {
  return makeApiRequest<QQGuildChannel[]>(account, "GET", `/guilds/${guildId}/channels`);
}

export async function getMe(
  account: ResolvedQQGuildAccount,
): Promise<{ id: string; username: string; avatar?: string }> {
  return makeApiRequest(account, "GET", "/users/@me");
}

// Upload file/image for message
export async function uploadFile(
  account: ResolvedQQGuildAccount,
  channelId: string,
  file: Buffer,
  filename: string,
): Promise<{ id: string }> {
  const accessToken = await getAccessToken(account);
  const baseUrl = getApiBase(account.config.sandbox);
  const url = `${baseUrl}/channels/${channelId}/files`;

  const formData = new FormData();
  formData.append("file", new Blob([file]), filename);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: accessToken,
    },
    body: formData,
  });

  const data = await response.json();
  if (data.retcode && data.retcode !== 0) {
    throw new Error(`QQ Guild file upload error: ${data.msg || JSON.stringify(data)}`);
  }

  return { id: data.id };
}

// Verify signature for webhook
export function verifySignature(
  secret: string,
  body: string,
  signature: string,
): boolean {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected),
  );
}
