# Tutorial Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the 11-chapter Claude Code tutorial from a feature manual to a capability-building system by adding failure-driven narratives, judgment-building content, and verification standards to each chapter.

**Architecture:** Each chapter gets the same four-stage treatment (failure opening, diagnosis, Harness response, verification). Content changes are JSX edits to existing React component files. New reusable components (DecisionTree data, industry data) are created as shared modules. No new chapters — all improvements are within the existing 11-chapter structure.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, Remotion (animations), existing component library (CodeBlock, QualityCallout, ExerciseCard, DecisionTree, ConfigExample, PromptCompare, ReferenceSection)

**Spec:** `docs/superpowers/specs/2026-03-30-tutorial-redesign.md`

---

## File Map

### New Files
- `src/data/industry-stats.ts` — Centralized industry statistics (adoption rates, error rates, Gartner forecasts)
- `src/data/harness-decision-trees.ts` — Reusable decision tree data (Skill vs Hook vs CLAUDE.md, diagnostic framework, subagent ROI)

### Modified Files
- `src/chapters/ch03/index.tsx` — DemoAPI naming + preview table + risk data
- `src/chapters/ch04/index.tsx` — Failure opening + DemoAPI comparison + Auto Memory expansion + verification
- `src/chapters/ch06/index.tsx` — Failure opening + decision tree + troubleshooting
- `src/chapters/ch07/index.tsx` — Auto Mode section + 5 core events + agent handler example + verification
- `src/chapters/ch09/index.tsx` — Restructure + failure opening + CLI script + SDK example + CI/CD migration + safety
- `src/chapters/ch08/index.tsx` — Failure experiment + Agent Teams + Worktree + long-running agents + ROI
- `src/chapters/ch10/index.tsx` — Rewrite core: retrospective + diagnostic framework + design method
- `src/chapters/ch11/index.tsx` — Failure scenario + rollout roadmap + cost governance + incident response
- `src/chapters/ch01/index.tsx` — Auto Mode row + Harness loop intro + audience positioning + token updates
- `src/chapters/ch02/index.tsx` — Audience positioning paragraph
- `src/chapters/ch05/index.tsx` — DemoAPI connection + failure recovery section
- `src/data/toc.ts` — Update chapter subtitles and estimated times
- `src/pages/HomePage.tsx` — Update Harness Engineering messaging

---

## Phase 0: Prerequisite — Ch03 DemoAPI Naming

### Task 1: Ch03 — Name the API and add preview table

**Files:**
- Modify: `src/chapters/ch03/index.tsx:208-241` (header) and `src/chapters/ch03/index.tsx:1405-1461` (before closing)

- [ ] **Step 1: Read current Ch03 header and ending**

Read `src/chapters/ch03/index.tsx` lines 208-260 (header + intro) and lines 1390-1461 (last section + closing).

- [ ] **Step 2: Update chapter header intro**

In the `<header>` section (line 233-240), modify the intro paragraph to:
1. Name the API as **DemoAPI**
2. Add Agentic Engineering positioning for readers with AI experience
3. State that this project continues through Part 2

Replace the `<p>` at lines 233-240 with:

```tsx
        <p
          className="text-lg leading-relaxed max-w-3xl"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          如果你在 Cursor 或 Copilot 中经历过"写到后面越来越乱"，那就是 Vibe Coding 退化。
          Andrej Karpathy 在 2026 年 2 月将这个问题的解决方案命名为{' '}
          <strong style={{ color: 'var(--color-text-primary)' }}>Agentic Engineering</strong> —
          人负责架构决策，AI 负责实现。这一章我们用一个真实的 Express API 项目（我们叫它{' '}
          <strong style={{ color: 'var(--color-accent)' }}>DemoAPI</strong>）来系统体验退化的过程，
          并建立从 Vibe Coding 到精确控制的完整认知。
          <strong style={{ color: 'var(--color-text-primary)' }}> 这个项目将贯穿 Part 2（Ch04-07），
          你接下来会用 Harness Engineering 逐步修复它的所有问题。</strong>
        </p>
```

- [ ] **Step 3: Update section 3.1 intro**

At line 257-259 (section 3.1 intro paragraph), prepend the DemoAPI name:

```tsx
        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          让我们做一个实验：从零开始，用纯 Vibe Coding（只描述想要什么，不给任何技术约束）构建一个
          Express REST API —— 我们叫它 <strong style={{ color: 'var(--color-accent)' }}>DemoAPI</strong>。
          我们逐轮观察代码质量的变化。
        </p>
```

- [ ] **Step 4: Add industry risk data to the QualityCallout**

At line 500-513 (the "理解债务" QualityCallout), add industry data after the existing content. Insert before the closing `</QualityCallout>`:

```tsx
          <p className="mt-2">
            行业数据支撑这个结论：AI 生成的代码比人工编写的代码平均多{' '}
            <strong style={{ color: 'var(--color-text-primary)' }}>1.75 倍逻辑错误</strong>，
            <strong style={{ color: 'var(--color-text-primary)' }}>45%</strong> 含有安全漏洞（OWASP 标准），
            代码流转率高出 <strong style={{ color: 'var(--color-text-primary)' }}>41%</strong>。
            这不是说 AI 不好用 —— 而是说不加控制的 AI 是危险的。
          </p>
```

- [ ] **Step 5: Add Harness preview table before closing**

Before the last closing `</div>` (line 1461), insert a new section with a preview table mapping each Ch03 pain point to its Harness solution:

