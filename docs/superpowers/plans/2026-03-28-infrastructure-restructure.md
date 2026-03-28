# Tutorial Infrastructure Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the tutorial from 10 chapters (ch00-ch09) to 11 chapters (ch01-ch11) with new Part structure, Harness Engineering narrative, quick paths, and ReferenceSection component.

**Architecture:** Update data layer (toc.ts) first, then UI components (HomePage, ChapterPage, Sidebar), then create new chapter skeleton files. Old chapter files are renamed/moved to match new IDs. Sidebar and navigation components derive from toc.ts automatically.

**Tech Stack:** React 19, TypeScript, React Router DOM 7, Tailwind CSS 4, Vite 8

---

### File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Rewrite | `src/data/toc.ts` | All chapter/part metadata, new 11-chapter structure |
| Create | `src/components/content/ReferenceSection.tsx` | Collapsible reference area component |
| Modify | `src/pages/ChapterPage.tsx:7-18,44-47,52-68,122-135` | Lazy imports for ch01-ch11, dependency display, prereq labels |
| Modify | `src/pages/HomePage.tsx:66-68,91-97,146-165` | Hero subtitle, route guide, tier overview |
| Create | `src/chapters/ch01/index.tsx` through `src/chapters/ch11/index.tsx` | Chapter skeleton files |
| Delete | `src/chapters/ch00/index.tsx` through `src/chapters/ch09/index.tsx` | Old chapter files (after content migration) |
| Modify | `src/styles/index.css` | Add reference section CSS variables |

---

### Task 1: Rewrite toc.ts with new 11-chapter structure

**Files:**
- Rewrite: `src/data/toc.ts`

- [ ] **Step 1: Write the new toc.ts**

Replace the entire file. The Chapter interface gains a `hardDependencies` field (subset of prerequisites that are truly required) to distinguish from soft recommendations.

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
  partSubtitle: string
  estimatedMinutes: number
  skipCondition: string
  prerequisites: string[]        // soft recommendations
  hardDependencies: string[]     // must-read before this chapter
}

export interface Part {
  number: number
  title: string
  subtitle: string
  description: string
  tier: Tier
  chapters: Chapter[]
}

