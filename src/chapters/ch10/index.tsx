import { CodeBlock } from '../../components/content/CodeBlock'
import { QualityCallout } from '../../components/content/QualityCallout'
import { ExerciseCard } from '../../components/content/ExerciseCard'
import { ConfigExample } from '../../components/content/ConfigExample'
import { DecisionTree } from '../../components/content/DecisionTree'
import type { TreeNode } from '../../components/content/DecisionTree'
import { ReferenceSection } from '../../components/content/ReferenceSection'

/* ═══════════════════════════════════════════════
   Decision Tree: 工作流组合选择
   ═══════════════════════════════════════════════ */

const workflowTree: TreeNode = {
  id: 'root',
  question: '你的项目处于什么阶段?',
  description: '根据项目阶段和团队规模，选择合适的原则组合。',
  children: [
    {
      label: '全新项目 (Greenfield)',
      node: {
        id: 'greenfield',
        question: '团队规模多大?',
        children: [
          {
            label: '单人开发',
            node: {
              id: 'solo-green',
              question: '推荐: Spec 驱动 + 验证循环',
              result: {
                text: '先写 spec 再动手，用 Stop Hook 自迭代确保每步通过测试。配合 Context Priming 从第一天就建好 CLAUDE.md 规范。设置 maxIterations 防止失控。',
                tier: 'l2',
              },
            },
          },
          {
            label: '3-5 人团队',
            node: {
              id: 'small-team-green',
              question: '推荐: Spec 驱动 + 上下文隔离 + 验证循环',
              result: {
                text: '三原则全上。BMAD 式 spec 覆盖产品全生命周期，GSD 式上下文隔离让多人并行不污染，Writer/Reviewer 式验证循环保障质量。',
                tier: 'l3',
              },
            },
          },
        ],
      },
    },
    {
      label: '大型重构 / 迁移',
      node: {
        id: 'refactor',
        question: '推荐: Spec 驱动 + 验证循环',
        result: {
          text: 'RIPER-5 的五阶段流程天然适合重构——先充分理解现有代码（spec），再规划变更，每步验证。Writer/Reviewer 双会话消除确认偏差，确保重构质量。',
          tier: 'l2',
        },
      },
    },
    {
      label: '全栈应用开发',
      node: {
        id: 'fullstack',
        question: '推荐: 上下文隔离 + Spec 驱动',
        result: {
          text: 'Spec 驱动定义每个模块的接口和约束，GSD 的 wave parallelism 让多个 executor 并行工作，每个 executor 有 200K 的新鲜上下文。任务越可拆分，隔离收益越大。',
          tier: 'l3',
        },
      },
    },
  ],
}

/* ═══════════════════════════════════════════════
   Chapter 10 Component
   ═══════════════════════════════════════════════ */

