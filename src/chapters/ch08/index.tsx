import { CodeBlock } from '../../components/content/CodeBlock'
import { QualityCallout } from '../../components/content/QualityCallout'
import { ExerciseCard } from '../../components/content/ExerciseCard'
import { ConfigExample } from '../../components/content/ConfigExample'
import { DecisionTree } from '../../components/content/DecisionTree'
import type { TreeNode } from '../../components/content/DecisionTree'

/* ═══════════════════════════════════════════════
   Decision Tree: 方法论选择
   ═══════════════════════════════════════════════ */

const methodologyTree: TreeNode = {
  id: 'root',
  question: '你的项目处于什么阶段?',
  description: '根据项目阶段和团队规模选择合适的方法论组合。',
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
              question: '推荐: Ralph Wiggum + Context Priming',
              result: {
                text: 'Ralph Wiggum 的自迭代模式非常适合单人 greenfield 开发，配合 Context Priming 确保 CLAUDE.md 规范从第一天就到位。设置 maxIterations 防止失控。',
                tier: 'l2',
              },
            },
          },
          {
            label: '3-5 人团队',
            node: {
              id: 'small-team-green',
              question: '推荐: BMAD + Context Priming',
              result: {
                text: 'BMAD 的 21 角色敏捷模拟能覆盖产品全生命周期，Context Priming 确保团队共享统一的 CLAUDE.md 规范。适合需要从 PRD 到交付全流程管理的团队。',
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
        question: '推荐: RIPER-5 + Writer/Reviewer',
        result: {
          text: 'RIPER-5 的五阶段流程(Research/Innovate/Plan/Execute/Review)天然适合重构场景——先充分理解现有代码，再规划变更，最后执行。Writer/Reviewer 双会话模式消除确认偏差，确保重构质量。',
          tier: 'l2',
        },
      },
    },
    {
      label: '全栈应用开发',
      node: {
        id: 'fullstack',
        question: '推荐: AB Method + GSD',
        result: {
          text: 'AB Method 的 8 专业化 agent 和 spec 驱动模式适合全栈开发。如果任务可以并行化，GSD 的 wave parallelism 能让多个 executor 同时工作，每个 executor 有 200K 的新鲜上下文。',
          tier: 'l3',
        },
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
            Full Lifecycle
          </span>
        </div>
        <h1
          className="text-3xl md:text-4xl font-bold mb-4 leading-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          用 AI 管理全流程：从需求到交付
        </h1>
        <p
          className="text-lg leading-relaxed max-w-3xl"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          前面七章你已经掌握了 Claude Code 的核心能力。但单点能力不等于全局效率——你需要一套<strong style={{ color: 'var(--color-text-primary)' }}>端到端的工作流</strong>把这些能力串联起来。
          这一章我们深入拆解社区最成熟的方法论、CI/CD 集成、SDK 编程式调用，以及多实例并行开发，
          让你从"会用 Claude Code"进化到"用 Claude Code 管理整个交付流程"。
        </p>
      </header>

      {/* ═══════════════════════════════════════════════
          Section 8.1: 社区方法论深度拆解
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          8.1 社区方法论深度拆解
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Claude Code 的开放生态催生了大量社区方法论。它们不是"最佳实践集锦"——每一个都有明确的适用场景、成本模型和局限性。
          下面我们逐一拆解，帮你做出合理选择。
        </p>

        {/* ── Ralph Wiggum ── */}
        <h3
          className="text-xl font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Ralph Wiggum：Stop Hook 自迭代
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <strong>核心原理：</strong>利用 Stop Hook（Claude 决定停止时触发的钩子）让 Claude 自动检查是否真正完成，
          如果没完成则继续迭代。这创造了一个"写代码 → 测试 → 修复 → 再测试"的自动循环，直到所有测试通过或达到最大迭代次数。
        </p>

        <ConfigExample
          title=".claude/settings.json — Ralph Wiggum Stop Hook"
          language="json"
          code={`{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/scripts/stop-hook.js '$CLAUDE_TASK_STATE'"
          }
        ]
      }
    ]
  },
  "permissions": {
    "allow": [
      "Bash(npm test*)",
      "Bash(npx jest*)",
      "Read(*)",
      "Edit(*)",
      "Write(*)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(git push*)"
    ]
  }
}`}
          annotations={[
            { line: 3, text: 'Stop Hook 在 Claude 决定停止时触发——这是 Ralph Wiggum 的核心机制' },
            { line: 8, text: '检查任务状态，如果测试未通过则返回 "continue" 让 Claude 继续工作' },
            { line: 17, text: '只允许测试和代码编辑，禁止危险操作——这是安全护栏' },
          ]}
        />

        <div
          className="p-4 rounded-lg"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            5 分钟 Quickstart
          </p>
          <ol className="list-decimal list-inside text-sm space-y-1.5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            <li>在项目根目录创建 <code style={{ color: 'var(--color-accent)' }}>.claude/scripts/stop-hook.js</code>（检查测试状态的脚本）</li>
            <li>配置 <code style={{ color: 'var(--color-accent)' }}>.claude/settings.json</code> 中的 Stop Hook（如上）</li>
            <li>在 CLAUDE.md 中添加规则："每次修改后必须运行测试"</li>
            <li>启动 Claude Code，给出任务描述，让它自动迭代直到完成</li>
          </ol>
        </div>

        <QualityCallout title="安全警告: maxIterations 是必需的">
          <p>
            Ralph Wiggum 模式<strong style={{ color: 'var(--color-text-primary)' }}>必须设置 maxIterations</strong>（建议 5-10 次）。
            没有上限的自迭代会导致：(1) 无限循环消耗 token（实测每小时约 $10.42）；(2) 在错误方向上越陷越深。
            真实案例：某 YC 黑客松团队在 6 个仓库上使用未限制的 Ralph Wiggum，48 小时花费 $297。
          </p>
        </QualityCallout>

        <div className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <p><strong style={{ color: 'var(--color-text-primary)' }}>适合：</strong>有完善测试套件的 Greenfield 项目、TDD 开发流程</p>
          <p><strong style={{ color: 'var(--color-text-primary)' }}>不适合：</strong>没有测试的遗留代码（无法自动判断"完成"）、需要人工审查设计决策的场景</p>
          <p><strong style={{ color: 'var(--color-text-primary)' }}>成本：</strong>约 $10.42/小时（自迭代 token 消耗高），建议配合 <code style={{ color: 'var(--color-accent)' }}>--max-turns</code> 使用</p>
        </div>

        {/* ── RIPER-5 ── */}
        <h3
          className="text-xl font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          RIPER-5：五阶段结构化流程
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <strong>核心原理：</strong>将开发过程严格分为 5 个阶段——<strong style={{ color: 'var(--color-text-primary)' }}>R</strong>esearch（理解现状）→
          <strong style={{ color: 'var(--color-text-primary)' }}>I</strong>nnovate（设计方案）→
          <strong style={{ color: 'var(--color-text-primary)' }}>P</strong>lan（制定计划）→
          <strong style={{ color: 'var(--color-text-primary)' }}>E</strong>xecute（执行变更）→
          <strong style={{ color: 'var(--color-text-primary)' }}>R</strong>eview（验证结果）。
          每个阶段有严格的进入/退出条件，配合 3 个 agent 协同和 Memory Bank 持久化上下文。
        </p>

        <CodeBlock
          language="markdown"
          title="RIPER-5-workflow.md"
          code={`# RIPER-5 阶段流转

## Phase 1: Research (只读)
- 阅读代码、理解架构、识别依赖
- 输出: 现状分析文档
- 规则: 此阶段禁止任何代码修改

## Phase 2: Innovate (讨论)
- 提出多个可选方案、权衡利弊
- 输出: 方案对比表
- 规则: 此阶段禁止写代码，只讨论

## Phase 3: Plan (规划)
- 将选定方案拆解为具体步骤
- 输出: 编号步骤清单 + 影响范围
- 规则: 每个步骤需要人工确认

## Phase 4: Execute (执行)
- 严格按计划逐步执行
- 输出: 代码变更 + 每步验证
- 规则: 不得偏离 Plan，有问题回到 Phase 2

## Phase 5: Review (复查)
- 对照原始需求逐项验证
- 输出: 验证矩阵 (需求 → 实现 → 测试)
- 规则: 未通过项回到 Phase 4 修复

# Memory Bank (跨会话持久化)
- .claude/memory/project-context.md  → 架构概览
- .claude/memory/decisions.md         → 设计决策记录
- .claude/memory/progress.md          → 进度追踪`}
        />

        <div className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <p><strong style={{ color: 'var(--color-text-primary)' }}>适合：</strong>复杂重构、大型迁移、需要可追溯决策链的场景</p>
          <p><strong style={{ color: 'var(--color-text-primary)' }}>不适合：</strong>简单的 bug 修复（流程开销过重）、快速原型</p>
          <p><strong style={{ color: 'var(--color-text-primary)' }}>组合建议：</strong>与 Writer/Reviewer 组合，在 Review 阶段使用双会话模式消除确认偏差</p>
        </div>

        {/* ── AB Method ── */}
        <h3
          className="text-xl font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          AB Method：Spec 驱动 + 8 专业化 Agent
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <strong>核心原理：</strong>先写详细 Spec（规格说明），然后按顺序执行 Mission（任务单元）。
          8 个专业化 Agent 各司其职——架构师、前端、后端、测试、数据库等。每个 Mission 是独立的、可验证的工作单元。
        </p>

        <CodeBlock
          language="bash"
          title="ab-method-quickstart.sh"
          code={`# 1. 安装 AB Method
npx ab-method

# 2. 它会在项目中生成:
#    .claude/ab-method/
#    ├── spec.md           # 项目规格说明模板
#    ├── missions/         # 任务队列目录
#    └── agents/           # 8 个专业化 agent 配置
#        ├── architect.md
#        ├── frontend.md
#        ├── backend.md
#        ├── tester.md
#        └── ...

# 3. 编写 spec，然后:
claude "执行 Mission 1: 数据库 schema 设计"
# Agent 会根据 spec 自动选择合适的专业角色`}
        />

        <div className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <p><strong style={{ color: 'var(--color-text-primary)' }}>适合：</strong>全栈应用开发、需要多角色协作的项目</p>
          <p><strong style={{ color: 'var(--color-text-primary)' }}>不适合：</strong>单一技术栈的简单项目（agent 切换开销大于收益）</p>
        </div>

        {/* ── GSD ── */}
        <h3
          className="text-xl font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          GSD (Get Shit Done)：Wave 并行执行
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <strong>核心原理：</strong>将任务分解为多个 Wave（批次），每个 Wave 内的子任务可以并行执行。
          关键创新是每个 Executor 都获得 200K 的<strong style={{ color: 'var(--color-text-primary)' }}>全新上下文</strong>，
          避免了上下文污染。一个 Orchestrator 负责任务分配和结果合并。GitHub 上约 23K stars。
        </p>

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
          <p><strong style={{ color: 'var(--color-text-primary)' }}>适合：</strong>可以并行化的大型项目、批量迁移任务</p>
          <p><strong style={{ color: 'var(--color-text-primary)' }}>不适合：</strong>高度耦合的单体代码修改、需要深度上下文理解的调试</p>
          <p><strong style={{ color: 'var(--color-text-primary)' }}>成本注意：</strong>每个 Executor 都是独立会话，N 个并行 = N 倍成本</p>
        </div>

        {/* ── BMAD ── */}
        <h3
          className="text-xl font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          BMAD：21 Agent 敏捷团队模拟
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <strong>核心原理：</strong>模拟完整的敏捷团队——产品经理、架构师、UX 设计师、后端开发、前端开发、
          QA、DevOps 等 21 个角色，配合 34+ 预定义 Workflow。从用户故事编写到部署上线的全流程覆盖。
        </p>

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
          <p><strong style={{ color: 'var(--color-text-primary)' }}>适合：</strong>需要完整产品生命周期管理的团队、从 0 到 1 的产品构建</p>
          <p><strong style={{ color: 'var(--color-text-primary)' }}>不适合：</strong>已有成熟流程的团队（会与现有流程冲突）、小型脚本/工具项目</p>
        </div>

        {/* ── Writer/Reviewer ── */}
        <h3
          className="text-xl font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Writer/Reviewer：双会话消除确认偏差
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <strong>核心原理：</strong>开两个 Claude Code 会话——Writer 负责写代码，Reviewer 负责审查。
          两个会话<strong style={{ color: 'var(--color-text-primary)' }}>互不知道对方的上下文</strong>，
          Reviewer 看到的是"别人写的代码"而不是"自己写的代码"，从而天然消除了确认偏差。
          零配置，任何项目都能用。
        </p>

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
          <p><strong style={{ color: 'var(--color-text-primary)' }}>适合：</strong>安全敏感代码、高质量要求场景、独立开发者需要"第二双眼睛"</p>
          <p><strong style={{ color: 'var(--color-text-primary)' }}>不适合：</strong>需要快速出原型的探索阶段（多轮 review 降低速度）</p>
          <p><strong style={{ color: 'var(--color-text-primary)' }}>成本：</strong>约 2 倍 token（两个会话），但产出质量显著提高，总体 review 轮次减少</p>
        </div>

        {/* ── Context Priming ── */}
        <h3
          className="text-xl font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Context Priming：工程化上下文注入
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <strong>核心原理：</strong>Context Priming 不是一个独立方法论，而是<strong style={{ color: 'var(--color-text-primary)' }}>所有方法论的基础层</strong>。
          它通过四个维度系统性地工程化 Claude 的上下文：
        </p>

        <CodeBlock
          language="markdown"
          title="context-priming-layers.md"
          code={`# Context Priming 四层体系

## Layer 1: CLAUDE.md (静态规范)
- 项目技术栈、编码规范、架构约定
- 这是最高优先级的项目级上下文

## Layer 2: Skills (可复用能力)
- .claude/skills/ 目录下的 markdown 文件
- 将常用操作封装为可调用的 "技能"
- 如: deploy.md, migration.md, code-review.md

## Layer 3: Dynamic Injection (动态注入)
- 通过 Hook 在运行时注入上下文
- PreToolUse Hook 可以注入文件级上下文
- 如: 编辑 API 文件前自动注入 API 规范

## Layer 4: PreCompact Hook (压缩保护)
- 在 auto-compact 触发前执行
- 提取关键信息写入持久化文件
- 确保压缩不会丢失核心决策和约定`}
        />

        <div className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <p><strong style={{ color: 'var(--color-text-primary)' }}>适合：</strong>所有项目——这是基础设施，不是可选项</p>
          <p><strong style={{ color: 'var(--color-text-primary)' }}>投入：</strong>初始配置 30-60 分钟，之后持续维护</p>
          <p><strong style={{ color: 'var(--color-text-primary)' }}>组合：</strong>Context Priming (基础) + RIPER (流程) + Writer/Reviewer (质量门) 是推荐的通用组合</p>
        </div>

        {/* ── 方法论对比矩阵 ── */}
        <h3
          className="text-xl font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          方法论对比矩阵
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                {['方法论', '自动化', '适用场景', '成本', '安装'].map((h) => (
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
                ['Ralph Wiggum', '高 (自迭代)', 'Greenfield + TDD', '~$10/h', '手动配置 Hook'],
                ['RIPER-5', '中 (人控阶段门)', '重构 / 迁移', '标准', 'CLAUDE.md 规则'],
                ['AB Method', '中高', '全栈开发', '标准', 'npx ab-method'],
                ['GSD', '高 (并行执行)', '大型/可拆分项目', 'N倍并行', 'npx get-shit-done-cc'],
                ['BMAD', '高 (全流程)', '产品生命周期', '标准', 'npx bmad-method install'],
                ['Writer/Reviewer', '低 (纯手动)', '质量敏感场景', '~2x', '零配置'],
                ['Context Priming', '中 (Hook 驱动)', '所有项目(基础)', '零额外', '手动配置'],
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

        {/* ── 方法论选择决策树 ── */}
        <DecisionTree
          root={methodologyTree}
          title="方法论选择决策树"
        />

        <QualityCallout title="推荐组合: Context Priming + RIPER + Writer/Reviewer">
          <p className="mb-2">
            对于大多数生产项目，这个三层组合提供了最佳的效率/质量平衡：
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong style={{ color: 'var(--color-text-primary)' }}>Context Priming</strong>：确保每次会话都有正确的项目上下文（基础层）</li>
            <li><strong style={{ color: 'var(--color-text-primary)' }}>RIPER</strong>：约束开发流程——先理解再动手，先规划再执行（流程层）</li>
            <li><strong style={{ color: 'var(--color-text-primary)' }}>Writer/Reviewer</strong>：关键代码双会话审查，消除确认偏差（质量层）</li>
          </ul>
        </QualityCallout>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 8.2: CI/CD 集成
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          8.2 CI/CD 集成
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Claude Code 不只是本地开发工具——它可以作为 CI/CD 流水线的一环，自动化 PR 审查、测试修复和代码迁移。
        </p>

        {/* ── GitHub Actions: PR Auto-Review ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          GitHub Actions：PR 自动审查
        </h3>

        <ConfigExample
          title=".github/workflows/claude-review.yml"
          language="yaml"
          code={`name: Claude Code PR Review
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
            { line: 13, text: '超时保护——防止 Claude 陷入长时间循环' },
            { line: 23, text: '限制工具范围——CI 中 Claude 只能读、搜索、运行特定命令，不能写文件' },
            { line: 24, text: 'max_turns 限制交互轮次，控制成本和时间' },
          ]}
        />

        {/* ── Flaky Test Detection ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Flaky Test 自动检测与修复
        </h3>

        <ConfigExample
          title=".github/workflows/claude-flaky-test.yml"
          language="yaml"
          code={`name: Claude Flaky Test Fix
on:
  workflow_run:
    workflows: ["CI"]
    types: [completed]

jobs:
  fix-flaky:
    if: \${{ github.event.workflow_run.conclusion == 'failure' }}
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci

      - name: Claude Fix Flaky Tests
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: \${{ secrets.ANTHROPIC_API_KEY }}
          max_turns: 8
          allowed_tools: "Read,Grep,Glob,Edit,Bash(npm test*),Bash(npx jest*)"
          prompt: |
            CI 测试失败了。请:
            1. 分析失败的测试输出
            2. 判断是 flaky test 还是真实 bug
            3. 如果是 flaky test，修复不稳定因素
            4. 如果是真实 bug，创建 issue 描述但不修复代码
            5. 修复后重新运行测试验证`}
          annotations={[
            { line: 9, text: '只在 CI 失败时触发——不浪费正常构建的额外成本' },
            { line: 22, text: '允许 Edit 工具——flaky test 修复需要修改测试代码' },
          ]}
        />

        {/* ── Batch Migration ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          批量迁移脚本：50 个文件 CommonJS → ESM
        </h3>

        <CodeBlock
          language="bash"
          title="batch-migrate-cjs-to-esm.sh"
          code={`#!/usr/bin/env bash
set -euo pipefail

# Fan-out 批量迁移: CommonJS → ESM
# 每个文件独立会话, 避免上下文污染

FILES=$(find src -name "*.js" -exec grep -l "require(" {} \;)
TOTAL=$(echo "$FILES" | wc -l)
echo "Found $TOTAL files to migrate"

PARALLEL=4  # 并发数, 根据 API 限速调整
FAILED=0

migrate_file() {
  local file="$1"
  echo "[MIGRATE] $file"

  claude -p \\
    --model claude-sonnet-4-20250514 \\
    --max-turns 3 \\
    --allowedTools "Read,Edit,Bash(node --check*)" \\
    "将 $file 从 CommonJS 迁移到 ESM:
     1. require() → import
     2. module.exports → export
     3. 保持功能完全一致
     4. 迁移后运行 node --check 验证语法
     不要修改其他文件。" \\
    2>&1 | tail -1

  if [ $? -ne 0 ]; then
    echo "[FAILED] $file" >> migration-failures.log
    ((FAILED++))
  fi
}

export -f migrate_file
echo "$FILES" | xargs -P "$PARALLEL" -I {} bash -c 'migrate_file "{}"'

echo "Migration complete: $((TOTAL - FAILED))/$TOTAL succeeded"
[ -f migration-failures.log ] && echo "Failures:" && cat migration-failures.log`}
          highlightLines={[17, 18, 19, 20]}
        />

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          关键细节：<code style={{ color: 'var(--color-accent)' }}>claude -p</code> 是 one-shot 模式（非交互式），
          <code style={{ color: 'var(--color-accent)' }}>--allowedTools</code> 限制工具范围，
          <code style={{ color: 'var(--color-accent)' }}>--max-turns</code> 控制每个文件的最大交互轮次。
          4 路并发 + 每文件 3 轮 = 可控的成本和时间。
        </p>

        {/* ── CI 成本与安全 ── */}
        <div
          className="p-4 rounded-lg"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            CI 成本估算
          </p>
          <ul className="list-disc list-inside text-sm space-y-1.5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            <li>PR 审查：每次约 $0.05-0.15（Sonnet 模型，5 轮以内）</li>
            <li>Flaky test 修复：每次约 $0.10-0.30（允许 Edit，8 轮以内）</li>
            <li>50 PRs/周的团队：约 <strong style={{ color: 'var(--color-text-primary)' }}>$6-40/月</strong></li>
            <li>使用 Haiku 做初筛 + Sonnet 做深度审查可以进一步降低成本</li>
          </ul>
        </div>

        <QualityCallout title="安全: 防止 PromptPwnd 攻击">
          <p className="mb-2">
            CI 环境中 Claude Code 会读取 PR 中的代码——<strong style={{ color: 'var(--color-text-primary)' }}>恶意 PR 可能通过注入 prompt 操纵 Claude 的行为</strong>。
            这被称为 PromptPwnd 攻击。防御措施：
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>CI 中的 Claude<strong style={{ color: 'var(--color-text-primary)' }}>绝对不能有写权限</strong>（不允许 push、merge、approve）</li>
            <li>使用 <code style={{ color: 'var(--color-accent)' }}>--allowedTools</code> 将工具限制为只读</li>
            <li>审查结果发布为 Comment，由人工决定是否采纳</li>
            <li>对外部贡献者的 PR 增加额外的人工审核步骤</li>
          </ul>
        </QualityCallout>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 8.3: SDK 编程式调用
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          8.3 SDK 编程式调用
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Claude Code 不只是命令行工具——它的能力可以通过 SDK 被你的代码调用，构建自定义 UI、集成到内部平台、或者编排复杂的多步工作流。
        </p>

        {/* ── claude -p one-shot ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          CLI one-shot 模式
        </h3>

        <CodeBlock
          language="bash"
          title="claude-oneshot-examples.sh"
          code={`# 基本 one-shot 调用
claude -p "解释这个函数的作用" --output-format json

# 流式输出 (适合 pipe 处理)
claude -p "分析 @src/main.ts 的依赖关系" --output-format stream-json

# 带工具限制的 one-shot
claude -p "检查项目中是否有安全漏洞" \\
  --allowedTools "Read,Grep,Glob" \\
  --max-turns 5 \\
  --output-format json

# JSON 输出格式:
# {
#   "result": "分析结果文本...",
#   "cost": { "input_tokens": 1234, "output_tokens": 567 },
#   "duration_ms": 3400,
#   "turns": 3
# }

# stream-json 输出格式 (逐行):
# {"type":"text","content":"正在分析..."}
# {"type":"tool_use","tool":"Read","input":{"file":"src/main.ts"}}
# {"type":"tool_result","content":"..."}
# {"type":"text","content":"分析完成，发现..."}
# {"type":"done","result":"最终结果"}`}
        />

        {/* ── Agent SDK ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          @anthropic-ai/claude-agent-sdk
        </h3>

        <CodeBlock
          language="typescript"
          title="custom-agent.ts"
          code={`import { query, type ClaudeAgentOptions } from '@anthropic-ai/claude-agent-sdk'

// 基本查询
const result = await query({
  prompt: "分析 src/ 目录的代码质量",
  options: {
    model: "claude-sonnet-4-20250514",
    maxTurns: 10,
    allowedTools: ["Read", "Grep", "Glob", "Bash(npm test*)"],
    workingDirectory: "/path/to/project",
  },
})

console.log(result.text)       // 最终回答
console.log(result.cost)       // { inputTokens, outputTokens }
console.log(result.toolCalls)  // 使用了哪些工具

// 自定义 MCP 工具
const resultWithTools = await query({
  prompt: "查询最近的部署记录",
  options: {
    maxTurns: 5,
    mcpServers: {
      "deploy-tracker": {
        command: "node",
        args: ["./mcp-servers/deploy-tracker.js"],
      },
    },
  },
})

// 会话恢复 (从断点继续)
const session = await query({
  prompt: "开始重构 auth 模块",
  options: { maxTurns: 20 },
})

// 保存 session ID, 稍后恢复
const sessionId = session.sessionId

// ... 中断后恢复 ...
const resumed = await query({
  prompt: "继续上次的重构",
  options: {
    sessionId,  // 恢复之前的上下文
    maxTurns: 10,
  },
})`}
          highlightLines={[4, 20, 37]}
        />

        {/* ── MCP Server 模式 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          claude mcp serve：将 Claude Code 暴露为 MCP 服务器
        </h3>

        <CodeBlock
          language="bash"
          title="mcp-serve-example.sh"
          code={`# 将 Claude Code 作为 MCP 服务器运行
# 其他工具/应用可以通过 MCP 协议调用 Claude Code 的能力

claude mcp serve --port 3100 --allowed-origins "http://localhost:*"

# 现在其他应用可以通过 MCP 协议:
# 1. 调用 Claude Code 的文件编辑能力
# 2. 使用 Claude Code 的代码分析工具
# 3. 利用 Claude Code 的 git 操作
# 这让你可以构建自定义的 IDE 集成、内部平台、或者 Slack Bot`}
        />

        <QualityCallout title="SDK 安全三要素">
          <p className="mb-2">
            编程式调用必须比交互式使用<strong style={{ color: 'var(--color-text-primary)' }}>更严格</strong>地控制安全边界，因为没有人在旁边实时监督：
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li><code style={{ color: 'var(--color-accent)' }}>allowedTools</code>：只给必要的工具，CI 中永远不给 Write 权限</li>
            <li><code style={{ color: 'var(--color-accent)' }}>maxTurns</code>：设置上限防止无限循环，5-10 轮通常足够</li>
            <li><strong style={{ color: 'var(--color-text-primary)' }}>session resume 安全</strong>：恢复的会话继承原始权限，不能通过恢复绕过限制</li>
          </ul>
        </QualityCallout>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 8.4: Git Worktree 并行开发
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          8.4 Git Worktree 并行开发
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          单个 Claude Code 会话一次只能做一件事。但你的项目通常有多个并行任务。
          Git Worktree 让你在同一个仓库中创建多个独立工作目录，每个目录运行一个 Claude 实例——
          这是 incident.io 团队验证过的模式：<strong style={{ color: 'var(--color-text-primary)' }}>4-5 个 Claude 同时工作在不同 feature 上</strong>。
        </p>

        <CodeBlock
          language="bash"
          title="worktree-parallel.sh"
          code={`# 方式 1: Claude 内置 worktree 支持
claude --worktree feature-auth
claude --worktree feature-dashboard
claude --worktree bugfix-login

# 方式 2: 自定义 bash 函数 (更灵活)
# 添加到 ~/.zshrc 或 ~/.bashrc:

cw() {
  local branch="$1"
  local base="\${2:-main}"
  local worktree_dir="../\$(basename \$(pwd))-$branch"

  # 创建 worktree + 新分支
  git worktree add "$worktree_dir" -b "$branch" "$base"

  echo "Worktree created at: $worktree_dir"
  echo "Branch: $branch (based on $base)"

  # 在新 worktree 中启动 Claude
  cd "$worktree_dir" && claude
}

# 使用:
cw feature-auth        # 基于 main 创建 worktree 并启动 Claude
cw bugfix-login v2.1   # 基于 v2.1 tag 创建

# 清理已完成的 worktree:
git worktree remove ../myproject-feature-auth
git worktree prune  # 清理无效引用`}
        />

        <div
          className="p-4 rounded-lg"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            incident.io 模式：并行 Claude 工作流
          </p>
          <ul className="list-disc list-inside text-sm space-y-1.5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            <li>每个 feature 一个 worktree + 一个 Claude 实例</li>
            <li>worktree 之间共享 .git 目录但工作目录完全隔离</li>
            <li>每个 Claude 有独立上下文，不会互相污染</li>
            <li>实测 4-5 个并行 Claude 可以将周交付量提升 3-4 倍</li>
            <li>注意：并行数受限于 API 速率限制和你的 Max 订阅额度</li>
          </ul>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 8.5: 稳定性与容灾
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          8.5 稳定性与容灾
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          依赖 AI 工具进行生产开发，<strong style={{ color: 'var(--color-text-primary)' }}>必须正视其不稳定性</strong>。
          不是"可能会出问题"，而是"一定会出问题，问题是你准备好了没有"。
        </p>

        {/* ── 真实稳定性数据 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          真实稳定性数据（诚实面对）
        </h3>

        <CodeBlock
          language="bash"
          title="stability-reality.txt"
          code={`# Anthropic API 稳定性数据 (截至 2026.3)

官方声称:          99.85% uptime
社区实测 (90天):    99.36% uptime

90 天内记录的事件:
  总中断次数:       109 次
  其中:
    API 降速:       67 次 (响应变慢但可用)
    部分中断:       31 次 (某些区域/功能不可用)
    全面中断:       11 次 (完全不可用)

最严重事件:
  2026.3 全球性中断  —  持续 14 小时, 所有 API 调用失败

# 输出一致性风险
模型更新频率:  约每 2-4 周一次 (不一定有公告)
影响:          相同 prompt 的输出质量可能在更新后发生变化
              你的 CLAUDE.md 规则在新模型版本下可能不再被严格遵守`}
        />

        <div
          className="p-5 rounded-lg"
          style={{
            background: 'rgba(248, 113, 113, 0.05)',
            border: '1px solid rgba(248, 113, 113, 0.2)',
          }}
        >
          <p
            className="text-base font-semibold mb-3"
            style={{ color: 'var(--color-text-primary)' }}
          >
            核心认知：AI 是加速器，不是依赖
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            如果你的团队在 Claude Code 完全不可用的情况下无法继续工作，说明你已经建立了危险的依赖关系。
            AI 应该让你的团队<strong style={{ color: 'var(--color-text-primary)' }}>更快</strong>，而不是<strong style={{ color: 'var(--color-text-primary)' }}>不可替代</strong>。
            没有 AI 的时候，团队必须能用传统方式完成所有工作——只是慢一些而已。
          </p>
        </div>

        {/* ── 三级容灾方案 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          三级容灾方案
        </h3>

        <CodeBlock
          language="markdown"
          title="fallback-strategy.md"
          code={`# 三级容灾方案

## Level 1: API 变慢 (响应 > 30s)
触发条件: 连续 3 次请求超过 30 秒
应对措施:
  - 自动切换到 Haiku 模型 (更快、更便宜)
  - 减少单次请求的上下文量
  - 暂停非关键的 CI/CD Claude 任务
  - 保留 Sonnet/Opus 仅用于关键路径

## Level 2: API 不可用 (超过 30 分钟)
触发条件: API 返回 5xx 或无响应超过 30 分钟
应对措施:
  - 切换到传统开发模式
  - 激活 HANDOFF.md (任务交接文档)
    → 包含当前进度、未完成步骤、关键上下文
    → 人工接手时无需从头理解
  - 通知团队切换到非 AI 工作流
  - CI 中的 Claude 步骤设为 optional (失败不阻塞)

## Level 3: 长期策略 (平台无关)
核心原则: 项目资产不依赖于特定 AI 平台
具体措施:
  - CLAUDE.md 用标准 Markdown, 不依赖 Claude 特有语法
  - Hook 脚本用通用 bash/node, 可以适配其他工具
  - 设计决策记录在 ADR 文件中, 不只存在于会话历史
  - 定期将关键 prompt 和 workflow 导出为文档
  - Skills 文件使用通用格式, 不锁定供应商`}
        />

        <ConfigExample
          title="HANDOFF.md — 任务交接模板"
          language="markdown"
          code={`# 任务交接文档

## 当前状态
- 任务: [任务描述]
- 进度: [已完成步骤 / 总步骤]
- 分支: [当前分支名]

## 已完成的工作
1. [步骤 1 描述] — 完成
2. [步骤 2 描述] — 完成
3. [步骤 3 描述] — 进行中 (50%)

## 下一步
- [ ] 完成步骤 3 的剩余部分
- [ ] 步骤 4: [描述]
- [ ] 运行完整测试套件

## 关键上下文
- 决策: [为什么选择方案 A 而不是方案 B]
- 注意: [已知的坑/边界条件]
- 依赖: [需要的环境变量/服务]

## 如何验证
\`\`\`bash
npm test                    # 所有测试应通过
npm run lint                # 无 lint 错误
curl localhost:3000/health  # 返回 200
\`\`\``}
          annotations={[
            { line: 4, text: '当 AI 中断时，团队成员可以快速了解当前进度' },
            { line: 16, text: '记录决策原因——不只是做了什么，更重要的是为什么' },
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
          title="安装并试用一个社区方法论"
          description="选择 Ralph Wiggum (Stop Hook) 或 RIPER-5 中的一个，在你的项目中配置并完成一个小任务（如修复一个 bug 或添加一个简单功能）。记录配置过程和使用感受。"
          checkpoints={[
            '方法论配置文件已正确创建',
            '使用该方法论完成了至少一个任务',
            '能说出该方法论的 1 个优势和 1 个不足',
          ]}
        />

        <ExerciseCard
          tier="l2"
          title="搭建 GitHub Actions Claude Code 审查"
          description="为你的仓库配置 PR 自动审查的 GitHub Actions workflow。使用本章提供的 YAML 模板，根据你的项目调整 allowedTools 和 prompt。确保审查结果能正确发布为 PR comment。"
          checkpoints={[
            'GitHub Actions workflow 文件已创建并能触发',
            'Claude Code 审查结果作为 PR comment 发布',
            'allowedTools 限制为只读工具（安全）',
            '设置了 timeout 和 max_turns（成本控制）',
          ]}
        />

        <ExerciseCard
          tier="l3"
          title="设计团队级全流程工作方案"
          description="为你的团队设计一套结合 Context Priming + RIPER + Writer/Reviewer 的全流程方案。包括：CLAUDE.md 模板、RIPER 各阶段的进入/退出标准、Writer/Reviewer 的触发条件（什么样的代码需要双会话审查）、以及容灾预案。"
          checkpoints={[
            '完成了 CLAUDE.md 模板（包含项目规范 + RIPER 阶段约束）',
            '定义了 RIPER 各阶段的 checklist',
            '明确了 Writer/Reviewer 的适用标准',
            '编写了 HANDOFF.md 容灾模板',
            '估算了月度成本并设置了预算上限',
          ]}
        />
      </section>
    </div>
  )
}
