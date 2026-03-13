/**
 * WeCom Outbound Adapter - Message Sending
 */

import type { OpenClawConfig, ChannelOutboundAdapter, OutboundDeliveryResult } from "openclaw/plugin-sdk";
import type { ResolvedWeComAccount } from "./types.js";
import { resolveWeComAccount } from "./config.js";
import { sendMessage } from "./client.js";

const WECOM_TEXT_LIMIT = 2048;

function chunkText(text: string, limit: number = WECOM_TEXT_LIMIT): string[] {
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

async function sendWeComText(
  cfg: OpenClawConfig,
  to: string,
  text: string,
  accountId?: string | null,
): Promise<OutboundDeliveryResult> {
  const account = resolveWeComAccount(cfg, accountId);

  if (!account.config.corpId || !account.config.secret) {
    return {
      channel: "wecom",
      ok: false,
      error: "WeCom account not configured",
    };
  }

  try {
    const response = await sendMessage(account, {
      msgtype: "text",
      touser: to,
      text: { content: text },
    });

    if (response.errcode !== 0) {
      return {
        channel: "wecom",
        ok: false,
        error: response.errmsg,
      };
    }

    return {
      channel: "wecom",
      ok: true,
      messageId: response.msgid,
      conversationId: to,
    };
  } catch (error) {
    return {
      channel: "wecom",
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function sendWeComMarkdown(
  cfg: OpenClawConfig,
  to: string,
  text: string,
  accountId?: string | null,
): Promise<OutboundDeliveryResult> {
  const account = resolveWeComAccount(cfg, accountId);

  if (!account.config.corpId || !account.config.secret) {
    return {
      channel: "wecom",
      ok: false,
      error: "WeCom account not configured",
    };
  }

  try {
    const response = await sendMessage(account, {
      msgtype: "markdown",
      touser: to,
      markdown: { content: text },
    });

    if (response.errcode !== 0) {
      return {
        channel: "wecom",
        ok: false,
        error: response.errmsg,
      };
    }

    return {
      channel: "wecom",
      ok: true,
      messageId: response.msgid,
      conversationId: to,
    };
  } catch (error) {
    return {
      channel: "wecom",
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export const wecomOutbound: ChannelOutboundAdapter = {
  deliveryMode: "direct",
  textChunkLimit: WECOM_TEXT_LIMIT,
  chunker: chunkText,
  chunkerMode: "text",

  sendText: async (ctx) => {
    const { cfg, to, text, accountId } = ctx;
    const chunks = chunkText(text);

    const results: OutboundDeliveryResult[] = [];
    for (const chunk of chunks) {
      const result = await sendWeComText(cfg, to, chunk, accountId);
      results.push(result);
      if (!result.ok) {
        return result;
      }
    }

    return results[results.length - 1] || { channel: "wecom", ok: false, error: "No message sent" };
  },

  sendMedia: async (ctx) => {
    const { cfg, to, mediaUrl, text, accountId } = ctx;
    const account = resolveWeComAccount(cfg, accountId);

    if (!account.config.corpId || !account.config.secret) {
      return {
        channel: "wecom",
        ok: false,
        error: "WeCom account not configured",
      };
    }

    // For now, send media URL as text card
    // TODO: Implement actual media upload
    if (mediaUrl) {
      const response = await sendMessage(account, {
        msgtype: "textcard",
        touser: to,
        textcard: {
          title: text || "Media",
          description: text || "Click to view media",
          url: mediaUrl,
        },
      });

      if (response.errcode !== 0) {
        return {
          channel: "wecom",
          ok: false,
          error: response.errmsg,
        };
      }

      return {
        channel: "wecom",
        ok: true,
        messageId: response.msgid,
        conversationId: to,
      };
    }

    return {
      channel: "wecom",
      ok: false,
      error: "No media URL provided",
    };
  },
};

export { sendWeComText, sendWeComMarkdown };
