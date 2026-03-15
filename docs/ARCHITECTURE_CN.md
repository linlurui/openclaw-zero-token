# OpenClaw 架构说明

## 整体架构

OpenClaw 采用 **Gateway-Node** 架构：

```
┌────────────────────────────────────────────────────────────────────┐
│                         Gateway (服务端)                           │
│                                                                    │
│  • 运行在服务器或电脑上 (Node.js)                                   │
│  • 核心 HTTP/WebSocket 服务 (默认端口 3001)                         │
│  • AI Agent 逻辑处理                                               │
│  • 管理所有 LLM providers (Claude/DeepSeek/GPT 等)                 │
│  • 协调多个 Node 连接                                              │
└───────────────────────────┬────────────────────────────────────────┘
                            │ WebSocket
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
     ┌──────────┐    ┌──────────┐    ┌──────────┐
     │ macOS    │    │ iOS      │    │ Android  │
     │ Node     │    │ Node     │    │ Node     │
     │ (客户端) │    │ (客户端) │    │ (客户端) │
     └──────────┘    └──────────┘    └──────────┘
```

## 核心组件

### Gateway（服务端）

Gateway 是整个系统的核心，负责：

- **HTTP 服务** - 提供 Web UI、REST API 接口
- **WebSocket 服务** - 与 Node 保持长连接，实时通信
- **AI 对话处理** - 与各 LLM provider 交互，处理对话请求
- **任务编排** - 向 Node 发送命令（拍照、录屏、通知等）
- **认证管理** - 管理各平台的登录凭证
- **Provider 管理** - 支持多种 LLM 平台

**启动方式：**
```bash
./server.sh start
```

**主要代码位置：**
- `src/gateway/` - Gateway 核心逻辑
- `src/gateway/server.ts` - 服务入口
- `src/gateway/server-http.ts` - HTTP 服务
- `src/gateway/server-methods/` - RPC 方法实现

### Node（客户端）

Node 是受控端，连接到 Gateway 并执行命令。支持以下平台：

| 平台 | 目录 | 技术栈 |
|------|------|--------|
| Android | `apps/android/` | Kotlin + Jetpack Compose |
| iOS | `apps/ios/` | Swift + SwiftUI |
| macOS | `apps/macos/` | Swift + SwiftUI |
| 共享代码 | `apps/shared/` | Swift (OpenClawKit) |

**Node 能力：**

| 能力 | 说明 |
|------|------|
| Canvas/A2UI | 在 WebView 中渲染交互式 UI |
| Camera | 拍照、录像 |
| Screen | 屏幕相关操作 |
| Notifications | 通知处理 |
| Voice | 语音功能 |
| Location | 位置信息 |

---

## 各端详细功能

### Gateway（服务端）详细功能

#### 核心服务
| 功能 | 说明 |
|------|------|
| HTTP API | REST API 接口，提供 Web UI 和程序化访问 |
| WebSocket | 与 Node 保持长连接，实时双向通信 |
| AI 对话 | 与各 LLM Provider 交互，处理对话请求 |
| 任务编排 | 向 Node 发送命令，协调多设备执行 |
| 认证管理 | 管理各平台的登录凭证和会话 |

#### Web UI 功能
| 功能 | 说明 |
|------|------|
| 模型选择 | 选择和配置 LLM 模型 |
| 会话管理 | 管理对话会话历史 |
| 节点管理 | 查看和管理连接的 Node |
| 通道配置 | 配置 Slack/Telegram 等消息通道 |
| 定时任务 | Cron 任务管理 |
| 系统设置 | Gateway 配置管理 |

#### 消息通道扩展
| 通道 | 说明 |
|------|------|
| Slack | Slack Bot 集成 |
| Telegram | Telegram Bot 集成 |
| Discord | Discord Bot 集成 |
| 企业微信 | 企业微信应用集成 |
| 钉钉 | 钉钉机器人集成 |
| 飞书 | 飞书机器人集成 |
| WhatsApp | WhatsApp 集成 |
| Signal | Signal 集成 |
| Matrix | Matrix 集成 |
| IRC | IRC 集成 |

