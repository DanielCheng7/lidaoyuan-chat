# 郦道元 AI 对话网站 — 架构设计文档

## 1. 技术选型与依赖

### 运行时

| 层 | 选型 | 版本 | 理由 |
|----|------|------|------|
| 框架 | Next.js (App Router) | 14+ | 前后端一体，API Route 做 AI proxy |
| 语言 | TypeScript | 5.x | 类型安全 |
| 样式 | Tailwind CSS | 3.x | 原子化，快速出古风设计 |
| AI SDK | Vercel AI SDK (`ai` + `@ai-sdk/openai`) | latest | 流式输出 useChat hook 开箱即用 |
| AI 供应商 | DeepSeek | deepseek-chat | OpenAI 兼容 API，¥2/百万 tokens |

### 开发依赖

| 包 | 用途 |
|----|------|
| `ai` | `streamText()` + `useChat()` |
| `@ai-sdk/openai` | `createOpenAI()` 对接 DeepSeek |
| `react-markdown` | 渲染 AI 回复中的 Markdown |
| `remark-gfm` | 支持表格、删除线等 GFM 扩展 |

### 不引入的依赖（MVP 阶段）

| 不引入 | 原因 |
|--------|------|
| 数据库（Supabase/Prisma） | 会话存 localStorage 足够 |
| 认证（NextAuth/Clerk） | 个人项目，无需登录 |
| Redis/向量库 | RAG 为后续迭代 |
| shadcn/ui | 古风 UI 需完全自定义，组件库反而碍事 |

---

## 2. 目录结构

```
site/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # 根布局（字体、背景、metadata）
│   │   ├── page.tsx                # 首页 = 聊天页（单页应用）
│   │   ├── globals.css             # Tailwind + CSS 变量 + 自定义主题
│   │   └── api/
│   │       └── chat/
│   │           └── route.ts        # POST /api/chat（流式 SSE）
│   ├── components/
│   │   ├── ChatContainer.tsx       # 顶层容器（状态管理 + 布局）
│   │   ├── MessageList.tsx         # 消息列表（滚动 + 自动滚底）
│   │   ├── MessageBubble.tsx       # 单条消息气泡
│   │   ├── MessageInput.tsx        # 输入框 + 发送按钮
│   │   ├── WelcomeScreen.tsx       # 空状态首屏
│   │   ├── MarkdownContent.tsx     # Markdown 渲染器
│   │   ├── ErrorBar.tsx            # 错误提示条
│   │   └── Header.tsx              # 顶部导航
│   ├── lib/
│   │   ├── constants.ts            # 示例问题 / 文案 / 配置
│   │   ├── storage.ts              # localStorage 读写封装
│   │   └── types.ts                # 共享类型定义
│   └── hooks/
│       └── useAutoScroll.ts        # 自动滚底 hook（用户上滚时暂停）
├── public/
│   └── fonts/                      # 思源宋体 woff2 子集
├── system-prompt.txt               # 郦道元 Persona（复制自 Phase 1）
├── .env.local                      # DEEPSEEK_API_KEY=sk-xxx
├── .env.example                    # 脱敏版环境变量模板
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 3. 路由设计

| 路由 | 页面 | 说明 |
|------|------|------|
| `GET /` | 聊天主页 | 单页应用，首次访问显示 WelcomeScreen，有消息后显示对话 |
| `POST /api/chat` | AI API | 接收 `{ messages }` → 流式返回 SSE |
| `GET /about` | （可选）关于 | 静态介绍郦道元和《水经注》 |

MVP 只做首页 + API。`/about` 可在后续迭代加。

---

## 4. 数据流

```
用户输入文字
     │
     ▼
MessageInput ──► ChatContainer.handleSubmit()
     │               │
     │               ├─ 1. 构造 userMessage 追加到 messages[]
     │               ├─ 2. setMessages([...prev, userMessage])
     │               ├─ 3. 调用 useChat 的 append/handleSubmit
     │               │
     ▼               ▼
