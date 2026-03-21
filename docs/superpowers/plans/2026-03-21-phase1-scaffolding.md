# Phase 1: 项目脚手架 + 核心布局 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **IMPORTANT:** When implementing page layouts and UI components, use the `frontend-design` skill to ensure high design quality. This is a tutorial site with dark terminal aesthetic — avoid generic AI-generated UI.

**Goal:** 搭建可运行的 React SPA 空壳站点，包含完整的路由、布局、导航、主题系统和首页。

**Architecture:** Vite + React 19 + TypeScript SPA。React Router 处理章节路由。Tailwind CSS 4 处理样式，默认深色终端风格主题。@remotion/player 作为依赖安装但本阶段不构建动画组件。

**Tech Stack:** React 19, Vite 6, TypeScript 5.9, Tailwind CSS 4, React Router 7, @remotion/player 4.0, react-syntax-highlighter 16

---

## File Structure

```
claude_study/
├── src/
│   ├── components/
│   │   └── layout/
│   │       ├── Sidebar.tsx           # 侧边栏：章节树 + 段位颜色 + 进度条
│   │       ├── Header.tsx            # 顶栏：标题 + 搜索框(placeholder) + 主题切换
│   │       ├── Layout.tsx            # 主布局壳：Header + Sidebar + Content area
│   │       └── MobileNav.tsx         # 移动端导航抽屉
│   ├── pages/
│   │   ├── HomePage.tsx              # 首页：动画区 + 路线表 + 章节概览
│   │   └── ChapterPage.tsx           # 章节页壳：加载对应章节组件
│   ├── data/
│   │   └── toc.ts                    # 目录结构数据（章节标题、段位、路径）
│   ├── hooks/
│   │   ├── useProgress.ts            # localStorage 阅读进度追踪
│   │   └── useTheme.ts               # 主题切换 hook
│   ├── styles/
│   │   └── index.css                 # Tailwind 入口 + 自定义 CSS 变量
│   ├── App.tsx                       # Router 配置
│   └── main.tsx                      # 入口
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── tsconfig.app.json
```

---

### Task 1: 项目初始化

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`

- [ ] **Step 1: 用 Vite 创建 React + TypeScript 项目**

Run:
```bash
cd /Users/panghu/code/rsearch/claude_study
npm create vite@latest . -- --template react-ts
```

如果提示目录非空（因为 docs/ 已存在），选择继续。

- [ ] **Step 2: 安装核心依赖**

Run:
```bash
npm install react-router-dom @remotion/player remotion react-syntax-highlighter
npm install -D tailwindcss @tailwindcss/vite @types/react-syntax-highlighter
```

- [ ] **Step 3: 验证项目可启动**

Run: `npm run dev`
Expected: Vite dev server 在 localhost 启动，浏览器显示默认 React 页面

- [ ] **Step 4: 初始化 git**

Run:
```bash
git init
git add -A
git commit -m "chore: scaffold vite + react + typescript project"
```

---

### Task 2: Tailwind CSS + 主题系统

**Files:**
- Modify: `vite.config.ts`
- Create: `src/styles/index.css`
- Modify: `src/main.tsx` (import css)
- Create: `src/hooks/useTheme.ts`
- Create: `tailwind.config.ts`

- [ ] **Step 1: 配置 Tailwind**

`vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

`src/styles/index.css`:
```css
@import "tailwindcss";

:root {
  --color-bg-primary: #0a0a1a;
  --color-bg-secondary: #111127;
  --color-bg-tertiary: #1a1a3e;
  --color-text-primary: #e2e8f0;
  --color-text-secondary: #94a3b8;
  --color-accent: #D97757;
  --color-accent-hover: #E8845C;
  --color-tier-l1: #4ade80;
  --color-tier-l2: #facc15;
  --color-tier-l3: #f87171;
  --color-quality-line: #60a5fa;
}

[data-theme="light"] {
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8fafc;
  --color-bg-tertiary: #f1f5f9;
  --color-text-primary: #1e293b;
  --color-text-secondary: #64748b;
}

body {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

code, pre {
  font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace;
}
```

- [ ] **Step 2: 创建 useTheme hook**

`src/hooks/useTheme.ts`:
```typescript
import { useState, useEffect } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return { theme, toggle }
}
```

- [ ] **Step 3: 更新 main.tsx 引入样式**

`src/main.tsx`:
```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
```

