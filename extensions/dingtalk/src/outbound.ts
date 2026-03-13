/**
 * DingTalk Outbound Adapter - Message Sending
 */

import type { OpenClawConfig, ChannelOutboundAdapter, OutboundDeliveryResult } from "openclaw/plugin-sdk";
import type { ResolvedDingTalkAccount } from "./types.js";
import { resolveDingTalkAccount } from "./config.js";
import { sendMessage } from "./client.js";

const DINGTALK_TEXT_LIMIT = 20000;

function chunkText(text: string, limit: number = DINGTALK_TEXT_LIMIT): string[] {
  if (text.length <= limit) {
    return [text];
  }

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= limit) {
      chunks.push(remaining);
      break;
    }

    // Try to break at newline or space
    let breakPoint = remaining.lastIndexOf("\n", limit);
    if (breakPoint === -1 || breakPoint < limit * 0.5) {
      breakPoint = remaining.lastIndexOf(" ", limit);
    }
    if (breakPoint === -1 || breakPoint < limit * 0.5) {
      breakPoint = limit;
    }

    chunks.push(remaining.slice(0, breakPoint).trim());
    remaining = remaining.slice(breakPoint).trim();
  }

  return chunks;
}

async function sendDingTalkText(
  cfg: OpenClawConfig,
  to: string,
  text: string,
  accountId?: string | null,
): Promise<OutboundDeliveryResult> {
  const account = resolveDingTalkAccount(cfg, accountId);

  if (!account.config.appKey || !account.config.appSecret || !account.config.agentId) {
    return {
      channel: "dingtalk",
      ok: false,
      error: "DingTalk account not configured",
    };
  }

  try {
    const response = await sendMessage(account, {
      msgtype: "text",
      userid_list: to,
      text: { content: text },
    });

    if (response.errcode !== 0) {
      return {
        channel: "dingtalk",
        ok: false,
        error: response.errmsg,
      };
    }

    return {
      channel: "dingtalk",
      ok: true,
      messageId: String(response.task_id),
      conversationId: to,
    };
  } catch (error) {
    return {
      channel: "dingtalk",
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function sendDingTalkMarkdown(
  cfg: OpenClawConfig,
  to: string,
  title: string,
  text: string,
  accountId?: string | null,
): Promise<OutboundDeliveryResult> {
  const account = resolveDingTalkAccount(cfg, accountId);

  if (!account.config.appKey || !account.config.appSecret || !account.config.agentId) {
    return {
      channel: "dingtalk",
      ok: false,
      error: "DingTalk account not configured",
    };
  }

  try {
    const response = await sendMessage(account, {
      msgtype: "markdown",
      userid_list: to,
      markdown: { title, text },
    });

    if (response.errcode !== 0) {
      return {
        channel: "dingtalk",
        ok: false,
        error: response.errmsg,
      };
    }

    return {
      channel: "dingtalk",
      ok: true,
      messageId: String(response.task_id),
      conversationId: to,
    };
  } catch (error) {
    return {
      channel: "dingtalk",
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export const dingtalkOutbound: ChannelOutboundAdapter = {
  deliveryMode: "direct",
  textChunkLimit: DINGTALK_TEXT_LIMIT,
  chunker: chunkText,
  chunkerMode: "markdown",

  sendText: async (ctx) => {
    const { cfg, to, text, accountId } = ctx;
    const chunks = chunkText(text);

    const results: OutboundDeliveryResult[] = [];
    for (const chunk of chunks) {
      const result = await sendDingTalkText(cfg, to, chunk, accountId);
      results.push(result);
      if (!result.ok) {
        return result;
      }
    }

    return results[results.length - 1] || { channel: "dingtalk", ok: false, error: "No message sent" };
  },

  sendMedia: async (ctx) => {
    const { cfg, to, mediaUrl, text, accountId } = ctx;
    const account = resolveDingTalkAccount(cfg, accountId);

    if (!account.config.appKey || !account.config.appSecret || !account.config.agentId) {
      return {
        channel: "dingtalk",
        ok: false,
        error: "DingTalk account not configured",
      };
    }

    // For now, send media URL as link message
    // TODO: Implement actual media upload
    if (mediaUrl) {
      const response = await sendMessage(account, {
        msgtype: "link",
        userid_list: to,
        link: {
          messageUrl: mediaUrl,
          title: text || "Media",
          text: text || "Click to view media",
        },
      });

      if (response.errcode !== 0) {
        return {
          channel: "dingtalk",
          ok: false,
          error: response.errmsg,
        };
      }

      return {
        channel: "dingtalk",
        ok: true,
        messageId: String(response.task_id),
        conversationId: to,
      };
    }

    return {
      channel: "dingtalk",
      ok: false,
      error: "No media URL provided",
    };
  },
};

export { sendDingTalkText, sendDingTalkMarkdown };
