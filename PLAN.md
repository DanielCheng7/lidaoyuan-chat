# 郦道元 AI 对话网站 — 详细实施方案

> 个人项目，跳过 PRD/评审/多轮 review，直出可运行产物。

---

## 目录

1. [Phase 1: 郦道元 Persona 蒸馏](#phase-1-郦道元-persona-蒸馏)
2. [Phase 2: 网站搭建](#phase-2-网站搭建)
3. [Phase 3: AI 对话接入](#phase-3-ai-对话接入)
4. [Phase 4: 部署与运营](#phase-4-部署与运营)

---

## Phase 1: 郦道元 Persona 蒸馏

使用 dot-skill 把郦道元蒸馏为可复用 AI Persona，输出文件作为网站 AI 对话的 system prompt + 知识底本。

### Step 1.1: 原材料准备

**必读材料**（在手边备好）：
- 《水经注》原文选段（重点卷：江水、河水、渭水、洛水）
- 《魏书·郦道元传》— 正史本传
- 《水经注》序言（郦道元自序）
- 中华书局或上海古籍出版社版本最佳

**辅助材料**（如有更好）：
- 郦学论著（陈桥驿《郦道元评传》等）
- 《水经注疏》杨守敬、熊会贞

> 把这些 PDF/TXT 放在 `D:/Agent Project/Web郦道元/phase1-materials/` 下。

### Step 1.2: 运行 dot-skill 蒸馏

启动命令：

```
/dot-skill celebrity
```

按提示走 intake 流程：

| 问题 | 回答 |
|------|------|
| Q1: 谁 | 郦道元，字善长，北魏地理学家 |
| Q2: 为什么 | 服务地理学学生，帮助理解《水经注》和中国古代地理学 |
| Q3: 原材料 | 本地有《水经注》原文 PDF + 本传 + 郦学论著 |
| Q4: 采集策略 | Local-first（本地材料为主，网络为辅） |
| Q5: 研究深度 | budget-friendly |

### Step 1.3: 6 维度研究执行

dot-skill 会要求研究 6 个维度。由于是 Local-first，先分析本地材料，再补网络信息。

**各维度研究重点**：

#### 维度 1: 著作与文字
- 《水经注》的写作背景和目的（序言）
- 注疏体例：以水为纲、以地为目
- 引书数量：经统计达 375 种以上
- 地理学框架：水文、地貌、物产、古迹、民俗融合
- 关键段落：三峡（江水）、黄河源（河水）、西湖（渐江水）

#### 维度 2: 对话与访谈
- 古代无访谈。但《魏书》本传有少量言行记录
- 可从他与同僚关系（李彪、元徽）推断交流风格
- 重心：通过本传还原其为人

#### 维度 3: 表达 DNA
- 文风特点：骈散结合，简洁有力
- 常用句式："XX者，XX也"（地理定义句式）
- 描写手法：先总述后分述，数据精确
- 标志性开头："又东过XX县南"、"北过XX县西"
- 抒情时刻：如江水注"自三峡七百里中"段

#### 维度 4: 关键决策
- 选择注《水经》而非另起炉灶
- 实地考察与文献考证并重的方法论
- 仕途经历：从永宁太守到御史中尉
- 最终奉命平叛遇害（萧宝夤之乱）

#### 维度 5: 他者视角
- 清代郦学：全祖望、赵一清、戴震三家校本
- 陈桥驿评价："中国地理学史上的一座里程碑"
- 现代评价：地理学价值 > 文学价值
- 争议点：是否有部分内容抄袭前人

#### 维度 6: 时间线
- 466–472: 出生（具体年份有争议）
- 494–499: 任冀州刺史幕僚时期（可能开始考察）
- 508–512: 任鲁阳太守
- 515–518: 任东荆州刺史
- 518–524: 任职中央 + 撰《水经注》
- 527: 遇害

### Step 1.4: 质量确认

检查输出：
- `skills/celebrity/li-daoyuan/SKILL.md`
- `skills/celebrity/li-daoyuan/persona.md`
- `skills/celebrity/li-daoyuan/work.md`

确认 persona 覆盖：
- 核心性格：严谨求实、实地派、对水系有诗人般的敏感
- 表达风格：简洁+文采，先地理定义后文学描写
- 心智模型："以水为纲"的体系化思维、考证+目验双重验证
- 诚实边界：超出北魏地理认知的需说明"此非吾所知"

### Step 1.5: Persona 输出 → 网站用 prompt

人设调整好后，提取最终版 system prompt 保存到网站项目备用：

`D:/Agent Project/Web郦道元/site/system-prompt.txt`

---

## Phase 2: 网站搭建

### Step 2.1: 初始化 Next.js 项目

```bash
cd D:/Agent Project/Web郦道元
npx create-next-app@latest site --typescript --tailwind --app --src-dir --import-alias "@/*"
cd site
npm install ai @ai-sdk/openai
```

### Step 2.2: 项目结构

```
site/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # 全局布局（古风背景、字体）
│   │   ├── page.tsx            # 首页（对话大厅）
│   │   ├── about/
│   │   │   └── page.tsx        # 关于郦道元
│   │   └── api/
│   │       └── chat/
│   │           └── route.ts    # AI 对话 API
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatContainer.tsx    # 对话容器
│   │   │   ├── MessageList.tsx      # 消息列表
│   │   │   ├── MessageInput.tsx     # 输入框
│   │   │   ├── WelcomeScreen.tsx    # 首屏引导
│   │   │   └── MarkdownRenderer.tsx # Markdown 渲染
│   │   └── ui/
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   ├── lib/
│   │   ├── constants.ts       # 示例问题、配置
│   │   └── storage.ts         # 本地存储（会话记录）
│   └── styles/
│       └── globals.css        # Tailwind + 自定义主题
├── public/
│   └── fonts/                 # 古风字体（思源宋体等）
├── system-prompt.txt          # 郦道元 Persona（复制过来）
└── .env.local                 # DEEPSEEK_API_KEY
```

### Step 2.3: 设计系统

**颜色主题**：
- 主色: `#4a3728`（古铜褐）
- 背景: `#f5f0e8`（宣纸色）
- 文字: `#2c2416`（墨色）
- 强调: `#8b4513`（赭石）
- 边框: `#d4c5a9`（竹简色）

**字体**：
- 标题: 思源宋体 (Noto Serif SC)
- 正文: 系统字体（干净可读）

**风格关键词**：克制、留白、水墨意境、不堆砌装饰

### Step 2.4: 关键组件实现

#### ChatContainer
- 全屏 dialog 布局，非侧边栏
- 顶部：标题"郦道元" + 简约 Header
- 中间：消息流（按时间倒序）
- 底部：输入框 + 提交按钮
- **状态**：idle / loading / streaming / error

#### WelcomeScreen
- 初次访问或清空消息时显示
- 左侧：郦道元简介（100 字）
- 右侧：6 个示例问题按钮，点击直接提问
- 下方：提示"向郦道元请教中国古代地理"

#### MessageList
- 流式渲染 LLM 输出（Markdown）
- 消息气泡：用户纯色气泡 / AI 宣纸色气泡（带古风引文竖线）
- 自动滚动到底部（用户上滚时暂停）

#### MessageInput
- 多行文本框（Shift+Enter 换行，Enter 发送）
- 发送按钮
- 加载中禁用输入

### Step 2.5: API Route

```typescript
// src/app/api/chat/route.ts
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const deepseek = createOpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY!,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: deepseek("deepseek-chat"),
    system: `你扮演郦道元...（从 system-prompt.txt 读取）`,
    messages,
  });

  return result.toDataStreamResponse();
}
```

### Step 2.6: 关键交互状态

| 场景 | UI 显示 |
|------|---------|
| 初始加载 | 骨架屏（两行灰色条） |
| 发送中 | 输入框禁用 + 发送按钮转圈 |
| 流式接收 | 逐字渲染 Markdown（代码块、引用、列表） |
| 空响应 | "抱歉，容我再思" |
| 网络错误 | 红色错误条 + "重试"按钮 |
| 超出上下文 | "对话已满，请开始新对话" + 按钮 |
| 移动端 | 全屏 + 底部固定输入框 |

### Step 2.7: 会话管理

- 当前会话存 localStorage（messages 数组）
- 刷新页面自动恢复
- "新对话"按钮清空当前消息（不保存历史列表）
- 可选未来扩展：显示历史会话列表（IndexedDB）

---

## Phase 3: AI 对话接入

### Step 3.1: Persona Prompt 编写

从 dot-skill 产物提取，写出最终版 system prompt：

```text
你是郦道元（约 466–527），北魏地理学家，范阳涿州人。

【身份】
以《水经注》闻名后世。曾任永宁太守、鲁阳太守、御史中尉。
一生访水寻源，足迹遍及黄河、长江、淮河流域。

【表达风格】
- 文言白话夹杂，不考，自然流利
- 先地理后人文：先讲水系走向、水文变化，再讲沿革典故
- 喜欢用对比："此处水势湍急，彼处则平缓如镜"
- 偶尔流露文人感怀，尤其面对古迹时

【知识边界】
- 核心知识：以《水经注》内容为限
- 超出范围：注明"此事载于后世典籍，吾未及见"或"以吾所知，当如是也"
- 时间边界：以公元 527 年为界
- 空间边界：以中国境内主要水系为主

【思维特质】
- 考证为本："吾尝亲至其地，见水势..."
- 不妄言："此条未见记载，不敢妄言"
- 体系化：以水为纲，由干及支
- 重视目验："图籍虽备，不若亲历"

【教学倾向】
- 鼓励学生实地考察
- 引导关注水系与人文的关系
- 强调文献与实证并重

【诚实边界】
- 不懂的不装懂
- 超出北魏地理知识范围的，坦诚说明
- 不做现代地理学判断

【响应规则】
- 回答简洁，150 字内能说清的不要冗长
- 引用《水经注》原文时简短精准
- 学生问法不严谨时，先确认再作答
- 不说"作为一名AI"或类似元认知话语
```

### Step 3.2: 流式对话对接

用 Vercel AI SDK 的 `useChat` hook：

```typescript
// 在 ChatContainer 中
import { useChat } from "ai/react";

const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
  api: "/api/chat",
  initialMessages: [], // 或从 localStorage 恢复
  onError: (e) => console.error("Chat error:", e),
});
```

### Step 3.3: 知识增强（可选）

如果要做 RAG，简单方案：

1. 把《水经注》关键段落分段（每段 200-500 字）
2. 用 embedding API 向量化
3. 存本地 JSON 文件（小规模不需数据库）
4. 对话时检索 top-3 相关段落追加到 system prompt

不引入复杂基础设施，纯文件方案。

---

## Phase 4: 部署与运营

### 部署选项

| 方式 | 成本 | 适合场景 |
|------|------|---------|
| Vercel Hobby | 免费 | 个人项目、低流量 |
| 自托管（VPS） | ~$5/月 | 需要完全控制 |
| Cloudflare Pages + Workers | 免费层够用 | 边缘部署 |

推荐：**Vercel Hobby** — 一键部署，免费额度够个人项目用。

### 部署步骤

```bash
# 安装 vercel CLI
npm i -g vercel

# 部署
cd site
vercel --prod
```

在 Vercel Dashboard 设置 `DEEPSEEK_API_KEY` 环境变量。

### 后续运营

- 收集学生常用问题，优化 persona 回复
- 定期追加《水经注》篇章到知识库
- 监控 API 用量，设置预算上限

---

## 文件产出总清单

```
D:/Agent Project/Web郦道元/
├── PLAN.md                          ← 本方案
├── phase1-materials/                ← 原材料（自备）
│   ├── shuijingzhu-excerpts.pdf
│   └── weishu-lidaoyuan.md
├── skills/celebrity/li-daoyuan/     ← dot-skill 蒸馏产物
│   ├── SKILL.md
│   ├── persona.md
│   ├── work.md
│   ├── meta.json
│   └── knowledge/                   ← 研究笔记
└── site/                            ← Next.js 网站项目
    ├── src/
    ├── public/
    ├── system-prompt.txt
    └── .env.local
```

---

## 下一步选择

选哪个先做？
1. **Phase 1.1 — 先准备原材料**（找《水经注》PDF 等）
2. **Phase 1.2 — 直接开始蒸馏**（用 `/dot-skill celebrity`）
3. **Phase 2.1 — 先搭网站框架**（persona 后可现成往里塞）
