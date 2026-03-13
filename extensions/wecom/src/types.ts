/**
 * WeCom (企业微信) Channel Types
 */

export type WeComAccountConfig = {
  corpId: string;
  agentId: string;
  secret: string;
  token?: string;
  encodingAESKey?: string;
  enabled?: boolean;
  connectionMode?: "webhook" | "websocket";
  dmPolicy?: "all" | "paired" | "none";
  groupPolicy?: "mention" | "all";
};

export type ResolvedWeComAccount = {
  accountId: string;
  config: WeComAccountConfig;
};

export type WeComMessage = {
  MsgId: string;
  From: string;
  To: string;
  MsgType: "text" | "image" | "voice" | "video" | "location" | "link" | "event";
  Content?: string;
  PicUrl?: string;
  MediaId?: string;
  Format?: string;
  Recognition?: string;
  ThumbMediaId?: string;
  Location_X?: number;
  Location_Y?: number;
  Scale?: number;
  Label?: string;
  Title?: string;
  Description?: string;
  Url?: string;
  Event?: string;
  EventKey?: string;
  AgentID?: string;
  CreateTime: number;
};

export type WeComSendMessageParams = {
  touser?: string;
  toparty?: string;
  totag?: string;
  msgtype: "text" | "image" | "voice" | "video" | "file" | "textcard" | "news" | "mpnews" | "markdown";
  text?: { content: string };
  image?: { media_id: string };
  voice?: { media_id: string };
  video?: { media_id: string; title?: string; description?: string };
  file?: { media_id: string };
  textcard?: { title: string; description: string; url: string; btntxt?: string };
  news?: { articles: Array<{ title: string; description: string; url: string; picurl?: string }> };
  markdown?: { content: string };
  safe?: 0 | 1;
  enable_id_trans?: 0 | 1;
  enable_duplicate_check?: 0 | 1;
  duplicate_check_interval?: number;
};

export type WeComAccessTokenResponse = {
  errcode: number;
  errmsg: string;
  access_token: string;
  expires_in: number;
};

export type WeComSendMessageResponse = {
  errcode: number;
  errmsg: string;
  invaliduser?: string;
  invalidparty?: string;
  invalidtag?: string;
  unlicenseduser?: string;
  msgid?: string;
  response_code?: string;
};

export type WeComWebhookEvent = {
  ToUserName: string;
  FromUserName: string;
  CreateTime: number;
  MsgType: string;
  Event?: string;
  ChangeType?: string;
  UserID?: string;
  ExternalUserID?: string;
  WelcomeCode?: string;
  [key: string]: unknown;
};
