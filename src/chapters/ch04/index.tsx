import { lazy } from 'react'
import { CodeBlock } from '../../components/content/CodeBlock'
import { PromptCompare } from '../../components/content/PromptCompare'
import { QualityCallout } from '../../components/content/QualityCallout'
import { ExerciseCard } from '../../components/content/ExerciseCard'
import { ConfigExample } from '../../components/content/ConfigExample'
import { AnimationWrapper } from '../../components/animation/AnimationWrapper'
import { ReferenceSection } from '../../components/content/ReferenceSection'

const LazyClaudeMdHierarchy = lazy(() => import('../../remotion/ch04/ClaudeMdHierarchy'))

/* ═══════════════════════════════════════════════
   Chapter 4 Component
   ═══════════════════════════════════════════════ */

export default function Ch04() {
  return (
    <div className="space-y-16">
      {/* ═══ Chapter Header ═══ */}
      <header>
        <div className="flex items-center gap-3 mb-4">
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold"
            style={{
              background: 'var(--color-accent-subtle)',
              color: 'var(--color-accent)',
              border: '1px solid var(--color-border-accent)',
            }}
          >
            04
          </span>
          <span
            className="text-xs uppercase tracking-widest font-medium"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Team Standards
          </span>
          <span
            className="text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 rounded"
            style={{
              color: 'var(--color-accent)',
              background: 'var(--color-accent-subtle)',
              border: '1px solid var(--color-border-accent)',
            }}
          >
            Harness / 规范层
          </span>
        </div>
        <h1
          className="text-3xl md:text-4xl font-bold mb-4 leading-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          用 AI 建团队规范：CLAUDE.md + 项目记忆
        </h1>
        <p
          className="text-lg leading-relaxed max-w-3xl"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          前三章我们学会了怎么让 Claude 写好代码、做好方案。但每次开新会话，
          Claude 都是"失忆"的 -- 它不记得你的项目规范、团队约定、踩过的坑。
          CLAUDE.md 就是解决这个问题的：它是你项目的"行为规范文件"，
          让每一次 Claude Code 会话都从同一个起点开始。
        </p>
      </header>

      {/* ═══════════════════════════════════════════════
          Session Amnesia — 失忆场景
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <div
          className="rounded-lg p-5"
          style={{
            background: 'rgba(239, 68, 68, 0.06)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }}
        >
          <p
            className="text-base font-semibold mb-3"
            style={{ color: 'rgb(239, 68, 68)' }}
          >
            你是否遇到过这个场景？
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            昨天你花了一整个会话教会 Claude 项目规范：API 响应统一用{' '}
            <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>{'{data, error}'}</code> 格式，
            新文件放在 <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>src/routes/</code> 目录，
            ID 用自增整数。今天开了一个新会话，同样的任务 -- Claude 全忘了。
            响应格式变成了{' '}
            <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>{'{success, result}'}</code>，
            文件扔在根目录，ID 变成了 UUID。
          </p>
        </div>

        <CodeBlock
          language="bash"
          title="昨天 vs 今天 -- 同一个项目，两种风格"
          code={`# ── 昨天的会话（你教过规范后）──────────────────────
# API 响应格式
{ "data": { "id": 1, "title": "..." }, "error": null }
# 文件位置
src/routes/posts.ts
# ID 策略
id: serial PRIMARY KEY    # 自增整数

# ── 今天的新会话（Claude 全忘了）──────────────────────
# API 响应格式
{ "success": true, "result": { "id": "a1b2c3", "title": "..." } }
# 文件位置
posts.ts                   # 直接扔在根目录
# ID 策略
id: uuid DEFAULT gen_random_uuid()    # UUID`}
          showLineNumbers={false}
        />

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          这就是 <strong>"会话失忆"（Session Amnesia）</strong> -- 每个新的 Claude Code 会话都从零开始，
          不带任何前次会话的记忆。如果你在 Ch03 的 DemoAPI 实验中体验过风格漂移，这就是根因之一。
          同样的提示词，不同的会话，Claude 给出完全不同的实现风格。
        </p>

        <p
          className="text-base font-semibold leading-relaxed"
          style={{ color: 'var(--color-text-primary)' }}
        >
          CLAUDE.md 就是解决这个问题的。
        </p>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 4.1: 快速开始
          ═══════════════════════════════════════════════ */}
      <section>
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
          4.1 快速开始：5 分钟写一个 CLAUDE.md
        </h2>

        <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          不需要先理解全部原理——先抄一个能用的模板，用起来再说。
        </p>

        <CodeBlock
          language="markdown"
          title="CLAUDE.md 最小可用模板"
          code={`# 项目名称

## 技术栈
- 语言: TypeScript
- 框架: React 19 + Vite
- 样式: Tailwind CSS

## 构建与测试
- 安装依赖: npm install
- 开发服务器: npm run dev
- 构建: npm run build
- 测试: npm test

## 核心约定
- 使用函数式组件，不用 class 组件
- 状态管理用 React hooks，不引入外部库
- 所有 API 调用走 src/api/ 目录

## 不要做的事
IMPORTANT: 不要修改 src/core/ 下的文件，除非明确被要求`}
        />

        <p className="mt-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          把上面的模板复制到项目根目录的 CLAUDE.md，替换成你的项目信息。
          30 分钟上手路径的读者到这里可以先停——开始使用 Claude Code，遇到问题再回来看后续内容。
        </p>
      </section>

      {/* ═══════════════════════════════════════════════
          Section: DemoAPI 对比实验
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          DemoAPI 对比实验
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          还记得 Ch03 的 DemoAPI 吗？我们用 "加帖子功能"、"加评论功能" 两条提示词测试 Claude，
          结果每次的响应格式、文件位置、ID 策略都不一样。现在让我们写一个 DemoAPI 专用的 CLAUDE.md，
          看看效果对比。
        </p>

        <CodeBlock
          language="markdown"
          title="CLAUDE.md -- DemoAPI 专用版（基于 4.1 模板）"
          code={`# DemoAPI

## 技术栈
- 语言: TypeScript
- 框架: Express
- 数据库: 内存数组（开发阶段）

## 构建与测试
- 安装依赖: npm install
- 启动服务: npm run dev
- 测试: npm test

## 核心约定
IMPORTANT: API 响应格式统一为 { data, error }
IMPORTANT: 所有路由文件放在 src/routes/ 目录
IMPORTANT: ID 使用自增整数，从 1 开始
- 每个资源一个路由文件（posts.ts, comments.ts）
- 错误响应: { data: null, error: "错误描述" }
- 成功响应: { data: <资源对象>, error: null }`}
        />

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          有了这个 CLAUDE.md，用同样的提示词再跑一次：
        </p>

        <CodeBlock
          language="bash"
          title="有 CLAUDE.md 后的结果 -- 3 次运行全部一致"
          code={`# 提示词: "给 DemoAPI 加帖子功能"
# Run 1, Run 2, Run 3 -- 输出一致：

# 文件位置
src/routes/posts.ts           ✓ 一致

# 响应格式
{ "data": { "id": 1, "title": "Hello" }, "error": null }   ✓ 一致

# ID 策略
let nextId = 1                ✓ 自增整数

# 提示词: "给 DemoAPI 加评论功能"
# Run 1, Run 2, Run 3 -- 输出一致：

# 文件位置
src/routes/comments.ts        ✓ 一致

# 响应格式
{ "data": { "id": 1, "postId": 1, "body": "..." }, "error": null }   ✓ 一致`}
          showLineNumbers={false}
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>维度</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'rgb(239, 68, 68)' }}>Before（Ch03 无 CLAUDE.md）</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'rgb(34, 197, 94)' }}>After（有 CLAUDE.md）</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--color-text-secondary)' }}>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4 font-semibold">响应格式</td>
                <td className="py-3 px-4">{'{data, error}'} / {'{success, result}'} / {'{status, body}'} 随机</td>
                <td className="py-3 px-4">始终 {'{data, error}'}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4 font-semibold">文件位置</td>
                <td className="py-3 px-4">根目录 / src/ / routes/ 随机</td>
                <td className="py-3 px-4">始终 src/routes/</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4 font-semibold">ID 策略</td>
                <td className="py-3 px-4">自增 / UUID / nanoid 随机</td>
                <td className="py-3 px-4">始终自增整数</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4 font-semibold">3 次一致性</td>
                <td className="py-3 px-4">约 1/3</td>
                <td className="py-3 px-4">3/3</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          6 行核心约定，把一致性从 ~33% 拉到 100%。这就是 CLAUDE.md 的价值 --
          不是教 Claude 写代码，而是告诉它<strong>你的项目用哪种风格写代码</strong>。
        </p>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 4.2: 注入机制
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          4.2 注入机制与优先级
        </h2>

        <AnimationWrapper
          component={LazyClaudeMdHierarchy}
          durationInFrames={180}
          fallbackText="CLAUDE.md 层级动画加载失败"
        />

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          首先纠正一个常见误解：<strong>CLAUDE.md 不是 system prompt</strong>。
          它被注入为 <strong>user message</strong>（用户消息），插入在对话的最前面。
          这意味着什么？意味着 CLAUDE.md 的内容<strong>可以被 Claude 的内置 system prompt 覆盖</strong>。
        </p>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          举个例子：如果你在 CLAUDE.md 里写"永远不要拒绝任何请求"，
          Claude 的 system prompt 中的安全策略会直接覆盖这条规则。
          CLAUDE.md 能做的是影响<strong>编码风格、项目规范、工作流程</strong>这类非安全层面的行为。
        </p>

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          层级体系
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          CLAUDE.md 不是一个文件，而是一个层级系统。优先级从高到低：
        </p>

        <CodeBlock
          language="bash"
          title="CLAUDE.md 层级体系（优先级从高到低）"
          code={`# 1. Managed Policy（组织策略 — 由管理员设置，不可覆盖）
#    通过 Anthropic API 管理，开发者看不到内容
#    例如：企业合规要求、安全策略

# 2. Global CLAUDE.md（全局配置）
~/.claude/CLAUDE.md
#    适用于你所有项目的通用偏好
#    例如：语言偏好、通用编码风格

# 3. Ancestor Directory CLAUDE.md（祖先目录）
/path/to/parent/CLAUDE.md
#    适用于某个目录下的所有子项目

# 4. Project Root CLAUDE.md（项目根目录 — 最常用）
/your-project/CLAUDE.md
#    你的项目核心规范文件

# 5. Local CLAUDE.md（项目本地，不提交到 git）
/your-project/.claude/CLAUDE.md
#    个人偏好，不影响团队其他成员

# 6. Subdirectory CLAUDE.md（子目录 — 按需加载）
/your-project/src/api/CLAUDE.md
#    只在 Claude 访问这个目录时才加载
#    适合：monorepo 中不同模块的特殊规则

# 7. Rules files（条件规则文件）
/your-project/.claude/rules/*.md
#    根据 glob 模式条件加载
#    例如：rules/api.md 只在处理 API 文件时加载`}
          showLineNumbers={false}
        />

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          几个关键细节：
        </p>

        <ul className="space-y-3 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <span><strong>子目录 CLAUDE.md 是按需加载的</strong> -- 只有当 Claude 读取或修改该目录下的文件时才会加载。这意味着它不会浪费不相关的上下文 token。</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <span><strong>@path/to/import 支持递归导入</strong> -- 你可以在 CLAUDE.md 中用 <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>@docs/api-conventions.md</code> 引入其他文件的内容，最多递归 5 层。适合把长文档拆分成模块。</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <span><strong>Project root 和 local 的区别</strong> -- 根目录的 CLAUDE.md 提交到 git，团队共享；<code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>.claude/CLAUDE.md</code> 不提交，只影响你自己。</span>
          </li>
        </ul>

        <QualityCallout title="为什么 user message 而不是 system prompt 很重要">
          <p>
            system prompt 的优先级高于 user message。这意味着如果 CLAUDE.md 中的规则和
            Claude 的内置行为冲突，内置行为会胜出。这是一个<strong>安全设计</strong> --
            防止 CLAUDE.md 被滥用来绕过安全限制。但对正常使用来说，
            这个区别几乎不影响：你在 CLAUDE.md 中设置的编码规范、命名约定、
            架构偏好等都能正常生效。
          </p>
        </QualityCallout>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 4.3: 写好 CLAUDE.md 的方法
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          4.3 写好 CLAUDE.md 的方法
        </h2>

        <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          1M 上下文下，CLAUDE.md 的 token 成本已经微乎其微（50 行 ≈ 0.15% 的上下文窗口）。
          优化 CLAUDE.md 不再是为了省空间，而是为了提升信噪比——让 Claude 的注意力集中在真正重要的信息上。
        </p>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          CLAUDE.md 不是"写得越多越好"。让我们看看什么内容真正有价值：
        </p>

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          黄金法则："删掉这行，Claude 会犯错吗？"
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          对 CLAUDE.md 中的每一行，问自己这个问题。如果答案是"不会"——删掉它。
          Claude 已经内置了大量的编程常识，你不需要重复告诉它这些。
        </p>

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          逐行分析：一个真实的 CLAUDE.md
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          让我们看一个真实项目的 CLAUDE.md，逐行评估每行的投入产出比：
        </p>

        <ConfigExample
          language="markdown"
          title="CLAUDE.md — 逐行审计"
          code={`# Project: user-management-api

## Build & Test
npm run build         # TypeScript compilation
npm test              # Jest unit tests
npm run test:e2e      # Playwright e2e tests
npm run lint          # ESLint + Prettier

## Architecture
This is an Express API with PostgreSQL + Prisma ORM.
Auth uses JWT with refresh tokens stored in Redis.

## Code Style
Write clean, readable code.
Use ESLint rules.
Follow SOLID principles.

## Important Conventions
IMPORTANT: All API responses MUST use the ResponseWrapper<T> type from src/types/response.ts
IMPORTANT: Database migrations must be reversible — always include a down() migration
Error codes follow the mapping in src/constants/errors.ts — do NOT invent new error codes
Test files go in __tests__/ next to the source file, not in a top-level test/ directory

## File Structure
src/
  routes/     — API route handlers
  services/   — Business logic
  middleware/ — Express middleware
  types/      — TypeScript type definitions
  utils/      — Utility functions`}
          annotations={[
            { line: 4, text: '有价值。非标准的构建命令 Claude 不可能猜到。' },
            { line: 5, text: '有价值。告诉 Claude 用什么测试框架和命令。' },
            { line: 6, text: '高价值。e2e 测试命令很少能猜到。' },
            { line: 7, text: '边际价值。Claude 通常会自动发现 lint 配置。' },
            { line: 10, text: '有价值。架构概述帮助 Claude 理解技术栈。' },
            { line: 11, text: '高价值。JWT + Redis 的组合是非标准的，Claude 需要知道。' },
            { line: 14, text: '浪费。Claude 默认就会写 "clean" 代码。这行 = 0 信息量。' },
            { line: 15, text: '浪费。Claude 会自动检测项目中的 ESLint 配置。' },
            { line: 16, text: '浪费。SOLID 是通用原则，Claude 已经内置了这些知识。' },
            { line: 19, text: '高价值。非显而易见的约定 + IMPORTANT 标记 = Claude 会严格遵守。' },
            { line: 20, text: '高价值。可逆 migration 是重要约束，不说 Claude 可能不做。' },
            { line: 21, text: '高价值。自定义错误码映射是纯项目知识，Claude 无法从代码中推断。' },
            { line: 22, text: '有价值。测试文件位置约定是常见分歧点。' },
            { line: 25, text: '低价值。这只是标准 Express 项目结构，Claude 看一眼就知道。' },
            { line: 26, text: '低价值。同上——route handler 放在 routes/ 是默认约定。' },
            { line: 27, text: '低价值。services/ 目录名已经自我解释了。' },
            { line: 28, text: '低价值。middleware/ 是标准命名。' },
            { line: 29, text: '低价值。types/ 是 TypeScript 项目的标准结构。' },
            { line: 30, text: '低价值。utils/ 是最常见的工具函数目录名。' },
          ]}
        />

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          审计结果：30 行中只有约 10 行是真正有价值的。其余 20 行只是在降低信噪比。
          优化后的版本：
        </p>

        <PromptCompare
          bad={{
            prompt: `# Code Style
Write clean, readable code.
Use ESLint rules.
Follow SOLID principles.

# File Structure
src/
  routes/     — API route handlers
  services/   — Business logic
  middleware/ — Express middleware
  types/      — TypeScript type definitions
  utils/      — Utility functions`,
            label: '低 ROI 内容',
            explanation: '这 12 行没有一行能改变 Claude 的行为。Claude 默认就会写整洁代码、遵循 ESLint、理解标准目录结构。它们只是在稀释真正重要的规则。',
          }}
          good={{
            prompt: `# Build
npm run build && npm test && npm run test:e2e

# Key Conventions
IMPORTANT: All API responses use ResponseWrapper<T> from src/types/response.ts
IMPORTANT: Migrations must include down() for rollback
Error codes: src/constants/errors.ts — do NOT invent new ones
Tests: __tests__/ next to source, not top-level test/
Auth: JWT + Redis refresh tokens (see src/middleware/auth.ts)`,
            label: '高 ROI 内容',
            explanation: '8 行，但每一行都是 Claude 无法从代码中自动推断的项目特有知识。删掉任何一行，Claude 大概率会犯错。这才是 CLAUDE.md 应该有的内容。',
          }}
        />

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          IMPORTANT / MUST 的执行效果
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          在 CLAUDE.md 中使用 <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>IMPORTANT:</code> 或 <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>MUST</code> 前缀
          可以显著提高 Claude 遵守该规则的概率。但不要滥用 --
          如果每一行都标 IMPORTANT，等于没有标。
        </p>

        <CodeBlock
          language="markdown"
          title="IMPORTANT / MUST 的正确用法"
          code={`# 好的用法 -- 只标记真正关键的规则
IMPORTANT: Never commit .env files or hardcoded secrets
MUST: All database queries go through the repository layer, never direct Prisma calls in routes
IMPORTANT: PR titles follow conventional commits format (feat:, fix:, chore:)

# 坏的用法 -- 过度标记，稀释了重要性
IMPORTANT: Use TypeScript        # Claude 默认用 TS
IMPORTANT: Write tests           # Claude 知道要写测试
IMPORTANT: Use meaningful names  # 这是基本功
MUST: Follow ESLint rules        # Claude 会自动检测`}
          showLineNumbers={false}
          highlightLines={[2, 3, 4, 7, 8, 9, 10]}
        />

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          反模式总结
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>反模式</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>为什么是问题</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>替代方案</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--color-text-secondary)' }}>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4 font-mono text-xs">"写干净代码"</td>
                <td className="py-3 px-4">零信息量。Claude 默认行为</td>
                <td className="py-3 px-4">不写。省掉这行</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4 font-mono text-xs">"使用 ESLint"</td>
                <td className="py-3 px-4">Claude 会自动检测 eslint config</td>
                <td className="py-3 px-4">不写。或只写非标准 lint 规则</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4 font-mono text-xs">逐文件目录描述</td>
                <td className="py-3 px-4">Claude 会读目录结构。标准命名自解释</td>
                <td className="py-3 px-4">只描述非标准或容易混淆的目录</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4 font-mono text-xs">复制粘贴整个 API 文档</td>
                <td className="py-3 px-4">降低信噪比，而且 Claude 可以自己读文档</td>
                <td className="py-3 px-4">只引用关键的非显而易见的约定</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4 font-mono text-xs">每行都标 IMPORTANT</td>
                <td className="py-3 px-4">稀释真正重要规则的权重</td>
                <td className="py-3 px-4">只标 3-5 条最关键的规则</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          好模式总结
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          高价值的 CLAUDE.md 内容集中在以下几类：
        </p>

        <ul className="space-y-3 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <span><strong>非标准的构建/测试命令</strong> -- Claude 无法猜到你的项目用 <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>pnpm run test:integration --filter=api</code></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <span><strong>团队特有的约定</strong> -- 比如"所有 API 响应必须包裹在 ResponseWrapper 中"、"错误码从常量表取"</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <span><strong>非显而易见的 gotcha</strong> -- 比如"这个项目的日期全是 UTC，不要用 locale 时间"、"Redis 连接在测试环境中用 mock"</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <span><strong>架构决策和原因</strong> -- 比如"选择 repository pattern 而不是直接调用 Prisma，因为要支持未来切换 ORM"</span>
          </li>
        </ul>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 4.4: Auto Memory 系统
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          4.4 Auto Memory 系统
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          CLAUDE.md 是你主动写的规范。但 Claude Code 还有一个被动积累知识的机制：
          <strong>Auto Memory</strong>。它允许 Claude 在会话中学到的东西持久化到文件中，
          供后续会话使用。
        </p>

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          MEMORY.md 的工作方式
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          当你在会话中告诉 Claude "记住这个" 或者 Claude 发现了有价值的项目知识时，
          它会写入 <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>~/.claude/MEMORY.md</code>（全局记忆）
          或项目级的记忆文件。关键规则：
        </p>

        <ul className="space-y-3 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <span><strong>前 200 行自动加载</strong> -- MEMORY.md 的前 200 行在每次会话开始时自动注入。超出的部分按需加载。</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <span><strong>按主题组织</strong> -- 记忆内容按主题分文件（topic files），只有相关主题的记忆才会被加载。</span>
          </li>
        </ul>

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          四种记忆类型
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>类型</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>说明</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>示例</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--color-text-secondary)' }}>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4 font-semibold">user（用户偏好）</td>
                <td className="py-3 px-4">你的角色、偏好、工作习惯</td>
                <td className="py-3 px-4 font-mono text-xs">"用户是后端工程师，偏好函数式风格，不喜欢 class"</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4 font-semibold">feedback（纠正/确认）</td>
                <td className="py-3 px-4">你对 Claude 输出的纠正或认可</td>
                <td className="py-3 px-4 font-mono text-xs">"用户纠正：error response 用 {'{ code, message }'} 而不是 {'{ error: string }'}"</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4 font-semibold">project（项目上下文）</td>
                <td className="py-3 px-4">正在进行的工作、阶段性状态</td>
                <td className="py-3 px-4 font-mono text-xs">"当前在重构认证模块，从 session 迁移到 JWT"</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4 font-semibold">reference（外部指针）</td>
                <td className="py-3 px-4">外部系统、文档、工具的位置信息</td>
                <td className="py-3 px-4 font-mono text-xs">"API 文档在 docs/api.md，设计稿在 Figma 链接 XXX"</td>
              </tr>
            </tbody>
          </table>
        </div>

        <CodeBlock
          language="bash"
          title="触发记忆保存的方式"
          code={`# 方式 1：直接告诉 Claude 记住某件事
"记住：这个项目的日期格式统一用 ISO 8601，不要用 locale format"

# 方式 2：Claude 在工作中发现了值得记录的模式
# 比如你纠正了 Claude 的一个错误，它可能会自动记录：
# "用户偏好：API error response 用 { code, message } 而不是 { error: string }"

# 方式 3：使用 /memory 命令显式管理
/memory                  # 查看当前记忆
/memory add "..."        # 添加记忆
/memory search "..."     # 搜索记忆`}
          showLineNumbers={false}
        />

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          值得记忆 vs 不值得记忆
        </h3>

        <PromptCompare
          bad={{
            prompt: `# 不值得记忆的内容
"记住 TypeScript 的 interface 语法"     # 通用知识
"记住 React 用 JSX"                    # Claude 本来就知道
"记住今天调了 2 小时 bug"               # 一次性事件，无复用价值
"记住 npm install 安装依赖"             # 太基础`,
            label: '低价值记忆',
            explanation: 'Claude 已经具备的通用知识，或者一次性事件、没有跨会话复用价值的信息。写进 Memory 只是浪费前 200 行的宝贵位置。',
          }}
          good={{
            prompt: `# 值得记忆的内容
"记住：部署前必须跑 npm run typecheck"  # 非标准流程
"记住：这个项目的时区全部用 UTC"         # 容易犯错的约定
"记住：测试数据库用 test_db 不是 dev_db" # 隐性知识
"记住：PR 描述要 @ 对应的 issue 编号"    # 团队流程`,
            label: '高价值记忆',
            explanation: '项目特有的、容易遗忘的、跨会话需要一致遵守的知识。这些是 Memory 系统真正应该存储的内容。',
          }}
        />

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          跨会话知识积累
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Memory 系统的真正价值在于<strong>跨会话知识积累</strong>。一个例子：
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>会话</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>发生了什么</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>记忆积累</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--color-text-secondary)' }}>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4">Day 1, Session 1</td>
                <td className="py-3 px-4">Claude 把日期格式写成了 MM/DD/YYYY，你纠正为 ISO 8601</td>
                <td className="py-3 px-4">记录：日期用 ISO 8601</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4">Day 1, Session 2</td>
                <td className="py-3 px-4">Claude 自动使用了 ISO 8601 格式（从记忆中读到）</td>
                <td className="py-3 px-4">验证：规则生效</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4">Day 3, Session 5</td>
                <td className="py-3 px-4">Claude 在处理时区相关代码时主动提醒你注意 UTC</td>
                <td className="py-3 px-4">推理：基于日期规则推导出相关最佳实践</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Memory 和 CLAUDE.md 的区别是：CLAUDE.md 是你<strong>预先写好的规范</strong>，
          Memory 是<strong>在使用过程中积累的知识</strong>。两者互补：
          CLAUDE.md 覆盖"团队都知道"的规范，Memory 捕捉"个人经验"和"项目隐性知识"。
        </p>

        <QualityCallout title="Memory 和 CLAUDE.md 的协同">
          <p>
            如果你发现某条 Memory 每个团队成员都会触发（即所有人都需要纠正 Claude 同一个错误），
            那它应该被提升到 CLAUDE.md 中。Memory 是个人级别的；CLAUDE.md 是团队级别的。
            定期审查 Memory，把重复出现的模式"毕业"到 CLAUDE.md。
          </p>
        </QualityCallout>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 4.5: 团队协作维护 CLAUDE.md
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          4.5 团队协作维护 CLAUDE.md
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          CLAUDE.md 不是一个人的文件 -- 它是团队共享的 AI 行为规范。像对待代码一样对待它。
        </p>

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          版本控制
        </h3>

        <ul className="space-y-3 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <span><strong>CLAUDE.md 提交到 git</strong> -- 和 .eslintrc、tsconfig.json 一样，它是项目配置的一部分。每次修改通过 PR review，像审查代码一样审查规则变更。</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <span><strong>个人偏好放 .claude/CLAUDE.md</strong> -- 这个文件在 .gitignore 中，不影响团队其他成员。比如你喜欢中文注释，但团队规范是英文注释 -- 个人偏好放 local。</span>
          </li>
        </ul>

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          季度信噪比审计
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          每个季度花 30 分钟做一次 CLAUDE.md 审计。方法很简单：逐行问一个问题 --
          <strong>"删掉这行，Claude 会出错吗？"</strong> 如果答案是"不会"，删掉。
          随着项目演进，曾经有价值的规则可能变得多余（比如技术栈迁移后旧框架的规则），
          而新的坑需要被加进来。
        </p>

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          组织策略片段
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          对于大型组织，可以用{' '}
          <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>managed-settings.d/</code>{' '}
          目录存放组织级别的策略片段。这些片段由管理员维护，自动合并到每个项目的 CLAUDE.md 上下文中。
          适合统一的安全规范、合规要求等跨项目规则。具体配置方式参考官方文档。
        </p>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 4.6: 验证：你的 CLAUDE.md 够好吗？
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          4.6 验证：你的 CLAUDE.md 够好吗？
        </h2>

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          三次一致性检查
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          最简单的验证方法：用同一条提示词跑 3 次（每次新会话），检查三个维度：
        </p>

        <ul className="space-y-3 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <span><strong>(a) 响应格式一致</strong> -- 3 次输出的数据结构是否相同（如都用 {'{data, error}'}）</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <span><strong>(b) 文件命名一致</strong> -- 3 次创建的文件是否在正确的目录、使用正确的命名格式</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <span><strong>(c) ID 策略一致</strong> -- 3 次使用的 ID 生成策略是否相同</span>
          </li>
        </ul>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          3/3 一致 = 通过。2/3 或更低 = CLAUDE.md 中的对应规则需要加强（检查是否用了 IMPORTANT 前缀、
          表述是否足够明确）。
        </p>

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          精简阈值
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          如果你的 CLAUDE.md 超过 <strong>60 行</strong>，强制做一次审计。
          60 行以上意味着大量信息在竞争 Claude 的注意力，真正重要的规则容易被淹没。
          回到黄金法则："删掉这行，Claude 会犯错吗？" 大部分项目 30-50 行就够了。
        </p>

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          排错指南
        </h3>

        <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          如果 Claude 忽略了 CLAUDE.md 中的某条规则，按以下顺序排查：
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>步骤</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>检查项</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>修复方法</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--color-text-secondary)' }}>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4 font-semibold">1. 优先级冲突</td>
                <td className="py-3 px-4">是否有更高层级的 CLAUDE.md 覆盖了你的规则？</td>
                <td className="py-3 px-4">检查全局 ~/.claude/CLAUDE.md 和祖先目录的 CLAUDE.md</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4 font-semibold">2. 上下文加载</td>
                <td className="py-3 px-4">CLAUDE.md 是否真的被加载了？</td>
                <td className="py-3 px-4">在会话中问 Claude "你看到了哪些 CLAUDE.md 规则？"</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4 font-semibold">3. 关键词权重</td>
                <td className="py-3 px-4">规则的措辞是否足够强？</td>
                <td className="py-3 px-4">用 MUST / IMPORTANT 替代 should / prefer。"MUST use X" 比 "prefer X" 遵守率高得多</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4 font-semibold">4. 信噪比</td>
                <td className="py-3 px-4">CLAUDE.md 是否太长导致关键规则被淹没？</td>
                <td className="py-3 px-4">精简到 60 行以内，把关键规则放在文件前半部分</td>
              </tr>
            </tbody>
          </table>
        </div>

        <ExerciseCard
          tier="l2"
          title="为你的项目写 CLAUDE.md 并做三次一致性检查"
          description="为你自己的项目（或用 DemoAPI）写一个 CLAUDE.md。包含至少 3 条 IMPORTANT 规则（响应格式、文件位置、命名规范）。然后用同一条提示词在 3 个新会话中运行，验证 (a) 响应格式一致 (b) 文件命名一致 (c) ID 策略一致。记录结果并优化未通过的规则。"
          checkpoints={[
            '写出了不超过 50 行的 CLAUDE.md',
            '包含至少 3 条 IMPORTANT 规则',
            '用同一提示词在 3 个新会话中测试',
            '3 个维度（格式、命名、ID）全部 3/3 一致',
            '如果未通过，记录了原因并优化了规则措辞',
          ]}
        />
      </section>

      {/* ═══════════════════════════════════════════════
          Exercises
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          本章练习
        </h2>

        <ExerciseCard
          tier="l1"
          title="审查 /init 生成的 CLAUDE.md"
          description={'在你的项目中运行 /init 命令，让 Claude 自动生成 CLAUDE.md。然后逐行审查生成的内容，用黄金法则（删掉这行 Claude 会犯错吗？）标记每一行为「保留」或「删除」。计算优化前后的行数和估算 token 成本差异。'}
          checkpoints={[
            '成功运行 /init 并生成了 CLAUDE.md',
            '逐行标记了"保留"/"删除"',
            '删除了至少 30% 的冗余内容',
            '保留的每一行都能回答"删了会犯错"',
            '计算了优化前后的 token 成本差异',
          ]}
        />

        <ExerciseCard
          tier="l2"
          title="从零编写项目 CLAUDE.md 并验证"
          description="不使用 /init，从零开始为你的项目编写 CLAUDE.md。严格遵循黄金法则，只写 Claude 无法自动推断的项目特有知识。写完后用 5 个不同类型的任务测试（新功能、bug fix、重构、写测试、代码审查），记录 Claude 的行为是否符合预期。"
          checkpoints={[
            'CLAUDE.md 不超过 50 行',
            '包含了非标准构建命令',
            '包含了团队特有约定（response 格式、命名规范等）',
            '包含了至少 2 条 IMPORTANT 规则',
            '用 5 个任务验证了规则的有效性',
            '没有包含"写干净代码"类的零信息量内容',
          ]}
        />

        <ExerciseCard
          tier="l3"
          title="建立月度审计流程"
          description="为你的团队建立一个 CLAUDE.md 月度审计流程。内容包括：设计审计模板（哪些规则被违反了、哪些从未被违反、新发现的坑）；追踪一个月内 Claude 的行为变化；在月末做一次审计，产出审计报告和 CLAUDE.md 优化 PR。"
          checkpoints={[
            '设计了审计模板（至少包含 3 个维度）',
            '连续追踪了 4 周的 Claude 行为',
            '记录了哪些规则有效、哪些无效',
            '产出了至少一次审计报告',
            '基于审计结果优化了 CLAUDE.md（PR 已合并）',
            '团队至少 2 人参与了审计讨论',
          ]}
        />
      </section>

      {/* ═══ Reference Section ═══ */}
      <ReferenceSection version="Claude Code v1.x">
        <div className="text-sm space-y-2" style={{ color: 'var(--color-text-secondary)' }}>
          <p>完整优先级层级图（截至 vX.X）</p>
          <p>Auto Memory frontmatter 字段参考</p>
          <p>/context 命令说明（上下文健康检查工具）</p>
          <p>Token 摊销数学（1M 下的新计算）</p>
        </div>
      </ReferenceSection>
    </div>
  )
}