export const parts: Part[] = [
  {
    number: 1,
    title: '和 AI 对话',
    subtitle: 'Prompt Engineering',
    description: '学会和 Claude Code 对话，理解它的能力边界',
    tier: 'l1',
    chapters: [
      {
        id: 'ch01',
        number: 1,
        title: 'Claude Code 的世界观',
        subtitle: '心智模型、请求生命周期、Token 经济学、模型选型',
        tier: 'l1',
        part: 1,
        partTitle: '和 AI 对话',
        partSubtitle: 'Prompt Engineering',
        estimatedMinutes: 45,
        skipCondition: '你已深入理解 Claude Code 的系统架构、1M 上下文经济和 Harness Engineering 概念',
        prerequisites: [],
        hardDependencies: [],
      },
      {
        id: 'ch02',
        number: 2,
        title: 'Prompt 工程',
        subtitle: '五级 Prompt 阶梯、结构化技巧、effort 级别',
        tier: 'l1',
        part: 1,
        partTitle: '和 AI 对话',
        partSubtitle: 'Prompt Engineering',
        estimatedMinutes: 50,
        skipCondition: '你已掌握 XML 语义边界、effort 级别和结构化 Prompt 技巧',
        prerequisites: ['ch01'],
        hardDependencies: ['ch01'],
      },
      {
        id: 'ch03',
        number: 3,
        title: 'Vibe Coding 的边界',
        subtitle: '一致性退化、三种控制模式、代码审查框架',
        tier: 'l1',
        part: 1,
        partTitle: '和 AI 对话',
        partSubtitle: 'Prompt Engineering',
        estimatedMinutes: 40,
        skipCondition: '你已能判断何时用 Vibe Coding、何时需要精确控制',
        prerequisites: ['ch02'],
        hardDependencies: ['ch01'],
      },
    ],
  },
  {
    number: 2,
    title: '构建驾驭系统',
    subtitle: 'Harness Engineering',
    description: '构建 AI 周围的基础设施——CLAUDE.md 是偏好，Hooks 是保障',
    tier: 'l2',
    chapters: [
      {
        id: 'ch04',
        number: 4,
        title: 'CLAUDE.md + 项目记忆',
        subtitle: '快速模板、注入机制、信噪比优化、Auto Memory',
        tier: 'l2',
        part: 2,
        partTitle: '构建驾驭系统',
        partSubtitle: 'Harness Engineering',
        estimatedMinutes: 50,
        skipCondition: '你已能编写高 ROI 的 CLAUDE.md 并理解 Auto Memory 系统',
        prerequisites: ['ch01'],
        hardDependencies: ['ch01'],
      },
      {
        id: 'ch05',
        number: 5,
        title: 'Plan Mode + 结构化思考',
        subtitle: '四阶段框架 EDPE、验证检查点、API 层约束',
        tier: 'l2',
        part: 2,
        partTitle: '构建驾驭系统',
        partSubtitle: 'Harness Engineering',
        estimatedMinutes: 60,
        skipCondition: '你已能在复杂任务中稳定使用 Plan Mode 的 EDPE 流程',
        prerequisites: ['ch04'],
        hardDependencies: ['ch04'],
      },
      {
        id: 'ch06',
        number: 6,
        title: 'Skills 体系',
        subtitle: 'SKILL.md 格式、动态注入、Plugin 市场、AgentSkills.io',
        tier: 'l2',
        part: 2,
        partTitle: '构建驾驭系统',
        partSubtitle: 'Harness Engineering',
        estimatedMinutes: 50,
        skipCondition: '你已编写过自定义 Skill 并从 Plugin 市场安装过工具',
        prerequisites: ['ch04'],
        hardDependencies: ['ch04'],
      },
      {
        id: 'ch07',
        number: 7,
        title: 'Hooks 自动化',
        subtitle: '21+ 事件、四种 Handler、质量流水线、权限深入',
        tier: 'l2',
        part: 2,
        partTitle: '构建驾驭系统',
        partSubtitle: 'Harness Engineering',
        estimatedMinutes: 50,
        skipCondition: '你已搭建过 Hook 质量流水线并配置过权限策略',
        prerequisites: ['ch06'],
        hardDependencies: ['ch06'],
      },
    ],
  },
  {
    number: 3,
    title: 'AI 成为你的团队',
    subtitle: 'Scaling the Harness',
    description: '从单代理到多代理，从终端到基础设施',
    tier: 'l3',
    chapters: [
      {
        id: 'ch08',
        number: 8,
        title: 'Subagent → Agent Teams',
        subtitle: '上下文隔离、五种内置类型、自定义 Agent、多代理协作',
        tier: 'l3',
        part: 3,
        partTitle: 'AI 成为你的团队',
        partSubtitle: 'Scaling the Harness',
        estimatedMinutes: 80,
        skipCondition: '你已自定义过 Subagent 并使用过 Agent Teams 协作',
        prerequisites: ['ch06', 'ch07'],
        hardDependencies: ['ch04'],
      },
      {
        id: 'ch09',
        number: 9,
        title: 'Agent SDK + 程序化接入',
        subtitle: 'Python/TS SDK、CI/CD、定时任务、远程控制',
        tier: 'l3',
        part: 3,
        partTitle: 'AI 成为你的团队',
        partSubtitle: 'Scaling the Harness',
        estimatedMinutes: 70,
        skipCondition: '你已在 CI/CD 管线中集成过 Agent SDK',
        prerequisites: ['ch08'],
        hardDependencies: ['ch08'],
      },
    ],
  },
  {
    number: 4,
    title: 'AI 安全融入组织',
    subtitle: 'Governing the Harness',
    description: '工作流设计、治理体系、风险管控',
    tier: 'l3',
    chapters: [
      {
        id: 'ch10',
        number: 10,
        title: '工作流设计原则',
        subtitle: 'Spec 驱动、上下文隔离、验证循环、方法论案例',
        tier: 'l3',
        part: 4,
        partTitle: 'AI 安全融入组织',
        partSubtitle: 'Governing the Harness',
        estimatedMinutes: 50,
        skipCondition: '你已能从第一性原理设计 AI 辅助工作流',
        prerequisites: ['ch08'],
        hardDependencies: [],
      },
      {
        id: 'ch11',
        number: 11,
        title: '治理、风险与度量',
        subtitle: '四层防御、分级管理、健康指标、成本管控',
        tier: 'l3',
        part: 4,
        partTitle: 'AI 安全融入组织',
        partSubtitle: 'Governing the Harness',
        estimatedMinutes: 50,
        skipCondition: '你已建立了完整的 AI 辅助开发治理体系',
        prerequisites: ['ch10'],
        hardDependencies: [],
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

/** Quick reading paths displayed on the homepage */
export interface QuickPath {
  label: string
  target: string
  chapters: string[]
  estimatedMinutes: number
}

export const quickPaths: QuickPath[] = [
  {
    label: '30 分钟上手',
    target: '今天就能用',
    chapters: ['ch01', 'ch04'],
    estimatedMinutes: 30,
  },
  {
    label: '个人开发者',
    target: '独立高效使用',
    chapters: ['ch01', 'ch02', 'ch03', 'ch04', 'ch05', 'ch06', 'ch07'],
    estimatedMinutes: 345,
  },
  {
    label: 'Tech Lead 评估',
    target: '决定是否引入团队',
    chapters: ['ch01', 'ch04', 'ch08', 'ch11'],
    estimatedMinutes: 225,
  },
  {
    label: '完整路径',
    target: '系统掌握',
    chapters: allChapters.map(c => c.id),
    estimatedMinutes: allChapters.reduce((sum, c) => sum + c.estimatedMinutes, 0),
  },
]
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /Users/panghu/code/rsearch/claude_study && npx tsc --noEmit src/data/toc.ts 2>&1 | head -20`
Expected: No errors (or only errors from files that import old chapter IDs — those are expected and fixed in later tasks)

- [ ] **Step 3: Commit**

```bash
git add src/data/toc.ts
git commit -m "refactor: restructure toc.ts to 11-chapter Harness Engineering layout"
```

---

### Task 2: Create ReferenceSection component

**Files:**
- Create: `src/components/content/ReferenceSection.tsx`
- Modify: `src/styles/index.css`

- [ ] **Step 1: Create the ReferenceSection component**

```tsx
import { useState, type ReactNode } from 'react'

interface ReferenceSectionProps {
  version?: string
  children: ReactNode
}

export function ReferenceSection({ version, children }: ReferenceSectionProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <section
      className="mt-12 rounded-xl overflow-hidden"
      style={{
        border: '1px solid var(--color-border)',
        background: 'var(--color-bg-reference)',
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <div className="flex items-center gap-2">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <path d="M11 1H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1Z" />
            <path d="M4 4h6M4 7h6M4 10h3" />
          </svg>
          <span className="text-sm font-medium">参考数据</span>
          {version && (
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded"
              style={{
                background: 'var(--color-accent-subtle)',
                color: 'var(--color-accent)',
              }}
            >
              {version}
            </span>
          )}
        </div>

        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="currentColor"
          className="transition-transform"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform var(--transition-fast)',
            color: 'var(--color-text-muted)',
          }}
        >
          <path d="M2 4.5L6 8.5L10 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="px-5 pb-5 pt-2 border-t"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {children}
        </div>
      )}
    </section>
  )
}
```

- [ ] **Step 2: Add CSS variable for reference section background**

Append to the `:root` block in `src/styles/index.css`, after the existing `--color-bg-surface` line:

```css
  --color-bg-reference: rgba(255, 255, 255, 0.015);
```

And in the `[data-theme="light"]` block, add:

```css
  --color-bg-reference: rgba(0, 0, 0, 0.02);
```

- [ ] **Step 3: Commit**

```bash
git add src/components/content/ReferenceSection.tsx src/styles/index.css
git commit -m "feat: add collapsible ReferenceSection component"
```

---

### Task 3: Update ChapterPage.tsx for new chapter IDs

**Files:**
- Modify: `src/pages/ChapterPage.tsx`

- [ ] **Step 1: Update lazy chapter imports**

Replace lines 7-18 (the `lazyChapters` object) with:

```typescript
const lazyChapters: Record<string, React.LazyExoticComponent<ComponentType>> = {
  ch01: lazy(() => import('../chapters/ch01/index')),
  ch02: lazy(() => import('../chapters/ch02/index')),
  ch03: lazy(() => import('../chapters/ch03/index')),
  ch04: lazy(() => import('../chapters/ch04/index')),
  ch05: lazy(() => import('../chapters/ch05/index')),
  ch06: lazy(() => import('../chapters/ch06/index')),
  ch07: lazy(() => import('../chapters/ch07/index')),
  ch08: lazy(() => import('../chapters/ch08/index')),
  ch09: lazy(() => import('../chapters/ch09/index')),
  ch10: lazy(() => import('../chapters/ch10/index')),
  ch11: lazy(() => import('../chapters/ch11/index')),
}
```

- [ ] **Step 2: Add Part subtitle display in header**

Replace the Part display span (line 65-68) with:

```tsx
          <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
            Part {chapter.part} · {chapter.partTitle}
            <span className="ml-1 opacity-60">({chapter.partSubtitle})</span>
          </span>
```

- [ ] **Step 3: Distinguish hard vs soft prerequisites display**

Replace the prerequisites section (lines 106-120) with:

```tsx
          {prereqChapters.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span style={{ color: 'var(--color-text-muted)' }}>前置：</span>
              {prereqChapters.map(pc => {
                const isHard = chapter.hardDependencies.includes(pc!.id)
                return (
                  <button
                    key={pc!.id}
                    onClick={() => navigate(`/${pc!.id}`)}
                    className="font-mono underline-offset-2 hover:underline transition-colors"
                    style={{
                      color: isHard ? 'var(--color-accent)' : 'var(--color-text-muted)',
                    }}
                    title={isHard ? '必要前置' : '推荐前置'}
                  >
                    Ch{String(pc!.number).padStart(2, '0')}
                    {isHard ? '' : '?'}
                  </button>
                )
              })}
            </div>
          )}
