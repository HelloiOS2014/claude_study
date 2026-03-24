import { CodeBlock } from '../../components/content/CodeBlock'
import { PromptCompare } from '../../components/content/PromptCompare'
import { QualityCallout } from '../../components/content/QualityCallout'
import { ExerciseCard } from '../../components/content/ExerciseCard'
import { ConfigExample } from '../../components/content/ConfigExample'

export default function Ch01() {
  return (
    <div className="space-y-8">
      {/* ================================================================ */}
      {/* Chapter Intro                                                     */}
      {/* ================================================================ */}
      <section>
        <p className="text-lg leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          大多数人使用 Claude Code 的方式是："帮我写一个 XX"。这就像你雇了一个世界级工程师，然后只让他搬砖。
          这一章我们要做的事情，是把"对话"升级为"精确控制"——让你从模糊地描述需求，变成像写合同一样精准地指挥 AI。
        </p>
        <p className="text-base leading-relaxed mt-4" style={{ color: 'var(--color-text-muted)' }}>
          你将学会：如何让同一个任务的 prompt 从"能跑就行"进化到"产出可预测的工程级代码"；
          如何用特殊权重词和结构化协议让 Claude 严格遵循指令；如何在不牺牲质量的前提下将 token 消耗减半；
          以及当对话变长、Claude 开始"遗忘"时，如何诊断和修复。
        </p>
      </section>

      {/* ================================================================ */}
      {/* 1.1 Prompt 解剖实验室                                             */}
      {/* ================================================================ */}
      <section>
        <h2
          className="text-2xl font-bold mb-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          1.1 Prompt 解剖实验室
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
          同一个任务——"优化这段代码的性能"——五种不同的写法，从最差到最好。
          我们逐字分析每一个 prompt 为什么有效或无效。
        </p>

        {/* ── Level 1: No Constraints ── */}
        <h3
          className="text-lg font-semibold mb-3 mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Level 1：零约束（"帮我做就行"）
        </h3>
        <CodeBlock
          code="优化这段代码"
          language="markdown"
          title="prompt-level-1.md"
        />
        <div className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <p><strong>逐词分析：</strong></p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>"优化"</strong> —— 优化什么？性能？可读性？内存？包大小？Claude 只能猜。</li>
            <li><strong>"这段代码"</strong> —— 哪段代码？没有用 @ 引用文件，Claude 需要自己搜索，浪费 token 且可能找错。</li>
            <li>没有成功标准、没有约束、没有输出格式。Claude 可能改了你完全不想动的代码。</li>
          </ul>
          <p className="mt-2">
            <strong>结果：</strong>Claude 会给你一个"看起来不错"但不可预测的修改。你需要花更多时间 review，可能还要来回几轮。
          </p>
        </div>

        {/* ── Level 2: Vague Direction ── */}
        <h3
          className="text-lg font-semibold mb-3 mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Level 2：模糊方向
        </h3>
        <CodeBlock
          code="优化 @src/utils/parser.ts 的性能，运行太慢了"
          language="markdown"
          title="prompt-level-2.md"
        />
        <div className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <p><strong>逐词分析：</strong></p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>"@src/utils/parser.ts"</strong> —— 好：精确定位了文件，Claude 不用搜索，省 token。</li>
            <li><strong>"性能"</strong> —— 缩小了"优化"的范围，但仍然不明确：CPU 密集型优化？IO 优化？启动速度？</li>
            <li><strong>"运行太慢了"</strong> —— 主观描述。多慢算慢？现在跑多久？目标是多久？</li>
          </ul>
          <p className="mt-2">
            <strong>结果：</strong>Claude 大概率会做一些通用优化（缓存、减少循环嵌套），但可能不会命中你真正的瓶颈。
          </p>
        </div>

        <PromptCompare
          bad={{
            prompt: "优化这段代码",
            explanation: "没有目标文件、没有优化方向、没有成功标准。Claude 只能进行通用的、不可预测的修改。"
          }}
          good={{
            prompt: "优化 @src/utils/parser.ts 的性能，运行太慢了",
            explanation: "指定了文件和方向（性能），但缺乏量化目标。Claude 知道该看哪里，却不知道该做到什么程度。"
          }}
        />

        {/* ── Level 3: Specific Metrics ── */}
        <h3
          className="text-lg font-semibold mb-3 mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Level 3：明确指标
        </h3>
        <CodeBlock
          code={`优化 @src/utils/parser.ts 的 parseDocument 函数。
当前处理 10MB JSON 需要 8 秒，目标降到 2 秒以内。
主要瓶颈是嵌套 for 循环中的重复字符串拼接。`}
          language="markdown"
          title="prompt-level-3.md"
        />
        <div className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <p><strong>逐词分析：</strong></p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>"parseDocument 函数"</strong> —— 精确到函数级别，Claude 知道修改范围。</li>
            <li><strong>"10MB JSON 需要 8 秒"</strong> —— 量化了当前状态，Claude 可以评估优化幅度。</li>
            <li><strong>"目标降到 2 秒以内"</strong> —— 明确的成功标准，4x 提速。Claude 知道小优化不够，需要算法级改动。</li>
            <li><strong>"嵌套 for 循环中的重复字符串拼接"</strong> —— 你指出了瓶颈位置，Claude 不用猜。</li>
          </ul>
          <p className="mt-2">
            <strong>结果：</strong>Claude 会聚焦于字符串拼接优化（StringBuilder/数组 join）和循环结构重构。产出的代码有方向性。
          </p>
        </div>

        {/* ── Level 4: Structured Steps ── */}
        <h3
          className="text-lg font-semibold mb-3 mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Level 4：结构化步骤
        </h3>
        <CodeBlock
          code={`优化 @src/utils/parser.ts 的 parseDocument 函数性能。

## 当前状况
- 输入：10MB JSON 文件
- 当前耗时：8 秒
- 瓶颈：第 47-89 行的嵌套循环，重复 string concat

## 目标
- 耗时降到 2 秒以内
- 内存峰值不超过 200MB

## 约束
- 不改变函数签名和返回值类型
- 保持现有的 30 个单元测试全部通过
- 不引入新的依赖包

## 步骤
1. 先分析当前代码，列出所有性能瓶颈点
2. 针对每个瓶颈点提出优化方案，不要直接改代码
3. 我确认方案后再执行修改`}
          language="markdown"
          title="prompt-level-4.md"
        />
        <div className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <p><strong>逐词分析：</strong></p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>"内存峰值不超过 200MB"</strong> —— 多维约束。防止 Claude 用空间换时间把内存搞爆。</li>
            <li><strong>"不改变函数签名和返回值类型"</strong> —— 防止 Claude "顺手"重构接口导致下游代码全部报错。</li>
            <li><strong>"保持现有的 30 个单元测试全部通过"</strong> —— 可验证的质量标准。</li>
            <li><strong>"先分析...不要直接改代码...我确认后再执行"</strong> —— 分阶段执行，你保留了审批权。</li>
          </ul>
          <p className="mt-2">
            <strong>结果：</strong>Claude 会先输出分析报告，等你确认后才动手。修改范围可控，质量可预测。
          </p>
        </div>

        <PromptCompare
          bad={{
            prompt: "优化 @src/utils/parser.ts 的性能，运行太慢了",
            explanation: "有方向但没有量化标准。Claude 不知道做到什么程度算完成，可能过度优化或优化不足。"
          }}
          good={{
            prompt: "优化 parseDocument 函数。当前 10MB JSON 耗时 8 秒，目标 2 秒内。瓶颈在第 47-89 行嵌套循环的字符串拼接。不改函数签名，不加新依赖，先分析后执行。",
            explanation: "量化目标 + 瓶颈定位 + 约束边界 + 分步执行。Claude 的行为空间被精确限定，产出可预测。"
          }}
        />

        {/* ── Level 5: Full Contract ── */}
        <h3
          className="text-lg font-semibold mb-3 mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Level 5：完整合同（Contract-Style Prompt）
        </h3>
        <CodeBlock
          code={`<task>
优化 @src/utils/parser.ts 中 parseDocument 函数的运行时性能
</task>

<context>
- 该函数处理从 API 返回的 JSON 日志数据，每次调用处理 5-15MB
- 当前 10MB 输入耗时 8 秒，用户可感知的卡顿发生在仪表盘加载时
- 已知瓶颈：第 47-89 行嵌套循环中的字符串拼接（占总耗时 70%）
- 此函数被 6 个下游模块调用，签名变更代价极高
</context>

<role>
你是一个专注性能优化的高级工程师。你偏好零分配（zero-allocation）
策略和流式处理，但会权衡可读性和维护成本。
</role>

<success_criteria>
1. 10MB 输入耗时 ≤ 2 秒（4x 提速）
2. 内存峰值 ≤ 200MB（当前约 350MB）
3. 函数签名和返回类型不变
4. 现有 30 个单元测试全部通过，不修改测试
5. 不引入新的 npm 依赖
</success_criteria>

<constraints>
- NEVER 修改 parseDocument 的函数签名
- NEVER 修改 tests/ 目录下任何文件
- 仅修改 src/utils/parser.ts 这一个文件
- 如果某个优化需要修改其他文件，先停下来告诉我
</constraints>

<uncertainty_handling>
- 如果某个优化手段无法确定是否能达到目标，先说明预期收益和风险
- 如果发现瓶颈不在第 47-89 行而在其他位置，先报告再行动
- 对于任何不确定的技术决策，问我而不是自行判断
</uncertainty_handling>

<output_format>
## Phase 1: 分析（先做这步，等我确认）
- 列出所有瓶颈点及各自占总耗时的估算比例
- 每个瓶颈给出 1-2 个优化方案，标注预期收益

## Phase 2: 执行（我确认后）
- 逐个瓶颈点执行优化
- 每改完一个瓶颈就运行测试确认

## Phase 3: 验证
- 给出优化前后的性能对比（伪代码 benchmark）
- 列出可能的回归风险点
</output_format>`}
          language="xml"
          title="prompt-level-5.xml"
          highlightLines={[1, 5, 12, 17, 24, 31, 37]}
        />
        <div className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <p><strong>完整合同的核心结构：</strong></p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>&lt;task&gt;</strong> —— 一句话说清楚要做什么。这是 Claude 的"北极星"。</li>
            <li><strong>&lt;context&gt;</strong> —— 背景信息。让 Claude 理解 WHY，而不仅仅是 WHAT。</li>
            <li><strong>&lt;role&gt;</strong> —— 设定专业领域和偏好。影响 Claude 选择方案的方向。</li>
            <li><strong>&lt;success_criteria&gt;</strong> —— 量化的完成标准。每一条都是可验证的。</li>
            <li><strong>&lt;constraints&gt;</strong> —— 绝对不可触碰的红线。使用 NEVER 等权重词。</li>
            <li><strong>&lt;uncertainty_handling&gt;</strong> —— Claude 遇到不确定情况时的行为协议。这是防止"幻觉"的关键。</li>
            <li><strong>&lt;output_format&gt;</strong> —— 多阶段输出模板。你控制每一步的审批节奏。</li>
          </ul>
        </div>

        <PromptCompare
          bad={{
            prompt: "优化 @src/utils/parser.ts 的 parseDocument 函数性能。\n当前 10MB 需 8 秒，目标 2 秒。瓶颈在嵌套循环的字符串拼接。\n不改函数签名。先分析再执行。",
            explanation: "已经不错了——有目标、有瓶颈、有约束、有步骤。但缺乏异常处理协议：如果瓶颈不在你说的位置怎么办？如果优化需要改其他文件怎么办？"
          }}
          good={{
            prompt: "<task>优化 parseDocument 性能</task>\n<success_criteria>10MB ≤ 2s, 内存 ≤ 200MB</success_criteria>\n<constraints>NEVER 改签名/测试/其他文件</constraints>\n<uncertainty_handling>不确定就问我</uncertainty_handling>\n<output_format>Phase 1 分析 → 确认 → Phase 2 执行</output_format>",
            explanation: "完整合同：明确的 XML 语义边界 + 量化标准 + NEVER 红线 + 不确定性处理协议 + 分阶段输出。Claude 的行为被精确定义，几乎消除了意外。"
          }}
        />

        <QualityCallout>
          从 Level 1 到 Level 5，prompt 的长度增加了 20 倍，但你获得的是：可预测的输出、可验证的质量、可控的修改范围。
          写一个好 prompt 花 5 分钟，省的是 30 分钟的 review 和来回修改时间。
          <strong> 这就是"精确控制"的含义——你付出的是 prompt 时间，回报的是确定性。</strong>
        </QualityCallout>
      </section>

      {/* ================================================================ */}
      {/* 1.2 特殊权重词与结构化技巧                                         */}
      {/* ================================================================ */}
      <section>
        <h2
          className="text-2xl font-bold mb-2 mt-16"
          style={{ color: 'var(--color-text-primary)' }}
        >
          1.2 特殊权重词与结构化技巧
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
          Claude 对某些词汇有特殊的"权重"响应。用对了，一个词抵十句话。
        </p>

        {/* ── Keyword Weight System ── */}
        <h3
          className="text-lg font-semibold mb-3"
          style={{ color: 'var(--color-text-primary)' }}
        >
          权重词层级
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          在 CLAUDE.md 和日常 prompt 中，以下关键词的执行权重从高到低：
        </p>

        <CodeBlock
          code={`# 权重等级（从高到低）

## S 级：近乎绝对遵守
NEVER   → "NEVER modify tests/ directory"    # 硬禁止，Claude 几乎不会违反
MUST    → "MUST run tests before committing"  # 硬要求，跳过概率极低
ALWAYS  → "ALWAYS use TypeScript strict mode" # 持续性要求

## A 级：高度遵守（偶尔在长对话中衰减）
CRITICAL → "CRITICAL: preserve backward compatibility"
IMPORTANT → "IMPORTANT: follow existing naming conventions"

## B 级：一般遵守（可能被其他指令覆盖）
should   → "should prefer composition over inheritance"
recommend → "recommend using early returns"

## C 级：建议（Claude 可能自行判断是否采用）
consider → "consider using a cache here"
prefer   → "prefer functional style"`}
          language="bash"
          title="keyword-weight-hierarchy.md"
          highlightLines={[3, 4, 5, 6, 9, 10, 13, 14, 17, 18]}
        />

        <div className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <p>
            <strong>关键发现：</strong>在 CLAUDE.md 中使用全大写的 NEVER / MUST / ALWAYS，
            相比小写的 should / recommend，Claude 的遵守率差异显著。特别是在长对话中——
            当上下文窗口接近饱和时，低权重词最先被"遗忘"，而 NEVER/MUST 级别的约束持续时间最长。
          </p>
        </div>

        <PromptCompare
          bad={{
            prompt: "最好不要修改测试文件，尽量保持兼容性",
            explanation: "\"最好\"和\"尽量\"是 C 级权重词。Claude 在复杂任务中可能自行判断\"改一下测试也没关系\"。特别在长对话中，这类软约束最先被忽略。"
          }}
          good={{
            prompt: "NEVER modify files in tests/ directory.\nMUST preserve backward compatibility for all public APIs.",
            explanation: "NEVER + MUST 是 S 级权重词。Claude 对这些词有专门的合规检查机制，即使在长对话中也能持续遵守。全大写进一步强化了视觉权重。"
          }}
        />

        {/* ── XML Semantic Boundaries ── */}
        <h3
          className="text-lg font-semibold mb-3 mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          XML 标签：创建语义边界
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          XML 标签不仅是格式化工具，它们在 Claude 的注意力机制中创建了"语义分区"。
          同一段文字，放在不同的标签里，Claude 的处理优先级完全不同。
        </p>

        <CodeBlock
          code={`# 没有 XML 标签 —— 所有内容混在一起
请帮我重构 auth 模块。要保持 API 兼容。用 TypeScript 严格模式。
先分析再动手。如果不确定就问我。不要改测试。

# 有 XML 标签 —— 语义分区清晰
<instructions>
重构 @src/auth/ 模块，将 class-based 改为 functional 风格
</instructions>

<constraints>
- NEVER modify public API signatures
- NEVER modify tests/ directory
- MUST use TypeScript strict mode
</constraints>

<workflow>
1. 先列出所有需要重构的文件和影响范围
2. 等我确认后再开始修改
3. 每改完一个文件就运行 npm test
</workflow>

<uncertainty>
如果某个 class 的重构会影响超过 3 个下游文件，先停下来告诉我
</uncertainty>`}
          language="xml"
          title="xml-semantic-boundaries.md"
          highlightLines={[5, 9, 15, 20]}
        />

        <div className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <p>
            XML 标签的作用原理：Claude 在处理输入时，会根据标签名分配不同的注意力权重。
            <code className="px-1.5 py-0.5 rounded text-xs" style={{ background: 'var(--color-bg-tertiary)' }}>&lt;constraints&gt;</code> 里的内容会被当作"硬约束"处理，
            <code className="px-1.5 py-0.5 rounded text-xs" style={{ background: 'var(--color-bg-tertiary)' }}>&lt;instructions&gt;</code> 里的内容被当作"核心任务"，
            而 <code className="px-1.5 py-0.5 rounded text-xs" style={{ background: 'var(--color-bg-tertiary)' }}>&lt;context&gt;</code> 里的内容被当作"参考背景"。
            这种语义分区让 Claude 在注意力分配上更加精准。
          </p>
        </div>

        {/* ── Ultrathink ── */}
        <h3
          className="text-lg font-semibold mb-3 mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          "ultrathink"：触发深度推理
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          Claude 的 extended thinking 有多个层级。在 prompt 中使用特定词汇可以激活更深层的推理：
        </p>

        <CodeBlock
          code={`# 普通模式（默认）
分析这段代码的问题

# think —— 激活基础思考链
think carefully about the race condition in this code

# ultrathink —— 激活深度推理模式
ultrathink: 分析 @src/auth/session.ts 中的并发竞态条件。
考虑所有可能的线程交错场景，包括：
1. 正常登录流程中的 token 刷新竞争
2. 多标签页同时操作时的 session 覆盖
3. 网络超时重试导致的重复提交`}
          language="markdown"
          title="ultrathink-levels.md"
          highlightLines={[2, 5, 8]}
        />

        <div className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <p>
            <strong>什么时候用 ultrathink：</strong>复杂的架构决策、并发问题分析、安全漏洞排查、
            需要考虑多种边界条件的重构。日常编码任务不需要——它会消耗更多 token 和时间。
          </p>
        </div>

        {/* ── Numbered Steps vs Paragraphs ── */}
        <h3
          className="text-lg font-semibold mb-3 mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          编号步骤 vs 自然段落：遵守率差异
        </h3>

        <PromptCompare
          bad={{
            prompt: "先分析代码结构，然后找出性能瓶颈，接着提出优化方案，最后执行修改。每一步完成后告诉我结果，等我确认再继续下一步。",
            explanation: "自然段落中的多步骤指令，Claude 遵守率约 60-70%。在长对话中，Claude 容易\"合并\"步骤，跳过等待确认直接执行。"
          }}
          good={{
            prompt: "按以下步骤执行，每步完成后停下来等我确认：\n\n1. 分析代码结构，输出依赖关系图\n2. 识别性能瓶颈，量化每个瓶颈的影响\n3. 针对每个瓶颈提出优化方案（不执行）\n4. 我确认后，逐个执行优化",
            explanation: "编号步骤的遵守率超过 90%。数字编号在 Claude 的注意力机制中有特殊地位——它会主动追踪\"当前执行到第几步\"，并倾向于按序完成。"
          }}
        />

        {/* ── Multi-step XML Protocol ── */}
        <h3
          className="text-lg font-semibold mb-3 mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          多步 XML 协议模板
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          将以上技巧组合：XML 语义边界 + 编号步骤 + 权重词 + 阶段分离。
          这是工程级任务的终极 prompt 模板：
        </p>

        <ConfigExample
          code={`<task>
在 @src/api/ 中实现用户权限系统的 RBAC 重构
</task>

<context>
- 当前系统使用 boolean 字段 (isAdmin, canEdit) 做权限控制
- 需要迁移到 Role-Based Access Control
- 已有 150+ 个权限检查点分布在 23 个文件中
- 数据库 migration 已由 DBA 团队准备好
</context>

<instructions>
按以下阶段执行，每个阶段完成后停下来等我确认：

阶段一 · Research（只读，不改代码）
1. 扫描所有权限检查点，输出文件列表和行号
2. 按权限类型分类（读/写/管理/超级管理员）
3. 识别出需要特殊处理的边界情况

阶段二 · Plan（输出方案，不改代码）
4. 定义 Role 和 Permission 的 TypeScript 类型
5. 设计权限检查的统一 middleware
6. 列出每个文件的具体修改计划

阶段三 · Execute（逐文件修改）
7. 实现核心类型和 middleware
8. 逐文件替换旧的权限检查
9. 每改完一个文件运行相关测试

阶段四 · Review
10. 输出修改总结和回归风险评估
</instructions>

<constraints>
NEVER modify database schema files
NEVER remove existing permission checks without replacing them
MUST maintain backward compatibility for at least one release cycle
MUST keep all existing tests passing
</constraints>

<verification>
每个阶段完成时，回答以下问题：
- 本阶段修改了哪些文件？
- 是否有任何约束被违反？
- 下一阶段是否有已知风险？
</verification>`}
          language="xml"
          title="multi-step-protocol.xml"
          annotations={[
            { line: 1, text: "task 标签包含一句话的核心目标，是 Claude 的\"北极星\"" },
            { line: 5, text: "context 提供背景信息，帮助 Claude 理解为什么要做这件事" },
            { line: 12, text: "instructions 中的阶段分离：Research → Plan → Execute → Review" },
            { line: 15, text: "Research 阶段明确标注\"只读\"，防止 Claude 提前修改代码" },
            { line: 34, text: "NEVER/MUST 权重词定义不可触碰的红线" },
            { line: 41, text: "verification 模板让 Claude 在每个阶段进行自检" },
          ]}
        />
      </section>

      {/* ================================================================ */}
      {/* 1.3 Token 效率 12 技                                              */}
      {/* ================================================================ */}
      <section>
        <h2
          className="text-2xl font-bold mb-2 mt-16"
          style={{ color: 'var(--color-text-primary)' }}
        >
          1.3 Token 效率 12 技
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
          Claude Code 按 token 计费。每一次交互，你的 prompt、Claude 读取的文件、工具调用的输出都在消耗 token。
          以下 12 个技巧可以在不牺牲质量的前提下，大幅降低 token 消耗。
        </p>

        {/* ── Technique 1 ── */}
        <h3
          className="text-lg font-semibold mb-2 mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          1. Skills 按需加载（节省 ~15K tokens/session）
        </h3>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          Skills（即 .claude/ 目录下的 Markdown 文件）可以被配置为按需加载，
          而不是每次会话都全量注入。只有当用户触发对应的 slash command 时，
          对应的 Skill 才会被加载到上下文中。
        </p>
        <CodeBlock
          code={`# .claude/commands/deploy.md — 只在用户输入 /deploy 时加载
# 而不是每个会话开始时就注入 ~5K tokens 的部署指令

# .claude/commands/review.md — ~4K tokens，按需加载
# .claude/commands/migrate.md — ~6K tokens，按需加载

# 3 个 Skills × 平均 5K tokens = 15K tokens/session 节省`}
          language="bash"
          title="skills-on-demand.sh"
        />

        {/* ── Technique 2 ── */}
        <h3
          className="text-lg font-semibold mb-2 mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          2. 预处理 Hooks（10K 行 → 数百行）
        </h3>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          通过 PreToolUse Hook 或 PostToolUse Hook，在 Claude 读取文件之前/之后对内容进行预处理。
          比如只返回 type 签名、只返回 public API、或者过滤掉注释和空行。
        </p>
        <ConfigExample
          code={`{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Read",
        "command": "if echo \"$TOOL_INPUT\" | jq -r '.file_path' | grep -q '\\.test\\.'; then echo '{\"decision\": \"block\", \"reason\": \"Use @file instead of reading test files directly\"}'; fi"
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Bash",
        "command": "echo \"$TOOL_OUTPUT\" | head -200"
      }
    ]
  }
}`}
          language="json"
          title=".claude/settings.json — Preprocessing Hooks"
          annotations={[
            { line: 5, text: "拦截 Read 工具，对 .test. 文件的读取进行阻断，引导 Claude 使用 @file" },
            { line: 11, text: "截断 Bash 输出为前 200 行，防止 npm install 等命令输出数千行垃圾" },
          ]}
        />

        {/* ── Technique 3 ── */}
        <h3
          className="text-lg font-semibold mb-2 mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          3. .claudeignore（.next/ 一项就能省 30-40%）
        </h3>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          .claudeignore 的语法与 .gitignore 相同。它告诉 Claude 在搜索和读取文件时跳过这些目录。
          一个典型的 Next.js 项目中，.next/ 目录包含的编译产物占整个项目文件量的 30-40%。
        </p>
        <ConfigExample
          code={`# Build artifacts — 编译产物不需要 Claude 读取
.next/
dist/
build/
out/

# Dependencies — node_modules 永远不需要
node_modules/

# Generated — 自动生成的文件
*.generated.ts
*.d.ts
coverage/
.nyc_output/

# Large assets — 大型二进制文件
*.png
*.jpg
*.mp4
public/assets/`}
          language="bash"
          title=".claudeignore"
          annotations={[
            { line: 2, text: ".next/ 在典型 Next.js 项目中占文件量的 30-40%，忽略后效果显著" },
            { line: 8, text: "node_modules 通常已被默认忽略，这里显式声明更安全" },
            { line: 11, text: "自动生成的类型声明和代码不需要 Claude 分析" },
          ]}
        />

        {/* ── Technique 4 ── */}
        <h3
          className="text-lg font-semibold mb-2 mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          4. 精确文件路径 vs 模糊描述
        </h3>

        <PromptCompare
          bad={{
            prompt: "找到项目中处理用户认证的代码，然后修复登录 bug",
            explanation: "Claude 需要用 Grep/Glob 工具搜索全项目，每次搜索消耗数百到数千 token。搜索 3-5 次 + 读取候选文件 = 可能浪费 5K-10K token 在\"找代码\"上。"
          }}
          good={{
            prompt: "修复 @src/auth/login.ts 第 45 行的空指针异常。当 user.profile 为 null 时，getUserRole() 调用会崩溃。",
            explanation: "@ 引用直接注入文件内容，零搜索开销。行号定位让 Claude 不需要通读整个文件。比模糊描述节省 5K-10K token。"
          }}
        />

        {/* ── Technique 5 ── */}
        <h3
          className="text-lg font-semibold mb-2 mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          5. 子代理（Subagent）隔离冗长输出
        </h3>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          当一个任务会产生大量中间输出时（如跑测试、代码分析），使用子代理隔离。
          子代理的上下文独立于主对话，其冗长的工具输出不会污染你的主上下文。
        </p>
        <CodeBlock
          code={`# 主对话中直接跑测试 —— 测试输出全部进入主上下文
> 运行所有测试并分析失败原因
# 结果：200+ 行测试输出 + 分析 = 消耗 3K-5K tokens

# 使用子代理 —— 只返回摘要
> 启动一个子代理，运行全部测试，然后只告诉我：
> 1. 失败了几个测试
> 2. 每个失败测试的文件名和失败原因（一行一个）
# 结果：子代理内部消耗 token，但主对话只增加摘要 ~200 tokens`}
          language="bash"
          title="subagent-isolation.sh"
        />

        {/* ── Technique 6 ── */}
        <h3
          className="text-lg font-semibold mb-2 mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          6. 模型路由（Haiku/Sonnet/Opus 按任务分配）
        </h3>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          不是所有任务都需要 Opus。简单任务用 Haiku，常规任务用 Sonnet，复杂任务才用 Opus。
          Claude Code 内部已经对部分工具调用做了模型路由——比如 Glob、Read 等简单工具倾向于使用轻量模型。
          你也可以在 settings 中进行配置。
        </p>
        <CodeBlock
          code={`# Token 成本对比（每 1M tokens，近似）
# Haiku:  输入 $0.25  / 输出 $1.25   → 适合：文件搜索、格式化、简单重命名
# Sonnet: 输入 $3     / 输出 $15     → 适合：常规编码、bug 修复、测试编写
# Opus:   输入 $15    / 输出 $75     → 适合：架构设计、安全审计、复杂重构

# 策略：用 Sonnet 做日常开发，只在需要深度推理时切换 Opus
# 典型场景节省：一天 50 次交互，30 次用 Sonnet，20 次用 Opus
# 对比全部用 Opus：成本降低约 40%`}
          language="bash"
          title="model-routing-strategy.sh"
        />

        {/* ── Technique 7 ── */}
        <h3
          className="text-lg font-semibold mb-2 mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          7. Tool Search 自动延迟加载（约 85% token 缩减）
        </h3>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          Claude Code 有几十个可用工具（Read、Write、Bash、Grep、Glob 等），
          每个工具的 schema 定义都占用 token。Tool Search 机制将不常用的工具"延迟加载"——
          只在需要时才获取完整 schema。这将系统 prompt 中的工具定义 token 减少了约 85%。
        </p>
        <CodeBlock
          code={`# 默认加载的核心工具（~5 个）
Read, Write, Edit, Bash, Grep, Glob

# 延迟加载的工具（~30+ 个，按需获取）
WebSearch, WebFetch, NotebookEdit,
EnterWorktree, ExitWorktree,
所有 MCP 工具 (chrome-devtools, playwright, supabase...)

# 效果：系统 prompt 从 ~20K tokens 降到 ~3K tokens`}
          language="bash"
          title="tool-search-deferred.sh"
        />

        {/* ── Technique 8 ── */}
        <h3
          className="text-lg font-semibold mb-2 mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          8. 定向 /compact（带指令的上下文压缩）
        </h3>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          /compact 会压缩对话历史以释放上下文空间。但默认的 /compact 可能会丢失关键信息。
          定向 /compact 允许你指定哪些信息必须保留：
        </p>
        <CodeBlock
          code={`# 默认 compact —— 可能丢失关键决策
/compact

# 定向 compact —— 指定保留内容
/compact preserve the API design decisions and the RBAC type definitions

# 更精确的定向 compact
/compact 保留以下信息：
1. Permission 和 Role 的类型定义
2. middleware 的设计方案
3. 已完成的文件列表和待处理的文件列表`}
          language="bash"
          title="targeted-compact.sh"
          highlightLines={[5, 8]}
        />

        {/* ── Technique 9 ── */}
        <h3
          className="text-lg font-semibold mb-2 mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          9. 关键任务用单轮对话
        </h3>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          对于"一次性"的关键任务（生成配置文件、写一个完整的工具函数），
          单轮对话（single-turn）比多轮对话更高效：没有历史上下文污染，没有 compact 损失。
        </p>
        <CodeBlock
          code={`# 多轮对话方式 —— 对话历史不断累积
> 帮我写一个 rate limiter
> ...（3 轮修改）
> 最终 token 消耗：~30K（含历史上下文）

# 单轮管道方式 —— 零历史上下文
echo "实现一个 sliding window rate limiter，TypeScript，
使用 Redis 作为后端，支持 per-user 和 per-IP 限制，
导出 RateLimiter class。MUST 包含完整的类型定义和 JSDoc。" | claude -p

# token 消耗：~8K（无历史，一次完成）`}
          language="bash"
          title="single-turn-pipeline.sh"
          highlightLines={[7, 8, 9, 10]}
        />

        {/* ── Technique 10 ── */}
        <h3
          className="text-lg font-semibold mb-2 mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          10. @ 引用 vs 让 Claude 搜索
        </h3>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          @ 引用（如 @src/auth/login.ts）直接将文件内容注入上下文。
          让 Claude 自己搜索则需要调用 Grep/Glob 工具，每次调用都有额外的 token 开销。
        </p>
        <CodeBlock
          code={`# 方式 A：@ 引用（推荐，1 次读取）
修复 @src/auth/login.ts 中 handleLogin 函数的空指针问题
# token 消耗：文件内容（~500 tokens）

# 方式 B：让 Claude 搜索（需要 3-5 次工具调用）
找到处理登录的代码，修复其中的空指针问题
# Claude 的行为：
#   1. Grep "login" → 找到 8 个文件 (~800 tokens)
#   2. Grep "handleLogin" → 缩小到 3 个文件 (~500 tokens)
#   3. Read src/auth/login.ts (~500 tokens)
#   4. Read src/auth/session.ts (~400 tokens)  ← 可能还读错文件
# 总计：~2200 tokens，是 @ 引用的 4 倍以上`}
          language="bash"
          title="at-reference-vs-search.sh"
          highlightLines={[2, 6]}
        />

        {/* ── Technique 11 ── */}
        <h3
          className="text-lg font-semibold mb-2 mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          11. 管道输入（git diff | claude -p）
        </h3>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          管道输入将外部命令的输出直接注入 Claude 的上下文，省去了 Claude 自己运行命令的开销。
          特别适合 code review 和 diff 分析场景。
        </p>
        <CodeBlock
          code={`# 让 Claude 自己跑 git diff —— 需要 Bash 工具调用
> 检查我最近的代码修改，找出潜在问题
# Claude: 调用 Bash("git diff HEAD~3") → 输出 + 工具调用开销

# 管道输入 —— 直接注入，零工具调用开销
git diff HEAD~3 | claude -p "Review this diff. Focus on:
1. 潜在的 null/undefined 错误
2. 缺失的错误处理
3. 性能回归风险
只列出 CRITICAL 和 HIGH 级别的问题。"

# 更高级的用法：组合管道
cat src/auth/types.ts src/auth/middleware.ts | claude -p \
  "这两个文件的类型定义是否一致？列出所有不匹配的地方。"`}
          language="bash"
          title="pipe-input.sh"
          highlightLines={[5, 6, 7, 8, 9, 12, 13]}
        />

        {/* ── Technique 12 ── */}
        <h3
          className="text-lg font-semibold mb-2 mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          12. .claudeignore + 精确 @ref 组合拳
        </h3>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          最终的 token 效率策略是组合使用：用 .claudeignore 排除干扰，用 @ 引用精确注入需要的内容。
          这是"减法 + 加法"的思路——先过滤噪音，再精确供给。
        </p>
        <CodeBlock
          code={`# Step 1: .claudeignore 排除所有不需要的文件（减法）
# → 从 Claude 的视野中移除 60-70% 的噪音文件

# Step 2: 精确 @ref 注入需要的文件（加法）
修复 @src/auth/login.ts 和 @src/auth/types.ts 中的类型不匹配。
参考 @docs/auth-spec.md 中的接口定义。

# 效果叠加：
# - 无 .claudeignore：Claude 搜索范围 2000+ 文件，每次 Glob/Grep 耗时长
# - 有 .claudeignore：搜索范围缩小到 500 文件
# - .claudeignore + @ref：零搜索，直接注入 3 个文件
# 总体 token 节省：70-80%（相比无优化状态）`}
          language="bash"
          title="claudeignore-plus-ref.sh"
        />

        <QualityCallout title="Token 效率总结">
          12 个技巧并非孤立使用。一个成熟的工作流会同时使用 5-8 个技巧。典型的组合：
          <strong> .claudeignore（排除噪音）+ @ 引用（精确供给）+ Skills 按需加载（减少系统 prompt）+
          定向 /compact（保留关键信息）+ 管道输入（零工具调用）</strong>。
          根据实际项目测量，这套组合可以将单次会话的 token 消耗降低 50-70%。
        </QualityCallout>
      </section>

      {/* ================================================================ */}
      {/* 1.4 约束语的精确用法                                              */}
      {/* ================================================================ */}
      <section>
        <h2
          className="text-2xl font-bold mb-2 mt-16"
          style={{ color: 'var(--color-text-primary)' }}
        >
          1.4 约束语的精确用法
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
          同样是"让 Claude 别乱来"，不同的措辞会导致完全不同的 Claude 行为。
          以下每一组对比都基于实际测试观察。
        </p>

        {/* ── Comparison 1 ── */}
        <h3
          className="text-lg font-semibold mb-3 mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          对比实验 1："停下来" vs "谨慎"
        </h3>
        <PromptCompare
          bad={{
            prompt: "请谨慎修改代码",
            label: "无效",
            explanation: "\"谨慎\"是一个主观形容词。Claude 会认为自己一直都是\"谨慎\"的——它的内部自我评估机制会把自己的输出标记为\"已足够谨慎\"。结果：该怎么改还是怎么改，这句话约等于没说。"
          }}
          good={{
            prompt: "先不要改代码。只分析问题并列出修改计划。等我说\"开始执行\"后再动手。",
            label: "有效",
            explanation: "\"先不要改代码\"是明确的行为禁止。\"等我说'开始执行'\"设定了一个具体的触发条件。Claude 遇到明确的禁止+触发条件时，遵守率 >95%。"
          }}
        />

        {/* ── Comparison 2 ── */}
        <h3
          className="text-lg font-semibold mb-3 mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          对比实验 2："一步一停" vs "按步骤执行"
        </h3>
        <PromptCompare
          bad={{
            prompt: "按步骤执行这个重构方案",
            label: "连续执行",
            explanation: "\"按步骤执行\"只告诉 Claude 有步骤，但没说要在步骤之间停下来。Claude 会把所有步骤串联执行到底——特别是当它判断步骤之间有逻辑依赖时，会\"帮你\"自动衔接。"
          }}
          good={{
            prompt: "一步一停。执行第 1 步后停下来输出结果，等我确认后再执行第 2 步。\n如果你不确定第 1 步的结果是否正确，也停下来问我。",
            label: "逐步暂停",
            explanation: "\"一步一停\"是一个清晰的行为模式。\"执行后停下来\"定义了停止条件。\"不确定...也停下来\"覆盖了异常情况。三重约束让 Claude 在每一步结束时都会暂停等待确认。"
          }}
        />

        {/* ── Comparison 3 ── */}
        <h3
          className="text-lg font-semibold mb-3 mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          对比实验 3："问我" vs "尽力做"
        </h3>
        <PromptCompare
          bad={{
            prompt: "尽力完成这个任务，遇到问题自己想办法解决",
            label: "可能幻觉",
            explanation: "\"尽力做\"让 Claude 进入\"自主决策\"模式。遇到不确定的情况时，Claude 倾向于\"合理推测\"而不是承认不知道。这是产生幻觉代码的主要原因之一——Claude 会编造一个看起来合理但可能完全错误的解决方案。"
          }}
          good={{
            prompt: "如果遇到以下情况，停下来问我而不是自行判断：\n1. 不确定某个 API 的具体参数\n2. 不确定某个修改是否会影响其他模块\n3. 有多个可行方案但不确定选哪个",
            label: "主动澄清",
            explanation: "列举具体的\"问我\"触发条件，让 Claude 有明确的判断标准。Claude 遇到这些情况时会输出疑问并暂停，而不是猜测。将幻觉风险从\"可能\"降到\"极低\"。"
          }}
        />

        {/* ── Comparison 4 ── */}
        <h3
          className="text-lg font-semibold mb-3 mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          对比实验 4："用现有模式" vs "用最佳实践"
        </h3>
        <PromptCompare
          bad={{
            prompt: "用最佳实践重构这段代码",
            label: "Claude 偏好",
            explanation: "\"最佳实践\"是 Claude 训练数据中的高频词。Claude 会选择它训练数据中最常见的模式——这通常是某个流行博客或教程的风格，而不是你项目的风格。结果：代码能跑，但与项目其他部分风格不一致。"
          }}
          good={{
            prompt: "用项目现有的 Repository Pattern 重构这段代码。\n参考 @src/repositories/UserRepository.ts 的实现风格。\n保持一致的错误处理方式（参考第 23-45 行的 try-catch 结构）。",
            label: "锚定项目",
            explanation: "\"项目现有的 XX 模式\"将 Claude 锚定到你的代码库。@ 引用给出具体的参考文件。行号引用进一步精确到代码片段级别。Claude 会模仿你指定的代码风格，而不是使用它自己的\"最佳实践\"。"
          }}
        />

        {/* ── Context Feeding Strategies ── */}
        <h3
          className="text-lg font-semibold mb-3 mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          上下文输入策略对比
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          给 Claude 提供代码上下文有四种方式，各有不同的 token 成本和适用场景：
        </p>

        <CodeBlock
          code={`┌─────────────────┬──────────────────┬──────────────────────────────────────┐
│ 方式            │ Token 成本       │ 适用场景                              │
├─────────────────┼──────────────────┼──────────────────────────────────────┤
│ @file 引用       │ ★☆☆ 最低        │ 你知道要看哪个文件                     │
│                 │ ~500 tok/文件    │ 精确定位的 bug 修复、代码审查            │
├─────────────────┼──────────────────┼──────────────────────────────────────┤
│ 管道输入         │ ★☆☆ 低          │ 外部命令输出（git diff, test results） │
│ cmd | claude -p │ 与内容等长       │ 一次性任务、CI/CD 集成                  │
├─────────────────┼──────────────────┼──────────────────────────────────────┤
│ 粘贴代码         │ ★★☆ 中等        │ 非项目文件、代码片段讨论                │
│                 │ 与内容等长       │ Stack Overflow 代码、他人代码片段        │
├─────────────────┼──────────────────┼──────────────────────────────────────┤
│ 让 Claude 搜索   │ ★★★ 最高        │ 你不知道代码在哪、探索性任务             │
│                 │ 2-5x 额外开销   │ 大范围重构前的代码分析                   │
└─────────────────┴──────────────────┴──────────────────────────────────────┘`}
          language="markdown"
          title="context-feeding-strategies.md"
        />

        <QualityCallout>
          约束语的核心原则：<strong>用行为描述替代性质描述</strong>。
          不要说"谨慎地"（性质），要说"先分析，再列计划，等我确认后执行"（行为）。
          不要说"用最佳实践"（性质），要说"参考 @file 的实现风格"（行为）。
          Claude 擅长遵循具体的行为指令，但对抽象的性质描述理解模糊。
        </QualityCallout>
      </section>

      {/* ================================================================ */}
      {/* 1.5 应对 Claude "遗忘"                                            */}
      {/* ================================================================ */}
      <section>
        <h2
          className="text-2xl font-bold mb-2 mt-16"
          style={{ color: 'var(--color-text-primary)' }}
        >
          1.5 应对 Claude "遗忘"
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
          用 Claude Code 做复杂任务时，你会发现一个现象：对话前半段约定好的规则，到了第 20 轮开始被"遗忘"。
          Claude 开始产出与之前方案矛盾的代码，或者重复问你已经回答过的问题。
          这不是 bug，而是上下文窗口的物理限制。理解原因才能对症下药。
        </p>

        {/* ── Root Cause ── */}
        <h3
          className="text-lg font-semibold mb-3 mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          根本原因：注意力稀释与 compact 信息损失
        </h3>
        <div className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <p>Claude 的上下文窗口有固定大小（200K tokens，1M context 模型例外）。当对话越来越长：</p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li>
              <strong>注意力稀释：</strong>随着上下文增长，Claude 对早期内容的"注意力权重"下降。
              第 3 轮约定的规则，到第 25 轮时可能只剩下 30% 的注意力权重。
              这不是 Claude 主动"忘记"，而是它的注意力被后面的大量内容"挤压"。
            </li>
            <li>
              <strong>自动 compact 的信息损失：</strong>当上下文接近上限时，Claude Code 会自动触发 compact，
              将对话历史压缩。压缩过程中，早期的具体决策细节、约束条件可能被简化为笼统的摘要。
              比如 "NEVER modify tests/ directory" 可能被压缩为 "keep tests unchanged"——语义相似但权重下降。
            </li>
          </ul>
        </div>

        {/* ── Failure Case ── */}
        <h3
          className="text-lg font-semibold mb-3 mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          实战案例：30 轮对话后的矛盾代码
        </h3>
        <CodeBlock
          code={`# 第 5 轮：约定了错误处理策略
> 所有 API 调用使用 Result<T, Error> 类型，不使用 try-catch

# 第 12 轮：Claude 仍在遵守
✓ function getUser(id: string): Result<User, ApiError> { ... }

# 第 25 轮：Claude 开始"遗忘"
✗ async function updateProfile(data: ProfileData) {
    try {                                   // ← 回到了 try-catch！
      const response = await api.put(...)
    } catch (error) {
      throw new Error(...)                  // ← 甚至用了 throw
    }
  }

# 第 28 轮：矛盾加剧
✗ Claude 在同一个文件中混用 Result<T, Error> 和 try-catch
  两种完全不同的错误处理风格共存

# 诊断：
> /context
  → 上下文使用率：85%
  → 已触发 2 次自动 compact
  → 第 5 轮的错误处理约定已被 compact 压缩为模糊摘要`}
          language="bash"
          title="forgetting-case-study.sh"
          highlightLines={[9, 10, 11, 12, 22, 23, 24]}
        />

        {/* ── 7 Countermeasures ── */}
        <h3
          className="text-lg font-semibold mb-3 mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          7 个应对策略
        </h3>

        {/* Strategy 1 */}
        <h4
          className="text-base font-semibold mb-2 mt-6"
          style={{ color: 'var(--color-text-primary)' }}
        >
          策略 1：定向 /compact
        </h4>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          不要等自动 compact 被动触发。在关键决策完成后，主动执行定向 compact，
          明确指定哪些信息必须保留。
        </p>
        <CodeBlock
          code={`# 在完成架构设计后立即执行
/compact preserve the following decisions:
1. All API errors use Result<T, Error> type, no try-catch
2. Repository pattern for data access (see UserRepository)
3. Permission checks use RBAC middleware, not inline boolean checks
4. File modification scope: only src/auth/ directory`}
          language="bash"
          title="strategy-1-targeted-compact.sh"
          highlightLines={[2]}
        />

        {/* Strategy 2 */}
        <h4
          className="text-base font-semibold mb-2 mt-6"
          style={{ color: 'var(--color-text-primary)' }}
        >
          策略 2：CLAUDE.md 锚定（每轮重新加载）
        </h4>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          CLAUDE.md 的核心优势：它在每一轮对话开始时都会被重新加载到上下文中。
          这意味着写在 CLAUDE.md 里的规则永远不会被 compact 压缩掉。
          把最关键的约束写在 CLAUDE.md 里，而不是对话中。
        </p>
        <ConfigExample
          code={`# CLAUDE.md — 项目级规则（每轮重载，永不丢失）

## Error Handling — CRITICAL
- MUST use Result<T, Error> type for all API calls
- NEVER use try-catch for business logic errors
- NEVER use throw in src/ directory

## Code Style
- MUST follow Repository Pattern (ref: src/repositories/UserRepository.ts)
- MUST use RBAC middleware for permission checks
- NEVER use inline boolean checks (isAdmin, canEdit) for permissions

## Modification Scope
- NEVER modify files outside src/auth/ without explicit approval
- NEVER modify tests/ directory`}
          language="markdown"
          title="CLAUDE.md"
          annotations={[
            { line: 3, text: "CRITICAL 标记让 Claude 在自检时优先检查此项" },
            { line: 4, text: "MUST + Result<T, Error> 的具体类型名，比\"use proper error handling\"具体 10 倍" },
            { line: 6, text: "NEVER + throw + 具体范围(src/)，精确定义了红线" },
          ]}
        />

        {/* Strategy 3 */}
        <h4
          className="text-base font-semibold mb-2 mt-6"
          style={{ color: 'var(--color-text-primary)' }}
        >
          策略 3：HANDOFF.md 跨会话延续
        </h4>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          当一个任务跨越多个会话时，在会话结束前让 Claude 生成 HANDOFF.md，
          记录当前进度、已做决策、待办事项。下一个会话开始时，用 @ 引用这个文件。
        </p>
        <CodeBlock
          code={`# 会话结束前
> 把当前的进度、决策和待办事项写入 HANDOFF.md

# Claude 生成的 HANDOFF.md 内容：
# ## Progress
# - [x] Phase 1: 分析完成，识别出 23 个权限检查点
# - [x] Phase 2: 类型定义和 middleware 已实现
# - [ ] Phase 3: 逐文件替换（已完成 8/23）
#
# ## Key Decisions
# - 使用 Result<T, Error> 替代 try-catch
# - Permission enum 定义在 src/auth/types.ts
# - Middleware 链式调用模式（参考 src/auth/middleware.ts）
#
# ## Next Steps
# - 继续替换剩余 15 个文件
# - 从 src/api/users.ts 开始（最多依赖）

# 新会话开始
> 继续上次的 RBAC 重构。进度和决策见 @HANDOFF.md`}
          language="bash"
          title="strategy-3-handoff.sh"
          highlightLines={[2, 19]}
        />

        {/* Strategy 4 */}
        <h4
          className="text-base font-semibold mb-2 mt-6"
          style={{ color: 'var(--color-text-primary)' }}
        >
          策略 4：PreCompact Hook 自动保存上下文
        </h4>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          通过 Hook 在 compact 触发前自动将关键上下文保存到文件中。
          这样即使 compact 压缩了对话历史，关键信息也有备份。
        </p>
        <ConfigExample
          code={`{
  "hooks": {
    "PreCompact": [
      {
        "matcher": "",
        "command": "echo \"[$(date)] Compact triggered. Context: $CONTEXT_SUMMARY\" >> .claude/compact-log.txt"
      }
    ]
  }
}`}
          language="json"
          title=".claude/settings.json — PreCompact Hook"
          annotations={[
            { line: 3, text: "PreCompact 在自动或手动 compact 执行前触发" },
            { line: 6, text: "将 compact 前的上下文摘要保存到日志文件，可用于事后追溯" },
          ]}
        />

        {/* Strategy 5 */}
        <h4
          className="text-base font-semibold mb-2 mt-6"
          style={{ color: 'var(--color-text-primary)' }}
        >
          策略 5：会话检查点（Session Checkpoint）
        </h4>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          Claude Code 会在本地保存每个会话的完整历史。当你需要回溯某个决策时，
          可以从检查点文件恢复。
        </p>
        <CodeBlock
          code={`# 会话文件存储位置
~/.claude/projects/[project-hash]/[session-id].jsonl

# 查找最近的会话
ls -lt ~/.claude/projects/*/

# 每一行是一个对话轮次的 JSON 记录
# 包含：用户输入、Claude 输出、工具调用、工具结果

# 使用场景：
# 1. 回溯"第 8 轮我们约定了什么错误处理方式？"
# 2. 比较不同会话的决策差异
# 3. 提取关键决策写入 CLAUDE.md`}
          language="bash"
          title="strategy-5-session-checkpoint.sh"
          highlightLines={[2]}
        />

        {/* Strategy 6 */}
        <h4
          className="text-base font-semibold mb-2 mt-6"
          style={{ color: 'var(--color-text-primary)' }}
        >
          策略 6：新会话 + Spec 文件
        </h4>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          当上下文接近饱和（/context 显示 &gt;80%），不要继续在当前会话里硬撑。
          将关键信息写入 spec 文件，开一个新会话。新会话有完整的上下文空间，效率更高。
        </p>
        <CodeBlock
          code={`# Step 1: 在旧会话中生成 spec 文件
> 把我们的 RBAC 重构方案总结成一个 spec 文件，包含：
> 1. 类型定义
> 2. 架构决策
> 3. 已完成和未完成的文件列表
> 4. 所有约束条件
> 写到 docs/rbac-refactor-spec.md

# Step 2: 关闭旧会话，开新会话
# Step 3: 新会话中引用 spec 文件
> 按照 @docs/rbac-refactor-spec.md 的方案，继续 RBAC 重构。
> 从"未完成的文件列表"中的第一个文件开始。`}
          language="bash"
          title="strategy-6-new-session-spec.sh"
          highlightLines={[2, 11]}
        />

        {/* Strategy 7 */}
        <h4
          className="text-base font-semibold mb-2 mt-6"
          style={{ color: 'var(--color-text-primary)' }}
        >
          策略 7：使用 1M 上下文模型
        </h4>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          如果你的任务确实需要超长上下文（大规模重构、跨文件分析），
          考虑使用支持 1M token 上下文的模型。更大的窗口意味着更晚触发 compact，
          注意力稀释的阈值更高。但这不是万能药——token 成本也会相应增加。
        </p>
        <CodeBlock
          code={`# 200K 上下文模型：
# - 约 20-25 轮深度对话后开始注意力稀释
# - 约 30 轮后可能触发自动 compact
# - 适合：大多数日常任务

# 1M 上下文模型：
# - 约 80-100 轮深度对话后开始注意力稀释
# - 很少触发自动 compact
# - 适合：大规模重构、跨 50+ 文件的分析
# - 注意：token 成本更高，按需使用`}
          language="bash"
          title="strategy-7-1m-context.sh"
        />

        <QualityCallout>
          研究表明，AI 辅助编程中约 48% 的安全漏洞与不精确的 prompt 相关。
          当 Claude "遗忘"你的约束条件后产出的代码，是安全漏洞的高发区。
          <strong> 质量线：如果你的 /context 显示上下文使用率超过 80%，立即停下来执行定向 compact
          或开新会话。不要在上下文饱和的状态下继续关键任务。</strong>
        </QualityCallout>
      </section>

      {/* ================================================================ */}
      {/* Exercises                                                         */}
      {/* ================================================================ */}
      <section>
        <h2
          className="text-2xl font-bold mb-6 mt-16"
          style={{ color: 'var(--color-text-primary)' }}
        >
          本章练习
        </h2>

        <ExerciseCard
          tier="l1"
          title="Contract-Style Prompt 练习"
          description="选择你当前项目中的一个真实任务（比如添加一个 API 端点、修复一个 bug、重构一个模块）。为这个任务编写 3 个不同级别的 prompt：Level 1（零约束）、Level 3（明确指标）、Level 5（完整合同）。将三个 prompt 分别发送给 Claude Code，对比输出的代码质量、是否需要额外修改、token 消耗量。"
          checkpoints={[
            "三个 prompt 针对的是完全相同的任务",
            "Level 5 的 prompt 包含 <task>/<constraints>/<uncertainty_handling>/<output_format> 四个核心标签",
            "记录了每个 prompt 的 token 消耗（可通过 /cost 查看）",
            "总结了三个级别在输出质量上的具体差异",
          ]}
        />

        <ExerciseCard
          tier="l2"
          title="@ 引用 vs 搜索的 Token 差异测量"
          description="在你的项目中选择一段认证/鉴权相关的代码（或任何你熟悉的模块）。设计两个等效的 prompt：一个使用 @file 精确引用，另一个用自然语言描述让 Claude 自己找代码。两个 prompt 都要求完成相同的修改任务。执行后对比 token 消耗和完成质量。"
          checkpoints={[
            "两个 prompt 的任务描述在语义上完全等价",
            "使用 /cost 记录了两次执行的 token 消耗",
            "记录了 Claude 在\"搜索模式\"下调用了几次 Grep/Glob 工具",
            "总结了 token 差异的具体倍数（通常 @ref 比搜索省 3-5x）",
          ]}
        />

        <ExerciseCard
          tier="l3"
          title="CLAUDE.md Token 效率改造"
          description="对你项目的 CLAUDE.md 进行一次完整改造：应用本章的 token 效率技巧（权重词层级、XML 结构化、精确约束替代模糊描述）。改造后连续使用 10 个会话，对比改造前后的平均 token 消耗。"
          checkpoints={[
            "改造前备份了原始 CLAUDE.md",
            "改造后的 CLAUDE.md 使用了 NEVER/MUST/ALWAYS 权重词替代了 should/recommend",
            "加入了 .claudeignore 排除干扰文件",
            "记录了改造前 10 次会话和改造后 10 次会话的平均 token 消耗",
            "总结了 token 节省比例和代码质量变化",
          ]}
        />
      </section>
    </div>
  )
}