- [ ] **Step 4: 验证 Tailwind 工作**

临时在 App.tsx 加一个 `<h1 className="text-3xl font-bold" style={{color: 'var(--color-accent)'}}>Claude Code 教程</h1>`
Run: `npm run dev`
Expected: 看到橙色加粗大标题

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: configure tailwind css with dark/light theme system"
```

---

### Task 3: 目录结构数据

**Files:**
- Create: `src/data/toc.ts`

- [ ] **Step 1: 定义目录数据类型和内容**

`src/data/toc.ts`:
```typescript
export type Tier = 'l1' | 'l2' | 'l3'

export interface Chapter {
  id: string
  number: number
  title: string
  subtitle: string
  tier: Tier
  part: number
  partTitle: string
  estimatedMinutes: number
  skipCondition: string
  prerequisites: string[]
}

export interface Part {
  number: number
  title: string
  description: string
  tier: Tier
  chapters: Chapter[]
}

export const parts: Part[] = [
  {
    number: 0,
    title: '认知基础',
    description: '理解 Claude Code 的底层世界',
    tier: 'l1',
    chapters: [
      {
        id: 'ch00',
        number: 0,
        title: 'Claude Code 的底层世界',
        subtitle: '一条请求的完整旅程、上下文经济学、模型与权限',
        tier: 'l1',
        part: 0,
        partTitle: '认知基础',
        estimatedMinutes: 45,
        skipCondition: '你已深入理解 Claude Code 的系统架构和 token 经济模型',
        prerequisites: [],
      },
    ],
  },
  {
    number: 1,
    title: '编码阶段介入',
    description: 'AI 介入开发最后环节——编码实现',
    tier: 'l1',
    chapters: [
      {
        id: 'ch01',
        number: 1,
        title: '用 AI 写代码：从对话到精确控制',
        subtitle: 'Prompt 工程、Token 效率、约束语',
        tier: 'l1',
        part: 1,
        partTitle: '编码阶段介入',
        estimatedMinutes: 60,
        skipCondition: '你已掌握 Claude Code 的 Prompt 工程和上下文管理策略',
        prerequisites: ['ch00'],
      },
      {
        id: 'ch02',
        number: 2,
        title: '用 AI 改代码：重构、调试与优化',
        subtitle: 'Vibe Coding 边界、渐进式控制、Slash 命令',
        tier: 'l1',
        part: 1,
        partTitle: '编码阶段介入',
        estimatedMinutes: 50,
        skipCondition: '你已能判断何时用 Vibe Coding、何时需要精确控制',
        prerequisites: ['ch01'],
      },
    ],
  },
  {
    number: 2,
    title: '设计阶段介入',
    description: 'AI 介入方案设计、规范建立、自动化搭建',
    tier: 'l2',
    chapters: [
      {
        id: 'ch03',
        number: 3,
        title: '用 AI 做方案设计：Plan Mode + 结构化思考',
        subtitle: '四阶段框架、Extended Thinking、决策树',
        tier: 'l2',
        part: 2,
        partTitle: '设计阶段介入',
        estimatedMinutes: 70,
        skipCondition: '你已能在复杂任务中稳定使用 Plan Mode 并知道何时不该用',
        prerequisites: ['ch02'],
      },
      {
        id: 'ch04',
        number: 4,
        title: '用 AI 建团队规范：CLAUDE.md + 项目记忆',
        subtitle: '注入机制、Auto Memory、团队治理',
        tier: 'l2',
        part: 2,
        partTitle: '设计阶段介入',
        estimatedMinutes: 50,
        skipCondition: '你已能编写高质量 CLAUDE.md 并建立团队治理流程',
        prerequisites: ['ch03'],
      },
      {
        id: 'ch05',
        number: 5,
        title: '用 AI 做自动化：Hooks + Skills',
        subtitle: '事件模型、四种 Hook 类型、自定义 Skill、Plugin',
        tier: 'l2',
        part: 2,
        partTitle: '设计阶段介入',
        estimatedMinutes: 80,
        skipCondition: '你已搭建过 Hook 自动化流水线和自定义 Skill',
        prerequisites: ['ch04'],
      },
    ],
  },
  {
    number: 3,
    title: '需求与架构阶段介入',
    description: 'AI 介入技术调研、架构决策、全流程管理',
    tier: 'l3',
    chapters: [
      {
        id: 'ch06',
        number: 6,
        title: '用 AI 做技术调研：Subagent 并行探索',
        subtitle: '上下文隔离、Worktree、持久记忆、成本控制',
        tier: 'l3',
        part: 3,
        partTitle: '需求与架构阶段介入',
        estimatedMinutes: 70,
        skipCondition: '你已能自定义 Subagent 并用 Worktree 隔离做并行开发',
        prerequisites: ['ch05'],
      },
      {
        id: 'ch07',
        number: 7,
        title: '用 AI 做架构决策：多角度分析与验证',
        subtitle: 'Agent Teams、MCP、竞争假设、多维审查',
        tier: 'l3',
        part: 3,
        partTitle: '需求与架构阶段介入',
        estimatedMinutes: 90,
        skipCondition: '你已使用过 Agent Teams 和 MCP 做多维度架构验证',
        prerequisites: ['ch06'],
      },
      {
        id: 'ch08',
        number: 8,
        title: '用 AI 管理全流程：从需求到交付',
        subtitle: '社区方法论、CI/CD、SDK、Git Worktree',
        tier: 'l3',
        part: 3,
        partTitle: '需求与架构阶段介入',
        estimatedMinutes: 90,
        skipCondition: '你已能组合多种方法论和工具覆盖完整开发生命周期',
        prerequisites: ['ch07'],
      },
    ],
  },
  {
    number: 4,
    title: '企业实践',
    description: '风险、治理与落地',
    tier: 'l3',
    chapters: [
      {
        id: 'ch09',
        number: 9,
        title: '风险、治理与落地',
        subtitle: '质量保障、分级管理、度量体系、安全、落地路线图',
        tier: 'l3',
        part: 4,
        partTitle: '企业实践',
        estimatedMinutes: 60,
        skipCondition: '你已建立了完整的 AI 辅助开发治理体系',
        prerequisites: ['ch08'],
      },
    ],
  },
]

