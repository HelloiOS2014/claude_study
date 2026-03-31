import { CodeBlock } from '../../components/content/CodeBlock'
import { QualityCallout } from '../../components/content/QualityCallout'
import { ExerciseCard } from '../../components/content/ExerciseCard'
import { ConfigExample } from '../../components/content/ConfigExample'
import { DecisionTree } from '../../components/content/DecisionTree'
import { ReferenceSection } from '../../components/content/ReferenceSection'
import { diagnosticTree } from '../../data/harness-decision-trees'

/* ═══════════════════════════════════════════════
   Chapter 10: 回顾与诊断
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
            Retrospective &amp; Diagnostics
          </span>
          <span
            className="text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 rounded"
            style={{
              color: 'var(--color-accent)',
              background: 'var(--color-accent-subtle)',
              border: '1px solid var(--color-border-accent)',
            }}
          >
            Harness / 方法论
          </span>
        </div>
        <h1
          className="text-3xl md:text-4xl font-bold mb-4 leading-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          回顾与诊断：从 7 次失败中提炼 Harness 思维
        </h1>
        <p
          className="text-lg leading-relaxed max-w-3xl"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          你已经学完了 Harness 的全部组件。但拥有工具不等于知道何时用哪个。
          这一章我们回顾 Ch03-09 的每次失败，提炼出三个核心原则，
          然后给你一个<strong style={{ color: 'var(--color-text-primary)' }}>诊断框架</strong>——当
          Claude 行为异常时，快速定位根因并选择正确的修复路径。
        </p>
      </header>

      {/* ═══════════════════════════════════════════════
          Failure Opening
          ═══════════════════════════════════════════════ */}
      <section>
        <div
          className="p-6 rounded-lg"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <h3
            className="text-lg font-semibold mb-3"
            style={{ color: 'var(--color-tier-l3)' }}
          >
            真实案例：Hooks 全配好了，方向错了三天
          </h3>
          <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--color-text-secondary)' }}>
            一个三人团队在做电商项目重构。他们是本教程的"好学生"——CLAUDE.md 写得清楚（Ch04），
            pre-commit Hook 确保每次提交都通过 lint + type check + 单元测试（Ch07），
            甚至配了 PostToolUse Hook 在写文件后自动运行相关测试。三天里 Claude 产出了 47 个通过所有检查的 commit。
          </p>
          <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--color-text-secondary)' }}>
            第四天，产品经理提了一个新需求，需要查询"用户最近 30 天的消费总额"。
            他们发现 Claude 设计的数据库 schema 把订单金额存在了 <code>orders</code> 表的一个 JSON 字段里，
            没有独立的 <code>amount</code> 列。这意味着没法用 SQL 做聚合查询，
            要么全部改 schema 做数据迁移，要么在应用层遍历 JSON 计算——三天的 47 个 commit 里有 30+ 个要改。
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            <strong style={{ color: 'var(--color-text-primary)' }}>根因分析：</strong>
            他们有质量<strong>检查</strong>（Hooks 保证代码能编译、能通过测试），
            但没有质量<strong>思考</strong>（Plan Mode 让 Claude 先评估方案再动手）。
            Hooks 是护栏，防你掉下悬崖；但如果你一开始就朝错误的方向走，护栏只能保证你"安全地走错路"。
            <strong style={{ color: 'var(--color-accent)' }}>
              {' '}有 guardrails 不等于有 direction。
            </strong>
          </p>
        </div>

        <p className="mt-4 text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          这个案例揭示了一个关键洞察：Harness 的各层不是独立的"功能"，而是一个<strong style={{ color: 'var(--color-text-primary)' }}>互相补位的系统</strong>。
          缺了任何一层，其他层都无法弥补那个缺口。回顾我们走过的 7 章，每一章都是一次失败驱动的补位。
        </p>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 10.1: 回顾 7 次 Harness 循环
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          10.1 回顾：7 次 Harness 循环
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          从 Ch03 到 Ch09，每一章都遵循同一个模式：发现问题 → 分析根因 → 引入新的 Harness 层。
          这不是巧合——这正是 Harness 设计的核心方法论：<strong style={{ color: 'var(--color-text-primary)' }}>失败驱动演进</strong>。
          下面的表格回顾了每次循环。
        </p>

        {/* ── 7 cycles summary table ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                {['章节', '失败症状', '根因', '引入的 Harness 层', '核心机制'].map((h) => (
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
                  'Ch03',
                  '风格退化——Claude 的输出越来越不符合项目规范',
                  '缺少分级的行为约束',
                  '控制等级选择',
                  'Prefer / Should / Must / Never 四级约束 + reasoning effort 调节',
                ],
                [
                  'Ch04',
                  'Session 失忆——新对话不知道项目约定',
                  '缺少跨 session 持久化的规则',
                  'CLAUDE.md',
                  '三层 CLAUDE.md（全局/项目/模块）+ 规则组织模板',
                ],
                [
                  'Ch05',
                  '复杂任务失控——Claude 边想边做导致方向偏差',
                  '缺少"先想后做"的流程强制',
                  'Plan Mode (EDPE)',
                  'Explore → Design → Prototype → Evaluate 四阶段 + ultrathink',
                ],
                [
                  'Ch06',
                  '重复工作流——每次部署/审查都要重新描述步骤',
                  '缺少可复用的多步骤指令',
                  'Skills',
                  'SKILL.md 文件 + 手动/自动触发 + 斜杠命令',
                ],
                [
                  'Ch07',
                  '遗忘检查——Claude 跳过 lint/test 直接提交',
                  '缺少确定性的质量关卡',
                  'Hooks',
                  'PreToolUse/PostToolUse 事件 + command/agent handler',
                ],
                [
                  'Ch08',
                  '上下文衰减——长对话后输出质量崩塌',
                  '上下文窗口被历史信息稀释',
                  'Subagent 隔离',
                  'Task tool 分发 + 200K 新鲜上下文 + 结果合并',
                ],
                [
                  'Ch09',
                  '人工瓶颈——人类成为 CI/CD 流程中的等待环节',
                  '缺少无头运行和编程接口',
                  'SDK / CI / CD',
                  'claude-agent-sdk + GitHub Actions + headless mode',
                ],
              ].map((row, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-2.5">
                      {j === 0 ? (
                        <strong style={{ color: 'var(--color-accent)' }}>{cell}</strong>
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

        <QualityCallout title="发现模式了吗？">
          <p className="mb-2">
            每次"失败"都不是技术 bug，而是<strong style={{ color: 'var(--color-text-primary)' }}>缺少某个 Harness 层</strong>的症状。
            这正是 Harness 和普通"配置"的区别——Harness 是一个系统，各层互相补位。
          </p>
          <p>
            更重要的是：你不需要提前预测所有失败。正确的做法是<strong style={{ color: 'var(--color-text-primary)' }}>从最小配置开始，让失败告诉你需要什么</strong>。
            这引出了下面的三个核心原则。
          </p>
        </QualityCallout>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 10.2: 三个核心原则 (derived from 7 cycles)
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          10.2 三个核心原则
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          从 7 次循环中可以提炼出三个反复出现的主题。它们不是抽象理论——每一个都是实战中用血泪换来的教训。
        </p>

        {/* Principle 1: Spec-driven */}
        <div className="mb-8 pl-4" style={{ borderLeft: '3px solid var(--color-accent)' }}>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            原则 1：Spec 驱动 — 先想清楚再动手
          </h3>
          <p className="mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            <strong style={{ color: 'var(--color-text-primary)' }}>来自 Ch05 的教训：</strong>
            团队让 Claude 直接开始写代码，结果 Claude 边想边做、越写越偏。
            引入 Plan Mode 后，要求 Claude 先完成 Explore → Design 阶段才能进入 Prototype，
            偏差率从 40% 降到了个位数。
          </p>
          <p className="mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            <strong style={{ color: 'var(--color-text-primary)' }}>原则：</strong>
            在 AI 动手之前，人先定义"什么是对的"。这个定义可以是 CLAUDE.md 中的规则（Ch04）、
            Plan Mode 的设计文档（Ch05）、Skill 中的步骤清单（Ch06），甚至是测试用例（Ch07）。
            形式不重要，重要的是<strong>在执行之前就存在一个可验证的标准</strong>。
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            没有 Spec 的 AI 编码就是高级随机漫步——每步都合理，但终点不可预测。
          </p>
        </div>

        {/* Principle 2: Context isolation */}
        <div className="mb-8 pl-4" style={{ borderLeft: '3px solid var(--color-tier-l1)' }}>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            原则 2：上下文隔离 — 第 50 轮要和第 1 轮一样好
          </h3>
          <p className="mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            <strong style={{ color: 'var(--color-text-primary)' }}>来自 Ch08 的教训：</strong>
            一个长 session 在第 30 轮后开始生成与早期输出矛盾的代码。
            原因不是模型"变笨了"，而是上下文窗口被 30 轮的历史信息塞满，关键规则的注意力被稀释。
            引入 Subagent 后，每个子任务在新鲜的 200K 上下文中执行，质量不再随轮次衰减。
          </p>
          <p className="mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            <strong style={{ color: 'var(--color-text-primary)' }}>原则：</strong>
            隔离是对抗上下文衰减最可靠的手段。实现方式从简单到复杂：
            开新 session（零成本）→ /compact 压缩（Ch04 PreCompact Hook）→ Subagent 分发（Ch08）→
            Worktree 并行（Ch08）→ SDK 编排（Ch09）。选择复杂度取决于任务规模。
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            上下文越长，注意力越分散。对 LLM 来说，"遗忘"不是丢失信息，而是被更多信息淹没。
          </p>
        </div>

        {/* Principle 3: Verification loops */}
        <div className="mb-8 pl-4" style={{ borderLeft: '3px solid var(--color-tier-l2)' }}>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            原则 3：验证循环 — 每步产出都经过检验
          </h3>
          <p className="mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            <strong style={{ color: 'var(--color-text-primary)' }}>来自 Ch07 的教训：</strong>
            Claude 写完代码后经常"忘记"跑 lint 和测试就提交了。引入 pre-commit Hook 后，
            每次提交都必须通过确定性脚本的检查——不是"建议"跑测试，而是"不通过就不能提交"。
          </p>
          <p className="mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            <strong style={{ color: 'var(--color-text-primary)' }}>原则：</strong>
            在 Agent 和交付之间插入验证步骤。验证可以是确定性的（lint、type check、test——用 command handler），
            也可以是需要判断力的（安全审查、架构评估——用 agent handler）。
            关键是验证要<strong>自动触发</strong>而不是依赖人记得去做。
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            LangChain 实测：仅加验证循环，agent 任务完成率从 83% 提升到 96%。
          </p>
        </div>

        {/* ── Three principles × Seven chapters mapping ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          三原则 × 七章映射
        </h3>

        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          每一章的 Harness 层都是某个原则（或多个原则）的具体工程实现。
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                {['Harness 层', 'Spec 驱动', '上下文隔离', '验证循环'].map((h) => (
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
                ['Ch03 控制等级', 'Prefer/Must/Never 分级定义标准', '-', '-'],
                ['Ch04 CLAUDE.md', '项目规则持久化为 Spec', '三层 scope 隔离规则', '-'],
                ['Ch05 Plan Mode', 'EDPE 强制先 Design 后 Execute', '-', 'Evaluate 阶段检验 Design'],
                ['Ch06 Skills', '步骤清单即 Spec', '-', '-'],
                ['Ch07 Hooks', '-', '-', 'command/agent handler 自动验证'],
                ['Ch08 Subagent', '-', '200K 新鲜上下文 / Worktree', '-'],
                ['Ch09 SDK/CI', '-', 'headless 隔离环境', 'CI Gate 验证'],
              ].map((row, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-2.5">
                      {j === 0 ? (
                        <strong style={{ color: 'var(--color-accent)' }}>{cell}</strong>
                      ) : cell === '-' ? (
                        <span style={{ color: 'var(--color-text-muted)' }}>--</span>
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

        <QualityCallout title="原则之间的补位关系">
          <p>
            注意到没有任何一层同时覆盖三个原则。这就是为什么开头案例中"只有 Hooks"会失败——
            Hooks 只覆盖验证循环，不覆盖 Spec 驱动（没人先想清楚 schema 设计）。
            <strong style={{ color: 'var(--color-text-primary)' }}>
              {' '}一个健壮的 Harness 至少要各有一层覆盖每个原则。
            </strong>
          </p>
        </QualityCallout>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 10.3: 诊断框架
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          10.3 诊断框架：Claude 行为异常时怎么办
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          原则帮你<em>设计</em> Harness，但真正需要它们的时刻是 Claude 出问题时。
          下面的诊断框架是你的排故指南——从症状出发，沿决策树定位根因，直达修复方案。
        </p>

        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-text-muted)' }}>
          每个叶节点标注了修复难度：L1（改配置/措辞）、L2（加 Hook 或 compact 策略）、L3（涉及架构调整）。
        </p>

        {/* ── Interactive diagnostic decision tree ── */}
        <DecisionTree
          root={diagnosticTree}
          title="Claude 行为诊断决策树"
        />

        {/* ── Diagnostic quick-reference ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          诊断速查表
        </h3>

        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          如果你偏好文本形式，这里是决策树的线性版本——可以贴到你的 CLAUDE.md 或团队 wiki 中。
        </p>

        <CodeBlock
          language="markdown"
          title="diagnostic-cheatsheet.md"
          code={`# Claude 行为诊断速查表

## 症状 1: 忽略了项目规范
├── 上下文占用 >70% → 上下文稀释
│   修复: /compact, Subagent 拆分, PreCompact Hook 保留规则
└── 上下文占用 <70% → 措辞太弱
    修复: 升级为 MUST/NEVER, 关键规则用 Hook 强制执行

## 症状 2: 做了不该做的事
├── 没有 deny 规则 → 缺少禁令
│   修复: CLAUDE.md 中加 "NEVER: [行为]"
└── 有 deny 但仍违反 → 禁令失效
    修复: 升级为 PreToolUse Hook, 配置 allowedTools 白名单

## 症状 3: 输出质量下降
├── 前 5 轮就差 → Prompt 质量问题
│   修复: 检查规则矛盾, 用 Plan Mode, 给具体示例
└── 15 轮后变差 → 上下文衰减
    修复: /compact, Subagent 隔离, 开新 session + HANDOFF.md

## 症状 4: 太慢或太贵
├── 响应延迟高 → 延迟问题
│   修复: 降 effort, 用 Grep 替代 Read, 减少并行 Subagent
└── Token 消耗大 → 成本问题
    修复: 设 maxIterations, 合理 maxTurns, Grep 替代 Read`}
        />

        <QualityCallout title="诊断框架的元原则">
          <p className="mb-2">
            这个框架本身就体现了 Harness 思维——它不是让你"记住所有配置项"，
            而是从<strong style={{ color: 'var(--color-text-primary)' }}>可观测的症状出发</strong>，
            通过二分法快速缩小范围。
          </p>
          <p>
            实践建议：把上面的速查表复制到你的 CLAUDE.md 或 Notion 中，
            团队成员遇到问题时先对照速查表排查，而不是直接问"Claude 怎么又不行了"。
          </p>
        </QualityCallout>

        {/* ── Diagnostic walkthrough example ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          诊断实战：一次完整的排查过程
        </h3>

        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          让我们用一个真实场景走一遍诊断流程，看看决策树如何引导你找到根因。
        </p>

        <div
          className="p-5 rounded-lg space-y-4"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            场景：CLAUDE.md 里写了 "MUST use snake_case for Python function names"，
            但 Claude 在第 22 轮对话中开始混用 camelCase。
          </p>

          <div className="text-sm space-y-3" style={{ color: 'var(--color-text-secondary)' }}>
            <div className="pl-4" style={{ borderLeft: '2px solid var(--color-accent)' }}>
              <p><strong style={{ color: 'var(--color-text-primary)' }}>Step 1: 识别症状</strong></p>
              <p>"忽略了项目规范" → 进入第一个分支</p>
            </div>

            <div className="pl-4" style={{ borderLeft: '2px solid var(--color-accent)' }}>
              <p><strong style={{ color: 'var(--color-text-primary)' }}>Step 2: 检查上下文</strong></p>
              <p>运行 /cost，发现上下文占用 82%。→ 上下文稀释</p>
            </div>

            <div className="pl-4" style={{ borderLeft: '2px solid var(--color-accent)' }}>
              <p><strong style={{ color: 'var(--color-text-primary)' }}>Step 3: 执行修复</strong></p>
              <p>
                (1) 立即 /compact 压缩上下文 → 压缩后占用降到 35%，命名规范恢复正常。
                (2) 长期方案：对超过 15 轮的 session，配置 PreCompact Hook 保留 CLAUDE.md 核心规则；
                把后续的大任务拆分为 Subagent 执行。
              </p>
            </div>

            <div className="pl-4" style={{ borderLeft: '2px solid var(--color-tier-l2)' }}>
              <p><strong style={{ color: 'var(--color-text-primary)' }}>Step 4: 验证修复</strong></p>
              <p>
                compact 后继续对话 5 轮，确认 snake_case 规范被持续遵循。
                同时在 pre-commit Hook 中加入 pylint naming checker 做最后防线（验证循环原则）。
              </p>
            </div>
          </div>

          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            整个排查过程不到 2 分钟。没有诊断框架时，常见反应是"Claude 怎么又不听话了"然后重新开 session——
            这能暂时解决问题，但不能防止复发。
          </p>
        </div>

        {/* ── Common misdiagnosis ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          常见误诊
        </h3>

        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          以下是团队最容易犯的诊断错误——症状看起来像 A，实际是 B。
        </p>

        <div className="space-y-3">
          <div
            className="p-4 rounded-lg"
            style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
            }}
          >
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <strong style={{ color: 'var(--color-text-primary)' }}>误诊："Claude 变笨了"</strong>
              → 实际是上下文衰减。LLM 的能力不会随时间变化，但注意力会随上下文长度稀释。
              修复：/compact 或 Subagent，而不是"换个模型"。
            </p>
          </div>

          <div
            className="p-4 rounded-lg"
            style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
            }}
          >
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <strong style={{ color: 'var(--color-text-primary)' }}>误诊："规则写得不够详细"</strong>
              → 实际可能是措辞等级不对。"建议用 snake_case"（Prefer 级）和"MUST use snake_case"（Must 级）
              在 Claude 的遵循率上有巨大差异。问题不是信息量，而是约束力。
            </p>
          </div>

          <div
            className="p-4 rounded-lg"
            style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
            }}
          >
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <strong style={{ color: 'var(--color-text-primary)' }}>误诊："需要更多 Hooks"</strong>
              → 实际可能是缺少 Spec。本章开头的案例就是典型——Hooks 能保证代码质量（验证循环），
              但不能保证设计方向（Spec 驱动）。加再多 Hook 也救不了一个错误的 schema 设计。
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 10.4: 为你的项目设计 Harness
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          10.4 为你的项目设计 Harness
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          现在你知道了原则和诊断方法，但如何从零开始为一个项目搭 Harness？
          答案是：<strong style={{ color: 'var(--color-text-primary)' }}>不要提前设计完美方案</strong>。
          从最小配置开始，让失败告诉你需要什么。
        </p>

        {/* ── Iterative approach ── */}
        <h3
          className="text-lg font-semibold mt-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          迭代式 Harness 演进路线
        </h3>

        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          以下是一个经过验证的渐进演进路线。不是每个项目都需要走到最后一步——当问题消失时就停下来。
        </p>

        <CodeBlock
          language="markdown"
          title="harness-evolution.md"
          code={`# Harness 迭代演进路线

## Stage 0: 裸跑 (Day 1)
直接用 Claude Code，不加任何配置。
目的: 建立 baseline，观察 Claude 在你项目中的自然表现。
时间: 1-2 天

## Stage 1: CLAUDE.md (Week 1)
当 Claude 开始重复犯同样的错 → 写入 CLAUDE.md
- 项目技术栈和架构约定
- 代码风格偏好 (Prefer 级)
- 已知陷阱 (Must/Never 级)
覆盖原则: Spec 驱动 (基础层)

## Stage 2: + Hooks (Week 2-3)
当 Claude 忘记跑检查或违反关键规则 → 加 Hook
- pre-commit: lint + typecheck + test
- PreToolUse(Bash): 拦截危险命令
覆盖原则: + 验证循环

## Stage 3: + Plan Mode / Skills (Month 1)
当任务变复杂、Claude 开始"边想边做" → 用 Plan Mode
当某些流程需要重复执行 → 封装为 Skill
覆盖原则: + Spec 驱动 (深化)

## Stage 4: + Subagent / SDK (Month 2+)
当长对话质量下降 → 引入 Subagent 隔离
当需要 CI/CD 集成 → 引入 SDK
覆盖原则: + 上下文隔离

## 判断标准: 什么时候停
✅ Claude 的输出质量稳定，不需要频繁人工干预
✅ 团队成员对 Claude 的行为有可预期性
✅ 成本在预算范围内
→ 当前 Stage 就是你的最终状态，不需要继续加`}
        />

        {/* ── Anti-patterns ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          反模式：过度工程 vs 不足工程
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div
            className="p-4 rounded-lg"
            style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
            }}
          >
            <h4 className="font-semibold mb-2" style={{ color: 'var(--color-tier-l3)' }}>
              过度工程
            </h4>
            <ul className="text-sm space-y-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              <li>Day 1 就配 21 个角色 + 34 个工作流</li>
              <li>简单 bug 修复也要 Plan Mode + Subagent</li>
              <li>给每个文件类型都设了 Hook</li>
              <li>CLAUDE.md 超过 500 行</li>
            </ul>
            <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
              症状：Claude 花更多时间遵循流程而不是解决问题
            </p>
          </div>

          <div
            className="p-4 rounded-lg"
            style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
            }}
          >
            <h4 className="font-semibold mb-2" style={{ color: 'var(--color-tier-l3)' }}>
              不足工程
            </h4>
            <ul className="text-sm space-y-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              <li>用了三个月还没写 CLAUDE.md</li>
              <li>每次都手动提醒 Claude 跑测试</li>
              <li>长对话质量下降时靠"重新说一遍需求"解决</li>
              <li>团队成员各自有不同的 prompt 习惯</li>
            </ul>
            <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
              症状：同样的问题反复出现，团队在"训练 Claude"上浪费大量时间
            </p>
          </div>
        </div>

        {/* ── Practical example: PR Review Pipeline using three principles ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          实战：用三原则编排 PR Review Pipeline
        </h3>

        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          把前面学的 Skills（Ch06）、Hooks（Ch07）、Subagent（Ch08）、SDK（Ch09）组合起来，
          设计一个体现三原则的 PR 审查流水线。注意每一层对应哪个原则。
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
SDK 编排: 用 claude-agent-sdk 串联整个流程`}
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

        {/* ── Practical example: designing Harness for a project ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          实战：为一个 SaaS 项目设计 Harness
        </h3>

        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          以下是一个中型 SaaS 项目的 Harness 配置示例，展示了三个原则如何落地为具体文件。
        </p>

        <ConfigExample
          title="harness-blueprint.md — SaaS 项目 Harness 蓝图"
          language="markdown"
          code={`# SaaS 项目 Harness 蓝图 (4 人团队)

## Spec 驱动层
CLAUDE.md
├── 全局: ~/.claude/CLAUDE.md (代码风格、Git 约定)
├── 项目: ./CLAUDE.md (技术栈、架构约束、API 规范)
└── 模块: ./src/payments/CLAUDE.md (支付模块特定规则)

Plan Mode: 所有超过 3 个文件的变更必须先 Plan
Skills:
├── .claude/skills/deploy.md (部署 5 步流程)
├── .claude/skills/db-migrate.md (数据库迁移检查清单)
└── .claude/skills/pr-review.md (PR 审查标准)

## 验证循环层
Hooks:
├── pre-commit: npm run lint && npm run typecheck
├── PreToolUse(Bash): 拦截 rm -rf, git push --force
└── PostToolUse(Write): 自动运行受影响的测试文件

## 上下文隔离层
Subagent: 前后端分离的任务用 Task tool 分发
Worktree: 并行开发不同 feature 分支
SDK/CI: PR 创建时自动触发 Claude 审查 (headless)`}
          annotations={[
            { line: 4, text: 'Spec 驱动：三层 scope 从粗到细' },
            { line: 9, text: 'Spec 驱动：Plan Mode 防止"边想边做"' },
            { line: 15, text: '验证循环：确定性脚本做最终把关' },
            { line: 20, text: '上下文隔离：大任务拆分到新鲜上下文' },
          ]}
        />

        {/* ── Exercise: Design your own Harness ── */}
        <ExerciseCard
          tier="l2"
          title="设计你的项目 Harness"
          description="选择你正在做的一个项目，按照迭代演进路线评估它目前处于哪个 Stage，然后设计下一步需要添加的 Harness 层。写一个类似上面蓝图的配置文件，确保三个核心原则都有至少一层覆盖。"
          checkpoints={[
            '确认了项目当前的 Harness Stage (0-4)',
            '识别了当前最常见的失败症状',
            '用诊断框架定位了根因',
            '设计了下一步要添加的 Harness 层',
            '验证三个原则至少各有一层覆盖',
            '写出了具体的文件结构和配置内容',
          ]}
        />

        {/* ── Exercise: Use diagnostic framework ── */}
        <ExerciseCard
          tier="l1"
          title="用诊断框架排查一个真实问题"
          description="回忆你最近一次对 Claude 的输出不满意的经历。用上面的诊断决策树走一遍：症状是什么？走到了哪个叶节点？建议的修复方案是否合理？如果你还没遇到过问题，故意制造一个（比如在长对话中不 /compact，观察质量何时开始下降）。"
          checkpoints={[
            '描述了具体的失败症状',
            '在决策树中走到了叶节点',
            '根因分析是否与实际一致',
            '尝试了建议的修复方案',
            '记录了修复前后的对比',
          ]}
        />

        <ExerciseCard
          tier="l3"
          title="团队级 Harness 部署计划"
          description="为一个 3-5 人的团队设计完整的 Harness 部署计划。包括：(1) Stage 0-4 的每步具体配置文件内容；(2) 每个 Stage 的持续时间和推进条件（什么失败出现了才推进）；(3) 成本估算（每月 API 费用预估）；(4) 容灾预案（Claude API 不可用时的降级方案）；(5) 团队成员的 Onboarding 文档。"
          checkpoints={[
            'Stage 0-4 每步都有具体的文件配置',
            '定义了每个 Stage 的推进条件（基于可观测的失败）',
            '月度成本估算（含 Subagent 并行的峰值成本）',
            '容灾预案：API 故障时的 HANDOFF.md 模板',
            '团队 Onboarding 文档：新成员如何上手 Harness',
            '设置了预算上限和用量告警',
          ]}
        />
      </section>

      {/* ═══════════════════════════════════════════════
          Section 10.5: 方法论参考 (collapsed)
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          10.5 方法论参考
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          社区涌现了大量方法论。它们本身不是"必须学的内容"——你已经掌握了底层原则。
          但如果你想看看别人是怎么把这些原则组合成完整框架的，以下是参考。
        </p>

        <ReferenceSection version="社区方法论速查">
          <div className="space-y-6">
            {/* ── Methodology comparison matrix ── */}
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

            {/* ── GSD details ── */}
            <div className="pl-4" style={{ borderLeft: '3px solid var(--color-tier-l1)' }}>
              <h4 className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                GSD (Get Shit Done) — 上下文隔离的典范
              </h4>
              <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                核心创新：一个 Orchestrator 调度多个 Executor，每个 Executor 获得 200K 新鲜上下文。
                Wave 机制处理依赖关系。约 23K GitHub stars。
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                <strong>适合：</strong>可并行化的大型项目、批量迁移。
                <strong> 不适合：</strong>高耦合的单体修改、需要深度上下文的调试。
                <strong> 成本：</strong>N 个并行 Executor = N 倍 API 费用。
              </p>
            </div>

            {/* ── BMAD details ── */}
            <div className="pl-4" style={{ borderLeft: '3px solid var(--color-accent)' }}>
              <h4 className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                BMAD — Spec 驱动 + 角色分工的典范
              </h4>
              <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                模拟完整敏捷团队：21 个角色（产品经理、架构师、QA 等）+ 34 个预定义工作流。
                从用户故事到部署全流程覆盖。
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                <strong>适合：</strong>需要完整产品生命周期管理的团队、从 0 到 1 的产品。
                <strong> 不适合：</strong>已有成熟流程的团队、小型工具项目。
              </p>
            </div>

            {/* ── Writer/Reviewer details ── */}
            <div className="pl-4" style={{ borderLeft: '3px solid var(--color-tier-l2)' }}>
              <h4 className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                Writer/Reviewer — 验证循环的典范
              </h4>
              <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                两个独立 Claude Code session——Writer 写代码，Reviewer 审查。
                独立上下文天然消除确认偏差（"审查别人的代码"vs"审查自己的代码"）。零配置即可使用。
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                <strong>适合：</strong>安全敏感代码、高质量要求场景。
                <strong> 不适合：</strong>快速原型阶段。
                <strong> 成本：</strong>约 2 倍 token，但 review 轮次减少。
              </p>
            </div>

            {/* ── Other methodologies brief ── */}
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
                      '让 Claude 自动"写 → 测 → 修"循环直到测试全通过',
                    ],
                    [
                      'RIPER-5',
                      '五阶段 + Memory Bank',
                      'Spec + 验证循环',
                      'Research → Innovate → Plan → Execute → Review，每阶段有门控',
                    ],
                    [
                      'AB Method',
                      'Spec + 8 Agent',
                      'Spec 驱动',
                      '先写 Spec，按 Mission 顺序执行，8 个专业角色各司其职',
                    ],
                    [
                      'Context Priming',
                      '四层上下文注入',
                      'Spec（基础层）',
                      'CLAUDE.md → Skills → Dynamic Injection → PreCompact Hook',
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
          </div>
        </ReferenceSection>
      </section>

      {/* ═══ References ═══ */}
      <ReferenceSection version="Claude Code v1.x">
        <div className="text-sm space-y-2" style={{ color: 'var(--color-text-secondary)' }}>
          <p><strong style={{ color: 'var(--color-text-primary)' }}>诊断框架：</strong>Claude 行为诊断决策树（本章 10.3 节）</p>
          <p><strong style={{ color: 'var(--color-text-primary)' }}>Harness 演进路线：</strong>Stage 0 → Stage 4 迭代式演进（本章 10.4 节）</p>
          <p><strong style={{ color: 'var(--color-text-primary)' }}>社区方法论：</strong>GSD / BMAD / Writer-Reviewer / RIPER-5 / AB Method / Context Priming</p>
          <p><strong style={{ color: 'var(--color-text-primary)' }}>LangChain 研究：</strong>验证循环对 Agent 任务完成率的影响 (83% → 96%)</p>
        </div>
      </ReferenceSection>
    </div>
  )
}