**代码位置：** `src/gateway/`

---

### macOS 客户端详细功能

macOS 客户端是一个功能完整的原生应用，既有 GUI 界面，也可作为 Node 运行。

#### 系统集成
| 功能 | 说明 |
|------|------|
| 菜单栏图标 | 状态栏显示连接状态，快速操作菜单 |
| Dock 图标 | 可选的 Dock 图标显示 |
| 系统通知 | macOS 原生通知支持 |
| 权限管理 | 相机/麦克风/屏幕录制权限管理 |

#### Canvas / 屏幕
| 功能 | 说明 |
|------|------|
| Canvas 窗口 | WebView 渲染 A2UI 交互界面 |
| 屏幕录制 | 录制屏幕内容 |
| 相机采集 | 摄像头拍照和录像 |

#### 语音功能
| 功能 | 说明 |
|------|------|
| 语音唤醒 | "Hey OpenClaw" 语音唤醒 |
| 语音对话 | Push-to-Talk 和语音对话模式 |
| 麦克风监控 | 实时麦克风音量显示 |

#### 连接与发现
| 功能 | 说明 |
|------|------|
| Gateway 发现 | 自动发现局域网内的 Gateway |
| 远程隧道 | 通过隧道连接远程 Gateway |
| Tailscale 集成 | Tailscale VPN 支持 |
| 设备配对 | 二维码/配对码配对 |

#### 设置界面
| 功能 | 说明 |
|------|------|
| 通用设置 | 基本配置、外观设置 |
| 配置管理 | 配置文件编辑和管理 |
| 通道配置 | Slack/Telegram 等通道配置界面 |
| 定时任务 | Cron 任务编辑器 |
| 会话管理 | 查看和管理对话会话 |
| 技能管理 | 安装和管理技能 |
| 执行审批 | 命令执行审批界面 |

#### Node 模式
| 功能 | 说明 |
|------|------|
| Node 服务 | 作为受控节点连接 Gateway |
| 命令执行 | 执行 Gateway 发来的命令 |
| 能力上报 | 上报设备能力给 Gateway |

**代码位置：** `apps/macos/Sources/OpenClaw/`

---

### iOS 客户端详细功能

iOS 客户端是一个功能丰富的移动端应用。

#### 核心功能模块
| 模块 | 说明 |
|------|------|
| Camera | 相机拍照和录像 |
| Screen | 屏幕操作和截图 |
| Voice | 语音对话和唤醒 |
| Location | 位置信息获取 |
| Media | 媒体文件管理 |
| Motion | 设备运动传感器 |

#### 系统集成
| 功能 | 说明 |
|------|------|
| 日历集成 | 读取和写入系统日历 |
| 提醒事项 | 系统提醒事项集成 |
| 通讯录 | 联系人访问 |
| 实时活动 | Lock Screen 实时活动 |

#### 界面
| 功能 | 说明 |
|------|------|
| 主标签页 | Chat / Screen / Voice 标签页 |
| Canvas | A2UI 交互界面 |
| 设置 | 各种配置界面 |
| 引导流程 | 新用户配对向导 |

#### Node 能力
| 能力 | 说明 |
|------|------|
| Canvas/A2UI | 在 WebView 中渲染交互式 UI |
| Camera | 前后摄像头拍照、录像 |
| Screen | 屏幕操作（受限） |
| Notifications | 推送通知处理 |
| Voice | 语音输入和播放 |
| Location | GPS 位置信息 |

**代码位置：** `apps/ios/Sources/`

---

### Android 客户端详细功能

Android 客户端使用 Kotlin 和 Jetpack Compose 构建。

