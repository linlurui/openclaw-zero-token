/**
 * WeCom Channel Plugin Entry Point
 */

import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { wecomPlugin } from "./plugin.js";

export { wecomPlugin } from "./plugin.js";
export type { ResolvedWeComAccount, WeComAccountConfig } from "./types.js";
export * from "./config.js";
export * from "./client.js";

export default wecomPlugin;

// Plugin registration for OpenClaw plugin system
module.exports = {
  id: "wecom",
  register(api: OpenClawPluginApi) {
    api.registerChannel({ plugin: wecomPlugin });
  },
};
