<p align="center">
  <img src="assets/icon.svg" width="120" alt="VoicePaste icon" />
</p>

<h1 align="center">VoicePaste</h1>

<p align="center">
  <strong>说话就能输入，粘贴即是完美 —— 适用于任何应用。</strong>
</p>

<p align="center">
  简体中文 | <a href="README.md">English</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-macOS-blue?style=flat-square" alt="macOS" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="MIT License" />
  <img src="https://img.shields.io/badge/electron-40-purple?style=flat-square" alt="Electron 40" />
</p>

---

VoicePaste 是一款**本地运行、开源**的 macOS 语音转文字工具。
按下一个键，开口说话，润色好的文字就会出现在你的光标位置 —— 在任何 App 中。无需注册账号，只需你自己的 OpenAI API Key。

> **所有数据都保存在你的电脑上。** 历史记录、词典、设置均以本地 JSON 文件存储。除了调用 OpenAI API 进行转写，不会向任何地方发送数据。

<p align="center">
  <img src="assets/screenshots/overlay.png" width="360" alt="录音中的 overlay 实时转写" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="assets/screenshots/dashboard.png" width="500" alt="VoicePaste 主界面" />
</p>

## 工作原理

```
 ┌─────────┐     ┌───────────────┐     ┌───────────┐     ┌─────────┐
 │ 🎙️ 说话  │ ──▶ │ OpenAI        │ ──▶ │ AI 润色    │ ──▶ │ 📋 粘贴  │
 │         │     │ Realtime API  │     │ (GPT)     │     │         │
 └─────────┘     └───────────────┘     └───────────┘     └─────────┘
```

