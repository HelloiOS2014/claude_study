# Full Project Audit Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all 35 issues found in the project audit — restore invisible UI, integrate Remotion animations, fix content errors, clean up dead code.

**Architecture:** The fixes are independent work streams: CSS fix unblocks the sidebar/homepage, then quick wins (theme/routing/cleanup), then content text fixes, then the largest item — wiring 13 Remotion animations into the app via lazy imports and `AnimationWrapper`.

**Tech Stack:** React 19, TypeScript, Vite 8, Tailwind CSS 4, Remotion 4, react-router-dom 7

**Spec:** `docs/superpowers/specs/2026-03-23-full-project-audit-design.md`

---

### Task 1: Fix CSS stagger-children animation (P0 — unblocks sidebar + homepage)

**Files:**
- Modify: `src/styles/index.css:156-178`

The `--transition-slow` variable includes a `cubic-bezier()` timing function. Using it in `animation` shorthand alongside `ease-out` creates two timing functions — browsers discard the entire declaration. Result: `opacity: 0` sticks permanently.

- [ ] **Step 1: Fix `.animate-fade-in` (line 157)**

Replace:
```css
.animate-fade-in {
  animation: fadeIn var(--transition-slow) ease-out forwards;
}
```
With:
```css
.animate-fade-in {
  animation: fadeIn 400ms ease-out forwards;
}
```

- [ ] **Step 2: Fix `.animate-slide-in` (line 161)**

Replace:
```css
.animate-slide-in {
  animation: slideInLeft var(--transition-slow) ease-out forwards;
}
```
With:
```css
.animate-slide-in {
  animation: slideInLeft 400ms ease-out forwards;
}
```

- [ ] **Step 3: Fix `.stagger-children > *` (line 167)**

Replace:
```css
.stagger-children > * {
  opacity: 0;
  animation: fadeIn var(--transition-slow) ease-out forwards;
}
```
With:
```css
.stagger-children > * {
  opacity: 0;
  animation: fadeIn 400ms ease-out forwards;
}
```

- [ ] **Step 4: Add nth-child(n+11) fallback after line 178**

Add after the last nth-child rule:
```css
.stagger-children > *:nth-child(n+11) { animation-delay: 550ms; }
```

- [ ] **Step 5: Verify**

Run: `npm run build`
Expected: Build succeeds. Then open `http://localhost:5174/` — sidebar should show P0-P4 navigation, homepage should show 10 chapter cards.

- [ ] **Step 6: Commit**

```bash
git add src/styles/index.css
git commit -m "fix: CSS animation shorthand broken by dual timing-function

The --transition-slow variable includes cubic-bezier(), which when used
in animation shorthand alongside ease-out creates an invalid value.
Browsers silently discard the declaration, leaving opacity: 0 permanent.
Hardcode 400ms instead of using the variable."
```

---

### Task 2: Fix useTheme crash risk and flash (P1)

**Files:**
- Modify: `src/hooks/useTheme.ts`

- [ ] **Step 1: Replace useTheme implementation**

Replace entire file content:
```ts
import { useState, useEffect } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const stored = (localStorage.getItem('theme') as 'dark' | 'light') || 'dark'
      document.documentElement.setAttribute('data-theme', stored)
      return stored
    } catch {
      return 'dark'
    }
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('theme', theme)
    } catch {
      // Silently fail in sandboxed environments
    }
  }, [theme])

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return { theme, toggle }
}
```

- [ ] **Step 2: Verify**

Run: `npm run build`

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useTheme.ts
git commit -m "fix: useTheme localStorage crash and theme flash

Wrap localStorage in try/catch (useProgress already does this).
Set data-theme synchronously in useState initializer to prevent
light-mode users seeing a dark flash on every page load."
```

---

### Task 3: Remove fake search box and add 404 route (P0)

**Files:**
- Modify: `src/components/layout/Header.tsx:71-94`
- Modify: `src/App.tsx`

- [ ] **Step 1: Remove search widget from Header.tsx**

Delete lines 71-94 (from `{/* Search placeholder */}` through the closing `</div>` of the search widget).

- [ ] **Step 2: Add Navigate import and catch-all route in App.tsx**

Replace:
```tsx
import { Routes, Route } from 'react-router-dom'
```
With:
```tsx
import { Routes, Route, Navigate } from 'react-router-dom'
```

Add before the closing `</Route>`:
```tsx
        <Route path="*" element={<Navigate to="/" replace />} />