fetch POST /api/chat ──► { messages: [{role, content}...] }
     │
     ▼
api/chat/route.ts
     │
     ├─ 1. 解析 messages
     ├─ 2. 拼接 system prompt（从 system-prompt.txt 读取）
     ├─ 3. 调用 deepseek("deepseek-chat") via streamText()
     ├─ 4. 返回 DataStreamResponse（SSE 流）
     │
     ▼
ChatContainer 收到流式 chunk
     │
     ├─ useChat 自动更新 messages[]（Assistant 消息逐字追加）
     │
     ▼
MessageList 重渲染 ──► MessageBubble × N ──► MarkdownContent
```

---

## 5. 组件详细设计

### 5.1 ChatContainer（顶层状态容器）

```
┌────────────────────────────────────────┐
│  Header                                 │
├────────────────────────────────────────┤
│                                         │
│  {messages.length === 0                 │
│    ? <WelcomeScreen />                  │
│    : <MessageList messages={messages}/> │
│  }                                      │
│                                         │
├────────────────────────────────────────┤
│  {error && <ErrorBar message={error}/>}│
│  <MessageInput                          │
│    onSend={handleSubmit}                │
│    disabled={isLoading}                 │
│  />                                     │
└────────────────────────────────────────┘
```

**状态**：
- `messages` — 来自 `useChat()` hook
- `isLoading` — 正在等待 AI 回复
- `error` — API 调用错误

**初始化**：
- 页面加载时从 localStorage 恢复 messages
- 如果无历史消息，显示 WelcomeScreen

**关键行为**：
- 发送消息 → 滚动到底部
- 流式接收 → 逐字显示，自动滚底
- 用户手动上滚 → 暂停自动滚底（直到用户滚回底部或发新消息）
- 错误 → 显示 ErrorBar，不丢失已输入文字

### 5.2 WelcomeScreen（空状态首屏）

```
┌────────────────────────────────────────┐
│                                         │
│         郦 道 元                        │
│    北魏地理学家 · 水经注作者             │
│                                         │
│   [一段100字简介]                        │
│                                         │
│   ┌─────────────────────────┐          │
│   │  💬 示例问题              │          │
│   │  ┌─────────────────────┐ │          │
│   │  │ 《水经注》和《水经》  │ │          │
│   │  │ 是什么关系？         │ │          │
│   │  └─────────────────────┘ │          │
│   │  ┌─────────────────────┐ │          │
│   │  │ 三峡这段为什么写得   │ │          │
│   │  │ 这么详细？           │ │          │
│   │  └─────────────────────┘ │          │
│   │  ┌─────────────────────┐ │          │
│   │  │ 你当年是怎么考察      │ │          │
│   │  │ 这些水道的？         │ │          │
│   │  └─────────────────────┘ │          │
│   │  ...                     │          │
│   └─────────────────────────┘          │
│                                         │
│      "向郦道元请教中国古代地理"          │
│                                         │
└────────────────────────────────────────┘
```

**交互**：
- 点击示例问题 → 自动作为首条消息发送
- 也可以在底部输入框自由提问

### 5.3 MessageList（消息列表）

```
┌────────────────────────────────────────┐
│  [user] 《水经注》是怎么写的？           │  ← MessageBubble (user)
│                                         │
│  [ai] 余少时随父居青州，即好访...       │  ← MessageBubble (ai)
│       ...水之性也。                     │     with MarkdownContent
│                                         │
│  [user] 你去过哪些地方考察？              │
│                                         │
│  [ai] 余足迹所及，北至阴山...            │  ← 流式渲染中
│       ...▌                              │     (光标闪烁)
│                                         │
│  （自动滚到底部）                        │
└────────────────────────────────────────┘
```

**关键行为**：
- `useAutoScroll` hook：每当 messages 变化 → 滚到底部
- 用户手动向上滚动超过 150px → 暂停自动滚动，右下角出现"↓ 回到底部"浮动按钮
- 用户点击"回到底部"或发送新消息 → 恢复自动滚动
- 所有消息渲染完成后触发滚动

### 5.4 MessageBubble（消息气泡）

**用户气泡**（右对齐）：
```
                                    ┌──────────────────┐
                                    │ 用户消息文字      │
                                    └──────────────────┘