#### 核心功能模块
| 模块 | 说明 |
|------|------|
| Chat | 对话界面 |
| Voice | 语音对话和唤醒 |
| Node | Node 服务和命令执行 |

#### 系统集成
| 功能 | 说明 |
|------|------|
| 前台服务 | Node 运行的后台服务 |
| 通知 | 推送通知处理 |
| 权限管理 | 运行时权限请求 |

#### 界面
| 功能 | 说明 |
|------|------|
| 主标签页 | Chat / Screen / Voice 标签页 |
| Canvas | A2UI 交互界面 |
| 设置 | 各种配置界面 |
| 引导流程 | 新用户配对向导 |

#### Node 能力
| 能力 | 说明 |
|------|------|
| Canvas/A2UI | 在 WebView 中渲染交互式 UI |
| Camera | 前后摄像头拍照、录像 |
| Screen | 屏幕操作 |
| Notifications | 通知监听和处理 |
| Voice | 语音输入和播放 |
| Location | GPS 位置信息 |

**代码位置：** `apps/android/app/src/main/java/ai/openclaw/app/`

---

## 功能对比矩阵

| 功能 | Gateway | macOS | iOS | Android |
|------|:-------:|:-----:|:---:|:-------:|
| AI 对话 | ✅ | ✅ | ✅ | ✅ |
| 文件操作 | ✅ | ✅ | ❌ | ❌ |
| 执行命令 | ✅ | ✅ | ❌ | ❌ |
| 相机 | ❌ | ✅ | ✅ | ✅ |
| 屏幕录制 | ❌ | ✅ | ⚠️ | ✅ |
| 语音唤醒 | ❌ | ✅ | ✅ | ✅ |
| 位置信息 | ❌ | ❌ | ✅ | ✅ |
| 通知处理 | ❌ | ✅ | ✅ | ✅ |
| 日历/提醒 | ❌ | ⚠️ | ✅ | ⚠️ |
| 消息通道 | ✅ | ❌ | ❌ | ❌ |
| A2UI Canvas | 提供 | ✅ | ✅ | ✅ |

> ✅ 完整支持 | ⚠️ 部分支持 | ❌ 不支持

---

## 主要代码位置

- **Gateway**: `src/gateway/`
- **macOS 客户端**: `apps/macos/Sources/OpenClaw/`
- **iOS 客户端**: `apps/ios/Sources/`
- **Android 客户端**: `apps/android/app/src/main/java/ai/openclaw/app/`
- **共享代码**: `apps/shared/OpenClawKit/`

## 目录结构

```
openclaw-zero-token/
├── src/                    # 核心 TypeScript 代码
│   ├── gateway/            # Gateway 服务端逻辑
│   ├── canvas-host/        # Canvas/A2UI 宿主
│   ├── cli/                # CLI 工具
│   ├── agents/             # Agent 相关
│   └── providers/          # LLM Provider 实现
│
├── apps/                   # 原生客户端应用
│   ├── android/            # Android 客户端
│   ├── ios/                # iOS 客户端
│   ├── macos/              # macOS 客户端
│   └── shared/             # 共享 Swift 代码
│
├── extensions/             # 消息通道扩展
│   ├── slack/              # Slack 集成
│   ├── telegram/           # Telegram 集成
│   ├── discord/            # Discord 集成
│   ├── wecom/              # 企业微信集成
│   ├── dingtalk/           # 钉钉集成
│   ├── feishu/             # 飞书集成
│   └── ...                 # 其他平台
│
├── vendor/                 # 外部依赖
│   └── a2ui/               # A2UI 渲染器 (git 忽略)
│
├── scripts/                # 构建和工具脚本
├── docs/                   # 文档
├── test/                   # 测试文件
└── ui/                     # Web UI 资源
```

## A2UI (Actionable UI)

### 什么是 A2UI？

A2UI 是一个用于在 Canvas WebView 中渲染交互式 UI 的框架。它让 AI Agent 可以在移动端设备上显示交互式界面（按钮、卡片、表单等），并处理用户的点击交互。