```

Full App.tsx should be:
```tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { HomePage } from './pages/HomePage'
import { ChapterPage } from './pages/ChapterPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path=":chapterId" element={<ChapterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
```

- [ ] **Step 3: Verify**

Run: `npm run build`

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Header.tsx src/App.tsx
git commit -m "fix: remove non-functional search box, add 404 redirect

Search box had cursor-pointer and ⌘K hint but no onClick handler.
Multi-segment paths like /foo/bar rendered a blank page."
```

---

### Task 4: Delete unused data files (P0)

**Files:**
- Delete: `src/data/benchmarks.ts`
- Delete: `src/data/configs/index.ts`
- Delete: `src/data/prompts/index.ts`

- [ ] **Step 1: Delete the files**

```bash
rm src/data/benchmarks.ts src/data/configs/index.ts src/data/prompts/index.ts
```

If `src/data/configs/` and `src/data/prompts/` directories are now empty, remove them:
```bash
rmdir src/data/configs src/data/prompts
```

- [ ] **Step 2: Verify no imports break**

Run: `npm run build`
Expected: Success — no file imports these modules.

- [ ] **Step 3: Commit**

```bash
git add src/data/benchmarks.ts src/data/configs/ src/data/prompts/
git commit -m "chore: delete unused data files (benchmarks, configs, prompts)

These 900+ lines of structured data were never imported by any
component. Chapters use inline hardcoded data instead."
```

---

### Task 5: Fix content errors in chapters (P2)

**Files:**
- Modify: `src/chapters/ch00/index.tsx` (lines 445, 1167)
- Modify: `src/chapters/ch02/index.tsx` (line 232)
- Modify: `src/chapters/ch05/index.tsx` (lines 1572-1585)
- Modify: `src/chapters/ch06/index.tsx` (line 459)
- Modify: `src/chapters/ch09/index.tsx` (lines 166, 168, 177, 1075, 1081, 1087, 1140, 1152, 1164, 1188)

- [ ] **Step 1: Fix ch00 — model ID (line 445)**

In `src/chapters/ch00/index.tsx`, replace:
```
需要处理超大文件?  → 考虑使用 1M context 模型 (claude-opus-4-0-20250115)
```
With:
```
需要处理超大文件?  → 考虑使用 1M context 模型 (如 claude-opus-4-5)
```

- [ ] **Step 2: Fix ch00 — next chapter reference (line 1167)**

Replace:
```
Chapter 1 — CLAUDE.md 工程</strong>。你将学习如何利用 System Prompt 的优先级系统，将项目规范写成 Claude 真正会遵守的指令。
```
With:
```
Chapter 1 — Prompt 精确控制</strong>。你将学习如何写出结构化的工程级 Prompt，掌握权重词、约束语和 Token 效率优化。
```

- [ ] **Step 3: Fix ch02 — intro text (line 232)**

Replace:
```
第 1 章我们完成了安装和配置。现在你已经有了一个能用的 Claude Code。
```
With:
```
第 1 章我们学习了 Prompt 精确控制和 Token 效率优化。现在你已经能写出结构化的工程级 Prompt。
```

- [ ] **Step 4: Fix ch06 — field count (line 459)**

Replace:
```
15 个 Frontmatter 字段速查
```
With:
```
14 个 Frontmatter 字段速查
```

- [ ] **Step 5: Fix ch05 — fabricated URLs (lines 1572-1585)**

Find the three plugin entries with `github.com/anthropics/claudekit`, `github.com/anthropics/claude-hud`, `github.com/anthropics/ralph-wiggum`. Add `（示例）` suffix to each name to clarify these are illustrative:
- `claudekit（示例）`
- `claude-hud（示例）`
- `ralph-wiggum（示例）`

- [ ] **Step 6: Fix ch09 — quality defense table (lines 166-177)**