```
- 背景：`#4a3728`（古铜褐）
- 文字：`#ffffff`
- 圆角：左上/左下大圆角，右上直角

**AI 气泡**（左对齐）：
```
┌──────────────────────────┐
│ 郦道元的回复文字          │
│ ...                       │
└──────────────────────────┘
```
- 背景：`#f5f0e8`（宣纸色），左侧有一道 3px 竖线（`#8b4513` 赭石色）
- 文字：`#2c2416`（墨色）
- 圆角：右上/右下大圆角，左上直角
- 左侧竖线为视觉标记，模拟古籍的引文竖线

**加载状态**（AI 回复进行中）：
```
┌──────────────────────────┐
│ 文字内容......▌           │  ← 闪烁光标
└──────────────────────────┘
```

### 5.5 MarkdownContent（Markdown 渲染器）

基于 `react-markdown` + `remark-gfm`，自定义组件覆盖：

| Markdown 元素 | 渲染样式 |
|---------------|---------|
| `**粗体**` | `font-bold text-ink` |
| `> 引用` | 左侧竖线 + 缩进 + 略小字号 + italic |
| `` `代码` `` | 古风背景等宽字体 |
| 无序列表 | 自定义圆点（中文顿号风格） |
| 有序列表 | 中文数字序号 |
| 表格 | 边框为竹简色，斑马纹 |
| `---` 分割线 | 水墨风格细线 |
| 链接 | 赭石色下划线 |

### 5.6 MessageInput（输入区）

```
┌────────────────────────────────────────┐
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 输入你的问题...                     │ │
│  │                                    │ │
│  │                                    │ │
│  └───────────────────────────────────┘ │
│                               [发送 →] │
│                                         │
│  Enter 发送 · Shift+Enter 换行           │
└────────────────────────────────────────┘
```

**行为**：
- 多行 textarea，自适应高度（最小 1 行，最大 6 行）
- Enter 发送，Shift+Enter 换行
- 发送按钮：加载中时变为转圈图标，不可点击
- 空内容不能发送（按钮置灰）
- 发送后自动清空，焦点保持

### 5.7 ErrorBar（错误提示）

```
┌────────────────────────────────────────┐
│  ⚠ 请求失败，请检查网络后重试    [重试] │
└────────────────────────────────────────┘
```
- 出现在输入框上方
- 5 秒后自动消失
- "重试"按钮 → 重新发送上一条消息

### 5.8 Header（顶部导航）

```
┌────────────────────────────────────────┐
│  ≡ 郦道元                  [新对话] [ℹ] │
└────────────────────────────────────────┘
```
- ≡ 无实际功能（留作后续扩展）
- 标题"郦道元"：思源宋体，显著
- [新对话]：清空当前消息，显示 WelcomeScreen
- [ℹ]：关于页入口（可选）

---

## 6. API Route 设计

### POST /api/chat

**请求**：
```typescript
interface ChatRequest {
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}
```

**后端逻辑**（`src/app/api/chat/route.ts`）：

```typescript
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { readFileSync } from "fs";
import { join } from "path";

const deepseek = createOpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY!,
});

// 启动时缓存 system prompt
const SYSTEM_PROMPT = readFileSync(
  join(process.cwd(), "system-prompt.txt"),
  "utf-8"
);

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: deepseek("deepseek-chat"),
    system: SYSTEM_PROMPT,
    messages,
    temperature: 0.7,        // 有一定创造性但不过度发散
    maxTokens: 800,           // 控制回复长度（郦道元风格：简洁）
  });

  return result.toDataStreamResponse();
}
```

