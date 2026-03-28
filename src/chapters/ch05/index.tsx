import { lazy } from 'react'
import { CodeBlock } from '../../components/content/CodeBlock'
import { PromptCompare } from '../../components/content/PromptCompare'
import { QualityCallout } from '../../components/content/QualityCallout'
import { ExerciseCard } from '../../components/content/ExerciseCard'
import { DecisionTree } from '../../components/content/DecisionTree'
import type { TreeNode } from '../../components/content/DecisionTree'
import { AnimationWrapper } from '../../components/animation/AnimationWrapper'
import { ReferenceSection } from '../../components/content/ReferenceSection'

const LazyPlanModeFlow = lazy(() => import('../../remotion/ch03/PlanModeFlow'))

/* ═══════════════════════════════════════════════
   Decision Tree Data — "Should I use Plan Mode?"
   ═══════════════════════════════════════════════ */

const planModeTree: TreeNode = {
  id: 'root',
  question: '你即将开始一个新任务，应该用 Plan Mode 吗？',
  description: '根据任务特征选择最高效的工作模式。',
  children: [
    {
      label: '一行改动 / 简单 fix',
      node: {
        id: 'one-liner',
        question: '跳过 Plan',
        result: {
          text: '直接执行即可。Plan Mode 的开销对一行改动来说完全不值得。直接描述你要改什么，让 Claude 改。',
          tier: 'l1',
        },
      },
    },
    {
      label: '涉及 3+ 文件',
      node: {
        id: 'multi-file',
        question: '你对这些文件的代码熟悉吗？',
        children: [
          {
            label: '熟悉，改过很多次',
            node: {
              id: 'familiar-multi',
              question: '建议 Plan',
              result: {
                text: '使用 Plan Mode 明确改动顺序和文件依赖。即使你熟悉代码，3+ 文件的协调容易出错。Plan 帮你理清执行路径。',
                tier: 'l2',
              },
            },
          },
          {
            label: '不太熟悉',
            node: {
              id: 'unfamiliar-multi',
              question: '必须 Explore + Plan',
              result: {
                text: '先用 Explore 阶段让 Claude 分析现有代码结构，理解文件间关系。然后进入 Plan Mode 制定改动方案。不熟悉的代码直接改是灾难的开始。',
                tier: 'l3',
              },
            },
          },
        ],
      },
    },
    {
      label: '需求不明确',
      node: {
        id: 'unclear-req',
        question: '先 Diagnose',
        result: {
          text: '需求模糊时直接写代码 = 赌博。先用 Diagnose 阶段厘清约束和边界条件，让 Claude 帮你发现需求中的歧义。然后再决定是否需要 Plan。',
          tier: 'l2',
        },
      },
    },
    {
      label: '涉及数据库 Schema 变更',
      node: {
        id: 'db-schema',
        question: '必须 Plan',
        result: {
          text: 'Schema 变更是不可逆的（至少回滚成本极高）。必须用 Plan Mode 列出：migration 步骤、数据兼容性、回滚方案、上下游影响。没有 Plan 的 Schema 变更等于裸奔。',
          tier: 'l3',
        },
      },
    },
    {
      label: '上下文已经 >60%',
      node: {
        id: 'context-full',
        question: '先 /compact，再 Plan',
        result: {
          text: '上下文快满时做 Plan 会导致 Claude "健忘"——前面讨论的约束可能被截断。先用 /compact 压缩上下文，或开新会话，再进入 Plan Mode。',
          tier: 'l2',
        },
      },
    },
    {
      label: '需要他人 Review 的变更',
      node: {
        id: 'needs-review',
        question: 'Plan + 导出',
        result: {
          text: '用 Plan Mode 生成方案，然后导出为 PR Description 或设计文档。Reviewer 能看到你的思考过程，不只是代码差异。Plan 输出直接变成 Review 的上下文。',
          tier: 'l2',
        },
      },
    },
  ],
}

/* ═══════════════════════════════════════════════
   Chapter 5 Component
   ═══════════════════════════════════════════════ */