In the code block `quality-defense-layers.md`:
- Line 166: change `(Ch3)` → `(Ch4)` (CLAUDE.md is Ch4)
- Line 168: change `(Ch4)` → `(Ch5)` (Hooks are Ch5)
- Line 177: change `(Ch4)` → `(Ch5)` (PostToolUse is Ch5)

- [ ] **Step 7: Fix ch09 — risk matrix (lines 1140, 1152, 1188)**

- Line 1140: change `'Ch4, Ch6, 9.2'` → `'Ch5, Ch6, 9.2'`
- Line 1152: change `'Ch0, Ch4, 9.5'` → `'Ch0, Ch5, 9.5'`
- Line 1188: change `'Ch4, Ch8, 9.5'` → `'Ch5, Ch8, 9.5'`

- [ ] **Step 8: Fix ch09 — training table (lines 1075, 1081, 1087)**

- Line 1075: change `Ch3 Plan Mode + Ch4 Hooks` → `Ch3 Plan Mode + Ch5 Hooks`
- Line 1081: change `Ch5 MCP + 工具集成` → `Ch7 MCP + 工具集成`
- Line 1087: change `Ch6-Ch7 测试 + Review + 上下文管理` → `Ch6 Subagent + Ch7 Agent Teams`

- [ ] **Step 9: Fix ch09 — context window reference (line 1164)**

Change `'Ch0, Ch7'` → `'Ch0'` (Ch7 is Teams+MCP, not context management).

- [ ] **Step 10: Verify and commit**

Run: `npm run build`

```bash
git add src/chapters/
git commit -m "fix: correct cross-chapter references and content errors

- ch00: fix model ID, fix next-chapter reference
- ch02: fix intro text about ch01 content
- ch05: mark fabricated plugin URLs as examples
- ch06: fix field count 15→14
- ch09: fix systematic Ch4→Ch5 for Hooks, Ch3→Ch4 for CLAUDE.md,
  Ch5→Ch7 for MCP, fix training table chapter mapping"
```

---

### Task 6: Fix ConfigExample annotation line numbers (P3)

> **Note:** Tasks 5 and 6 both modify `ch05/index.tsx` and `ch09/index.tsx`. Run sequentially, not in parallel.

**Files:**
- Modify: `src/chapters/ch01/index.tsx` (lines 510-517)
- Modify: `src/chapters/ch05/index.tsx` (lines 706-707, 1019-1026, 1537-1542)
- Modify: `src/chapters/ch08/index.tsx` (line 633)
- Modify: `src/chapters/ch09/index.tsx` (lines 743-834)

- [ ] **Step 1: Fix ch01 annotations (lines 510-517)**

```tsx
// Change these annotation line numbers:
{ line: 4, text: "context 提供背景信息..." }   // → line: 5
{ line: 14, text: "Research 阶段明确标注..." }  // → line: 15
{ line: 33, text: "NEVER/MUST 权重词..." }      // → line: 34
{ line: 39, text: "verification 模板..." }       // → line: 41
```

- [ ] **Step 2: Fix ch05 annotations — quality pipeline (lines 706-707)**

Merge two annotations about the prompt hook into one:
```tsx
// Replace these two lines:
{ line: 25, text: 'Prompt hook 不需要 matcher，Stop 事件全局触发。' },
{ line: 26, text: 'prompt 内容直接发送给 LLM 做单轮判断，消耗约 200-500 token。' },
// With single merged annotation:
{ line: 25, text: 'Prompt hook 不需要 matcher，Stop 事件全局触发。prompt 内容直接发送给 LLM 做单轮判断，消耗约 200-500 token。' },
```

- [ ] **Step 3: Fix ch05 annotations — security hooks (lines 1019-1026)**

```tsx
{ line: 36, text: 'PreCompact 确保...' }  // → line: 37
{ line: 42, text: 'Stop hook 是...' }      // → line: 43
```

- [ ] **Step 4: Fix ch05 annotations — manifest (lines 1537-1542)**

```tsx
{ line: 31, text: 'Plugin 可以包含 MCP...' }  // → line: 33
```