```

Hard dependencies show in accent color; soft recommendations show in muted color with a `?` suffix.

- [ ] **Step 4: Commit**

```bash
git add src/pages/ChapterPage.tsx
git commit -m "refactor: update ChapterPage for ch01-ch11 with hard/soft deps"
```

---

### Task 4: Update HomePage.tsx

**Files:**
- Modify: `src/pages/HomePage.tsx`

- [ ] **Step 1: Update hero subtitle**

Replace the `<p>` tag content (lines 66-68) with:

```tsx
        <p
          className="text-lg max-w-2xl leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          由浅入深的 AI 辅助开发能力养成系统。从 Prompt Engineering 到 Harness Engineering——
          不只是学会和 AI 对话，更要学会构建 AI 周围的基础设施。
        </p>
```

- [ ] **Step 2: Rewrite RouteGuide with quickPaths data**

Replace the entire `RouteGuide` function with:

```tsx
function RouteGuide() {
  const navigate = useNavigate()

  return (
    <section>
      <h2
        className="text-lg font-semibold mb-4 flex items-center gap-2"
        style={{ color: 'var(--color-text-primary)' }}
      >
        <span className="font-mono text-sm" style={{ color: 'var(--color-accent)' }}>//</span>
        快速路径
      </h2>

      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)',
        }}
      >
        {quickPaths.map((path, i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-5 py-3.5"
            style={{
              borderBottom: i < quickPaths.length - 1 ? '1px solid var(--color-border)' : 'none',
            }}
          >
            <div className="flex items-center gap-2 shrink-0 sm:w-40">
              <span
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {path.label}
              </span>
              <span
                className="text-[10px] font-mono"
                style={{ color: 'var(--color-text-muted)' }}
              >
                ~{path.estimatedMinutes}m
              </span>
            </div>

            <span
              className="text-xs hidden sm:inline"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {path.target}
            </span>

            <div className="flex items-center gap-1 flex-wrap sm:ml-auto">
              {path.chapters.map((chId, ci) => (
                <button
                  key={chId}
                  onClick={() => navigate(`/${chId}`)}
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded hover:underline transition-colors"
                  style={{
                    background: 'var(--color-bg-tertiary)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {chId.replace('ch', 'Ch')}
                  {ci < path.chapters.length - 1 && (
                    <span className="ml-1" style={{ color: 'var(--color-text-muted)' }}>→</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Add quickPaths import**

At the top of the file, update the import from toc:

```typescript
import { allChapters, quickPaths, getTierColor, getTierLabel, type Chapter, type Tier } from '../data/toc'
```

- [ ] **Step 4: Update TierOverview with new Part mapping**

Replace the `tiers` array inside `TierOverview` with:

```typescript
  const tiers: { tier: Tier; title: string; desc: string; chapters: string }[] = [
    {
      tier: 'l1',
      title: 'L1 基础',
      desc: '和 AI 对话。掌握 Prompt 工程和 Vibe Coding 的边界，能高效完成编码任务。',
      chapters: 'Ch01 - Ch03',
    },
    {
      tier: 'l2',
      title: 'L2 进阶',
      desc: '构建驾驭系统。掌握 CLAUDE.md、Plan Mode、Skills、Hooks，构建自动化 Harness。',
      chapters: 'Ch04 - Ch07',
    },
    {
      tier: 'l3',
      title: 'L3 高阶',
      desc: '规模化与治理。掌握多代理协作、SDK 集成、工作流设计、组织级治理。',
      chapters: 'Ch08 - Ch11',
    },
  ]
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/HomePage.tsx
git commit -m "feat: update HomePage with quick paths and Harness Engineering narrative"
```

---

### Task 5: Create chapter skeleton files

**Files:**
- Create: `src/chapters/ch01/index.tsx` through `src/chapters/ch11/index.tsx`

Each skeleton follows the same pattern — a placeholder with the correct structure that can be filled with content later. The existing chapter content will be migrated in follow-up tasks.

- [ ] **Step 1: Create directory structure**

Run:
```bash
cd /Users/panghu/code/rsearch/claude_study
for i in $(seq -w 1 11); do mkdir -p src/chapters/ch$i; done
```

- [ ] **Step 2: Write ch01 skeleton (rewrite of old ch00)**

Create `src/chapters/ch01/index.tsx`:

```tsx
import { ReferenceSection } from '../../components/content/ReferenceSection'

export default function Ch01() {
  return (
    <div className="space-y-8">
      {/* 1.1 你的第一次对话 */}
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          1.1 你的第一次对话
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          {/* TODO: 内容待填充 — 见 spec Section 4, Ch1 */}
          章节内容开发中...
        </p>
      </section>

      {/* 1.2 刚才发生了什么？ */}
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          1.2 刚才发生了什么？
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          章节内容开发中...
        </p>
      </section>

      {/* 1.3 三个时代 */}
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          1.3 三个时代
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          章节内容开发中...
        </p>
      </section>

      {/* 1.4 Token 经济学 */}
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          1.4 Token 经济学
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          章节内容开发中...
        </p>
      </section>

      {/* 1.5 选择你的模型 */}
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          1.5 选择你的模型
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          章节内容开发中...
        </p>
      </section>

      {/* 参考区 */}
      <ReferenceSection version="Claude Code v1.x">
        <div className="space-y-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <p>Token 成本表、系统提示优先级、Prompt Caching、能力全景表、IDE 差异表</p>
        </div>
      </ReferenceSection>
    </div>
  )
}
```

- [ ] **Step 3: Write ch02 skeleton (update of old ch01)**

Create `src/chapters/ch02/index.tsx`:

```tsx
import { ReferenceSection } from '../../components/content/ReferenceSection'

export default function Ch02() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          2.1 五级 Prompt 阶梯
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          2.2 结构化技巧
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          2.3 控制推理深度
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>

      <ReferenceSection version="Claude Code v1.x">
        <div className="space-y-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <p>关键词力度参考表、XML 标签参考、effort 级别消耗估算</p>
        </div>
      </ReferenceSection>
    </div>
  )
}
```

- [ ] **Step 4: Write remaining skeletons ch03-ch11**

Create each file following the same pattern. Each skeleton has the section headings from the spec and a ReferenceSection at the bottom.

`src/chapters/ch03/index.tsx` — sections: 3.1 四轮 API 案例, 3.2 三种控制模式, 3.3 审查框架
`src/chapters/ch04/index.tsx` — sections: 4.1 快速开始, 4.2 注入机制与优先级, 4.3 写好 CLAUDE.md, 4.4 Auto Memory
`src/chapters/ch05/index.tsx` — sections: 5.1 Plan Mode 是什么, 5.2 四阶段框架 EDPE, 5.3 实战 RBAC, 5.4 验证检查点
`src/chapters/ch06/index.tsx` — sections: 6.1 Skills 是什么, 6.2 写你的第一个 Skill, 6.3 作用域与优先级, 6.4 Plugin 市场, 6.5 常见问题排查
`src/chapters/ch07/index.tsx` — sections: 7.1 为什么需要 Hooks, 7.2 实战质量流水线, 7.3 进阶模式, 7.4 权限模型深入, 7.5 常见问题排查
`src/chapters/ch08/index.tsx` — sections: 8.1 为什么需要 Subagent, 8.2 五种内置类型, 8.3 自定义 Agent, 8.4 上下文摘要局限, 8.5 星型到网状, 8.6 Teams 实战, 8.7 高级模式
`src/chapters/ch09/index.tsx` — sections: 9.1 为什么程序化接入, 9.2 Agent SDK, 9.3 CI/CD 集成, 9.4 定时与循环, 9.5 远程控制
`src/chapters/ch10/index.tsx` — sections: 10.1 三个核心原则, 10.2 设计你自己的工作流, 10.3 方法论案例研究, 10.4 反模式
`src/chapters/ch11/index.tsx` — sections: 11.1 四层纵深防御, 11.2 分级管理制度, 11.3 四个核心指标, 11.4 成本管控

Each file uses the same template as ch01/ch02: default export function, space-y-8 container, h2 sections, ReferenceSection at bottom.

Run the following to generate all skeletons at once:

```bash
cd /Users/panghu/code/rsearch/claude_study

# ch03
cat > src/chapters/ch03/index.tsx << 'SKELETON'
import { ReferenceSection } from '../../components/content/ReferenceSection'

export default function Ch03() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>3.1 四轮 API 案例</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>3.2 三种控制模式</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>3.3 AI 生成代码的审查框架</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <ReferenceSection version="Claude Code v1.x">
        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <p>Vibe Coding 常见陷阱检查表</p>
        </div>
      </ReferenceSection>
    </div>
  )
}
SKELETON

# ch04
cat > src/chapters/ch04/index.tsx << 'SKELETON'
import { ReferenceSection } from '../../components/content/ReferenceSection'

export default function Ch04() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>4.1 快速开始：5 分钟写一个 CLAUDE.md</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>4.2 注入机制与优先级</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>4.3 写好 CLAUDE.md 的方法</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>4.4 Auto Memory 系统</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <ReferenceSection version="Claude Code v1.x">
        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <p>完整优先级层级图、Auto Memory frontmatter、/context 命令、Token 摊销数学</p>
        </div>
      </ReferenceSection>
    </div>
  )
}
SKELETON

# ch05
cat > src/chapters/ch05/index.tsx << 'SKELETON'
import { ReferenceSection } from '../../components/content/ReferenceSection'

export default function Ch05() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>5.1 Plan Mode 是什么</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>5.2 四阶段框架 EDPE</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>5.3 实战：RBAC 功能实现</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>5.4 验证检查点的价值</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <ReferenceSection version="Claude Code v1.x">
        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <p>EDPE 提示模板完整版、Plan Mode 配置选项</p>
        </div>
      </ReferenceSection>
    </div>
  )
}
SKELETON

# ch06
cat > src/chapters/ch06/index.tsx << 'SKELETON'
import { ReferenceSection } from '../../components/content/ReferenceSection'

export default function Ch06() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>6.1 Skills 是什么</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>6.2 写你的第一个 Skill</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>6.3 Skill 的作用域与优先级</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>6.4 从 Plugin 市场获取能力</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>6.5 常见问题排查</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <ReferenceSection version="Claude Code v1.x">
        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <p>SKILL.md 完整 frontmatter 字段、内置 Skills 列表、常用 Plugin 清单</p>
        </div>
      </ReferenceSection>
    </div>
  )
}
SKELETON

# ch07
cat > src/chapters/ch07/index.tsx << 'SKELETON'
import { ReferenceSection } from '../../components/content/ReferenceSection'

export default function Ch07() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>7.1 为什么需要 Hooks</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>7.2 实战：构建质量流水线</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>7.3 进阶模式</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>7.4 权限模型深入</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>7.5 常见问题排查</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <ReferenceSection version="Claude Code v1.x">
        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <p>21+ 事件完整列表、Hook 配置 JSON Schema、matcher 语法参考、常用 Hook 模板</p>
        </div>
      </ReferenceSection>
    </div>
  )
}
SKELETON

# ch08
cat > src/chapters/ch08/index.tsx << 'SKELETON'
import { ReferenceSection } from '../../components/content/ReferenceSection'

export default function Ch08() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>8.1 为什么需要 Subagent</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>8.2 五种内置 Subagent</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>8.3 自定义 Agent</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>8.4 上下文摘要的局限</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <hr className="my-8" style={{ borderColor: 'var(--color-border)' }} />
      <div className="px-4 py-3 rounded-lg text-xs" style={{ background: 'var(--color-accent-subtle)', border: '1px solid var(--color-border-accent)' }}>
        <span style={{ color: 'var(--color-accent)' }}>实验性功能</span>
        <span className="ml-2" style={{ color: 'var(--color-text-secondary)' }}>以下内容基于 Agent Teams 实验性 API，可能随版本变化。</span>
      </div>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>8.5 从星型到网状</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>8.6 Teams 实战</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>8.7 高级模式</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <ReferenceSection version="Claude Code v1.x">
        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <p>自定义 Agent 完整 frontmatter（15 字段）、Teams 配置参考、Hook 事件 TeammateIdle/TaskCompleted</p>
        </div>
      </ReferenceSection>
    </div>
  )
}
SKELETON

# ch09
cat > src/chapters/ch09/index.tsx << 'SKELETON'
import { ReferenceSection } from '../../components/content/ReferenceSection'

export default function Ch09() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>9.1 为什么需要程序化接入</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>9.2 Agent SDK</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>9.3 CI/CD 集成</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>9.4 定时与循环</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>9.5 远程控制</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <ReferenceSection version="Claude Code v1.x">
        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <p>SDK CLI 参数表、Python/TS API 参考、Provider 支持、GitHub Actions YAML 模板</p>
        </div>
      </ReferenceSection>
    </div>
  )
}
SKELETON

# ch10
cat > src/chapters/ch10/index.tsx << 'SKELETON'
import { ReferenceSection } from '../../components/content/ReferenceSection'

export default function Ch10() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>10.1 三个核心原则</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>10.2 设计你自己的工作流</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>10.3 社区方法论案例研究</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>10.4 反模式</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <ReferenceSection version="Claude Code v1.x">
        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <p>GSD / BMAD / Writer-Reviewer / RIPER-5 项目链接、适用场景对比表、成本估算</p>
        </div>
      </ReferenceSection>
    </div>
  )
}
SKELETON

# ch11
cat > src/chapters/ch11/index.tsx << 'SKELETON'
import { ReferenceSection } from '../../components/content/ReferenceSection'

export default function Ch11() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>11.1 四层纵深防御</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>11.2 分级管理制度</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>11.3 四个核心健康指标</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>11.4 成本管控</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>章节内容开发中...</p>
      </section>
      <ReferenceSection version="Claude Code v1.x">
        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <p>成本基线参考表、Managed Policy 配置、审查检查表模板、安全评估 checklist</p>
        </div>
      </ReferenceSection>
    </div>
  )
}
SKELETON
```

Expected: All 11 files created in `src/chapters/ch01/` through `src/chapters/ch11/`

- [ ] **Step 5: Verify files exist**

Run: `ls -la src/chapters/ch*/index.tsx | wc -l`
Expected: `11`

- [ ] **Step 6: Commit**

```bash
git add src/chapters/ch01 src/chapters/ch02 src/chapters/ch03 src/chapters/ch04 src/chapters/ch05 src/chapters/ch06 src/chapters/ch07 src/chapters/ch08 src/chapters/ch09 src/chapters/ch10 src/chapters/ch11
git commit -m "feat: create ch01-ch11 skeleton files with section headings from spec"
```

---

### Task 6: Remove old chapter files

**Files:**
- Delete: `src/chapters/ch00/index.tsx`

Old ch01-ch09 directories now contain the NEW chapter content (from Task 5 which overwrote them). Only ch00 needs explicit removal since it doesn't exist in the new structure.

- [ ] **Step 1: Remove ch00**

Run: `rm -rf src/chapters/ch00`

- [ ] **Step 2: Verify only ch01-ch11 remain**

Run: `ls src/chapters/`
Expected: `ch01 ch02 ch03 ch04 ch05 ch06 ch07 ch08 ch09 ch10 ch11`

- [ ] **Step 3: Commit**

```bash
git add -A src/chapters/ch00
git commit -m "chore: remove old ch00 directory"
```

---

### Task 7: Reorganize Remotion animation directories

**Files:**
- Rename: `src/remotion/ch00/` → content stays, referenced from new chapter files
- Create: `src/remotion/ch10/` and `src/remotion/ch11/` (empty, for future animations)

The Remotion files use independent naming (RequestLifecycle.tsx, TokenEconomy.tsx etc.) and are lazy-imported by individual chapters. We don't need to rename them — just ensure the new chapter files can import from the correct paths.

- [ ] **Step 1: Create mapping document for animation migration**

Create `docs/animation-migration-map.md`:

```markdown
# Animation Migration Map

Old chapter animations → New chapter imports

| Old Path | Used In (New) | Status |
|----------|---------------|--------|
| remotion/ch00/RequestLifecycle.tsx | Ch01 (世界观) | Migrate import path |
| remotion/ch00/TokenEconomy.tsx | Ch01 (世界观) | Migrate import path |
| remotion/ch01/PromptDissection.tsx | Ch02 (Prompt 工程) | Migrate import path |
| remotion/ch01/PromptComparison.tsx | Ch02 (Prompt 工程) | Migrate import path |
| remotion/ch02/VibeCodingCurve.tsx | Ch03 (Vibe Coding) | Migrate import path |
| remotion/ch03/PlanModeFlow.tsx | Ch05 (Plan Mode) | Migrate import path |
| remotion/ch04/ClaudeMdHierarchy.tsx | Ch04 (CLAUDE.md) | Migrate import path |
| remotion/ch05/HookEventFlow.tsx | Ch07 (Hooks) | Migrate import path, update content |
| remotion/ch06/SubagentFanout.tsx | Ch08 (Subagent) | Migrate import path |
| remotion/ch07/AgentTeamsTopology.tsx | Ch08 (Agent Teams) | Migrate import path |
| remotion/ch08/McpArchitecture.tsx | — | Remove or archive (MCP demoted) |
| remotion/ch09/RiskMatrix.tsx | Ch11 (治理) | Migrate import path |
| — | Ch06 (Skills) | NEW animation needed |
| — | Ch09 (Agent SDK) | NEW animation needed |
| — | Ch10 (工作流) | NEW animation needed |
```

- [ ] **Step 2: Commit**

```bash
git add docs/animation-migration-map.md
git commit -m "docs: add animation migration map for chapter restructure"
```

---

### Task 8: Verify the app builds and renders

- [ ] **Step 1: Run TypeScript check**

Run: `cd /Users/panghu/code/rsearch/claude_study && npx tsc --noEmit 2>&1 | head -30`
Expected: No errors or only Remotion-related import warnings (old chapter imports from animation files)

- [ ] **Step 2: Run dev server**

Run: `cd /Users/panghu/code/rsearch/claude_study && npm run dev`
Expected: Vite starts without build errors

- [ ] **Step 3: Verify homepage loads**

Open `http://localhost:5173/claude_study/` in browser. Verify:
- Hero text says "Harness Engineering"
- Quick paths section shows 4 paths with clickable chapter chips
- Tier overview shows updated descriptions
- Chapter grid shows 11 chapters (Ch01-Ch11)

- [ ] **Step 4: Verify chapter navigation**

Click on Ch01 in the grid. Verify:
- URL changes to `/#/ch01`
- Header shows "Part 1 · 和 AI 对话 (Prompt Engineering)"
- Tier badge shows "L1 基础"
- Section headings (1.1 through 1.5) render
- ReferenceSection appears collapsed at bottom

- [ ] **Step 5: Verify sidebar**

Check sidebar shows:
- P1 和 AI 对话 (3 chapters)
- P2 构建驾驭系统 (4 chapters)
- P3 AI 成为你的团队 (2 chapters)
- P4 AI 安全融入组织 (2 chapters)

- [ ] **Step 6: Fix any build errors found in steps 1-5**

Address any TypeScript or runtime errors. Common expected issues:
- Old Remotion imports in new chapter files (remove them from skeletons, they'll be added during content migration)
- Missing CSS variables (add if needed)

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "fix: resolve build issues from infrastructure restructure"
```

---

## Next Steps (Not In This Plan)

This plan delivers a working 11-chapter skeleton with the new structure. The following work requires separate plans:

1. **Content Migration**: Move existing content from old chapters to new chapter files, updating references and rewriting where the spec requires it
2. **New Chapter Content**: Write full content for Ch01 (rewrite), Ch06 (Skills), Ch07 (Hooks), Ch09 (Agent SDK)
3. **Animation Updates**: Migrate Remotion imports per the animation map; create new animations for Ch06, Ch09, Ch10
4. **Content Updates**: Apply the correction checklist from the spec (outdated numbers, reframed narratives, new sections)