**DeepSeek API 关键参数**：
- `model`: `deepseek-chat`（通用对话模型）
- `temperature`: 0.7 — 需要一定文采但不能跑偏
- `max_tokens`: 800 — 郦道元风格简洁，不需要超长回复
- DeepSeek 上下文窗口：64K tokens，远超需要

### 错误处理

```typescript
// API route 中的 try/catch
try {
  // ... streamText ...
} catch (error) {
  if (error.message?.includes("Insufficient Balance")) {
    return Response.json(
      { error: "DeepSeek 账户余额不足" },
      { status: 402 }
    );
  }
  if (error.message?.includes("rate_limit")) {
    return Response.json(
      { error: "请求过于频繁，请稍后再试" },
      { status: 429 }
    );
  }
  return Response.json(
    { error: "AI 服务暂时不可用" },
    { status: 500 }
  );
}
```

---

## 7. 状态管理

### 7.1 聊天状态（useChat hook 内置）

| 状态 | 来源 | 用途 |
|------|------|------|
| `messages` | `useChat()` | 消息列表 |
| `input` | `useChat()` | 输入框受控值 |
| `handleInputChange` | `useChat()` | 输入框 onChange |
| `handleSubmit` | `useChat()` | 表单提交 |
| `isLoading` | `useChat()` | 加载中 |
| `error` | `useChat()` | 错误信息 |
| `setMessages` | `useChat()` | 恢复/清空消息 |

### 7.2 本地持久化

```typescript
// lib/storage.ts
const STORAGE_KEY = "lidaoyuan-chat-messages";

export function saveMessages(messages: Message[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

export function loadMessages(): Message[] | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function clearMessages() {
  localStorage.removeItem(STORAGE_KEY);
}
```

**保存时机**：每次 `messages` 变化时用 `useEffect` 自动存（debounce 500ms）

### 7.3 组件间数据流

```
ChatContainer (持有 useChat)
  │
  ├─► Header
  │     props: onNewChat, onAbout
  │
  ├─► WelcomeScreen (messages.length === 0)
  │     props: onExampleClick(question: string)
  │
  ├─► MessageList (messages.length > 0)
  │     props: messages, isLoading
  │     │
  │     └─► MessageBubble × N
  │           props: message, isStreaming
  │           │
  │           └─► MarkdownContent
  │                 props: content
  │
  ├─► ErrorBar (error !== undefined)
  │     props: message, onRetry, onDismiss
  │
  └─► MessageInput
        props: input, onChange, onSubmit, disabled
```

---

## 8. 设计系统

### 8.1 颜色令牌

```css
:root {
  --color-ink:        #2c2416;  /* 墨色 — 主文字 */
  --color-paper:      #f5f0e8;  /* 宣纸 — 背景 */
  --color-paper-dark: #ebe3d5;  /* 旧纸 — AI 气泡背景 */
  --color-bronze:     #4a3728;  /* 古铜褐 — 用户气泡/按钮 */
  --color-ochre:      #8b4513;  /* 赭石 — 强调/链接/装饰线 */
  --color-bamboo:     #d4c5a9;  /* 竹简 — 边框/分割线 */
  --color-moss:       #5d7a4a;  /* 苔绿 — 辅助色 */
  --color-error:      #c04040;  /* 朱砂 — 错误 */
}
```

### 8.2 排版

```css
:root {
  --font-serif:   "Noto Serif SC", "Source Han Serif SC", serif;
  --font-sans:    system-ui, -apple-system, sans-serif;
  --font-mono:    "JetBrains Mono", "Fira Code", monospace;

  --text-xs:   0.75rem;
  --text-sm:   0.875rem;
  --text-base: 1rem;
  --text-lg:   1.125rem;
  --text-xl:   1.5rem;
  --text-2xl:  2rem;
  --text-hero: 3rem;
}
```