### vendor/a2ui 目录

`vendor/a2ui` 存放 A2UI 的外部依赖：

- `vendor/a2ui/renderers/lit` - 基于 Lit (Web Components) 的 UI 渲染实现

该目录被 `.gitignore` 忽略，因为是外部依赖，需要单独获取。

### 构建流程

```
vendor/a2ui/renderers/lit  +  apps/shared/OpenClawKit/Tools/CanvasA2UI
        ↓
  打包成 a2ui.bundle.js
        ↓
  部署到 src/canvas-host/a2ui/
        ↓
  Gateway 通过 HTTP 提供给 Node 的 Canvas WebView
```

**构建命令：**
```bash
pnpm canvas:a2ui:bundle
```

### 运行时交互

```
Gateway                          Node (Android/iOS/macOS)
   │                                    │
   │  canvas.a2ui.push (JSONL)         │
   │ ─────────────────────────────────► │
   │                                    │  渲染 UI 组件
   │                                    │  用户点击按钮
   │  a2uiaction event                 │
   │ ◄───────────────────────────────── │
   │                                    │
   │  AI Agent 处理用户操作             │
   │                                    │
```

## 启动流程

### 1. 环境准备

```bash
# 启动 Chrome 调试模式（用于登录各平台）
./start-chrome-debug.sh

# 运行认证流程（捕获登录凭证）
./onboard.sh
```

### 2. 启动 Gateway

```bash
./server.sh start
```

### 3. 连接 Node

- **macOS**: 运行 `scripts/restart-mac.sh` 或打开 OpenClaw.app
- **iOS/Android**: 打开 App，扫描二维码或输入连接码

## 消息通道 (Extensions)

OpenClaw 支持多种消息平台作为 AI Agent 的交互入口：

| 平台 | 目录 | 说明 |
|------|------|------|
| Slack | `extensions/slack/` | Slack Bot |
| Telegram | `extensions/telegram/` | Telegram Bot |
| Discord | `extensions/discord/` | Discord Bot |
| 企业微信 | `extensions/wecom/` | 企业微信应用 |
| 钉钉 | `extensions/dingtalk/` | 钉钉机器人 |
| 飞书 | `extensions/feishu/` | 飞书机器人 |
| WhatsApp | `extensions/whatsapp/` | WhatsApp |
| Signal | `extensions/signal/` | Signal |
| Matrix | `extensions/matrix/` | Matrix |
| IRC | `extensions/irc/` | IRC |

## 认证系统

### 凭证存储位置

```
.openclaw-state/
├── openclaw.json              # 主配置文件
└── agents/main/agent/
    ├── auth-profiles.json     # 各平台认证信息
    └── models.json            # 模型配置
```

### 支持的平台

- Claude Web (`claude-web`)
- DeepSeek Web (`deepseek-web`)
- ChatGPT Web (`chatgpt-web`)
- 豆包 Web (`doubao-web`)
- 通义千问 Web (`qwen-web`)
- Kimi Web (`kimi-web`)
- Gemini Web (`gemini-web`)
- Grok Web (`grok-web`)
- 智谱 GLM Web (`glm-web`)

## 技术栈

| 组件 | 技术 |
|------|------|
| Gateway | TypeScript, Node.js |
| Web UI | HTML/CSS/JS |
| Android | Kotlin, Jetpack Compose, WebView |
| iOS | Swift, SwiftUI, WKWebView |
| macOS | Swift, SwiftUI, WKWebView |
| A2UI | Lit (Web Components) |
| 构建工具 | pnpm, tsdown, rolldown |

## 相关文档

- [README.md](../README.md) - 项目主文档
- [INSTALLATION.md](../INSTALLATION.md) - 安装指南
- [START_HERE.md](../START_HERE.md) - 快速开始
- [ARCHITECTURE.md](../ARCHITECTURE.md) - 详细架构流程图