- [ ] **Step 5: Fix ch08 annotation — PR review (line 633)**

```tsx
{ line: 23, text: '限制工具范围...' }  // → line: 25
```

- [ ] **Step 6: Fix ch09 annotations — L2 config (line 746)**

```tsx
{ line: 34, text: 'PostToolUse Hook...' }  // → line: 33
```

- [ ] **Step 7: Fix ch09 annotations — L3 config (lines 832-834)**

```tsx
{ line: 37, text: 'PreToolUse: 文件保护...' }   // → line: 34
{ line: 48, text: 'PostToolUse: 自动测试...' }   // → line: 45
{ line: 55, text: 'Stop Hook: 最终检查...' }     // → line: 56
```

- [ ] **Step 8: Verify and commit**

Run: `npm run build`

```bash
git add src/chapters/
git commit -m "fix: correct ConfigExample annotation line numbers

15 annotations across ch01, ch05, ch08, ch09 pointed to wrong
lines (empty lines, closing brackets, or off-by-one)."
```

---

### Task 7: Code quality fixes (P4)

**Files:**
- Modify: `src/components/content/ExerciseCard.tsx` (line 55)
- Modify: `src/components/layout/Sidebar.tsx` (lines 102-103, 113, 165, 181, 185)

- [ ] **Step 1: Remove dead borderLeft in ExerciseCard.tsx**

In `src/components/content/ExerciseCard.tsx`, remove line 55:
```tsx
        borderLeft: `3px solid ${color}`,
```

Keep lines 56-58 intact (`border`, `borderLeftWidth`, `borderLeftColor`).

- [ ] **Step 2: Remove unused `started` prop in Sidebar.tsx**

Four locations to change in `src/components/layout/Sidebar.tsx`:

**a)** Line 54 — Remove `isStarted` prop from `PartGroup` call in `Sidebar`:
```tsx
              isStarted={isStarted}   // DELETE this line
```

**b)** Lines 103 and 113 — Remove `isStarted` from `PartGroupProps` interface and destructuring:
```tsx
// interface PartGroupProps — remove line 103:
  isStarted: (id: string) => boolean   // DELETE

// PartGroup destructuring — remove isStarted from line 113
```

**c)** Line 165 — Remove `started` prop from `ChapterItem` call in `PartGroup`:
```tsx
              started={isStarted(chapter.id)}   // DELETE this line
```

**d)** Line 181 — Remove `started` from `ChapterItemProps` interface:
```tsx
  started: boolean   // DELETE (already not destructured at line 185)
```

Note: `isStarted` is returned by `useProgress()` at line 13 but no longer passed anywhere — it becomes unused. Either remove it from the destructuring or keep it for future use.

- [ ] **Step 3: Verify and commit**

Run: `npm run build`

```bash
git add src/components/content/ExerciseCard.tsx src/components/layout/Sidebar.tsx
git commit -m "chore: remove dead code in ExerciseCard and Sidebar

- ExerciseCard: remove redundant borderLeft (overwritten by border shorthand)
- Sidebar: remove unused started prop threading through PartGroup/ChapterItem"
```

---

### Task 8: Fix Remotion components and add default exports

**Files:**
- Modify: All 20 files in `src/remotion/` (add `export default`)
- Modify: `src/remotion/shared/DataChart.tsx` (Zod default + guard)
- Modify: `src/remotion/shared/CodeShowcase.tsx` (Zod default)
- Modify: `src/remotion/shared/ChapterCard.tsx` (Zod defaults)
- Modify: `src/remotion/ch09/RiskMatrix.tsx` (destructure `color`)
- Modify: `src/remotion/ch07/AgentTeamsTopology.tsx` (remove `_accentColor`)
- Modify: `src/components/animation/AnimationWrapper.tsx` (loading indicator)
- Modify: `package.json` (add `zod`)

- [ ] **Step 1: Add `export default` to all 12 chapter Remotion files**

Append to each file's end:

