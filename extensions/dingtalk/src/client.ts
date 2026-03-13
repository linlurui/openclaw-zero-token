/**
 * DingTalk API Client
 */

import type {
  DingTalkAccessTokenResponse,
  DingTalkSendMessageParams,
  DingTalkSendMessageResponse,
  ResolvedDingTalkAccount,
} from "./types.js";

const DINGTALK_API_BASE = "https://api.dingtalk.com";
const DINGTALK_OLD_API_BASE = "https://oapi.dingtalk.com";

type AccessTokenCache = {
  token: string;
  expiresAt: number;
};

const tokenCache = new Map<string, AccessTokenCache>();

export async function getAccessToken(account: ResolvedDingTalkAccount): Promise<string> {
  const { appKey, appSecret } = account.config;
  const cacheKey = `${appKey}:${appSecret}`;

  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() + 60000) {
    return cached.token;
  }

  const url = `${DINGTALK_API_BASE}/v1.0/oauth2/accessToken`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      appKey,
      appSecret,
    }),
  });

  const data = (await response.json()) as DingTalkAccessTokenResponse;

  if (data.errcode !== 0) {
    throw new Error(`DingTalk API error: ${data.errmsg} (${data.errcode})`);
  }

  tokenCache.set(cacheKey, {
    token: data.accessToken,
    expiresAt: Date.now() + data.expiresIn * 1000,
  });

  return data.accessToken;
}

export async function sendMessage(
  account: ResolvedDingTalkAccount,
  params: DingTalkSendMessageParams,
): Promise<DingTalkSendMessageResponse> {
  const accessToken = await getAccessToken(account);
  const agentId = account.config.agentId;

  const url = `${DINGTALK_OLD_API_BASE}/topapi/message/corpconversation/asyncsend_v2?access_token=${encodeURIComponent(accessToken)}`;

  const payload = {
    agent_id: agentId,
    ...params,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return (await response.json()) as DingTalkSendMessageResponse;
}

export async function sendRobotMessage(
  webhook: string,
  params: DingTalkSendMessageParams,
): Promise<{ errcode: number; errmsg: string }> {
  const response = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  return response.json();
}

export async function uploadMedia(
  account: ResolvedDingTalkAccount,
  media: Buffer,
  type: "image" | "voice" | "video" | "file",
  filename: string,
): Promise<{ media_id: string }> {
  const accessToken = await getAccessToken(account);
  const url = `${DINGTALK_API_BASE}/v1.0/files/upload?access_token=${encodeURIComponent(accessToken)}&type=${type}`;

  const formData = new FormData();
  formData.append("media", new Blob([media]), filename);

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (data.errcode && data.errcode !== 0) {
    throw new Error(`DingTalk media upload error: ${data.errmsg} (${data.errcode})`);
  }

  return { media_id: data.media_id };
}

export async function getUserIdByPhone(
  account: ResolvedDingTalkAccount,
  phone: string,
): Promise<string | null> {
  const accessToken = await getAccessToken(account);
  const url = `${DINGTALK_API_BASE}/v1.0/contact/users/byMobile?access_token=${encodeURIComponent(accessToken)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile: phone }),
  });

  const data = await response.json();
  if (data.errcode !== 0 || !data.result?.userid) {
    return null;
  }

  return data.result.userid;
}

export async function getUserInfo(
  account: ResolvedDingTalkAccount,
  userId: string,
): Promise<{
  userid: string;
  name: string;
  dept_id_list?: number[];
  title?: string;
  mobile?: string;
  email?: string;
  avatar?: string;
} | null> {
  const accessToken = await getAccessToken(account);
  const url = `${DINGTALK_API_BASE}/v1.0/contact/users/${userId}?access_token=${encodeURIComponent(accessToken)}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.errcode !== 0) {
    return null;
  }

  return {
    userid: data.result.userid,
    name: data.result.name,
    dept_id_list: data.result.dept_id_list,
    title: data.result.title,
    mobile: data.result.mobile,
    email: data.result.email,
    avatar: data.result.avatar,
  };
}