export const allChapters = parts.flatMap(p => p.chapters)

export function getChapter(id: string): Chapter | undefined {
  return allChapters.find(c => c.id === id)
}

export function getTierColor(tier: Tier): string {
  const colors = { l1: 'var(--color-tier-l1)', l2: 'var(--color-tier-l2)', l3: 'var(--color-tier-l3)' }
  return colors[tier]
}

export function getTierLabel(tier: Tier): string {
  const labels = { l1: 'L1 基础', l2: 'L2 进阶', l3: 'L3 高阶' }
  return labels[tier]
}
```

- [ ] **Step 2: Commit**

```bash
git add src/data/toc.ts
git commit -m "feat: add table of contents data structure"
```

---

### Task 4: 阅读进度 Hook

**Files:**
- Create: `src/hooks/useProgress.ts`

- [ ] **Step 1: 实现进度追踪 hook**

`src/hooks/useProgress.ts`:
```typescript
import { useState, useEffect, useCallback } from 'react'

interface Progress {
  [chapterId: string]: {
    started: boolean
    completed: boolean
    lastVisited: number
  }
}

const STORAGE_KEY = 'claude-tutorial-progress'

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  }, [progress])

  const markStarted = useCallback((chapterId: string) => {
    setProgress(prev => ({
      ...prev,
      [chapterId]: { ...prev[chapterId], started: true, lastVisited: Date.now() },
    }))
  }, [])

  const markCompleted = useCallback((chapterId: string) => {
    setProgress(prev => ({
      ...prev,
      [chapterId]: { ...prev[chapterId], started: true, completed: true, lastVisited: Date.now() },
    }))
  }, [])

  const isCompleted = useCallback((chapterId: string) => {
    return progress[chapterId]?.completed ?? false
  }, [progress])

  const isStarted = useCallback((chapterId: string) => {
    return progress[chapterId]?.started ?? false
  }, [progress])

  const completedCount = Object.values(progress).filter(p => p.completed).length

  return { progress, markStarted, markCompleted, isCompleted, isStarted, completedCount }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useProgress.ts
git commit -m "feat: add reading progress tracking hook with localStorage"
```

---

### Task 5: 主布局组件

**Files:**
- Create: `src/components/layout/Layout.tsx`
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/MobileNav.tsx`

