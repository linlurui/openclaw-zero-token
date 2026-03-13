import { scheduleGatewaySigusr1Restart } from "../../infra/restart.js";
import { ErrorCodes, errorShape } from "../protocol/index.js";
import type { GatewayRequestHandlers } from "./types.js";

/**
 * Check if the request is from a local client (localhost/127.0.0.1/::1).
 * Service control operations should only be allowed from local clients for security.
 */
function isLocalClient(clientIp: string | undefined): boolean {
  if (!clientIp) return false;
  const localAddresses = new Set([
    "127.0.0.1",
    "::1",
    "::ffff:127.0.0.1",
    "localhost",
  ]);
  // Also check for localhost variants
  return localAddresses.has(clientIp) || clientIp.startsWith("::ffff:127.");
}

export const serviceControlHandlers: GatewayRequestHandlers = {
  "gateway.restart": ({ params, respond, context, client }) => {
    // Security: Only allow service control from local clients
    if (!isLocalClient(client?.clientIp)) {
      respond(
        false,
        undefined,
        errorShape(
          ErrorCodes.FORBIDDEN,
          "Gateway restart is only allowed from localhost for security reasons",
        ),
      );
      return;
    }

    const commandsEnabled = context.deps.getConfig()?.commands?.restart !== false;
    if (!commandsEnabled) {
      respond(
        false,
        undefined,
        errorShape(ErrorCodes.FORBIDDEN, "Gateway restart is disabled in config (commands.restart=false)"),
      );
      return;
    }

    const delayMs = typeof (params as { delayMs?: unknown }).delayMs === "number"
      ? Math.max(0, Math.floor((params as { delayMs?: number }).delayMs ?? 2000))
      : 2000;
    const reason = typeof (params as { reason?: unknown }).reason === "string"
      ? (params as { reason?: string }).reason?.trim() || "ui-request"
      : "ui-request";

    const result = scheduleGatewaySigusr1Restart({
      delayMs,
      reason,
      audit: { source: "gateway.restart" },
    });

    respond(
      true,
      {
        ok: true,
        scheduled: result.ok,
        delayMs: result.delayMs,
        reason: result.reason,
        coalesced: result.coalesced,
      },
      undefined,
    );
  },

  "gateway.stop": ({ params, respond, context, client }) => {
    // Security: Only allow service control from local clients
    if (!isLocalClient(client?.clientIp)) {
      respond(
        false,
        undefined,
        errorShape(
          ErrorCodes.FORBIDDEN,
          "Gateway stop is only allowed from localhost for security reasons",
        ),
      );
      return;
    }

    const allowStop = context.deps.getConfig()?.commands?.stop !== false;
    if (!allowStop) {
      respond(
        false,
        undefined,
        errorShape(ErrorCodes.FORBIDDEN, "Gateway stop is disabled in config (commands.stop=false)"),
      );
      return;
    }

    const delayMs = typeof (params as { delayMs?: unknown }).delayMs === "number"
      ? Math.max(0, Math.floor((params as { delayMs?: number }).delayMs ?? 2000))
      : 2000;
    const reason = typeof (params as { reason?: unknown }).reason === "string"
      ? (params as { reason?: string }).reason?.trim() || "ui-request"
      : "ui-request";

    setTimeout(() => {
      context.deps.getRuntime().logGateway.info(`Gateway stopping (reason: ${reason})`);
      process.exit(0);
    }, delayMs);

    respond(
      true,
      { ok: true, delayMs, reason, message: "Gateway will stop after delay" },
      undefined,
    );
  },
};