export default function Ch10() {
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
            10
          </span>
          <span
            className="text-xs uppercase tracking-widest font-medium"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Workflow Design Principles
          </span>
        </div>
        <h1
          className="text-3xl md:text-4xl font-bold mb-4 leading-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          工作流设计原则：从方法论到思维方式
        </h1>
        <p
          className="text-lg leading-relaxed max-w-3xl"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          社区涌现了大量 AI 辅助开发方法论——GSD、BMAD、RIPER-5、Writer/Reviewer...
          但工具会过时，原则不会。这一章我们从方法论中提炼出<strong style={{ color: 'var(--color-text-primary)' }}>三个核心原则</strong>，
          然后教你如何用这些原则设计自己的工作流，而不是死记某个框架的步骤。
        </p>
      </header>

      {/* ═══════════════════════════════════════════════
          Section 10.1: 三个核心原则
          ═══════════════════════════════════════════════ */}
      <section>
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
          10.1 三个核心原则
        </h2>

        <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          所有成功的 AI 辅助开发方法论都收敛到了三个核心原则。理解这些原则比记住具体工具更重要——因为工具会变，原则不会。
        </p>

        {/* Principle 1 */}
        <div className="mb-8 pl-4" style={{ borderLeft: '3px solid var(--color-accent)' }}>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            原则 1：Spec 驱动
          </h3>
          <p className="mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            先写规格再执行，不要边想边做。无论是 GSD 的 atomic plan、BMAD 的 spec 文档、还是 AB Method 的 mission unit，
            核心都是同一件事——在 AI 动手之前，人先想清楚要什么。
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            没有 spec 的 AI 编码就是高级随机漫步。
          </p>
        </div>

        {/* Principle 2 */}
        <div className="mb-8 pl-4" style={{ borderLeft: '3px solid var(--color-tier-l1)' }}>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            原则 2：上下文隔离
          </h3>
          <p className="mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            确保第 50 个任务和第 1 个任务有同样的质量。GSD 的每个 executor 拿到 200K 新鲜上下文，
            不受前面任务的污染。Writer/Reviewer 用独立 session 消除确认偏差。
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            上下文越长，注意力越分散。隔离是对抗衰减的最可靠手段。
          </p>
        </div>

        {/* Principle 3 */}
        <div className="mb-8 pl-4" style={{ borderLeft: '3px solid var(--color-tier-l2)' }}>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            原则 3：验证循环
          </h3>
          <p className="mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            每步产出都经过自动验证，失败自动修复。Ralph Wiggum 的 Stop Hook、RIPER-5 的阶段门控、
            Writer/Reviewer 的双 session 审查——本质都是在 agent 和交付之间插入验证步骤。
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            LangChain 实测：仅加验证循环，任务完成率从 83% 提升到 96%。
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 10.2: 设计你自己的工作流
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          10.2 设计你自己的工作流
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          原则是积木，你的工作流是用积木搭的房子。不要照抄别人的方法论——理解原则后，按你的项目特征组合。
        </p>

        {/* ── 决策树 ── */}
        <DecisionTree
          root={workflowTree}
          title="工作流组合决策树"
        />

        <QualityCallout title="推荐通用组合: Context Priming + RIPER + Writer/Reviewer">
          <p className="mb-2">
            对于大多数生产项目，这个三层组合提供了最佳的效率/质量平衡：
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong style={{ color: 'var(--color-text-primary)' }}>Context Priming</strong>：确保每次会话都有正确的项目上下文（Spec 驱动的基础层）</li>
            <li><strong style={{ color: 'var(--color-text-primary)' }}>RIPER</strong>：约束开发流程——先理解再动手，先规划再执行（上下文隔离 + Spec 驱动）</li>
            <li><strong style={{ color: 'var(--color-text-primary)' }}>Writer/Reviewer</strong>：关键代码双会话审查，消除确认偏差（验证循环）</li>
          </ul>
        </QualityCallout>

        {/* ── 实战示例：用 Ch06-09 能力编排 PR Review Pipeline ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          实战：编排一个 PR Review Pipeline
        </h3>

        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          前面几章你学了 Skills（Ch06）、Hooks（Ch07）、Subagent（Ch08）、SDK（Ch09）。
          现在我们把它们组合起来，设计一个体现三原则的 PR 审查流水线。
        </p>

        <CodeBlock
          language="markdown"
          title="pr-review-pipeline-design.md"
          code={`# PR Review Pipeline — 三原则落地

## Spec 驱动 (Ch06 Skills)
.claude/skills/pr-review.md 定义审查标准:
  - 安全: SQL注入、XSS、认证绕过
  - 质量: 错误处理、边界条件、测试覆盖
  - 规范: 命名一致性、注释完整度

## 上下文隔离 (Ch08 Subagent)
每个维度由独立 subagent 审查:
  Subagent 1: 安全审查 (只看安全相关代码)
  Subagent 2: 质量审查 (只看逻辑和测试)
  Subagent 3: 规范审查 (只看风格和格式)
→ 每个 subagent 有新鲜的 200K 上下文

## 验证循环 (Ch07 Hooks + Ch09 SDK)
PostToolUse Hook: 审查完成后自动交叉验证
  - 如果安全审查发现高危问题 → 自动阻断 merge
  - 如果三个 subagent 意见冲突 → 触发仲裁 agent
SDK 编排: 用 claude-agent-sdk 串联整个流程
  - query({ prompt: securityReview, maxTurns: 5 })
  - query({ prompt: qualityReview, maxTurns: 5 })
  - query({ prompt: styleReview, maxTurns: 3 })
  - mergeResults() → 生成统一 PR comment`}
        />

        <ConfigExample
          title=".github/workflows/claude-review.yml — 三原则版"
          language="yaml"
          code={`name: Claude PR Review (Principle-based)
on:
  pull_request:
    types: [opened, synchronize]

permissions:
  contents: read
  pull-requests: write

jobs:
  review:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Claude Code Review
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: \${{ secrets.ANTHROPIC_API_KEY }}
          model: claude-sonnet-4-20250514
          max_turns: 5
          allowed_tools: "Read,Grep,Glob,Bash(git diff*),Bash(npm test*)"
          prompt: |
            审查这个 PR 的代码变更:
            1. 安全漏洞 (注入、认证绕过、敏感数据泄露)
            2. 逻辑错误和边界条件
            3. 与项目编码规范的一致性
            4. 测试覆盖是否充分
            将审查结果作为 PR comment 发布。`}
          annotations={[
            { line: 14, text: '超时保护——防止 Claude 陷入长时间循环（验证循环原则）' },
            { line: 26, text: '限制工具范围——CI 中 Claude 只能读和搜索，不能写文件（上下文隔离原则）' },
            { line: 25, text: 'max_turns 限制交互轮次，控制成本和时间' },
          ]}
        />

        {/* ── 方法论对比矩阵 ── */}
        <h3
          className="text-xl font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          方法论对比矩阵：选你需要的原则组合
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                {['方法论', 'Spec 驱动', '上下文隔离', '验证循环', '适用场景', '成本'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-3 py-2 font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody style={{ color: 'var(--color-text-secondary)' }}>
              {[
                ['Ralph Wiggum', '-', '-', 'Stop Hook 自迭代', 'Greenfield + TDD', '~$10/h'],
                ['RIPER-5', '五阶段 spec', '阶段门控', '阶段进入/退出验证', '重构 / 迁移', '标准'],
                ['AB Method', 'Mission spec', '8 专业 agent', '-', '全栈开发', '标准'],
                ['GSD', 'Atomic plan', '200K 新鲜上下文', '-', '大型/可拆分项目', 'N倍并行'],
                ['BMAD', '21 角色 + spec', '角色分工隔离', '工作流门控', '产品生命周期', '标准'],
                ['Writer/Reviewer', '-', '双会话隔离', '交叉审查', '质量敏感场景', '~2x'],
                ['Context Priming', '四层上下文体系', '-', '-', '所有项目(基础)', '零额外'],
              ].map((row, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-2.5">
                      {j === 0 ? (
                        <strong style={{ color: 'var(--color-text-primary)' }}>{cell}</strong>
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 10.3: 社区方法论案例研究
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          10.3 社区方法论案例研究
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          下面深入拆解三个方法论，每个都是某一原则的典范实现。不是让你照搬它们，而是理解它们<em>为什么</em>有效——
          然后把有效的部分移植到你自己的工作流中。
        </p>

        {/* ── GSD: 上下文隔离的典范 ── */}
        <h3
          className="text-xl font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          GSD (Get Shit Done)：上下文隔离的典范
        </h3>

        <div className="mb-4 pl-4" style={{ borderLeft: '3px solid var(--color-tier-l1)' }}>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <strong style={{ color: 'var(--color-text-primary)' }}>体现原则：</strong>上下文隔离。
            GSD 的核心创新是让每个 Executor 都获得 200K 的全新上下文，避免了上下文污染。
            一个 Orchestrator 负责任务分配和结果合并。GitHub 上约 23K stars。
          </p>
        </div>

        <CodeBlock
          language="bash"
          title="gsd-quickstart.sh"
          code={`# 安装
npx get-shit-done-cc

# GSD 的工作模式:
# Orchestrator (调度器)
#   ├── Wave 1: 基础设施
#   │   ├── Executor A: 数据库 schema   (200K 新鲜上下文)
#   │   └── Executor B: API 骨架        (200K 新鲜上下文)
#   │
#   ├── Wave 2: 业务逻辑 (依赖 Wave 1 完成)
#   │   ├── Executor C: 用户模块       (200K 新鲜上下文)
#   │   ├── Executor D: 订单模块       (200K 新鲜上下文)
#   │   └── Executor E: 支付模块       (200K 新鲜上下文)
#   │
#   └── Wave 3: 集成测试
#       └── Executor F: E2E 测试       (200K 新鲜上下文)

# 每个 Executor 只看到:
# 1. 全局 Spec
# 2. 自己负责的子任务描述
# 3. Wave 前置任务的输出结果
# 不会被其他 Executor 的上下文污染`}
        />

        <div className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <p><strong style={{ color: 'var(--color-text-primary)' }}>为什么有效：</strong>第 5 个 Executor 和第 1 个有同样的注意力质量——因为每个都是新鲜上下文。这正是原则 2 的工程化实现。</p>
          <p><strong style={{ color: 'var(--color-text-primary)' }}>适合：</strong>可以并行化的大型项目、批量迁移任务</p>
          <p><strong style={{ color: 'var(--color-text-primary)' }}>不适合：</strong>高度耦合的单体代码修改、需要深度上下文理解的调试</p>
          <p><strong style={{ color: 'var(--color-text-primary)' }}>成本注意：</strong>每个 Executor 都是独立会话，N 个并行 = N 倍成本</p>
        </div>

        {/* ── BMAD: Spec 驱动 + 角色分工的典范 ── */}
        <h3
          className="text-xl font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          BMAD：Spec 驱动 + 角色分工的典范
        </h3>

        <div className="mb-4 pl-4" style={{ borderLeft: '3px solid var(--color-accent)' }}>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <strong style={{ color: 'var(--color-text-primary)' }}>体现原则：</strong>Spec 驱动 + 上下文隔离（通过角色分工）。
            BMAD 模拟完整的敏捷团队——产品经理、架构师、UX 设计师、后端开发、前端开发、QA、DevOps 等 21 个角色，
            配合 34+ 预定义 Workflow，从用户故事到部署上线全流程覆盖。
          </p>
        </div>

        <CodeBlock
          language="bash"
          title="bmad-quickstart.sh"
          code={`# 安装 BMAD 方法论
npx bmad-method install

# 生成的结构:
# .bmad/
# ├── agents/          # 21 个角色定义
# │   ├── product-manager.md
# │   ├── architect.md
# │   ├── ux-designer.md
# │   ├── backend-dev.md
# │   ├── qa-engineer.md
# │   └── ... (16 more)
# ├── workflows/       # 34+ 工作流
# │   ├── sprint-planning.md
# │   ├── code-review.md
# │   ├── incident-response.md
# │   └── ...
# └── templates/       # 交付物模板
#     ├── prd.md
#     ├── architecture-decision.md
#     └── ...

# 使用示例: 让 "产品经理" 角色编写 PRD
claude "切换到 Product Manager 角色，为用户管理功能编写 PRD"`}
        />

        <div className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <p><strong style={{ color: 'var(--color-text-primary)' }}>为什么有效：</strong>每个角色有明确的 spec（职责边界），角色之间天然隔离上下文。产品经理不需要知道数据库细节，QA 不需要知道前端框架选型——这是原则 1 和 2 的同时落地。</p>
          <p><strong style={{ color: 'var(--color-text-primary)' }}>适合：</strong>需要完整产品生命周期管理的团队、从 0 到 1 的产品构建</p>
          <p><strong style={{ color: 'var(--color-text-primary)' }}>不适合：</strong>已有成熟流程的团队（会与现有流程冲突）、小型脚本/工具项目</p>
        </div>

        {/* ── Writer/Reviewer: 验证循环的典范 ── */}
        <h3
          className="text-xl font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Writer/Reviewer：验证循环的典范
        </h3>

        <div className="mb-4 pl-4" style={{ borderLeft: '3px solid var(--color-tier-l2)' }}>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <strong style={{ color: 'var(--color-text-primary)' }}>体现原则：</strong>验证循环 + 上下文隔离。
            两个 Claude Code 会话——Writer 写代码，Reviewer 审查。两个会话互不知道对方的上下文，
            Reviewer 看到的是"别人写的代码"而不是"自己写的代码"，从而天然消除确认偏差。零配置，任何项目都能用。
          </p>
        </div>

        <CodeBlock
          language="bash"
          title="writer-reviewer-workflow.sh"
          code={`# 终端 1: Writer 会话
claude "实现用户注册功能，要求: ..."

# Writer 完成后，在终端 2: Reviewer 会话
claude "审查 @src/auth/register.ts 的实现质量:
1. 安全漏洞 (SQL注入、XSS、密码明文存储)
2. 错误处理覆盖率
3. 边界条件 (空值、超长输入、并发)
4. 与现有代码风格的一致性
给出逐行审查意见。"

# 如果 Reviewer 发现问题，回到终端 1:
claude "Reviewer 发现了以下问题，请修复:
1. 密码未加盐哈希
2. 缺少邮箱格式验证
3. 并发注册同邮箱未做幂等"

# 高质量场景: 三轮足矣
# Writer → Reviewer → Writer Fix → 合并`}
        />

        <div className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <p><strong style={{ color: 'var(--color-text-primary)' }}>为什么有效：</strong>LLM 审查自己写的代码时有严重的确认偏差——"我写的当然是对的"。独立会话打破了这个循环。这是原则 3 最简单也最有效的实现。</p>
          <p><strong style={{ color: 'var(--color-text-primary)' }}>适合：</strong>安全敏感代码、高质量要求场景、独立开发者需要"第二双眼睛"</p>
          <p><strong style={{ color: 'var(--color-text-primary)' }}>不适合：</strong>需要快速出原型的探索阶段（多轮 review 降低速度）</p>
          <p><strong style={{ color: 'var(--color-text-primary)' }}>成本：</strong>约 2 倍 token（两个会话），但产出质量显著提高，总体 review 轮次减少</p>
        </div>

        {/* ── 其他方法论速查表 ── */}
        <h3
          className="text-xl font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          其他方法论速查
        </h3>

        <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          以下方法论同样值得了解，这里提供快速概览。它们各自强调了不同的原则侧面。
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                {['方法论', '核心机制', '主要原则', '一句话总结'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-3 py-2 font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody style={{ color: 'var(--color-text-secondary)' }}>
              {[
                [
                  'Ralph Wiggum',
                  'Stop Hook 自迭代',
                  '验证循环',
                  '利用 Stop Hook 让 Claude 自动"写→测→修"循环，直到测试全通过或达到 maxIterations',
                ],
                [
                  'RIPER-5',
                  '五阶段流程 + Memory Bank',
                  'Spec 驱动 + 验证循环',
                  'Research→Innovate→Plan→Execute→Review，每阶段有严格进入/退出条件',
                ],
                [
                  'AB Method',
                  'Spec + 8 专业化 Agent',
                  'Spec 驱动',
                  '先写详细 Spec，然后按 Mission（任务单元）顺序执行，8 个专业角色各司其职',
                ],
                [
                  'Context Priming',
                  '四层上下文注入',
                  'Spec 驱动（基础层）',
                  'CLAUDE.md → Skills → Dynamic Injection → PreCompact Hook，工程化管理上下文',
                ],
              ].map((row, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-2.5">
                      {j === 0 ? (
                        <strong style={{ color: 'var(--color-text-primary)' }}>{cell}</strong>
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <QualityCallout title="安全警告: maxIterations 是必需的">
          <p>
            任何涉及自迭代的方法论（Ralph Wiggum、GSD 等）<strong style={{ color: 'var(--color-text-primary)' }}>必须设置 maxIterations</strong>（建议 5-10 次）。
            没有上限的自迭代会导致：(1) 无限循环消耗 token（实测每小时约 $10.42）；(2) 在错误方向上越陷越深。
            真实案例：某 YC 黑客松团队在 6 个仓库上使用未限制的 Ralph Wiggum，48 小时花费 $297。
          </p>
        </QualityCallout>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 10.4: 反模式
          ═══════════════════════════════════════════════ */}
      <section>
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
          10.4 反模式
        </h2>

        <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          知道原则还不够，你得知道原则被违反时会发生什么。以下是社区中反复出现的教训。
        </p>

        <div className="space-y-6">
          <div className="p-4 rounded-lg" style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--color-tier-l3)' }}>无限循环</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              没有 maxIterations 的自我迭代 Hook。有人在 48 小时内烧掉了 $297，因为 agent 在一个无法通过的测试上无限重试。
              永远给循环设上限。
            </p>
          </div>

          <div className="p-4 rounded-lg" style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--color-tier-l3)' }}>上下文污染</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              50 轮对话后质量崩塌。不是模型变笨了，是你的上下文窗口充满了无关信息。
              解决方案：用子代理隔离，或者开新 session。
            </p>
          </div>

          <div className="p-4 rounded-lg" style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--color-tier-l3)' }}>过度编排</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              一个简单的 bug 修复用了 21 个角色和 34 个工作流。方法论是工具，不是信仰。
              先评估任务复杂度，再决定要多少基础设施。
            </p>
          </div>
        </div>
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
          title="识别原则：拆解一个方法论"
          description="选择 Ralph Wiggum (Stop Hook) 或 RIPER-5 中的一个，在你的项目中配置并完成一个小任务。完成后，分析这个方法论分别体现了三个核心原则中的哪些，以及哪个原则它没有覆盖。"
          checkpoints={[
            '方法论配置文件已正确创建',
            '使用该方法论完成了至少一个任务',
            '能指出该方法论体现了哪些核心原则',
            '能说出该方法论的 1 个优势和 1 个不足',
          ]}
        />

        <ExerciseCard
          tier="l2"
          title="组合原则：搭建 PR 审查 Pipeline"
          description="参考 10.2 节的 PR Review Pipeline 设计，为你的仓库配置一个体现三原则的审查流程。至少包含：(1) 用 Skills 定义审查标准（Spec 驱动）；(2) 用独立 session 或 subagent 隔离审查上下文；(3) 设置超时和 maxTurns（验证循环的安全阀）。"
          checkpoints={[
            'GitHub Actions workflow 文件已创建并能触发',
            'Claude Code 审查结果作为 PR comment 发布',
            'allowedTools 限制为只读工具（安全）',
            '设置了 timeout 和 max_turns（成本控制）',
            '能说出流程中分别体现了哪个核心原则',
          ]}
        />

        <ExerciseCard
          tier="l3"
          title="设计你自己的工作流"
          description="为你的团队设计一套自定义工作流，不照搬任何现有方法论，但确保三个核心原则都有覆盖。包括：用什么形式驱动 Spec（CLAUDE.md / ADR / PRD）、如何实现上下文隔离（Subagent / Worktree / 独立 Session）、验证循环怎么闭环（Hook / Writer-Reviewer / CI Gate）。附带成本估算和容灾预案。"
          checkpoints={[
            '完成了 Spec 驱动层设计（模板 + 标准）',
            '定义了上下文隔离策略和边界',
            '设计了验证循环并设置了安全阀（maxIterations / timeout）',
            '编写了 HANDOFF.md 容灾模板',
            '估算了月度成本并设置了预算上限',
          ]}
        />
      </section>

      {/* ═══ References ═══ */}
      <ReferenceSection version="Claude Code v1.x">
        <div className="text-sm space-y-2" style={{ color: 'var(--color-text-secondary)' }}>
          <p>GSD / BMAD / Writer-Reviewer / RIPER-5 项目链接</p>
          <p>各方法论适用场景对比表</p>
          <p>成本估算参考（待补充）</p>
        </div>
      </ReferenceSection>
    </div>
  )
}
