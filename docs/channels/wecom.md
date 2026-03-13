# WeCom (企业微信) Channel

企业微信渠道扩展，支持通过企业微信应用发送消息。

## 配置

```yaml
channels:
  wecom:
    enabled: true
    accounts:
      default:
        # 企业 ID
        corpId: "your-corp-id"
        # 应用 AgentId
        agentId: "your-agent-id"
        # 应用 Secret
        secret: "your-app-secret"
        # 可选：消息加密 Token
        token: "your-token"
        # 可选：消息加密 EncodingAESKey
        encodingAESKey: "your-aes-key"
```

## 获取配置信息

1. 登录 [企业微信管理后台](https://work.weixin.qq.com/)
2. 在「我的企业」页面获取企业 ID (corpId)
3. 在「应用管理」创建或选择应用，获取 AgentId 和 Secret
4. 如需接收消息，设置 API 接收的 Token 和 EncodingAESKey

## 支持的消息类型

- 文本消息
- Markdown 消息
- 图片/媒体消息
- 卡片消息

## 别名

渠道支持以下别名：
- `企业微信`
- `qywx`
- `work_wechat`

## API 端点

- 获取 AccessToken: `https://qyapi.weixin.qq.com/cgi-bin/gettoken`
- 发送消息: `https://qyapi.weixin.qq.com/cgi-bin/message/send`
- 上传媒体: `https://qyapi.weixin.qq.com/cgi-bin/media/upload`