| File | Line to add |
|------|------------|
| `src/remotion/ch00/RequestLifecycle.tsx` | `export default RequestLifecycle` |
| `src/remotion/ch00/TokenEconomy.tsx` | `export default TokenEconomy` |
| `src/remotion/ch01/PromptDissection.tsx` | `export default PromptDissection` |
| `src/remotion/ch01/PromptComparison.tsx` | `export default PromptComparison` |
| `src/remotion/ch02/VibeCodingCurve.tsx` | `export default VibeCodingCurve` |
| `src/remotion/ch03/PlanModeFlow.tsx` | `export default PlanModeFlow` |
| `src/remotion/ch04/ClaudeMdHierarchy.tsx` | `export default ClaudeMdHierarchy` |
| `src/remotion/ch05/HookEventFlow.tsx` | `export default HookEventFlow` |
| `src/remotion/ch06/SubagentFanout.tsx` | `export default SubagentFanout` |
| `src/remotion/ch07/AgentTeamsTopology.tsx` | `export default AgentTeamsTopology` |
| `src/remotion/ch08/McpArchitecture.tsx` | `export default McpArchitecture` |
| `src/remotion/ch09/RiskMatrix.tsx` | `export default RiskMatrix` |

- [ ] **Step 2: Add `export default` to all 8 shared Remotion files**

| File | Line to add |
|------|------------|
| `src/remotion/shared/ClaudeCodeIntro.tsx` | `export default ClaudeCodeIntro` |
| `src/remotion/shared/ChapterCard.tsx` | `export default ChapterCard` |
| `src/remotion/shared/CodeShowcase.tsx` | `export default CodeShowcase` |
| `src/remotion/shared/DataChart.tsx` | `export default DataChart` |
| `src/remotion/shared/EndCard.tsx` | `export default EndCard` |
| `src/remotion/shared/HelloWorld.tsx` | `export default HelloWorld` |
| `src/remotion/shared/LowerThird.tsx` | `export default LowerThird` |
| `src/remotion/shared/ProductCard.tsx` | `export default ProductCard` |

- [ ] **Step 3: Fix DataChart.tsx — add Zod default and empty guard**

In `src/remotion/shared/DataChart.tsx`, change the schema (around line 18-21):
```tsx
export const ChartSchema = z.object({
  title: z.string().default(""),
  data: z.array(DataItemSchema).default([]),
});
```

And add a guard in the `DataChart` component (around line 124):
```tsx
const maxValue = data.length > 0 ? Math.max(...data.map((d) => d.value)) : 1;
```

- [ ] **Step 4: Fix CodeShowcase.tsx — add Zod default**

In `src/remotion/shared/CodeShowcase.tsx`, change line 14:
```tsx
  code: z.string().default(""),
```

- [ ] **Step 5: Fix ChapterCard.tsx — add Zod defaults**

In `src/remotion/shared/ChapterCard.tsx`, change lines 11-12:
```tsx
  chapterNumber: z.number().default(0),
  chapterTitle: z.string().default(""),
```

- [ ] **Step 6: Fix RiskMatrix.tsx — destructure `color` prop**

In `src/remotion/ch09/RiskMatrix.tsx` line 44, change:
```tsx
const GaugeBar: React.FC<{ progress: number; color: string }> = ({ progress }) => {
```
To:
```tsx
const GaugeBar: React.FC<{ progress: number; color: string }> = ({ progress, color }) => {
```

Then use `color` in the gradient (line 67). Replace `#ef4444` with `${color}40` (the `40` suffix is hex alpha = 25% opacity):
```tsx
background: `linear-gradient(90deg, ${color}40, ${gaugeColor})`,
```

- [ ] **Step 7: Fix AgentTeamsTopology.tsx — clean up unused prop**

In `src/remotion/ch07/AgentTeamsTopology.tsx` line 48, change:
```tsx
export const AgentTeamsTopology: React.FC<Props> = ({ accentColor: _accentColor }) => {
```
To:
```tsx
export const AgentTeamsTopology: React.FC<Props> = ({ accentColor }) => {
```

Use `accentColor` for the VS divider label (the `<div>` with text "VS" between the two topology sections). The star/mesh node colors should stay hardcoded (semantic distinction is intentional). If no clear divider element exists, simply remove the `_` prefix and leave `accentColor` unused — the TypeScript compiler will warn but it's cleaner than the `_` rename pattern.

