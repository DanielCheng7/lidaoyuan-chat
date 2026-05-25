# 郦道元 AI 对话网站 — 古风设计思路

> 基于 ui-ux-pro-max 技能库搜索结果，融合 E-Ink/Paper + Editorial + Raw Aesthetic 三种风格

---

## 1. 设计定位

### 风格方向：古风书卷

承袭郦道元《水经注》的学术气质：严谨、古朴、书卷气，融入北魏时期的简洁审美。

### 核心风格来源（取自 UI/UX Pro Max 技能库）

| 来源风格 | 提取元素 |
|----------|---------|
| **E-Ink/Paper** | 纸质肌理、高对比度、无动画（瞬时过渡）、平静、单色调 |
| **Editorial Grid/Magazine** | 不对称网格、首字下沉、引用线、印刷感排版 |
| **Anti-Polish/Raw Aesthetic** | 纸张纹理叠加、手工感、铅笔灰、牛皮纸棕 |

### 关键设计原则

- **像翻开一本古书**，不像打开一个 App
- **纸 + 墨 + 印章红**，三色体系
- **留白即奢侈**，不塞满信息
- **无装饰性动画**，过渡简洁凌厉（150ms 瞬时切）
- **优先竖排感**（但不强制竖排），左侧竖线、引用框

---

## 2. 颜色系统

### 来自技能库 + 自定融合

```css
:root {
  /* 核心三色 */
  --color-paper:        #FDFBF7;  /* 宣纸白 — 主背景 (E-Ink) */
  --color-ink:          #1A1A1A;  /* 墨色 — 主文字 (E-Ink) */
  --color-seal:         #9A3412;  /* 印章红/赭石 — 强调/按钮 (Recipe terracotta) */

  /* 辅助色 */
  --color-paper-deep:   #F5F0E8;  /* 旧纸 — AI气泡/Card背景 */
  --color-paper-warm:   #FFFBEB;  /* 暖纸 — hover状态 (Bookmark warm) */
  --color-pencil:       #4A4A4A;  /* 铅笔灰 — 次要文字 (E-Ink) */
  --color-bamboo:       #D4C5A9;  /* 竹简色 — 边框/分割线 */
  --color-kraft:        #C4A77D;  /* 牛皮纸棕 — 装饰元素 (Raw Aesthetic) */
  --color-moss:         #5D7A4A;  /* 苔绿 — 辅助/链接 */
  --color-error:        #C04040;  /* 朱砂红 — 错误 */

  /* 语义映射 */
  --color-primary:      var(--color-seal);
  --color-bg:           var(--color-paper);
  --color-fg:           var(--color-ink);
  --color-muted:        var(--color-paper-deep);
  --color-muted-fg:     var(--color-pencil);
  --color-border:       var(--color-bamboo);
  --color-accent:       var(--color-seal);
}
```

### 深色模式

不用。此项目仅支持浅色模式——郦道元在烛光或日光下写《水经注》，不改暗色。

---

## 3. 字体系统

### 主字体（来自 Google Fonts 技能库）

| 用途 | 字体 | 来源 | 理由 |
|------|------|------|------|
| **标题** | Noto Serif SC (思源宋体) | Google Fonts #180 | 宋体 = 古籍雕版印刷的正统血脉 |
| **正文** | Noto Sans SC (思源黑体) | Google Fonts #77 | 屏读清晰，配合宋体标题不喧宾夺主 |
| **代码/引用** | JetBrains Mono | — | 等宽，古籍引文的现代编排 |

### 字重使用

| 层级 | 大小 | 字重 | 字体 |
|------|------|------|------|
| 页面标题 "郦道元" | `3rem` (48px) | 700 | Noto Serif SC |
| 欢迎语 | `1.5rem` (24px) | 600 | Noto Serif SC |
| 对话内容 | `1rem` (16px) | 400 | Noto Sans SC |
| AI 回复中引用 | `0.925rem` | 400 italic | Noto Serif SC |
| 辅助文字/时间戳 | `0.75rem` (12px) | 400 | Noto Sans SC |
| Markdown 代码块 | `0.875rem` | 400 | JetBrains Mono |