```tsx
      {/* ═══════════════════════════════════════════════
          Preview: Harness Components That Solve These Problems
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          接下来：用 Harness Engineering 修复 DemoAPI
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          你刚才体验的每一个问题，都对应一个 Harness 组件的解决方案。
          从下一章开始，我们会用同一个 DemoAPI 项目，逐步构建完整的 Harness：
        </p>

        <div
          className="rounded-lg overflow-hidden"
          style={{ border: '1px solid var(--color-border)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--color-bg-secondary)' }}>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>DemoAPI 的问题</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>Harness 组件</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>在哪章学</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--color-text-secondary)' }}>
              <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                <td className="px-4 py-3">响应格式不一致、ID 策略混乱</td>
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>CLAUDE.md</td>
                <td className="px-4 py-3 font-mono" style={{ color: 'var(--color-accent)' }}>Ch04</td>
              </tr>
              <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                <td className="px-4 py-3">复杂功能（如认证）做到一半方向偏了</td>
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>Plan Mode</td>
                <td className="px-4 py-3 font-mono" style={{ color: 'var(--color-accent)' }}>Ch05</td>
              </tr>
              <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                <td className="px-4 py-3">每次部署/测试都要重复描述步骤</td>
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>Skills</td>
                <td className="px-4 py-3 font-mono" style={{ color: 'var(--color-accent)' }}>Ch06</td>
              </tr>
              <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                <td className="px-4 py-3">长对话中 Claude 忘了跑 lint 和测试</td>
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>Hooks</td>
                <td className="px-4 py-3 font-mono" style={{ color: 'var(--color-accent)' }}>Ch07</td>
              </tr>
            </tbody>
          </table>
        </div>

        <QualityCallout title="Harness Engineering 循环">
          <p>
            你即将在每一章经历同一个循环：
            <strong style={{ color: 'var(--color-text-primary)' }}>观察失败 → 诊断根因 → 构建 Harness 响应 → 验证有效</strong>。
            这不只是学功能 —— 这是 Harness Engineering 的核心方法论。
          </p>
        </QualityCallout>
      </section>
```

- [ ] **Step 6: Build and verify**

Run: `cd /Users/panghu/code/rsearch/claude_study && npm run build`
Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 7: Commit**

```bash
git add src/chapters/ch03/index.tsx
git commit -m "content(ch03): name API as DemoAPI, add Agentic Engineering framing and Harness preview table"
```

---

## Phase 1: P0 — Core Chapter Depth

### Task 2: Ch04 — Failure opening + DemoAPI comparison + verification standards

**Files:**
- Modify: `src/chapters/ch04/index.tsx:20-54` (header), `:54-60` (after header), `:455-639` (Auto Memory + end)

- [ ] **Step 1: Read current Ch04 structure**

Read `src/chapters/ch04/index.tsx` fully to understand current content and identify exact insertion points.

- [ ] **Step 2: Add failure scenario after header**

After the `</header>` tag (line 54), before section 4.1, insert a new "failure" section. This section shows two terminal sessions — yesterday's session where you taught Claude the project conventions, and today's session where Claude forgot everything:

```tsx
      {/* ═══════════════════════════════════════════════
          Failure Scenario: Session Amnesia
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <div
          className="p-5 rounded-lg"
          style={{
            background: 'rgba(248, 113, 113, 0.06)',
            border: '1px solid rgba(248, 113, 113, 0.25)',
          }}
        >
          <p
            className="text-base font-semibold mb-3"
            style={{ color: '#f87171' }}
          >
            你是否遇到过这个场景？
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            昨天你花了 30 分钟教 Claude 项目的规范：统一响应格式用{' '}
            <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>{`{data, error}`}</code>、
            文件放 <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>src/routes/</code>、
            ID 用自增数字。Claude 执行得很好。
            今天你开了新会话，让 Claude 加一个功能 —— 它用了{' '}
            <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>{`{success, result}`}</code> 响应格式，
            文件放到了根目录，ID 变成了 UUID。
            <strong style={{ color: 'var(--color-text-primary)' }}>它全忘了。</strong>
          </p>
        </div>

        <CodeBlock
          language="bash"
          title="昨天的 session vs 今天的 session"
          code={`# 昨天 (Session A) — 你花 30 分钟教了规范
> 加一个帖子功能
✓ 响应格式: { data: post, error: null }
✓ 文件位置: src/routes/posts.ts
✓ ID 策略: 自增数字 (nextId++)

# 今天 (Session B) — 全忘了
> 加一个评论功能
✗ 响应格式: { success: true, result: comment }  ← 变了
✗ 文件位置: ./comments.ts                       ← 变了
✗ ID 策略: crypto.randomUUID()                  ← 变了`}
        />

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          这就是 <strong style={{ color: 'var(--color-text-primary)' }}>session 失忆</strong> —— Claude Code 的每个新会话都是一张白纸。
          它不记得你昨天教过什么，不记得你的项目规范，不记得你们踩过的坑。
          如果你在 Ch03 的 DemoAPI 实验中体验过风格漂移，这就是根因之一。
        </p>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <strong style={{ color: 'var(--color-text-primary)' }}>CLAUDE.md 就是解决这个问题的。</strong>
          它是一个文件 —— 每次新会话启动时自动注入到上下文开头 —— 让 Claude 从你定义的起点开始，而不是从零开始。
        </p>
      </section>
```

- [ ] **Step 3: Add DemoAPI before/after comparison section**