> **IMPORTANT:** Use `frontend-design` skill when implementing these components. Design should have a dark terminal aesthetic with the Claude Code orange (#D97757) accent. Avoid generic AI-generated UI — this is a distinctive tutorial site.

- [ ] **Step 1: 创建 Header 组件**

`src/components/layout/Header.tsx` — 顶栏包含：
- 左侧：Claude Code 教程 logo/标题
- 中间：搜索框（placeholder，本阶段不实现搜索逻辑）
- 右侧：主题切换按钮（太阳/月亮图标）
- 响应式：移动端显示汉堡菜单按钮

- [ ] **Step 2: 创建 Sidebar 组件**

`src/components/layout/Sidebar.tsx` — 侧边栏包含：
- Part 分组（可折叠）
- 每个 Chapter 显示：段位颜色圆点 + 标题 + 完成状态勾选
- 当前章节高亮
- 底部：整体进度条（X/10 已完成）
- 宽度：280px，桌面端常驻，移动端隐藏

- [ ] **Step 3: 创建 MobileNav 组件**

`src/components/layout/MobileNav.tsx` — 移动端抽屉导航：
- 点击汉堡菜单滑出
- 复用 Sidebar 的内容
- 点击章节后自动关闭

- [ ] **Step 4: 创建 Layout 组件**

`src/components/layout/Layout.tsx` — 组合以上组件：
```
┌──────────────── Header ────────────────┐
├────────┬───────────────────────────────┤
│Sidebar │       Content (Outlet)        │
│ 280px  │       flex-1                  │
│        │       max-w-4xl               │
│        │       mx-auto                 │
│        │       px-8 py-12              │
├────────┴───────────────────────────────┤
```

使用 React Router 的 `<Outlet />` 渲染子路由内容。

- [ ] **Step 5: 验证布局**

Run: `npm run dev`
Expected: 看到深色主题的完整布局——顶栏 + 侧边栏 + 空白内容区。侧边栏显示所有章节。主题切换按钮可工作。移动端（缩小浏览器窗口）汉堡菜单可展开侧边栏。

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/
git commit -m "feat: implement main layout with header, sidebar, and mobile nav"
```

---

### Task 6: 路由配置

**Files:**
- Modify: `src/App.tsx`
- Create: `src/pages/HomePage.tsx` (placeholder)
- Create: `src/pages/ChapterPage.tsx` (placeholder)

- [ ] **Step 1: 配置路由**

`src/App.tsx`:
```typescript
import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { HomePage } from './pages/HomePage'
import { ChapterPage } from './pages/ChapterPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path=":chapterId" element={<ChapterPage />} />
      </Route>
    </Routes>
  )
}
```

- [ ] **Step 2: 创建 HomePage placeholder**

`src/pages/HomePage.tsx`:
```typescript
export function HomePage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-accent)' }}>
        Claude Code 使用教程
      </h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>
        由浅入深的 AI 辅助开发能力养成系统
      </p>
    </div>
  )
}
```

- [ ] **Step 3: 创建 ChapterPage placeholder**

`src/pages/ChapterPage.tsx`:
```typescript
import { useParams } from 'react-router-dom'
import { getChapter } from '../data/toc'

export function ChapterPage() {
  const { chapterId } = useParams<{ chapterId: string }>()
  const chapter = chapterId ? getChapter(chapterId) : undefined

  if (!chapter) {
    return <div>章节未找到</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">
        Ch{chapter.number} — {chapter.title}
      </h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>{chapter.subtitle}</p>
      <p className="mt-8 opacity-50">内容开发中...</p>
    </div>
  )
}
```

- [ ] **Step 4: 验证路由**

Run: `npm run dev`
Expected:
- 首页 `/` 显示标题
- 点击侧边栏章节跳转到 `/ch00`、`/ch01` 等
- 章节页显示对应章节标题
- 浏览器前进/后退正常

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/pages/
git commit -m "feat: configure react router with home and chapter routes"
```

---

### Task 7: 首页设计与实现

**Files:**
- Modify: `src/pages/HomePage.tsx`

