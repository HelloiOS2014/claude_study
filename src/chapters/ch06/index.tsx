import { CodeBlock } from '../../components/content/CodeBlock'
import { QualityCallout } from '../../components/content/QualityCallout'
import { ExerciseCard } from '../../components/content/ExerciseCard'
import { ConfigExample } from '../../components/content/ConfigExample'
import { ReferenceSection } from '../../components/content/ReferenceSection'

/* ═══════════════════════════════════════════════
   Chapter 6: Skills 体系
   ═══════════════════════════════════════════════ */

export default function Ch06() {
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
            06
          </span>
          <span
            className="text-xs uppercase tracking-widest font-medium"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Capability Layer
          </span>
        </div>
        <h1
          className="text-3xl md:text-4xl font-bold mb-4 leading-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Skills 体系：定义 Claude 能做什么
        </h1>
        <p
          className="text-lg leading-relaxed max-w-3xl"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          CLAUDE.md 告诉 Claude "你在哪个项目、遵循什么规范"，Hooks 自动化"什么时候做检查" --
          但还缺一块：如何把复杂的工作流封装成一键触发的能力？
          Skills 系统是 Harness 的能力层 -- 它定义了 Claude <strong>能做什么</strong>。
          一个 SKILL.md 文件就是一项能力。写完这一章，你可以在 5 分钟内为你的项目创建自定义 Skill。
        </p>
      </header>

      {/* ═══════════════════════════════════════════════
          Section 6.1: Skills 是什么
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          6.1 Skills 是什么
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Skill 是 Claude Code 的首要扩展机制。一个 Skill 就是一个 SKILL.md 文件，
          包含 YAML frontmatter（元数据）和 Markdown body（指令）。
          当 Skill 被加载时，它的 Markdown 内容会注入 Claude 的上下文窗口，成为 Claude 遵循的指令。
        </p>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          这和 MCP 工具不同。MCP 是给 Claude 增加<strong>外部工具能力</strong>（在上下文之外执行操作），
          而 Skills 是<strong>在上下文中加载 prompt 指令</strong>，让 Claude 按照特定方式思考和行动。
          打个比方：MCP 像给 Claude 一把螺丝刀（新工具），Skill 像给 Claude 一份操作手册（新知识和规则）。
        </p>

        <CodeBlock
          language="bash"
          title="skill-vs-mcp.txt"
          code={`Skills（Prompt 指令）                    MCP（外部工具）
═══════════════════════                  ═══════════════════════
在上下文中加载                            在上下文外执行
SKILL.md 文件                            MCP Server 进程
定义"怎么做"（指令 + 约束）                提供"做什么"（工具 + API）
零额外进程开销                            需要启动/维护 Server
遵循 AgentSkills.io 开放标准              遵循 MCP 协议
例：code review 流程、部署流程              例：浏览器操作、数据库查询`}
        />

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Skills 遵循{' '}
          <strong>AgentSkills.io 开放标准</strong>
          ，这意味着你写的 Skill 不仅能在 Claude Code 中使用，
          也可以在其他支持该标准的 AI 工具中复用。这个标准由社区维护，Claude Code 是其首批采用者。
        </p>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          本教程以 TypeScript 项目为例，但原则适用于任何语言。Skills 本身是 Markdown 文件，语言无关。
        </p>

        <QualityCallout title="Skills 在 Harness 中的位置">
          回顾 Harness Engineering 框架：CLAUDE.md 是"记忆层"（Claude 知道什么），Hooks 是"自动化层"（什么时候触发检查），
          Skills 是"能力层"（Claude 能做什么）。三者组合，构成完整的 AI 工程化 Harness。
        </QualityCallout>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 6.2: 写你的第一个 Skill
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          6.2 写你的第一个 Skill
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          先动手，再讲原理。我们通过两个完整的例子来学习 Skill 的核心机制。
        </p>

        {/* ── Example 1: /deploy ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Example 1: /deploy -- 用户手动触发的部署流程
        </h3>

        <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          这个 Skill 封装了一套标准化部署流程。用户输入 <code style={{ color: 'var(--color-accent)' }}>/deploy</code> 触发，
          Claude 不能自动调用它（因为部署应该是人类主动发起的）。
        </p>

        <ConfigExample
          title=".claude/skills/deploy/SKILL.md"
          language="yaml"
          code={`---
name: deploy
description: Deploy the current project to production
disable-model-invocation: true
allowed-tools: Bash
---

## Deploy Process

1. Run tests: \`npm test\`
2. Build: \`npm run build\`
3. Deploy: \`./scripts/deploy.sh\`

IMPORTANT: Always run tests before deploying. If tests fail, stop and report.`}
          annotations={[
            { line: 2, text: 'name: 定义斜杠命令名。在 Claude Code 中输入 /deploy 触发此 Skill。' },
            { line: 3, text: 'description: 描述 Skill 的功能。Claude 根据此字段判断何时自动调用（此例中禁用了自动调用）。' },
            { line: 4, text: 'disable-model-invocation: true 禁止 Claude 自动调用此 Skill。只能由用户手动输入 /deploy 触发。' },
            { line: 5, text: 'allowed-tools: 限制此 Skill 只能使用 Bash 工具。防止它意外编辑文件。' },
            { line: 8, text: '分隔线下方是 Markdown 指令体。加载时注入 Claude 的上下文，成为它遵循的操作手册。' },
          ]}
        />

        {/* ── Example 2: code-reviewer ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Example 2: code-reviewer -- Claude 自动调用的 Review 能力
        </h3>

        <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          这个 Skill 让 Claude 在检测到代码变更时可以自动加载 review 指令。
          注意 <code style={{ color: 'var(--color-accent)' }}>user-invocable: false</code> --
          用户不能用斜杠命令触发，只有 Claude 自己判断需要时才会加载。
        </p>

        <ConfigExample
          title=".claude/skills/code-reviewer/SKILL.md"
          language="yaml"
          code={`---
name: code-reviewer
description: Review code changes for security vulnerabilities, performance issues, and style violations
user-invocable: false
model: sonnet
effort: medium
---

Review the code changes and check for:
- SQL injection, XSS, and other OWASP Top 10 vulnerabilities
- N+1 queries and unnecessary database calls
- Adherence to project conventions in CLAUDE.md`}
          annotations={[
            { line: 2, text: 'name: Skill 的唯一标识符。因为 user-invocable: false，用户不会用 /code-reviewer 触发。' },
            { line: 3, text: 'description: 最重要的字段！Claude 根据此描述判断何时自动加载这个 Skill。写得越精准，触发越准确。' },
            { line: 4, text: 'user-invocable: false 意味着用户不能用斜杠命令手动触发。Skill 只通过 Claude 的自动判断加载。' },
            { line: 5, text: 'model: sonnet 覆盖当前会话的模型。Review 不需要最强生成能力，Sonnet 性价比更高。' },
            { line: 6, text: 'effort: medium 覆盖推理深度。Review 不需要 Claude 深度思考每个细节，medium 足够。' },
          ]}
        />

        {/* ── 5 Core Frontmatter Fields ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          5 个核心 Frontmatter 字段
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          从上面两个例子中，我们已经见到了最重要的 5 个 frontmatter 字段。它们控制 Skill 的身份、触发方式和执行行为。
        </p>

        <div
          className="rounded-lg overflow-hidden my-4"
          style={{
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg-secondary)',
          }}
        >
          <div
            className="px-4 py-3 text-sm font-medium"
            style={{
              borderBottom: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              background: 'var(--color-bg-tertiary)',
            }}
          >
            核心 Frontmatter 字段
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {[
              {
                field: 'name',
                desc: 'Skill 的唯一名称，也是斜杠命令名（/name 触发）。必须在同一作用域内唯一。',
                example: 'name: deploy',
              },
              {
                field: 'description',
                desc: '最重要的字段。Claude 根据描述判断何时自动加载此 Skill。写得像"搜索关键词"一样精准 -- 涵盖场景但不泛化。',
                example: 'description: Review code for security and performance issues',
              },
              {
                field: 'allowed-tools',
                desc: '限制 Skill 可使用的工具，实现最小权限原则。Review Skill 不该有 Edit 权限；Deploy Skill 只需要 Bash。',
                example: 'allowed-tools: Read, Bash, Glob, Grep',
              },
              {
                field: 'model',
                desc: '覆盖当前会话的模型。让简单任务用更快更便宜的模型，复杂任务用最强模型。',
                example: 'model: sonnet',
              },
              {
                field: 'effort',
                desc: '覆盖推理深度（low / medium / high）。减少不必要的深度思考可以显著提升响应速度。',
                example: 'effort: medium',
              },
            ].map((item) => (
              <div key={item.field} className="px-4 py-3">
                <div className="flex items-baseline gap-2 mb-1">
                  <code
                    className="text-sm font-semibold"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    {item.field}
                  </code>
                </div>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {item.desc}
                </p>
                <code
                  className="text-xs mt-1 block"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {item.example}
                </code>
              </div>
            ))}
          </div>
        </div>

        {/* ── Dynamic Injection ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          动态注入：让 Skill 获取实时信息
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Skill 的 Markdown 指令体支持两种动态机制：
          <code style={{ color: 'var(--color-accent)' }}>{' `!command` '}</code>
          在加载时执行 shell 命令并注入输出，以及变量替换（<code style={{ color: 'var(--color-accent)' }}>$ARGUMENTS</code>、
          <code style={{ color: 'var(--color-accent)' }}>$N</code>、
          <code style={{ color: 'var(--color-accent)' }}>{'${CLAUDE_SESSION_ID}'}</code> 等）。
        </p>

        <ConfigExample
          title=".claude/skills/review-staged/SKILL.md"
          language="markdown"
          code={`---
name: review-staged
description: Review currently staged git changes
allowed-tools: Read, Bash, Glob, Grep
---

# Review Staged Changes

当前暂存区的变更:

\`!git diff --cached --stat\`

详细 diff:

\`!git diff --cached\`

Review 这些变更，重点关注:
1. 逻辑错误和边界条件
2. 安全漏洞
3. 是否符合项目 CLAUDE.md 中的规范`}
          annotations={[
            { line: 11, text: '`!command` 语法：Skill 加载时执行此 shell 命令，输出替换到这个位置。每次调用都是最新数据。' },
            { line: 15, text: '可以有多个 `!command`。它们按顺序执行，各自替换为执行结果。' },
          ]}
        />

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          变量替换让 Skill 接受用户传入的参数：
        </p>

        <CodeBlock
          language="markdown"
          title="variable-substitution.md"
          code={`---
name: explain
description: Explain a file or function in detail
---

# Explain: $ARGUMENTS

分析以下目标: $0

$ARGUMENTS — 所有参数拼接为一个字符串
$0        — 第一个参数
$1        — 第二个参数
\${CLAUDE_SESSION_ID} — 当前会话 ID

用法:
  /explain src/auth/jwt.ts        → $0 = "src/auth/jwt.ts"
  /explain validateToken strict   → $0 = "validateToken", $1 = "strict"`}
        />

        <QualityCallout title="description 字段是自动调用的关键">
          当 Claude 在对话中遇到一个任务时，它会扫描所有可用 Skill 的 description 字段，
          判断是否有合适的 Skill 可以加载。所以 description 要写得像"搜索关键词" --
          精准描述 Skill 的适用场景，但不要太泛化（否则会在不相关的场景中被误触发）。
        </QualityCallout>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 6.3: Skill 的作用域与优先级
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          6.3 Skill 的作用域与优先级
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Skill 可以放在三个不同的位置，每个位置对应不同的使用场景和优先级。
          理解作用域对于避免命名冲突和合理组织 Skill 至关重要。
        </p>

        {/* Scope Table */}
        <div
          className="rounded-lg overflow-hidden my-4"
          style={{
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg-secondary)',
          }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{
                  background: 'var(--color-bg-tertiary)',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>作用域</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>路径</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>适用场景</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>优先级</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  scope: 'Enterprise',
                  path: '企业管理员配置',
                  useCase: '公司级标准流程（安全审查、合规检查）。由管理员统一下发，开发者无法覆盖。',
                  priority: '最高',
                  color: 'var(--color-tier-l3)',
                },
                {
                  scope: 'Personal',
                  path: '~/.claude/skills/',
                  useCase: '个人常用工作流（自己的 review 习惯、常用脚手架）。跨项目共享。',
                  priority: '高',
                  color: 'var(--color-tier-l2)',
                },
                {
                  scope: 'Project',
                  path: '.claude/skills/',
                  useCase: '项目专属流程（部署、changelog、项目特定 review 规则）。随代码库分发。',
                  priority: '标准',
                  color: 'var(--color-tier-l1)',
                },
                {
                  scope: 'Plugin',
                  path: '通过 /install 安装',
                  useCase: '社区或团队共享的能力包。自动命名空间隔离（plugin-name:skill-name）。',
                  priority: '标准',
                  color: 'var(--color-text-muted)',
                },
              ].map((row) => (
                <tr
                  key={row.scope}
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  <td className="px-4 py-3 font-semibold" style={{ color: row.color }}>
                    {row.scope}
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{row.path}</code>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                    {row.useCase}
                  </td>
                  <td className="px-4 py-3 font-medium" style={{ color: row.color }}>
                    {row.priority}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          优先级规则：<strong>Enterprise &gt; Personal &gt; Project</strong>。
          当同名 Skill 存在于多个作用域时，高优先级的会覆盖低优先级的。
          Plugin 的 Skill 通过命名空间隔离（<code style={{ color: 'var(--color-accent)' }}>plugin-name:skill-name</code>），
          不会和项目 Skill 冲突。
        </p>

        <CodeBlock
          language="bash"
          title="skill-scope-examples.sh"
          code={`# 个人 Skill -- 你自己的 review 习惯，跨项目共享
~/.claude/skills/my-review/SKILL.md

# 项目 Skill -- 项目专属部署流程，随 git 分发给团队
.claude/skills/deploy/SKILL.md

# Plugin Skill -- 通过插件安装，自动命名空间隔离
# 调用方式: /playwright:screenshot（plugin-name:skill-name）
# 或直接 /screenshot（如果没有名称冲突）

# 查看所有已加载的 Skills
/skills`}
        />

        <QualityCallout title="Skill 的组织建议">
          把"个人偏好"放 Personal（如你习惯的 review 风格），把"团队标准"放 Project（如部署流程、changelog 格式）。
          这样团队成员可以有自己的个人 Skill，同时共享项目级的标准流程。
          Personal Skill 不会提交到 git，不会干扰团队。
        </QualityCallout>

        <ExerciseCard
          tier="l1"
          title="创建你的第一个 Skill"
          description="在你的项目中创建 .claude/skills/greet/SKILL.md，写一个简单的 /greet Skill：接受一个名字参数，输出个性化的问候。在 Claude Code 中输入 /greet World 测试。"
          checkpoints={[
            '文件路径正确：.claude/skills/greet/SKILL.md',
            'frontmatter 包含 name 和 description',
            '指令体使用 $ARGUMENTS 或 $0 引用参数',
            '在 Claude Code 中 /greet World 能正确触发',
            '/skills 命令能看到 greet 已加载',
          ]}
        />
      </section>

      {/* ═══════════════════════════════════════════════
          Section 6.4: 从 Plugin 市场获取能力
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          6.4 从 Plugin 市场获取能力
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          自己写 Skill 很强大，但更多时候你不需要从零开始。
          Claude Code 拥有一个丰富的 Plugin 生态 -- 百余个官方和社区 Plugin 覆盖了常见的开发场景。
          每个 Plugin 就是一组打包好的 Skills（有时还包含 Hooks、MCP 配置），一条命令安装，立即可用。
        </p>

        <CodeBlock
          language="bash"
          title="plugin-commands.sh"
          code={`# 浏览 Plugin 市场
/plugin

# 安装一个 Plugin
/install @anthropic/playwright

# 查看已安装的 Plugin
/plugins

# 卸载 Plugin
/uninstall @anthropic/playwright`}
        />

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          按场景推荐 Plugin
        </h3>

        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          以下是按开发场景分类的常用 Plugin。带有 <span style={{ color: 'var(--color-accent)' }}>Anthropic Verified</span> 标记
          的 Plugin 经过 Anthropic 官方安全审查和质量验证。
        </p>

        <div
          className="rounded-lg overflow-hidden"
          style={{
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg-secondary)',
          }}
        >
          <div
            className="px-4 py-3 text-sm font-medium"
            style={{
              borderBottom: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              background: 'var(--color-bg-tertiary)',
            }}
          >
            常用 Plugin 推荐
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {[
              {
                name: 'Playwright',
                badge: 'Anthropic Verified',
                desc: '浏览器自动化。截图、点击、表单填写、端到端测试。让 Claude 能直接操作浏览器验证 UI 变更。',
                scenario: '前端开发 / E2E 测试',
              },
              {
                name: 'GitHub',
                badge: 'Anthropic Verified',
                desc: 'GitHub 深度集成。创建 PR、review comments、管理 Issues、触发 Actions。将 Claude 融入 GitHub 工作流。',
                scenario: '代码协作 / CI-CD',
              },
              {
                name: 'Figma',
                badge: 'Anthropic Verified',
                desc: '设计稿转代码。读取 Figma 设计稿，生成对应的前端组件。支持设计系统变量和组件映射。',
                scenario: '设计转开发',
              },
              {
                name: 'Sentry',
                badge: 'Partner',
                desc: '错误监控集成。拉取 Sentry 错误报告、分析堆栈、定位到代码行。让 Claude 直接诊断线上问题。',
                scenario: '线上运维 / Debug',
              },
              {
                name: 'Chrome DevTools',
                badge: 'Anthropic Verified',
                desc: '浏览器调试。性能分析、网络请求检查、Console 日志、Lighthouse 审计。直接连接 Chrome 实例做调试。',
                scenario: '前端调试 / 性能优化',
              },
            ].map((plugin) => (
              <div key={plugin.name} className="px-4 py-3">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    {plugin.name}
                  </span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded"
                    style={{
                      background: plugin.badge === 'Anthropic Verified'
                        ? 'var(--color-accent-subtle)'
                        : 'var(--color-bg-surface)',
                      border: `1px solid ${plugin.badge === 'Anthropic Verified'
                        ? 'var(--color-border-accent)'
                        : 'var(--color-border)'}`,
                      color: plugin.badge === 'Anthropic Verified'
                        ? 'var(--color-accent)'
                        : 'var(--color-text-muted)',
                    }}
                  >
                    {plugin.badge}
                  </span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded"
                    style={{
                      background: 'var(--color-bg-surface)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    {plugin.scenario}
                  </span>
                </div>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {plugin.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── How to evaluate plugin quality ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          如何评估 Plugin 质量
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          安装第三方 Plugin 前，用以下清单快速评估其可靠性：
        </p>

        <div
          className="rounded-lg p-5 space-y-3"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          {[
            {
              check: 'Anthropic Verified 标记',
              desc: '经过官方安全审查，质量有保障。优先选择有此标记的 Plugin。',
            },
            {
              check: 'GitHub Star 数和维护频率',
              desc: '超过 100 star、最近 30 天内有 commit 的 Plugin 通常更可靠。',
            },
            {
              check: 'allowed-tools 权限范围',
              desc: '检查 Plugin 的 Skill 是否请求了过多的权限。一个 review Plugin 不需要 Write 权限。',
            },
            {
              check: 'SKILL.md 可读性',
              desc: 'Plugin 的核心就是 SKILL.md 文件。直接阅读它，确认指令合理、没有可疑命令。',
            },
            {
              check: '社区评价和 Issue 数',
              desc: '查看其他用户的反馈。未解决的安全相关 Issue 是危险信号。',
            },
          ].map((item) => (
            <div key={item.check} className="flex items-start gap-2">
              <span className="text-sm flex-shrink-0" style={{ color: 'var(--color-accent)' }}>-</span>
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {item.check}
                </span>
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {' '}{item.desc}
                </span>
              </div>
            </div>
          ))}
        </div>

        <QualityCallout title="Plugin 的本质是透明的">
          和很多闭源插件系统不同，Claude Code Plugin 的核心就是 SKILL.md 文件 -- 纯文本 Markdown。
          你可以完整阅读它的每一行指令，清楚地知道它会让 Claude 做什么。
          安装前花 2 分钟读一下 SKILL.md，比安装后出问题再排查划算得多。
        </QualityCallout>

        <ExerciseCard
          tier="l1"
          title="安装并使用一个 Plugin"
          description="在 Claude Code 中使用 /plugin 浏览市场，选择一个与你项目相关的 Plugin（如 Playwright 或 GitHub），安装并运行它的一个 Skill。"
          checkpoints={[
            '/plugin 命令能正常打开 Plugin 市场',
            '成功安装一个 Plugin',
            '/plugins 命令能看到已安装的 Plugin',
            '成功运行 Plugin 提供的某个 Skill',
            '阅读了 Plugin 的 SKILL.md 文件，理解它的指令内容',
          ]}
        />
      </section>

      {/* ═══════════════════════════════════════════════
          Section 6.5: 常见问题排查
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          6.5 常见问题排查
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Skills 系统的设计很直观，但初次使用时难免遇到一些问题。以下是最常见的三类问题及排查方法。
          不要慌 -- 大多数问题都是路径或 frontmatter 格式导致的，修复只需几秒钟。
        </p>

        {/* ── Problem 1: Skill 没加载 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Skill 没有被加载
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          输入 /my-skill 后 Claude 不认识这个命令，或者期望自动触发的 Skill 没有加载。
        </p>

        <CodeBlock
          language="bash"
          title="debug-skill-not-loaded.sh"
          code={`# Step 1: 确认文件位置正确
# Skill 必须放在以下目录之一:
ls ~/.claude/skills/          # 个人 Skills
ls .claude/skills/            # 项目 Skills

# Step 2: 确认目录结构
# 每个 Skill 是一个目录，包含 SKILL.md
# 正确:  .claude/skills/deploy/SKILL.md
# 错误:  .claude/skills/deploy.md (没有 SKILL.md)

# Step 3: 检查 frontmatter 格式
# YAML frontmatter 必须以 --- 开头和结尾
# 常见错误: 缩进不对、冒号后没空格、值未引号包裹

# Step 4: 查看已加载的 Skills
/skills

# Step 5: 使用 /debug 获取详细诊断信息
/debug`}
        />

        <div
          className="rounded-lg p-4 text-sm space-y-2"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>常见原因速查：</p>
          <ul className="space-y-1" style={{ color: 'var(--color-text-secondary)' }}>
            <li>- 文件名不是 SKILL.md（注意大写）</li>
            <li>- YAML frontmatter 中有语法错误（缩进必须用空格，不能用 Tab）</li>
            <li>- name 字段缺失或为空</li>
            <li>- 同名 Skill 在更高优先级的作用域中存在，覆盖了你的 Skill</li>
            <li>- user-invocable: false 但你试图用斜杠命令触发</li>
          </ul>
        </div>

        {/* ── Problem 2: Skill 冲突 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Skill 和其他 Skill 冲突
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          两个 Skill 的 description 太相似，导致 Claude 在不该触发时触发了错误的 Skill。
        </p>

        <CodeBlock
          language="bash"
          title="debug-skill-conflict.txt"
          code={`# 问题场景:
# Skill A: description: "Review code changes"
# Skill B: description: "Review and fix code changes"
# → Claude 看到代码变更时，可能随机选择 A 或 B

# 解决方案 1: 让 description 更精确，减少重叠
# Skill A: description: "Review staged git changes for security and logic issues"
# Skill B: description: "Auto-fix linting and formatting issues in changed files"

# 解决方案 2: 使用命名空间避免冲突
# Plugin Skill 自动有命名空间: playwright:screenshot
# 项目 Skill 可以用前缀: proj-review, proj-deploy

# 解决方案 3: 查看优先级
/skills  # 检查哪个 Skill 实际生效`}
        />

        {/* ── Problem 3: Dynamic injection issues ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          动态注入 (!command) 问题
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <code style={{ color: 'var(--color-accent)' }}>{'`!command`'}</code> 没有被执行，
          输出为空，或者执行了错误的命令。
        </p>

        <div
          className="rounded-lg p-4 text-sm space-y-2"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>排查步骤：</p>
          <ul className="space-y-1" style={{ color: 'var(--color-text-secondary)' }}>
            <li>- 确认语法正确：必须是反引号 + 感叹号 + 命令（<code style={{ color: 'var(--color-accent)' }}>{'`!git diff`'}</code>），不是 <code>{'!`git diff`'}</code></li>
            <li>- 命令在当前工作目录下能独立执行吗？手动在终端跑一次确认</li>
            <li>- 命令输出太大会被截断。用 <code style={{ color: 'var(--color-accent)' }}>{'`!git diff --stat`'}</code> 替代 <code>{'`!git diff`'}</code> 来减少输出量</li>
            <li>- 命令执行失败（exit code 非 0）时，错误信息会被注入到上下文中。检查 Skill 输出里有没有报错</li>
            <li>- $ARGUMENTS 替换发生在 !command 执行之前。如果命令中引用了 $0 且用户没传参数，命令可能异常</li>
          </ul>
        </div>

        <QualityCallout title="排查万能方法：/debug">
          遇到任何 Skill 相关问题，第一步都是跑 /debug。它会输出当前会话的完整诊断信息，
          包括已加载的 Skills、搜索路径、冲突检测、frontmatter 解析结果。
          这比盲目猜测高效得多。
        </QualityCallout>

        <ExerciseCard
          tier="l2"
          title="编写 Code Review Skill 并实战测试"
          description={`基于本章所学，编写一个完整的 Code Review Skill。要求：(1) 使用 \`!command\` 动态注入 git diff；(2) 用 allowed-tools 限制为只读权限；(3) 用 model 指定更经济的模型。然后在一个真实的代码变更上测试它，评估 review 质量。`}
          checkpoints={[
            '.claude/skills/review/SKILL.md 文件正确创建',
            'frontmatter 包含 name, description, allowed-tools, model',
            '指令体使用 `!git diff` 动态注入变更内容',
            'allowed-tools 只包含只读工具（Read, Bash, Glob, Grep）',
            '在真实代码变更上测试：review 输出结构化、有文件行号引用',
            '/skills 命令确认 Skill 已正确加载',
          ]}
        />
      </section>

      {/* ═══════════════════════════════════════════════
          Reference Section
          ═══════════════════════════════════════════════ */}
      <ReferenceSection version="Claude Code 2026">
        <div className="space-y-8">
          {/* ── Complete Frontmatter ── */}
          <div>
            <h3
              className="text-sm font-semibold mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              SKILL.md 完整 Frontmatter 字段
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <th className="text-left py-2 pr-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>字段</th>
                    <th className="text-left py-2 pr-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>类型</th>
                    <th className="text-left py-2 pr-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>默认值</th>
                    <th className="text-left py-2 font-medium" style={{ color: 'var(--color-text-primary)' }}>说明</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { field: 'name', type: 'string', def: '(必填)', desc: '命令名，用 /name 触发' },
                    { field: 'description', type: 'string', def: '""', desc: 'Skill 描述，Claude 自动调用的依据' },
                    { field: 'disable-model-invocation', type: 'boolean', def: 'false', desc: '禁止 Claude 自动调用，仅手动触发' },
                    { field: 'user-invocable', type: 'boolean', def: 'true', desc: '是否允许用户用斜杠命令触发' },
                    { field: 'allowed-tools', type: 'string', def: '(全部)', desc: '逗号分隔的工具白名单' },
                    { field: 'model', type: 'string', def: '(跟随会话)', desc: '覆盖模型选择' },
                    { field: 'effort', type: 'string', def: '(跟随会话)', desc: '覆盖推理深度 (low/medium/high)' },
                    { field: 'context', type: 'string', def: 'main', desc: 'fork: 隔离执行；main: 共享上下文' },
                    { field: 'agent', type: 'boolean', def: 'false', desc: '作为子 Agent 执行（独立工具循环）' },
                    { field: 'hooks', type: 'object', def: '{}', desc: 'Skill 专属 Hook 配置' },
                    { field: 'paths', type: 'string[]', def: '[]', desc: '限制 Skill 的文件访问范围' },
                    { field: 'shell', type: 'string', def: '(系统默认)', desc: '指定 !command 执行的 shell' },
                  ].map((row) => (
                    <tr key={row.field} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td className="py-2 pr-3">
                        <code style={{ color: 'var(--color-accent)' }}>{row.field}</code>
                      </td>
                      <td className="py-2 pr-3 font-mono">{row.type}</td>
                      <td className="py-2 pr-3 font-mono">{row.def}</td>
                      <td className="py-2">{row.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Built-in Skills ── */}
          <div>
            <h3
              className="text-sm font-semibold mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              内置 Skills 列表
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <th className="text-left py-2 pr-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>命令</th>
                    <th className="text-left py-2 font-medium" style={{ color: 'var(--color-text-primary)' }}>功能</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { cmd: '/commit', desc: '生成语义化 commit message 并提交' },
                    { cmd: '/batch', desc: '批量处理多个文件的相同操作' },
                    { cmd: '/loop', desc: '定时循环执行指定命令' },
                    { cmd: '/simplify', desc: '审查代码复用性、质量和效率，修复问题' },
                    { cmd: '/debug', desc: '输出会话诊断信息（已加载 Skills、Hooks、权限等）' },
                    { cmd: '/review', desc: '对代码变更进行结构化 review' },
                    { cmd: '/skills', desc: '列出所有已加载的 Skills' },
                    { cmd: '/plugins', desc: '列出所有已安装的 Plugins' },
                    { cmd: '/plugin', desc: '浏览 Plugin 市场' },
                    { cmd: '/install', desc: '安装 Plugin' },
                    { cmd: '/uninstall', desc: '卸载 Plugin' },
                  ].map((row) => (
                    <tr key={row.cmd} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td className="py-2 pr-3">
                        <code style={{ color: 'var(--color-accent)' }}>{row.cmd}</code>
                      </td>
                      <td className="py-2">{row.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Popular Plugins by Category ── */}
          <div>
            <h3
              className="text-sm font-semibold mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              常用 Plugin（按分类）
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  category: '前端 / UI',
                  plugins: ['Playwright (E2E 测试)', 'Chrome DevTools (调试)', 'Figma (设计稿转代码)', 'Storybook (组件文档)'],
                },
                {
                  category: '代码协作',
                  plugins: ['GitHub (PR/Issue)', 'GitLab (MR/Pipeline)', 'Linear (项目管理)', 'Jira (任务跟踪)'],
                },
                {
                  category: '运维 / 监控',
                  plugins: ['Sentry (错误监控)', 'Datadog (性能监控)', 'AWS (云资源管理)', 'Vercel (部署)'],
                },
                {
                  category: '数据 / API',
                  plugins: ['PostgreSQL (数据库)', 'Supabase (BaaS)', 'Stripe (支付)', 'Twilio (通信)'],
                },
              ].map((group) => (
                <div
                  key={group.category}
                  className="rounded-lg p-3"
                  style={{
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-accent)' }}>
                    {group.category}
                  </p>
                  <ul className="space-y-1">
                    {group.plugins.map((p) => (
                      <li key={p} className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        - {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ReferenceSection>
    </div>
  )
}
