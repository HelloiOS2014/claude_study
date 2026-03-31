import { CodeBlock } from '../../components/content/CodeBlock'
import { QualityCallout } from '../../components/content/QualityCallout'
import { ExerciseCard } from '../../components/content/ExerciseCard'
import { ConfigExample } from '../../components/content/ConfigExample'
import { DecisionTree } from '../../components/content/DecisionTree'
import type { TreeNode } from '../../components/content/DecisionTree'
import { ReferenceSection } from '../../components/content/ReferenceSection'
import { PromptCompare } from '../../components/content/PromptCompare'

/* ═══════════════════════════════════════════════
   Decision Tree: 编排复杂度
   ═══════════════════════════════════════════════ */

const orchestrationTree: TreeNode = {
  id: 'root',
  question: '这个任务有多复杂？',
  description: '按预估时间和影响范围判断编排深度。过度编排和编排不足都是浪费。',
  children: [
    {
      label: '简单修复 (< 30 分钟)',
      node: {
        id: 'simple',
        question: '涉及几个文件？',
        children: [
          {
            label: '1-2 个文件',
            node: {
              id: 'simple-single',
              question: '直接执行',
              result: {
                text: '跳过 Spec 和 Plan，直接在单会话中完成。写好提示词 + 验证即可。不要为了流程而流程——30 分钟内的单文件改动，编排的时间可能比实际编写还长。',
                tier: 'l1',
              },
            },
          },
          {
            label: '3+ 个文件',
            node: {
              id: 'simple-multi',
              question: '简化 Plan → 执行',
              result: {
                text: '跳过 Spec，但需要一个简单的 Plan 列出修改顺序和依赖关系。多文件修改容易遗漏关联变更，Plan 帮你理清依赖。',
                tier: 'l1',
              },
            },
          },
        ],
      },
    },
    {
      label: '中等功能 (30 分钟 - 2 小时)',
      node: {
        id: 'medium',
        question: '需求是否清晰？',
        children: [
          {
            label: '需求明确，有参考实现',
            node: {
              id: 'medium-clear',
              question: 'Plan → Execute → Review',
              result: {
                text: '用 /write-plan 生成实施计划，subagent 并行执行，最后 /review 全局检查。跳过 Spec 阶段——需求已经够清晰了。',
                tier: 'l2',
              },
            },
          },
          {
            label: '需求模糊或有多种方案',
            node: {
              id: 'medium-unclear',
              question: 'Spec → Plan → Execute → Review',
              result: {
                text: '先用 /brainstorm 澄清需求和方案选择，再走标准流程。这个阶段的 Spec 投入会在后续节省大量返工时间。',
                tier: 'l2',
              },
            },
          },
        ],
      },
    },
    {
      label: '复杂项目 (> 2 小时)',
      node: {
        id: 'complex',
        question: '完整五阶段编排',
        result: {
          text: '完整走 Spec → Plan → Execute → Review → Merge 五阶段流水线。复杂项目跳过任何阶段都是在赌运气——Spec 确保方向正确，Plan 确保步骤可行，并行 Execute 提速，双层 Review 兜底质量，最后有序 Merge。',
          tier: 'l3',
        },
      },
    },
  ],
}

/* ═══════════════════════════════════════════════
   Decision Tree: 编排 vs 直接执行
   ═══════════════════════════════════════════════ */

