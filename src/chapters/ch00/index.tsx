import { lazy } from 'react'
import { CodeBlock } from '../../components/content/CodeBlock'
import { QualityCallout } from '../../components/content/QualityCallout'
import { ExerciseCard } from '../../components/content/ExerciseCard'
import { TierBadge } from '../../components/content/TierBadge'
import { AnimationWrapper } from '../../components/animation/AnimationWrapper'

const LazyRequestLifecycle = lazy(() => import('../../remotion/ch00/RequestLifecycle'))
const LazyTokenEconomy = lazy(() => import('../../remotion/ch00/TokenEconomy'))

export default function Ch00() {
  return (
    <div className="space-y-16">
      {/* ═══════════════════════════════════════════════════════
          Chapter Header
          ═══════════════════════════════════════════════════════ */}
      <div className="space-y-4">
        <p
          className="text-lg leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          在你输入第一条消息之前，Claude Code 内部已经发生了上百个决策。理解这些决策——数据如何流动、token 如何消耗、权限如何裁决——是一切高效使用的基础。这一章不是"快速上手指南"，而是帮你建立对整个系统的<strong style={{ color: 'var(--color-text-primary)' }}>心智模型</strong>。
        </p>
        <p
          className="text-sm"
          style={{ color: 'var(--color-text-muted)' }}
        >
          本章适用于所有级别：<TierBadge tier="l1" /> 读者可以跳过标注为 L2/L3 的细节，但建议至少浏览一遍架构全貌。
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════
          Section 0.1: 一条请求的完整旅程
          ═══════════════════════════════════════════════════════ */}
      <section className="space-y-8">
        <h2
          className="text-2xl font-bold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          0.1 一条请求的完整旅程
        </h2>

        <AnimationWrapper
          component={LazyRequestLifecycle}
          durationInFrames={210}
          fallbackText="请求生命周期动画加载失败"
        />

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          当你在终端输入一条消息并按下回车，从你的击键到 Claude 的回复之间，经过了一条精确的处理链路。理解这条链路，就是理解 Claude Code 的一切行为为什么会那样发生。
        </p>

        {/* ── 完整链路图 ── */}
        <h3
          className="text-xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          完整数据流
        </h3>

        <CodeBlock
          language="bash"
          title="request-lifecycle.txt"
          code={`你的输入
  │
  ▼
System Prompt 组装 (110+ 条件片段, 7 层优先级)
  │
  ▼
LLM 推理 (你选择的模型: Sonnet / Opus)
  │
  ▼
工具选择 (Read? Edit? Bash? Grep? ...)
  │
  ▼
PreToolUse Hook ──→ 你的自定义脚本可以在此拦截/修改/拒绝
  │
  ▼
权限验证 (deny → ask → allow 严格顺序)
  │
  ▼
[如果是 Bash] 安全两阶段分析 ──→ Haiku 模型自动评估命令风险
  │
  ▼
工具执行 (实际读文件/写文件/跑命令)
  │
  ▼
PostToolUse Hook ──→ 执行后的自定义处理
  │
  ▼
结果注入上下文 (工具输出追加到对话历史)
  │
  ▼
LLM 生成回复 / 决定是否需要更多工具调用
  │
  ▼
你看到的回复`}
        />

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          这不是简化图——这是<strong style={{ color: 'var(--color-text-primary)' }}>实际发生的每一步</strong>。一条看似简单的"帮我改一下这个函数"，会在几秒内走完这整条链路，有时还会循环多次（当模型决定需要先读文件再编辑时）。
        </p>

        {/* ── System Prompt 7层优先级 ── */}
        <h3
          className="text-xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          System Prompt 的 7 层优先级
        </h3>

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Claude Code 的 System Prompt 不是一段固定文本。它是由<strong style={{ color: 'var(--color-text-primary)' }}> 110+ 个条件片段</strong>动态组装的，按照严格的优先级排列。优先级越高，在冲突时越会被遵守：
        </p>

        <CodeBlock
          language="yaml"
          title="system-prompt-priority.yaml"
          highlightLines={[1, 2, 7]}
          code={`# 优先级从高到低 (1 = 最高)
1. Managed Policy     # 组织级策略 (API 下发，用户不可覆盖)
2. Built-in           # Claude Code 内置指令 (工具使用规则、安全约束)
3. Session            # 当前会话级指令
4. CLAUDE.md (user)   # 项目根目录的 CLAUDE.md (以 user message 身份注入)
5. Rules              # .claude/settings.json 中的 rules 字段
6. Auto Memory        # Claude 自动记录的项目偏好 (.claude/memories.json)
7. User Message       # 你当前输入的消息`}
        />

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          这个优先级设计有一个重要含义：<strong style={{ color: 'var(--color-text-primary)' }}>CLAUDE.md 的指令优先级高于你当前消息</strong>。如果你在 CLAUDE.md 中写了"所有代码必须使用 TypeScript"，然后在对话中说"用 JavaScript 写一个工具函数"，Claude 会倾向于遵守 CLAUDE.md 的约定。这是设计意图——项目规范应该比临时指令更稳定。
        </p>

        <div
          className="p-4 rounded-lg"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <p
            className="text-sm font-medium mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            你可以亲自验证：
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            在 Claude Code 中运行 <code style={{ color: 'var(--color-accent)' }}>/cost</code> 命令，你会看到每次交互的 token 消耗。注意观察 input tokens 中有多少是 system prompt 占用的——首次对话通常系统提示就占了数千 token。然后打开 <code style={{ color: 'var(--color-accent)' }}>/context</code> 查看当前上下文窗口的使用率。
          </p>
        </div>

        {/* ── Token 成本分析 ── */}
        <h3
          className="text-xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          每一步的 Token 成本
        </h3>

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          不同工具调用的 token 成本差异极大，这直接影响你的上下文预算和现金支出：
        </p>

        <CodeBlock
          language="bash"
          title="token-costs-per-tool.txt"
          code={`工具           Token 成本                    说明
──────────────────────────────────────────────────────────────
Bash           固定 ~245 tokens              仅记录命令 + 截断后的输出
Read           完整文件 tokens               1000行文件 ≈ 3000-5000 tokens
Edit           仅 diff tokens                只记录变更部分，非常高效
Write          完整内容 tokens               新文件全量写入
Grep           匹配行 tokens                 只返回匹配结果，高效
Glob           文件路径列表 tokens            轻量级
Agent          子代理整个对话 tokens          成本乘数，谨慎使用

关键公式:
  Read(1000行文件) ≈ 20 × Edit(修改3行)
  Read(1000行文件) ≈ 15 × Grep(搜索同文件)
  Bash(ls) ≈ Bash(complex-pipeline) ≈ 245 tokens (固定开销)`}
        />

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          这意味着一个关键决策：<strong style={{ color: 'var(--color-text-primary)' }}>当你只需要查看文件的一小部分时，Grep 比 Read 高效 10-20 倍</strong>。这不是理论——当你的上下文窗口在一次 session 中被大文件读取快速填满时，你会直接感受到这个差异。
        </p>

        <QualityCallout title="质量线: 数据流感知">
          <p className="mb-2">
            请求链路中的每一步都是一个<strong style={{ color: 'var(--color-text-primary)' }}>可审计的拦截点</strong>。理解数据流是进行风险评估的前提：
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>PreToolUse Hook 可以在工具执行<strong>前</strong>拦截危险操作</li>
            <li>权限验证按照 deny → ask → allow 的严格顺序执行，永远不会跳过</li>
            <li>Bash 命令会经过额外的 Haiku 模型安全分析（两阶段：先判断风险类别，再决定是否放行）</li>
            <li>每一步都产生 token 成本——成本感知是资源管理的基础</li>
          </ul>
        </QualityCallout>

        {/* ── 失败案例 ── */}
        <h3
          className="text-xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          失败案例: 权限配置错误导致意外文件访问
        </h3>

        <div
          className="p-4 rounded-lg space-y-3"
          style={{
            background: 'rgba(248, 113, 113, 0.05)',
            border: '1px solid rgba(248, 113, 113, 0.2)',
          }}
        >
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <strong style={{ color: 'var(--color-text-primary)' }}>场景</strong>：一位开发者在 <code>.claude/settings.json</code> 中配置了 <code>"allowedTools": ["Edit", "Write", "Bash"]</code>，认为这样已经限制了 Claude 的能力范围。然后他让 Claude "清理项目中的临时文件"。
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <strong style={{ color: 'var(--color-text-primary)' }}>结果</strong>：Claude 通过 Bash 工具执行了 <code>rm -rf</code> 命令，删除了不应该被删除的配置文件。allowedTools 只控制<strong>哪些工具可用</strong>，但不控制 Bash 内部<strong>执行什么命令</strong>。
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <strong style={{ color: 'var(--color-text-primary)' }}>教训</strong>：权限配置必须理解每一层的作用范围。Bash 工具的内部行为需要通过 deny 规则中的命令模式匹配来约束，而不是简单地"允许 Bash"。
          </p>
        </div>

        <CodeBlock
          language="json"
          title=".claude/settings.json (正确的防御配置)"
          highlightLines={[4, 5, 6]}
          code={`{
  "permissions": {
    "deny": [
      "Bash(rm -rf *)",
      "Bash(rm -r /)",
      "Bash(*--no-preserve-root*)"
    ],
    "ask": [
      "Bash(rm *)",
      "Bash(mv *)",
      "Write(*)"
    ],
    "allow": [
      "Read(*)",
      "Grep(*)",
      "Glob(*)"
    ]
  }
}`}
        />
      </section>

      {/* ═══════════════════════════════════════════════════════
          Section 0.2: 上下文窗口经济学
          ═══════════════════════════════════════════════════════ */}
      <section className="space-y-8">
        <h2
          className="text-2xl font-bold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          0.2 上下文窗口经济学
        </h2>

        <AnimationWrapper
          component={LazyTokenEconomy}
          durationInFrames={180}
          fallbackText="Token 经济动画加载失败"
        />

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          上下文窗口是 Claude Code 最核心的有限资源。很多人以为"200K token 够用了"，然后在实际工作中反复遇到质量下降却找不到原因。这一节告诉你真实的数字和真实的陷阱。
        </p>

        {/* ── 真实容量 ── */}
        <h3
          className="text-xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          真实可用容量
        </h3>

        <CodeBlock
          language="bash"
          title="context-window-reality.txt"
          code={`名义容量:     200,000 tokens
内部缓冲:    ~33,000 tokens (system prompt + 安全边际)
────────────────────────────
实际可用:    ~167,000 tokens

自动压缩触发:  95-98% 使用率时触发 auto-compact
压缩率:        60-80% (丢失 20-40% 的细节信息)

关键数字:
  一个 500 行的源代码文件  ≈  1,500 - 2,500 tokens
  一次完整的对话轮次      ≈  500 - 2,000 tokens
  System Prompt 首次加载   ≈  3,000 - 8,000 tokens`}
        />

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          但 167K 这个数字会给你一种虚假的安全感。实际的质量瓶颈远比这个数字来得更早。
        </p>

        {/* ── 核心洞察: 注意力稀释 ── */}
        <h3
          className="text-xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          核心洞察: 注意力稀释效应
        </h3>

        <div
          className="p-5 rounded-lg"
          style={{
            background: 'rgba(217, 119, 87, 0.06)',
            border: '1px solid rgba(217, 119, 87, 0.25)',
          }}
        >
          <p
            className="text-base font-semibold mb-3"
            style={{ color: 'var(--color-accent)' }}
          >
            质量下降发生在 20-40% 使用率，不是 token 耗尽时
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            这是本教程最反直觉的事实之一。当上下文窗口填充到 20-40%（约 33K-67K tokens）时，模型对中间内容的注意力就会显著下降。这不是 bug，而是 Transformer 架构的固有特性——注意力随序列长度稀释。你的上下文<strong style={{ color: 'var(--color-text-primary)' }}>看起来还有很多空间</strong>，但模型已经开始"忘记"中间的细节了。
          </p>
        </div>

        {/* ── Lost in the Middle ── */}
        <h3
          className="text-xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          "Lost in the Middle" 效应
        </h3>

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          大量研究表明，LLM 对上下文的注意力分布呈 U 形曲线：
        </p>

        <CodeBlock
          language="bash"
          title="attention-distribution.txt"
          code={`注意力权重分布 (示意):

高 ████                                            ████
   ████                                            ████
   ████                                            ████
   ████░░                                        ░░████
   ████░░░░                                    ░░░░████
   ████░░░░░░░░                            ░░░░░░░░████
低 ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████
   ┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
   开头                    中间                      末尾
   (CLAUDE.md)        (早期对话内容)          (最近的消息)

   Primacy Effect              ↑              Recency Effect
   CLAUDE.md 在此         这里的信息         你最后说的话
   享有高权重             最容易被"忽略"       权重最高`}
        />

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          这就是为什么<strong style={{ color: 'var(--color-text-primary)' }}> CLAUDE.md 的位置如此重要</strong>——它被注入在上下文的早期部分，享有 primacy effect 的加成。同时也解释了为什么你的最新一条消息效果最好：recency effect。而第 3 轮到第 15 轮之间的对话内容？它们正在"中间地带"中逐渐失去影响力。
        </p>

        <div
          className="p-4 rounded-lg"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <p
            className="text-sm font-medium mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            你可以亲自验证：
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            在一个长会话中（15+ 轮对话后），重新提及你在第 2-3 轮对话中讨论过的架构决策。观察 Claude 是否能准确回忆细节。大多数情况下，它会给出模糊或不完整的回答——这就是 "Lost in the Middle" 的直接体现。
          </p>
        </div>

        {/* ── 决策框架 ── */}
        <h3
          className="text-xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          上下文管理决策框架
        </h3>

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          当你感觉 Claude 的回答质量在下降，使用这个决策树：
        </p>

        <CodeBlock
          language="bash"
          title="context-decision-tree.txt"
          code={`上下文使用率 > 60%?
  ├── 是 → 当前任务还需要之前的上下文?
  │       ├── 是 → 执行 /compact (压缩但保留核心)
  │       └── 否 → 执行 /clear (清空重新开始)
  │
  └── 否 → 但质量在下降?
          ├── 是 → 你在做和开始时不同的任务?
          │       ├── 是 → 开新会话 (可选: 写 HANDOFF.md 交接)
          │       └── 否 → 关键信息可能在"中间地带"
          │               → 在最新消息中重新陈述关键约束
          │
          └── 否 → 继续正常工作

特殊情况:
  需要处理超大文件?  → 考虑使用 1M context 模型 (如 claude-opus-4-5)
  团队共享上下文?    → 把关键决策写入 CLAUDE.md 而非依赖对话记忆`}
        />

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          你还可以通过环境变量精确控制自动压缩的触发时机：
        </p>

        <CodeBlock
          language="bash"
          title="terminal"
          code={`# 默认在 95-98% 时触发自动压缩
# 如果你想更早触发（比如 70%），设置:
export CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=70

# 建议: 对于质量敏感的任务（代码审查、架构设计），
# 设为 60-70% 以保持更高的回答质量`}
        />

        <QualityCallout title="质量线: 上下文 = 成本">
          <p className="mb-2">
            上下文管理直接关联真金白银。根据实际使用数据：
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>日均成本约 <strong>$6/人</strong>（假设 90%+ 的请求命中 prompt cache）</li>
            <li>如果 cache 命中率下降到 50%，成本会<strong>翻倍到 $12/人</strong></li>
            <li>不必要的大文件 Read 是最常见的成本浪费——用 Grep 替代可节省 80%+ token</li>
            <li>auto-compact 本身也消耗 token（需要 LLM 生成摘要），频繁触发 = 额外成本</li>
          </ul>
          <p className="mt-2">
            经济规则：<strong style={{ color: 'var(--color-text-primary)' }}>最小化输入 token，最大化 cache 命中率，主动管理上下文生命周期</strong>。
          </p>
        </QualityCallout>

        {/* ── 失败案例 ── */}
        <h3
          className="text-xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          失败案例: 一个会话做五件不相关的事
        </h3>

        <div
          className="p-4 rounded-lg space-y-3"
          style={{
            background: 'rgba(248, 113, 113, 0.05)',
            border: '1px solid rgba(248, 113, 113, 0.2)',
          }}
        >
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <strong style={{ color: 'var(--color-text-primary)' }}>场景</strong>：一位开发者在同一个 Claude Code 会话中依次完成了：(1) 修复一个 API bug，(2) 添加一个新的数据库迁移，(3) 重构认证模块，(4) 编写 CI 配置，(5) 更新 README。
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <strong style={{ color: 'var(--color-text-primary)' }}>结果</strong>：在第 4 个任务时触发了 auto-compact。压缩过程中，第 1 个任务中关于 API 错误处理的关键架构决策被丢失。第 5 个任务的 README 更新中，Claude 对 API 的描述与实际实现不一致。
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <strong style={{ color: 'var(--color-text-primary)' }}>教训</strong>：auto-compact 的压缩率是 60-80%，意味着会丢失 20-40% 的信息。当你在一个会话中堆积不相关的任务时，每次压缩都会优先保留最近任务的上下文，早期任务的细节会被逐步蒸发。<strong style={{ color: 'var(--color-text-primary)' }}>一个任务一个会话</strong>是最安全的实践。
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          Section 0.3: 模型、工具与权限
          ═══════════════════════════════════════════════════════ */}
      <section className="space-y-8">
        <h2
          className="text-2xl font-bold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          0.3 模型、工具与权限
        </h2>

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          很多人以为"选了 Opus 就全程用 Opus"。事实比这复杂得多——Claude Code 内部运行着多个模型，各司其职。同时，工具系统和权限系统共同构成了一个你必须理解的安全边界。
        </p>

        {/* ── 模型路由 ── */}
        <h3
          className="text-xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          模型路由: 不止一个模型在工作
        </h3>

        <CodeBlock
          language="bash"
          title="model-routing.txt"
          code={`你选择的模型 (Sonnet / Opus)
  └── 用于: 主推理、代码生成、对话回复

Haiku (自动调用，不可配置)
  └── 用于:
      ├── Bash 命令安全分析 (两阶段风险评估)
      ├── Explore 子代理 (Agent tool 的底层模型)
      ├── WebFetch 内容摘要
      └── 会话摘要生成 (auto-compact 时)

实际影响:
  选择 Opus 不会让安全分析更准确 (Haiku 固定)
  选择 Sonnet 不会让安全分析变差 (同样用 Haiku)
  你的模型选择只影响"主推理"这一条线路`}
        />

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          这个设计有明确的工程原因：Haiku 的推理速度远快于 Opus/Sonnet，而安全分析需要在每次 Bash 调用时低延迟完成。如果用 Opus 做安全分析，每次 <code style={{ color: 'var(--color-accent)' }}>ls</code> 命令都要等好几秒。
        </p>

        {/* ── 工具集 ── */}
        <h3
          className="text-xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          完整工具集与能力边界
        </h3>

        <CodeBlock
          language="bash"
          title="tool-capabilities.txt"
          code={`工具        能力                          成本        风险等级
────────────────────────────────────────────────────────────────
Read        读取文件全部内容               高 (全文)    低
Edit        精确修改文件 (搜索-替换)       低 (仅diff)  中
Write       创建/覆写文件                  中 (全文)    高
Bash        执行任意 shell 命令            固定245t     ⚠️ 最高
Grep        正则搜索文件内容               低 (匹配行)  低
Glob        按模式匹配文件路径             极低         低
Agent       启动子代理执行复杂任务         高 (乘数)    中
Skill       调用预定义技能                 变量         低

⚠️ Bash 是唯一可以执行任意代码的工具
   它的风险不在于 token 成本，而在于它能做任何事`}
        />

        {/* ── 权限安全模型 ── */}
        <h3
          className="text-xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          权限安全模型: deny → ask → allow
        </h3>

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          权限验证永远按照<strong style={{ color: 'var(--color-text-primary)' }}> deny → ask → allow </strong>的严格顺序执行，不可跳过，不可逆转。如果一个操作匹配了 deny 规则，即使后面有 allow 规则也无效。
        </p>

        <CodeBlock
          language="bash"
          title="permission-evaluation-order.txt"
          code={`操作请求: Edit("src/config/database.ts")

第1步: 检查 deny 规则
  ├── 匹配? → 直接拒绝，流程结束
  └── 不匹配 → 继续

第2步: 检查 ask 规则
  ├── 匹配? → 弹窗询问用户确认
  └── 不匹配 → 继续

第3步: 检查 allow 规则
  ├── 匹配? → 直接放行
  └── 不匹配 → 默认行为 (通常是 ask)

权限来源优先级 (高 → 低):
  1. Managed Policy  (组织级，API 下发)
  2. CLI 参数        (--allowedTools, --deniedTools)
  3. Local settings  (.claude/settings.local.json)
  4. Shared settings (.claude/settings.json, 可 git commit)
  5. User settings   (~/.claude/settings.json)`}
        />

        {/* ── 致命盲区 ── */}
        <h3
          className="text-xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          致命盲区: Read/Edit deny 挡不住 Bash
        </h3>

        <div
          className="p-5 rounded-lg"
          style={{
            background: 'rgba(248, 113, 113, 0.08)',
            border: '1px solid rgba(248, 113, 113, 0.3)',
          }}
        >
          <p
            className="text-base font-semibold mb-3"
            style={{ color: 'rgb(248, 113, 113)' }}
          >
            CRITICAL BLINDSPOT
          </p>
          <p
            className="text-sm leading-relaxed mb-3"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <code>Read</code> 和 <code>Edit</code> 的 deny 规则<strong style={{ color: 'var(--color-text-primary)' }}>不会阻止 Bash 命令</strong>。这意味着：
          </p>
          <CodeBlock
            language="bash"
            title="security-blindspot-demo.txt"
            code={`# 你以为安全了:
deny: ["Read(.env)", "Edit(.env)"]

# 但 Claude 仍然可以:
Bash("cat .env")           # ✅ 绕过 Read deny
Bash("sed -i 's/old/new/' .env")  # ✅ 绕过 Edit deny
Bash("cp .env /tmp/leak")  # ✅ 完全不受限制

# 正确的防御:
deny: [
  "Read(.env)",
  "Edit(.env)",
  "Bash(cat .env)",
  "Bash(*\.env*)"          # 通配符匹配所有涉及 .env 的命令
]`}
          />
          <p
            className="text-sm leading-relaxed mt-3"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            这个盲区的根本原因：Read/Edit/Bash 是<strong style={{ color: 'var(--color-text-primary)' }}>独立的工具</strong>，deny 规则按工具名匹配。Bash 工具的 deny 需要<strong>单独配置</strong>。
          </p>
        </div>

        {/* ── 权限分级建议 ── */}
        <h3
          className="text-xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          按熟练度分级的权限配置
        </h3>

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          权限应该按<strong style={{ color: 'var(--color-text-primary)' }}>使用者的实际熟练度</strong>配置，而不是按职位头衔。一位 Staff Engineer 如果第一天使用 Claude Code，应该用 L1 配置：
        </p>

        <CodeBlock
          language="json"
          title=".claude/settings.json — L1 基础配置"
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
      "Bash(*)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(*sudo*)",
      "Bash(*> /dev/*)"
    ]
  }
}`}
        />

        <CodeBlock
          language="json"
          title=".claude/settings.json — L2 进阶配置"
          code={`{
  "permissions": {
    "allow": [
      "Read(*)",
      "Grep(*)",
      "Glob(*)",
      "Edit(src/**)",
      "Edit(tests/**)",
      "Bash(npm test*)",
      "Bash(npm run lint*)",
      "Bash(git status)",
      "Bash(git diff*)"
    ],
    "ask": [
      "Write(*)",
      "Bash(*)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(*sudo*)",
      "Bash(git push*)",
      "Bash(*> /dev/*)",
      "Edit(*.env*)",
      "Bash(*\.env*)"
    ]
  }
}`}
        />

        <CodeBlock
          language="json"
          title=".claude/settings.json — L3 高阶配置"
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
      "Bash(git *)",
      "Bash(ls *)",
      "Bash(cat *)",
      "Bash(find *)",
      "Bash(grep *)"
    ],
    "ask": [
      "Write(*)",
      "Bash(*)"
    ],
    "deny": [
      "Bash(rm -rf /)",
      "Bash(*sudo*)",
      "Bash(*--no-preserve-root*)",
      "Bash(*> /dev/*)",
      "Bash(git push --force*)",
      "Edit(*.env*)",
      "Bash(*\.env*)"
    ]
  }
}`}
        />

        <QualityCallout title="质量线: 组织级安全治理">
          <p className="mb-2">
            对于使用组织账户的团队，<strong style={{ color: 'var(--color-text-primary)' }}>Managed Policy</strong> 是最高优先级的安全层——开发者无法覆盖。这提供了：
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>组织级 deny 规则（如禁止访问生产数据库连接字符串）</li>
            <li>强制的 ask 规则（如所有 Write 操作必须确认）</li>
            <li>审计日志</li>
          </ul>
          <p className="mt-2">
            没有组织账户的团队可以通过 <strong style={{ color: 'var(--color-text-primary)' }}>git-committed 的 <code>.claude/settings.json</code></strong> + 项目 CLAUDE.md 实现类似约束。这些文件被 git 追踪，团队成员的修改可审查，提供了"穷人版 Managed Policy"的效果。
          </p>
        </QualityCallout>

        {/* ── 失败案例 ── */}
        <h3
          className="text-xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          失败案例: Auto 模式下的 .env 删除事件
        </h3>

        <div
          className="p-4 rounded-lg space-y-3"
          style={{
            background: 'rgba(248, 113, 113, 0.05)',
            border: '1px solid rgba(248, 113, 113, 0.2)',
          }}
        >
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <strong style={{ color: 'var(--color-text-primary)' }}>场景</strong>：一位开发者在 auto-accept 模式（<code>--dangerously-skip-permissions</code> 或 shift+tab 两次进入 auto-accept）下对 Claude 说："清理项目中不需要的文件，保持仓库整洁。"
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <strong style={{ color: 'var(--color-text-primary)' }}>结果</strong>：Claude 将 <code>.env</code> 文件判断为"不应该被提交到仓库的文件"（技术上是对的——.env 不该被 commit），于是删除了它。本地开发环境的所有环境变量丢失。
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <strong style={{ color: 'var(--color-text-primary)' }}>根因分析</strong>：(1) 指令 "不需要的文件" 含义模糊；(2) Auto 模式跳过了所有 ask 确认；(3) 没有 deny 规则保护 .env 文件。三个防线同时失效。
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <strong style={{ color: 'var(--color-text-primary)' }}>预防</strong>：(1) 给出精确指令："删除 dist/ 和 node_modules/ 目录"；(2) 在 deny 规则中保护关键文件；(3) 即使使用 auto 模式也保留对删除操作的 ask。
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          Section 0.4: 市场位置与能力边界
          ═══════════════════════════════════════════════════════ */}
      <section className="space-y-8">
        <h2
          className="text-2xl font-bold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          0.4 市场位置与能力边界
        </h2>

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          在学习一个工具之前，诚实地了解它能做什么、不能做什么，比任何技巧都重要。这一节不是营销——是基于公开数据的客观分析。
        </p>

        {/* ── 定位对比 ── */}
        <h3
          className="text-xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Delegator vs Accelerator
        </h3>

        <CodeBlock
          language="bash"
          title="tool-positioning.txt"
          code={`AI 编程工具的两种范式:

Delegator (委托者) — "替你做"
  ├── Claude Code
  ├── Devin
  └── 特点: 接受任务描述 → 自主规划 → 独立执行 → 交付结果
      适合: 完整功能开发、重构、探索性任务
      风险: 自主性越高，偏离正确方向的可能性越大

Accelerator (加速器) — "帮你更快"
  ├── GitHub Copilot
  ├── Cursor
  └── 特点: 你写代码 → 它实时补全/建议 → 你决定是否采纳
      适合: 日常编码、已知模式的快速实现
      风险: 补全可能引入微妙错误，但偏离范围有限

关键区别:
  Accelerator 的 blast radius (影响半径) 是当前文件/函数
  Delegator 的 blast radius 是整个项目`}
        />

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Claude Code 选择了 Delegator 路线。这意味着它的上限更高（可以独立完成复杂任务），但<strong style={{ color: 'var(--color-text-primary)' }}>底线也更低</strong>——当它犯错时，影响范围可能是整个项目，而不只是一行代码。
        </p>

        {/* ── 诚实的能力边界 ── */}
        <h3
          className="text-xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          诚实的能力边界
        </h3>

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          以下数字来自公开的研究和行业报告，不是臆测：
        </p>

        <CodeBlock
          language="bash"
          title="ai-code-quality-data.txt"
          code={`来源                   发现
──────────────────────────────────────────────────────────────
CodeRabbit 2024       AI 生成代码的 bug 率是人类代码的 1.7 倍
GitClear 2024         AI 辅助后代码重复率增长 8 倍
                      "churn code" (写完很快要改的代码) 显著增加
Stanford/UIUC 2023    AI 生成代码中 48% 包含安全漏洞
                      使用 AI 的开发者反而更相信自己代码是安全的
Snyk 2024             开源项目中 AI 生成的代码引入了新类别的漏洞

关键理解:
  这不是说 "AI 没用" —— 而是说 AI 生成的代码
  需要比人类代码 *更严格* 的审查，而不是更宽松`}
        />

        <div
          className="p-4 rounded-lg"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <p
            className="text-sm font-medium mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            你可以亲自验证：
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            让 Claude Code 为你写一个中等复杂度的功能（如带参数验证的 REST API endpoint），然后逐行审查生成的代码。统计你发现了多少处需要修改的地方——类型不够严格、边界条件遗漏、错误处理不完整等。这个数字就是你的"审查基准线"。
          </p>
        </div>

        {/* ── 生产事故 ── */}
        <h3
          className="text-xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          生产事故: 当人类审查缺席时
        </h3>

        <div
          className="p-4 rounded-lg space-y-4"
          style={{
            background: 'rgba(248, 113, 113, 0.05)',
            border: '1px solid rgba(248, 113, 113, 0.2)',
          }}
        >
          <div>
            <p
              className="text-sm font-semibold mb-1"
              style={{ color: 'var(--color-text-primary)' }}
            >
              事故 1: Amazon AWS 代理删除环境
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              AI 代理在自动化部署中误判环境状态，删除了生产环境资源，导致 <strong>15 小时</strong>的服务中断。根因：代理的"清理"逻辑没有区分测试环境和生产环境，且没有人类确认步骤。
            </p>
          </div>

          <div>
            <p
              className="text-sm font-semibold mb-1"
              style={{ color: 'var(--color-text-primary)' }}
            >
              事故 2: 支付系统 AI 移除熔断器
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              AI 在重构支付处理模块时，将 circuit breaker（熔断器）代码判定为"冗余的错误处理"并移除。当下游支付网关出现故障时，系统无限重试，最终造成 <strong>$2.8B</strong> 的重复扣款。根因：AI 不理解熔断器的防御性设计意图，且代码审查流程被绕过。
            </p>
          </div>

          <div
            className="p-3 rounded-md"
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <p
              className="text-sm font-semibold mb-1"
              style={{ color: 'var(--color-text-primary)' }}
            >
              共同根因: 零人类审查
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              每一起严重事故的背后，都有同一个模式——AI 的输出被直接应用到生产环境，没有经过人类审查。不是 AI "太笨"，而是流程中缺少了<strong style={{ color: 'var(--color-text-primary)' }}>必要的人类判断节点</strong>。
            </p>
          </div>
        </div>

        {/* ── 本教程的立场 ── */}
        <h3
          className="text-xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          本教程的立场
        </h3>

        <div
          className="p-5 rounded-lg"
          style={{
            background: 'rgba(217, 119, 87, 0.06)',
            border: '1px solid rgba(217, 119, 87, 0.25)',
          }}
        >
          <p
            className="text-base leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            本教程同时教你<strong style={{ color: 'var(--color-text-primary)' }}>如何使用</strong>和<strong style={{ color: 'var(--color-text-primary)' }}>如何确保正确使用</strong>。每一个"怎样让 Claude 做 X"的技巧背后，都有一个"怎样验证 X 被正确完成"的检查点。这不是保守——这是工程纪律。
          </p>
          <p
            className="text-sm leading-relaxed mt-3"
            style={{ color: 'var(--color-text-muted)' }}
          >
            一个好的 AI 用户不是能让 AI 产出最多代码的人，而是能让 AI 产出的<strong style={{ color: 'var(--color-text-secondary)' }}>每一行代码都可靠</strong>的人。
          </p>
        </div>

        <QualityCallout title="质量线: 能力边界意识">
          <p>
            理解 AI 的能力边界不是悲观主义——而是<strong style={{ color: 'var(--color-text-primary)' }}>风险管理的基础</strong>。具体来说：
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>AI 生成的代码需要<strong>更严格</strong>的审查，而非更宽松</li>
            <li>Delegator 模式（Claude Code）的影响半径是整个项目——需要匹配相应的防护措施</li>
            <li>每一个自动化步骤都应该有对应的验证步骤</li>
            <li>当 AI 说"我已完成"时，你的工作<strong>才刚开始</strong>（审查、测试、验证）</li>
          </ul>
        </QualityCallout>
      </section>

      {/* ═══════════════════════════════════════════════════════
          Exercises
          ═══════════════════════════════════════════════════════ */}
      <section className="space-y-8">
        <h2
          className="text-2xl font-bold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          章节练习
        </h2>

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          以下练习帮助你将本章的概念从"读过"变成"验证过"。从 L1 开始，每个级别都建立在前一个级别的经验之上。
        </p>

        <ExerciseCard
          tier="l1"
          title="观察 Token 消耗"
          description="打开 Claude Code，依次读取项目中的 3 个文件（选择不同大小的文件）。每次读取后运行 /cost 和 /context 命令，记录 input tokens、output tokens、上下文使用率的变化。"
          checkpoints={[
            '记录了 3 次 /cost 输出，能说出每次读取增加了多少 input tokens',
            '记录了 3 次 /context 输出，能说出上下文使用率从多少增长到多少',
            '能回答：读取一个 500 行文件大约消耗多少 tokens？',
          ]}
        />

        <ExerciseCard
          tier="l2"
          title="Read vs Grep 效率对比"
          description="在你自己的项目中，找到最大的源代码文件。先用 Read 读取整个文件，记录 token 成本；然后在新会话中用 Grep 搜索该文件中的某个函数名，记录 token 成本。对比两者的差异。"
          checkpoints={[
            '记录了 Read 整个文件的 token 成本',
            '记录了 Grep 搜索同一文件的 token 成本',
            '计算出倍数差异（预期: Read 成本约为 Grep 的 10-20 倍）',
            '能解释在什么场景下应该优先使用 Grep 而非 Read',
          ]}
        />

        <ExerciseCard
          tier="l3"
          title="设计 1 小时 Token 预算"
          description="基于本章的数据，为一个 1 小时的 Claude Code 工作会话设计 token 预算。估算：你能进行多少次文件读取、多少次搜索、多少轮对话，才能保持在 167K token 的可用容量内且质量不显著下降（记住 20-40% 注意力稀释阈值）。"
          checkpoints={[
            '给出了具体的预算分配表（文件读取 N 次、搜索 M 次、对话 K 轮）',
            '解释了为什么实际预算目标应该是 ~67K tokens（40%）而非 167K',
            '包含了 auto-compact 的触发策略（何时手动 /compact，何时开新会话）',
            '给出了 CLAUDE_AUTOCOMPACT_PCT_OVERRIDE 的推荐值及理由',
          ]}
        />
      </section>

      {/* ═══════════════════════════════════════════════════════
          Chapter Summary
          ═══════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <h2
          className="text-2xl font-bold"
          style={{ color: 'var(--color-text-primary)' }}
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
          <ul
            className="space-y-3 text-sm leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <li>
              <strong style={{ color: 'var(--color-text-primary)' }}>请求链路</strong>：从输入到回复经过 10+ 个阶段，每个阶段都是可审计的拦截点。System Prompt 由 7 层优先级动态组装。
            </li>
            <li>
              <strong style={{ color: 'var(--color-text-primary)' }}>上下文经济学</strong>：200K 实际可用 167K，但质量下降从 20-40% 就开始了。"Lost in the Middle" 意味着 CLAUDE.md（开头）和最新消息（末尾）的权重最高。
            </li>
            <li>
              <strong style={{ color: 'var(--color-text-primary)' }}>模型与权限</strong>：你选择的模型只用于主推理；Haiku 自动处理安全分析等辅助任务。权限按 deny → ask → allow 严格排序，但 Read/Edit deny 不阻止 Bash——这是最常被忽略的安全盲区。
            </li>
            <li>
              <strong style={{ color: 'var(--color-text-primary)' }}>能力边界</strong>：Claude Code 是 Delegator 模式，影响半径是整个项目。AI 代码 bug 率 1.7x 人类、48% 含安全漏洞——这要求更严格而非更宽松的审查。
            </li>
          </ul>
        </div>

        <p
          className="text-sm"
          style={{ color: 'var(--color-text-muted)' }}
        >
          下一章: <strong style={{ color: 'var(--color-text-secondary)' }}>Chapter 1 — Prompt 精确控制</strong>。你将学习如何写出结构化的工程级 Prompt，掌握权重词、约束语和 Token 效率优化。
        </p>
      </section>
    </div>
  )
}
