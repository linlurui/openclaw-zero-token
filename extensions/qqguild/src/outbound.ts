/**
 * QQ Guild Outbound Adapter - Message Sending
 */

import type { OpenClawConfig, ChannelOutboundAdapter, OutboundDeliveryResult } from "openclaw/plugin-sdk";
import type { ResolvedQQGuildAccount } from "./types.js";
import { resolveQQGuildAccount } from "./config.js";
import { sendMessage, sendDirectMessage } from "./client.js";

const QQGUILD_TEXT_LIMIT = 2000;

function chunkText(text: string, limit: number = QQGUILD_TEXT_LIMIT): string[] {
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

async function sendQQGuildText(
  cfg: OpenClawConfig,
  to: string,
  text: string,
  replyToId?: string | null,
  accountId?: string | null,
): Promise<OutboundDeliveryResult> {
  const account = resolveQQGuildAccount(cfg, accountId);

  if (!account.config.appId || !account.config.appSecret) {
    return {
      channel: "qqguild",
      ok: false,
      error: "QQ Guild account not configured",
    };
  }

  try {
    // Parse to: format is "channel:CHANNEL_ID" or "guild:GUILD_ID" (for DM)
    const [type, id] = to.includes(":") ? to.split(":") : ["channel", to];
    
    const params = {
      content: text,
      msg_id: replyToId || undefined,
    };

    let response;
    if (type === "guild" || type === "dm") {
      // Direct message
      response = await sendDirectMessage(account, id, params);
    } else {
      // Channel message
      response = await sendMessage(account, id, params);
    }

    return {
      channel: "qqguild",
      ok: true,
      messageId: response.id,
      conversationId: response.channel_id,
    };
  } catch (error) {
    return {
      channel: "qqguild",
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function sendQQGuildEmbed(
  cfg: OpenClawConfig,
  to: string,
  title: string,
  description: string,
  imageUrl?: string,
  replyToId?: string | null,
  accountId?: string | null,
): Promise<OutboundDeliveryResult> {
  const account = resolveQQGuildAccount(cfg, accountId);

  if (!account.config.appId || !account.config.appSecret) {
    return {
      channel: "qqguild",
      ok: false,
      error: "QQ Guild account not configured",
    };
  }

  try {
    const [type, id] = to.includes(":") ? to.split(":") : ["channel", to];
    
    const params = {
      embed: {
        title,
        description,
        image: imageUrl ? { url: imageUrl } : undefined,
      },
      msg_id: replyToId || undefined,
    };

    let response;
    if (type === "guild" || type === "dm") {
      response = await sendDirectMessage(account, id, params);
    } else {
      response = await sendMessage(account, id, params);
    }

    return {
      channel: "qqguild",
      ok: true,
      messageId: response.id,
      conversationId: response.channel_id,
    };
  } catch (error) {
    return {
      channel: "qqguild",
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function sendQQGuildMarkdown(
  cfg: OpenClawConfig,
  to: string,
  content: string,
  replyToId?: string | null,
  accountId?: string | null,
): Promise<OutboundDeliveryResult> {
  const account = resolveQQGuildAccount(cfg, accountId);

  if (!account.config.appId || !account.config.appSecret) {
    return {
      channel: "qqguild",
      ok: false,
      error: "QQ Guild account not configured",
    };
  }

  try {
    const [type, id] = to.includes(":") ? to.split(":") : ["channel", to];
    
    const params = {
      markdown: { content },
      msg_id: replyToId || undefined,
    };

    let response;
    if (type === "guild" || type === "dm") {
      response = await sendDirectMessage(account, id, params);
    } else {
      response = await sendMessage(account, id, params);
    }

    return {
      channel: "qqguild",
      ok: true,
      messageId: response.id,
      conversationId: response.channel_id,
    };
  } catch (error) {
    return {
      channel: "qqguild",
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export const qqguildOutbound: ChannelOutboundAdapter = {
  deliveryMode: "direct",
  textChunkLimit: QQGUILD_TEXT_LIMIT,
  chunker: chunkText,
  chunkerMode: "markdown",

  sendText: async (ctx) => {
    const { cfg, to, text, accountId, replyToId } = ctx;
    const chunks = chunkText(text);

    const results: OutboundDeliveryResult[] = [];
    for (const chunk of chunks) {
      const result = await sendQQGuildText(cfg, to, chunk, replyToId, accountId);
      results.push(result);
      if (!result.ok) {
        return result;
      }
    }

    return results[results.length - 1] || { channel: "qqguild", ok: false, error: "No message sent" };
  },

  sendMedia: async (ctx) => {
    const { cfg, to, mediaUrl, text, accountId, replyToId } = ctx;
    const account = resolveQQGuildAccount(cfg, accountId);

    if (!account.config.appId || !account.config.appSecret) {
      return {
        channel: "qqguild",
        ok: false,
        error: "QQ Guild account not configured",
      };
    }

    try {
      const [type, id] = to.includes(":") ? to.split(":") : ["channel", to];
      
      // Send as embed with image
      if (mediaUrl) {
        const params = {
          image: mediaUrl,
          content: text || undefined,
          msg_id: replyToId || undefined,
        };

        let response;
        if (type === "guild" || type === "dm") {
          response = await sendDirectMessage(account, id, params);
        } else {
          response = await sendMessage(account, id, params);
        }

        return {
          channel: "qqguild",
          ok: true,
          messageId: response.id,
          conversationId: response.channel_id,
        };
      }

      return {
        channel: "qqguild",
        ok: false,
        error: "No media URL provided",
      };
    } catch (error) {
      return {
        channel: "qqguild",
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
};

export { sendQQGuildText, sendQQGuildEmbed, sendQQGuildMarkdown };