- 标题用思源宋体（`font-serif`）
- 正文用系统字体（`font-sans`），保证移动端可读
- 代码块用等宽字体

### 8.3 间距

```css
--space-xs: 0.25rem;
--space-sm: 0.5rem;
--space-md: 1rem;
--space-lg: 1.5rem;
--space-xl: 2rem;
--space-section: 4rem;
```

### 8.4 圆角

- 气泡：`12px`（左上/左下或右上/右下直角）
- 按钮：`8px`
- 输入框：`12px`
- 卡片：`8px`

### 8.5 阴影

- 浅阴影：`0 1px 3px rgba(44,36,22,0.08)` — 气泡悬浮感
- 深阴影：`0 4px 12px rgba(44,36,22,0.12)` — 按钮 hover 时

### 8.6 过渡

- 所有交互：`150ms ease-out`
- 气泡出现：轻微上浮 + 淡入
- 错误条：从顶部滑入

---

## 9. 交互细节

### 9.1 键盘快捷键

| 快捷键 | 行为 |
|--------|------|
| Enter | 发送消息 |
| Shift+Enter | 换行 |
| Escape | 清除输入框 |
| Ctrl+Enter | （未来）新对话 |

### 9.2 自动滚动行为

```
用户在上次自动滚底后：
  ├─ 新消息到达 → 自动滚到底部
  ├─ 用户向上滚 >150px → 暂停自动滚动
  │   └─ 右下角出现浮动按钮 "↓"
  ├─ 用户滚回底部（距底 <50px）→ 恢复自动滚动
  └─ 用户点浮动按钮 → 立即滚到底部，恢复自动滚动
```

### 9.3 加载状态

- 发送按钮 → 圆形 spinner
- AI 消息气泡 → 末尾闪烁光标 "▌"
- 输入框 → `disabled` + 灰色背景

### 9.4 空状态

- WelcomeScreen 居中显示，上下留白各 20vh
- 手机端：WelcomeScreen 略小字号，留白减少

### 9.5 错误恢复

- API 错误 → ErrorBar 出现在输入框上方
- ErrorBar 包含：错误描述 + [重试] 按钮
- 重试 → 自动重新发送上一条用户消息
- 用户也可以手动修改后重新发送

### 9.6 新对话

- 点击 Header 的 [新对话]
- 弹出确认："当前对话将清空，确定开始新对话？"
- 确认 → clearMessages() → 显示 WelcomeScreen

---

## 10. 响应式设计

| 断点 | 布局 |
|------|------|
| < 640px (手机) | 全屏，输入框固定在底部 |
| 640-1024px (平板) | 居中 600px 宽 |
| > 1024px (桌面) | 居中 768px 宽，两侧留白 |

移动端特殊处理：
- 输入框高度最大 4 行（节省空间）
- Header 高度略减
- 示例问题只显示 4 个（桌面 6 个）

---

## 11. 性能考虑

| 场景 | 策略 |
|------|------|
| 消息列表过长（>100 条） | 虚拟列表不考虑（MVP 不会到这量级） |
| 重复渲染 | `React.memo` 包裹 MessageBubble，只在 content 变化时重渲染 |
| 字体加载 | `font-display: swap` + 预加载思源宋体 woff2 子集（仅标题用字） |
| Markdown 渲染 | `react-markdown` 仅在 content 变化时重新解析 |
| 首屏加载 | WelcomeScreen 纯静态 HTML，无 JS 阻塞 |

---

## 12. 安全考虑

| 风险 | 措施 |
|------|------|
| DEEPSEEK_API_KEY 泄露 | 仅存在于 `.env.local` + Vercel 环境变量，不提交 git |
| 用户输入注入 | API Route 只转发 messages，不拼接 SQL/Shell |
| XSS | `react-markdown` 默认不渲染 HTML，安全 |
| CSRF | Next.js App Router 自动处理 |
| 速率限制 | （MVP 不加）后续可用 Vercel KV 做简易 rate limit |
| 提示词注入 | system prompt 中有角色设定，用户消息可能有越狱尝试。DeepSeek 模型本身有一定防护，后续可按需加强 |

