import { lazy } from 'react'
import { CodeBlock } from '../../components/content/CodeBlock'
import { QualityCallout } from '../../components/content/QualityCallout'
import { ExerciseCard } from '../../components/content/ExerciseCard'
import { ConfigExample } from '../../components/content/ConfigExample'
import { DecisionTree } from '../../components/content/DecisionTree'
import type { TreeNode } from '../../components/content/DecisionTree'
import { AnimationWrapper } from '../../components/animation/AnimationWrapper'

const LazyRiskMatrix = lazy(() => import('../../remotion/ch09/RiskMatrix'))

/* ═══════════════════════════════════════════════
   Decision Tree: 权限分级
   ═══════════════════════════════════════════════ */

const permissionTree: TreeNode = {
  id: 'root',
  question: '该成员使用 Claude Code 的经验如何?',
  description: '按熟练度分级，而不是按职位。资深工程师如果没有 Claude Code 经验，也从 L1 开始。',
  children: [
    {
      label: '刚开始使用 (< 1 月)',
      node: {
        id: 'beginner',
        question: '是否完成了 Ch0-Ch2 的学习?',
        children: [
          {
            label: '是',
            node: {
              id: 'l1-ready',
              question: '分配: L1 权限',
              result: {
                text: 'L1 权限：仅 Ask 模式 + 白名单工具。活动范围限于编码阶段，每个 PR 需要逐行 review。升级标准：bug 率不高于团队平均值，持续 3 个月。',
                tier: 'l1',
              },
            },
          },
          {
            label: '否',
            node: {
              id: 'not-ready',
              question: '先完成基础学习',
              result: {
                text: '不建议在未完成基础学习的情况下使用 Claude Code。请先完成 Ch0(系统理解) + Ch1(提示词工程) + Ch2(代码编辑) 的学习和练习。',
                tier: 'l1',
              },
            },
          },
        ],
      },
    },
    {
      label: '稳定使用中 (1-6 月)',
      node: {
        id: 'intermediate',
        question: '是否完成过至少 1 个 Plan Mode 项目?',
        children: [
          {
            label: '是，且质量稳定',
            node: {
              id: 'l2-ready',
              question: '分配: L2 权限',
              result: {
                text: 'L2 权限：AcceptEdits 模式 + Hook 保护。活动范围扩展到设计阶段，Plan review + AI Review + 抽查即可。升级标准：质量稳定 + 完成 1 个完整的 Plan Mode 项目。',
                tier: 'l2',
              },
            },
          },
          {
            label: '否',
            node: {
              id: 'stay-l1',
              question: '保持 L1，积累经验',
              result: {
                text: '继续以 L1 权限使用。建议选择一个中等复杂度的任务，尝试使用 Plan Mode 完成。完成后申请升级评估。',
                tier: 'l1',
              },
            },
          },
        ],
      },
    },
    {
      label: '深度使用 (> 6 月)',
      node: {
        id: 'advanced',
        question: '分配: L3 权限',
        result: {
          text: 'L3 权限：Auto 模式 + Hook 门禁。活动范围覆盖全生命周期，分层 review（核心代码深审 + 辅助代码抽审）。要求团队认可 + 数据支撑。L3 成员同时承担指导 L1/L2 成员的责任。',
          tier: 'l3',
        },
      },
    },
  ],
}

/* ═══════════════════════════════════════════════
   Chapter 9 Component
   ═══════════════════════════════════════════════ */