After section 4.1 (quick start), before section 4.2, insert a new section showing the DemoAPI with and without CLAUDE.md. Use the same prompts from Ch03 ("加帖子功能", "加评论功能") and show:
- WITHOUT CLAUDE.md: the Ch03 style drift (reference Ch03's round 3-4 code)
- WITH CLAUDE.md: consistent output using the template from 4.1

This section should include:
1. A CodeBlock showing the CLAUDE.md written for DemoAPI
2. A CodeBlock showing Claude's output WITH the CLAUDE.md (consistent format)
3. A comparison table (before vs after) similar to Ch03's inconsistency table

- [ ] **Step 4: Expand Auto Memory section**

Expand the existing section 4.4 (Auto Memory, starting at line 455) with:
1. Four memory types (user/feedback/project/reference) with concrete examples for each
2. "What's worth remembering" checklist: surprising corrections, validated approaches, external references
3. "What's NOT worth remembering" list: code patterns (derivable), git history (use git log), debugging solutions (fix is in code)

- [ ] **Step 5: Add team collaboration section**

After Auto Memory, add section "4.5 团队协作维护 CLAUDE.md":
1. Version control: CLAUDE.md in git, changes go through PR review
2. Signal-to-noise audit process: every quarter, line-by-line review with "删掉这行 Claude 会出错吗?"
3. `managed-settings.d/` directory for organizational policy fragments

- [ ] **Step 6: Add verification section**

Before the closing `</div>`, add verification section "4.6 验证：你的 CLAUDE.md 够好吗？":
1. Quality check: same prompt 3 times → verify (a) response format consistent (b) file naming consistent (c) ID strategy consistent
2. Trim threshold: > 60 lines → mandatory audit
3. Troubleshooting tree: Claude ignores rule → check priority hierarchy → check context usage (`/context`) → check keyword weight level (MUST > should)
4. ExerciseCard: write a CLAUDE.md for your own project and test it with the 3-run consistency check

- [ ] **Step 7: Build and verify**

Run: `cd /Users/panghu/code/rsearch/claude_study && npm run build`
Expected: Build succeeds.

- [ ] **Step 8: Commit**

```bash
git add src/chapters/ch04/index.tsx
git commit -m "content(ch04): add failure opening, DemoAPI comparison, Auto Memory expansion, team collab, verification standards"
```

---

### Task 3: Ch06 — Failure opening + Skill/Hook/CLAUDE.md decision tree + troubleshooting

**Files:**
- Modify: `src/chapters/ch06/index.tsx:15-49` (header), after header, before closing
- Reference: `src/data/harness-decision-trees.ts` (create if not exists)

- [ ] **Step 1: Read current Ch06 structure**

Read `src/chapters/ch06/index.tsx` fully.

- [ ] **Step 2: Create shared decision tree data file**

Create `src/data/harness-decision-trees.ts` with the Skill vs Hook vs CLAUDE.md decision tree:

```typescript
import type { TreeNode } from '../components/content/DecisionTree'

export const skillHookClaudemdTree: TreeNode = {
  id: 'root',
  question: '你想让 Claude 遵循的规则属于哪种类型？',
  description: '根据规则的性质选择最合适的 Harness 组件。',
  children: [
    {
      label: '偏好或建议（"应该这样做"）',
      node: {
        id: 'preference',
        question: '这个偏好需要 100% 遵守吗？',
        children: [
          {
            label: '不需要，大部分时候遵守就行',
            node: {
              id: 'claudemd',
              question: '推荐：CLAUDE.md',
              result: {
                text: '写在 CLAUDE.md 中。用 MUST/NEVER 权重词提高遵守率。但注意：CLAUDE.md 是偏好，不是保障 — 在长上下文中可能被忽略。',
                tier: 'l1',
              },
            },
          },
          {
            label: '必须 100% 遵守，零容忍',
            node: {
              id: 'hook-enforce',
              question: '推荐：Hook（command handler）',
              result: {
                text: '用 PreToolUse 或 PostToolUse Hook 做确定性检查。Hook 在模型外部执行，不受上下文衰减影响，遵守率 100%。',
                tier: 'l2',
              },
            },
          },
        ],
      },
    },
    {
      label: '必须执行的检查（"每次都要做"）',
      node: {
        id: 'check',
        question: '推荐：Hook',
        result: {
          text: '自动化检查用 Hook。格式化用 command handler（零 token），lint/测试用 agent handler（可自动修复）。在 Ch07 详细学习。',
          tier: 'l2',
        },
        description: '适用：format、lint、test、安全扫描、commit message 规范检查。',
      },
    },
    {
      label: '可复用的多步骤工作流（"每次部署都要做这 5 步"）',
      node: {
        id: 'workflow',
        question: '这个工作流需要人触发还是自动触发？',
        children: [
          {
            label: '人触发（/deploy、/review 等）',
            node: {
              id: 'skill-manual',
              question: '推荐：Skill（user-invocable: true）',
              result: {
                text: '写一个 SKILL.md，设置 user-invocable: true。用户输入 /deploy 时触发。Skill 可以包含多步骤指令、工具限制、effort 级别。',
                tier: 'l2',
              },
            },
          },
          {
            label: '自动触发（检测到特定模式时）',
            node: {
              id: 'skill-auto',
              question: '推荐：Skill（user-invocable: false）',
              result: {
                text: '写一个 SKILL.md，设置 user-invocable: false，用 description 字段精确描述触发条件。Claude 在匹配到相关任务时自动加载。注意：description 太宽会误触发。',
                tier: 'l3',
              },
            },
          },
        ],
      },
    },
  ],
}
```

- [ ] **Step 3: Update Ch06 header with failure opening**

Replace Ch06's `<header>` intro paragraph (lines ~40-48) with the failure scenario about repeatedly writing deployment prompts with inconsistent steps. Then after `</header>`, add a diagnosis section explaining why this happens (no persistent workflows = every session reinvents the process).

- [ ] **Step 4: Add Skill vs Hook vs CLAUDE.md decision tree**

After section 6.1 (what are Skills), before section 6.2 (writing your first Skill), insert a new section "何时用 Skill？" that imports and renders the `skillHookClaudemdTree` DecisionTree.

```tsx
import { skillHookClaudemdTree } from '../../data/harness-decision-trees'

// ... in the component:
        <DecisionTree
          root={skillHookClaudemdTree}
          title="Skill vs Hook vs CLAUDE.md：三选一决策指南"
        />
```

- [ ] **Step 5: Add troubleshooting section**

Before the closing `</div>`, add a verification/troubleshooting section:
1. Skill trigger accuracy: track false positives (triggered when shouldn't) and false negatives (didn't trigger when should)
2. Troubleshooting tree: Skill doesn't trigger → check description wording → check scope (global/project/plugin) → check `!command` output (run manually) → check `$ARGUMENTS` substitution order
3. ExerciseCard: write a Skill for a common workflow in your project, test triggering it 5 times, track accuracy

- [ ] **Step 6: Build and verify**

Run: `cd /Users/panghu/code/rsearch/claude_study && npm run build`
Expected: Build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/data/harness-decision-trees.ts src/chapters/ch06/index.tsx
git commit -m "content(ch06): add failure opening, Skill/Hook/CLAUDE.md decision tree, troubleshooting section"
```

---

### Task 4: Ch07 — Auto Mode section + core events + agent handler example + verification

**Files:**
- Modify: `src/chapters/ch07/index.tsx:583-586` (between 7.2 and 7.3), near end

- [ ] **Step 1: Read current Ch07 sections 7.2 and 7.3**

Read `src/chapters/ch07/index.tsx` lines 580-700 to understand the boundary between 7.2 and 7.3, and the content of 7.3.

- [ ] **Step 2: Add Auto Mode section**

Between section 7.2 (quality pipeline) and 7.3 (handler decision tree), insert a new section about Auto Mode. Position it as: "Hooks are your custom quality checks. Auto Mode is Claude's built-in safety classifier — a complementary layer."

Content:
1. How it works: separate Sonnet/Opus classifier reviews each action before execution
2. What it approves: 93% of permission requests (routine file reads, standard edits)
3. What it blocks: actions beyond task scope, unrecognized infrastructure, destructive operations
4. When to enable: non-sensitive tasks where you trust the project's deny rules and hooks
5. When NOT to enable: unfamiliar codebases, security-sensitive operations, production infrastructure
6. How to enable: Team plan admin setting, `/auto-mode` command

- [ ] **Step 3: Add 5 core events deep-dive**

In the existing Hook events coverage, ensure these 5 events are taught deeply with examples:
1. **PreToolUse** — before a tool runs (already covered well)
2. **PostToolUse** — after a tool runs (already covered well)
3. **Stop** — when Claude thinks it's done (already covered)
4. **SessionStart** — when a new session begins (add: useful for environment validation, context priming)
5. **PostCompact** — after context compaction (add: useful for saving key decisions that would be lost)

For the remaining 16+ events, add a collapsed ReferenceSection with a simple table listing event name, trigger, and one-line use case.

- [ ] **Step 4: Add complete agent handler example**

In the handler type section, add a full working agent handler example. Show the settings.json config and explain what happens:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "type": "agent",
        "agent": {
          "prompt": "Review the file that was just modified. Check: 1) Does it follow the project's TypeScript strict mode? 2) Are there any obvious security issues (SQL injection, XSS, hardcoded secrets)? 3) Does it have proper error handling? Report issues found, or say 'No issues found' if clean.",
          "model": "haiku",
          "maxTurns": 5
        }
      }
    ]
  }
}
```

- [ ] **Step 5: Add verification section**

Add "7.4 验证：你的 Hook 有效吗？" section:
1. Hook effectiveness metric: interception rate 1%-20% is healthy. >20% = too strict (Claude wasting effort on blocked actions). <1% = too loose (might as well not have hooks).
2. Emergency bypass: `--no-hooks` flag to temporarily disable all hooks when a hook misbehaves. Always fix the hook afterward.
3. Troubleshooting: Hook incorrectly blocks → check matcher pattern → check exit code logic → test with `echo '{}' | your-hook-script.sh` → check if "most strict wins" is causing unexpected denials

- [ ] **Step 6: Build and verify**

Run: `cd /Users/panghu/code/rsearch/claude_study && npm run build`
Expected: Build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/chapters/ch07/index.tsx
git commit -m "content(ch07): add Auto Mode section, 5 core events deep-dive, agent handler example, verification standards"
```

---

### Task 5: Ch09 — Restructure with failure opening, CLI script, SDK example, CI/CD, safety

**Files:**
- Modify: `src/chapters/ch09/index.tsx` (restructure)
- Reference: `src/chapters/ch10/index.tsx` (migrate CI/CD content)

- [ ] **Step 1: Read current Ch09 and Ch10 CI/CD section**

Read `src/chapters/ch09/index.tsx` fully (1582 lines).
Read `src/chapters/ch10/index.tsx` lines 345-593 (section 10.3 which contains the CI/CD example).

- [ ] **Step 2: Add failure opening after header**

After `</header>` (line 129), insert failure scenario:

```tsx
      {/* ═══ Failure Scenario ═══ */}
      <section className="space-y-6">
        <div
          className="p-5 rounded-lg"
          style={{
            background: 'rgba(248, 113, 113, 0.06)',
            border: '1px solid rgba(248, 113, 113, 0.25)',
          }}
        >
          <p className="text-base font-semibold mb-3" style={{ color: '#f87171' }}>
            你是否遇到过这个场景？
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            每次手动让 Claude 做 code review 要 10 分钟。一天 20 个 PR 就是 3 小时。
            你度假了一周，回来发现 PR 堆积 —— 因为整个流程依赖你坐在终端前。
            <strong style={{ color: 'var(--color-text-primary)' }}>
              如果 Claude 能自己在 CI/CD 中跑起来呢？
            </strong>
          </p>
        </div>
      </section>
```

- [ ] **Step 3: Add batch CLI script to section 9.2**

In the existing CLI section (around line 245), after the basic `claude -p` examples, add a complete, runnable batch script:

```tsx
        <CodeBlock
          language="bash"
          title="batch-todo-scan.sh — 批量扫描仓库 TODO 生成报告"
          code={`#!/bin/bash
# 用 Claude CLI 扫描所有 TODO/FIXME 并生成优先级报告
set -euo pipefail

REPO_DIR="\${1:-.}"
OUTPUT="todo-report-$(date +%Y%m%d).md"

claude -p "Scan all files in $REPO_DIR for TODO, FIXME, HACK comments. \\
For each one, rate priority (P0-P3) based on: \\
- P0: Security or data loss risk \\
- P1: Bug or incorrect behavior \\
- P2: Technical debt affecting velocity \\
- P3: Nice to have \\
Output as a markdown table with columns: File, Line, Priority, Description" \\
  --allowedTools "Read,Grep,Glob" \\
  --output-format text \\
  --max-turns 20 \\
  --bare > "$OUTPUT"

echo "Report saved to $OUTPUT"
echo "Found $(grep -c '|' "$OUTPUT" || echo 0) items"`}
        />
```

- [ ] **Step 4: Add Python SDK minimal example to section 9.3**

In or after the existing SDK section, add a minimal Python PR review bot:

```tsx
        <CodeBlock
          language="python"
          title="pr_review_bot.py — 最小 PR Review Bot（Python SDK）"
          code={`"""最小可运行的 PR Review Bot — 不是完整 SDK 教程，
完整文档见 platform.claude.com/docs/en/agent-sdk/overview"""

from claude_agent_sdk import AgentClient
import subprocess, json, sys

def review_pr(pr_number: int) -> str:
    # 1. 获取 PR diff
    diff = subprocess.check_output(
        ["gh", "pr", "diff", str(pr_number)],
        text=True
    )

    # 2. 用 Claude 分析
    client = AgentClient()
    result = client.run(
        prompt=f"""Review this PR diff. Check for:
1. Logic errors or bugs
2. Security issues (injection, auth bypass, secrets)
3. Style inconsistencies with project conventions

Be concise. Only report real issues, not style nitpicks.

<diff>
{diff[:50000]}  # 限制长度避免超 token
</diff>""",
        allowed_tools=["Read", "Grep"],
        max_turns=10,
    )

    return result.text

if __name__ == "__main__":
    pr = int(sys.argv[1])
    review = review_pr(pr)
    # 3. 评论到 PR
    subprocess.run(
        ["gh", "pr", "comment", str(pr), "--body", review],
        check=True
    )
    print(f"Review posted to PR #{pr}")`}
        />

        <QualityCallout>
          <p>
            这不是完整的 SDK 教程 —— 完整文档见{' '}
            <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>
              platform.claude.com/docs/en/agent-sdk/overview
            </code>。
            这个示例的目的是让你在 5 分钟内评估：SDK 能做什么？适不适合我的场景？
          </p>
        </QualityCallout>
```

- [ ] **Step 5: Migrate CI/CD content from Ch10 and expand**

Copy the GitHub Actions workflow from Ch10 section 10.3 into Ch09 as a new "9.4 CI/CD 集成" section. Expand with:
1. Complete `claude-review.yml` workflow file
2. Secrets management (`ANTHROPIC_API_KEY` in GitHub Secrets)
3. Timeout configuration (`timeout-minutes: 10`)
4. Cost limiting (`--max-turns 15`)
5. Status check integration

- [ ] **Step 6: Add unattended safety section**

Add "9.6 无人值守安全" section with three key safeguards:

```tsx
        <CodeBlock
          language="bash"
          title="三道安全闸"
          code={`# 1. 超时熔断 — 防止无限循环
claude -p "..." --max-turns 15    # 最多 15 轮工具调用

# 2. 预算上限 — 防止成本失控
# 在 CI 中设置环境变量
export CLAUDE_MAX_COST_CENTS=500  # 单次调用不超过 $5

# 3. 凭证清洗 — 防止泄露 secrets
export CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1
# Claude 的子进程不会继承 .env 中的敏感变量`}
        />
```

- [ ] **Step 7: Add verification section**

Add verification section:
1. Quality standard: CI integration should achieve 100% PR review coverage, <5min average response
2. Troubleshooting: CI timeout → check `--max-turns` → check diff size (large PRs need more turns) → try `--bare` mode (skip initialization, ~14% faster)

- [ ] **Step 8: Build and verify**

Run: `cd /Users/panghu/code/rsearch/claude_study && npm run build`
Expected: Build succeeds.

- [ ] **Step 9: Commit**

```bash
git add src/chapters/ch09/index.tsx
git commit -m "content(ch09): restructure with failure opening, CLI batch script, Python SDK example, CI/CD integration, safety section"
```

---

## Phase 2: P1 — Weak Chapters + Light Updates

### Task 6: Ch08 — Agent Teams + Worktree + long-running agents + ROI

**Files:**
- Modify: `src/chapters/ch08/index.tsx`

- [ ] **Step 1: Read current Ch08**

Read `src/chapters/ch08/index.tsx` fully (1660 lines).

- [ ] **Step 2: Add failure experiment opening**

After header, add a reproducible experiment: in a long session (context > 70%), repeat an early precise instruction and compare output quality. Reference the 70% degradation threshold from Ch01.

- [ ] **Step 3: Expand each built-in subagent type**

For Explore, Plan, and General-purpose types, add:
- Complete invocation code (Agent tool call with all parameters)
- Example return result (what the summary looks like)
- Cost estimate (approximate token usage)

- [ ] **Step 4: Add Worktree isolation section**

New section covering:
- What `isolation: "worktree"` does: creates a real git worktree on disk
- File visibility: worktree sees the full repo at the branch point
- Merge strategy: if agent makes changes, worktree path and branch are returned
- Complete example with code

- [ ] **Step 5: Expand Agent Teams to full section**

From the current brief mention, expand to cover:
- Shared task list (TaskCreate/TaskUpdate)
- Cross-agent messaging (SendMessage)
- Topology decision tree: fan-out (independent tasks), chain (sequential), collaborative (shared state)

- [ ] **Step 6: Add long-running agent patterns**

Brief section on Anthropic's Initializer + Coding Agent pattern:
- `claude-progress.txt` for incremental state saving
- Mention GAN three-agent architecture with link to Anthropic blog post (don't deep-dive)

- [ ] **Step 7: Add ROI verification section**

- ROI decision tree: task < 2min → do directly; > 5min and splittable → use subagents
- Worked ROI example: "RBAC refactor: single session ~45K tokens, 3 subagents ~52K tokens (1.15x), but higher quality due to fresh context per agent"
- Troubleshooting: low quality results → check prompt context sufficiency → check maxTurns → check model selection

- [ ] **Step 8: Build, verify, commit**

```bash
npm run build
git add src/chapters/ch08/index.tsx
git commit -m "content(ch08): add failure experiment, Agent Teams, Worktree isolation, long-running patterns, ROI verification"
```

---

### Task 7: Ch10 — Rewrite core to retrospective + diagnostic framework

**Files:**
- Modify: `src/chapters/ch10/index.tsx` (major rewrite)
- Modify: `src/data/harness-decision-trees.ts` (add diagnostic tree)

- [ ] **Step 1: Read current Ch10**

Read `src/chapters/ch10/index.tsx` fully (695 lines).

- [ ] **Step 2: Add diagnostic framework tree to shared data**

Add to `src/data/harness-decision-trees.ts`:

```typescript
export const diagnosticTree: TreeNode = {
  id: 'root',
  question: 'Claude 的表现哪里不对？',
  description: '按症状定位问题，选择对应的 Harness 组件修复。',
  children: [
    {
      label: '忽略了项目规范（风格、命名、格式）',
      node: {
        id: 'norms',
        question: '当前上下文占用率是多少？（用 /context 检查）',
        children: [
          {
            label: '> 70%',
            node: {
              id: 'context-high',
              question: '上下文衰减',
              result: {
                text: '上下文过满导致早期指令被稀释。解决：/compact 并指定保留关键规则，或拆分为新 session。如果频繁发生，考虑用子代理隔离重查询（Ch08）。',
                tier: 'l2',
              },
            },
          },
          {
            label: '< 70%',
            node: {
              id: 'weak-rule',
              question: '规则措辞太弱',
              result: {
                text: 'CLAUDE.md 中的规则权重不够。升级措辞："should" → "MUST"，"prefer" → "ALWAYS"。如果仍不遵守，升级为 Hook 强制执行（Ch07）。',
                tier: 'l1',
              },
            },
          },
        ],
      },
    },
    {
      label: '做了不该做的事（修改禁止文件、执行危险命令）',
      node: {
        id: 'forbidden',
        question: '有 deny 规则或 PreToolUse Hook 吗？',
        children: [
          {
            label: '没有',
            node: {
              id: 'add-deny',
              question: '添加安全边界',
              result: {
                text: '在 settings.json 中添加 deny 规则，或添加 PreToolUse Hook 拦截危险操作。deny 是硬限制，Hook 可以做更复杂的判断（Ch07）。',
                tier: 'l2',
              },
            },
          },
          {
            label: '有，但没拦住',
            node: {
              id: 'check-hook',
              question: '检查 Hook 覆盖',
              result: {
                text: '确认 Hook 的 matcher 模式是否覆盖了这个操作。用 echo \'{"tool": "Write"}\' | your-hook.sh 手动测试。检查是否有"最严者生效"导致的意外放行。',
                tier: 'l3',
              },
            },
          },
        ],
      },
    },
    {
      label: '输出质量下降（代码变差、遗忘需求）',
      node: {
        id: 'quality',
        question: '在第几轮开始下降？',
        children: [
          {
            label: '前 5 轮就不行',
            node: {
              id: 'prompt-issue',
              question: 'Prompt 质量问题',
              result: {
                text: '问题不在上下文，在 prompt 本身。回到 Ch02 检查：是否有明确目标？是否有约束？是否有成功标准？尝试用 Level 4-5 的结构化 prompt。',
                tier: 'l1',
              },
            },
          },
          {
            label: '15 轮之后才变差',
            node: {
              id: 'context-decay',
              question: '上下文衰减',
              result: {
                text: '经典的长对话注意力稀释。解决方案：(1) 主动 /compact 保留关键信息 (2) 拆 session —— 一个任务一个会话 (3) 重查询用子代理隔离（Ch08）。',
                tier: 'l2',
              },
            },
          },
        ],
      },
    },
    {
      label: '太慢或太贵',
      node: {
        id: 'cost',
        question: '成本优化',
        result: {
          text: '(1) 检查 effort 级别 —— 日常任务用 low/medium，复杂任务才用 high (2) Read 大文件改用 Grep（省 10-20x token）(3) 子代理过多？每个子代理有最低开销，任务 < 2min 直接做更便宜 (4) /cost 查看当前消耗明细。',
          tier: 'l1',
        },
      },
    },
  ],
}
```

- [ ] **Step 3: Rewrite Ch10 core structure**

Replace the current sections with:

1. **Failure opening:** Team had Hooks (Ch07) ensuring lint/test pass every commit, but a 3-day feature had a fundamental schema design flaw — discovered too late because they didn't use Plan Mode for architecture verification first. Hooks protect quality, but don't protect direction.

2. **10.1 回顾：7 次 Harness 循环** — Walk through each chapter's failure→response cycle in a summary table, showing the pattern.

3. **10.2 三个核心原则** — Extract from the 7 cycles:
   - Spec-driven: plan before executing (prevents the Ch10 failure)
   - Context isolation: fresh context per task (prevents Ch08's degradation)
   - Verification loops: auto-validate each step (prevents Ch07's lint-skipping)

4. **10.3 诊断框架** — Render the `diagnosticTree` as an interactive DecisionTree. Frame it as: "When Claude misbehaves, this is your troubleshooting guide."

5. **10.4 为你的项目设计 Harness** — Teach the iterative approach: "Don't try to build the perfect Harness upfront. Start with CLAUDE.md (L1), add hooks when you see Claude skip checks (L2), add subagents when context degrades (L3)." ExerciseCard: given a project description, reader designs a Harness plan.

6. **Methodology reference** — Collapse GSD/BMAD/RIPER into a ReferenceSection.

- [ ] **Step 4: Remove migrated CI/CD content**

Remove the `claude-review.yml` GitHub Actions example that was migrated to Ch09 in Task 5. Replace with a brief cross-reference: "CI/CD 集成的完整实现见 Ch09。"

- [ ] **Step 5: Build, verify, commit**

```bash
npm run build
git add src/data/harness-decision-trees.ts src/chapters/ch10/index.tsx
git commit -m "content(ch10): rewrite core to retrospective + diagnostic framework + iterative Harness design"
```

---

### Task 8: Ch11 — Failure scenario + rollout + cost governance + incident response

**Files:**
- Modify: `src/chapters/ch11/index.tsx`

- [ ] **Step 1: Read current Ch11**

Read `src/chapters/ch11/index.tsx` fully (1321 lines).

- [ ] **Step 2: Add failure opening after header**

Insert realistic failure scenario: L1 developer uses Auto mode, Claude modifies core payment module introducing subtle precision bug (float vs decimal), passes code review (reviewer trusted Claude's output), discovered 3 days later in production when accounting discrepancy surfaces.

- [ ] **Step 3: Add rollout roadmap section**

New section "11.x 落地路线图":

**Small team (5-15 people), monthly plan:**
- Week 1: Unified CLAUDE.md template + permission tiers (L1/L2/L3)
- Week 2-3: Hook pipeline (format + lint + test) + code review process
- Week 4+: Subagent pilot for independent features

**Mid-large team (50+ people), quarterly plan:**
- Month 1: Managed Policy deployment + `managed-settings.d/` + champion identification
- Month 2: SDK integration with CI/CD + metrics dashboard
- Month 3: L1→L2 promotion cycle + cost monitoring + incident response process

- [ ] **Step 4: Add cost governance section**

Expand existing cost monitoring to include:
- Per-developer daily budget formula: `base_cost × complexity_multiplier × safety_margin`
- Anomaly alert: token consumption > 3x daily average triggers notification
- Chargeback model: cost allocated to project/team, visible in monthly report

- [ ] **Step 5: Add incident response section**

New section:
- Principle: "谁 approve 谁负责" — the human who approved the PR owns the outcome
- Post-mortem template: What happened → Root cause → Which Harness layer failed → Fix
- ExerciseCard: given the payment precision bug scenario, reader walks through the post-mortem

- [ ] **Step 6: Expand L1→L2 promotion criteria**

Make the existing tier system more concrete:
- L1→L2 requires: 3 months at L1 + ≥10 paired reviews with no escalations + 1 completed Plan Mode project + bug rate ≤ team average

- [ ] **Step 7: Build, verify, commit**

```bash
npm run build
git add src/chapters/ch11/index.tsx
git commit -m "content(ch11): add failure scenario, rollout roadmap, cost governance, incident response, L1-L2 criteria"
```

---

### Task 9: Ch01 — Auto Mode + Harness loop + audience positioning + token updates

**Files:**
- Modify: `src/chapters/ch01/index.tsx`

- [ ] **Step 1: Read Ch01 permissions table and section 1.3 ending**

Read lines 127-167 (permissions table) and lines 460-522 (end of section 1.3).

- [ ] **Step 2: Add audience positioning at chapter start**

Before the first `<p>` in the chapter intro (line 22), add:

```tsx
        <div
          className="px-4 py-3 rounded-lg mb-4 text-sm"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}
        >
          如果你用过 Cursor 或 Copilot，Claude Code 最大的不同是它是一个{' '}
          <strong style={{ color: 'var(--color-text-primary)' }}>Agent</strong>（自主决定行动），
          而不是 Copilot（等你指令）。这意味着你需要学会<strong style={{ color: 'var(--color-text-primary)' }}>设计它的运行环境</strong>，
          而不只是写好 Prompt。
        </div>
