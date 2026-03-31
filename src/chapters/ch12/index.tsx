import { CodeBlock } from '../../components/content/CodeBlock'
import { QualityCallout } from '../../components/content/QualityCallout'
import { ExerciseCard } from '../../components/content/ExerciseCard'
import { ConfigExample } from '../../components/content/ConfigExample'
import { DecisionTree } from '../../components/content/DecisionTree'
import type { TreeNode } from '../../components/content/DecisionTree'
import { ReferenceSection } from '../../components/content/ReferenceSection'
import { PromptCompare } from '../../components/content/PromptCompare'

/* ═══════════════════════════════════════════════
   Decision Tree: 自动化深度
   ═══════════════════════════════════════════════ */

const orchestrationDepthTree: TreeNode = {
  id: 'root',
  question: '这个任务预估需要多久？',
  description: '自动化本身有成本。选对深度，才能真正提效。',
  children: [
    {
      label: '< 30 分钟',
      node: {
        id: 'quick',
        question: '手动更快',
        result: {
          text: '直接在单会话中完成。brainstorm 问你 5 分钟的问题、plan 生成 2 个任务的计划、subagent 花 2 分钟执行——总共 15 分钟。手动做只要 3 分钟。不要为了流程而流程。',
          tier: 'l1',
        },
      },
    },
    {
      label: '30 分钟 - 2 小时',
      node: {
        id: 'medium',
        question: '需求是否已经清晰？',
        children: [
          {
            label: '需求明确',
            node: {
              id: 'medium-clear',
              question: '部分自动化：Plan + Execute + Review',
              result: {
                text: '跳过 brainstorm，直接 /write-plan 生成计划，subagent 并行执行，最后 /review 全局检查。省掉 Spec 阶段的 5-10 分钟。',
                tier: 'l2',
              },
            },
          },
          {
            label: '需求模糊',
            node: {
              id: 'medium-unclear',
              question: '全流程：Brainstorm + Plan + Execute + Review',
              result: {
                text: '从 /brainstorm 开始走完整流程。模糊需求直接写 plan 会导致执行阶段频繁 NEEDS_CONTEXT，返工成本远高于前期澄清。',
                tier: 'l2',
              },
            },
          },
        ],
      },
    },
    {
      label: '> 2 小时',
      node: {
        id: 'complex',
        question: '全流程自动化',
        result: {
          text: '完整五阶段流水线：Brainstorm + Plan + Execute + Review + Merge。超过 2 小时的任务，手动协调的上下文管理成本会指数级增长——你不是在写代码，你是在当交通指挥。',
          tier: 'l3',
        },
      },
    },
  ],
}

/* ═══════════════════════════════════════════════
   Chapter 12 Component
   ═══════════════════════════════════════════════ */