---

## 13. 部署配置

### Vercel 部署

```bash
npm i -g vercel
cd site
vercel --prod
```

环境变量（在 Vercel Dashboard 设置）：
```
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
```

### .gitignore

```
.env.local
.env
node_modules/
.next/
```

---

## 14. 后续迭代路线

| 版本 | 功能 | 复杂度 |
|------|------|--------|
| v0.1 MVP | 基础聊天 + Persona + DeepSeek | — |
| v0.2 | 历史会话列表（IndexedDB） | 低 |
| v0.3 | RAG 知识库（《水经注》关键段向量检索） | 中 |
| v0.4 | 多语言支持（英文版 Li Daoyuan） | 低 |
| v0.5 | 用户反馈与回复质量评估 | 中 |
| v1.0 | 地理学学习路径 / 测验功能 | 高 |

---

## 15. 文件实现顺序

按编写先后排列，每一步写完都能看到可运行的增量：

| 顺序 | 文件 | 依赖 | 产出 |
|------|------|------|------|
| 1 | `next.config.js` + `tailwind.config.ts` | 无 | 项目配置 |
| 2 | `globals.css` | tailwind config | 设计系统 CSS 变量 |
| 3 | `lib/types.ts` | 无 | 共享类型 |
| 4 | `lib/constants.ts` | types | 示例问题/文案 |
| 5 | `lib/storage.ts` | 无 | 本地存储 |
| 6 | `app/layout.tsx` | globals.css | 页面框架 + 字体 |
| 7 | `app/api/chat/route.ts` | system-prompt.txt, .env.local | AI API |
| 8 | `components/Header.tsx` | 无 | 顶部导航 |
| 9 | `components/MarkdownContent.tsx` | react-markdown | Markdown 渲染 |
| 10 | `components/MessageBubble.tsx` | MarkdownContent | 气泡 |
| 11 | `components/MessageList.tsx` | MessageBubble | 消息列表 |
| 12 | `components/MessageInput.tsx` | 无 | 输入框 |
| 13 | `components/WelcomeScreen.tsx` | constants | 首屏 |
| 14 | `components/ErrorBar.tsx` | 无 | 错误提示 |
| 15 | `components/ChatContainer.tsx` | 以上全部 | 顶层容器 |
| 16 | `app/page.tsx` | ChatContainer | 首页 |
| 17 | `app/about/page.tsx` | 无 | 关于页（可选） |

---

## 16. 测试检查点

每完成一个阶段，用以下 check 验证：

**Check 1 — 空状态**:
- [ ] 首次打开页面看到 WelcomeScreen
- [ ] 6 个示例问题可点击
- [ ] 点击示例问题 → 发送消息 → 显示 AI 回复

**Check 2 — 对话流**:
- [ ] 打字 → Enter 发送 → 流式渲染 AI 回复
- [ ] 发送中时输入框禁用，发送按钮转圈
- [ ] AI 回复中显示闪烁光标

**Check 3 — 持久化**:
- [ ] 刷新页面 → 消息列表恢复
- [ ] 点"新对话" → 消息清空

**Check 4 — 错误**:
- [ ] 拔网线 → 显示错误条
- [ ] 点重试 → 重新发送

**Check 5 — 移动端**:
- [ ] 手机浏览器打开 → 全屏布局
- [ ] 输入框占位合理不遮挡消息

**Check 6 — 样式**:
- [ ] 用户气泡和 AI 气泡颜色区分明显
- [ ] AI 气泡左侧有赭石色竖线
- [ ] Markdown 渲染正常（粗体、列表、引用、代码）
