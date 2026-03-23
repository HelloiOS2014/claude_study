import { CodeBlock } from '../../components/content/CodeBlock'
import { PromptCompare } from '../../components/content/PromptCompare'
import { QualityCallout } from '../../components/content/QualityCallout'
import { ExerciseCard } from '../../components/content/ExerciseCard'
import { ConfigExample } from '../../components/content/ConfigExample'
import { DecisionTree } from '../../components/content/DecisionTree'
import type { TreeNode } from '../../components/content/DecisionTree'

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
   Chapter 6 Component
   ═══════════════════════════════════════════════ */

export default function Ch06() {
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
            06
          </span>
          <span
            className="text-xs uppercase tracking-widest font-medium"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Subagent Architecture
          </span>
        </div>
        <h1
          className="text-3xl md:text-4xl font-bold mb-4 leading-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          用 AI 做技术调研：Subagent 并行探索
        </h1>
        <p
          className="text-lg leading-relaxed max-w-3xl"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          到目前为止，你的所有操作都在一个会话里完成。这就像让一个人同时做调研、写代码、跑测试 ——
          上下文越来越长，Claude 越来越"健忘"，成本也在飞涨。
          这一章我们引入 Subagent：Claude Code 的"分身术"。每个 Subagent 是一个独立的 AI 进程，
          有自己的上下文、自己的工具权限、自己的执行空间。
          主 Agent 只需要发指令、收结果 —— 就像一个技术 Lead 指挥一个小团队。
        </p>
      </header>

      {/* ═══════════════════════════════════════════════
          Section 6.1: 上下文隔离模型
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          6.1 上下文隔离模型
        </h2>

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
          Section 6.2: 内置 vs 自定义 Subagent
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          6.2 内置 vs 自定义 Subagent
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Claude Code 提供了 5 种内置 Subagent 类型，覆盖最常见的场景。
          当内置类型不够用时，你可以用 <code style={{ color: 'var(--color-accent)' }}>.claude/agents/*.md</code> 创建完全自定义的 Agent。
        </p>

        {/* ── 内置 5 种类型 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          五种内置 Subagent
        </h3>

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

        {/* ── 决策树 ── */}
        <DecisionTree
          root={subagentChoiceTree}
          title="选择 Subagent 类型"
        />

        {/* ── 自定义 Agent ── */}
        <h3
          className="text-lg font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          自定义 Agent：完全控制
        </h3>

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
            15 个 Frontmatter 字段速查
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
      </section>

      {/* ═══════════════════════════════════════════════
          Section 6.3: 关键模式
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          6.3 关键模式
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          掌握了 Subagent 的基本概念后，下面是四种高级模式，每一种都解决一个真实的工程痛点。
        </p>

        {/* ── Pattern 1: Worktree 隔离 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          模式 1：Worktree 隔离 —— "安全网"
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          设置 <code style={{ color: 'var(--color-accent)' }}>isolation: worktree</code> 后，
          Subagent 会在一个独立的 git worktree 中工作。它看到的是项目的完整副本，
          但所有修改都局限在这个副本里。
        </p>

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

// 整个流水线由主 Agent 编排：
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
      </section>

      {/* ═══════════════════════════════════════════════
          Section 6.4: 实战 —— 并行 Bug 修复
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          6.4 实战：并行 Bug 修复
        </h2>

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
      </section>

      {/* ═══════════════════════════════════════════════
          Section 6.5: 失败模式与对策
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          6.5 失败模式与对策
        </h2>

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
      </section>
    </div>
  )
}
