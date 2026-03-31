import { lazy } from 'react'
import { CodeBlock } from '../../components/content/CodeBlock'
import { PromptCompare } from '../../components/content/PromptCompare'
import { QualityCallout } from '../../components/content/QualityCallout'
import { ExerciseCard } from '../../components/content/ExerciseCard'
import { ConfigExample } from '../../components/content/ConfigExample'
import { DecisionTree } from '../../components/content/DecisionTree'
import type { TreeNode } from '../../components/content/DecisionTree'
import { AnimationWrapper } from '../../components/animation/AnimationWrapper'
import { ReferenceSection } from '../../components/content/ReferenceSection'

const LazySubagentFanout = lazy(() => import('../../remotion/ch06/SubagentFanout'))
const LazyAgentTeamsTopology = lazy(() => import('../../remotion/ch07/AgentTeamsTopology'))

/* ═══════════════════════════════════════════════
   Decision Tree: 选择正确的 Subagent 类型
   ═══════════════════════════════════════════════ */

const subagentChoiceTree: TreeNode = {
  id: 'root',
  question: '你的任务需要什么能力？',
  description: '根据任务特征选择最合适的 Subagent 类型，避免浪费 token 或给予过多权限。',
  children: [
    {
      label: '只需要读代码 / 搜索',
      node: {
        id: 'read-only',
        question: '对搜索精度要求高吗？',
        children: [
          {
            label: '快速粗搜即可',
            node: {
              id: 'explore',
              question: '推荐：Explore Subagent',
              result: {
                text: '使用内置 Explore subagent（Haiku 模型，只读权限）。成本极低（约 ¥0.05-0.1/次），适合快速定位文件、理解代码结构。',
                tier: 'l1',
              },
            },
          },
          {
            label: '需要深度理解代码逻辑',
            node: {
              id: 'plan',
              question: '推荐：Plan Subagent',
              result: {
                text: '使用 Plan subagent（继承主模型，只读权限）。能深入分析代码逻辑和依赖关系，生成实施计划，但不会修改任何文件。',
                tier: 'l2',
              },
            },
          },
        ],
      },
    },
    {
      label: '需要修改文件',
      node: {
        id: 'write',
        question: '修改范围有多大？',
        children: [
          {
            label: '单文件 / 小范围',
            node: {
              id: 'general',
              question: '推荐：General-purpose Subagent',
              result: {
                text: '使用 General-purpose subagent（继承模型，所有工具）。有完整的读写能力，适合独立完成一个聚焦任务。设置 maxTurns 防止失控。',
                tier: 'l2',
              },
            },
          },
          {
            label: '跨多文件 / 可能搞乱主代码',
            node: {
              id: 'worktree',
              question: '推荐：自定义 Agent + Worktree 隔离',
              result: {
                text: '创建自定义 agent 并设置 isolation: worktree。所有修改在独立副本中进行，主代码完全不受影响。验证通过后再合并。这是处理大范围变更的安全网。',
                tier: 'l3',
              },
            },
          },
        ],
      },
    },
    {
      label: '需要执行 shell 命令',
      node: {
        id: 'bash',
        question: '推荐：Bash Subagent',
        result: {
          text: '使用 Bash subagent 执行系统命令。适合运行测试、构建、部署脚本等。注意设置 maxTurns 和权限范围，避免执行危险命令。',
          tier: 'l2',
        },
      },
    },
  ],
}

/* ═══════════════════════════════════════════════
   Decision Tree: Subagent vs Teams 选择
   ═══════════════════════════════════════════════ */

const topologyChoiceTree: TreeNode = {
  id: 'root',
  question: '你的任务需要多个 AI 之间共享信息吗？',
  description: '选择 Subagent 星型拓扑还是 Teams 网状拓扑，取决于协作需求。',
  children: [
    {
      label: '不需要，各自独立完成即可',
      node: {
        id: 'independent',
        question: '任务之间有先后依赖吗？',
        children: [
          {
            label: '有依赖，前一个的输出是后一个的输入',
            node: {
              id: 'pipeline',
              question: '推荐：Subagent 流水线',
              result: {
                text: '使用 Subagent 流水线（本章 8.3 的三阶段模式）。主 Agent 负责在阶段之间传递结果。简单、可预测、成本可控。',
                tier: 'l1',
              },
            },
          },
          {
            label: '无依赖，可以并行',
            node: {
              id: 'parallel',
              question: '推荐：Subagent 并行',
              result: {
                text: '使用多个 Subagent 并行执行。主 Agent 汇总结果。这是最简单的并行化方式，适合搜索、分析等只读任务。',
                tier: 'l1',
              },
            },
          },
        ],
      },
    },
    {
      label: '需要，Agent 之间需要协调',
      node: {
        id: 'coordination',
        question: '协调方式是什么？',
        children: [
          {
            label: '通过文件系统间接协调就够了',
            node: {
              id: 'file-coord',
              question: '推荐：Subagent + 文件约定',
              result: {
                text: '用 Subagent 配合文件约定（如 Agent A 写 spec.md，Agent B 读 spec.md）。成本低于 Teams，适合简单的信息传递。',
                tier: 'l2',
              },
            },
          },
          {
            label: '需要实时感知其他 Agent 的进度和变更',
            node: {
              id: 'realtime',
              question: '推荐：Agent Teams',
              result: {
                text: '启用 Agent Teams。Teammates 通过共享任务列表和文件更新进行协作。适合跨层变更（前端+后端+测试同时进行）等场景。注意：Teams 成本随 teammate 数量线性增长。',
                tier: 'l3',
              },
            },
          },
        ],
      },
    },
  ],
}

/* ═══════════════════════════════════════════════
   Chapter 8 Component
   ═══════════════════════════════════════════════ */