```

- [ ] **Step 3: Add Auto Mode row to permissions table**

After the Auto row (line 154), add a new row:

```tsx
              <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                <td className="px-4 py-3 font-mono" style={{ color: 'var(--color-accent)' }}>Auto Mode</td>
                <td className="px-4 py-3">独立的安全分类器自动审批常规操作，仅拦截超出任务范围的行为</td>
                <td className="px-4 py-3">有成熟 Hook 和 deny 规则保护的项目（Team 计划可用）</td>
              </tr>
```

- [ ] **Step 4: Add Harness Engineering loop at end of section 1.3**

Before the closing `</section>` of section 1.3 (around line 522), after the "你的角色在升级" QualityCallout, add:

```tsx
        <div
          className="p-6 rounded-lg text-center"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <p
            className="text-lg font-semibold mb-3"
            style={{ color: 'var(--color-text-primary)' }}
          >
            你在这个教程中会反复经历同一个循环
          </p>
          <p
            className="text-2xl font-bold mb-3"
            style={{ color: 'var(--color-accent)' }}
          >
            观察失败 → 诊断根因 → 构建 Harness 响应 → 验证有效
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            每一章就是一次这个循环。学完 11 章，你不只是会用 Claude Code 的功能，
            而是掌握了 Harness Engineering 的思维方式 — 面对任何 AI 工具都适用的工程方法论。
          </p>
        </div>