### 字体加载策略

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500&display=swap" rel="stylesheet">
```

`font-display: swap` — 在字体加载完成前先用系统宋体。

---

## 4. 间距与网格

### 基于 8pt 系统（来自 UX 技能库 §5）

```
--space-1:  0.25rem  (4px)
--space-2:  0.5rem   (8px)
--space-3:  0.75rem  (12px)
--space-4:  1rem     (16px)
--space-6:  1.5rem   (24px)
--space-8:  2rem     (32px)
--space-12: 3rem     (48px)
--space-16: 4rem     (64px)
--space-24: 6rem     (96px)
```

### 内容最大宽度

| 断点 | 内容宽 |
|------|--------|
| 手机 (<640px) | 全宽 - 16px 两侧 |
| 平板 (640-1024) | 600px 居中 |
| 桌面 (>1024) | 720px 居中 |

对话内容窄于一般网站 (720px vs 1200px)，模拟古书的窄栏阅读感。

### 垂直节奏

```
页面结构：
  顶部留白     space-16 (64px)
  Header       space-6 (24px) 高度
  内容起始     space-8 (32px)
  对话间距     space-4 (16px) 条间
  消息气泡内   space-3 (12px) padding
  输入区间距   space-6 (24px)
  底部留白     space-12 (48px)
```

---

## 5. 视觉效果

### 纹理（来自 E-Ink/Paper + Raw Aesthetic）

**宣纸纹理** — 主背景上一层极淡的噪点：
```css
body {
  background-color: var(--color-paper);
  background-image: url("data:image/svg+xml,..."); /* SVG noise */
}
```

噪点透明度 `0.03`，几乎不可见，只在纯色背景下制造"纸"的触感。

### 阴影 — 无模糊、硬偏移（来自 E-Ink 的瞬时过渡）

AI 气泡不使用传统 box-shadow 模糊。改用右边 + 下边的硬色偏移：
```css
.ai-bubble {
  box-shadow: 3px 3px 0 0 rgba(26, 26, 26, 0.08);
}
```
营造"贴在纸上的笺条"感。

### 圆角 — 8px 统一（克制，不圆润）

来自 Editorial 风格的直角克制。古书没有圆角，但屏读需要适度圆角。

### 过渡 — 150ms 瞬时（来自 E-Ink）

所有交互状态（hover/active/focus）使用 `150ms` 过渡，不用弹簧/缓动。模拟翻页而非滑动。

### 引用竖线 — 来自 Editorial 的 Pull Quote

AI 回复气泡左侧 3px 赭石色竖线，模拟古籍的引文标记：
```css
.ai-bubble {
  border-left: 3px solid var(--color-seal);
  padding-left: 12px;
}
```

---

## 6. 组件风格

### 6.1 用户气泡（右对齐）

```
┌──────────────────────────────────┐
│  这是用户的问题文字              │
└──────────────────────────────────┘
                             ►
```
- 背景：古铜褐 `#4A3728`（额外自定义色，不属于主 token）
- 文字：白色
- 圆角：12px 全（左下直角，形成指向感）
- 阴影：无

### 6.2 AI 气泡（左对齐，带竖线）

```
┃  余少时随父居青州，即好访...
┃  ...此水之势也。
└─────────────────────────────
```
- 背景：旧纸 `--color-paper-deep`
- 文字：墨色 `--color-ink`
- 左侧竖线：3px `--color-seal`
- 圆角：12px 全（右上直角）

### 6.3 输入框

```
┌──────────────────────────────────┐
│ 向郦道元请教...                  │
│                                   │
└──────────────────────────────────┘
                              [发送]
```
- 背景：白色（略突出于宣纸背景）
- 边框：竹简色 `--color-bamboo`
- 聚焦时：边框变赭石 `--color-seal`
- 按钮：赭石色背景 + 白色文字
- 按钮加载中：苔绿色 `--color-moss` spinner

### 6.4 WelcomeScreen

```
          郦 道 元
    北魏地理学家 · 水经注作者

    "自三峡七百里中，两岸连山，
     略无阙处..."

    ┌──────────────────────┐
    │ 《水经注》和你是什么  │
    │ 关系？               │
    └──────────────────────┘
    ┌──────────────────────┐
    │ 三峡这段为什么写得   │
    │ 这么详细？           │
    └──────────────────────┘
    ...

    向郦道元请教中国古代地理
```

- 顶部大留白（20vh）
- "郦道元" 用 `Noto Serif SC` 48px/700
- 副标题用铅笔灰 `--color-pencil`，字号 16px
- 《水经注》引用句用斜体 + 赭石色，字号 18px
- 示例问题用卡片形式，悬浮时背景变 `--color-paper-warm`

### 6.5 Header

```
┌──────────────────────────────────┐
│ [≡]  郦道元           [新对话]   │
└──────────────────────────────────┘
```

- 背景：透明（融入宣纸），滚动后加毛玻璃
- "郦道元" 用 Noto Serif SC，字号 20px/600
- "[新对话]" 用铅笔灰，hover 变赭石