export default function Ch12() {
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
            12
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
            Harness / 进阶
          </span>
        </div>
        <h1
          className="text-3xl md:text-4xl font-bold mb-4 leading-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          让 Claude 指挥 Claude
        </h1>
        <p
          className="text-lg leading-relaxed max-w-3xl"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          你已经会用 Claude Code 做单个任务了。但当一个功能需要 4 个模块并行开发时，
          你发现自己花了 3 小时手动协调——复制粘贴上下文、确保命名一致、追踪谁依赖谁。
          这一章用一个真实的 webhook 通知系统项目，展示手动协调的痛，然后让 Claude 来指挥整个流程。
        </p>
      </header>

      {/* ═══ Failure Opening ═══ */}
      <section className="space-y-6">
        <div
          className="p-5 rounded-lg"
          style={{
            background: 'rgba(248, 113, 113, 0.06)',
            border: '1px solid rgba(248, 113, 113, 0.25)',
          }}
        >
          <div className="text-sm leading-relaxed space-y-3" style={{ color: 'var(--color-text-secondary)' }}>
            <p>
              你手动协调了 3 小时。4 个终端标签页开着 4 个 Claude session。
              一个子代理用了错误的表名，因为你忘了告诉它数据库 schema。
              另一个在问你已经告诉过别的 session 的上下文。
              第三个的输出跟第一个冲突——一个用了枚举，一个用了字符串。
            </p>
            <p>
              <strong style={{ color: 'var(--color-text-primary)' }}>
                你不是在写代码，你是在当交通指挥。
              </strong>
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 12.1: 手动协调的痛
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          12.1 手动协调的痛
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          任务：给电商 API 加 webhook 通知系统。下单、发货、退款等事件发生时，
          自动通过 HTTP 回调通知第三方系统。你决定把任务拆成 4 个模块，
          每个开一个 Claude session 并行推进。
        </p>

        <CodeBlock
          language="bash"
          title="Terminal Tab 1 — Session 1: DB Migration"
          code={`$ claude
> 帮我创建 webhook 相关的数据库表。需要 webhooks 表（存储订阅信息）
> 和 webhook_events 表（存储投递记录）。

claude: 好的，我来创建迁移文件...

# ✅ 5 分钟后完成
# 生成了 migrations/20260331_webhooks.sql
# 但是——你没想到需要 retry_count 列
# 因为此时你还没想清楚重试策略`}
          showLineNumbers={false}
        />

        <CodeBlock
          language="bash"
          title="Terminal Tab 2 — Session 2: Event Types"
          code={`$ claude
> 定义 webhook 事件类型。需要 order.created, order.shipped,
> order.refunded, product.updated 四种事件。用 TypeScript enum。

claude: 我来定义事件类型系统...

# ✅ 3 分钟后完成
# 生成了 src/webhooks/events.ts
# 用了 TypeScript enum:
#   export enum WebhookEventType {
#     ORDER_CREATED = 'order.created',
#     ORDER_SHIPPED = 'order.shipped',
#     ...
#   }`}
          showLineNumbers={false}
        />

        <CodeBlock
          language="bash"
          title="Terminal Tab 3 — Session 3: Queue Service"
          code={`$ claude
> 实现 webhook 投递队列。需要支持重试和指数退避。

claude: 关于重试策略，我需要几个参数：
  - 最大重试次数是多少？
  - 基础延迟时间？
  - 退避策略的上限？
  - 重试状态存在哪里？

# ❌ 卡住了。这些参数本来应该在 Session 1 的数据库设计中定义
# 但 Session 1 不知道有重试需求——你当时没想到
# 你现在需要：
#   1. 回到 Tab 1 告诉 Session 1 加 retry_count 列
#   2. 把新的 schema 复制粘贴给 Session 3
#   3. 等 Session 1 改完再让 Session 3 继续`}
          showLineNumbers={false}
        />

        <CodeBlock
          language="bash"
          title="Terminal Tab 4 — Session 4: HTTP Delivery"
          code={`$ claude
> 实现 webhook HTTP 投递模块。接收事件，发 POST 请求到订阅者 URL。

claude: 好的，我来实现 HTTP 投递模块...

# ✅ 8 分钟后完成
# 生成了 src/webhooks/delivery.ts
# 但是——它用了字符串字面量:
#   if (event.type === 'order.created') { ... }
#   if (event.type === 'order.shipped') { ... }
#
# 而 Session 2 定义了 enum:
#   WebhookEventType.ORDER_CREATED
#
# 你没告诉 Session 4 要用 Session 2 的 enum
# 两个模块单独看都没错，拼在一起就出问题`}
          showLineNumbers={false}
        />

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          最终你花了 ~3 小时完成这个功能。其中 ~45 分钟是你在复制粘贴上下文、
          协调 session 之间的一致性、手动追踪任务状态。
        </p>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <strong style={{ color: 'var(--color-text-primary)' }}>你是瓶颈。</strong>
        </p>

        <CodeBlock
          language="bash"
          title="手动协调的时间去哪了"
          code={`# 时间分配（估算）
实际编码和设计          ~1h 45m   ████████████░░░░░░░░ 58%
复制粘贴上下文给不同 session   ~25m     █████░░░░░░░░░░░░░░░ 14%
等一个 session 完成再通知另一个 ~20m     ████░░░░░░░░░░░░░░░░ 11%
发现不一致后手动修复          ~20m     ████░░░░░░░░░░░░░░░░ 11%
追踪"谁完成了、谁在等谁"      ~10m     ██░░░░░░░░░░░░░░░░░░  6%
─────────────────────────────────────────────────────
总计                          ~3h`}
          showLineNumbers={false}
        />

        <p className="text-base leading-relaxed mt-4" style={{ color: 'var(--color-text-secondary)' }}>
          如果 Claude 能自己指挥这些步骤呢？
        </p>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 12.2: Superpowers 指挥实战
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          12.2 Superpowers 指挥实战
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          同一个 webhook 项目，这次用 superpowers 插件让 Claude 指挥整个流程。
          先装好：
        </p>

        <ConfigExample
          language="json"
          title=".claude/settings.json — 安装 superpowers"
          code={`{
  "plugins": [
    "claude-plugins-official/superpowers"
  ]
}`}
        />

        {/* ════════════════════════════════════════════
            12.2a /brainstorm
            ════════════════════════════════════════════ */}
        <h3
          className="text-xl font-bold mt-12 pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          12.2a /brainstorm — 发现你没想到的问题
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          手动协调时，你直接开干——然后在 Session 3 被重试参数卡住。
          这次先让 brainstorm 把需求问清楚。
        </p>

        <CodeBlock
          language="markdown"
          title="brainstorm 对话（4 轮）"
          code={`# ── 第 1 轮: 启动 ──────────────────────────────────
> /brainstorm 给电商 API 加 webhook 通知系统

brainstorm: 我来帮你探索这个需求。先问一个关键问题：
webhook 需要在服务器重启后继续投递，还是 fire-and-forget 就够了？

  a) 持久化队列 — 事件写入数据库/消息队列，重启后恢复投递
  b) 内存队列 — 简单快速，但服务重启会丢失未投递事件
  c) 不确定，看场景

# ── 第 2 轮: 你没想到这个问题 ────────────────────────
> 我原本想的是 fire-and-forget，但你这么一说...
> 订单事件不能丢，退款通知丢了第三方对不上账。得持久化。

brainstorm: 好的，持久化队列意味着我们需要：
  - 数据库表存储事件和投递状态
  - 重试机制（投递失败后指数退避重试）
  - 死信处理（多次重试后仍失败的事件）

下一个问题：你的重试策略偏好是？
  a) 固定间隔（简单，但高峰期可能雪崩）
  b) 指数退避（推荐：1s → 2s → 4s → 8s...）
  c) 指数退避 + 抖动（最佳实践，避免 retry storm）

# ── 第 3 轮: 确认技术细节 ──────────────────────────
> c，指数退避加抖动。最大重试 5 次，基础延迟 1 秒，上限 60 秒。

brainstorm: 明白了。还有一个安全方面的问题：
webhook 投递需要签名验证吗？即——接收方如何确认请求确实来自你的系统？

  a) HMAC-SHA256 签名（推荐：Stripe、GitHub 等都用这个）
  b) Basic Auth
  c) 暂时不做，后续再加

# ── 第 4 轮: 输出设计文档 ──────────────────────────
> a，HMAC 签名。每个 webhook 订阅生成独立的 secret。

brainstorm: 整理完毕。我把设计文档写到 docs/webhook-spec.md 了。

✅ docs/webhook-spec.md 已生成
包含：事件类型定义、数据库 schema（含 retry_count）、
重试策略（指数退避 + 抖动, max 5, base 1s, cap 60s）、
HMAC 签名方案、死信队列处理、API 端点设计。`}
          showLineNumbers={false}
        />

        <QualityCallout title="/brainstorm 的价值不在于生成答案，而在于问出你没想到的问题">
          回看手动协调的场景：你直接开干，然后在 Session 3 被"重试参数是什么"卡住。
          brainstorm 在第 1 轮就问了"要不要持久化"——这个问题改变了整个架构方向。
          如果你在写代码之后才发现需要持久化，返工成本是现在的 10 倍。
        </QualityCallout>

        {/* ════════════════════════════════════════════
            12.2b /write-plan
            ════════════════════════════════════════════ */}
        <h3
          className="text-xl font-bold mt-12 pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          12.2b /write-plan — 计划是活的
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          brainstorm 产出了 <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>docs/webhook-spec.md</code>，
          现在让 /write-plan 把它转化为可执行的实施计划。
        </p>

        <CodeBlock
          language="markdown"
          title="write-plan 产出（原始版本 v1）"
          code={`# Implementation Plan: Webhook Notification System
# Source: docs/webhook-spec.md

## Task 1: DB Migration
- Files: migrations/20260331_webhooks.sql
- Steps:
  1. 创建 webhooks 表（id, url, secret, events, active, created_at）
  2. 创建 webhook_events 表（id, webhook_id, event_type, payload,
     status, retry_count, next_retry_at, created_at）
  3. 添加索引：webhook_events(status, next_retry_at) 用于队列查询
- Dependencies: 无
- Model: Haiku（机械性 DDL 生成）

## Task 2: Event Type System
- Files: src/webhooks/types.ts
- Steps:
  1. 定义 WebhookEventType enum
  2. 定义 WebhookPayload<T> 泛型接口
  3. 为每种事件定义 payload schema
- Dependencies: 无
- Model: Haiku

## Task 3: Queue Service + Retry
- Files: src/webhooks/queue.ts, src/webhooks/__tests__/queue.test.ts
- Steps:
  1. 写测试：入队、出队、重试调度、死信判定
  2. 实现 WebhookQueue class
  3. 指数退避 + 抖动：base 1s, max 5 retries, cap 60s
- Dependencies: Task 1 (schema), Task 2 (event types)
- Model: Sonnet（需要设计判断力）

## Task 4: HTTP Delivery + HMAC
- Files: src/webhooks/delivery.ts, src/webhooks/__tests__/delivery.test.ts
- Steps:
  1. 写测试：正常投递、超时、签名验证
  2. 实现 WebhookDelivery class
  3. HMAC-SHA256 签名：X-Webhook-Signature header
  4. 设置 HTTP 超时 (10s)
- Dependencies: Task 2 (event types)
- Model: Sonnet（安全相关）

## Task 5: Route Integration
- Files: src/routes/webhooks.ts, src/routes/orders.ts (修改)
- Steps:
  1. CRUD 端点：创建/更新/删除 webhook 订阅
  2. 在 order 路由的 create/ship/refund handler 中触发事件
  3. 端到端测试
- Dependencies: Task 1, 2, 3, 4

## Parallel Groups
- Group A (可并行): Task 1, Task 2
- Group B (依赖 A): Task 3, Task 4 (可并行)
- Group C (依赖 B): Task 5`}
          showLineNumbers={false}
        />

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          计划看起来完整。但真正有价值的不是计划本身——
          是<strong style={{ color: 'var(--color-text-primary)' }}>执行过程中计划会怎么变</strong>。
        </p>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          在实际执行中，Task 3 发现 Task 1 的 migration 少了一个字段（稍后会看到）。
          superpowers 不是把这当成"执行失败"——而是修正计划本身：
        </p>

        <CodeBlock
          language="diff"
          title="Plan 修正：Task 1 migration 需要补充"
          code={`# Plan Amendment (triggered by Task 3 NEEDS_CONTEXT)
# Reason: Task 3 发现 webhook_events 表缺少 last_error 列

  ## Task 1: DB Migration (AMENDED)
  - Files: migrations/20260331_webhooks.sql
  - Steps:
    1. 创建 webhooks 表（id, url, secret, events, active, created_at）
    2. 创建 webhook_events 表（id, webhook_id, event_type, payload,
-      status, retry_count, next_retry_at, created_at）
+      status, retry_count, next_retry_at, last_error, created_at）
    3. 添加索引：webhook_events(status, next_retry_at)
+   4. 补充 last_error TEXT 列（存储最近一次投递失败的错误信息）
+ - Re-run: 是（需要重新执行以补充缺失列）
+ - Triggered by: Task 3 NEEDS_CONTEXT

  ## Task 3: Queue Service + Retry (DEPENDENCY UPDATED)
- - Dependencies: Task 1 (schema), Task 2 (event types)
+ - Dependencies: Task 1 v2 (amended schema), Task 2 (event types)`}
          showLineNumbers={false}
        />

        <PromptCompare
          bad={{
            prompt: `Plan 一旦写好就照做。
Task 3 发现缺字段？
那是 plan 的问题，打补丁修。
但 plan 文档不更新，
后续的人看到的还是旧 plan。`,
            label: '僵化的计划',
            explanation: '把计划当作圣经——写了就不能改。导致执行阶段一边写代码一边打补丁，plan 和实际代码越来越不一致。',
          }}
          good={{
            prompt: `Task 3 发现 Task 1 缺字段。
Plan 自动修正：
1. Task 1 标记为 AMENDED
2. 补充缺失的 last_error 列
3. Task 3 依赖更新为 Task 1 v2
4. Plan 文档同步更新`,
            label: '活的计划',
            explanation: '计划是一个持续修正的活文档。执行过程中的发现会反馈回计划，确保 plan 始终是代码的真实地图。',
          }}
        />

        {/* ════════════════════════════════════════════
            12.2c subagent 执行
            ════════════════════════════════════════════ */}
        <h3
          className="text-xl font-bold mt-12 pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          12.2c 子代理执行 — 真实的状态流转
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Plan 确认后，superpowers 开始分派子代理。下面是真实的终端输出——
          注意，不是所有任务都一帆风顺。
        </p>

        <CodeBlock
          language="bash"
          title="终端输出 — Group A: Task 1 + Task 2（并行）"
          code={`[orchestrator] ═══ Group A: 并行执行 Task 1 + Task 2 ═══

[orchestrator] Dispatching Task 1: DB Migration
  → model: haiku (机械性 DDL)
  → subagent-1 started (context: clean)
  → injected: task spec + webhook-spec.md schema section

[orchestrator] Dispatching Task 2: Event Type System
  → model: haiku (类型定义)
  → subagent-2 started (context: clean)
  → injected: task spec + webhook-spec.md event types section

[subagent-1] Creating: migrations/20260331_webhooks.sql
[subagent-2] Creating: src/webhooks/types.ts

[subagent-1] ✓ webhooks table created
[subagent-1] ✓ webhook_events table created
[subagent-1] ✓ indexes added
[subagent-1] → Status: DONE

[subagent-2] ✓ WebhookEventType enum defined
[subagent-2] ✓ WebhookPayload<T> generic interface defined
[subagent-2] ✓ Per-event payload schemas defined
[subagent-2] → Status: DONE

[orchestrator] Group A complete: Task 1 ✓ Task 2 ✓`}
          showLineNumbers={false}
        />

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Group A 顺利完成。注意模型选择：Task 1 和 Task 2 都是机械性工作（DDL 和类型定义），
          用 Haiku 既省钱又快。接下来进入 Group B——这是摩擦出现的地方。
        </p>

        <CodeBlock
          language="bash"
          title="终端输出 — Group B: Task 3（NEEDS_CONTEXT）"
          code={`[orchestrator] ═══ Group B: 并行执行 Task 3 + Task 4 ═══

[orchestrator] Dispatching Task 3: Queue Service + Retry
  → model: sonnet (需要设计判断力)
  → subagent-3 started (context: clean)
  → injected: task spec + Task 1 schema + Task 2 types

[subagent-3] Writing tests: src/webhooks/__tests__/queue.test.ts
[subagent-3] Implementing: src/webhooks/queue.ts
[subagent-3] ...
[subagent-3] ⚠ NEEDS_CONTEXT:
  "spec 说'指数退避'，重试参数已明确（max 5, base 1s, cap 60s）。
   但 webhook_events 表没有 last_error 列——
   重试失败时我无法记录失败原因。
   需要确认：是否需要在 DB 层存储错误信息？
   如果是，Task 1 的 migration 需要补充 last_error TEXT 列。"

[orchestrator] Task 3 → NEEDS_CONTEXT
  → Paused, waiting for developer input`}
          showLineNumbers={false}
        />

        <QualityCallout title="NEEDS_CONTEXT 不是失败 — 是系统在正确工作">
          手动协调时，Session 3 会怎么做？猜一个方案然后继续写。
          也许它在代码里加一个 <code style={{ background: 'var(--color-bg-tertiary)', padding: '2px 6px', borderRadius: '3px', fontSize: '12px' }}>// TODO: add error tracking</code>，
          也许它自己在代码层面做了一个 in-memory error log。
          无论哪种，都是在没有正确信息的情况下做了一个决定——这个决定迟早要返工。
          NEEDS_CONTEXT 的意思是："我知道我缺少信息，我选择停下来问，而不是猜。"
        </QualityCallout>

        <CodeBlock
          language="bash"
          title="终端输出 — 开发者响应 + Task 3 重跑"
          code={`# 开发者响应
[developer] > 是的，加 last_error TEXT 列。migration 需要修正。

[orchestrator] Amending plan: Task 1 需要补充 last_error 列
  → Re-dispatching Task 1 (amended)
  → subagent-1b started (context: Task 1 original output + amendment)

[subagent-1b] Altering: migrations/20260331_webhooks.sql
[subagent-1b] + ALTER TABLE webhook_events ADD COLUMN last_error TEXT;
[subagent-1b] → Status: DONE

[orchestrator] Task 1 (amended) ✓
  → Re-dispatching Task 3 with updated schema

[subagent-3b] Re-running with updated schema...
[subagent-3b] ✓ Queue tests pass (12/12)
[subagent-3b] ✓ Retry with jitter implemented
[subagent-3b] ✓ Dead letter handling after 5 retries
[subagent-3b] ✓ last_error recorded on failure
[subagent-3b] → Status: DONE`}
          showLineNumbers={false}
        />

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          与此同时，Task 4 也在并行执行。它完成了——但带着一个 concern：
        </p>

        <CodeBlock
          language="bash"
          title="终端输出 — Task 4（DONE_WITH_CONCERNS）"
          code={`[orchestrator] Dispatching Task 4: HTTP Delivery + HMAC
  → model: sonnet (安全相关)
  → subagent-4 started (context: clean)
  → injected: task spec + Task 2 types + HMAC spec

[subagent-4] Writing tests: src/webhooks/__tests__/delivery.test.ts
[subagent-4] Implementing: src/webhooks/delivery.ts
[subagent-4] ✓ HMAC-SHA256 signing implemented
[subagent-4] ✓ Delivery tests pass (8/8)
[subagent-4] → Per-task review...

[review] Stage 1 (Spec compliance): ✓ All requirements met
[review] Stage 2 (Code quality):
  ✓ HMAC implementation correct
  ✓ Error handling present
  ⚠ Concern: 出站 HTTP 请求没有设置超时
    → 如果接收方无响应，连接会 hang 住，阻塞工作线程
    → 建议: 添加 timeout: 10_000 (10 秒)

[subagent-4] → Status: DONE_WITH_CONCERNS
  concerns: ["出站 HTTP 请求缺少超时设置"]`}
          showLineNumbers={false}
        />

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <strong style={{ color: 'var(--color-text-primary)' }}>DONE_WITH_CONCERNS</strong> 意味着
          功能正确完成了，但 review 阶段发现了可改进项。系统不会为此阻塞——
          concern 被记录下来，在全局 review 阶段统一处理。
        </p>

        <CodeBlock
          language="bash"
          title="终端输出 — Group C: Task 5（BLOCKED → DONE）"
          code={`[orchestrator] ═══ Group C: Task 5（依赖 Task 1-4 全部完成）═══

[orchestrator] Task 5: Route Integration
  → Status: BLOCKED (waiting for Task 3)
  → Task 3 completed after amendment
  → Status updated: BLOCKED → READY

[orchestrator] Dispatching Task 5: Route Integration
  → model: sonnet
  → subagent-5 started (context: clean)
  → injected: task spec + all output files from Tasks 1-4

[subagent-5] Creating: src/routes/webhooks.ts (CRUD endpoints)
[subagent-5] Modifying: src/routes/orders.ts (event triggers)
[subagent-5] Writing: src/routes/__tests__/webhooks.e2e.test.ts
[subagent-5] ✓ CRUD endpoints implemented
[subagent-5] ✓ Event triggers in order routes
[subagent-5] ✓ E2E tests pass (6/6)
[subagent-5] → Status: DONE

[orchestrator] ═══ All tasks complete ═══
  Task 1: DONE (amended once)
  Task 2: DONE
  Task 3: DONE (re-run after NEEDS_CONTEXT)
  Task 4: DONE_WITH_CONCERNS (1 concern: HTTP timeout)
  Task 5: DONE
  → Ready for global /review`}
          showLineNumbers={false}
        />

        <p className="text-base leading-relaxed mt-4" style={{ color: 'var(--color-text-secondary)' }}>
          回顾这个执行过程中出现的 4 种状态——每种都在自然的场景下出现：
        </p>

        <ul className="space-y-3 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <li className="flex items-start gap-2">
            <code
              className="font-mono text-xs px-1.5 py-0.5 rounded shrink-0 mt-0.5"
              style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-accent)' }}
            >
              DONE
            </code>
            <span>Task 1, 2, 5 — 标准流程，一次通过。大部分任务应该是这个状态。</span>
          </li>
          <li className="flex items-start gap-2">
            <code
              className="font-mono text-xs px-1.5 py-0.5 rounded shrink-0 mt-0.5"
              style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-accent)' }}
            >
              NEEDS_CONTEXT
            </code>
            <span>Task 3 — 发现 spec 没覆盖的细节（last_error 列），主动暂停等开发者确认。比猜测好得多。</span>
          </li>
          <li className="flex items-start gap-2">
            <code
              className="font-mono text-xs px-1.5 py-0.5 rounded shrink-0 mt-0.5"
              style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-accent)' }}
            >
              DONE_WITH_CONCERNS
            </code>
            <span>Task 4 — 功能正确，但缺少 HTTP 超时设置。记录 concern，不阻塞流程。</span>
          </li>
          <li className="flex items-start gap-2">
            <code
              className="font-mono text-xs px-1.5 py-0.5 rounded shrink-0 mt-0.5"
              style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-accent)' }}
            >
              BLOCKED
            </code>
            <span>Task 5 — 依赖 Task 3 完成。Task 3 被 NEEDS_CONTEXT 暂停时，Task 5 自动等待。Task 3 完成后自动解除阻塞。</span>
          </li>
        </ul>

        <p className="text-sm leading-relaxed mt-4" style={{ color: 'var(--color-text-secondary)' }}>
          <strong style={{ color: 'var(--color-text-primary)' }}>模型选择策略：</strong>
          机械性任务（Task 1 DB migration, Task 2 类型定义）用 Haiku 省钱，
          需要判断力的任务（Task 3 队列服务设计, Task 4 安全相关的 HMAC 实现）用 Sonnet。
          一个 5 任务的项目，混合模型比全用 Sonnet 省 ~40% 的 token 成本。
        </p>

        {/* ════════════════════════════════════════════
            12.2d /review
            ════════════════════════════════════════════ */}
        <h3
          className="text-xl font-bold mt-12 pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          12.2d /review — 发现跨任务问题
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          所有任务完成后，<code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>/review</code>
          {' '}对全部变更做一次全局审查。这是发现跨任务问题的唯一机会——
          因为每个子代理只能看到自己的文件。
        </p>

        <CodeBlock
          language="bash"
          title="终端输出 — /review 全局审查"
          code={`[orchestrator] Running /review on all changed files...

[review] Scanning 9 files across 5 tasks...

[review] ═══ CROSS-TASK ISSUE FOUND ═══

  File: src/webhooks/delivery.ts (Task 4)
  Line 47:  if (event.type === 'order.created') {
  Line 52:  if (event.type === 'order.shipped') {
  Line 57:  if (event.type === 'order.refunded') {

  File: src/webhooks/types.ts (Task 2)
  Line 3:   ORDER_CREATED = 'order.created',
  Line 4:   ORDER_SHIPPED = 'order.shipped',
  Line 5:   ORDER_REFUNDED = 'order.refunded',

  Problem: Task 4 (delivery.ts) uses string literals 'order.created'
           instead of WebhookEventType.ORDER_CREATED from Task 2.
           Each task is individually correct, but together they create
           a type-safety gap — refactoring event names later will break
           delivery.ts silently.

  Severity: HIGH
  Fix: Replace string literals with enum references in delivery.ts

[review] ═══ CONCERN RESOLUTION ═══

  From Task 4 DONE_WITH_CONCERNS:
  ⚠ HTTP timeout missing → confirmed, needs fix

[review] ═══ SUMMARY ═══

  Issues found: 2
  1. [HIGH]   String literals vs enum in delivery.ts
  2. [MEDIUM] Missing HTTP timeout in delivery.ts

  Auto-fix available: yes
  → Dispatching fix subagent...`}
          showLineNumbers={false}
        />

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          这正是手动协调中 Session 4 犯的同一个错误——字符串字面量 vs 枚举。
          但手动协调时你在 3 小时后才发现。superpowers 的全局 review 在执行完成后立刻捕获了它。
        </p>

        <CodeBlock
          language="bash"
          title="终端输出 — 自动修复 + 二次审查"
          code={`[orchestrator] Dispatching fix subagent...
  → Fix 1: Replace string literals with WebhookEventType enum
  → Fix 2: Add timeout: 10_000 to HTTP client

[fix-subagent] Modifying: src/webhooks/delivery.ts
  - if (event.type === 'order.created') {
  + if (event.type === WebhookEventType.ORDER_CREATED) {
  (3 replacements)

  + import { WebhookEventType } from './types'
  + const client = axios.create({ timeout: 10_000 })

[fix-subagent] Running tests... ✓ All 26 tests pass
[fix-subagent] → Status: DONE

[orchestrator] Re-running /review...

[review] ✓ No cross-task issues found
[review] ✓ All concerns resolved
[review] ✓ Type safety: enum usage consistent across all files
[review] → PASS`}
          showLineNumbers={false}
        />

        <QualityCallout title="per-task review 检查零件，global review 检查整机">
          每个子代理完成后的 per-task review 能检查"这个零件合不合格"——
          Task 4 的 HMAC 实现正确吗？测试覆盖了吗？这些它能回答。
          但"Task 4 的字符串跟 Task 2 的枚举对不上"——这是一个跨边界的问题，
          只有能看到全部代码的 global review 才能发现。
          两者不是冗余，是互补。
        </QualityCallout>

        {/* ════════════════════════════════════════════
            12.2e 收尾
            ════════════════════════════════════════════ */}
        <h3
          className="text-xl font-bold mt-12 pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          12.2e 收尾
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          /review 通过后，选择"创建 PR"：
        </p>

        <CodeBlock
          language="bash"
          title="终端输出 — PR 创建"
          code={`[orchestrator] Creating PR...

  Branch: feature/webhook-notifications
  Title:  feat: add webhook notification system with retry + HMAC

  ## Summary
  - DB schema for webhook subscriptions and event delivery tracking
  - Event type system with TypeScript enum
  - Persistent queue with exponential backoff + jitter (max 5, base 1s, cap 60s)
  - HTTP delivery with HMAC-SHA256 signing and 10s timeout
  - Dead letter handling after exhausted retries
  - CRUD endpoints for webhook management
  - Event triggers in order routes (create, ship, refund)

  ## Test Coverage
  - Queue service: 12 tests
  - HTTP delivery: 8 tests
  - E2E routes: 6 tests
  - Total: 26 tests, all passing

  ## Review Notes
  - Plan amended once: added last_error column (discovered during queue implementation)
  - 2 cross-task issues found and fixed in global review

  → PR #147 created: https://github.com/your-org/ecommerce-api/pull/147`}
          showLineNumbers={false}
        />

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          从 <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>/brainstorm</code> 到 PR 创建，
          总时间 ~35 分钟。其中你的手动操作时间 ~8 分钟（回答 brainstorm 问题 + 确认 plan + 响应 NEEDS_CONTEXT + 选择"创建 PR"）。
          手动协调是 3 小时。
        </p>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 12.3: 什么时候不该自动化
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          12.3 什么时候不该自动化
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          自动化不是越多越好。上面的 webhook 项目适合全流程自动化——5 个并行任务、跨模块依赖、
          需要设计决策。但很多日常任务根本不需要这套流程。
        </p>

        <DecisionTree
          root={orchestrationDepthTree}
          title="自动化深度决策"
        />

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          反面教材：对小任务过度自动化
        </h3>

        <CodeBlock
          language="bash"
          title="过度自动化的真实案例"
          code={`# 任务：修复一个 2 文件的 bug — 日期格式化在时区转换后丢失了毫秒

# 用了全流程自动化：
> /brainstorm 修复日期格式化 bug，时区转换后毫秒丢失

brainstorm (5 min):
  "这个 bug 的根因可能有三种情况..."
  "你的时区处理用的什么库？"
  "是否涉及数据库存储？"
  → 这些问题你在 bug report 里已经知道答案了

> /write-plan
write-plan (3 min):
  Task 1: 修复 formatDate 函数
  Task 2: 添加时区转换测试
  → 2 个任务的计划...真的需要 plan？

> 执行 (2 min)
> /review (3 min)
> 创建 PR (2 min)

# 全流程总计: ~15 分钟
# 手动直接修: ~3 分钟
#
# 过度自动化浪费了 12 分钟和 ~13K tokens。`}
          showLineNumbers={false}
        />

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          各阶段成本参考
        </h3>

        <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          中等复杂度功能（~5 个任务）的典型消耗：
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                {['阶段', 'Token 消耗', '时间', '可跳过条件'].map((h) => (
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
                ['brainstorm', '~5K tokens', '5-10 分钟', '需求已明确'],
                ['write-plan', '~8K tokens', '2-5 分钟', '已有实施计划'],
                ['execute (per task)', '~10-30K tokens', '3-10 分钟/任务', '不可跳过'],
                ['per-task review', '~2-3K tokens/任务', '1-2 分钟/任务', '不可跳过'],
                ['global review', '~10K tokens', '3-5 分钟', '小型变更可跳过'],
                ['总计（5 task）', '~80-120K tokens', '25-40 分钟', '—'],
              ].map((row, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    ...(i === 5 ? { fontWeight: 600, background: 'var(--color-bg-secondary)' } : {}),
                  }}
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

        <p className="text-sm leading-relaxed mt-3" style={{ color: 'var(--color-text-secondary)' }}>
          对比：手动协调 webhook 项目花了 ~3 小时（其中 45 分钟是纯协调开销）。
          自动化流程花了 ~35 分钟 + ~100K tokens（约 $0.40）。
          即使按 $50/小时的工程师成本算，45 分钟的协调开销 = $37.50。
          <strong style={{ color: 'var(--color-text-primary)' }}>ROI 接近 100 倍</strong>——但前提是任务确实需要自动化。
        </p>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 12.4: 适配你的团队
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          12.4 适配你的团队
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          superpowers 的默认流程不一定完全匹配你的团队规范。
          三种常见的定制方式：替换 review 阶段、添加执行门禁、打包为团队插件。
        </p>

        {/* ── 自定义 Review ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          用自定义 Skill 替换 /review
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          如果你的团队有自己的安全 checklist，可以创建一个自定义 review skill
          替换默认的 /review。其他阶段保持不变：
        </p>

        <ConfigExample
          language="markdown"
          title=".claude/skills/team-review.md"
          code={`# Team Review Skill

## Description
团队定制的代码审查流程，替换默认 /review。

## Instructions
对所有变更文件执行以下检查：

### 安全检查（必须全部通过）
- [ ] 无硬编码密钥或 token
- [ ] SQL 查询使用参数化
- [ ] 用户输入经过 sanitization
- [ ] HMAC/签名验证逻辑正确

### 性能检查
- [ ] N+1 查询已处理
- [ ] 出站 HTTP 有超时设置
- [ ] 大列表有分页

输出格式: PASS / WARN / FAIL 分类汇总。`}
        />

        {/* ── Hook 门禁 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          用 Hook 在 Plan 和 Execute 之间加门禁
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          高风险项目（支付、权限变更）可能需要在 Plan 确认后、Execute 开始前加一道人工审批：
        </p>

        <ConfigExample
          language="json"
          title="settings.json — 执行前人工审批门禁"
          code={`{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Task",
        "command": "echo '即将进入并行执行阶段，请确认 Plan 已 review' && read -p '输入 yes 继续: ' c && [ \\"$c\\" = \\"yes\\" ] || exit 1",
        "description": "Execute 阶段前要求人工确认"
      }
    ]
  }
}`}
        />

        {/* ── Plugin 打包 ── */}
        <ReferenceSection version="Plugin v1">
          <h4
            className="text-base font-semibold mb-3"
            style={{ color: 'var(--color-text-primary)' }}
          >
            打包为团队 Plugin
          </h4>
          <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--color-text-secondary)' }}>
            把自定义 Skill + Hook 组合打包为 Plugin，分享给整个团队：
          </p>
          <CodeBlock
            language="bash"
            title="Plugin 目录结构"
            code={`my-team-orchestration/
├── plugin.json          # 插件元数据
├── skills/
│   ├── team-review.md   # 自定义 review
│   └── team-spec.md     # 自定义 spec 模板
├── hooks/
│   └── pre-execute.sh   # 执行前门禁
└── README.md`}
            showLineNumbers={false}
          />
          <p className="text-sm leading-relaxed mt-3" style={{ color: 'var(--color-text-secondary)' }}>
            其他项目通过{' '}
            <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>
              {'"plugins": ["your-org/my-team-orchestration"]'}
            </code>{' '}
            引用即可。Plugin 系统仍在演进中，具体 API 以官方文档为准。
          </p>
        </ReferenceSection>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 12.5: 总结 + 练习
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          12.5 总结
        </h2>

        <QualityCallout title="五个摩擦点，五个教训">
          <ul className="list-none space-y-3">
            <li>
              <strong style={{ color: 'var(--color-text-primary)' }}>1. 需求没问清就动手</strong>{' '}
              — brainstorm 的第一个问题"要不要持久化"改变了整个架构。花 10 分钟问清需求，省 2 小时返工。
            </li>
            <li>
              <strong style={{ color: 'var(--color-text-primary)' }}>2. 计划不是圣经</strong>{' '}
              — Task 3 发现缺 last_error 列时，plan 自动修正而不是硬写补丁。活的计划比完美的计划有用。
            </li>
            <li>
              <strong style={{ color: 'var(--color-text-primary)' }}>3. 不知道就该停下来问</strong>{' '}
              — NEEDS_CONTEXT 不是失败，是系统在正确工作。比子代理猜测后写出错误代码好无数倍。
            </li>
            <li>
              <strong style={{ color: 'var(--color-text-primary)' }}>4. 零件合格不等于整机合格</strong>{' '}
              — delivery.ts 的字符串 vs types.ts 的枚举，每个文件单独看都正确。只有 global review 能抓住跨边界问题。
            </li>
            <li>
              <strong style={{ color: 'var(--color-text-primary)' }}>5. 自动化的 ROI有边界</strong>{' '}
              — 2 文件 bug fix 用全流程自动化是浪费。30 分钟以下的任务直接手动做。
            </li>
          </ul>
        </QualityCallout>

        <ExerciseCard
          tier="l3"
          title="用 superpowers 重走你最近的一个中等功能"
          description="选一个你最近手动完成的功能（需要 3-5 个文件变更、花了 1-2 小时的那种）。用 superpowers 的完整流程重做一次。"
          checkpoints={[
            'brainstorm 阶段是否问出了你原来没考虑到的问题？',
            '执行过程中是否出现了 NEEDS_CONTEXT？如果是，它帮你避免了什么错误？',
            'global review 是否发现了手动流程中遗漏的跨模块问题？',
            '记录五个摩擦点中你遇到了哪几个。你的团队最容易踩哪个坑？',
          ]}
        />
      </section>
    </div>
  )
}