1. 按下 <kbd>\`</kbd>（`Esc` 下方的反引号键）开始录音
2. 自然说话 —— 支持 **50+ 种语言**，自动识别语种
3. 再按一次 <kbd>\`</kbd> 停止
4. 语音实时转写，AI 润色后直接粘贴到光标位置

整个流程 —— 录音、转写、润色、粘贴 —— 通常在你停止说话后 **1-2 秒**内完成。

> **推荐快捷键：** 我们建议使用 <kbd>\`</kbd>（反引号，就在 <kbd>Esc</kbd> 正下方）。位置方便，几乎不会跟其他快捷键冲突。

## 快速开始

```bash
git clone https://github.com/junyuw2289-svg/voicepaste.git
cd voicepaste
npm install
npm start
```

首次启动后，进入 **Settings**，粘贴你的 [OpenAI API Key](https://platform.openai.com/api-keys)，就可以用了。

### 环境要求

- Node.js >= 18
- macOS（自动粘贴需要辅助功能权限）

## 功能

### AI 润色（默认开启）

人说话总是比较乱 —— VoicePaste 会在粘贴之前自动帮你整理。内置的润色 prompt 会：

- 删除语气词（`嗯`、`那个`、`就是说`、`uh`、`like`、`えーと`、`저기`……）
- 把多个要点自动组织成**编号列表**
- 保留多语言混合 —— 每个词保持原始语言，绝不翻译
- 语气像一条写得不错的 Slack 消息 —— 清晰、直接、不学术腔

在 **Settings** → **Output Mode** 中可以关闭润色，切换到 Fast Mode（原始转写直出）。

> **润色 prompt 完全可自定义** —— 修改 `src/main/openai-service.ts` 即可调整润色效果。

### 多语言支持

开箱即用支持 **50+ 种语言** —— 中文、英文、日文、韩文、西班牙语、法语、德语等等。自动检测语种，无需手动切换。

**自由混语：** 一句话里切换语言也没问题。说 "오늘 meeting 에서 discuss 한 내용" 或 "我们需要 update 一下" —— 每个词都保持原始语言。

### 上下文感知

VoicePaste 在录音前会捕获**当前 App 名称**、**窗口标题**和**选中的文字**。这些信息会帮助润色模型更好地理解技术术语和变量名。

### 词典 (Dictionary)

添加模型容易拼错的专有名词、术语或人名。这些词汇会被注入转写 prompt，让模型第一次就拼对。

*例如：添加 "Supabase"、"Zustand"、"Tailwind" 可避免常见的误听。*

### 历史记录 & Dashboard

每次转写都会保存为本地 JSON 文件。Dashboard 一目了然地展示你的使用统计：

| 指标 | 含义 |
|------|------|
| **Transcriptions** | 语音转文字总次数 |
| **Total dictation time** | 累计录音时长 |
| **Words dictated** | 所有转写的总字数 |

所有历史数据都存在你的电脑上 —— 可以在 App 内浏览、搜索、删除。

<p align="center">
  <img src="assets/screenshots/dashboard.png" width="600" alt="VoicePaste Dashboard 使用统计" />
</p>

### 设置

| 设置项 | 说明 |
|--------|------|
| **OpenAI API Key** | 必填。用于实时转写和 AI 润色。 |
| **Microphone** | 选择输入设备，默认使用系统默认麦克风。 |
| **Output Mode** | <kbd>Polish</kbd>（默认）— AI 润色后粘贴。<kbd>Fast</kbd> — 原始转写直出。 |

<p align="center">
  <img src="assets/screenshots/userSetting.png" width="600" alt="VoicePaste 设置页 — Output Mode 开关" />
</p>

## 效果展示：输入 → 输出

看看 VoicePaste 的 AI 润色实际效果：

---

**你说的（原始转写）：**
> 嗯那个我觉得我们现在需要update一下那个feature就是那个login的flow有点问题就是用户点了之后没反应然后然后他们就会一直点就会触发多次request

**VoicePaste 输出：**
> login 的 flow 需要 update，目前有两个问题：
> 1. 用户点击之后没有反应
> 2. 用户会反复点击，触发多次 request

---

**你说的：**
> ok so the plan is uh first we need to migrate the database then second thing is we update the API endpoints and then third we do the frontend changes and last step is we run the regression tests before we deploy

**VoicePaste 输出：**
> The plan is:
> 1. Migrate the database
> 2. Update the API endpoints
> 3. Make the frontend changes
> 4. Run regression tests before deploying

---

**你说的：**
> 我今天跟那个PM聊了一下他说这个deadline可能要往后推一周因为design那边还没finalize他们还在跟stakeholder确认一些细节但是他说overall方向没问题

**VoicePaste 输出：**
> 今天跟 PM 聊了一下，主要信息：
> 1. Deadline 可能往后推一周
> 2. Design 还没 finalize，在跟 stakeholder 确认细节
> 3. Overall 方向没问题

---

**你说的：**
> I think the better approach is to use WebSocket instead of 嗯polling because polling is gonna kill our server with that many concurrent users

**VoicePaste 输出：**
> I think the better approach is to use WebSocket instead of polling, because polling would overwhelm the server with that many concurrent users.

---

## macOS 权限

App 需要以下权限：
- **麦克风** — 录音用
- **辅助功能 (Accessibility)** — 模拟 <kbd>Cmd</kbd>+<kbd>V</kbd> 粘贴文字

在 **系统设置** → **隐私与安全性** 中授权。

## 技术栈

| 组件 | 技术 |
|------|------|
| 桌面框架 | Electron 40 |
| 构建工具 | Electron Forge + Vite |
| UI 框架 | React 19 |
| 语言 | TypeScript 5 |
| 样式 | Tailwind CSS 4 |
| 状态管理 | Zustand |
| 语音转文字 | OpenAI Realtime API |
| 文本润色 | OpenAI Chat Completions |
| 存储 | electron-store + 本地 JSON 文件 |

## 项目结构

```
src/
  main/                  # Electron 主进程
    openai-service.ts    # OpenAI API 调用（转写 + 润色 prompt）
    ipc-handlers.ts      # 录音流水线：开始 → 流式传输 → 停止 → 润色 → 粘贴
    config-store.ts      # 持久化设置（electron-store）
    realtime-session-manager.ts  # WebSocket 会话池 + 预热
  main-app/              # React UI（dashboard、历史记录、词典、设置）
  renderer/              # Overlay 窗口（录音指示器 + 实时转写）
  shared/                # 类型、常量、默认值
  preload.ts             # IPC 桥接
```

## License

MIT
