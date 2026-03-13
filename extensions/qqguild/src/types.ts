/**
 * QQ Guild (QQ频道) Channel Types
 * API Reference: https://bot.q.qq.com/wiki/develop/api/
 */

export type QQGuildAccountConfig = {
  appId: string;
  appSecret: string;
  token?: string;
  enabled?: boolean;
  sandbox?: boolean;
  dmPolicy?: "all" | "paired" | "none";
  groupPolicy?: "mention" | "all";
};

export type ResolvedQQGuildAccount = {
  accountId: string;
  config: QQGuildAccountConfig;
};

// Message types
export type QQGuildMessageType = 
  | "text"
  | "image"
  | "video"
  | "file"
  | "audio"
  | "markdown"
  | "ark"
  | "embed";

export type QQGuildMessage = {
  id: string;
  channel_id: string;
  guild_id: string;
  content: string;
  timestamp: string;
  edited_timestamp?: string;
  mention_roles?: string[];
  mention_everyone?: boolean;
  mentions?: QQGuildUser[];
  author: QQGuildUser;
  member?: QQGuildMember;
  attachments?: QQGuildAttachment[];
  ark?: QQGuildArk;
  embeds?: QQGuildEmbed[];
  markdown?: QQGuildMarkdown;
  reference?: {
    message_id: string;
  };
  seq?: number;
  seq_in_channel?: string;
};

export type QQGuildUser = {
  id: string;
  username: string;
  avatar?: string;
  bot?: boolean;
  union_openid?: string;
  union_user_account?: string;
};

export type QQGuildMember = {
  roles?: string[];
  nick?: string;
  joined_at?: string;
};

export type QQGuildAttachment = {
  id: string;
  filename: string;
  size?: number;
  url?: string;
  description?: string;
  content_type?: string;
  height?: number;
  width?: number;
};

export type QQGuildArk = {
  template_id?: number;
  kv?: Array<{
    key: string;
    value: string;
  }>;
};

export type QQGuildEmbed = {
  title?: string;
  description?: string;
  url?: string;
  color?: number;
  fields?: Array<{
    name: string;
    value: string;
  }>;
  thumbnail?: { url: string };
  image?: { url: string };
  footer?: { text: string; icon_url?: string };
  author?: { name: string; url?: string; icon_url?: string };
};

export type QQGuildMarkdown = {
  content?: string;
  embed_template_id?: number;
  embeds?: Array<{
    thumbnail_url?: string;
    title?: string;
    description?: string;
    prompt?: string;
    fields?: Array<{
      name: string;
      value: string | boolean | number;
    }>;
  }>;
};

// Send message params
export type QQGuildSendMessageParams = {
  content?: string;
  embed?: QQGuildEmbed;
  ark?: QQGuildArk;
  markdown?: QQGuildMarkdown;
  image?: string; // URL
  file_image?: string; // file path or base64
  msg_id?: string; // reply to message
  event_id?: string;
  msg_type?: number;
  markdown_template_id?: number;
  markdown_template_params?: string[];
};

// Event types for WebSocket
export type QQGuildEventType =
  | "GUILD_CREATE"
  | "GUILD_UPDATE"
  | "GUILD_DELETE"
  | "CHANNEL_CREATE"
  | "CHANNEL_UPDATE"
  | "CHANNEL_DELETE"
  | "GUILD_MEMBER_ADD"
  | "GUILD_MEMBER_UPDATE"
  | "GUILD_MEMBER_REMOVE"
  | "MESSAGE_CREATE"
  | "MESSAGE_DELETE"
  | "MESSAGE_AUDIT_PASS"
  | "MESSAGE_AUDIT_REJECT"
  | "AT_MESSAGE_CREATE"
  | "PUBLIC_MESSAGE_DELETE"
  | "DIRECT_MESSAGE_CREATE"
  | "DIRECT_MESSAGE_DELETE"
  | "INTERACTION_CREATE"
  | "READY";

export type QQGuildEvent = {
  op: number;
  d: unknown;
  s?: number;
  t?: QQGuildEventType;
};

export type QQGuildReadyEvent = {
  version: number;
  session_id: string;
  user: QQGuildUser;
  shard?: [number, number];
};

export type QQGuildMessageEvent = QQGuildEvent & {
  d: QQGuildMessage;
  t: "MESSAGE_CREATE" | "AT_MESSAGE_CREATE" | "DIRECT_MESSAGE_CREATE";
};

// Gateway
export type QQGuildGatewayInfo = {
  url: string;
  shards?: number;
  session_start_limit?: {
    total: number;
    remaining: number;
    reset_after: number;
    max_concurrency: number;
  };
};

// Channel and Guild info
export type QQGuildChannel = {
  id: string;
  guild_id: string;
  name: string;
  type: number; // 0=文字, 1=语音, 2=子频道分组, etc.
  position: number;
  parent_id?: string;
  owner_id?: string;
  sub_type?: number;
  private_type?: number;
  private_user_ids?: string[];
  speak_permission?: number;
  application_id?: string;
  permissions?: string;
};

export type QQGuildGuild = {
  id: string;
  name: string;
  icon?: string;
  owner_id: string;
  owner?: boolean;
  member_count?: number;
  max_members?: number;
  description?: string;
  joined_at?: string;
  union_app_id?: number;
};

// API Response types
export type QQGuildAccessTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
};

export type QQGuildSendMessageResponse = {
  id: string;
  channel_id: string;
  guild_id: string;
  content: string;
  timestamp: string;
  author: QQGuildUser;
};