```

- [ ] **Step 5: Update token economics (section 1.4)**

In section 1.4 (line 532+), update:
- Opus 4.6 pricing (if outdated)
- Add effort level impact on tokens: low (~0.5x baseline), medium (~1x), high (~2x)
- Add context degradation thresholds: 70% precision drops, 85% hallucinations increase, 90% erratic

- [ ] **Step 6: Build, verify, commit**

```bash
npm run build
git add src/chapters/ch01/index.tsx
git commit -m "content(ch01): add Auto Mode, Harness loop intro, audience positioning, token economics updates"
```

---

### Task 10: Ch02 + Ch05 — Light updates

**Files:**
- Modify: `src/chapters/ch02/index.tsx:19-29` (intro)
- Modify: `src/chapters/ch05/index.tsx` (DemoAPI connection + failure recovery)

- [ ] **Step 1: Add audience positioning to Ch02**

At the start of Ch02's intro section (line 20), add a positioning paragraph:

```tsx
        <div
          className="px-4 py-3 rounded-lg mb-4 text-sm"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}
        >
          你可能已经会写 Prompt 了。这章教的不是基础 Prompt，而是 Claude{' '}
          <strong style={{ color: 'var(--color-text-primary)' }}>特有的</strong>精确控制技巧 —
          XML 语义边界、权重词层级、effort 级别。这些是其他 AI 工具没有的。
        </div>