- [ ] **Step 8: Fix ClaudeCodeIntro.tsx sub-component frame timing**

In `src/remotion/shared/ClaudeCodeIntro.tsx`, the sub-components (`ScanLine`, `TerminalTyping`, `GlitchFlash`, `TitleReveal`) receive `frame={useCurrentFrame()}` from the parent's render. This gives them the **global** frame instead of the **sequence-relative** frame, causing timing mismatches (e.g., `GlitchFlash` in `<Sequence from={85}>` gets global frame 85 on first render, not 0).

Fix: Remove `frame` prop from each sub-component's JSX call (lines 322, 330, 339, 347). Have each sub-component call `useCurrentFrame()` internally at their own top level instead. Each sub-component's `frame` prop in their interface should be replaced with an internal `const frame = useCurrentFrame()`.

For each of the 4 sub-components (`ScanLine`, `TerminalTyping`, `GlitchFlash`, `TitleReveal`):
1. Remove `frame` from their props interface
2. Add `const frame = useCurrentFrame()` at top of component body
3. Remove `frame={useCurrentFrame()}` from their usage in `ClaudeCodeIntro` render

- [ ] **Step 9: Fix AnimationWrapper loading indicator**

In `src/components/animation/AnimationWrapper.tsx` line 124, change:
```tsx
background: 'var(--color-accent-glow)',
```
To:
```tsx
background: 'rgba(217, 119, 87, 0.4)',
```

- [ ] **Step 10: Add zod as direct dependency**

```bash
npm install zod
```

- [ ] **Step 11: Verify and commit**

Run: `npm run build`

```bash
git add -A
git commit -m "fix: prepare Remotion components for integration

- Add export default to all 20 Remotion components
- Fix DataChart/CodeShowcase/ChapterCard Zod defaults
- Fix RiskMatrix unused color prop
- Clean up AgentTeamsTopology accentColor
- Fix AnimationWrapper loading indicator visibility
- Add zod as direct dependency"
```

---

### Task 9: Integrate Remotion animations — Homepage + Ch00-Ch04

**Files:**
- Modify: `src/pages/HomePage.tsx` (lines 66-77)
- Modify: `src/chapters/ch00/index.tsx` (imports + 2 animation insertions)
- Modify: `src/chapters/ch01/index.tsx` (imports + 2 animation insertions)
- Modify: `src/chapters/ch02/index.tsx` (imports + replace ASCII chart)
- Modify: `src/chapters/ch03/index.tsx` (imports + 1 animation insertion)
- Modify: `src/chapters/ch04/index.tsx` (imports + 1 animation insertion)

- [ ] **Step 1: Integrate ClaudeCodeIntro on homepage**

In `src/pages/HomePage.tsx`, add imports at top:
```tsx
import { lazy } from 'react'
import { AnimationWrapper } from '../components/animation/AnimationWrapper'

const LazyClaudeCodeIntro = lazy(() => import('../remotion/shared/ClaudeCodeIntro'))
```

Replace lines 66-77 (the placeholder div) with:
```tsx
        <div className="mt-8 max-w-2xl">
          <AnimationWrapper
            component={LazyClaudeCodeIntro}
            durationInFrames={210}
            inputProps={{
              title: 'Claude Code',
              subtitle: 'AI 辅助开发能力养成系统',
              terminalCommand: 'claude',
              accentColor: '#D97757',
            }}
            fallbackText="ClaudeCodeIntro 动画加载失败"
          />
        </div>
```

- [ ] **Step 2: Integrate animations in ch00**

In `src/chapters/ch00/index.tsx`, add imports:
```tsx
import { lazy } from 'react'
import { AnimationWrapper } from '../../components/animation/AnimationWrapper'

const LazyRequestLifecycle = lazy(() => import('../../remotion/ch00/RequestLifecycle'))
const LazyTokenEconomy = lazy(() => import('../../remotion/ch00/TokenEconomy'))
```

