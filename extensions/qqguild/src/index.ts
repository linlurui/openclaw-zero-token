/**
 * QQ Guild Channel Plugin Entry Point
 */

import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { qqguildPlugin } from "./plugin.js";

export { qqguildPlugin } from "./plugin.js";
export type { ResolvedQQGuildAccount, QQGuildAccountConfig, QQGuildMessage } from "./types.js";
export * from "./config.js";
export * from "./client.js";

export default qqguildPlugin;

// Plugin registration for OpenClaw plugin system
module.exports = {
  id: "qqguild",
  register(api: OpenClawPluginApi) {
    api.registerChannel({ plugin: qqguildPlugin });
  },
};