```

- [ ] **Step 2: Connect Ch05 RBAC to DemoAPI**

In Ch05's RBAC section, add a connection note: "我们以 Ch03 的 DemoAPI 为例 — 它目前没有任何认证机制，任何人都可以读写所有数据。我们要用 Plan Mode 给它设计一个 RBAC 系统。"

- [ ] **Step 3: Add Plan failure recovery section to Ch05**

Before Ch05's closing, add a brief section on what to do when a Plan fails mid-execution:
1. Don't panic — the Plan itself is the recovery document
2. Check which step failed and why
3. Options: fix the current step and continue, revise the Plan from the failed step, or abandon and start a fresh Plan with lessons learned
4. Never amend a running Plan without re-checking downstream steps

- [ ] **Step 4: Build, verify, commit**

```bash
npm run build
git add src/chapters/ch02/index.tsx src/chapters/ch05/index.tsx
git commit -m "content(ch02,ch05): add audience positioning, DemoAPI connection, Plan failure recovery"
```

---

## Phase 3: Cross-Cutting Improvements

### Task 11: Industry data component + toc.ts + HomePage updates

**Files:**
- Create: `src/data/industry-stats.ts`
- Modify: `src/data/toc.ts`
- Modify: `src/pages/HomePage.tsx`

- [ ] **Step 1: Create centralized industry data**

Create `src/data/industry-stats.ts`:

```typescript
/**
 * Centralized industry statistics for the tutorial.
 * Update this file when data changes — all chapters reference it.
 */

