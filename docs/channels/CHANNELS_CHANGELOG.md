# 渠道扩展更新日志

## 2026-03-12: 新增企业微信、钉钉、QQ频道支持

### 新增渠道

#### 1. WeCom (企业微信)

**目录**: `extensions/wecom/`

**文件**:
- `src/types.ts` - 类型定义
- `src/client.ts` - API 客户端
- `src/config.ts` - 配置适配器
- `src/outbound.ts` - 消息发送适配器
- `src/plugin.ts` - 插件定义
- `src/index.ts` - 入口文件
- `package.json` - 包配置
- `tsconfig.json` - TypeScript 配置
- `openclaw.plugin.json` - 插件清单

**支持的消息类型**:
- 文本消息
- Markdown 消息
- 图片/媒体消息
- 卡片消息

**别名**: `企业微信`, `qywx`, `work_wechat`

---

#### 2. DingTalk (钉钉)

**目录**: `extensions/dingtalk/`

**文件**:
- `src/types.ts` - 类型定义
- `src/client.ts` - API 客户端
- `src/config.ts` - 配置适配器
- `src/outbound.ts` - 消息发送适配器
- `src/plugin.ts` - 插件定义
- `src/index.ts` - 入口文件
- `package.json` - 包配置
- `tsconfig.json` - TypeScript 配置
- `openclaw.plugin.json` - 插件清单

**支持的消息类型**:
- 文本消息
- Markdown 消息
- OA 消息（钉钉卡片）
- 图片/媒体消息
- 链接消息

**别名**: `钉钉`, `dd`, `dingding`

---

#### 3. QQGuild (QQ 频道)

**目录**: `extensions/qqguild/`

**文件**:
- `src/types.ts` - 类型定义
- `src/client.ts` - API 客户端
- `src/config.ts` - 配置适配器
- `src/outbound.ts` - 消息发送适配器
- `src/plugin.ts` - 插件定义
- `src/index.ts` - 入口文件
- `package.json` - 包配置
- `tsconfig.json` - TypeScript 配置
- `openclaw.plugin.json` - 插件清单

**支持的消息类型**:
- 文本消息（自动分块，最大 2000 字符）
- Embed 消息（富文本卡片）
- Markdown 消息
- 图片/媒体消息
- 消息按钮（交互组件）

**别名**: `qq频道`, `qqguild`

**特性**:
- 支持 WebSocket 实时事件推送
- 支持私聊和频道消息
- 支持沙箱环境

---

### 修改的核心文件

#### src/channels/registry.ts

```diff
export const CHAT_CHANNEL_ORDER = [
  "telegram",
  "whatsapp",
  "discord",
  "irc",
  "googlechat",
  "slack",
  "signal",
  "imessage",
  "line",
+ "wecom",
+ "dingtalk",
+ "qqguild",
] as const;
```

新增 `CHAT_CHANNEL_META` 和 `CHAT_CHANNEL_ALIASES` 配置。

#### src/channels/dock.ts

新增 `DOCKS` 对象中的 `wecom`、`dingtalk`、`qqguild` 定义：

```typescript
wecom: {
  id: "wecom",
  capabilities: {
    chatTypes: ["direct", "group"],
    media: true,
  },
  outbound: { textChunkLimit: 4096 },
},
dingtalk: {
  id: "dingtalk",
  capabilities: {
    chatTypes: ["direct", "group"],
    media: true,
  },
  outbound: { textChunkLimit: 4096 },
},
qqguild: {
  id: "qqguild",
  capabilities: {
    chatTypes: ["direct", "group", "thread"],
    media: true,
    threads: true,
  },
  outbound: { textChunkLimit: 2000 },
},
```

---

### 文档

新增文档文件：
- `docs/channels/wecom.md` - 企业微信渠道文档
- `docs/channels/dingtalk.md` - 钉钉渠道文档
- `docs/channels/qqguild.md` - QQ 频道渠道文档

---

### 配置示例

```yaml
channels:
  wecom:
    enabled: true
    accounts:
      default:
        corpId: "your-corp-id"
        agentId: "your-agent-id"
        secret: "your-app-secret"

  dingtalk:
    enabled: true
    accounts:
      default:
        appKey: "your-app-key"
        appSecret: "your-app-secret"
        agentId: "your-agent-id"

  qqguild:
    enabled: true
    accounts:
      default:
        appId: "your-app-id"
        appSecret: "your-app-secret"
        sandbox: false
```

---

### 后续工作

- [ ] 完善消息接收 (Webhook/WebSocket)
- [ ] 添加单元测试
- [ ] 添加 onboarding 向导
- [ ] 支持 richer 消息格式（卡片、按钮等）