export default function Ch08() {
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
            08
          </span>
          <span
            className="text-xs uppercase tracking-widest font-medium"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Orchestration
          </span>
          <span
            className="text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 rounded"
            style={{
              color: 'var(--color-accent)',
              background: 'var(--color-accent-subtle)',
              border: '1px solid var(--color-border-accent)',
            }}
          >
            Harness / 协作层
          </span>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════
          Section 8.1: 为什么需要 Subagent（上下文隔离模型）
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          8.1 为什么需要 Subagent
        </h2>

        <p
          className="text-lg leading-relaxed max-w-3xl"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          到目前为止，你的所有操作都在一个会话里完成。这就像让一个人同时做调研、写代码、跑测试 ——
          上下文越来越长，Claude 越来越"健忘"，成本也在飞涨。
          Subagent 是 Claude Code 的"分身术"。每个 Subagent 是一个独立的 AI 进程，
          有自己的上下文、自己的工具权限、自己的执行空间。
          主 Agent 只需要发指令、收结果 —— 就像一个技术 Lead 指挥一个小团队。
        </p>

        {/* ── 可复现实验：上下文稀释 ── */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            border: '1px solid var(--color-border-accent)',
            background: 'var(--color-bg-secondary)',
          }}
        >
          <div
            className="px-5 py-3 text-sm font-semibold"
            style={{
              background: 'var(--color-accent-subtle)',
              borderBottom: '1px solid var(--color-border-accent)',
              color: 'var(--color-accent)',
            }}
          >
            可复现实验：上下文稀释效应
          </div>
          <div className="px-5 py-4 space-y-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <p>
              打开一个 Claude Code 会话，做一些代码搜索和修改操作。当上下文使用率超过 70%
              （参考 Ch01 的注意力衰减阈值）时，重复你在第 5 轮给过的同一条精确指令，对比两次输出的质量。
            </p>
            <div
              className="rounded-lg p-4 mt-2"
              style={{
                background: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border)',
              }}
            >
              <p style={{ color: 'var(--color-text-primary)' }}>
                <strong>具体例子：</strong>在第 5 轮你让 Claude 给函数加 JSDoc 注释，它写得详尽 ——
                参数描述、返回值说明、使用示例一应俱全。在第 35 轮你给出相同的指令，
                它可能只写一行描述。这不是 Claude 变懒了，是上下文窗口的注意力被前面 30 轮的工具调用记录稀释了。
              </p>
            </div>
            <p>
              <strong style={{ color: 'var(--color-accent)' }}>Subagent 的解法：</strong>
              每个 Subagent 获得全新的上下文，相当于
              <strong style={{ color: 'var(--color-text-primary)' }}>"上下文防火墙"</strong>。
              不管主会话已经跑了多少轮，Subagent 的注意力永远是 100% 集中在你交给它的那个任务上。
              质量不会随着会话长度而衰减。
            </p>
          </div>
        </div>

        <AnimationWrapper
          component={LazySubagentFanout}
          durationInFrames={180}
          fallbackText="Subagent 扇出动画加载失败"
        />

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          理解 Subagent 的关键在于一个词：<strong style={{ color: 'var(--color-text-primary)' }}>隔离</strong>。
          Subagent 不是"在主会话里打开一个新标签页"，而是一个完全独立的执行单元。
        </p>

        <div
          className="rounded-xl p-6 space-y-4"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <h3
            className="text-lg font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Subagent 收到什么
          </h3>
          <ul className="space-y-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <li className="flex items-start gap-3">
              <span className="shrink-0 mt-0.5 font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}>1</span>
              <span><strong style={{ color: 'var(--color-text-primary)' }}>Prompt 字符串</strong> —— 主 Agent 发送的任务描述。仅此而已。</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="shrink-0 mt-0.5 font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}>2</span>
              <span><strong style={{ color: 'var(--color-text-primary)' }}>最小系统提示</strong> —— 定义角色、可用工具、权限边界。</span>
            </li>
          </ul>

          <h3
            className="text-lg font-semibold mt-6"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Subagent 不收到什么
          </h3>
          <ul className="space-y-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <li className="flex items-start gap-3">
              <span className="shrink-0 mt-0.5 font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(248, 113, 113, 0.1)', color: '#f87171' }}>X</span>
              <span>父会话的对话历史 —— 主 Agent 跟你聊了 200 轮的内容，Subagent 一个字都看不到。</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="shrink-0 mt-0.5 font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(248, 113, 113, 0.1)', color: '#f87171' }}>X</span>
              <span>父会话的工具调用记录 —— Subagent 不知道你之前搜索过什么文件、改过什么代码。</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="shrink-0 mt-0.5 font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(248, 113, 113, 0.1)', color: '#f87171' }}>X</span>
              <span>其他 Subagent 的结果 —— 即使并行运行了 5 个 Subagent，它们彼此完全不可见。</span>
            </li>
          </ul>
        </div>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Subagent 执行完后，返回给主 Agent 的是<strong style={{ color: 'var(--color-text-primary)' }}>摘要</strong>，
          而不是完整的对话记录。完整的 transcript 独立存储，不受主会话 compact 的影响。
          这意味着即使主会话被压缩，Subagent 的详细工作记录依然可以通过 ID 恢复。
        </p>

        <CodeBlock
          language="bash"
          title="subagent-lifecycle.sh"
          code={`# 主 Agent 的视角：
# 1. 发送任务 → Subagent 获得独立上下文
# 2. Subagent 执行 → 自己调用工具，自己管理对话
# 3. 返回摘要 → 主 Agent 只看到精炼的结果

# 主 Agent 上下文：[你的对话] + [Subagent 摘要（~200 tokens）]
# Subagent 上下文：[任务 prompt] + [自己的工具调用记录]
# 两个上下文完全独立，互不影响

# 关键优势：
# - 主会话上下文不会因为调研任务膨胀
# - Subagent 有干净的上下文，不被无关对话污染
# - 多个 Subagent 可以并行执行，总时间 ≈ 最慢那个的时间`}
        />

        <QualityCallout title="为什么隔离是上下文管理的核武器">
          <p>
            传统做法：你在一个会话里先搜索代码、再分析架构、再写实现、再写测试。
            200K token 的上下文窗口很快就被搜索结果和分析过程塞满，Claude 开始遗忘早期的约束。
          </p>
          <p className="mt-2">
            Subagent 做法：搜索交给 Explore subagent（消耗它自己的上下文），分析交给 Plan subagent，
            实现交给 General-purpose subagent。主会话只保留每个阶段的摘要结论，
            上下文始终保持"战略级"的精炼。这就是为什么 Subagent 是上下文管理的核心武器。
          </p>
        </QualityCallout>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 8.2: 五种内置 Subagent
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          8.2 五种内置 Subagent
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Claude Code 提供了 5 种内置 Subagent 类型，覆盖最常见的场景。
          当内置类型不够用时，你可以用 <code style={{ color: 'var(--color-accent)' }}>.claude/agents/*.md</code> 创建完全自定义的 Agent。
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>类型</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>模型</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>权限</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>典型用途</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--color-text-secondary)' }}>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4 font-mono text-xs" style={{ color: 'var(--color-accent)' }}>Explore</td>
                <td className="py-3 px-4">Haiku</td>
                <td className="py-3 px-4">只读</td>
                <td className="py-3 px-4">快速搜索代码、理解项目结构、定位文件</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4 font-mono text-xs" style={{ color: 'var(--color-accent)' }}>Plan</td>
                <td className="py-3 px-4">继承主模型</td>
                <td className="py-3 px-4">只读</td>
                <td className="py-3 px-4">深度代码分析、生成实施计划、架构评审</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4 font-mono text-xs" style={{ color: 'var(--color-accent)' }}>General-purpose</td>
                <td className="py-3 px-4">继承主模型</td>
                <td className="py-3 px-4">所有工具</td>
                <td className="py-3 px-4">独立完成一个完整任务（写代码、运行命令）</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4 font-mono text-xs" style={{ color: 'var(--color-accent)' }}>Bash</td>
                <td className="py-3 px-4">继承主模型</td>
                <td className="py-3 px-4">Shell</td>
                <td className="py-3 px-4">执行系统命令、运行测试、构建项目</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4 font-mono text-xs" style={{ color: 'var(--color-accent)' }}>Guide</td>
                <td className="py-3 px-4">继承主模型</td>
                <td className="py-3 px-4">只读</td>
                <td className="py-3 px-4">指导用户学习、解释概念、教学辅助</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          Explore 使用 Haiku（最便宜的模型）是刻意的设计：搜索代码不需要强推理能力，
          用低成本模型做高频操作是最优 ROI 策略。
        </p>

        {/* ── 三种核心类型的调用示例 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          调用示例与返回格式
        </h3>

        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          下面是三种最常用的内置类型的 Agent tool 调用方式、返回结果格式和成本参考。
        </p>

        <CodeBlock
          language="typescript"
          title="explore-subagent-example.ts"
          code={`// ═══ Explore Subagent ═══
// 模型：Haiku | 权限：只读 | 成本：~$0.01-0.05/次

// Agent tool 调用：
{
  tool: "Agent",
  prompt: "搜索项目中所有使用 localStorage 的文件，" +
          "列出每处的文件路径、行号和用途。",
  type: "explore"
}

// 返回结果（摘要格式）：
// "Found 7 files using localStorage:
//  1. src/auth/session.ts:23 - storing JWT token
//  2. src/hooks/useTheme.ts:8 - persisting theme preference
//  3. src/utils/cache.ts:15,28,41 - client-side cache layer
//  4. src/components/Onboarding.tsx:12 - tracking onboarding state
//  5. src/pages/Settings.tsx:34 - saving user preferences
//  6. tests/helpers/mockStorage.ts:5 - test mock
//  7. src/legacy/oldAuth.ts:19 - deprecated, should be removed"
//
// 摘要约 150-200 tokens，不含搜索过程的工具调用细节`}
        />

        <CodeBlock
          language="typescript"
          title="plan-subagent-example.ts"
          code={`// ═══ Plan Subagent ═══
// 模型：继承主模型（通常 Sonnet）| 权限：只读 | 成本：~$0.05-0.20/次

// Agent tool 调用：
{
  tool: "Agent",
  prompt: "分析 src/auth/ 目录的认证架构。" +
          "识别安全风险，并给出重构建议。" +
          "输出需包含：当前架构总结、风险列表、推荐方案。",
  type: "plan"
}

// 返回结果（摘要格式）：
// "Architecture Analysis:
//  Current: JWT-based auth with refresh tokens stored in httpOnly cookies.
//  Session management via src/auth/session.ts (singleton pattern).
//
//  Risks identified:
//  1. [HIGH] Refresh token rotation not implemented - token reuse attack possible
//  2. [MED] No rate limiting on /auth/refresh endpoint
//  3. [LOW] Session cleanup relies on client-side expiry only
//
//  Recommended plan:
//  Phase 1: Add refresh token rotation (est. 2 files, ~50 LOC)
//  Phase 2: Add rate limiter middleware to auth routes
//  Phase 3: Implement server-side session invalidation"
//
// Plan subagent 的摘要通常更结构化，包含分析结论和行动建议`}
        />

        <CodeBlock
          language="typescript"
          title="general-subagent-example.ts"
          code={`// ═══ General-purpose Subagent ═══
// 模型：继承主模型 | 权限：所有工具 | 成本：随任务复杂度变化

// Agent tool 调用：
{
  tool: "Agent",
  prompt: "在 src/modules/user/service.ts 中：\\n" +
          "1. 给所有公共方法添加 JSDoc 注释\\n" +
          "2. 添加缺失的错误处理（参考 src/modules/post/service.ts）\\n" +
          "3. 运行 npm test -- --testPathPattern=user 确认测试通过\\n" +
          "技术栈：TypeScript + Prisma + Jest",
  type: "general"
}

// 返回结果（摘要格式）：
// "Completed all 3 tasks:
//  1. Added JSDoc to 6 public methods in user/service.ts
//  2. Added try/catch + NotFoundException for getUserById, updateUser
//  3. All 12 tests passing (npm test exit code 0)
//  Files modified: src/modules/user/service.ts (42 lines changed)"
//
// General-purpose 的成本取决于任务轮次：
// - 简单任务（5 轮以内）：~$0.05-0.15
// - 中等任务（10-15 轮）：~$0.20-0.50
// - 复杂任务（20+ 轮）：~$0.50-2.00`}
        />

        {/* ── 自定义 Agent 速查 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          自定义 Agent 快速起步
        </h3>

        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          当内置类型不满足需求时，在 <code style={{ color: 'var(--color-accent)' }}>.claude/agents/</code> 下创建
          Markdown 文件即可。下面是最小可用的自定义 Agent 定义：
        </p>

        <CodeBlock
          language="yaml"
          title=".claude/agents/my-reviewer.md — frontmatter 部分"
          code={`# .claude/agents/my-reviewer.md
---
model: haiku
effort: low
maxTurns: 10
disallowedTools: [Edit, Write]
---
Review the code for security issues.
Focus on: injection vulnerabilities, hardcoded secrets,
unsafe deserialization, and missing input validation.
Output format: severity | file:line | description | fix suggestion`}
        />

        <p className="text-sm leading-relaxed mt-3" style={{ color: 'var(--color-text-muted)' }}>
          只需 3 个 frontmatter 字段就能定义一个功能完整的自定义 Agent。
          其余字段使用默认值。详细的 15 字段配置见下文 8.3 节。
        </p>

        <DecisionTree
          root={subagentChoiceTree}
          title="选择 Subagent 类型"
        />
      </section>

      {/* ═══════════════════════════════════════════════
          Section 8.3: 自定义 Agent
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          8.3 自定义 Agent
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          当内置类型不够用时，在 <code style={{ color: 'var(--color-accent)' }}>.claude/agents/</code> 目录下
          创建 <code style={{ color: 'var(--color-accent)' }}>.md</code> 文件即可定义自定义 Agent。
          每个文件有 15 个 frontmatter 配置字段，让你精确控制 Agent 的行为。
        </p>

        <ConfigExample
          code={`---
name: "code-reviewer"
description: "严格审查代码质量和安全性"
tools:
  - Read
  - Grep
  - Glob
disallowedTools:
  - Edit
  - Write
  - Bash
model: "claude-sonnet-4-20250514"
permissionMode: "plan"
maxTurns: 15
skills: []
mcpServers: []
hooks: {}
memory: "project"
background: false
effort: "high"
isolation: "none"
---

# Code Reviewer Agent

你是一个严格的代码审查员。你的职责是：

## 审查清单
1. **安全性** - 检查注入、XSS、敏感数据泄露
2. **性能** - 识别 N+1 查询、不必要的重复计算、内存泄露风险
3. **可维护性** - 命名规范、函数长度、单一职责
4. **测试覆盖** - 关键路径是否有测试、边界条件是否覆盖

## 输出格式
对每个问题：
- 严重程度：🔴 Critical / 🟡 Warning / 🔵 Suggestion
- 文件和行号
- 问题描述
- 修复建议（但不要直接修改文件）

## 约束
- 你只能读取代码，不能修改任何文件
- 不要跳过任何文件，即使看起来没问题也要确认
- 如果代码质量很好，明确说"通过审查"而非沉默`}
          language="markdown"
          title=".claude/agents/code-reviewer.md"
          annotations={[
            { line: 2, text: 'Agent 名称，在 /agent 命令和 UI 中显示' },
            { line: 3, text: '描述文字，帮助主 Agent 理解何时调用这个 Agent' },
            { line: 4, text: '允许使用的工具白名单 —— 只给 Read/Grep/Glob，确保只读' },
            { line: 8, text: '不允许的工具黑名单 —— 显式禁止写入和执行' },
            { line: 12, text: '使用 Sonnet 模型 —— 比 Opus 便宜但审查能力足够' },
            { line: 13, text: 'plan 模式：执行工具前需要确认，增加安全性' },
            { line: 14, text: '最多 15 轮对话 —— 防止无限循环消耗 token' },
            { line: 18, text: 'project 级别记忆 —— Agent 会记住项目的代码规范和历史问题' },
            { line: 20, text: 'effort: high —— 让模型在每个文件上花更多时间思考' },
          ]}
        />

        <p className="text-base leading-relaxed mt-4" style={{ color: 'var(--color-text-secondary)' }}>
          下面是一个完整的实现者 Agent 示例，展示了 <code style={{ color: 'var(--color-accent)' }}>isolation: worktree</code> 的用法：
        </p>

        <ConfigExample
          code={`---
name: "implementer"
description: "在隔离环境中实现功能，不影响主代码"
tools:
  - Read
  - Grep
  - Glob
  - Edit
  - Write
  - Bash
model: "claude-sonnet-4-20250514"
permissionMode: "auto"
maxTurns: 30
memory: "project"
background: false
effort: "high"
isolation: "worktree"
---

# Implementer Agent

你是一个专注的功能实现者。在独立的 worktree 中工作。

## 工作流程
1. 仔细阅读任务要求
2. 搜索相关代码和依赖
3. 编写实现代码
4. 编写对应的测试
5. 运行测试确保通过
6. 提供变更摘要

## 约束
- 遵循项目已有的代码风格和模式
- 每个函数不超过 50 行
- 所有公共 API 必须有 JSDoc 注释
- 新增代码必须有对应的单元测试`}
          language="markdown"
          title=".claude/agents/implementer.md"
          annotations={[
            { line: 12, text: 'auto 模式：Agent 可以自动执行工具，无需每次确认' },
            { line: 13, text: '30 轮上限 —— 实现任务比审查需要更多轮次' },
            { line: 17, text: 'worktree 隔离！所有文件修改在 git worktree 副本中进行，主代码不受影响' },
          ]}
        />

        <div
          className="rounded-xl p-5 mt-6"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <h4
            className="text-sm font-semibold mb-3"
            style={{ color: 'var(--color-text-primary)' }}
          >
            14 个 Frontmatter 字段速查
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            <div><code style={{ color: 'var(--color-accent)' }}>name</code> — Agent 显示名称</div>
            <div><code style={{ color: 'var(--color-accent)' }}>description</code> — 功能描述</div>
            <div><code style={{ color: 'var(--color-accent)' }}>tools</code> — 允许的工具列表</div>
            <div><code style={{ color: 'var(--color-accent)' }}>disallowedTools</code> — 禁止的工具</div>
            <div><code style={{ color: 'var(--color-accent)' }}>model</code> — 使用的模型</div>
            <div><code style={{ color: 'var(--color-accent)' }}>permissionMode</code> — 权限模式</div>
            <div><code style={{ color: 'var(--color-accent)' }}>maxTurns</code> — 最大对话轮次</div>
            <div><code style={{ color: 'var(--color-accent)' }}>skills</code> — 启用的技能</div>
            <div><code style={{ color: 'var(--color-accent)' }}>mcpServers</code> — MCP 服务器</div>
            <div><code style={{ color: 'var(--color-accent)' }}>hooks</code> — 生命周期钩子</div>
            <div><code style={{ color: 'var(--color-accent)' }}>memory</code> — 记忆级别</div>
            <div><code style={{ color: 'var(--color-accent)' }}>background</code> — 是否后台运行</div>
            <div><code style={{ color: 'var(--color-accent)' }}>effort</code> — 推理投入程度</div>
            <div><code style={{ color: 'var(--color-accent)' }}>isolation</code> — 隔离模式</div>
          </div>
        </div>

        {/* ── 关键模式 ── */}
        <h3
          className="text-lg font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          关键模式
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          掌握了 Subagent 的基本概念后，下面是四种高级模式，每一种都解决一个真实的工程痛点。
        </p>

        {/* ── Pattern 1: Worktree 隔离实操 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          模式 1：Worktree 隔离实操 —— "安全网"
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          设置 <code style={{ color: 'var(--color-accent)' }}>isolation: "worktree"</code> 后，
          Claude Code 会在磁盘上创建一个真实的 git worktree（不是内存模拟）。
          Subagent 在这个独立的文件系统副本中工作，主项目目录完全不受影响。
        </p>

        <div
          className="rounded-xl p-5 mt-4"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <h4
            className="text-sm font-semibold mb-3"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Worktree 隔离的关键事实
          </h4>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <li className="flex items-start gap-3">
              <span className="shrink-0 mt-0.5 font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}>1</span>
              <span><strong style={{ color: 'var(--color-text-primary)' }}>磁盘级隔离</strong> —— 创建的是真实的 <code style={{ color: 'var(--color-accent)' }}>git worktree</code>，不是虚拟的内存副本。Subagent 的所有文件操作都发生在这个物理目录中。</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="shrink-0 mt-0.5 font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}>2</span>
              <span><strong style={{ color: 'var(--color-text-primary)' }}>完整可见性</strong> —— worktree 包含项目在分支点的完整快照，Subagent 可以读取所有文件、运行构建和测试。</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="shrink-0 mt-0.5 font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}>3</span>
              <span><strong style={{ color: 'var(--color-text-primary)' }}>合并由你决定</strong> —— Subagent 完成后，返回 worktree 路径和分支名。主 Agent（或你）决定是否合并、cherry-pick、还是丢弃。</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="shrink-0 mt-0.5 font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}>4</span>
              <span><strong style={{ color: 'var(--color-text-primary)' }}>适用场景</strong> —— 写操作密集的任务（重构、批量修改、实验性变更），尤其是多个 Agent 可能同时修改文件的情况。</span>
            </li>
          </ul>
        </div>

        <CodeBlock
          language="typescript"
          title="worktree-agent-tool-call.ts"
          code={`// Agent tool 调用（带 worktree 隔离）：
{
  tool: "Agent",
  prompt: "重构 src/auth/ 模块：\\n" +
          "1. 将 session.ts 中的单例模式改为依赖注入\\n" +
          "2. 添加 refresh token rotation\\n" +
          "3. 运行 npm test 确认所有测试通过\\n" +
          "项目使用 TypeScript + Express + Prisma",
  type: "general",
  isolation: "worktree"
}

// Subagent 执行过程（对你不可见，但后台发生的事）：
// 1. git worktree add /tmp/.claude-worktree-a1b2c3 HEAD
// 2. Subagent 的 CWD 被设置为 /tmp/.claude-worktree-a1b2c3
// 3. 所有 Edit/Write/Bash 操作都在 worktree 中执行
// 4. 执行完毕后返回：

// 返回结果：
// "Refactoring complete. Modified 4 files:
//  - src/auth/session.ts (singleton → DI, 85 lines changed)
//  - src/auth/refresh.ts (added token rotation, 42 lines added)
//  - src/auth/types.ts (new SessionProvider interface)
//  - tests/auth/session.test.ts (updated for DI, 12 tests passing)
//  Worktree: /tmp/.claude-worktree-a1b2c3
//  Branch: claude/worktree-a1b2c3"

// 你的选择：
// 合并：git merge claude/worktree-a1b2c3
// 审查：cd /tmp/.claude-worktree-a1b2c3 && git diff HEAD~1
// 丢弃：git worktree remove /tmp/.claude-worktree-a1b2c3`}
        />

        <CodeBlock
          language="bash"
          title="worktree-isolation-flow.sh"
          code={`# Worktree 隔离的工作流程：

# 1. 主 Agent 派发任务
# → Claude 自动创建 git worktree：
#    git worktree add /tmp/.claude-worktree-abc123 HEAD

# 2. Subagent 在 worktree 中工作
# → 所有 Read/Edit/Write/Bash 操作的根目录是 worktree
# → 主项目目录完全不受影响

# 3. Subagent 完成后
# → 返回变更摘要给主 Agent
# → 主 Agent 决定是否合并变更：
#    git merge --no-ff worktree-branch

# 4. 如果不满意
# → 直接丢弃 worktree，零成本回退
#    git worktree remove /tmp/.claude-worktree-abc123

# 真实场景：让 Subagent 重构整个模块
# 如果重构搞砸了 → 丢弃 worktree → 你的代码还是原样
# 如果重构成功了 → 合并 → 就像一个 PR`}
        />

        <PromptCompare
          bad={{
            label: '无隔离',
            prompt: `用 General-purpose subagent 重构 src/auth/ 模块

→ Subagent 直接修改了 12 个文件
→ 其中 3 个改错了
→ git diff 有 400+ 行变更
→ 需要手动逐个 revert 错误的修改`,
            explanation: '没有隔离时，Subagent 的错误直接影响你的工作目录。回退成本高，而且可能漏掉一些意外修改。',
          }}
          good={{
            label: 'Worktree 隔离',
            prompt: `用 isolation: worktree 的 implementer subagent 重构 src/auth/ 模块

→ Subagent 在独立副本中修改了 12 个文件
→ 主代码完全不受影响
→ 审查变更后决定合并或丢弃
→ 一条命令搞定`,
            explanation: 'Worktree 隔离让大范围修改变得安全。审查通过就合并，不满意就丢弃，零风险。',
          }}
        />

        {/* ── Pattern 2: 持久记忆 ── */}
        <h3
          className="text-lg font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          模式 2：持久记忆 —— Agent 越用越聪明
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          设置 <code style={{ color: 'var(--color-accent)' }}>memory: project</code> 后，
          Agent 在每次调用中积累的知识会持久化到项目级别的记忆文件中。
          下次调用同一个 Agent 时，它会自动加载之前的记忆。
        </p>

        <CodeBlock
          language="typescript"
          title="memory-evolution.ts"
          code={`// 第 1 次调用 code-reviewer：
// Agent 发现项目使用 ESLint + Prettier
// → 记忆："项目代码规范：ESLint airbnb, Prettier, 4 空格缩进"

// 第 3 次调用：
// Agent 发现团队偏好函数式组件
// → 记忆更新："React 组件一律使用函数式 + hooks，禁止 class 组件"

// 第 5 次调用：
// Agent 发现了一个反复出现的模式
// → 记忆更新："API 路由统一使用 zod 做入参校验，错误用 AppError 类抛出"

// 第 10 次调用：
// Agent 已经积累了丰富的项目知识
// → 审查效果接近一个熟悉项目的人类 reviewer
// → 不再需要每次都在 prompt 中重复说明代码规范
// → 能发现"虽然语法正确但不符合本项目惯例"的问题

// memory 支持的级别：
// "none"    — 无记忆，每次调用是全新的（适合一次性任务）
// "session" — 会话级记忆，关闭终端即丢失
// "project" — 项目级记忆，持久化到 .claude/ 目录（推荐）`}
        />

        {/* ── Pattern 3: 成本控制 ── */}
        <h3
          className="text-lg font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          模式 3：成本控制 —— 分层模型策略
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          不是所有任务都需要最强的模型。Subagent 的关键优势之一是可以为不同任务分配不同的模型和资源上限。
        </p>

        <CodeBlock
          language="yaml"
          title="cost-strategy.yaml"
          code={`# 分层模型策略（按任务类型分配模型）

搜索/定位任务:
  model: haiku          # 最便宜 ~¥0.05-0.1/次
  maxTurns: 10          # 搜索任务不需要太多轮
  effort: low           # 不需要深度推理
  示例: "查找所有使用 deprecated API 的文件"

实现/编码任务:
  model: sonnet         # 性价比最优 ~¥0.5-2/次
  maxTurns: 30          # 实现任务需要较多轮次
  effort: high          # 需要仔细思考
  示例: "实现用户权限模块，包含 RBAC 和测试"

架构/决策任务:
  model: opus           # 最强推理 ~¥2-5/次
  maxTurns: 20          # 架构讨论不需要太多轮
  effort: high          # 需要最深度的推理
  示例: "评估当前架构能否支撑 10x 流量增长"

# 实际成本对比（同一个功能开发）：
# 全部用 Opus:     ¥15-25
# 分层策略:        ¥5-8
# 节省:            60-70%`}
        />

        <QualityCallout title="maxTurns 是你的成本保险">
          <p>
            Haiku 搜索约 ¥0.05-0.1/次，对比 20 分钟手动搜索，ROI 高达 500:1。
            但如果忘记设置 maxTurns，一个失控的 Subagent 可能循环几十轮消耗大量 token。
            <strong> 始终为每个 Agent 设置 maxTurns</strong> —— 这是防止失控成本的最后一道防线。
          </p>
        </QualityCallout>

        {/* ── Pattern 4: 三阶段流水线 ── */}
        <h3
          className="text-lg font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          模式 4：三阶段流水线 —— PM → Architect → Implementer
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          将一个完整的功能开发拆成三个阶段，每个阶段由专门的 Agent 处理，
          前一阶段的输出是后一阶段的输入。
        </p>

        <CodeBlock
          language="typescript"
          title="three-stage-pipeline.ts"
          code={`// ═══ Stage 1: PM Spec Agent ═══
// 输入：用户的需求描述（自然语言）
// 输出：结构化的产品规格文档

// .claude/agents/pm-spec.md
// model: sonnet | tools: Read, Grep | maxTurns: 10
// 任务：将模糊需求转化为明确的验收标准

// PM Agent 的输出示例：
const pmOutput = {
  feature: "用户通知系统",
  userStories: [
    "用户可以收到站内通知",
    "用户可以标记通知为已读",
    "用户可以设置通知偏好（邮件/站内/两者）",
  ],
  acceptanceCriteria: [
    "通知列表支持分页，每页 20 条",
    "未读通知有视觉标识",
    "批量标记已读响应时间 < 200ms",
  ],
  outOfScope: ["推送通知", "通知模板自定义"],
}

// ═══ Stage 2: Architect Review Agent ═══
// 输入：PM 的规格文档 + 现有代码库
// 输出：技术设计方案 + 风险评估

// .claude/agents/architect-review.md
// model: opus | tools: Read, Grep, Glob | maxTurns: 15
// 任务：设计技术方案，确保与现有架构一致

// Architect Agent 的输出示例：
const architectOutput = {
  dataModel: "Notification 表 + NotificationPreference 表",
  apiDesign: "REST: GET /notifications, PATCH /notifications/:id",
  riskAssessment: [
    { risk: "通知量大时查询性能", mitigation: "添加 user_id + created_at 复合索引" },
    { risk: "与现有 WebSocket 的集成", mitigation: "复用已有的 ws 连接推送" },
  ],
  fileChanges: [
    "新增: src/models/notification.ts",
    "新增: src/routes/notifications.ts",
    "修改: src/websocket/handler.ts (添加通知推送)",
  ],
}

// ═══ Stage 3: Implementer + Tester Agent ═══
// 输入：Architect 的设计方案
// 输出：实现代码 + 测试代码

// .claude/agents/implementer.md
// model: sonnet | tools: ALL | maxTurns: 30 | isolation: worktree
// 任务：按设计方案实现，并编写测试

// 整个流水线由主 Agent 调度：
// 1. 调用 pm-spec → 获得规格
// 2. 将规格传给 architect-review → 获得设计
// 3. 将设计传给 implementer → 获得实现
// 每一步的输出是下一步的输入，主 Agent 只做"传话"和最终审核`}
        />

        {/* ── SendMessage 恢复 ── */}
        <h3
          className="text-lg font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          SendMessage 恢复机制
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          每个 Subagent 都有唯一的 ID。如果 Subagent 被中断（网络问题、超时等），
          可以通过 ID 恢复完整的上下文，从断点继续执行。
        </p>

        <CodeBlock
          language="bash"
          title="subagent-resume.sh"
          code={`# 每个 Subagent 执行时会生成唯一 ID
# 例如: subagent-a1b2c3d4

# 如果 Subagent 因超时中断：
# 主 Agent 可以通过 SendMessage 恢复
# → 不需要重新执行已完成的步骤
# → 完整的工具调用历史被保留
# → 从上次中断的位置继续

# 这意味着：
# - 长时间运行的任务不怕断线
# - 可以手动暂停后恢复
# - 调试时可以查看 Subagent 的完整执行记录`}
        />

        {/* ── 实战：并行 Bug 修复 ── */}
        <h3
          className="text-lg font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          实战：并行 Bug 修复
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          场景：你收到了一个 Bug 报告："用户登录后，在某些页面会被意外登出。"
          这是一个典型的"需要调研才能修复"的问题。我们来看如何用 Subagent 并行化整个流程。
        </p>

        <CodeBlock
          language="typescript"
          title="parallel-bug-fix-flow.ts"
          code={`// ═══ 第一阶段：主 Agent 制定计划 ═══

// 你对主 Agent 说：
// "用户反馈登录后在某些页面被意外登出，帮我排查和修复。"

// 主 Agent 分析后，决定并行派发 3 个 Explore subagent：

// ═══ 第二阶段：并行探索（3 个 Explore Subagent 同时执行）═══

// Explore Subagent #1：搜索认证逻辑
// Prompt: "搜索项目中所有与 authentication、session、
//          token refresh 相关的代码。列出文件路径和关键函数。"

// Explore Subagent #2：搜索路由守卫
// Prompt: "搜索所有路由中间件和页面守卫逻辑，
//          找出哪些页面有特殊的认证处理。"

// Explore Subagent #3：搜索最近变更
// Prompt: "查看最近 20 次 git commit，找出所有涉及
//          auth、session、cookie 的变更。"

// 三个 Subagent 并行执行！
// 每个 ~30 秒完成，总共 ~30 秒（而非串行的 ~90 秒）

// ═══ 第三阶段：主 Agent 汇总分析 ═══

// 主 Agent 收到 3 个摘要：
// #1: "认证使用 JWT，刷新逻辑在 src/auth/refresh.ts"
// #2: "发现 /dashboard 和 /settings 有不同的 guard 实现"
// #3: "3 天前有一个 commit 修改了 cookie 的 SameSite 属性"

// 主 Agent 判断：cookie SameSite 属性变更 + 不一致的 guard 实现
// 是最可能的原因。

// ═══ 第四阶段：并行修复 + 测试 ═══

// General-purpose Subagent #1（isolation: worktree）：
// "修复 src/auth/refresh.ts 中的 SameSite 配置，
//  确保与所有路由兼容。"

// General-purpose Subagent #2（isolation: worktree）：
// "为 /dashboard 和 /settings 的认证守卫编写
//  端到端测试，覆盖 token 刷新场景。"

// 两个 Subagent 在各自的 worktree 中独立工作
// 修复代码的不会影响写测试的，反之亦然

// ═══ 第五阶段：主 Agent 审查并合并 ═══
// 审查两个 worktree 的变更 → 合并 → 运行完整测试套件 → 完成`}
          highlightLines={[10, 11, 15, 16, 20, 21, 44, 45, 49, 50]}
        />

        <div
          className="rounded-xl p-5 mt-4"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <h4
            className="text-sm font-semibold mb-3"
            style={{ color: 'var(--color-text-primary)' }}
          >
            时间对比
          </h4>
          <div className="space-y-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <div className="flex items-center gap-3">
              <span className="shrink-0 font-mono text-xs px-2 py-1 rounded" style={{ background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.2)' }}>串行</span>
              <span>搜索(90s) + 分析(60s) + 修复(120s) + 测试(120s) = <strong>~6.5 分钟</strong></span>
            </div>
            <div className="flex items-center gap-3">
              <span className="shrink-0 font-mono text-xs px-2 py-1 rounded" style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.2)' }}>并行</span>
              <span>搜索(30s) + 分析(60s) + 修复+测试(120s) = <strong>~3.5 分钟</strong></span>
            </div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              并行化将可并行阶段的时间压缩到最慢单元的耗时。任务越多、可并行性越高，收益越大。
            </p>
          </div>
        </div>

        {/* ── 失败模式与对策 ── */}
        <h3
          className="text-lg font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          失败模式与对策
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Subagent 不是银弹。以下是三种最常见的失败模式，以及对应的解决方案。
        </p>

        {/* Failure 1 */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            border: '1px solid rgba(248, 113, 113, 0.3)',
            background: 'var(--color-bg-secondary)',
          }}
        >
          <div
            className="px-5 py-3 text-sm font-semibold flex items-center gap-2"
            style={{
              background: 'rgba(248, 113, 113, 0.08)',
              borderBottom: '1px solid rgba(248, 113, 113, 0.3)',
              color: '#f87171',
            }}
          >
            失败模式 1：修改了错误的文件
          </div>
          <div className="px-5 py-4 space-y-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <p>
              <strong style={{ color: 'var(--color-text-primary)' }}>症状：</strong>
              Subagent 完成任务后，你发现它修改了不在任务范围内的文件。
              例如：让它修复 auth 模块，它还顺手"优化"了 utils。
            </p>
            <p>
              <strong style={{ color: 'var(--color-text-primary)' }}>原因：</strong>
              Subagent 的 prompt 中没有明确限定文件范围。
            </p>
            <p>
              <strong style={{ color: 'var(--color-accent)' }}>对策：</strong>
              使用 <code style={{ color: 'var(--color-accent)' }}>isolation: worktree</code> 作为安全网；
              在 prompt 中明确列出"只修改以下文件"；
              在 Agent 定义的 markdown 正文中添加"严禁修改范围外的文件"约束。
            </p>
          </div>
        </div>

        {/* Failure 2 */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            border: '1px solid rgba(248, 113, 113, 0.3)',
            background: 'var(--color-bg-secondary)',
          }}
        >
          <div
            className="px-5 py-3 text-sm font-semibold flex items-center gap-2"
            style={{
              background: 'rgba(248, 113, 113, 0.08)',
              borderBottom: '1px solid rgba(248, 113, 113, 0.3)',
              color: '#f87171',
            }}
          >
            失败模式 2：返回的结果是垃圾
          </div>
          <div className="px-5 py-4 space-y-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <p>
              <strong style={{ color: 'var(--color-text-primary)' }}>症状：</strong>
              Subagent 返回的摘要模糊不清、生成的代码无法编译、或者完全偏离了任务。
            </p>
            <p>
              <strong style={{ color: 'var(--color-text-primary)' }}>原因：</strong>
              Prompt 中缺乏足够的上下文信息。记住：Subagent 看不到主会话的历史，
              你认为"显而易见"的背景信息，对 Subagent 来说完全不存在。
            </p>
            <p>
              <strong style={{ color: 'var(--color-accent)' }}>对策：</strong>
              Prompt 必须是<strong>自包含的</strong> —— 包含所有必要的技术栈、文件路径、代码规范、
              验收标准。把它当作写给一个新入职同事的任务单。
            </p>
          </div>
        </div>

        {/* Failure 3 */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            border: '1px solid rgba(248, 113, 113, 0.3)',
            background: 'var(--color-bg-secondary)',
          }}
        >
          <div
            className="px-5 py-3 text-sm font-semibold flex items-center gap-2"
            style={{
              background: 'rgba(248, 113, 113, 0.08)',
              borderBottom: '1px solid rgba(248, 113, 113, 0.3)',
              color: '#f87171',
            }}
          >
            失败模式 3：耗尽了 maxTurns 还没完成
          </div>
          <div className="px-5 py-4 space-y-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <p>
              <strong style={{ color: 'var(--color-text-primary)' }}>症状：</strong>
              Subagent 达到 maxTurns 限制后返回"任务未完成"的摘要。
              最后几轮通常是在重复之前的尝试或在死胡同里打转。
            </p>
            <p>
              <strong style={{ color: 'var(--color-text-primary)' }}>原因：</strong>
              任务颗粒度太大。一个 Subagent 试图完成太多事情。
            </p>
            <p>
              <strong style={{ color: 'var(--color-accent)' }}>对策：</strong>
              将大任务拆分为多个小任务，每个交给独立的 Subagent。
              经验法则：如果你觉得一个任务需要超过 20 轮对话才能完成，它一定需要被拆分。
            </p>
          </div>
        </div>

        <PromptCompare
          bad={{
            label: '信息不足的 Prompt',
            prompt: `帮我修复用户模块的 bug`,
            explanation: 'Subagent 不知道用户模块在哪里、什么技术栈、bug 的具体表现是什么。这几乎一定会返回垃圾结果。',
          }}
          good={{
            label: '自包含的 Prompt',
            prompt: `修复 src/modules/user/service.ts 中 getUserById 函数的 bug：
- 技术栈：TypeScript + Prisma + PostgreSQL
- 问题：当用户 ID 不存在时返回 500 而非 404
- 预期：不存在时抛出 NotFoundException
- 参考：src/modules/post/service.ts 的 getPostById 有正确实现
- 约束：只修改 service.ts 和对应的 service.spec.ts`,
            explanation: 'Prompt 包含了文件路径、技术栈、问题描述、预期行为、参考代码、修改范围 —— Subagent 有了完成任务所需的全部信息。',
          }}
        />

        <QualityCallout title="成本与 ROI">
          <p>
            Haiku 搜索约 ¥0.05-0.1/次，对比你 20 分钟的手动搜索时间，ROI 高达 500:1。
            但必须设置 maxTurns 防止失控 —— 一个没有 maxTurns 的 Subagent 可能在循环中
            跑 100+ 轮，把成本从 ¥0.1 变成 ¥10。maxTurns 是你的成本保险丝，永远不要省略它。
          </p>
        </QualityCallout>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 8.4: 上下文摘要的局限
          ═══════════════════════════════════════════════ */}
      <section>
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
          8.4 上下文摘要的局限
        </h2>

        <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          子代理返回的结果会被压缩为约 200 token 的摘要。这意味着细节会丢失。
        </p>

        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th className="text-left py-2 px-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>适合子代理</th>
                <th className="text-left py-2 px-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>不适合子代理</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-2 px-3">精确搜索（"找到 X 函数的定义"）</td>
                <td className="py-2 px-3">需要全局理解的分析</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-2 px-3">独立任务（"给这个文件加测试"）</td>
                <td className="py-2 px-3">跨多文件的紧耦合重构</td>
              </tr>
              <tr>
                <td className="py-2 px-3">格式化/检查（"lint 这个目录"）</td>
                <td className="py-2 px-3">需要保留完整推理链的决策</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          经验法则：如果任务的结果可以用一句话总结（"找到了/没找到""通过了/失败了"），适合子代理。
          如果结果需要详细的推理过程才有价值，在主上下文中做。
        </p>
      </section>

      {/* ═══════════════════════════════════════════════
          Divider: 实验性功能
          ═══════════════════════════════════════════════ */}
      <hr className="my-8" style={{ borderColor: 'var(--color-border)' }} />
      <div className="px-4 py-3 rounded-lg text-xs" style={{ background: 'var(--color-accent-subtle)', border: '1px solid var(--color-border-accent)' }}>
        <span style={{ color: 'var(--color-accent)' }}>实验性功能</span>
        <span className="ml-2" style={{ color: 'var(--color-text-secondary)' }}>以下内容基于 Agent Teams 实验性 API，可能随版本变化。</span>
      </div>

      {/* ═══════════════════════════════════════════════
          Section 8.5: 从星型到网状
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          8.5 从星型到网状
        </h2>

        <p
          className="text-lg leading-relaxed max-w-3xl"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          本章前半部分的 Subagent 是"主从"关系 —— 主 Agent 发号施令，Subagent 听命执行。
          但真实的软件工程不是独裁制：前端需要知道后端改了什么 API，测试需要知道哪些模块变了，
          架构师需要看到所有人的方案才能做决策。
          Agent Teams 将协作从星型拓扑升级为网状拓扑，让多个 AI 对等协作。
        </p>

        <AnimationWrapper
          component={LazyAgentTeamsTopology}
          durationInFrames={180}
          fallbackText="Agent Teams 拓扑动画加载失败"
        />

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Subagent 是<strong style={{ color: 'var(--color-text-primary)' }}>星型拓扑</strong>：
          所有信息必须经过主 Agent 中转。Agent Teams 是<strong style={{ color: 'var(--color-text-primary)' }}>网状拓扑</strong>：
          每个 teammate 有自己的收件箱和共享的任务列表，可以直接感知其他 teammate 的进度。
        </p>

        <CodeBlock
          language="bash"
          title="topology-comparison.sh"
          code={`# ═══ Subagent 星型拓扑 ═══
#
#         主 Agent
#        /   |   \\
#       v    v    v
#     Sub1  Sub2  Sub3
#
# - 单向通信：主 → 子
# - 子之间不可见
# - 主 Agent 是唯一的信息中心
# - 主 Agent 上下文承载所有协调信息

# ═══ Agent Teams 网状拓扑 ═══
#
#     Team Lead
#       ↕
#    ┌──┴──┐
#    ↕     ↕
#  前端  后端  ←→  测试
#    ↕           ↕
#    └─────→────┘
#
# - 双向通信（通过共享任务列表）
# - Teammate 可以看到其他人的任务状态
# - 通过文件和任务更新共享信息
# - Team Lead 负责分解任务和最终汇总`}
        />

        <div
          className="rounded-xl p-5"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <h4
            className="text-sm font-semibold mb-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            为什么需要从 Subagent 升级到 Teams？
          </h4>
          <div className="space-y-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <p>
              <strong style={{ color: 'var(--color-text-primary)' }}>场景：</strong>
              后端 Agent 修改了一个 API 的返回格式（从 <code style={{ color: 'var(--color-accent)' }}>{'{ data: [] }'}</code> 改为
              <code style={{ color: 'var(--color-accent)' }}> {'{ items: [], total: number }'}</code>），
              前端 Agent 需要知道这个变更才能正确更新调用代码，测试 Agent 需要知道新的响应结构才能写正确的断言。
            </p>
            <p>
              <strong style={{ color: '#f87171' }}>Subagent 的问题：</strong>
              主 Agent 必须先等后端 Subagent 完成，读取它的摘要，然后把变更信息手动转发给前端和测试 Subagent。
              每一个信息传递都增加主 Agent 的上下文负担，且容易丢失细节。
            </p>
            <p>
              <strong style={{ color: '#4ade80' }}>Teams 的解法：</strong>
              后端 teammate 修改 API 后更新任务状态，前端和测试 teammate 通过任务列表自动感知到变更。
              Team Lead 只需要做顶层协调，不需要当信息中转站。
            </p>
          </div>
        </div>

        <DecisionTree
          root={topologyChoiceTree}
          title="选择协作拓扑"
        />

        <CodeBlock
          language="bash"
          title="enable-teams.sh"
          code={`# 启用 Agent Teams（实验性功能）
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1

# 然后正常启动 Claude Code
claude

# 在对话中，你可以让 Claude 使用 Teams 模式：
# "用 Agent Teams 完成这个跨前后端的功能开发，
#  分配 3 个 teammate：frontend、backend、test"

# 注意：这是实验性功能，行为可能在未来版本中变化`}
        />

        {/* ── Teams 协调机制详解 ── */}
        <h3
          className="text-lg font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Teams 协调机制
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Agent Teams 通过三个核心工具实现协调：
          <code style={{ color: 'var(--color-accent)' }}>TaskCreate/TaskUpdate</code> 管理共享任务列表，
          <code style={{ color: 'var(--color-accent)' }}>SendMessage</code> 向指定 Agent 发送指令。
        </p>

        <CodeBlock
          language="typescript"
          title="teams-coordination-tools.ts"
          code={`// ═══ 1. TaskCreate/TaskUpdate — 共享任务列表 ═══
// Team Lead 创建任务并分配给 teammate：

// TaskCreate:
{
  tool: "TaskCreate",
  title: "实现 GET /api/notifications 端点",
  assignee: "backend",
  blockedBy: ["task-001"],  // 依赖数据模型任务
  description: "分页查询，每页 20 条，按 created_at 降序"
}

// Teammate 完成后更新状态：
// TaskUpdate:
{
  tool: "TaskUpdate",
  taskId: "task-002",
  status: "done",
  summary: "实现完成，支持 cursor-based 分页，已通过单元测试"
}

// 所有 teammate 都能看到任务列表的实时状态
// 被 blockedBy 阻塞的任务会在依赖完成后自动解除

// ═══ 2. SendMessage — 跨 Agent 通信 ═══
// 向特定 teammate 发送指令或信息：

{
  tool: "SendMessage",
  recipient: "frontend",
  message: "backend 已完成 notifications API，" +
           "响应格式：{ items: Notification[], cursor: string | null }，" +
           "请据此实现 useNotifications hook"
}

// ═══ 3. Agent tool + name — 可寻址的 Agent ═══
// 创建带名称的 Agent，使其可被 SendMessage 寻址：

{
  tool: "Agent",
  name: "backend",
  prompt: "你负责实现通知系统的后端 API...",
  type: "general"
}`}
        />

        {/* ── 拓扑选择指南 ── */}
        <h3
          className="text-lg font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          拓扑选择：Fan-out / Chain / Collaborative
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div
            className="rounded-xl p-5"
            style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
            }}
          >
            <h4
              className="text-sm font-semibold mb-2"
              style={{ color: 'var(--color-accent)' }}
            >
              Fan-out（扇出）
            </h4>
            <p className="text-xs mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              独立并行任务，无需互相感知。结果汇总到发起者。
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              适合：代码搜索、多文件 lint、独立模块测试
            </p>
          </div>
          <div
            className="rounded-xl p-5"
            style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
            }}
          >
            <h4
              className="text-sm font-semibold mb-2"
              style={{ color: 'var(--color-accent)' }}
            >
              Chain（流水线）
            </h4>
            <p className="text-xs mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              顺序执行，前一阶段的输出是后一阶段的输入。
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              适合：Spec → Design → Implement、ETL 管道
            </p>
          </div>
          <div
            className="rounded-xl p-5"
            style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
            }}
          >
            <h4
              className="text-sm font-semibold mb-2"
              style={{ color: 'var(--color-accent)' }}
            >
              Collaborative（协作）
            </h4>
            <p className="text-xs mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              共享状态 + 消息传递。Teammate 互相感知进度和变更。
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              适合：跨层功能开发（前端+后端+测试同步推进）
            </p>
          </div>
        </div>

        <p className="text-sm leading-relaxed mt-4" style={{ color: 'var(--color-text-muted)' }}>
          经验法则：能用 Fan-out 解决的不要用 Chain，能用 Chain 解决的不要用 Collaborative。
          复杂度越低的拓扑越可预测、越便宜。
        </p>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 8.6: Teams 实战
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          8.6 Teams 实战
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          让我们通过一个真实场景来看 Agent Teams 是如何工作的：
          实现一个"用户通知系统"，涉及后端 API、前端 UI、和端到端测试。
        </p>

        {/* ── 任务分解 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          跨层并行：Team Lead + Teammates
        </h3>

        <CodeBlock
          language="typescript"
          title="teams-task-decomposition.ts"
          code={`// Team Lead 的任务分解策略：
// 3-5 个 teammates，每个 5-6 个 tasks

// ═══ Team Lead ═══
// 职责：任务分解、依赖管理、最终验收
// 不直接写代码

// ═══ Teammate: backend ═══
// Tasks:
// 1. 创建 Notification 数据模型和 migration
// 2. 实现 GET /api/notifications 端点（分页）
// 3. 实现 PATCH /api/notifications/:id（标记已读）
// 4. 实现 POST /api/notifications/read-all（批量标记）
// 5. 添加 WebSocket 推送通知事件
// File ownership: src/models/*, src/routes/notifications*

// ═══ Teammate: frontend ═══
// Tasks:
// 1. 创建 NotificationBell 组件（显示未读数）
// 2. 创建 NotificationList 组件（下拉列表）
// 3. 实现 useNotifications hook（数据获取+缓存）
// 4. 集成 WebSocket 实时更新
// 5. 添加"全部标记已读"交互
// File ownership: src/components/notification/*, src/hooks/*

// ═══ Teammate: test ═══
// Tasks:
// 1. 后端 API 单元测试
// 2. 前端组件渲染测试
// 3. WebSocket 集成测试
// 4. 端到端测试：创建通知→显示→标记已读
// File ownership: tests/*, __tests__/*

// ═══ 依赖管理（blockedBy / blocks）═══
// frontend.task3 blockedBy backend.task2  (hook 依赖 API)
// frontend.task4 blockedBy backend.task5  (WS 客户端依赖服务端)
// test.task1 blockedBy backend.task2      (API 测试依赖 API 实现)
// test.task4 blockedBy frontend.task5     (E2E 依赖全部完成)

// ═══ 关键约束 ═══
// - File ownership 防止冲突：
//   backend 只能改 src/models/ 和 src/routes/
//   frontend 只能改 src/components/ 和 src/hooks/
//   test 只能改 tests/ 和 __tests__/
// - Teammates 不能直接修改其他人的文件`}
          highlightLines={[33, 34, 35, 36]}
        />

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <strong style={{ color: 'var(--color-text-primary)' }}>File Ownership</strong> 是 Teams
          中最重要的约束 —— 它相当于传统团队中的"代码负责制"。没有文件所有权划分，
          多个 teammate 可能同时修改同一个文件，导致冲突和覆盖。
        </p>

        {/* ── 通信限制 ── */}
        <h3
          className="text-lg font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          通信限制：文件和任务是唯一的桥梁
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          这是 Agent Teams 中最容易被误解的部分：teammate 之间<strong style={{ color: 'var(--color-text-primary)' }}>不能直接对话</strong>。
          一个 teammate 的文本输出对其他 teammate 是不可见的。它们之间唯一的通信渠道是：
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div
            className="rounded-xl p-5"
            style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
            }}
          >
            <h4
              className="text-sm font-semibold mb-2 flex items-center gap-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              <span style={{ color: 'var(--color-accent)' }}>1</span> 文件系统
            </h4>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Backend teammate 创建了 <code style={{ color: 'var(--color-accent)' }}>src/routes/notifications.ts</code>，
              Frontend teammate 可以读取它来了解 API 结构。
              这是最可靠的信息传递方式。
            </p>
          </div>
          <div
            className="rounded-xl p-5"
            style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
            }}
          >
            <h4
              className="text-sm font-semibold mb-2 flex items-center gap-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              <span style={{ color: 'var(--color-accent)' }}>2</span> 任务状态更新
            </h4>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Backend teammate 完成 task2 后更新状态为"done"，
              Frontend teammate 的被阻塞任务自动解除，开始执行。
              任务状态是协调进度的核心机制。
            </p>
          </div>
        </div>

        <QualityCallout title="Teams 的通信哲学">
          <p>
            Teams 刻意限制了 teammate 之间的直接通信 —— 这不是缺陷，而是设计。
            如果允许自由对话，N 个 teammate 之间会产生 N*(N-1)/2 条通信链路，
            上下文爆炸且不可预测。通过文件和任务状态这种"结构化通信"，
            信息传递变得可追溯、可审计。这和微服务之间用 API 而非共享内存通信是同一个道理。
          </p>
        </QualityCallout>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 8.7: 高级模式
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          8.7 高级模式
        </h2>

        {/* ── 竞争假说 ── */}
        <h3
          className="text-lg font-semibold mt-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          模式 1：竞争假说 —— 多角度排查同一个问题
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          当面对一个复杂 bug 或架构决策时，让 3 个 teammate 从不同角度同时调查，
          最终由 Team Lead 综合各方分析做出判断。
        </p>

        <CodeBlock
          language="typescript"
          title="competing-hypotheses.ts"
          code={`// 场景：API 响应变慢，P99 延迟从 200ms 上升到 800ms
// 不确定是数据库、应用层还是网络问题

// ═══ Teammate: db-investigator ═══
// 假说："数据库查询慢了"
// 调查方向：
// - 分析慢查询日志
// - 检查索引使用情况
// - 查看数据库连接池状态
// - 检查最近的 migration 是否影响了查询计划

// ═══ Teammate: app-investigator ═══
// 假说："应用层有性能退化"
// 调查方向：
// - 检查最近 10 次部署的代码变更
// - 分析内存使用趋势
// - 检查是否有 N+1 查询引入
// - 查看中间件链是否有阻塞操作

// ═══ Teammate: infra-investigator ═══
// 假说："基础设施/网络问题"
// 调查方向：
// - 检查 CDN 和负载均衡配置变更
// - 分析网络延迟指标
// - 检查容器资源限制
// - 查看是否有其他服务争抢资源

// ═══ Team Lead 汇总 ═══
// 三个角度的调查结果汇总后：
// - db-investigator: "发现一个缺少索引的查询，但影响只有 ~50ms"
// - app-investigator: "发现最近一次部署引入了同步日志写入"
// - infra-investigator: "基础设施正常，无异常"
//
// 结论：主因是同步日志（~500ms），次因是缺少索引（~50ms）
// 如果只从一个角度调查，可能只找到部分原因`}
        />

        {/* ── 9-Agent Code Review ── */}
        <h3
          className="text-lg font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          模式 2：多 Agent 代码审查
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          这是 Teams 最成熟的应用场景之一。HAMY Labs 公开了他们的 9-agent code review 方案，
          Anthropic 自己也有一个 5-reviewer 的代码审查系统。
        </p>

        <div
          className="rounded-xl p-5"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <h4
            className="text-sm font-semibold mb-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            HAMY Labs 9-Agent Code Review
          </h4>
          <div className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <p>9 个专项审查 Agent，各自聚焦一个维度：</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}>1</span>
                安全漏洞
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}>2</span>
                性能回退
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}>3</span>
                API 兼容性
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}>4</span>
                错误处理
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}>5</span>
                测试覆盖
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}>6</span>
                代码风格
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}>7</span>
                文档完整性
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}>8</span>
                依赖管理
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}>9</span>
                架构一致性
              </div>
            </div>
          </div>
        </div>

        <div
          className="rounded-xl p-5 mt-4"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <h4
            className="text-sm font-semibold mb-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Anthropic 内部代码审查系统
          </h4>
          <div className="space-y-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <p>Anthropic 自己用 AI 审查 AI 的代码，数据很有说服力：</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div
                className="rounded-lg p-4 text-center"
                style={{
                  background: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>5</div>
                <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>独立 Reviewer</div>
              </div>
              <div
                className="rounded-lg p-4 text-center"
                style={{
                  background: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div className="text-2xl font-bold" style={{ color: '#4ade80' }}>54%</div>
                <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>实质性意见占比</div>
              </div>
              <div
                className="rounded-lg p-4 text-center"
                style={{
                  background: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div className="text-2xl font-bold" style={{ color: '#4ade80' }}>&lt;1%</div>
                <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>误报率</div>
              </div>
            </div>
            <p className="mt-3">
              置信度评分机制：每条审查意见附带 0-100 的置信度分数。
              只有置信度 &gt;80 的意见才会展示给人类 reviewer，这就是为什么误报率能低于 1%。
            </p>
          </div>
        </div>

        <QualityCallout title="大规模变更的审查策略">
          <p>
            Teams 的成本随 teammate 数量线性增长 —— 它不是在省钱，而是在省时间。
            对于大规模变更（15-50+ 文件），推荐三层审查策略：
          </p>
          <ol className="list-decimal pl-5 mt-2 space-y-1">
            <li><strong>自动化检查</strong>：lint、type check、测试 —— 零成本筛掉基础问题</li>
            <li><strong>AI Review AI</strong>：多 Agent 并行审查 —— 以每分钟数百行的速度捕获 80% 的实质性问题</li>
            <li><strong>人类战略审查</strong>：使用风险加权采样 —— 只深度审查高风险模块（安全、支付、核心业务逻辑），其余信任 AI 审查结果</li>
          </ol>
        </QualityCallout>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 8.8: 长运行 Agent 模式
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          8.8 长运行 Agent 模式
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          当任务复杂到需要数十轮甚至上百轮工具调用时，单个 Agent 的上下文会逐渐饱和。
          Anthropic 推荐的解法是将长运行任务拆分为"初始化 + 执行"两阶段，
          并用文件保存增量状态。
        </p>

        {/* ── Initializer + Coding Agent ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Initializer + Coding Agent 模式
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          核心思想：用一个 Initializer Agent 搞清楚上下文（代码结构、依赖关系、技术约束），
          将结果写入 <code style={{ color: 'var(--color-accent)' }}>claude-progress.txt</code>，
          然后让 Coding Agent 基于这个文件开始工作。Coding Agent 每完成一个里程碑，就更新 progress 文件。
        </p>

        <CodeBlock
          language="typescript"
          title="initializer-coding-pattern.ts"
          code={`// ═══ Phase 1: Initializer Agent ═══
// 职责：理解任务、分析代码库、制定计划
{
  tool: "Agent",
  type: "plan",
  prompt: "分析以下需求并输出实施计划到 claude-progress.txt：\\n" +
          "需求：为 API 添加 RBAC 权限系统\\n" +
          "要求：\\n" +
          "1. 识别所有需要修改的文件\\n" +
          "2. 确定依赖顺序\\n" +
          "3. 将实施拆分为 5-8 个可独立验证的步骤\\n" +
          "4. 每步写清楚：改什么文件、改什么内容、如何验证"
}

// claude-progress.txt 内容示例：
// ## RBAC Implementation Plan
// Status: IN_PROGRESS (step 2/6)
//
// ### Step 1: Data Model [DONE]
// - Created: src/models/role.ts, src/models/permission.ts
// - Migration: 20240315_add_rbac_tables.sql
// - Verified: prisma migrate + seed
//
// ### Step 2: Middleware [IN_PROGRESS]
// - Target: src/middleware/authorize.ts
// - Pattern: Express middleware, check req.user.roles
// ...

// ═══ Phase 2: Coding Agent ═══
// 职责：按计划逐步实现，每步更新 progress 文件
{
  tool: "Agent",
  type: "general",
  isolation: "worktree",
  prompt: "读取 claude-progress.txt，从最后一个 IN_PROGRESS 步骤继续。\\n" +
          "每完成一步：\\n" +
          "1. 运行该步的验证命令\\n" +
          "2. 更新 claude-progress.txt 中的状态\\n" +
          "3. 继续下一步\\n" +
          "如果某步失败，在 progress 文件中记录错误信息后停止。"
}

// 优势：
// - 即使 Coding Agent 被中断，progress 文件保留了完整状态
// - 新的 Agent 可以从断点继续，不需要重新分析
// - progress 文件本身就是人类可读的执行日志`}
        />

        {/* ── GAN 三 Agent 架构 ── */}
        <h3
          className="text-lg font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Planner / Generator / Evaluator 架构
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Anthropic 博客介绍了一种类 GAN 的三 Agent 架构：Planner 制定方案，Generator 生成代码，
          Evaluator 评审质量并决定是否需要重新生成。这种"生成-评审"循环能显著提高复杂任务的输出质量。
        </p>

        <div
          className="rounded-xl p-5"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="space-y-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <div className="flex items-center gap-3">
              <span className="shrink-0 font-mono text-xs px-2 py-1 rounded font-semibold" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}>Planner</span>
              <span>分析需求，制定实施计划和验收标准</span>
            </div>
            <div className="flex items-center gap-1 pl-6" style={{ color: 'var(--color-text-muted)' }}>
              ↓
            </div>
            <div className="flex items-center gap-3">
              <span className="shrink-0 font-mono text-xs px-2 py-1 rounded font-semibold" style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80' }}>Generator</span>
              <span>按计划生成代码，运行测试</span>
            </div>
            <div className="flex items-center gap-1 pl-6" style={{ color: 'var(--color-text-muted)' }}>
              ↓
            </div>
            <div className="flex items-center gap-3">
              <span className="shrink-0 font-mono text-xs px-2 py-1 rounded font-semibold" style={{ background: 'rgba(248, 113, 113, 0.1)', color: '#f87171' }}>Evaluator</span>
              <span>审查代码质量、安全性、测试覆盖，决定 Accept / Reject + Feedback</span>
            </div>
            <div className="flex items-center gap-1 pl-6" style={{ color: 'var(--color-text-muted)' }}>
              ↺ Reject 时带反馈返回 Generator 重新生成
            </div>
          </div>
          <p className="text-xs mt-4" style={{ color: 'var(--color-text-muted)' }}>
            详细实现参考 Anthropic Engineering Blog: "Building effective agents" 中的 Evaluator-Optimizer 模式。
            这里不深入展开，重点理解"生成+评审循环"的核心思想即可。
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 8.9: ROI 验证
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          8.9 ROI 验证：什么时候值得用 Subagent
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Subagent 不是免费的 —— 每个 Subagent 都有启动开销（系统提示 + 初始上下文加载）。
          用 3 个 Subagent 完成一个本来 2 分钟就能搞定的任务，反而浪费时间和 token。
        </p>

        {/* ── 决策树 ── */}
        <div
          className="rounded-xl p-5"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <h4
            className="text-sm font-semibold mb-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            快速决策：直接做 vs 用 Subagent
          </h4>
          <div className="space-y-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <div className="flex items-start gap-3">
              <span className="shrink-0 font-mono text-xs px-2 py-1 rounded" style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.2)' }}>直接做</span>
              <span>任务 &lt; 2 分钟，单文件修改，不需要搜索 —— 直接在主会话完成，Subagent 的启动开销不值得。</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="shrink-0 font-mono text-xs px-2 py-1 rounded" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)', border: '1px solid var(--color-border-accent)' }}>可选</span>
              <span>任务 2-5 分钟，需要搜索或小范围修改 —— 如果当前上下文已经很满，用 Subagent；否则直接做。</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="shrink-0 font-mono text-xs px-2 py-1 rounded" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.2)' }}>Subagent</span>
              <span>任务 &gt; 5 分钟，可拆分为独立子任务 —— 用 Subagent 并行化，收益随可并行度线性增长。</span>
            </div>
          </div>
        </div>

        {/* ── Worked ROI 示例 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          实测 ROI 示例：RBAC 重构
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>指标</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>单会话</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>3 Subagents</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--color-text-secondary)' }}>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4">总 token 消耗</td>
                <td className="py-3 px-4">~45K tokens</td>
                <td className="py-3 px-4">~52K tokens (1.15x)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4">总耗时</td>
                <td className="py-3 px-4">~8 分钟（串行）</td>
                <td className="py-3 px-4">~4 分钟（并行）</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4">后期质量</td>
                <td className="py-3 px-4">第 30+ 轮质量下降明显</td>
                <td className="py-3 px-4">每个 Agent 全程高质量</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4">安全性</td>
                <td className="py-3 px-4">直接修改主代码</td>
                <td className="py-3 px-4">Worktree 隔离，可丢弃</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>结论</td>
                <td className="py-3 px-4" colSpan={2}>token 多花 15%，但时间减半、质量更高、风险可控。对于 5 分钟以上的任务，Subagent 几乎总是更优。</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Troubleshooting ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Subagent 质量排查清单
        </h3>

        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          当 Subagent 的输出质量不符合预期时，按以下顺序排查：
        </p>

        <div className="space-y-3">
          <div
            className="rounded-lg p-4 flex items-start gap-3"
            style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
            }}
          >
            <span className="shrink-0 font-mono text-xs px-2 py-1 rounded font-semibold" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}>1</span>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <strong style={{ color: 'var(--color-text-primary)' }}>Prompt 上下文是否充分？</strong>
              <span className="ml-1">Subagent 看不到主会话历史。确认 prompt 是自包含的 —— 包含技术栈、文件路径、预期行为、约束条件。</span>
            </div>
          </div>
          <div
            className="rounded-lg p-4 flex items-start gap-3"
            style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
            }}
          >
            <span className="shrink-0 font-mono text-xs px-2 py-1 rounded font-semibold" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}>2</span>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <strong style={{ color: 'var(--color-text-primary)' }}>maxTurns 是否足够？</strong>
              <span className="ml-1">如果 Agent 在最后一轮仍在工作（而非总结），说明轮次不够。适当增加 maxTurns 或拆分任务。</span>
            </div>
          </div>
          <div
            className="rounded-lg p-4 flex items-start gap-3"
            style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
            }}
          >
            <span className="shrink-0 font-mono text-xs px-2 py-1 rounded font-semibold" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}>3</span>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <strong style={{ color: 'var(--color-text-primary)' }}>模型选择是否匹配？</strong>
              <span className="ml-1">Haiku 擅长搜索和简单任务；需要深度推理的分析/架构任务应该用 Sonnet 或 Opus。模型不足比 maxTurns 不足更难诊断。</span>
            </div>
          </div>
        </div>

        <QualityCallout title="Subagent 的 80/20 法则">
          <p>
            80% 的 Subagent 使用场景只需要两种类型：Explore（搜索）和 General-purpose（执行）。
            先掌握这两种，遇到瓶颈再引入 Plan、自定义 Agent 和 Teams。
            过早引入复杂拓扑是最常见的"过度工程"陷阱 —— 三个简单 Subagent 通常比一个精心设计的 Teams 拓扑更有效。
          </p>
        </QualityCallout>

        <QualityCallout title="进阶：更多组合协作方案">
          <p>
            子代理是强大的构建块。想看完整的多代理重构协作、自动 PR Review 流水线等实战方案？
            见 <strong style={{ color: 'var(--color-accent)' }}>Ch13 高阶组合技</strong>。
          </p>
        </QualityCallout>
      </section>

      {/* ═══════════════════════════════════════════════
          Section: Exercises
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          练习
        </h2>

        <ExerciseCard
          tier="l1"
          title="使用内置 Explore Subagent 搜索代码库"
          description="在你的项目中，使用 Explore subagent 搜索一个特定的代码模式。例如：'找到所有直接操作 DOM 的代码'或'找到所有没有错误处理的 async 函数'。观察 Subagent 的搜索速度和结果质量。"
          checkpoints={[
            'Subagent 返回了结构化的搜索结果（文件路径 + 代码片段）',
            '搜索结果覆盖了项目中的大部分相关代码',
            '总耗时在 30 秒以内',
            '主会话的上下文没有因搜索而显著膨胀',
          ]}
        />

        <ExerciseCard
          tier="l2"
          title="编写自定义 code-reviewer Agent 并测试"
          description="创建 .claude/agents/code-reviewer.md，定义一个只读的代码审查 Agent。设置合适的 tools（只给 Read/Grep/Glob）、model（Sonnet）、maxTurns（15）和 memory（project）。然后在你的项目上运行它，审查最近的一次代码变更。"
          checkpoints={[
            'Agent 定义文件包含完整的 frontmatter 和正文指令',
            'tools 只包含只读工具，没有 Edit/Write/Bash',
            '审查输出按严重程度分级（Critical/Warning/Suggestion）',
            '每个问题都包含文件路径、行号和修复建议',
            '运行两次后，观察 memory: project 是否让第二次审查更精准',
          ]}
        />

        <ExerciseCard
          tier="l3"
          title="搭建三阶段流水线：Spec → Review → Implement"
          description="为你的项目中一个真实的待开发功能，搭建完整的三阶段 Subagent 流水线。创建 pm-spec.md、architect-review.md 和 implementer.md 三个 Agent 定义，然后让主 Agent 依次调用它们。Implementer 必须使用 worktree 隔离。"
          checkpoints={[
            '三个 Agent 定义文件都已创建，各自有合理的 model 和 maxTurns 配置',
            'PM Agent 产出了结构化的规格文档（用户故事 + 验收标准）',
            'Architect Agent 产出了技术设计方案，包含风险评估',
            'Implementer Agent 在 worktree 中完成了代码实现和测试',
            '所有测试通过后，成功将 worktree 的变更合并到主分支',
            '对比记录：三阶段流水线 vs 直接让一个 Agent 完成全部工作的质量差异',
          ]}
        />

        <ExerciseCard
          tier="l1"
          title="启用 Agent Teams，运行一个 2 人协作任务"
          description="设置 CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 环境变量，然后让 Claude 用 Teams 模式完成一个简单的任务：一个 teammate 写一个工具函数，另一个 teammate 写对应的测试。观察它们如何通过文件系统协调。"
          checkpoints={[
            '成功启用了 Agent Teams 功能',
            'Claude 创建了 2 个 teammate，各自有明确的任务',
            'Teammate 之间通过文件系统（而非直接对话）传递信息',
            '最终产出包含功能代码和对应的测试代码',
            '测试可以正常运行并通过',
          ]}
        />
      </section>

      {/* ═══════════════════════════════════════════════
          Reference Section
          ═══════════════════════════════════════════════ */}
      <ReferenceSection version="Claude Code v1.x">
        <div className="text-sm space-y-2" style={{ color: 'var(--color-text-secondary)' }}>
          <p>自定义 Agent 完整 frontmatter 字段（15 个，待补充）</p>
          <p>Teams 配置参考（待补充）</p>
          <p>Hook 事件：TeammateIdle, TaskCompleted（待补充）</p>
        </div>
      </ReferenceSection>
    </div>
  )
}