const overkillTree: TreeNode = {
  id: 'root',
  question: '你是否需要完整编排流程？',
  description: '编排本身有成本。如果编排的时间超过了它节省的时间，那就是过度工程。',
  children: [
    {
      label: '是：任务有并行子任务',
      node: {
        id: 'parallel',
        question: '子任务之间是否有依赖？',
        children: [
          {
            label: '无依赖，可以并行',
            node: {
              id: 'parallel-yes',
              question: '使用 subagent 并行执行',
              result: {
                text: '这是编排的最佳场景。每个子任务分配独立 subagent，互不干扰，完成后统一 review。并行执行可以将 N 个任务的总时间从 T1+T2+...+Tn 压缩到 max(T1,T2,...,Tn)。',
                tier: 'l3',
              },
            },
          },
          {
            label: '有依赖，必须串行',
            node: {
              id: 'parallel-no',
              question: '串行执行 + 阶段 review',
              result: {
                text: '有依赖的任务不适合并行。改为串行执行，每完成一步 review 一次再进入下一步。Plan 阶段明确标出依赖关系和执行顺序。',
                tier: 'l2',
              },
            },
          },
        ],
      },
    },
    {
      label: '否：单线程任务',
      node: {
        id: 'single',
        question: '任务是否涉及架构决策？',
        children: [
          {
            label: '是，有架构影响',
            node: {
              id: 'single-arch',
              question: '至少需要 Spec + Review',
              result: {
                text: '即使是单线程任务，如果涉及架构决策（新增模块、改变数据流、引入新依赖），也需要 /brainstorm 先探索方案。架构错误的返工成本远大于编排成本。',
                tier: 'l2',
              },
            },
          },
          {
            label: '否，纯实现工作',
            node: {
              id: 'single-impl',
              question: '直接编写，不需要编排',
              result: {
                text: '纯实现工作（按照已有模式添加类似功能、修复明确的 bug、写测试）不需要编排。直接用 Claude Code 单会话完成，最多加一个 /review。',
                tier: 'l1',
              },
            },
          },
        ],
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
          让 Claude 编排 Claude
        </h1>
        <p
          className="text-lg leading-relaxed max-w-3xl"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          前十一章教你如何在每一步操控 Claude Code——写提示词、定规范、做方案、加 Hook、跑测试。
          但当你面对一个完整的开发流程时，仍然需要<strong style={{ color: 'var(--color-text-primary)' }}>手动编排每一步</strong>。
          这一章的目标：让 Claude 来编排这些步骤，你只管验收。
        </p>
      </header>

      {/* ═══════════════════════════════════════════════
          Failure Opening
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <div
          className="p-5 rounded-lg"
          style={{
            background: 'rgba(248, 113, 113, 0.06)',
            border: '1px solid rgba(248, 113, 113, 0.25)',
          }}
        >
          <h3
            className="text-lg font-semibold mb-3"
            style={{ color: 'var(--color-text-primary)' }}
          >
            你学了 11 章，但编排仍然是手动的
          </h3>
          <div className="text-sm leading-relaxed space-y-3" style={{ color: 'var(--color-text-secondary)' }}>
            <p>
              你学了 11 章，会用每个 Harness 组件。但一个中等功能的开发流程你仍然手动编排：
              自己写 spec、自己开 Plan Mode、一个个派子代理、自己 review 每个产出、自己合并。
              光"编排"就要 30 分钟。
            </p>
            <p>
              如果 Claude 能把这些步骤也串起来呢？
            </p>
            <p>
              从"你指挥 Claude 做每一步"到"Claude 编排整个流程，你只在关键节点审批"——
              这不是效率优化，而是<strong style={{ color: 'var(--color-text-primary)' }}>工作模式的跃迁</strong>。
            </p>
          </div>
        </div>

        <QualityCallout title="本章的定位">
          <p>
            这一章不是必读章节。如果你还没有稳定使用 Plan Mode (Ch05)、Hooks (Ch07)、
            多代理 (Ch08) 的经验，建议先回去打基础。编排是这些能力的<strong style={{ color: 'var(--color-text-primary)' }}>组合拳</strong>——
            每个单招不熟，组合拳就是乱挥。
          </p>
        </QualityCallout>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 12.1: 编排模式
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          12.1 编排模式：五阶段流水线
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          不管用什么工具，成熟的 AI 辅助开发编排都遵循同一个模式——
          <strong style={{ color: 'var(--color-text-primary)' }}>五阶段流水线</strong>：
          Spec、Plan、Execute、Review、Merge。
          每个阶段有明确的输入输出，可以独立验证，也可以按需跳过。
        </p>

        <CodeBlock
          language="markdown"
          title="五阶段编排流水线"
          code={`# 五阶段编排流水线 (Orchestration Pipeline)

┌──────────┐    ┌──────────┐    ┌──────────────┐    ┌──────────┐    ┌──────────┐
│  1.Spec  │───▶│  2.Plan  │───▶│  3.Execute   │───▶│ 4.Review │───▶│ 5.Merge  │
│  设计文档  │    │  实施计划  │    │  并行开发     │    │  质量审查  │    │  集成交付  │
└──────────┘    └──────────┘    └──────────────┘    └──────────┘    └──────────┘
     │               │                │                   │               │
     ▼               ▼                ▼                   ▼               ▼
  docs/spec.md   plan.md        每个子任务独立        per-task review   PR / merge
  需求 + 方案     TDD 步骤        subagent 执行       + global review   + cleanup
  技术选型        文件路径        状态: DONE/BLOCKED   交叉问题检查       分支策略

# ═══ 可选跳过条件 ═══
#
# 任务 < 30 分钟 → 跳过 Spec（需求已经足够清晰）
# 单文件修改     → 跳过 Plan + 并行（没有可并行的子任务）
# 独立开发       → 跳过 Merge（直接 push）
# 已有设计文档   → 跳过 Spec（直接进 Plan）`}
          showLineNumbers={false}
        />

        {/* ── 阶段与 Ch10 三原则映射 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          每个阶段对应 Ch10 的三原则
        </h3>

        <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          这不是凭空发明的流程——五阶段流水线是 Ch10 三个核心原则的自然延伸：
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                {['阶段', '对应原则', '具体体现'].map((h) => (
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
                ['Spec', 'Spec 驱动', '把模糊需求转化为可验证的设计文档，后续所有步骤都以此为锚点'],
                ['Plan', 'Spec 驱动', '设计文档进一步分解为 TDD 步骤和精确的文件路径，消除执行阶段的歧义'],
                ['Execute', '上下文隔离', '每个子任务由独立 subagent 执行，互不干扰，避免上下文污染'],
                ['Review', '验证循环', '两阶段 review：per-task review（局部验证）+ global review（全局验证）'],
                ['Merge', '验证循环', '最终集成验证——确保各子任务的产出组合在一起仍然正确'],
              ].map((row, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  <td className="px-3 py-2.5">
                    <strong style={{ color: 'var(--color-text-primary)' }}>{row[0]}</strong>
                  </td>
                  <td className="px-3 py-2.5">
                    <code
                      className="font-mono text-xs px-1.5 py-0.5 rounded"
                      style={{ background: 'var(--color-bg-tertiary)' }}
                    >
                      {row[1]}
                    </code>
                  </td>
                  <td className="px-3 py-2.5">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <QualityCallout title="模式 vs 工具">
          <p>
            这个五阶段模式<strong style={{ color: 'var(--color-text-primary)' }}>不依赖特定插件</strong>。
            你可以用 Skills + Hooks + Agents 自己搭，也可以用 superpowers 这样的现成插件。
            重要的是理解模式本身——工具会变，模式不会。下一节介绍的 superpowers 是目前最成熟的实现，
            但如果你有自己的编排偏好，完全可以用同样的模式自建。
          </p>
        </QualityCallout>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 12.2: Superpowers 实战
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          12.2 Superpowers 实战：推荐方案
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <a
            href="https://github.com/claude-plugins-official/superpowers"
            style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}
          >
            Superpowers
          </a>{' '}
          是目前社区中最成熟的 Claude Code 编排插件。它把五阶段流水线封装成了一系列 Skill，
          每个 Skill 对应流水线中的一个阶段。接下来我们逐个拆解。
        </p>

        {/* ── 安装 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          安装
        </h3>

        <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          在项目根目录的 <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>.claude/settings.json</code> 中添加插件引用：
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

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          安装后，Claude Code 会自动加载 superpowers 提供的所有 Skill。
          你不需要逐个启用——插件内部会根据上下文自动激活对应的 Skill。
        </p>

        {/* ════════════════════════════════════════════
            /brainstorm
            ════════════════════════════════════════════ */}
        <h3
          className="text-xl font-bold mt-12 pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          /brainstorm — 从模糊想法到设计文档
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>/brainstorm</code>{' '}
          是流水线的第一个阶段。它的核心价值不是"生成方案"，而是<strong style={{ color: 'var(--color-text-primary)' }}>通过提问帮你澄清需求</strong>。
          大多数开发者的需求描述在 brainstorm 的 3-4 轮追问后会发生实质性变化。
        </p>

        <h4
          className="text-base font-semibold mt-6"
          style={{ color: 'var(--color-text-primary)' }}
        >
          关键行为
        </h4>

        <ul className="space-y-2 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <span><strong style={{ color: 'var(--color-text-primary)' }}>一次只问一个问题</strong> — 不会一口气抛出 10 个问题让你头晕，而是逐步深入</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <span><strong style={{ color: 'var(--color-text-primary)' }}>提出 2-3 个方案对比</strong> — 不是直接给"最佳方案"，而是展示 trade-off 让你选择</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <span><strong style={{ color: 'var(--color-text-primary)' }}>输出写到 docs/ 目录</strong> — 设计文档是持久化的产出物，不是聊天记录里的一段话</span>
          </li>
        </ul>

        <CodeBlock
          language="markdown"
          title="brainstorm 典型对话示例（4 轮）"
          code={`# ── 第 1 轮: 用户提出模糊需求 ──────────────────────
> /brainstorm 我想给我们的 API 加一个缓存层

brainstorm: 我来帮你探索这个需求。先问一个问题：
你说的"缓存层"是指哪种场景？
  a) 数据库查询结果缓存（减少 DB 压力）
  b) API 响应缓存（减少重复计算）
  c) 外部 API 调用缓存（减少第三方调用成本）
  d) 以上都有

# ── 第 2 轮: 用户澄清 ──────────────────────────────
> 主要是 a 和 b，我们的数据库查询比较重，而且有些 API 端点的响应可以缓存

brainstorm: 了解。下一个问题：你的数据更新频率如何？
  - 高频更新（秒级）→ 缓存失效策略很关键
  - 中频更新（分钟级）→ TTL 即可
  - 低频更新（小时/天级）→ 缓存几乎可以是"永久"的
这会直接影响缓存策略的选择。

# ── 第 3 轮: 方案对比 ──────────────────────────────
> 大部分是中频更新，但有几个表是高频的（订单表、库存表）

brainstorm: 好的，基于你的需求，我看到三种可行方案：

方案 A: Redis 全局缓存
  优势: 成熟方案，支持 TTL + pub/sub 失效
  劣势: 需要额外运维 Redis，增加架构复杂度
  适合: 团队已有 Redis 经验

方案 B: 内存缓存 (node-cache / lru-cache)
  优势: 零运维，部署简单
  劣势: 不跨进程，重启即失效
  适合: 单实例部署

方案 C: 混合方案
  高频表 → Redis + pub/sub 实时失效
  中频表 → 内存缓存 + TTL
  优势: 精细化控制
  劣势: 两套缓存逻辑，维护成本高

你倾向哪个方向？或者还有其他约束我没考虑到？

# ── 第 4 轮: 确认方案，输出设计文档 ─────────────────
> 我们是 K8s 多实例部署，所以方案 B 不行。方案 C 看起来不错，
> 但维护成本确实是问题。我倾向方案 A，用 Redis 统一管理

brainstorm: 明白了。我来整理设计文档...

✅ 设计文档已写入 docs/cache-layer-spec.md
包含：需求摘要、技术选型（Redis）、缓存策略矩阵、
失效机制、预估性能改善、风险点和缓解措施。
你可以 review 这个文档，确认后用 /write-plan 生成实施计划。`}
          showLineNumbers={false}
        />

        <h4
          className="text-base font-semibold mt-6"
          style={{ color: 'var(--color-text-primary)' }}
        >
          最佳实践
        </h4>

        <PromptCompare
          bad={{
            prompt: `/brainstorm 我要加缓存，用 Redis，
给我设计文档`,
            label: '跳过探索',
            explanation: '直接告诉 brainstorm 用什么方案，等于跳过了最有价值的需求澄清阶段。brainstorm 的提问会帮你发现自己没想到的约束条件。',
          }}
          good={{
            prompt: `/brainstorm 我想给 API 加一个缓存层，
目前 DB 查询是性能瓶颈`,
            label: '留出探索空间',
            explanation: '描述问题而非方案。让 brainstorm 通过提问帮你发现真正的需求——也许问题不在缓存，而在查询优化。',
          }}
        />

        <p className="text-sm leading-relaxed mt-4" style={{ color: 'var(--color-text-secondary)' }}>
          <strong style={{ color: 'var(--color-text-primary)' }}>何时跳过 brainstorm：</strong>
          需求已经非常清晰（有产品文档、有参考实现、或者是重复做过的工作）。
          强行走 brainstorm 只会浪费 5-10 分钟和 ~5K tokens。
        </p>

        {/* ════════════════════════════════════════════
            /write-plan
            ════════════════════════════════════════════ */}
        <h3
          className="text-xl font-bold mt-12 pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          /write-plan — 从设计文档到实施计划
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>/write-plan</code>{' '}
          接收 brainstorm 产出的设计文档（或你自己写的 spec），生成可执行的实施计划。
          这里的"可执行"意味着：每一步都可以交给一个不了解全局上下文的 subagent 独立完成。
        </p>

        <h4
          className="text-base font-semibold mt-6"
          style={{ color: 'var(--color-text-primary)' }}
        >
          关键特性
        </h4>

        <ul className="space-y-2 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <span><strong style={{ color: 'var(--color-text-primary)' }}>TDD 步骤</strong> — 每个任务先写测试、再写实现、最后验证</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <span><strong style={{ color: 'var(--color-text-primary)' }}>精确文件路径</strong> — 不是"在合适的地方创建文件"，而是 <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>src/cache/redis-client.ts</code></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <span><strong style={{ color: 'var(--color-text-primary)' }}>没有占位符</strong> — 每一步的输入输出、验证标准都是具体的</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <span><strong style={{ color: 'var(--color-text-primary)' }}>粒度合理</strong> — 每步 2-5 分钟，太大拆分、太小合并</span>
          </li>
        </ul>

        <CodeBlock
          language="markdown"
          title="write-plan 产出示例（缓存层实施计划）"
          code={`# Implementation Plan: Redis Cache Layer

## Task 1: Redis 客户端封装
- Files: src/cache/redis-client.ts, src/cache/__tests__/redis-client.test.ts
- Steps:
  1. 写测试: 连接、断连、get/set/del 的 mock 测试
  2. 实现 RedisCache class，封装 ioredis
  3. 运行测试，确保全部通过
- Dependencies: 无
- Estimated: 5 min

## Task 2: 缓存中间件
- Files: src/middleware/cache.ts, src/middleware/__tests__/cache.test.ts
- Steps:
  1. 写测试: 缓存命中/未命中/过期的场景
  2. 实现 cacheMiddleware(ttl, keyFn)
  3. 集成 redis-client，运行测试
- Dependencies: Task 1
- Estimated: 5 min

## Task 3: 缓存失效服务
- Files: src/cache/invalidation.ts, src/cache/__tests__/invalidation.test.ts
- Steps:
  1. 写测试: 单 key 失效、pattern 失效、全局失效
  2. 实现 CacheInvalidator，支持 TTL + 主动失效
  3. 运行测试
- Dependencies: Task 1
- Estimated: 5 min

## Task 4: 路由集成
- Files: src/routes/products.ts, src/routes/orders.ts
- Steps:
  1. 在 products 路由添加 cacheMiddleware(300)
  2. 在 orders 路由添加 cacheMiddleware(60)
  3. 在 order 写操作后触发 invalidation
  4. 运行 e2e 测试验证
- Dependencies: Task 2, Task 3
- Estimated: 5 min

## Parallel Groups
- Group A (可并行): Task 1
- Group B (依赖 Task 1): Task 2, Task 3 (可并行)
- Group C (依赖 B): Task 4`}
          showLineNumbers={false}
        />

        <QualityCallout title="Review Plan 再执行">
          <p>
            <strong style={{ color: 'var(--color-text-primary)' }}>永远在执行前 review plan。</strong>
            Plan 阶段的修改成本几乎为零——改一行文字即可。
            Execute 阶段的修改成本是"重新跑一遍 subagent"。
            花 2 分钟读 plan 可以省掉 20 分钟的返工。
            重点检查：文件路径是否合理、依赖关系是否正确、是否有遗漏的步骤。
          </p>
        </QualityCallout>

        {/* ════════════════════════════════════════════
            subagent-driven-development
            ════════════════════════════════════════════ */}
        <h3
          className="text-xl font-bold mt-12 pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          subagent-driven-development — 并行执行引擎
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          这是 superpowers 的核心引擎。它把 plan 中的每个 Task 分派给一个
          <strong style={{ color: 'var(--color-text-primary)' }}>全新的 subagent</strong>（独立上下文），
          执行后进行<strong style={{ color: 'var(--color-text-primary)' }}>两阶段 review</strong>，
          然后根据状态决定下一步操作。
        </p>

        <h4
          className="text-base font-semibold mt-6"
          style={{ color: 'var(--color-text-primary)' }}
        >
          执行流程
        </h4>

        <CodeBlock
          language="markdown"
          title="subagent 执行 - 审查循环"
          code={`# Subagent-Driven Development 执行流程

对于 Plan 中的每个 Task:

┌─────────────────────────────────────────────────────────────┐
│  1. 分派 (Dispatch)                                         │
│     - 创建全新 subagent（空上下文）                           │
│     - 注入: task 描述 + 相关文件路径 + 验收标准                │
│     - 不注入: 其他 task 的上下文（上下文隔离原则）              │
│                                                              │
│  2. 执行 (Execute)                                           │
│     - subagent 按 TDD 流程: 写测试 → 实现 → 验证              │
│     - 执行过程中可以读取项目代码（但不知道其他 task 在做什么）   │
│                                                              │
│  3. 第一阶段 Review: Spec 合规检查                            │
│     - 产出是否符合 plan 中的验收标准？                         │
│     - 文件路径是否与 plan 一致？                               │
│     - 测试是否覆盖了指定场景？                                 │
│                                                              │
│  4. 第二阶段 Review: 代码质量检查                             │
│     - 代码风格是否符合项目规范？                               │
│     - 有无性能问题、安全隐患、边界条件遗漏？                   │
│     - 变量命名、错误处理、日志记录是否合理？                   │
│                                                              │
│  5. 状态判定                                                  │
│     ├── DONE            → 进入下一个 task                    │
│     ├── DONE_WITH_CONCERNS → 记录 concerns，继续             │
│     ├── NEEDS_CONTEXT   → 请求额外信息后重试                 │
│     └── BLOCKED         → 暂停，等待人工介入                 │
└─────────────────────────────────────────────────────────────┘`}
          showLineNumbers={false}
        />

        <h4
          className="text-base font-semibold mt-6"
          style={{ color: 'var(--color-text-primary)' }}
        >
          四种状态详解
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                {['状态', '含义', '后续动作', '典型场景'].map((h) => (
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
                ['DONE', '完全通过两阶段 review', '自动进入下一个 task', '标准流程，大部分 task 应该是这个状态'],
                ['DONE_WITH_CONCERNS', '功能正确但有可改进项', '记录 concerns，继续执行', '命名不理想、缺少边界测试、可以进一步优化'],
                ['NEEDS_CONTEXT', '缺少必要信息无法完成', '请求信息后重新分派 subagent', '需要知道某个 API 的认证方式、数据库 schema 不清楚'],
                ['BLOCKED', '遇到无法自行解决的问题', '暂停执行，等待人工介入', '依赖的服务不可用、plan 有逻辑错误、需要权限'],
              ].map((row, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-2.5">
                      {j === 0 ? (
                        <code
                          className="font-mono text-xs px-1.5 py-0.5 rounded"
                          style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-accent)' }}
                        >
                          {cell}
                        </code>
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

        <h4
          className="text-base font-semibold mt-6"
          style={{ color: 'var(--color-text-primary)' }}
        >
          模型选择策略
        </h4>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          并非每个 subagent 都需要最强的模型。根据任务性质选择合适的模型可以在保证质量的同时降低成本：
        </p>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                {['任务类型', '推荐模型', '理由'].map((h) => (
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
                ['机械性任务（CRUD、样板代码、测试用例）', '快速/廉价模型（Haiku 等）', '任务明确，不需要判断力，用快模型省时间和成本'],
                ['判断性任务（架构设计、复杂逻辑、错误处理）', '强能力模型（Sonnet/Opus）', '需要理解上下文、做 trade-off 判断'],
                ['Review 阶段', '强能力模型（Sonnet/Opus）', 'Review 是质量的最后防线，不应省模型'],
              ].map((row, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-2.5">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <QualityCallout title="两阶段 Review 是质量保障的核心">
          <p className="mb-2">
            为什么需要两阶段 review 而不是一次性 review？
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong style={{ color: 'var(--color-text-primary)' }}>Spec 合规检查</strong>关注"做对了没有"——产出是否满足需求</li>
            <li><strong style={{ color: 'var(--color-text-primary)' }}>代码质量检查</strong>关注"做好了没有"——代码是否可维护</li>
            <li>一次性 review 容易在两个维度之间来回跳，导致两边都不彻底</li>
            <li>分开做确保每个维度都被认真检查——这和 Ch08 的 Writer/Reviewer 分离是同一个原则</li>
          </ul>
        </QualityCallout>

        <CodeBlock
          language="bash"
          title="subagent 执行过程的终端输出（模拟）"
          code={`# ── subagent 分派和执行 ──────────────────────────

[orchestrator] Dispatching Task 1: Redis 客户端封装
  → subagent-1 started (context: clean)
  → injected: task spec + file paths

[subagent-1] Writing tests: src/cache/__tests__/redis-client.test.ts
[subagent-1] Implementing: src/cache/redis-client.ts
[subagent-1] Running: npm test -- --testPathPattern=redis-client
[subagent-1] ✓ 6 tests passed

[orchestrator] Review Stage 1: Spec compliance
  ✓ RedisCache class implements get/set/del
  ✓ Tests cover connect/disconnect/error scenarios
  ✓ File paths match plan

[orchestrator] Review Stage 2: Code quality
  ✓ Error handling: connection retry with exponential backoff
  ✓ TypeScript types: generic get<T>() return type
  ⚠ Concern: missing JSDoc on public methods
  → Status: DONE_WITH_CONCERNS

[orchestrator] Dispatching Task 2: 缓存中间件 (depends on Task 1)
  → subagent-2 started (context: clean)
  → injected: task spec + Task 1 file paths (read-only reference)

[orchestrator] Dispatching Task 3: 缓存失效服务 (depends on Task 1)
  → subagent-3 started (context: clean)
  → Tasks 2 and 3 running in parallel...

# ... 并行执行 Task 2 和 Task 3 ...

[orchestrator] All tasks complete.
  ✓ Task 1: DONE_WITH_CONCERNS (minor: JSDoc)
  ✓ Task 2: DONE
  ✓ Task 3: DONE
  ✓ Task 4: DONE
  → Ready for global /review`}
          showLineNumbers={false}
        />

        {/* ════════════════════════════════════════════
            /review
            ════════════════════════════════════════════ */}
        <h3
          className="text-xl font-bold mt-12 pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          /review — 全局代码审查
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          每个 subagent 的 per-task review 只能看到自己负责的文件。
          <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>/review</code>{' '}
          是在所有 task 完成后进行的<strong style={{ color: 'var(--color-text-primary)' }}>全局审查</strong>——
          它能看到所有变更的全景，发现跨 task 的问题。
        </p>

        <h4
          className="text-base font-semibold mt-6"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Per-task Review vs. Global Review
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                {['维度', 'Per-task Review', 'Global /review'].map((h) => (
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
                ['视野范围', '单个 task 的文件', '所有变更文件'],
                ['关注点', '功能正确性 + 代码质量', '跨模块一致性 + 集成问题'],
                ['能发现的问题', '局部 bug、命名不一致', '接口不匹配、重复逻辑、循环依赖'],
                ['触发时机', '每个 task 完成后自动触发', '所有 task 完成后手动触发'],
                ['成本', '~2-3K tokens/task', '~10K tokens（全局）'],
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

        <p className="text-sm leading-relaxed mt-4" style={{ color: 'var(--color-text-secondary)' }}>
          <strong style={{ color: 'var(--color-text-primary)' }}>何时触发 /review：</strong>
          在所有 task DONE 之后、创建 PR 或 merge 之前。
          这是你在正式交付代码前的最后一道自动化防线。
          如果 /review 发现了问题，修复后再跑一次 /review 确认——不要跳过二次验证。
        </p>

        {/* ════════════════════════════════════════════
            finishing-a-development-branch
            ════════════════════════════════════════════ */}
        <h3
          className="text-xl font-bold mt-12 pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          finishing-a-development-branch — 收尾交付
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          /review 通过后，最后一步是把代码集成到主分支。
          superpowers 提供了三种收尾选项，根据你的工作模式选择：
        </p>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                {['选项', '操作', '适用场景'].map((h) => (
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
                ['直接合并', 'merge 到主分支 + 删除开发分支', '个人项目或独立开发的功能分支'],
                ['创建 PR', '推送分支 + 创建 Pull Request', '团队协作，需要人工 review 或 CI 通过'],
                ['清理暂存', '保留分支但整理 commit history', '功能未完成，需要暂停或交接给他人'],
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

        <p className="text-sm leading-relaxed mt-4" style={{ color: 'var(--color-text-secondary)' }}>
          <strong style={{ color: 'var(--color-text-primary)' }}>推荐：</strong>
          对团队项目始终选择"创建 PR"。即使你对代码有信心，PR 提供了可审计的记录，
          让其他团队成员了解变更内容。独立项目可以直接合并以节省时间。
        </p>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 12.3: 适配到你的团队
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          12.3 适配到你的团队
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          superpowers 的默认流程适合大多数场景，但每个团队都有自己的特殊需求。
          这一节教你如何在不 fork 插件的情况下，通过<strong style={{ color: 'var(--color-text-primary)' }}>替换、扩展和门禁</strong>来定制编排流程。
        </p>

        {/* ── 决策树：编排深度 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          编排深度决策
        </h3>

        <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          不是每个任务都需要走完五阶段。用这个决策树判断你的任务需要多深的编排：
        </p>

        <DecisionTree
          root={orchestrationTree}
          title="编排深度决策树"
        />

        {/* ── 替换阶段 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          用自定义 Skill 替换任意阶段
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          如果你的团队有自己的 review checklist 或 spec 模板，可以用自定义 Skill 替换 superpowers 的对应阶段。
          例如：用团队的安全 review checklist 替换默认的 /review。
        </p>

        <ConfigExample
          language="markdown"
          title=".claude/skills/team-review.md — 自定义 review skill"
          code={`# Team Review Skill

## Description
团队定制的代码审查流程，包含安全 checklist。

## Instructions
对所有变更文件执行以下检查：

### 功能检查
- [ ] 所有 API 端点都有输入验证
- [ ] 错误响应使用 ResponseWrapper<T> 格式
- [ ] 新增数据库查询都有对应索引

### 安全检查
- [ ] 无硬编码密钥或 token
- [ ] SQL 查询使用参数化（无字符串拼接）
- [ ] 用户输入经过 sanitization
- [ ] 认证/授权检查完整

### 性能检查
- [ ] N+1 查询已处理
- [ ] 大列表有分页
- [ ] 缓存策略合理

输出格式: 按 PASS / WARN / FAIL 分类汇总。`}
        />

        <p className="text-sm leading-relaxed mt-3" style={{ color: 'var(--color-text-secondary)' }}>
          使用时，在 /review 阶段改为调用你的自定义 skill：
          <code className="font-mono text-xs px-1.5 py-0.5 rounded ml-1" style={{ background: 'var(--color-bg-tertiary)' }}>
            /team-review
          </code>
          。Superpowers 的其他阶段保持不变——这就是模块化编排的优势。
        </p>

        {/* ── Hook 门禁 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          用 Hook 在阶段之间加门禁
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          有些团队需要在关键阶段之间加人工审批。例如：Plan 确认后才允许进入 Execute 阶段。
          你可以用 Ch07 学过的 Hook 机制实现这个门禁。
        </p>

        <ConfigExample
          language="json"
          title="settings.json — 执行前人工审批门禁"
          code={`{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Task",
        "command": "if grep -q 'subagent-driven-development' /tmp/claude-current-skill 2>/dev/null; then echo '⚠️ 即将进入并行执行阶段，请确认 Plan 已通过 review' && read -p '输入 yes 继续: ' confirm && [ \\"$confirm\\" = \\"yes\\" ] || exit 1; fi",
        "description": "Execute 阶段前要求人工确认"
      }
    ]
  }
}`}
          annotations={[
            { line: 5, text: '检测当前是否在 subagent-driven-development skill 中' },
            { line: 5, text: '如果是，弹出确认提示，只有输入 yes 才继续执行' },
          ]}
        />

        <p className="text-sm leading-relaxed mt-3" style={{ color: 'var(--color-text-secondary)' }}>
          这个模式可以推广到任何阶段转换：Spec→Plan、Plan→Execute、Execute→Review 都可以加门禁。
          门禁的成本是打断自动化流程——只在高风险场景使用（例如涉及生产环境、支付逻辑、权限变更的项目）。
        </p>

        {/* ── Plugin 打包基础 ── */}
        <ReferenceSection version="Plugin v1">
          <h4
            className="text-base font-semibold mb-3"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Plugin 打包基础
          </h4>
          <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--color-text-secondary)' }}>
            如果你想把自定义编排分享给其他团队，可以将其打包为 Plugin。
            Plugin 的目录结构：
          </p>
          <CodeBlock
            language="bash"
            title="Plugin 目录结构"
            code={`my-team-orchestration/
├── plugin.json          # 插件元数据（名称、版本、依赖）
├── skills/
│   ├── team-review.md   # 自定义 review skill
│   ├── team-spec.md     # 自定义 spec 模板
│   └── deploy-check.md  # 部署前检查 skill
├── hooks/
│   └── pre-execute.sh   # 执行前门禁脚本
└── README.md            # 使用说明`}
            showLineNumbers={false}
          />
          <p className="text-sm leading-relaxed mt-3" style={{ color: 'var(--color-text-secondary)' }}>
            将这个目录发布到 Git 仓库后，其他项目可以通过{' '}
            <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>
              {'"plugins": ["your-org/my-team-orchestration"]'}
            </code>{' '}
            引用。Plugin 系统仍在快速演进中，具体 API 请参考官方文档。
          </p>
        </ReferenceSection>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 12.4: 验证 + 边界
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          12.4 验证 + 边界
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          编排不是越多越好。过度编排和不编排一样是问题——
          前者浪费时间和 token，后者浪费在返工上。
          这一节帮你判断边界。
        </p>

        {/* ── 是否需要编排 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          什么时候编排是多余的
        </h3>

        <DecisionTree
          root={overkillTree}
          title="编排 vs 直接执行"
        />

        {/* ── 成本估算 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          各阶段成本估算
        </h3>

        <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          以下是各阶段的典型 token 消耗和时间估算。实际值因任务复杂度而异，
          这里给出的是中等复杂度功能的参考值。
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                {['阶段', 'Token 消耗', '时间', '成本（按 Claude Sonnet）', '可跳过条件'].map((h) => (
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
                ['brainstorm', '~5K tokens', '5-10 分钟', '~$0.02', '需求已明确'],
                ['write-plan', '~8K tokens', '2-5 分钟', '~$0.03', '已有实施计划'],
                ['execute (per task)', '~10-30K tokens', '3-10 分钟/任务', '~$0.05-0.15/任务', '无（核心阶段）'],
                ['per-task review', '~2-3K tokens/任务', '1-2 分钟/任务', '~$0.01/任务', '无（质量保障）'],
                ['global review', '~10K tokens', '3-5 分钟', '~$0.04', '小型变更'],
                ['总计（4 task 功能）', '~80-120K tokens', '20-40 分钟', '~$0.30-0.60', '—'],
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
          对比手动编排的隐性成本：开发者花 30 分钟手动管理流程（按 $80/小时工程师成本 = $40），
          自动编排花 $0.30-0.60 的 API 成本。即使考虑到自动编排偶尔需要返工，
          <strong style={{ color: 'var(--color-text-primary)' }}>ROI 依然是压倒性的</strong>。
          真正的瓶颈不在 token 成本，而在你是否能信任自动化的质量——这就是为什么两阶段 review 如此关键。
        </p>

        {/* ── 练习 ── */}
        <ExerciseCard
          tier="l3"
          title="用 superpowers 重做一个近期功能"
          description="选一个你最近手动完成的中等复杂度功能（需要 2-5 个文件变更、花了 1-2 小时的那种）。用 superpowers 的完整五阶段流水线重做一次。记录每个阶段的时间和产出质量，和手动流程做对比。"
          checkpoints={[
            'brainstorm 阶段是否发现了你之前没考虑到的需求细节？',
            'write-plan 的产出是否比你自己写的 plan 更完整（文件路径、测试用例）？',
            'subagent 执行的并行效率提升了多少？',
            'global review 是否发现了你手动流程中遗漏的跨模块问题？',
            '总时间对比：自动编排 vs 手动编排，差多少？',
          ]}
        />

        <ExerciseCard
          tier="l2"
          title="定制你的 review checklist"
          description="基于你的团队规范，创建一个自定义的 /team-review skill。至少包含 3 类检查（功能、安全、性能），每类至少 3 个检查项。在一个真实的 PR 上试用，看看它能发现哪些你之前忽略的问题。"
          checkpoints={[
            'checklist 中的每个检查项是否都对应过一个真实的线上问题？',
            '自定义 review 的发现率是否高于默认 /review？',
            '是否有检查项太泛（"代码质量好"）或太细（"变量名长度 > 3"）？',
          ]}
        />
      </section>

      {/* ═══════════════════════════════════════════════
          Chapter Summary
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          本章小结
        </h2>

        <div
          className="p-5 rounded-lg"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            <p>
              <strong style={{ color: 'var(--color-text-primary)' }}>五阶段流水线</strong>（Spec → Plan → Execute → Review → Merge）
              是 AI 辅助开发的通用编排模式。每个阶段有明确的输入输出，可以独立验证、按需跳过、按需替换。
            </p>
            <p>
              <strong style={{ color: 'var(--color-text-primary)' }}>Superpowers</strong> 把这个模式封装成了开箱即用的 Skill 集合：
              /brainstorm 澄清需求、/write-plan 生成计划、subagent-driven-development 并行执行、
              /review 全局审查、finishing-a-development-branch 收尾交付。
            </p>
            <p>
              <strong style={{ color: 'var(--color-text-primary)' }}>定制而非 fork</strong>：
              通过自定义 Skill 替换任意阶段、通过 Hook 在阶段间加门禁、通过决策树判断编排深度。
              模式不变，工具灵活切换。
            </p>
            <p>
              <strong style={{ color: 'var(--color-text-primary)' }}>编排的边界</strong>：
              简单任务不需要编排（编排成本 {'>'} 节省的时间），复杂任务必须编排（手动管理的隐性成本远超 API 费用）。
              两阶段 review 是信任自动化的基础。
            </p>
          </div>
        </div>

        <QualityCallout title="从这一章到下一章">
          <p>
            这一章的编排是<strong style={{ color: 'var(--color-text-primary)' }}>单功能维度</strong>的——从 spec 到 merge 完成一个功能。
            但真实项目中，你面对的是多个功能并行、多个团队协作、多个环境部署。
            下一章我们将探索更高阶的组合技：跨功能编排、CI/CD 集成、以及如何让编排本身也变成可测试、可迭代的基础设施。
          </p>
        </QualityCallout>
      </section>
    </div>
  )
}
