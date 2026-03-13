/**
 * DingTalk (钉钉) Channel Types
 */

export type DingTalkAccountConfig = {
  appKey: string;
  appSecret: string;
  agentId?: string;
  enabled?: boolean;
  connectionMode?: "webhook" | "stream";
  dmPolicy?: "all" | "paired" | "none";
  groupPolicy?: "mention" | "all";
};

export type ResolvedDingTalkAccount = {
  accountId: string;
  config: DingTalkAccountConfig;
};

export type DingTalkMessage = {
  msgId: string;
  conversationId: string;
  conversationType: "1" | "2"; // 1=单聊, 2=群聊
  conversationTitle?: string;
  senderId: string;
  senderNick?: string;
  senderCorpId?: string;
  senderStaffId?: string;
  msgtype: "text" | "picture" | "voice" | "file" | "link" | "richText" | "actionCard";
  content: DingTalkMessageContent;
  createTime: number;
};

export type DingTalkMessageContent = {
  text?: string;
  richText?: Array<{
    type: "text" | "markdown" | "attachment";
    text?: string;
    downloadCode?: string;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
  }>;
  downloadCode?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  picURL?: string;
  duration?: number;
  title?: string;
  description?: string;
  url?: string;
};

export type DingTalkSendMessageParams = {
  userid_list?: string;
  dept_id_list?: string;
  to_all_user?: boolean;
  msgtype: "text" | "image" | "voice" | "file" | "link" | "oa" | "markdown" | "action_card";
  text?: { content: string };
  image?: { media_id: string };
  voice?: { media_id: string; duration: string };
  file?: { media_id: string };
  link?: {
    messageUrl: string;
    picUrl?: string;
    title: string;
    text: string;
  };
  oa?: {
    messageUrl: string;
    head: { text: string; bgcolor?: string };
    body: {
      title?: string;
      form?: Array<{ key: string; value: string }>;
      rich?: { num: string; unit: string };
      content?: string;
      image?: string;
      fileCount?: string;
      author?: string;
    };
  };
  markdown?: { title: string; text: string };
  action_card?: {
    title: string;
    markdown: string;
    single_title?: string;
    single_url?: string;
    btn_orientation?: "0" | "1";
    btn_json_list?: Array<{ title: string; action_url: string }>;
  };
};

export type DingTalkAccessTokenResponse = {
  errcode: number;
  errmsg: string;
  accessToken: string;
  expiresIn: number;
};

export type DingTalkSendMessageResponse = {
  errcode: number;
  errmsg: string;
  task_id?: number;
};

export type DingTalkStreamMessage = {
  headers: {
    contentType: string;
    messageId: string;
    eventType: string;
    eventId: string;
    timestamp: string;
    corpId: string;
    tenantKey: string;
    appId: string;
  };
  body: {
    sender: {
      senderId: string;
      senderType: string;
      tenantKey: string;
    };
    conversation: {
      conversationId: string;
      conversationType: number;
      conversationSubType?: number;
      conversationOwnerId?: string;
    };
    message: {
      messageId: string;
      msgType: string;
      msgId: string;
      createTime: number;
      content: string;
    };
  };
};
