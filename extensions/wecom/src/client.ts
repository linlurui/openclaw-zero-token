/**
 * WeCom API Client
 */

import type {
  WeComAccessTokenResponse,
  WeComSendMessageParams,
  WeComSendMessageResponse,
  ResolvedWeComAccount,
} from "./types.js";

const WECOM_API_BASE = "https://qyapi.weixin.qq.com/cgi-bin";

type AccessTokenCache = {
  token: string;
  expiresAt: number;
};

const tokenCache = new Map<string, AccessTokenCache>();

export async function getAccessToken(account: ResolvedWeComAccount): Promise<string> {
  const { corpId, secret } = account.config;
  const cacheKey = `${corpId}:${secret}`;

  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() + 60000) {
    return cached.token;
  }

  const url = `${WECOM_API_BASE}/gettoken?corpid=${encodeURIComponent(corpId)}&corpsecret=${encodeURIComponent(secret)}`;
  const response = await fetch(url);
  const data = (await response.json()) as WeComAccessTokenResponse;

  if (data.errcode !== 0) {
    throw new Error(`WeCom API error: ${data.errmsg} (${data.errcode})`);
  }

  tokenCache.set(cacheKey, {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  });

  return data.access_token;
}

export async function sendMessage(
  account: ResolvedWeComAccount,
  params: WeComSendMessageParams,
): Promise<WeComSendMessageResponse> {
  const accessToken = await getAccessToken(account);
  const url = `${WECOM_API_BASE}/message/send?access_token=${encodeURIComponent(accessToken)}`;

  const payload = {
    ...params,
    agentid: account.config.agentId,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return (await response.json()) as WeComSendMessageResponse;
}

export async function uploadMedia(
  account: ResolvedWeComAccount,
  media: Buffer,
  type: "image" | "voice" | "video" | "file",
  filename: string,
): Promise<{ media_id: string; created_at: string }> {
  const accessToken = await getAccessToken(account);
  const url = `${WECOM_API_BASE}/media/upload?access_token=${encodeURIComponent(accessToken)}&type=${type}`;

  const formData = new FormData();
  formData.append("media", new Blob([media]), filename);

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (data.errcode && data.errcode !== 0) {
    throw new Error(`WeCom media upload error: ${data.errmsg} (${data.errcode})`);
  }

  return { media_id: data.media_id, created_at: data.created_at };
}

export async function getUserIdByPhone(
  account: ResolvedWeComAccount,
  phone: string,
): Promise<string | null> {
  const accessToken = await getAccessToken(account);
  const url = `${WECOM_API_BASE}/user/getuserid?access_token=${encodeURIComponent(accessToken)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile: phone }),
  });

  const data = await response.json();
  if (data.errcode !== 0 || !data.userid) {
    return null;
  }

  return data.userid;
}

export async function getUserInfo(
  account: ResolvedWeComAccount,
  userId: string,
): Promise<{
  userid: string;
  name: string;
  department: number[];
  position?: string;
  mobile?: string;
  email?: string;
  avatar?: string;
} | null> {
  const accessToken = await getAccessToken(account);
  const url = `${WECOM_API_BASE}/user/get?access_token=${encodeURIComponent(accessToken)}&userid=${encodeURIComponent(userId)}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.errcode !== 0) {
    return null;
  }

  return {
    userid: data.userid,
    name: data.name,
    department: data.department,
    position: data.position,
    mobile: data.mobile,
    email: data.email,
    avatar: data.avatar,
  };
}