After the section 0.1 heading `<h2>` (line 31), insert before the first `<p>`:
```tsx
        <AnimationWrapper
          component={LazyRequestLifecycle}
          durationInFrames={210}
          fallbackText="请求生命周期动画加载失败"
        />
```

Find the section about "上下文窗口经济学" or "Token 经济" and insert before its first `<p>`:
```tsx
        <AnimationWrapper
          component={LazyTokenEconomy}
          durationInFrames={180}
          fallbackText="Token 经济动画加载失败"
        />
```

- [ ] **Step 3: Integrate animations in ch01**

In `src/chapters/ch01/index.tsx`, add imports:
```tsx
import { lazy } from 'react'
import { AnimationWrapper } from '../../components/animation/AnimationWrapper'

const LazyPromptDissection = lazy(() => import('../../remotion/ch01/PromptDissection'))
const LazyPromptComparison = lazy(() => import('../../remotion/ch01/PromptComparison'))
```

After section 1.1 heading (line 29), insert:
```tsx
        <AnimationWrapper
          component={LazyPromptDissection}
          durationInFrames={210}
          fallbackText="Prompt 解剖动画加载失败"
        />
```

After section 1.2 heading "特殊权重词与结构化技巧" (line 282), insert:
```tsx
        <AnimationWrapper
          component={LazyPromptComparison}
          durationInFrames={180}
          fallbackText="Prompt 对比动画加载失败"
        />
```

- [ ] **Step 4: Integrate animation in ch02 (replace ASCII chart)**

In `src/chapters/ch02/index.tsx`, add imports:
```tsx
import { lazy } from 'react'
import { AnimationWrapper } from '../../components/animation/AnimationWrapper'

const LazyVibeCodingCurve = lazy(() => import('../../remotion/ch02/VibeCodingCurve'))
```

Find the ASCII chart `<pre>` block (around lines 490-520). Replace the entire chart container `<div>` with:
```tsx
        <AnimationWrapper
          component={LazyVibeCodingCurve}
          durationInFrames={180}
          fallbackText="Vibe Coding 曲线动画加载失败"
        />
```

- [ ] **Step 5: Integrate animation in ch03**

In `src/chapters/ch03/index.tsx`, add imports:
```tsx
import { lazy } from 'react'
import { AnimationWrapper } from '../../components/animation/AnimationWrapper'

const LazyPlanModeFlow = lazy(() => import('../../remotion/ch03/PlanModeFlow'))
```

After section 3.2 heading (line 221), insert:
```tsx
        <AnimationWrapper
          component={LazyPlanModeFlow}
          durationInFrames={180}
          fallbackText="Plan Mode 流程动画加载失败"
        />
```

- [ ] **Step 6: Integrate animation in ch04**

In `src/chapters/ch04/index.tsx`, add imports:
```tsx
import { lazy } from 'react'
import { AnimationWrapper } from '../../components/animation/AnimationWrapper'

const LazyClaudeMdHierarchy = lazy(() => import('../../remotion/ch04/ClaudeMdHierarchy'))
```

After section 4.1 heading (line 55), insert:
```tsx
        <AnimationWrapper
          component={LazyClaudeMdHierarchy}
          durationInFrames={180}
          fallbackText="CLAUDE.md 层级动画加载失败"
        />
```

- [ ] **Step 7: Verify and commit**

Run: `npm run build`
Open homepage and ch00-ch04 in browser to verify animations load.

```bash
git add src/pages/HomePage.tsx src/chapters/ch00/ src/chapters/ch01/ src/chapters/ch02/ src/chapters/ch03/ src/chapters/ch04/
git commit -m "feat: integrate Remotion animations into homepage and ch00-ch04

Wire up ClaudeCodeIntro, RequestLifecycle, TokenEconomy,
PromptDissection, PromptComparison, VibeCodingCurve,
PlanModeFlow, ClaudeMdHierarchy via lazy imports."
```

---

### Task 10: Integrate Remotion animations — Ch05-Ch09

**Files:**
- Modify: `src/chapters/ch05/index.tsx`
- Modify: `src/chapters/ch06/index.tsx`
- Modify: `src/chapters/ch07/index.tsx`
- Modify: `src/chapters/ch08/index.tsx`
- Modify: `src/chapters/ch09/index.tsx`

