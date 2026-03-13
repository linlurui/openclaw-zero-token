/**
 * DingTalk Channel Plugin Entry Point
 */

import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { dingtalkPlugin } from "./plugin.js";

export { dingtalkPlugin } from "./plugin.js";
export type { ResolvedDingTalkAccount, DingTalkAccountConfig } from "./types.js";
export * from "./config.js";
export * from "./client.js";

export default dingtalkPlugin;

// Plugin registration for OpenClaw plugin system
module.exports = {
  id: "dingtalk",
  register(api: OpenClawPluginApi) {
    api.registerChannel({ plugin: dingtalkPlugin });
  },
};