> **IMPORTANT:** Use `frontend-design` skill for this task. The home page is the first impression — it needs to be distinctive, not generic. Dark terminal aesthetic, the Claude Code orange (#D97757) accent, subtle dot grid or terminal-feel background. Think of it as a "landing page for a premium developer tool tutorial."

- [ ] **Step 1: 设计并实现首页**

首页包含以下区域（从上到下）：

1. **Hero 区域**：大标题 "Claude Code 使用教程" + 副标题 "由浅入深的 AI 辅助开发能力养成系统" + 简短的一句话说明教程价值。暂留一个动画占位区域（Phase 3 放入 ClaudeCodeIntro Remotion 动画）

2. **推荐路线表格**：
   | 你的情况 | 推荐路线 |
   |---------|---------|
   | 第一次使用 Claude Code | Ch0 → Ch1 → Ch2 → ... 顺序读 |
   | 有经验，想快速进阶 | Ch0(快速过) → Ch3 → Ch5 → Ch6 |
   | 关注架构与治理 | 每章全读，重点看决策框架和质量线段落 |
   | 需要决策依据，时间有限 | Ch0 摘要 → 每章质量线 → Ch9 |

3. **段位带概览**：三个卡片展示 L1/L2/L3，每个显示段位颜色 + 包含的章节列表 + 简介。从左到右 L1 绿色 → L2 黄色 → L3 红色。

4. **章节网格**：所有 10 个章节的卡片网格，每个卡片显示章节号 + 标题 + 段位标记 + 预计时间 + 简介。点击跳转到章节。

- [ ] **Step 2: 验证首页**

Run: `npm run dev`
Expected: 首页显示完整的 4 个区域。点击章节卡片跳转正确。响应式在手机宽度也可用。

- [ ] **Step 3: Commit**

```bash
git add src/pages/HomePage.tsx
git commit -m "feat: implement homepage with hero, route guide, tier overview, and chapter grid"
```

---

### Task 8: Sidebar 交互完善

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`

- [ ] **Step 1: 添加侧边栏交互**

- Part 组可折叠（点击 Part 标题展开/收起章节列表）
- 当前页面的章节高亮（粗体 + 左侧颜色条）
- 完成的章节显示勾选标记
- 底部进度条显示 "X/10 已完成"
- 使用 useProgress hook 读取进度
- 使用 React Router 的 useLocation 判断当前路由

- [ ] **Step 2: 验证**

Run: `npm run dev`
Expected: 侧边栏各交互正常——折叠/展开、高亮、进度条

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Sidebar.tsx
git commit -m "feat: add sidebar collapsible sections, highlighting, and progress bar"
```

---

### Task 9: ChapterPage 壳完善

**Files:**
- Modify: `src/pages/ChapterPage.tsx`

- [ ] **Step 1: 完善章节页顶部元信息**

章节页顶部显示：
- 段位标记（L1/L2/L3 彩色 badge）
- 章节标题和副标题
- 预计阅读时间
- 跳过条件（"已经会了？如果你 [skipCondition]，可以跳过本章"）
- 前置要求（依赖的前置章节列表，可点击跳转）
- 底部分隔线
- "标记为已完成" 按钮（调用 useProgress.markCompleted）

- [ ] **Step 2: 在 ChapterPage 中调用 markStarted**

进入章节页时自动调用 `markStarted(chapterId)` 更新进度。

- [ ] **Step 3: 验证**

Run: `npm run dev`
Expected: 章节页顶部显示完整元信息。进入后侧边栏进度更新。点击"标记完成"后侧边栏显示勾选。

- [ ] **Step 4: Commit**

```bash
git add src/pages/ChapterPage.tsx
git commit -m "feat: implement chapter page header with meta info and progress tracking"
```

---

### Task 10: 清理 + 构建验证

**Files:**
- Remove: Vite 默认的 `src/App.css`, `src/index.css` (如果还在), `src/assets/`
- Modify: `index.html` (更新 title)

- [ ] **Step 1: 清理 Vite 默认文件**

删除不需要的默认文件：
```bash
rm -f src/App.css src/index.css
rm -rf src/assets
```

更新 `index.html` 的 `<title>` 为 "Claude Code 使用教程"。

- [ ] **Step 2: 生产构建验证**

Run: `npm run build`
Expected: 构建成功，无 TypeScript 错误，无 ESLint 错误

Run: `npm run preview`
Expected: 预览服务器启动，站点功能正常

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: clean up defaults, verify production build"
```

---

## Phase 1 完成标准

- [ ] `npm run dev` 启动正常
- [ ] `npm run build` 无错误
- [ ] 首页显示 Hero + 路线表 + 段位概览 + 章节网格
- [ ] 侧边栏显示所有章节，可折叠，当前高亮
- [ ] 点击章节可路由跳转，章节页显示元信息
- [ ] 主题切换（深色/浅色）工作
- [ ] 移动端汉堡菜单可用
- [ ] 阅读进度 localStorage 持久化
- [ ] 所有代码已 commit
