import { CodeBlock } from '../../components/content/CodeBlock'
import { PromptCompare } from '../../components/content/PromptCompare'
import { QualityCallout } from '../../components/content/QualityCallout'
import { ExerciseCard } from '../../components/content/ExerciseCard'
import { ConfigExample } from '../../components/content/ConfigExample'
import { DecisionTree } from '../../components/content/DecisionTree'
import type { TreeNode } from '../../components/content/DecisionTree'

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
                text: '使用 Subagent 流水线（第 6 章的三阶段模式）。主 Agent 负责在阶段之间传递结果。简单、可预测、成本可控。',
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
   Chapter 7 Component
   ═══════════════════════════════════════════════ */

export default function Ch07() {
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
            07
          </span>
          <span
            className="text-xs uppercase tracking-widest font-medium"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Teams + MCP
          </span>
        </div>
        <h1
          className="text-3xl md:text-4xl font-bold mb-4 leading-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          用 AI 做架构决策：多角度分析与验证
        </h1>
        <p
          className="text-lg leading-relaxed max-w-3xl"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          第 6 章的 Subagent 是"主从"关系 —— 主 Agent 发号施令，Subagent 听命执行。
          但真实的软件工程不是独裁制：前端需要知道后端改了什么 API，测试需要知道哪些模块变了，
          架构师需要看到所有人的方案才能做决策。
          这一章我们升级到 Agent Teams（对等协作）和 MCP（连接外部系统），
          让 AI 不仅能和 AI 协作，还能操作浏览器、查数据库、调 API。
        </p>
      </header>

      {/* ═══════════════════════════════════════════════
          Section 7.1: Agent Teams 架构
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          7.1 Agent Teams 架构
        </h2>

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
      </section>

      {/* ═══════════════════════════════════════════════
          Section 7.2: Teams 实战
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          7.2 Teams 实战
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
          Section 7.3: 高级模式
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          7.3 高级模式
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
          Section 7.4: MCP —— 连接外部系统
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          7.4 MCP：连接外部系统
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          到目前为止，Claude Code 只能操作文件系统和终端。
          MCP（Model Context Protocol）让 Claude Code 可以连接任何外部系统 ——
          浏览器、数据库、GitHub、Slack、你自己的内部工具。
        </p>

        {/* ── MCP 协议概述 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          MCP 协议：三种传输方式
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>传输方式</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>特点</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>典型场景</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--color-text-secondary)' }}>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4 font-mono text-xs" style={{ color: 'var(--color-accent)' }}>stdio</td>
                <td className="py-3 px-4">本地进程通信，Claude Code 启动并管理 MCP Server 进程</td>
                <td className="py-3 px-4">本地工具（Playwright、数据库客户端）</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4 font-mono text-xs" style={{ color: 'var(--color-accent)' }}>SSE</td>
                <td className="py-3 px-4">Server-Sent Events，HTTP 长连接</td>
                <td className="py-3 px-4">远程服务（云上的工具服务）</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4 font-mono text-xs" style={{ color: 'var(--color-accent)' }}>Streamable HTTP</td>
                <td className="py-3 px-4">双向流式 HTTP，最新标准</td>
                <td className="py-3 px-4">需要高吞吐的场景</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Playwright MCP ── */}
        <h3
          className="text-lg font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          实战：连接 Playwright MCP 做浏览器自动化
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Playwright MCP 让 Claude Code 可以控制浏览器 —— 导航页面、点击按钮、填写表单、
          截图、读取 DOM。这意味着你可以让 Claude Code 做端到端测试、爬取数据、
          甚至帮你操作 Web UI。
        </p>

        <ConfigExample
          code={`{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"],
      "type": "stdio"
    }
  }
}`}
          language="json"
          title=".claude/settings.json — Playwright MCP"
          annotations={[
            { line: 3, text: '服务器名称，会作为工具前缀出现（如 mcp__playwright__navigate）' },
            { line: 4, text: '启动命令 —— npx 会自动下载并运行最新版本' },
            { line: 5, text: '传递给命令的参数' },
            { line: 6, text: 'stdio 传输 —— Claude Code 直接管理这个进程' },
          ]}
        />

        <CodeBlock
          language="bash"
          title="playwright-mcp-demo.sh"
          code={`# 配置好 Playwright MCP 后，你可以直接对 Claude 说：

# "打开 http://localhost:3000，截一张首页的截图"
# → Claude 调用 mcp__playwright__navigate + mcp__playwright__screenshot

# "在登录页面填写用户名 test@example.com 和密码，然后点登录"
# → Claude 调用 mcp__playwright__fill + mcp__playwright__click

# "检查登录后是否跳转到了 /dashboard"
# → Claude 调用 mcp__playwright__snapshot 读取当前 URL

# "滚动到页面底部，找到 footer 中的版本号"
# → Claude 调用 mcp__playwright__evaluate 执行 JS

# 这本质上就是 E2E 测试，但不需要写代码！
# Claude 理解自然语言，自动翻译为浏览器操作`}
        />

        {/* ── 构建自定义 MCP Server ── */}
        <h3
          className="text-lg font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          构建自定义 MCP Server：数据库查询工具
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          当你需要 Claude Code 访问项目数据库时，可以构建一个自定义的 MCP Server。
          下面分别展示 Python（FastMCP）和 TypeScript（SDK）的实现。
        </p>

        <CodeBlock
          language="python"
          title="mcp_db_server.py — Python FastMCP 实现"
          code={`"""
自定义 MCP Server：安全的数据库查询工具
让 Claude Code 能够查询数据库，但只允许 SELECT 操作
"""
from fastmcp import FastMCP
import asyncpg
import os

mcp = FastMCP("db-query")

# 数据库连接池（复用连接，避免每次查询都建连接）
pool = None

async def get_pool():
    global pool
    if pool is None:
        pool = await asyncpg.create_pool(
            os.environ["DATABASE_URL"],
            min_size=2,
            max_size=10,
        )
    return pool

@mcp.tool()
async def query_database(sql: str, params: list[str] = []) -> str:
    """
    执行只读 SQL 查询。仅允许 SELECT 语句。

    Args:
        sql: SQL 查询语句（必须是 SELECT）
        params: 查询参数（防止 SQL 注入）

    Returns:
        JSON 格式的查询结果
    """
    # 安全检查：只允许 SELECT
    normalized = sql.strip().upper()
    if not normalized.startswith("SELECT"):
        return "ERROR: 只允许 SELECT 查询。禁止 INSERT/UPDATE/DELETE/DROP。"

    # 额外安全：禁止危险关键词
    dangerous = ["DROP", "DELETE", "UPDATE", "INSERT", "ALTER", "TRUNCATE"]
    for keyword in dangerous:
        if keyword in normalized:
            return f"ERROR: 检测到禁止的关键词 {keyword}"

    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(sql, *params)
        # 返回前 100 行，防止结果太大
        result = [dict(row) for row in rows[:100]]
        total = len(rows)
        return {
            "rows": result,
            "total": total,
            "truncated": total > 100,
        }

@mcp.tool()
async def list_tables() -> str:
    """列出数据库中的所有表和字段信息"""
    pool = await get_pool()
    async with pool.acquire() as conn:
        tables = await conn.fetch("""
            SELECT table_name, column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = 'public'
            ORDER BY table_name, ordinal_position
        """)
        return [dict(row) for row in tables]

@mcp.tool()
async def explain_query(sql: str) -> str:
    """分析查询的执行计划，帮助优化慢查询"""
    normalized = sql.strip().upper()
    if not normalized.startswith("SELECT"):
        return "ERROR: 只允许分析 SELECT 查询"

    pool = await get_pool()
    async with pool.acquire() as conn:
        plan = await conn.fetch(f"EXPLAIN ANALYZE {sql}")
        return "\\n".join([row[0] for row in plan])

if __name__ == "__main__":
    mcp.run(transport="stdio")`}
          highlightLines={[36, 37, 38, 44, 45, 46]}
        />

        <CodeBlock
          language="typescript"
          title="mcp-db-server.ts — TypeScript SDK 实现"
          code={`import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import pg from "pg";

const server = new McpServer({
  name: "db-query",
  version: "1.0.0",
});

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

server.tool(
  "query_database",
  "执行只读 SQL 查询。仅允许 SELECT 语句。",
  {
    sql: z.string().describe("SQL 查询语句（必须是 SELECT）"),
    params: z.array(z.string()).optional().describe("查询参数"),
  },
  async ({ sql, params = [] }) => {
    const normalized = sql.trim().toUpperCase();
    if (!normalized.startsWith("SELECT")) {
      return {
        content: [{ type: "text", text: "ERROR: 只允许 SELECT 查询" }],
      };
    }

    const dangerous = ["DROP", "DELETE", "UPDATE", "INSERT", "ALTER"];
    for (const kw of dangerous) {
      if (normalized.includes(kw)) {
        return {
          content: [{ type: "text", text: \`ERROR: 禁止的关键词 \${kw}\` }],
        };
      }
    }

    const result = await pool.query(sql, params);
    const rows = result.rows.slice(0, 100);
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          rows,
          total: result.rowCount,
          truncated: (result.rowCount ?? 0) > 100,
        }, null, 2),
      }],
    };
  }
);

server.tool(
  "list_tables",
  "列出数据库中的所有表和字段信息",
  {},
  async () => {
    const result = await pool.query(\`
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    \`);
    return {
      content: [{ type: "text", text: JSON.stringify(result.rows, null, 2) }],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);`}
        />

        {/* ── MCP Inspector ── */}
        <h3
          className="text-lg font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          用 MCP Inspector 测试
        </h3>

        <CodeBlock
          language="bash"
          title="mcp-inspector.sh"
          code={`# MCP Inspector 是官方的调试工具
# 可以独立测试 MCP Server，不需要连接 Claude Code

# 测试 Python 实现
npx @modelcontextprotocol/inspector python mcp_db_server.py

# 测试 TypeScript 实现
npx @modelcontextprotocol/inspector node mcp-db-server.js

# Inspector 提供一个 Web UI：
# - 查看所有注册的工具和参数
# - 手动调用工具并查看结果
# - 检查错误信息
# - 验证输入/输出格式

# 确保所有工具在 Inspector 中正常工作后，
# 再配置到 Claude Code 中`}
        />

        {/* ── Multi-MCP + Scoping ── */}
        <h3
          className="text-lg font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          多 MCP 编排 + 作用域限定
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          真实项目中，你可能需要同时连接多个 MCP Server。
          但每个 MCP Server 的工具描述都会占用上下文空间。
          Claude Code 通过两种机制来管理这个问题。
        </p>

        <ConfigExample
          code={`{
  "mcpServers": {
    "db": {
      "command": "python",
      "args": ["mcp_db_server.py"],
      "type": "stdio"
    },
    "github": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-github"],
      "type": "stdio",
      "env": {
        "GITHUB_TOKEN": "ghp_xxxxx"
      }
    },
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"],
      "type": "stdio"
    }
  }
}`}
          language="json"
          title=".claude/settings.json — 多 MCP 配置"
          annotations={[
            { line: 3, text: '数据库查询 —— 你自己构建的 MCP Server' },
            { line: 8, text: 'GitHub 操作 —— 创建 PR、查看 Issues、管理 Releases' },
            { line: 15, text: 'Playwright 浏览器自动化 —— 控制浏览器做 E2E 测试' },
          ]}
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
            上下文管理：Scoping + Tool Search 自动延迟加载
          </h4>
          <div className="space-y-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <p>
              <strong style={{ color: 'var(--color-text-primary)' }}>问题：</strong>
              如果 3 个 MCP Server 一共提供 50 个工具，每个工具的描述约 100 tokens，
              光工具描述就占用了 5000 tokens 的上下文空间。
            </p>
            <p>
              <strong style={{ color: 'var(--color-accent)' }}>方案 1 — MCP 作用域限定：</strong>
              在自定义 Agent 的 frontmatter 中用 <code style={{ color: 'var(--color-accent)' }}>mcpServers</code> 指定该 Agent 可用的 MCP。
              例如：测试 Agent 只需要 Playwright，不需要看到 db 和 github 的工具。
            </p>
            <p>
              <strong style={{ color: 'var(--color-accent)' }}>方案 2 — Tool Search 自动延迟加载：</strong>
              Claude Code 默认只在上下文中注入常用工具的描述。当 Claude 需要一个不在当前列表中的工具时，
              它会通过 Tool Search 动态查找和加载。这种机制可以减少约 <strong style={{ color: 'var(--color-text-primary)' }}>85%</strong> 的工具描述占用。
            </p>
          </div>
        </div>

        <ConfigExample
          code={`---
name: "e2e-tester"
description: "使用 Playwright 运行端到端测试"
tools:
  - Read
  - Bash
mcpServers:
  - playwright
maxTurns: 20
---

# E2E Tester Agent

只使用 Playwright MCP 进行浏览器测试。
不需要数据库和 GitHub 的工具。`}
          language="markdown"
          title=".claude/agents/e2e-tester.md — MCP 作用域限定"
          annotations={[
            { line: 7, text: '只加载 playwright MCP 的工具 —— db 和 github 的工具不会出现在这个 Agent 的上下文中' },
          ]}
        />
      </section>

      {/* ═══════════════════════════════════════════════
          Section 7.5: MCP 安全
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          7.5 MCP 安全
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          MCP 是一个开放协议 —— 任何人都可以发布 MCP Server。
          这意味着供应链攻击是一个真实的威胁。
        </p>

        {/* ── 供应链风险 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          供应链风险：Cline / OpenClaw 事件
        </h3>

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
            安全事件案例
          </div>
          <div className="px-5 py-4 space-y-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <p>
              Cline 的 MCP 市场（OpenClaw）曾发现 <strong style={{ color: '#f87171' }}>1184 个恶意 skills</strong>。
              这些恶意扩展伪装成正常的开发工具，但实际上会：
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>在工具描述中隐藏恶意指令（Prompt Injection）</li>
              <li>在执行命令时偷偷读取环境变量和凭证文件</li>
              <li>将敏感数据发送到外部服务器</li>
              <li>修改代码引入后门</li>
            </ul>
            <p className="mt-2">
              这不是假设性的风险 —— 它已经在真实世界中发生了。
            </p>
          </div>
        </div>

        {/* ── 安全策略 ── */}
        <h3
          className="text-lg font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          防御策略：信任边界与 Deny Rules
        </h3>

        <CodeBlock
          language="typescript"
          title="mcp-security-checklist.ts"
          code={`// ═══ MCP 安全检查清单 ═══

// 1. 信任边界（Trust Boundaries）
// - 只安装你信任的 MCP Server
// - 优先使用官方维护的 Server（@modelcontextprotocol/*）
// - 第三方 Server 必须审查源码
// - 永远不要从不明来源安装 MCP Server

// 2. 最小权限原则
// - 数据库 MCP 只给 SELECT 权限，不给 DML
// - GitHub MCP 只给 read 权限，除非确实需要写入
// - Playwright MCP 限制可访问的域名

// 3. 环境变量隔离
// - 不要在 MCP 配置中硬编码凭证
// - 使用环境变量或密钥管理服务
// - 为每个 MCP Server 创建专用的、最小权限的凭证

// 4. Deny Rules（拒绝规则）
// 在 .claude/settings.json 中配置：
const denyRulesExample = {
  "permissions": {
    "deny": [
      // 禁止 MCP 工具读取敏感路径
      "mcp__*__read_file:.env*",
      "mcp__*__read_file:*credentials*",
      "mcp__*__read_file:*secret*",

      // 禁止数据库 MCP 执行非 SELECT 操作
      // （即使 Server 端已做了限制，也要在客户端再限制一次）
      "mcp__db__execute_mutation:*",

      // 禁止 Playwright 访问外部域名
      "mcp__playwright__navigate:*://external-domain.com/*",
    ]
  }
};

// 5. 审计日志
// Claude Code 记录了所有 MCP 工具调用
// 定期检查是否有意外的工具调用模式
// 路径：~/.claude/logs/`}
          highlightLines={[24, 25, 26, 27, 28]}
        />

        <PromptCompare
          bad={{
            label: '不安全的配置',
            prompt: `{
  "mcpServers": {
    "magic-tools": {
      "command": "npx",
      "args": ["some-random-mcp-package"]
    }
  }
}
// 从 npm 安装未审查的第三方 MCP
// 使用默认权限（全部允许）
// 没有 deny rules`,
            explanation: '未审查的第三方包可能包含恶意代码。没有 deny rules 意味着 MCP Server 可以读取任何文件、执行任何操作。',
          }}
          good={{
            label: '安全的配置',
            prompt: `{
  "mcpServers": {
    "db": {
      "command": "python",
      "args": ["./tools/mcp_db_server.py"]
    }
  },
  "permissions": {
    "deny": [
      "mcp__*__read_file:.env*",
      "mcp__*__read_file:*secret*"
    ]
  }
}
// 使用自建的 MCP Server（源码可控）
// 配置了 deny rules 保护敏感文件`,
            explanation: '自建 MCP Server 源码完全可控。Deny rules 作为第二道防线，即使 Server 有漏洞，也无法访问敏感文件。',
          }}
        />

        <QualityCallout title="安全底线">
          <p>
            MCP 的安全哲学和 npm 包管理类似 —— 生态越开放，供应链攻击面越大。
            记住三条底线：
          </p>
          <ol className="list-decimal pl-5 mt-2 space-y-1">
            <li><strong>只安装你审查过的 MCP Server</strong> —— 对待 MCP 安装和对待 npm install 一样谨慎</li>
            <li><strong>始终配置 deny rules</strong> —— 即使你信任 Server 源码，也要限制敏感路径的访问</li>
            <li><strong>为每个 MCP Server 创建最小权限凭证</strong> —— 数据库只给 SELECT，GitHub 只给 read</li>
          </ol>
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

        <ExerciseCard
          tier="l2"
          title="连接 Playwright MCP 并自动化一个浏览器测试"
          description="配置 Playwright MCP Server，然后让 Claude Code 帮你完成一个端到端测试：打开你的项目的某个页面，进行一系列交互（点击、输入、导航），最后验证页面状态是否符合预期。"
          checkpoints={[
            '.claude/settings.json 中正确配置了 Playwright MCP',
            'Claude 可以成功导航到指定 URL',
            'Claude 可以执行至少 3 种不同的浏览器操作（点击、输入、截图等）',
            'Claude 能正确验证页面最终状态',
            '整个过程用自然语言指令完成，没有手写 Playwright 代码',
          ]}
        />

        <ExerciseCard
          tier="l3"
          title="构建自定义 MCP Server 并集成到项目中"
          description="为你的项目数据库构建一个自定义 MCP Server（参考 7.4 节的代码）。实现至少 3 个工具：list_tables、query_database（只读）、explain_query。用 MCP Inspector 测试通过后，配置到 Claude Code 中，并添加 deny rules 保护敏感数据。"
          checkpoints={[
            'MCP Server 实现了至少 3 个工具',
            'query_database 只允许 SELECT，禁止所有 DML 操作',
            'MCP Inspector 测试全部通过',
            '.claude/settings.json 中正确配置了自定义 MCP Server',
            '配置了 deny rules 保护 .env 和凭证文件',
            'Claude Code 可以通过自然语言查询数据库（如"查看用户表有多少条数据"）',
          ]}
        />
      </section>
    </div>
  )
}