export default function Ch05() {
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
            05
          </span>
          <span
            className="text-xs uppercase tracking-widest font-medium"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Planning Phase
          </span>
        </div>
        <h1
          className="text-3xl md:text-4xl font-bold mb-4 leading-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          用 AI 做方案设计：Plan Mode + 结构化思考
        </h1>
        <p
          className="text-lg leading-relaxed max-w-3xl"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          第 4 章我们学会了让 Claude 写代码。但写代码只是软件开发的一小部分 --
          真正决定项目成败的是方案设计。这一章我们将学习如何用 Plan Mode
          把 Claude 从"代码生成器"变成"架构思考伙伴"，在动手之前先想清楚。
        </p>
      </header>

      {/* ═══════════════════════════════════════════════
          Section 5.1: Plan Mode 的底层实现
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          5.1 Plan Mode 的底层实现
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          很多人以为 Plan Mode 是 Claude "变得更有纪律性" -- 它会忍住不改代码，先做计划。
          这是一个误解。Plan Mode 的实现远比这粗暴且有效：
          <strong>它直接禁用了 Write 和 Edit 工具</strong>。Claude 不是"选择"不改代码，
          而是<strong>物理上无法</strong>改代码。
        </p>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          理解这一点很重要。Plan Mode 改变的是 system prompt 中的工具权限列表。
          进入 Plan Mode 后，Claude 只能读取文件（Read tool）、搜索代码（Grep/Glob）、
          运行只读命令（Bash with restrictions），但不能创建、修改或删除任何文件。
          它被迫只能<strong>思考和输出文字</strong>。
        </p>

        <p className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          注：EDPE 是本教程提出的教学框架，非 Claude Code 内置功能。
        </p>

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          模式切换
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>Shift+Tab</code> 在三种模式间循环切换：
        </p>

        <CodeBlock
          language="bash"
          title="模式循环"
          code={`# Shift+Tab 循环
Normal Mode → Plan Mode → Accept Edits Mode → Normal Mode → ...

# Normal Mode:     所有工具可用，Claude 可以读、写、执行
# Plan Mode:       Write/Edit 工具被禁用，Claude 只能读和思考
# Accept Edits:    Claude 提出修改建议，你逐个批准/拒绝`}
          showLineNumbers={false}
        />

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          这意味着 Plan Mode 不是一个"建议"，而是一个<strong>硬约束</strong>。
          你不需要在 prompt 里写"不要修改代码"——工具层面已经做了限制。
          这就像是给一个厨师拿走了所有刀具，只留下菜谱本和笔 --
          他只能写菜谱，不能切菜。
        </p>

        <QualityCallout title="为什么工具级别的限制比 prompt 级别更可靠">
          <p>
            如果你只在 prompt 中说"先不要改代码，先做计划"，Claude 有概率会忽略这个指令，
            尤其是在上下文很长的时候。但 Plan Mode 是在工具权限层面做的限制 --
            即使 Claude "想"改代码，API 调用也会被拒绝。
            这是<strong>机制保证</strong>，不是"行为引导"。
          </p>
        </QualityCallout>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 5.2: 四阶段框架 EDPE
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          5.2 四阶段框架 EDPE
        </h2>

        <AnimationWrapper
          component={LazyPlanModeFlow}
          durationInFrames={180}
          fallbackText="Plan Mode 流程动画加载失败"
        />

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Plan Mode 不是简单地"先想后做"。一个好的 Plan 过程分为四个阶段：
          <strong>Explore（探索）→ Diagnose（诊断）→ Plan（规划）→ Execute（执行）</strong>。
          让我们用一个真实场景来走完这四个阶段：给现有的 Express API 添加 RBAC（基于角色的访问控制）。
        </p>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 5.3: 实战：RBAC 功能实现
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          5.3 实战：RBAC 功能实现
        </h2>

        {/* ── Stage 1: Explore ── */}
        <h3
          className="text-lg font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Stage 1: Explore（探索）-- 5 分钟
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Explore 阶段的唯一目标是<strong>理解现状</strong>。注意：我们在这个阶段
          <strong>不问解决方案</strong>。为什么？因为如果你在不了解现状的情况下问"怎么加 RBAC"，
          Claude 会给你一个通用方案 -- 而通用方案在碰到你项目的具体细节时必然水土不服。
        </p>

        <CodeBlock
          language="bash"
          title="Explore 阶段 Prompt（在 Plan Mode 下使用）"
          code={`# 切换到 Plan Mode (Shift+Tab)
# 然后输入以下 prompt:

分析这个 Express API 项目的认证和权限现状：

1. 当前的用户模型有哪些字段？有没有 role 或 permission 相关字段？
2. 现有的认证中间件是怎么实现的？（JWT？Session？）
3. 列出所有路由端点，标注哪些需要认证、哪些是公开的
4. 当前有没有任何形式的权限检查？（哪怕是硬编码的 if 判断）
5. 数据库用的什么？ORM 是什么？migration 工具是什么？

重要：只分析现状，不要提出任何修改建议。
我需要先完全理解现有架构，再考虑方案。`}
          showLineNumbers={false}
        />

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          这个 prompt 的每一个限制条件都有目的：
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>约束</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>为什么需要</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--color-text-secondary)' }}>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4 font-mono text-xs">"只分析现状"</td>
                <td className="py-3 px-4">防止 Claude 跳到解决方案。AI 天然倾向于"帮你解决问题"，你需要明确告诉它现在还不到那一步。</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4 font-mono text-xs">"不要提出修改建议"</td>
                <td className="py-3 px-4">双重保险。有些 Claude 模型会在分析完现状后"顺便"给建议，这个约束堵住这个出口。</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4 font-mono text-xs">5 个具体问题</td>
                <td className="py-3 px-4">结构化的问题比"分析一下"效果好 10 倍。Claude 会逐一回答，不会遗漏关键维度。</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4 font-mono text-xs">"列出所有路由端点"</td>
                <td className="py-3 px-4">要求完整性。如果只是"看看路由"，Claude 可能只展示几个例子。"列出所有"强制它做全面扫描。</td>
              </tr>
            </tbody>
          </table>
        </div>

        <PromptCompare
          bad={{
            prompt: '帮我给这个 API 加 RBAC',
            label: '直接要方案',
            explanation: '不了解现状就要方案，Claude 只能给通用模板。结果是：方案和你的项目实际架构不匹配，要么大改方案，要么硬塞代码。',
          }}
          good={{
            prompt: '分析这个 API 的认证和权限现状，只分析不建议',
            label: '先探索现状',
            explanation: '了解了当前架构、数据模型、现有中间件后，后续的方案才能"长在"现有代码上，而不是空中楼阁。',
          }}
        />

        {/* ── Stage 2: Diagnose ── */}
        <h3
          className="text-lg font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Stage 2: Diagnose（诊断）-- 5 分钟
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Explore 告诉我们"有什么"，Diagnose 告诉我们"在什么限制下工作"。
          关键理念：<strong>约束是过滤器</strong>。你给的约束越明确，Claude 能给的方案就越精准。
          没有约束的方案 = 无限可能 = 没有可执行性。
        </p>

        <CodeBlock
          language="bash"
          title="Diagnose 阶段 Prompt"
          code={`# 继续在 Plan Mode 中

基于你刚才的分析，我需要加 RBAC。以下是约束条件：

硬约束（不可违反）：
- 数据库用的 PostgreSQL + Prisma，migration 必须可回滚
- 现有的 JWT 认证中间件必须保留，RBAC 在其基础上扩展
- 不能引入新的依赖库（如 casbin、casl），用原生实现
- 现有的 20+ 个 API 端点不能 break，必须向后兼容

软约束（尽量满足）：
- 角色设计遵循最小权限原则
- 新端点的 response 格式与现有一致
- 权限检查要在中间件层，不要散落在 handler 里

给我 2-3 个可能的实现方案的大方向（不需要细节），
每个方案列出优缺点和适用场景。`}
          showLineNumbers={false}
        />

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          注意几个设计选择：
        </p>

        <ul className="space-y-3 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <span><strong>硬约束和软约束分开</strong> -- 让 Claude 知道哪些可以商量，哪些不行。混在一起会导致 Claude 在某些"软约束"上做无谓的坚持，或在"硬约束"上做不该做的妥协。</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <span><strong>约束先行，方案后给</strong> -- 先告诉约束再问方案，而不是先问方案再说"但是不能用 casbin"。后者会让 Claude 浪费 token 生成不可行的方案再推翻。</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <span><strong>要求多方案比较</strong> -- "给我 2-3 个方案" 比 "给我一个方案" 好得多。Claude 给单一方案时倾向于给"最安全"的，但那不一定是最适合你的。</span>
          </li>
        </ul>

        {/* ── Stage 3: Plan ── */}
        <h3
          className="text-lg font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Stage 3: Plan（规划）-- 10 分钟
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          假设你从 Diagnose 阶段选择了"方案 B: 基于角色的中间件 + 路由级权限声明"。
          现在进入 Plan 阶段，把方向变成可执行的步骤。
          核心原则：<strong>没有验证步骤的计划等于没有计划</strong>。
        </p>

        <CodeBlock
          language="bash"
          title="Plan 阶段 Prompt"
          code={`# 仍在 Plan Mode 中

选定方案 B。现在把它细化成可执行的实施计划。要求：

1. 分成清晰的 Phase（每个 Phase 独立可验证）
2. 每个 Phase 包含：
   - 具体要改的文件列表
   - 改动内容摘要
   - 验证步骤（怎么确认这个 Phase 做对了）
   - 预期的测试命令
   - 回滚方案（如果这个 Phase 出问题怎么撤销）
3. Phase 之间的依赖关系要明确
4. 估算每个 Phase 的代码改动量（行数级别）

额外要求：如果任何 Phase 的改动超过 200 行，拆成更小的子步骤。`}
          showLineNumbers={false}
        />

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Claude 会输出类似这样的计划：
        </p>

        <CodeBlock
          language="markdown"
          title="Claude 生成的实施计划（示例摘要）"
          code={`## Phase 1: 数据模型扩展（~50 行）
文件: prisma/schema.prisma, src/types/auth.ts

改动:
- User model 添加 role 字段 (enum: ADMIN, EDITOR, VIEWER)
- 创建 Permission 枚举类型
- 创建 role-permission 映射常量

验证步骤:
- [ ] npx prisma migrate dev --name add-user-role
- [ ] npx prisma generate (无错误)
- [ ] 现有测试全部通过 (npm test)
- [ ] 数据库中现有用户 role 默认为 VIEWER

回滚: npx prisma migrate reset 或 手动 SQL DROP COLUMN

---

## Phase 2: 权限中间件（~80 行）
文件: src/middleware/rbac.ts, src/middleware/auth.ts

改动:
- 创建 requirePermission() 中间件工厂函数
- 修改现有 auth 中间件，在 req.user 上附加 role 信息
- 中间件签名: requirePermission('users:write')

验证步骤:
- [ ] 单元测试: 中间件对不同 role 的请求返回正确状态码
- [ ] 不带 role 的旧 token 被视为 VIEWER
- [ ] 403 响应格式与现有错误格式一致

回滚: 删除 rbac.ts，恢复 auth.ts 的 git 版本

---

## Phase 3: 路由集成（~120 行）
文件: src/routes/*.ts

改动:
- 为每个路由添加 requirePermission() 中间件
- 路由权限映射表
- 公开端点不需要权限中间件

验证步骤:
- [ ] ADMIN 能访问所有端点
- [ ] VIEWER 只能 GET
- [ ] 未认证用户只能访问公开端点
- [ ] 现有集成测试全部通过

回滚: git checkout src/routes/`}
          showLineNumbers={false}
        />

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          注意每个 Phase 都有验证步骤。这不是形式主义 -- 验证步骤是你在 Execute 阶段的"检查站"。
          如果 Phase 1 的验证没通过，你就不应该进入 Phase 2。
        </p>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <strong>Pro tip:</strong> 按 <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>Ctrl+G</code> 可以在外部编辑器中打开 Claude 生成的计划，
          方便你做修改和标注。修改后保存，Claude 会自动读取你的修改。
        </p>

        <QualityCallout title="质量线：Plan = 强制思考检查站">
          <p>
            2023 年，Amazon 因为一个权限配置错误导致了估计 $2.8B 的损失（S3 全球故障事件）。
            事后分析的根本原因之一是：变更流程中<strong>没有人类审查步骤</strong>。
            自动化测试全过了，但没人审查变更的<strong>意图和影响范围</strong>。
          </p>
          <p className="mt-2">
            Plan Mode 就是你的人类审查步骤。它强迫你（和 Claude）在改代码之前
            回答"我们要做什么、为什么这样做、怎么验证做对了"这三个问题。
            这 10 分钟的思考可以省掉 10 小时的调试。
          </p>
        </QualityCallout>

        {/* ── Stage 4: Execute ── */}
        <h3
          className="text-lg font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Stage 4: Execute（执行）-- 逐步推进
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          现在切回 Normal Mode（<code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>Shift+Tab</code>），让 Claude 开始执行。
          但不是说"执行计划" -- 而是<strong>一步一步来</strong>。
        </p>

        <CodeBlock
          language="bash"
          title="Execute 阶段 Prompt"
          code={`# 切回 Normal Mode (Shift+Tab)

执行 Phase 1：数据模型扩展。

完成后停下来，不要继续 Phase 2。
我需要先验证 Phase 1 的结果。`}
          showLineNumbers={false}
        />

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Claude 会执行 Phase 1 的所有改动。然后你按照 Plan 中的验证步骤逐一检查。
          如果一切正常：
        </p>

        <CodeBlock
          language="bash"
          title="Phase 1 验证通过后"
          code={`Phase 1 验证通过。继续执行 Phase 2：权限中间件。
同样，完成后停下等我验证。`}
          showLineNumbers={false}
        />

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          如果验证发现问题呢？<strong>不要在 Normal Mode 下让 Claude 修修补补</strong>。
          正确做法是切回 Plan Mode，重新审视出问题的 Phase：
        </p>

        <CodeBlock
          language="bash"
          title="验证失败时的处理"
          code={`# 切回 Plan Mode (Shift+Tab)

Phase 2 的验证失败了：
- requirePermission('users:write') 对 ADMIN 返回 403
- 错误信息：role 字段在 JWT payload 中找不到

分析原因，调整 Phase 2 的计划。
可能是 Phase 1 的 auth 中间件没有正确传递 role 信息到 JWT。`}
          showLineNumbers={false}
        />

        <PromptCompare
          bad={{
            prompt: '有 bug，帮我修一下那个 403 问题',
            label: '直接 fix',
            explanation: '不分析原因就修 bug，Claude 可能只修表面症状。403 的根因可能在 JWT 签发而不是权限检查 -- 头痛医头的修法只会引入更多问题。',
          }}
          good={{
            prompt: '验证失败了（具体症状）。切回 Plan Mode 分析原因，调整计划',
            label: '回到 Plan 分析',
            explanation: '把具体症状给 Claude，让它在 Plan Mode 下分析根因。这样修复方案会考虑全局影响，而不是局部打补丁。',
          }}
        />

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <strong>Explore → Diagnose → Plan → Execute</strong> 不是线性的 --
          它是一个循环。Execute 中发现问题时，随时可以退回到 Plan 甚至 Explore 阶段。
          关键是：每次退回都是<strong>有意识的决策</strong>，而不是在 Normal Mode 下焦头烂额地打补丁。
        </p>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 5.4: 验证检查点的价值
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          5.4 验证检查点的价值
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Plan Mode 不是万能药。用在不需要的地方会浪费时间和 token，不用在需要的地方会浪费更多时间和 token。
          下面是一个场景化的决策指南：
        </p>

        {/* Decision table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>场景</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>建议</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>理由</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--color-text-secondary)' }}>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4">一行改动</td>
                <td className="py-3 px-4"><span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80' }}>Skip</span></td>
                <td className="py-3 px-4">Plan 的开销（token + 时间）远大于改动本身</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4">3+ 文件改动</td>
                <td className="py-3 px-4"><span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(250, 204, 21, 0.1)', color: '#facc15' }}>Plan</span></td>
                <td className="py-3 px-4">多文件协调需要理清顺序和依赖</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4">不熟悉的代码</td>
                <td className="py-3 px-4"><span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(248, 113, 113, 0.1)', color: '#f87171' }}>Explore first</span></td>
                <td className="py-3 px-4">不了解现状就做计划 = 空中楼阁</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4">需求不清晰</td>
                <td className="py-3 px-4"><span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(248, 113, 113, 0.1)', color: '#f87171' }}>Diagnose first</span></td>
                <td className="py-3 px-4">需求模糊 + 直接编码 = 做了再拆、拆了再做</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4">上下文 &gt;60%</td>
                <td className="py-3 px-4"><span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(250, 204, 21, 0.1)', color: '#facc15' }}>/compact first</span></td>
                <td className="py-3 px-4">上下文快满时 Plan 质量下降，先压缩再规划</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4">数据库 Schema 变更</td>
                <td className="py-3 px-4"><span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(248, 113, 113, 0.1)', color: '#f87171' }}>Must Plan</span></td>
                <td className="py-3 px-4">不可逆操作 -- 必须有回滚方案和数据兼容性分析</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4">需要他人 Review</td>
                <td className="py-3 px-4"><span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(250, 204, 21, 0.1)', color: '#facc15' }}>Plan + 导出</span></td>
                <td className="py-3 px-4">Plan 输出直接变成 PR Description</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Interactive Decision Tree */}
        <DecisionTree
          root={planModeTree}
          title="决策树：我该用 Plan Mode 吗？"
        />

        {/* Extended Thinking */}
        <h3
          className="text-lg font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          进阶技巧：Extended Thinking
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Plan Mode 和 Extended Thinking 可以叠加使用。
          按 <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>Alt+T</code> 开启
          Extended Thinking，Claude 会在回答之前先进行一轮内部推理。
          结合 Plan Mode：
        </p>

        <CodeBlock
          language="bash"
          title="Plan + Extended Thinking"
          code={`# 1. 开启 Extended Thinking (Alt+T)
# 2. 切换到 Plan Mode (Shift+Tab)
# 3. 输入 prompt，可以在末尾加 "ultrathink" 要求更深度的思考

分析这个并发问题的根因，给出修复方案。ultrathink

# Claude 会先做一轮内部推理（你看不到），然后输出更深入的分析
# 适合：架构决策、复杂 bug 分析、性能优化方案设计`}
          showLineNumbers={false}
        />

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Extended Thinking 会增加 token 消耗，但对于复杂决策来说物超所值。
          经验法则：如果一个问题你自己想了 5 分钟还没有清晰思路，就值得开 Extended Thinking。
        </p>

        {/* Multi-option comparison */}
        <h3
          className="text-lg font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          进阶技巧：多方案比较
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          永远不要只问 Claude 要一个方案。要求它给 2-3 个方案并比较优劣。
          单一方案的问题是：你不知道它为什么选这个方案而不是那个。
          多方案比较让你看到决策空间的全貌。
        </p>

        <CodeBlock
          language="bash"
          title="多方案比较 Prompt 模板"
          code={`给我 2-3 个实现 [功能] 的方案。

对每个方案，给出：
- 核心思路（2-3 句话）
- 优点
- 缺点
- 适用条件（什么情况下选这个）
- 粗略的工作量估算

最后给一个比较矩阵，维度包括：
复杂度、性能、可维护性、扩展性、实现时间`}
          showLineNumbers={false}
        />

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          然后你可以根据自己的优先级（比如"时间紧迫"或"需要长期维护"）选择最合适的方案。
          这比让 Claude 直接给"最佳方案"有效得多 -- 因为"最佳"取决于你的上下文，
          而 Claude 不完全了解你的上下文。
        </p>

        {/* Plan Reuse Value */}
        <h3
          className="text-lg font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Plan 的复用价值
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Plan Mode 的输出不是一次性的。一个好的 Plan 至少可以复用为以下四种产物：
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: 'PR Description',
              desc: 'Plan 的 Phase 划分和改动摘要直接变成 PR 的 Summary。Reviewer 能看到不只是"改了什么"，还有"为什么这样改"和"按什么顺序改的"。',
              tip: '直接复制 Plan 的 Phase 列表到 PR body。',
            },
            {
              title: '设计文档',
              desc: 'Explore 阶段的现状分析 + Diagnose 阶段的约束和方案比较 + Plan 阶段的实施步骤 = 一份完整的轻量级设计文档。',
              tip: '适合需要设计评审的中大型功能。',
            },
            {
              title: 'Review Checklist',
              desc: 'Plan 中每个 Phase 的验证步骤就是 Reviewer 的检查清单。比"LGTM"有用 100 倍。',
              tip: '把验证步骤格式化成 checkbox 列表。',
            },
            {
              title: '任务拆分',
              desc: '如果 Plan 涉及多人协作，Phase 可以直接变成独立的 Jira ticket / GitHub Issue。每个 Phase 有明确的输入、输出和验证标准。',
              tip: '适合 tech lead 分配工作。',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-lg p-4"
              style={{
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
              }}
            >
              <h4
                className="text-sm font-semibold mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {item.title}
              </h4>
              <p
                className="text-sm leading-relaxed mb-2"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {item.desc}
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {item.tip}
              </p>
            </div>
          ))}
        </div>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          换句话说：Plan Mode 的 10 分钟投入，产出的不仅是更好的代码，
          还有文档、Review 材料和项目管理产物。
          这是一个极高 ROI 的时间投资。
        </p>

        {/* Failure modes */}
        <h3
          className="text-lg font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          失败模式：Plan Mode 的四种常见错误
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Plan Mode 不是银弹。用错了反而比不用还糟。以下是最常见的四种失败模式：
        </p>

        {/* Failure 1 */}
        <div
          className="rounded-lg overflow-hidden"
          style={{
            border: '1px solid var(--color-border)',
            borderLeft: '3px solid #f87171',
          }}
        >
          <div className="px-5 py-4">
            <h4 className="text-base font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              1. 过度规划（Over-planning）
            </h4>
            <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              症状：一个添加日志的小任务，用 Plan Mode 做了 30 分钟的架构分析，
              输出了 5 个 Phase 的实施计划。
            </p>
            <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              根因：没有做前置判断"这个任务值不值得 Plan"。参考 5.4 的决策表：
              一行改动、简单 fix、已经非常熟悉的代码都不需要 Plan。
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              <strong>经验法则</strong>：如果你能在脑子里想清楚改动的完整路径（改哪些文件、改什么），
              就不需要 Plan Mode。Plan 是给那些你<strong>脑子里装不下</strong>的任务用的。
            </p>
          </div>
        </div>

        {/* Failure 2 */}
        <div
          className="rounded-lg overflow-hidden"
          style={{
            border: '1px solid var(--color-border)',
            borderLeft: '3px solid #f87171',
          }}
        >
          <div className="px-5 py-4">
            <h4 className="text-base font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              2. 计划粒度太粗（Too-coarse Plan）
            </h4>
            <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              症状：计划只有"Phase 1: 实现后端 → Phase 2: 实现前端 → Phase 3: 集成测试"。
              每个 Phase 都太大，无法独立验证。
            </p>
            <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              根因：prompt 中没有要求细粒度。Claude 默认给的粒度取决于上下文 --
              如果你不明确要求，它可能给你一个高层概述而不是可执行的步骤。
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              <strong>修复方法</strong>：在 Plan prompt 中加约束："如果任何 Phase 的改动超过 N 行，
              拆成更小的子步骤"，"每个 Phase 必须能在 10 分钟内完成和验证"。
            </p>
          </div>
        </div>

        {/* Failure 3 */}
        <div
          className="rounded-lg overflow-hidden"
          style={{
            border: '1px solid var(--color-border)',
            borderLeft: '3px solid #f87171',
          }}
        >
          <div className="px-5 py-4">
            <h4 className="text-base font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              3. 没有验证步骤（No Verification Steps）
            </h4>
            <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              症状：计划列出了要做什么，但没有说怎么确认做对了。
              执行完一个 Phase 后你不知道该看什么、测什么、验什么。
            </p>
            <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              根因：Claude 倾向于输出"行动步骤"而省略"验证步骤"，因为验证步骤不是"做新东西"而是"检查旧东西"。
              你需要在 prompt 中<strong>明确要求</strong>。
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              <strong>修复方法</strong>：在 Plan prompt 中写死要求："每个 Phase 必须包含验证步骤，
              包括具体的测试命令和预期输出"。如果 Claude 给的 Plan 没有验证步骤，<strong>拒绝接受</strong>，
              要求它补充。
            </p>
          </div>
        </div>

        {/* Failure 4 */}
        <div
          className="rounded-lg overflow-hidden"
          style={{
            border: '1px solid var(--color-border)',
            borderLeft: '3px solid #f87171',
          }}
        >
          <div className="px-5 py-4">
            <h4 className="text-base font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              4. 上下文满了才做 Plan（Planning on Full Context）
            </h4>
            <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              症状：在一个已经聊了很久的会话中，上下文占用 &gt;60%，这时才切换到 Plan Mode 做规划。
              Plan 的质量明显下降 -- 遗漏你之前提到过的约束，或者给出和之前讨论矛盾的方案。
            </p>
            <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              根因：上下文窗口快满时，Claude 对早期内容的"注意力"下降。
              你在会话开头提的约束可能被后来的大量代码和讨论"稀释"了。
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              <strong>修复方法</strong>：
              (1) 在做 Plan 之前先 <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>/compact</code> 压缩上下文；
              (2) 或者开一个新会话，把关键约束重新列一遍再做 Plan；
              (3) 经验法则：如果你感觉 Claude 开始"忘事"了，就该 compact 或重开了。
            </p>
          </div>
        </div>

        <QualityCallout title="自检清单">
          <p>
            在接受 Claude 的 Plan 之前，检查以下四项：
          </p>
          <ol className="mt-2 space-y-1 list-decimal list-inside">
            <li>每个 Phase 是否有验证步骤？</li>
            <li>每个 Phase 的改动量是否合理（&lt;200 行）？</li>
            <li>是否有回滚方案？</li>
            <li>Phase 之间的依赖关系是否清晰？</li>
          </ol>
          <p className="mt-2">
            如果任何一项答案为"否"，要求 Claude 补充。不要带着残缺的 Plan 开始 Execute。
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
          title="Plan Mode 添加 CRUD 端点"
          description="选择一个你有的（或新建一个）Express/Fastify/Hono API 项目。使用完整的四阶段流程（Explore → Diagnose → Plan → Execute）为一个资源添加完整的 CRUD 端点。截图记录每个阶段的 token 消耗量。"
          checkpoints={[
            '完成了 Explore 阶段，输出了现状分析',
            '完成了 Diagnose 阶段，列出了硬约束和软约束',
            'Plan 中每个 Phase 都有验证步骤',
            '逐 Phase 执行，每个 Phase 验证后才进入下一个',
            '记录了总 token 消耗（对比直接让 Claude 做的消耗）',
          ]}
        />

        <ExerciseCard
          tier="l2"
          title="中等功能的计划 vs 实际偏差分析"
          description="在你的真实项目中，选一个中等规模的功能（预计 3-5 个文件的改动）。用 Plan Mode 做完整规划，然后执行。记录：Plan 预测的文件列表 vs 实际修改的文件列表、Plan 预测的改动量 vs 实际改动量、执行中回退到 Plan 的次数和原因。"
          checkpoints={[
            '功能复杂度适中（3-5 文件改动，不是一行 fix）',
            '记录了 Plan 和实际执行的偏差',
            '分析了偏差的原因（是 Plan 不够详细？还是需求变了？）',
            '总结了一条改进 Plan 质量的经验',
          ]}
        />

        <ExerciseCard
          tier="l3"
          title="有 Plan vs 无 Plan 的定量对比"
          description={'选同一类型的两个任务（比如都是「给现有 API 加一个新资源」）。一个用 Plan Mode 的四阶段流程，一个直接用 Normal Mode 让 Claude 做。定量比较：token 消耗、总耗时、返工次数（Claude 做了又改的次数）、最终代码质量（lint 警告数、测试覆盖率、响应格式一致性）。'}
          checkpoints={[
            '两个任务的类型和复杂度可比',
            '记录了 token 消耗的定量数据',
            '记录了返工次数（rejected edits / redo prompts）',
            '评估了最终代码质量的可量化指标',
            '写了一段结论：什么场景下 Plan Mode 的 ROI 为正',
          ]}
        />
      </section>

      <ReferenceSection version="Claude Code v1.x">
        <div className="text-sm space-y-2" style={{ color: 'var(--color-text-secondary)' }}>
          <p>EDPE 提示模板完整版（待补充）</p>
          <p>Plan Mode 配置选项（待补充）</p>
        </div>
      </ReferenceSection>
    </div>
  )
}