- [ ] **Step 1: Integrate animation in ch05**

Add imports:
```tsx
import { lazy } from 'react'
import { AnimationWrapper } from '../../components/animation/AnimationWrapper'

const LazyHookEventFlow = lazy(() => import('../../remotion/ch05/HookEventFlow'))
```

After section 5.1 heading (line 134), insert:
```tsx
        <AnimationWrapper
          component={LazyHookEventFlow}
          durationInFrames={210}
          fallbackText="Hook 事件流动画加载失败"
        />
```

- [ ] **Step 2: Integrate animation in ch06**

Add imports:
```tsx
import { lazy } from 'react'
import { AnimationWrapper } from '../../components/animation/AnimationWrapper'

const LazySubagentFanout = lazy(() => import('../../remotion/ch06/SubagentFanout'))
```

After section 6.1 heading (line 143), insert:
```tsx
        <AnimationWrapper
          component={LazySubagentFanout}
          durationInFrames={180}
          fallbackText="Subagent 扇出动画加载失败"
        />
```

- [ ] **Step 3: Integrate animation in ch07**

Add imports:
```tsx
import { lazy } from 'react'
import { AnimationWrapper } from '../../components/animation/AnimationWrapper'

const LazyAgentTeamsTopology = lazy(() => import('../../remotion/ch07/AgentTeamsTopology'))
```

After section 7.1 heading (line 132), insert:
```tsx
        <AnimationWrapper
          component={LazyAgentTeamsTopology}
          durationInFrames={180}
          fallbackText="Agent Teams 拓扑动画加载失败"
        />
```

- [ ] **Step 4: Integrate animation in ch08**

Add imports:
```tsx
import { lazy } from 'react'
import { AnimationWrapper } from '../../components/animation/AnimationWrapper'

const LazyMcpArchitecture = lazy(() => import('../../remotion/ch08/McpArchitecture'))
```

After section 8.1 heading "社区方法论深度拆解" (line 120) — this is the first section and the best general location for the architecture animation. Insert:
```tsx
        <AnimationWrapper
          component={LazyMcpArchitecture}
          durationInFrames={180}
          fallbackText="MCP 架构动画加载失败"
        />
```

- [ ] **Step 5: Integrate animation in ch09**

Add imports:
```tsx
import { lazy } from 'react'
import { AnimationWrapper } from '../../components/animation/AnimationWrapper'

const LazyRiskMatrix = lazy(() => import('../../remotion/ch09/RiskMatrix'))
```

After section 9.7 heading (line 1105), insert:
```tsx
        <AnimationWrapper
          component={LazyRiskMatrix}
          durationInFrames={210}
          fallbackText="风险矩阵动画加载失败"
        />
```

- [ ] **Step 6: Verify and commit**

Run: `npm run build`
Open ch05-ch09 in browser to verify animations load.

```bash
git add src/chapters/ch05/ src/chapters/ch06/ src/chapters/ch07/ src/chapters/ch08/ src/chapters/ch09/
git commit -m "feat: integrate Remotion animations into ch05-ch09

Wire up HookEventFlow, SubagentFanout, AgentTeamsTopology,
McpArchitecture, RiskMatrix via lazy imports."
```

---

### Task 11: Final verification

- [ ] **Step 1: Full build check**

```bash
npm run build
```

- [ ] **Step 2: Visual verification checklist**

Open `http://localhost:5174/` and check:
- [ ] Sidebar shows P0-P4 navigation with chapters
- [ ] Homepage shows 10 chapter cards (visible, clickable)
- [ ] Homepage hero shows ClaudeCodeIntro animation (not placeholder text)
- [ ] No fake search box in header
- [ ] Navigate to `/nonexistent/path` → redirects to homepage
- [ ] Navigate to ch00 → RequestLifecycle animation visible
- [ ] Navigate to ch05 → HookEventFlow animation visible
- [ ] Navigate to ch09 → RiskMatrix animation visible
- [ ] Theme toggle works without flash on page load
- [ ] No console errors on any page

- [ ] **Step 3: Final commit if any adjustments needed**
