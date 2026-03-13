# DingTalk (钉钉) Channel

钉钉渠道扩展，支持通过钉钉企业应用发送消息。

## 配置

```yaml
channels:
  dingtalk:
    enabled: true
    accounts:
      default:
        # 应用 AppKey
        appKey: "your-app-key"
        # 应用 AppSecret
        appSecret: "your-app-secret"
        # 应用 AgentId
        agentId: "your-agent-id"
        # 可选：使用企业内部应用
        isEnterprise: true
```

## 获取配置信息

1. 登录 [钉钉开放平台](https://open.dingtalk.com/)
2. 创建企业内部应用或获取现有应用信息
3. 在应用详情页获取 AppKey、AppSecret 和 AgentId

## 支持的消息类型

- 文本消息
- Markdown 消息
- OA 消息（钉钉卡片）
- 图片/媒体消息
- 链接消息

## 别名

渠道支持以下别名：
- `钉钉`
- `dd`
- `dingding`

## API 端点

- 获取 AccessToken: `https://oapi.dingtalk.com/gettoken`
- 发送工作通知: `https://oapi.dingtalk.com/topapi/message/corpconversation/asyncsend_v2`
- 发送群消息: `https://api.dingtalk.com/v1.0/robot/oToMessages/batchSend`
- 上传媒体: `https://oapi.dingtalk.com/media/upload`

## 群机器人

钉钉还支持群机器人 Webhook，可以快速向群发送消息：

```yaml
channels:
  dingtalk:
    accounts:
      robot:
        webhook: "https://oapi.dingtalk.com/robot/send?access_token=xxx"
        # 可选：加签密钥
        secret: "your-secret"
```