export default function Ch09() {
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
            09
          </span>
          <span
            className="text-xs uppercase tracking-widest font-medium"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Governance & Adoption
          </span>
        </div>
        <h1
          className="text-3xl md:text-4xl font-bold mb-4 leading-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          风险、治理与落地
        </h1>
        <p
          className="text-lg leading-relaxed max-w-3xl"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          前八章散布了大量安全、质量和管理的实践。这一章将它们<strong style={{ color: 'var(--color-text-primary)' }}>系统性地</strong>汇总成
          一套可执行的企业级治理方案——从质量保障体系到成本管控，从分级管理到落地路线图。
          这不是理论框架，而是你的团队下周就可以开始执行的操作手册。
        </p>
      </header>

      {/* ═══════════════════════════════════════════════
          Section 9.1: 全链路质量保障体系
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          9.1 全链路质量保障体系
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          AI 辅助开发的质量保障不是单点控制，而是<strong style={{ color: 'var(--color-text-primary)' }}>四层纵深防御</strong>。
          每一层独立工作，即使某一层失效，后续层仍然可以拦截问题。这些内容在前面的章节中已经分别介绍过，
          这里我们将它们整合为一张完整的防御地图。
        </p>

        <CodeBlock
          language="markdown"
          title="quality-defense-layers.md"
          code={`# 全链路质量保障 — 四层纵深防御

═══════════════════════════════════════════════
Layer 1: 事前防御 (Pre-production)
═══════════════════════════════════════════════
┌─────────────────┬──────────────────────────────┐
│ 权限分级        │ L1/L2/L3 差异化配置 (§9.2)   │
│ CLAUDE.md 约束  │ 编码规范 + 禁止规则 (Ch4)     │
│ Plan 强制       │ 复杂任务必须先 Plan (Ch3)     │
│ Hook 拦截       │ PreToolUse 阻止危险操作 (Ch5) │
│ Worktree 隔离   │ 每个任务独立工作目录 (Ch8)    │
└─────────────────┴──────────────────────────────┘

═══════════════════════════════════════════════
Layer 2: 过程控制 (In-process)
═══════════════════════════════════════════════
┌─────────────────┬──────────────────────────────┐
│ 逐步执行        │ Plan 模式分步确认 (Ch3)       │
│ 自动测试        │ PostToolUse 触发测试 (Ch5)    │
│ Stop Hook 验证  │ 完成前自动检查 (Ch8)          │
│ 成本监控        │ 实时 token/费用追踪 (§9.4)    │
│ 上下文健康      │ /context 检查 + 主动压缩 (Ch0)│
└─────────────────┴──────────────────────────────┘

═══════════════════════════════════════════════
Layer 3: 事后验证 (Post-production)
═══════════════════════════════════════════════
┌─────────────────┬──────────────────────────────┐
│ 需求验证表      │ 需求→实现→测试 三列对照 (Ch3) │
│ 分级 Review     │ 大小决定策略 (§9.2)           │
│ 理解验证        │ 决策树: 是否理解代码 (Ch2)     │
│ AI Review       │ Writer/Reviewer 双审 (Ch8)    │
└─────────────────┴──────────────────────────────┘

═══════════════════════════════════════════════
Layer 4: 治理基础设施 (Governance)
═══════════════════════════════════════════════
┌─────────────────┬──────────────────────────────┐
│ 会话日志        │ 所有 Claude 交互可审计        │
│ Git Blame       │ AI 生成代码可追溯到人         │
│ Managed Policy  │ 组织级策略强制执行 (Ch0)      │
│ Git Settings    │ 仓库级 .claude/settings.json  │
│ 度量体系        │ bug率/review轮次/成本 (§9.3)  │
└─────────────────┴──────────────────────────────┘`}
        />

        <QualityCallout title="四层防御的关键原则">
          <p className="mb-2">
            任何单一防御层都会失效。CLAUDE.md 可能被忽略，Hook 可能有 bug，Review 可能被跳过。
            四层纵深的设计确保：
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>每一层<strong style={{ color: 'var(--color-text-primary)' }}>独立于其他层</strong>工作——不依赖"上一层做好了"</li>
            <li>越靠后的层<strong style={{ color: 'var(--color-text-primary)' }}>越严格</strong>——事后验证比事前防御更不容易被绕过</li>
            <li>治理层是<strong style={{ color: 'var(--color-text-primary)' }}>不可绕过的</strong>——git blame 和会话日志是事实记录</li>
          </ul>
        </QualityCallout>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 9.2: 分级管理制度
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          9.2 分级管理制度
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          分级的维度是<strong style={{ color: 'var(--color-text-primary)' }}>Claude Code 熟练度</strong>，
          不是职位或工龄。一个十年经验的架构师如果第一次使用 Claude Code，也应该从 L1 开始。
          这不是对能力的否定——而是对新工具的敬畏。
        </p>

        {/* ── 分级表 ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                {['级别', '权限模式', '活动范围', 'Review 要求', '升级标准'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-3 py-2.5 font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody style={{ color: 'var(--color-text-secondary)' }}>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="px-3 py-3">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{
                      color: 'var(--color-tier-l1)',
                      background: 'color-mix(in srgb, var(--color-tier-l1) 12%, transparent)',
                      border: '1px solid color-mix(in srgb, var(--color-tier-l1) 25%, transparent)',
                    }}
                  >
                    L1
                  </span>
                </td>
                <td className="px-3 py-3">Ask + 白名单工具</td>
                <td className="px-3 py-3">仅编码阶段</td>
                <td className="px-3 py-3">每个 PR 逐行 review</td>
                <td className="px-3 py-3">Bug 率不高于平均值，持续 3 月</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="px-3 py-3">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{
                      color: 'var(--color-tier-l2)',
                      background: 'color-mix(in srgb, var(--color-tier-l2) 12%, transparent)',
                      border: '1px solid color-mix(in srgb, var(--color-tier-l2) 25%, transparent)',
                    }}
                  >
                    L2
                  </span>
                </td>
                <td className="px-3 py-3">AcceptEdits + Hooks</td>
                <td className="px-3 py-3">编码 + 设计阶段</td>
                <td className="px-3 py-3">Plan review + AI Review + 抽查</td>
                <td className="px-3 py-3">质量稳定 + 1 个 Plan Mode 项目</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="px-3 py-3">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{
                      color: 'var(--color-tier-l3)',
                      background: 'color-mix(in srgb, var(--color-tier-l3) 12%, transparent)',
                      border: '1px solid color-mix(in srgb, var(--color-tier-l3) 25%, transparent)',
                    }}
                  >
                    L3
                  </span>
                </td>
                <td className="px-3 py-3">Auto + Hook 门禁</td>
                <td className="px-3 py-3">全生命周期</td>
                <td className="px-3 py-3">分层 review（核心深审 + 辅助抽审）</td>
                <td className="px-3 py-3">团队认可 + 数据支撑</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <strong style={{ color: 'var(--color-text-primary)' }}>Review 策略的关键区别：</strong>
          L1 的逐行 review 是学习过程——reviewer 同时在教 L1 成员如何评估 AI 产出。
          L2 的 Plan review 关注的是方向正确性——代码级别交给 AI Review + 抽查。
          L3 的分层 review 根据代码重要性动态调整——核心模块（认证、支付）深审，工具函数抽审。
        </p>

        {/* ── 权限分级决策树 ── */}
        <DecisionTree
          root={permissionTree}
          title="权限分级决策树"
        />

        {/* ── Review 策略按变更大小 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Review 策略：按变更大小分层
        </h3>

        <CodeBlock
          language="markdown"
          title="review-strategy-by-size.md"
          code={`# Review 策略矩阵

## 小型变更 (< 50 行, 单文件)
- L1: 逐行 review, 解释每个修改的原因
- L2: AI Review 即可, 关注边界条件
- L3: 自审通过即可提交

## 中型变更 (50-300 行, 多文件)
- L1: 逐行 review + 整体架构讨论
- L2: Plan review + AI Review + 关键文件人工抽查
- L3: AI Review + 核心模块人工审查

## 大型变更 (> 300 行 或涉及架构)
- 所有级别: 必须使用 Plan Mode
- L1: 不建议使用 Claude Code 独立完成, 需 pair programming
- L2: Plan review → 分步执行 → 每步验证 → 最终 review
- L3: Plan review → 并行执行 → 集成验证 → 架构 review

## 安全敏感变更 (认证、支付、权限)
- 所有级别: Writer/Reviewer 双会话 + 人工 review
- 额外要求: 安全 checklist + 渗透测试覆盖`}
        />
      </section>

      {/* ═══════════════════════════════════════════════
          Section 9.3: 度量体系
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          9.3 度量体系
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          "感觉 AI 让我们更快了"不是度量。你需要<strong style={{ color: 'var(--color-text-primary)' }}>可量化的健康指标</strong>和<strong style={{ color: 'var(--color-text-primary)' }}>明确的预警信号</strong>，
          否则团队可能在不知不觉中积累质量债务。
        </p>

        {/* ── 健康指标 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          四个核心健康指标
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                {['指标', '计算方式', '健康阈值', '数据来源'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-3 py-2.5 font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody style={{ color: 'var(--color-text-secondary)' }}>
              {[
                ['AI PR Bug 率', 'AI PR 中的 bug 数 / 总 AI PR 数', '不高于人工 PR 的 1.2 倍', 'Issue tracker + git blame'],
                ['变更失败率', '需要回滚的 AI PR / 总 AI PR', '< 5%', 'Git revert 记录'],
                ['平均 Review 轮次', 'Review 往返次数的移动平均', '趋势不应上升', 'Code review 工具'],
                ['需求准确率', '一次性满足需求的 PR / 总 PR', '> 80%', 'PM 验收记录'],
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

        {/* ── 预警信号 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          预警信号
        </h3>

        <div
          className="p-5 rounded-lg"
          style={{
            background: 'rgba(248, 113, 113, 0.05)',
            border: '1px solid rgba(248, 113, 113, 0.2)',
          }}
        >
          <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            出现以下任一信号时，需要立即介入调查：
          </p>
          <ul className="list-disc list-inside text-sm space-y-2 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            <li>
              <strong style={{ color: 'var(--color-text-primary)' }}>Bug 率上升</strong>：
              AI PR 的 bug 率持续高于人工 PR 基线 —— 可能的原因：CLAUDE.md 规范过时、模型更新导致行为变化、成员跳过了 review
            </li>
            <li>
              <strong style={{ color: 'var(--color-text-primary)' }}>个人异常值</strong>：
              某个成员的 AI PR bug 率显著高于团队平均 —— 可能的原因：该成员的 review 不够仔细、需要降级或额外培训
            </li>
            <li>
              <strong style={{ color: 'var(--color-text-primary)' }}>Review 轮次递增</strong>：
              平均 review 轮次持续上升 —— 可能的原因：团队在用"多轮 review"补偿 AI 产出质量的下降，治标不治本
            </li>
            <li>
              <strong style={{ color: 'var(--color-text-primary)' }}>理解度不足</strong>：
              Review 中频繁发现成员无法解释 AI 生成的代码 —— 最危险的信号，表明"理解债务"正在累积
            </li>
          </ul>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 9.4: 成本管控
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          9.4 成本管控
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Claude Code 的成本不是固定订阅费——API 用量直接影响你的账单。缺乏成本可见性是最常见的管理失误。
        </p>

        {/* ── 成本基线 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          成本基线数据
        </h3>

        <CodeBlock
          language="bash"
          title="cost-baseline.txt"
          code={`# 个人开发者 (Max 订阅 + API)
日均花费:        ~$6   (正常开发日)
P90 花费:        ~$12  (高强度开发日)
月度总计:        $100 - $200

# 成本构成
Sonnet 模型:     $3/M input + $15/M output tokens
Opus 模型:       $15/M input + $75/M output tokens
Haiku 模型:      $0.25/M input + $1.25/M output tokens

# 常见成本陷阱
大文件 Read:     一个 2000 行文件 ≈ 6000 tokens ≈ $0.02 (input)
自迭代循环:      Ralph Wiggum 10 轮 ≈ $1-3
并行 worktree:   4 个同时工作 ≈ 4x 成本
Agent 子代理:    成本乘数, 谨慎使用`}
        />

        {/* ── ccusage 团队分析 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          ccusage：团队成本分析
        </h3>

        <CodeBlock
          language="bash"
          title="ccusage-setup.sh"
          code={`# 安装 ccusage (Claude Code 用量分析工具)
npm install -g ccusage

# 查看个人用量 (过去 7 天)
ccusage --days 7

# 输出示例:
# Date       | Input Tokens | Output Tokens | Cost
# 2026-03-16 |     45,230   |     12,450    | $4.32
# 2026-03-17 |    123,800   |     34,200    | $11.87
# 2026-03-18 |     67,100   |     18,900    | $6.45
# ...
# Total (7d) |    412,300   |    115,600    | $42.15

# 团队用量汇总
ccusage --team --days 30 --format json > team-usage.json

# 导出为 Grafana 可用格式
ccusage --team --days 30 --format prometheus > /metrics/claude-usage.prom`}
        />

        <ConfigExample
          title="grafana-dashboard.json — 成本监控面板 (核心配置片段)"
          language="json"
          code={`{
  "dashboard": {
    "title": "Claude Code Cost Monitor",
    "panels": [
      {
        "title": "Daily Cost by Team Member",
        "type": "timeseries",
        "targets": [
          {
            "expr": "sum by (user) (claude_usage_cost_dollars)",
            "legendFormat": "{{ user }}"
          }
        ]
      },
      {
        "title": "Cost Alert: Over Budget",
        "type": "stat",
        "thresholds": {
          "steps": [
            { "value": 0, "color": "green" },
            { "value": 15, "color": "yellow" },
            { "value": 25, "color": "red" }
          ]
        }
      }
    ]
  }
}`}
          annotations={[
            { line: 10, text: '按团队成员聚合每日成本——快速发现异常用量' },
            { line: 19, text: '预算告警：日均超过 $15 黄色预警，超过 $25 红色告警' },
          ]}
        />

        {/* ── 成本优化策略 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          成本优化策略
        </h3>

        <div
          className="p-4 rounded-lg"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <ul className="list-disc list-inside text-sm space-y-2 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            <li>
              <strong style={{ color: 'var(--color-text-primary)' }}>模型路由</strong>：
              简单任务用 Haiku（代码格式化、简单查询），中等任务用 Sonnet（日常开发），
              复杂任务才用 Opus（架构设计、安全审查）。预计节省 40-60%
            </li>
            <li>
              <strong style={{ color: 'var(--color-text-primary)' }}>预算上限</strong>：
              设置个人日预算和团队月预算。到达阈值时降级模型而非停止使用
            </li>
            <li>
              <strong style={{ color: 'var(--color-text-primary)' }}>上下文管理</strong>：
              用 Grep 替代 Read（节省 10-20x token）、主动 compact（避免浪费在旧内容上的 token）、
              小任务新建会话而非延续长会话
            </li>
            <li>
              <strong style={{ color: 'var(--color-text-primary)' }}>批量优化</strong>：
              CI 中的 Claude 任务合并执行（一次 review 多个文件），
              而非每个文件单独调用
            </li>
          </ul>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 9.5: 安全配置汇总
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          9.5 安全配置汇总
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          这一节汇总了 L1/L2/L3 各级别的权限模板和安全 Hook 套件，你可以直接复制到项目中使用。
        </p>

        {/* ── L1 权限模板 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          L1 权限模板
        </h3>

        <ConfigExample
          title=".claude/settings.json — L1 (新手保护)"
          language="json"
          code={`{
  "permissions": {
    "allow": [
      "Read(*)",
      "Grep(*)",
      "Glob(*)"
    ],
    "ask": [
      "Edit(*)",
      "Write(*)",
      "Bash(npm test*)",
      "Bash(npx jest*)",
      "Bash(node --check*)"
    ],
    "deny": [
      "Bash(rm *)",
      "Bash(git push*)",
      "Bash(git checkout -- *)",
      "Bash(git reset*)",
      "Bash(curl*)",
      "Bash(wget*)",
      "Bash(chmod*)",
      "Bash(sudo*)",
      "Write(*.env*)",
      "Write(*credentials*)",
      "Write(*secret*)"
    ]
  }
}`}
          annotations={[
            { line: 3, text: 'L1 只能无限制地读取和搜索——最安全的操作' },
            { line: 9, text: '编辑和写入需要逐次确认——强制 review 每一次修改' },
            { line: 16, text: '严格禁止：删除、推送、重置、网络访问、权限修改、敏感文件写入' },
          ]}
        />

        {/* ── L2 权限模板 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          L2 权限模板
        </h3>

        <ConfigExample
          title=".claude/settings.json — L2 (Hook 保护)"
          language="json"
          code={`{
  "permissions": {
    "allow": [
      "Read(*)",
      "Grep(*)",
      "Glob(*)",
      "Edit(src/**)",
      "Edit(tests/**)",
      "Bash(npm test*)",
      "Bash(npx jest*)",
      "Bash(npm run lint*)",
      "Bash(git diff*)",
      "Bash(git status)",
      "Bash(git log*)"
    ],
    "ask": [
      "Write(*)",
      "Bash(npm install*)",
      "Bash(git add*)",
      "Bash(git commit*)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(git push --force*)",
      "Bash(git reset --hard*)",
      "Bash(curl*)",
      "Bash(sudo*)",
      "Edit(*.env*)",
      "Write(*.env*)"
    ]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "npm test --silent 2>&1 | tail -5"
          }
        ]
      }
    ]
  }
}`}
          annotations={[
            { line: 7, text: 'L2 可以自由编辑 src/ 和 tests/——不需要每次确认' },
            { line: 17, text: '创建新文件和安装依赖仍需确认——防止意外文件' },
            { line: 33, text: 'PostToolUse Hook: 每次编辑后自动运行测试——实时质量把关' },
          ]}
        />

        {/* ── L3 权限模板 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          L3 权限模板
        </h3>

        <ConfigExample
          title=".claude/settings.json — L3 (Auto + 门禁)"
          language="json"
          code={`{
  "permissions": {
    "allow": [
      "Read(*)",
      "Grep(*)",
      "Glob(*)",
      "Edit(*)",
      "Write(src/**)",
      "Write(tests/**)",
      "Bash(npm *)",
      "Bash(npx *)",
      "Bash(git add*)",
      "Bash(git commit*)",
      "Bash(git diff*)",
      "Bash(git status)",
      "Bash(git log*)"
    ],
    "ask": [
      "Bash(git push*)",
      "Write(.*)",
      "Write(*.config.*)"
    ],
    "deny": [
      "Bash(rm -rf /)",
      "Bash(git push --force*)",
      "Bash(git reset --hard*)",
      "Bash(sudo*)",
      "Edit(*.env*)",
      "Write(*.env*)",
      "Write(*credentials*)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/scripts/file-protection.js '$TOOL_INPUT'"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "npm test --silent 2>&1 | tail -5"
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/scripts/final-check.js"
          }
        ]
      }
    ]
  }
}`}
          annotations={[
            { line: 7, text: 'L3 可以自由编辑所有文件——最大自由度' },
            { line: 19, text: '推送和配置文件修改仍需确认——最后的人工关卡' },
            { line: 34, text: 'PreToolUse: 文件保护脚本，阻止修改受保护的核心文件' },
            { line: 45, text: 'PostToolUse: 自动测试——L3 依赖 Hook 而非人工 review 每次编辑' },
            { line: 56, text: 'Stop Hook: 最终检查——确保所有测试通过、无 lint 错误' },
          ]}
        />

        {/* ── 安全 Hook 套件 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          安全 Hook 套件
        </h3>

        <CodeBlock
          language="javascript"
          title=".claude/scripts/security-hooks.js"
          code={`// 安全 Hook 套件 — 四合一防护

// 1. 文件保护: 阻止修改核心配置
const PROTECTED_FILES = [
  '.env', '.env.local', '.env.production',
  'package-lock.json', 'yarn.lock',
  '.github/workflows/*',
  'docker-compose.prod.yml',
];

function checkFileProtection(filePath) {
  for (const pattern of PROTECTED_FILES) {
    if (matchGlob(filePath, pattern)) {
      return { blocked: true, reason: \`受保护文件: \${filePath}\` };
    }
  }
  return { blocked: false };
}

// 2. 密钥扫描: 检测意外提交的密钥
const SECRET_PATTERNS = [
  /AKIA[0-9A-Z]{16}/,            // AWS Access Key
  /sk-[a-zA-Z0-9]{48}/,          // OpenAI/Anthropic API Key
  /ghp_[a-zA-Z0-9]{36}/,         // GitHub PAT
  /-----BEGIN.*PRIVATE KEY-----/, // Private Key
  /password\s*=\s*['"][^'"]+/i,   // Hardcoded password
];

function scanForSecrets(content) {
  for (const pattern of SECRET_PATTERNS) {
    if (pattern.test(content)) {
      return { blocked: true, reason: '检测到潜在密钥/密码' };
    }
  }
  return { blocked: false };
}

// 3. 注入防御: 检测 prompt injection 尝试
const INJECTION_PATTERNS = [
  /ignore previous instructions/i,
  /you are now/i,
  /new system prompt/i,
  /disregard.*rules/i,
];

function checkInjection(content) {
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(content)) {
      return { blocked: true, reason: '检测到潜在 prompt 注入' };
    }
  }
  return { blocked: false };
}

// 4. 危险命令拦截
const DANGEROUS_COMMANDS = [
  /rm\s+-rf\s+\//,
  /:\s*\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:/,  // fork bomb
  /mkfs\./,
  /dd\s+if=.*of=\/dev\//,
  />\s*\/dev\/sd/,
];

function checkDangerousCommand(command) {
  for (const pattern of DANGEROUS_COMMANDS) {
    if (pattern.test(command)) {
      return { blocked: true, reason: \`危险命令: \${command}\` };
    }
  }
  return { blocked: false };
}`}
          highlightLines={[4, 22, 40, 55]}
        />

        {/* ── 数据处理与版权 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          数据处理与版权意识
        </h3>

        <QualityCallout title="数据与版权：两个必须了解的事实">
          <div className="space-y-3">
            <div>
              <p className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>数据处理：</p>
              <p>
                不同的 Claude 使用方式有不同的数据政策（Max 订阅 vs API 调用 vs 企业版）。
                <strong style={{ color: 'var(--color-text-primary)' }}>无论你使用哪种方案，都应该使用技术控制手段（Hook + 权限）防止敏感数据被发送</strong>。
                不要依赖政策承诺作为唯一的保护——技术控制是你自己能掌握的。
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>版权：</p>
              <p>
                目前的法律共识是：<strong style={{ color: 'var(--color-text-primary)' }}>纯 AI 生成的代码不受版权保护</strong>。
                要获得版权，需要有"足够的人类创造性贡献"。这意味着你需要对 AI 产出进行实质性的编辑和决策，
                而不是直接接受。这也是为什么 Review 和理解如此重要——不只是质量问题，也是法律问题。
              </p>
            </div>
          </div>
        </QualityCallout>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 9.6: 落地路线图
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          9.6 落地路线图
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          不要尝试"全公司一次性推广"。AI 工具的落地需要<strong style={{ color: 'var(--color-text-primary)' }}>渐进式验证</strong>——
          每个阶段都有明确的成功标准，达标后再扩大范围。
        </p>

        <CodeBlock
          language="markdown"
          title="adoption-roadmap.md"
          code={`# 落地路线图

═══════════════════════════════════════════════════════
Phase 0: 评估 (1 周)
═══════════════════════════════════════════════════════
参与人数: 1-2 人 (技术 lead 级别)
目标:
  - 评估 Claude Code 是否适合当前项目类型
  - 测试 API 访问、网络连接、安全策略兼容性
  - 估算成本基线
交付物:
  - 评估报告 (适合/不适合 + 原因)
  - 成本预估
成功标准: 能在实际项目代码上完成一个端到端任务

═══════════════════════════════════════════════════════
Phase 1: 试点 (2-4 周)
═══════════════════════════════════════════════════════
参与人数: 5 人 (1 个小组)
目标:
  - 建立 CLAUDE.md + Hook 基础配置
  - 验证质量保障流程
  - 收集效率数据
配置:
  - 统一的 .claude/settings.json (L1 权限)
  - 基础 Hook 套件 (文件保护 + 密钥扫描)
  - 开始记录 AI PR bug 率
交付物:
  - CLAUDE.md 模板
  - Hook 配置套件
  - 试点报告 (效率对比 + 质量数据)
成功标准: AI PR bug 率不高于人工基线

═══════════════════════════════════════════════════════
Phase 2: 扩展 (1-3 月)
═══════════════════════════════════════════════════════
参与人数: 全团队
目标:
  - 全团队部署 + L1/L2 分级
  - 建立度量体系 (§9.3)
  - 完善 Hook 和自动化
配置:
  - 按人员分级配置权限
  - PostToolUse 自动测试
  - ccusage 成本监控 + Grafana 面板
交付物:
  - 分级管理规则文档
  - 度量仪表盘
  - 成本报告 (周/月)
成功标准: 团队交付速度提升 30%+, 质量指标健康

═══════════════════════════════════════════════════════
Phase 3: 深化 (持续)
═══════════════════════════════════════════════════════
目标:
  - CI/CD 集成 (Ch8)
  - Skills + MCP 生态建设
  - 跨团队知识共享
配置:
  - GitHub Actions Claude 审查
  - 自定义 MCP 服务器
  - Skills 库 (团队共享)
关注点:
  - 模型更新后的质量回归监控
  - 成本持续优化
  - 新成员 onboarding 流程`}
        />

        {/* ── 培训计划 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          4 周培训计划
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                {['周次', '学习内容', '练习目标', '验收标准'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-3 py-2.5 font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody style={{ color: 'var(--color-text-secondary)' }}>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="px-3 py-2.5"><strong style={{ color: 'var(--color-text-primary)' }}>Week 1</strong></td>
                <td className="px-3 py-2.5">Ch0 系统理解 + Ch1 提示词 + Ch2 代码编辑</td>
                <td className="px-3 py-2.5">完成一个 bug 修复任务</td>
                <td className="px-3 py-2.5">能解释请求链路 + 写 L4 级 prompt</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="px-3 py-2.5"><strong style={{ color: 'var(--color-text-primary)' }}>Week 2</strong></td>
                <td className="px-3 py-2.5">Ch3 Plan Mode + Ch5 Hooks</td>
                <td className="px-3 py-2.5">用 Plan Mode 完成一个功能</td>
                <td className="px-3 py-2.5">能配置 PostToolUse Hook</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="px-3 py-2.5"><strong style={{ color: 'var(--color-text-primary)' }}>Week 3</strong></td>
                <td className="px-3 py-2.5">Ch7 MCP + 工具集成</td>
                <td className="px-3 py-2.5">连接至少一个 MCP 服务器</td>
                <td className="px-3 py-2.5">能解释 MCP 架构和安全边界</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="px-3 py-2.5"><strong style={{ color: 'var(--color-text-primary)' }}>Week 4</strong></td>
                <td className="px-3 py-2.5">Ch6 Subagent + Ch7 Agent Teams</td>
                <td className="px-3 py-2.5">独立完成一个中型任务</td>
                <td className="px-3 py-2.5">通过 L1 升级评估</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          培训不是"上完课就结束"——每周需要有实际项目任务作为练习场景。
          建议指定一个 L3 成员作为 Mentor，每周做 15 分钟的 1:1 回顾。
        </p>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 9.7: 风险矩阵总览
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          9.7 风险矩阵总览
        </h2>

        <AnimationWrapper
          component={LazyRiskMatrix}
          durationInFrames={210}
          fallbackText="风险矩阵动画加载失败"
        />

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          这张表汇总了全教程中所有风险点和对应的防范措施，方便你快速查阅和检查。
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                {['风险', '影响', '防范措施', '参考章节'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-3 py-2.5 font-semibold"
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
                  '代码质量下降',
                  '高 — bug 进入生产',
                  'PostToolUse 自动测试 + 分级 Review + 度量监控',
                  'Ch5, Ch6, 9.2',
                ],
                [
                  '理解债务累积',
                  '高 — 无法维护',
                  '决策树强制理解验证 + L1 逐行 Review',
                  'Ch2, 9.2',
                ],
                [
                  '敏感数据泄露',
                  '严重 — 合规/安全',
                  'deny 规则 + 密钥扫描 Hook + 文件保护',
                  'Ch0, Ch5, 9.5',
                ],
                [
                  '成本失控',
                  '中 — 预算超支',
                  'ccusage 监控 + 预算上限 + 模型路由',
                  'Ch0, 9.4',
                ],
                [
                  '上下文窗口耗尽',
                  '中 — 质量下降',
                  'Grep>Read + 主动 compact + 新会话策略',
                  'Ch0',
                ],
                [
                  'API 不可用',
                  '中 — 工作中断',
                  '三级容灾 + HANDOFF.md + 传统开发回退',
                  'Ch8',
                ],
                [
                  '模型更新行为变化',
                  '中 — 产出不稳定',
                  '版本锁定 + 回归测试 + CLAUDE.md 持续维护',
                  'Ch3, Ch8',
                ],
                [
                  '风格漂移/一致性',
                  '低-中 — 代码混乱',
                  'CLAUDE.md 规范 + lint Hook + Review',
                  'Ch2, Ch3',
                ],
                [
                  'Prompt 注入攻击',
                  '中-高 — CI 安全',
                  'CI 只读权限 + 注入检测 Hook + 人工审核',
                  'Ch5, Ch8, 9.5',
                ],
                [
                  '供应商锁定',
                  '低 — 迁移成本',
                  '通用格式 + 平台无关资产 + 文档化决策',
                  'Ch8',
                ],
                [
                  '版权不确定性',
                  '低 — 法律风险',
                  '确保人类实质编辑 + 记录贡献比例',
                  '9.5',
                ],
              ].map((row, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  <td className="px-3 py-2.5">
                    <strong style={{ color: 'var(--color-text-primary)' }}>{row[0]}</strong>
                  </td>
                  <td className="px-3 py-2.5">{row[1]}</td>
                  <td className="px-3 py-2.5">{row[2]}</td>
                  <td className="px-3 py-2.5">
                    <span style={{ color: 'var(--color-accent)' }}>{row[3]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <QualityCallout title="风险管理的核心原则">
          <p>
            这张表不是一次性检查清单——它应该成为<strong style={{ color: 'var(--color-text-primary)' }}>定期审查的活文档</strong>。
            建议每月回顾一次，根据实际使用中遇到的新风险更新。
            记住：最大的风险不是表中列出的任何一项，而是<strong style={{ color: 'var(--color-text-primary)' }}>团队停止思考风险</strong>。
            当使用 AI 变得"习惯性"而不再引起审慎态度时，就是最危险的时候。
          </p>
        </QualityCallout>
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
          title="审计你的 Claude Code 权限配置"
          description="将你当前的 .claude/settings.json 与本章的 L1 权限模板对照，检查是否存在过度宽松的权限配置。记录所有差异，并根据你的实际情况调整。"
          checkpoints={[
            '导出了当前的 settings.json 配置',
            '与 L1 模板逐项对照，标记了所有差异',
            'deny 列表至少包含：rm、push --force、reset --hard、sudo',
            '敏感文件(.env, credentials)在 deny 或 ask 中',
          ]}
        />

        <ExerciseCard
          tier="l2"
          title="搭建成本监控体系"
          description="安装 ccusage，收集一周的使用数据，生成成本报告。分析你的 token 消耗模式，找出最大的成本来源（哪类操作消耗最多 token），并制定一个具体的优化计划。"
          checkpoints={[
            '成功安装并运行 ccusage',
            '生成了至少 7 天的用量报告',
            '识别了 Top 3 的 token 消耗来源',
            '制定了具体的优化措施（如 Grep 替代 Read）',
            '设置了日/月预算上限',
          ]}
        />

        <ExerciseCard
          tier="l3"
          title="编写团队 AI 辅助开发规范"
          description="为你的团队编写一份完整的 AI 辅助开发政策文档，包括：权限分级标准、Review 策略、成本管控规则、安全要求、升降级标准、以及 4 周 onboarding 计划。该文档应该可以作为新成员入职时的唯一参考。"
          checkpoints={[
            '包含 L1/L2/L3 权限模板及升降级标准',
            '包含按变更大小和类型的 Review 策略',
            '包含成本预算和监控方案',
            '包含安全 Hook 配置和数据处理规则',
            '包含 4 周培训计划和验收标准',
            '文档已获得至少 2 位团队成员的 review',
          ]}
        />
      </section>
    </div>
  )
}