### 6.6 ErrorBar

```
┌──────────────────────────────────┐
│ ═══ 网络不畅，请稍后重试  [重试] │
└──────────────────────────────────┘
```

- 背景：`#FEF2F2`（极浅红）
- 左边框：3px 朱砂红 `--color-error`
- 自动消失：5s

---

## 7. 交互规范（来自 UX 技能库）

### 来自技能库的强制规则

| 规则 | 实现 |
|------|------|
| **触摸目标 ≥44px** (§2 touch-target-size) | 所有按钮/示例问题卡片 min-h-11 |
| **触摸间距 ≥8px** (§2 touch-spacing) | 示例问题之间 gap-2 |
| **150-300ms 过渡** (§7 duration-timing) | 所有 hover/active 用 `duration-150` |
| **流式输出** (§AI streaming) | API Route 用 SSE，逐 token 渲染 |
| **减少动画** (§7 reduced-motion) | `prefers-reduced-motion` 时禁用过渡 |
| **聚焦可见** (§1 focus-states) | 输入框聚焦：2px 赭石色 ring |
| **光标指针** (§2 cursor-pointer) | 所有可点击元素 `cursor-pointer` |
| **键盘导航** (§1 keyboard-nav) | Enter 发送、Tab 切换、Escape 清空 |

### 滚动行为

- 新消息自动滚底（`scroll-behavior: instant` — 不 smooth，E-Ink 风格）
- 用户上滚 >150px → 暂停自动滚，右下角浮出 "↓" 按钮
- 点击浮动按钮 → 瞬间跳到底部

### 发送交互

- 按钮 hover：背景加深（`#7A2A0E`）
- 按钮 active：无缩放/无动画（E-Ink），仅颜色变化
- 按钮 loading：文字消失，替换为 16px spinner
- 输入框 disabled：背景变 `--color-paper-deep`，边框消失

---

## 8. 排版细节

### 首字下沉（Editorial 风格的 Drop Cap）

WelcomeScreen 的引用句首字 "自" 下沉 4 行：
```css
.drop-cap::first-letter {
  font-size: 4em;
  float: left;
  line-height: 0.8;
  padding-right: 8px;
  color: var(--color-seal);
  font-family: var(--font-serif);
}
```

### 引用块

AI 回复中的 Markdown `>` 引用：
```css
blockquote {
  border-left: 2px solid var(--color-bamboo);
  padding-left: 12px;
  color: var(--color-pencil);
  font-style: italic;
  font-family: var(--font-serif);
}
```

### 列表

无序列表用中文顿号 `、` 风格的自定义 marker。有序列表用中文数字。

---

## 9. 响应式策略

### 手机 (<640px)
- WelcomeScreen: "郦道元" 字号 36px（降一档）
- 示例问题：只显示 4 个（桌面 6 个）
- 气泡最大宽 90vw
- 输入框固定底部

### 平板 (640-1024)
- 内容宽 600px 居中
- WelcomeScreen 顶部留白 15vh

### 桌面 (>1024)
- 内容宽 720px 居中
- 两侧大留白
- WelcomeScreen 顶部留白 20vh

---

## 10. 实现优先级（来自架构文档第 15 节）

| 顺序 | 产出 | 设计相关 |
|------|------|---------|
| 1-2 | 项目配置 + CSS 变量 | 全局设计 token |
| 5-7 | 存储 + 布局 + API | 功能骨架 |
| 8-9 | Header + MarkdownContent | 排版和视觉 |
| 10-11 | MessageBubble + MessageList | 核心聊天 UI |
| 12-13 | MessageInput + WelcomeScreen | 交互入口 |
| 14-17 | ErrorBar + ChatContainer + Page | 整合上线 |

---

## 11. 设计检查清单（来自 UI/UX Pro Max Pre-Delivery）

- [ ] 无 emoji 作为图标（用 SVG：Lucide icons）
- [ ] 所有可点击元素 `cursor-pointer`
- [ ] 悬停状态平滑过渡（150ms）
- [ ] 文字对比度 ≥4.5:1（墨色 `#1A1A1A` 在宣纸 `#FDFBF7` 上 = 18.3:1 ✓）
- [ ] 聚焦状态键盘可见（ring-2 ring-seal）
- [ ] 尊重 `prefers-reduced-motion`
- [ ] 响应式：375 / 768 / 1024 / 1440 实测
- [ ] 触摸目标 ≥44px
- [ ] 安全区域适配（手机 notch + 底部指示条）
- [ ] 无水平滚动
