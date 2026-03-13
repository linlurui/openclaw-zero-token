# QQ Guild (QQ 频道) Channel

QQ 频道渠道扩展，支持通过 QQ 频道机器人发送消息。

## 配置

```yaml
channels:
  qqguild:
    enabled: true
    accounts:
      default:
        # 机器人 AppID
        appId: "your-app-id"
        # 机器人 AppSecret
        appSecret: "your-app-secret"
        # 可选：使用沙箱环境
        sandbox: false
```

## 获取配置信息

1. 访问 [QQ 机器人开放平台](https://bot.q.qq.com/)
2. 创建机器人应用
3. 获取 AppID 和 AppSecret
4. 配置机器人回调地址

## 支持的消息类型

- 文本消息
- Embed 消息（富文本卡片）
- Markdown 消息
- 图片/媒体消息
- 消息按钮（交互组件）

## 别名

渠道支持以下别名：
- `qq频道`
- `qqguild`

## API 端点

### 生产环境
- Gateway: `wss://api.sgroup.qq.com/websocket`
- 发送消息: `https://api.sgroup.qq.com/channels/{channel_id}/messages`
- 发送私聊: `https://api.sgroup.qq.com/users/{user_id}/messages`

### 沙箱环境
- Gateway: `wss://sandbox.api.sgroup.qq.com/websocket`
- API: `https://sandbox.api.sgroup.qq.com/`

## 特性

- 支持 WebSocket 实时事件推送
- 支持文本消息自动分块（最大 2000 字符）
- 支持私聊和频道消息
- 支持 Intents 事件订阅

## Intents 配置

```yaml
channels:
  qqguild:
    accounts:
      default:
        appId: "xxx"
        appSecret: "xxx"
        intents:
          - GUILDS           # 频道事件
          - GUILD_MEMBERS    # 成员事件
          - GUILD_MESSAGES   # 消息事件
          - DIRECT_MESSAGE   # 私聊事件
```

## 开发调试

在开发阶段，可以启用沙箱环境：

```yaml
channels:
  qqguild:
    accounts:
      default:
        sandbox: true
```

沙箱环境消息仅对测试用户和测试频道可见。