export const industryStats = {
  /** Developer adoption rate for AI coding tools (2026) */
  aiToolAdoption: '84%',
  /** Claude Code market share among AI coding agents */
  claudeCodeShare: '40.8%',
  /** AI-generated code logic error multiplier vs human code */
  logicErrorMultiplier: '1.75x',
  /** Percentage of AI-generated code with security vulnerabilities */
  securityVulnerabilityRate: '45%',
  /** Code churn rate increase with AI tools */
  codeChurnIncrease: '41%',
  /** Gartner forecast: AI-generated code share by end of 2026 */
  gartnerAiCodeForecast: '60%',
  /** SWE-bench improvement from Hooks alone (LangChain data) */
  hooksBenchImprovement: '13.7%',
  /** Auto Mode: percentage of permission prompts users approve */
  autoModeApprovalRate: '93%',
} as const

export type IndustryStat = keyof typeof industryStats
```

- [ ] **Step 2: Update toc.ts chapter subtitles**

Update subtitles in `src/data/toc.ts` to reflect new chapter framing:
- Ch03: add "Agentic Engineering 光谱" to subtitle
- Ch07: add "Auto Mode" to subtitle
- Update estimated times for expanded chapters (Ch04: 50→60, Ch08: 80→90, Ch10: 50→60, Ch11: 50→70)

- [ ] **Step 3: Update HomePage Harness Engineering messaging**

In `src/pages/HomePage.tsx`, update the hero subtitle (line 66-68) to emphasize the failure→response learning cycle. Update the tier descriptions to mention the four capabilities (design, evaluate, diagnose, evolve).

- [ ] **Step 4: Add Harness Engineering labels to each chapter**

For each chapter component (ch01-ch11), add a small label below the chapter number badge showing which Harness component this chapter teaches. Use the existing badge style:

```tsx
          <span
            className="text-xs uppercase tracking-widest font-medium"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Harness · 规范层  {/* example for Ch04 */}
          </span>
```

Map: Ch01-03 = "Foundation", Ch04 = "规范层", Ch05 = "结构层", Ch06 = "能力层", Ch07 = "保障层", Ch08 = "编排层", Ch09 = "自动化层", Ch10 = "方法论", Ch11 = "治理层"

- [ ] **Step 5: Build, verify, commit**

```bash
npm run build
git add src/data/industry-stats.ts src/data/toc.ts src/pages/HomePage.tsx src/chapters/
git commit -m "content: add industry data component, update toc, homepage, and Harness labels across all chapters"
```
