import { lazy } from 'react'
import { CodeBlock } from '../../components/content/CodeBlock'
import { PromptCompare } from '../../components/content/PromptCompare'
import { QualityCallout } from '../../components/content/QualityCallout'
import { ExerciseCard } from '../../components/content/ExerciseCard'
import { ConfigExample } from '../../components/content/ConfigExample'
import { AnimationWrapper } from '../../components/animation/AnimationWrapper'

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
          Section 4.1: 注入机制
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          4.1 注入机制：CLAUDE.md 是怎么工作的
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
          Section 4.2: 写好 CLAUDE.md 的科学
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          4.2 写好 CLAUDE.md 的科学
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          CLAUDE.md 不是"写得越多越好"。每一行都有成本 --
          而且这个成本在每次对话中都会重复支付。让我们先算一笔账：
        </p>

        <div
          className="rounded-lg p-5"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            Token 成本计算
          </h4>
          <div className="font-mono text-sm space-y-1" style={{ color: 'var(--color-text-secondary)' }}>
            <p>CLAUDE.md 50 行 x ~30 tokens/行 = ~1,500 tokens/次</p>
            <p>每次对话 ~30 轮 x 1,500 tokens = ~45,000 tokens/会话</p>
            <p>每天 5 个会话 x 45,000 = ~225,000 tokens/天</p>
            <p className="mt-2 pt-2" style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-accent)' }}>
              结论：CLAUDE.md 的每一行，每天被重复读取 ~150 次。值得吗？
            </p>
          </div>
        </div>

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
          审计结果：30 行中只有约 10 行是真正有价值的。其余 20 行只是在浪费 token。
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
            explanation: '这 12 行产生 ~360 tokens 的持续消耗，但没有一行能改变 Claude 的行为。Claude 默认就会写整洁代码、遵循 ESLint、理解标准目录结构。',
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
            explanation: '8 行 ~240 tokens，但每一行都是 Claude 无法从代码中自动推断的项目特有知识。删掉任何一行，Claude 大概率会犯错。',
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
                <td className="py-3 px-4">巨大的 token 浪费，而且 Claude 可以自己读文档</td>
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
          Section 4.3: Auto Memory 系统
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          4.3 Auto Memory 系统
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
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <span><strong>四种记忆类型</strong> -- 用户偏好（user）、对话反馈（feedback）、项目知识（project）、参考信息（reference）。</span>
          </li>
        </ul>

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
          Section 4.4: 团队 CLAUDE.md 治理
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          4.4 团队 CLAUDE.md 治理
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          个人项目的 CLAUDE.md 你可以随意写。但团队项目的 CLAUDE.md 是一个<strong>共享资产</strong>——
          它影响每个团队成员和 Claude 的交互方式。需要像对待代码一样对待它。
        </p>

        <QualityCallout title="核心原则">
          <p>
            <strong>CLAUDE.md 被 check 进 git = 你可以像 review 代码一样 review AI 行为规则。</strong>
            这意味着：每次修改 CLAUDE.md 都应该通过 PR，团队成员可以讨论和审查规则的合理性。
            AI 的行为不再是黑盒 -- 它的"配置文件"就在你的代码库里。
          </p>
        </QualityCallout>

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          谁来写
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          推荐模式：<strong>Tech Lead 起草，团队 PR Review</strong>。
        </p>

        <ul className="space-y-3 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <span><strong>Tech Lead 起草</strong> -- 最了解项目架构和技术决策的人写初稿。这确保 CLAUDE.md 中的规则反映的是实际的架构意图，而不是个人偏好。</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <span><strong>团队 PR Review</strong> -- 所有成员都有机会提出异议、补充遗漏、删除冗余。和 code review 一样的流程。</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <span><strong>新成员有"添加权"</strong> -- 新加入的成员在 onboarding 过程中最容易发现 CLAUDE.md 的遗漏。鼓励他们提 PR 补充。</span>
          </li>
        </ul>

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          怎么测试 CLAUDE.md 的效果
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          修改 CLAUDE.md 后怎么知道是否有效？用<strong>同一任务对比法</strong>：
        </p>

        <CodeBlock
          language="bash"
          title="测试 CLAUDE.md 变更的有效性"
          code={`# Step 1: 准备一个标准化的测试任务
# 例如："给 /api/products 添加分页功能"

# Step 2: 在修改 CLAUDE.md 之前，用这个任务做一次
# 记录：Claude 的行为、代码质量、是否违反了约定

# Step 3: 修改 CLAUDE.md

# Step 4: 开一个新会话，用同一个任务再做一次
# 记录：行为变化、质量变化

# Step 5: 对比
# - 新增的规则是否被 Claude 遵守了？
# - 删除的规则是否导致了质量下降？
# - Token 消耗变化（更短的 CLAUDE.md 应该更省 token）`}
          showLineNumbers={false}
        />

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          什么时候修剪（Prune）
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <strong>每月审计一次</strong>。审计流程：
        </p>

        <ol className="space-y-3 text-sm leading-relaxed list-decimal list-inside" style={{ color: 'var(--color-text-secondary)' }}>
          <li>团队每个成员回顾过去一个月：哪些 CLAUDE.md 规则 Claude 仍然违反？（这些规则需要加强或改写）</li>
          <li>哪些规则 Claude 从来没违反过？（可能是多余的 -- Claude 本来就会这样做）</li>
          <li>有没有新的"坑"被发现？（需要添加新规则）</li>
          <li>计算总行数和 token 成本，确保在合理范围内（建议不超过 80 行）</li>
        </ol>

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Monorepo 策略
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Monorepo 项目需要分层的 CLAUDE.md 策略：
        </p>

        <CodeBlock
          language="bash"
          title="Monorepo CLAUDE.md 分层"
          code={`my-monorepo/
├── CLAUDE.md                    # 全局规则（适用于所有包）
│   # - 通用构建命令
│   # - Git commit message 格式
│   # - PR 流程和 review 规范
│   # - 共享的命名约定
│
├── packages/
│   ├── api/
│   │   └── CLAUDE.md            # API 包的特有规则
│   │       # - API response wrapper 约定
│   │       # - 数据库 migration 规范
│   │       # - 认证/授权相关约定
│   │
│   ├── web/
│   │   └── CLAUDE.md            # 前端包的特有规则
│   │       # - 组件命名约定
│   │       # - 状态管理偏好
│   │       # - CSS/样式规范
│   │
│   └── shared/
│       └── CLAUDE.md            # 共享库的特有规则
│           # - 公共 API 设计原则
│           # - 版本管理约定
│           # - Breaking change 处理流程
│
└── .claude/
    └── rules/
        ├── api-routes.md        # 条件规则：处理 API 路由文件时加载
        └── migrations.md        # 条件规则：处理 migration 文件时加载`}
          showLineNumbers={false}
        />

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          分层的好处：
        </p>

        <ul className="space-y-3 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <span><strong>避免 token 浪费</strong> -- 当 Claude 只在处理前端代码时，API 的 migration 规范不会被加载。</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <span><strong>职责清晰</strong> -- 每个包的维护者负责自己包的 CLAUDE.md，不用协调全局文件的修改。</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <span><strong>规则不冲突</strong> -- 全局规则是"公约数"，包级别规则可以有不同的偏好（比如 API 用 kebab-case 路由，前端用 PascalCase 组件名）。</span>
          </li>
        </ul>

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          CLAUDE.md 生命周期
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          一个健康的 CLAUDE.md 管理流程：
        </p>

        <CodeBlock
          language="bash"
          title="CLAUDE.md 生命周期"
          code={`# Phase 1: 初始化
/init                         # Claude 自动扫描项目，生成初始 CLAUDE.md
# 审查生成的内容，删除冗余行

# Phase 2: 日常使用
# 正常使用 Claude Code 完成任务
# 观察 Claude 哪些地方犯了错误

# Phase 3: 发现问题，添加规则
# Claude 把测试文件放在了 test/ 而不是 __tests__/
# → 在 CLAUDE.md 中添加：
#   "Test files go in __tests__/ next to source files"

# Phase 4: 验证规则
# 用同样的任务测试，确认 Claude 现在遵守了新规则

# Phase 5: 月度审计
# 回顾哪些规则仍在被违反（加强）
# 哪些规则从未被违反（可能多余，考虑删除）
# 计算 token 成本，确保 ROI 为正

# Phase 6: 修剪
# 删除多余规则，保持 CLAUDE.md 精简
# 目标：每一行都通过"删掉这行 Claude 会犯错吗"测试

# → 回到 Phase 2，持续循环`}
          showLineNumbers={false}
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
    </div>
  )
}
