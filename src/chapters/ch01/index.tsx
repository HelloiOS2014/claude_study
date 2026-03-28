import { lazy } from 'react'
import { CodeBlock } from '../../components/content/CodeBlock'
import { QualityCallout } from '../../components/content/QualityCallout'
import { ExerciseCard } from '../../components/content/ExerciseCard'
import { AnimationWrapper } from '../../components/animation/AnimationWrapper'
import { ReferenceSection } from '../../components/content/ReferenceSection'

const LazyRequestLifecycle = lazy(() => import('../../remotion/ch00/RequestLifecycle'))
const LazyTokenEconomy = lazy(() => import('../../remotion/ch00/TokenEconomy'))

export default function Ch01() {
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
          别急着学理论。打开终端，输入 <code style={{ color: 'var(--color-accent)' }}>claude</code>，让它帮你做一件事——任何事。
          然后我们一起看看刚才到底发生了什么，为什么它有时候像天才、有时候像实习生，
          以及你要怎样掌控这一切。
        </p>
        <p
          className="text-sm"
          style={{ color: 'var(--color-text-muted)' }}
        >
          预计阅读时间 ~45 分钟。如果你已经在用 Claude Code，可以跳过 1.1，直接看 1.2。
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════
          Section 1.1: 你的第一次对话
          ═══════════════════════════════════════════════════════ */}
      <section className="space-y-8">
        <h2
          className="text-2xl font-bold mb-6"
          style={{ color: 'var(--color-text-primary)' }}
        >
          1.1 你的第一次对话
        </h2>

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          如果你还没装 Claude Code，先跑一行命令：
        </p>

        <CodeBlock
          language="bash"
          title="terminal"
          code={`npm install -g @anthropic-ai/claude-code`}
        />

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          装好之后，<code style={{ color: 'var(--color-accent)' }}>cd</code> 到你的任意一个项目目录，然后：
        </p>

        <CodeBlock
          language="bash"
          title="terminal"
          code={`claude`}
        />

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          第一次启动会让你登录 Anthropic 账户。登录完成后，你就进入了交互界面。
          试着输入一条消息——什么都行。下面是一个真实的交互示例：
        </p>

        <CodeBlock
          language="bash"
          title="你的第一次对话 (示例)"
          code={`> 帮我看看这个项目是做什么的，给我一个简短的总结

⏵ Read(package.json)
⏵ Read(README.md)
⏵ Glob(src/**/*.ts)
⏵ Read(src/index.ts)

这是一个 TypeScript 编写的 CLI 工具，用于……

  主要功能：
  1. 解析 Markdown 文件并提取元数据
  2. 生成静态站点的路由表
  3. 支持增量构建

  技术栈：Node.js + TypeScript + unified
  入口文件：src/index.ts
  当前版本：v0.3.2`}
        />

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          注意看：你只说了一句话，Claude 就<strong style={{ color: 'var(--color-text-primary)' }}>自己决定</strong>要读哪些文件、
          用什么顺序、读多少内容。它先读了 package.json 了解项目元信息，再读 README 了解项目定位，
          然后用 Glob 扫描了源码结构，最后深入了入口文件。
          这不是预设的脚本——是模型根据你的问题<strong style={{ color: 'var(--color-text-primary)' }}>实时推理</strong>出的行动计划。
        </p>

        {/* ── 权限模式 ── */}
        <h3
          className="text-xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          当它问你"可以吗？"
        </h3>

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          你很快会遇到这种提示：Claude 想执行一个命令或修改一个文件，停下来问你同不同意。
          这是<strong style={{ color: 'var(--color-text-primary)' }}>权限系统</strong>在工作。Claude Code 有三种权限模式：
        </p>

        <div
          className="rounded-lg overflow-hidden"
          style={{ border: '1px solid var(--color-border)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--color-bg-secondary)' }}>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>模式</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>行为</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>适合场景</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--color-text-secondary)' }}>
              <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                <td className="px-4 py-3 font-mono" style={{ color: 'var(--color-accent)' }}>Ask</td>
                <td className="px-4 py-3">每次工具调用都问你确认</td>
                <td className="px-4 py-3">刚开始用，或处理敏感操作</td>
              </tr>
              <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                <td className="px-4 py-3 font-mono" style={{ color: 'var(--color-accent)' }}>Auto-edit</td>
                <td className="px-4 py-3">文件编辑自动执行，其他操作仍需确认</td>
                <td className="px-4 py-3">日常开发，信任 Claude 的编辑能力</td>
              </tr>
              <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                <td className="px-4 py-3 font-mono" style={{ color: 'var(--color-accent)' }}>Auto</td>
                <td className="px-4 py-3">所有操作自动执行，不问</td>
                <td className="px-4 py-3">非敏感任务 + 有足够权限规则保护</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          在终端里按 <code style={{ color: 'var(--color-accent)' }}>Shift+Tab</code> 可以在这三种模式之间切换。
          建议新手先用 <strong style={{ color: 'var(--color-text-primary)' }}>Ask 模式</strong>。
          每次 Claude 请求权限时，仔细看它要做什么——这本身就是学习的过程。
          等你熟悉了它的行为模式，再逐步放宽。
        </p>

        <ExerciseCard
          tier="l1"
          title="你的第一次对话"
          description="打开终端，cd 到一个你熟悉的项目，运行 claude。让它总结项目结构，观察它选择读了哪些文件。然后让它做一个小修改（比如修复一个 typo 或添加一行注释），观察权限确认的过程。"
          checkpoints={[
            '成功启动 Claude Code 并完成一次对话',
            '观察到至少 3 次工具调用（Read、Glob 等）',
            '体验到权限确认提示并做出选择',
          ]}
        />
      </section>

      {/* ═══════════════════════════════════════════════════════
          Section 1.2: 刚才发生了什么？
          ═══════════════════════════════════════════════════════ */}
      <section className="space-y-8">
        <h2
          className="text-2xl font-bold mb-6"
          style={{ color: 'var(--color-text-primary)' }}
        >
          1.2 刚才发生了什么？
        </h2>

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          你刚才输入了一句话，Claude 读了几个文件，然后给了你答案。
          看起来很简单。但在这几秒钟里，系统走完了一条精确的处理链路——理解这条链路，
          就是理解你接下来能控制什么。
        </p>

        <AnimationWrapper
          component={LazyRequestLifecycle}
          durationInFrames={210}
          fallbackText="请求生命周期动画加载失败"
        />

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          一条请求的生命周期：
        </p>

        <CodeBlock
          language="bash"
          title="request-lifecycle.txt"
          code={`你的输入
  │
  ▼
系统提示装配 (你的 CLAUDE.md + 内置规则 + 项目记忆)
  │
  ▼
模型推理 (理解意图，决定行动计划)
  │
  ▼
工具选择 (Read? Edit? Bash? Grep? ...)
  │
  ▼
权限校验 (deny → ask → allow)
  │
  ▼
执行 (实际读文件 / 写文件 / 跑命令)
  │
  ▼
结果注入 (工具输出追加到对话上下文)
  │
  ▼
模型生成回复 / 决定是否需要更多工具调用
  │
  ▼
你看到的回复`}
        />

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          看起来是一条直线，但实际上它经常<strong style={{ color: 'var(--color-text-primary)' }}>循环</strong>——Claude 读了一个文件后发现需要再读另一个，
          或者编辑完代码后自动运行测试确认结果。一条"帮我修一下这个 bug"的请求，可能在几秒内走完这条链路 5-8 次。
        </p>

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          这条链路里，有几个关键环节你可以直接控制：
        </p>

        <div
          className="rounded-lg overflow-hidden"
          style={{ border: '1px solid var(--color-border)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--color-bg-secondary)' }}>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>环节</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>你能控制什么</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>怎么学</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--color-text-secondary)' }}>
              <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>系统提示</td>
                <td className="px-4 py-3">通过 CLAUDE.md 注入项目规范和偏好</td>
                <td className="px-4 py-3">Ch04</td>
              </tr>
              <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>模型推理</td>
                <td className="px-4 py-3">通过 prompt 技巧和 effort 级别影响推理质量</td>
                <td className="px-4 py-3">Ch02</td>
              </tr>
              <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>权限校验</td>
                <td className="px-4 py-3">通过 settings.json 配置 deny/ask/allow 规则</td>
                <td className="px-4 py-3">Ch04, Ch11</td>
              </tr>
              <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>执行</td>
                <td className="px-4 py-3">通过 Hooks 在工具执行前后插入你的脚本</td>
                <td className="px-4 py-3">Ch07</td>
              </tr>
              <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>能力边界</td>
                <td className="px-4 py-3">通过 Skills 扩展 Claude 的能力定义</td>
                <td className="px-4 py-3">Ch06</td>
              </tr>
            </tbody>
          </table>
        </div>

        <QualityCallout title="核心洞察">
          <p>
            这条请求链路中<strong style={{ color: 'var(--color-text-primary)' }}>大部分环节你都能控制</strong>——
            这就是这个教程要教你的。你不只是 Claude 的用户，你是它运行环境的设计者。
          </p>
        </QualityCallout>
      </section>

      {/* ═══════════════════════════════════════════════════════
          Section 1.3: 三个时代
          ═══════════════════════════════════════════════════════ */}
      <section className="space-y-8">
        <h2
          className="text-2xl font-bold mb-6"
          style={{ color: 'var(--color-text-primary)' }}
        >
          1.3 三个时代
        </h2>

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          要理解 Claude Code 为什么是现在这个样子，我们需要快速回顾 AI 编程工具走过的三个阶段。
          这不是历史课——这三个阶段对应着三种完全不同的思维方式，而大多数人还卡在第一个阶段。
        </p>

        {/* ── 第一时代 ── */}
        <div
          className="p-5 rounded-lg"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            第一时代：Prompt Engineering (2022-2024)
          </h3>
          <p
            className="text-sm leading-relaxed mb-3"
            style={{ color: 'var(--color-text-muted)' }}
          >
            核心问题："我该怎么问？"
          </p>
          <p
            className="leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            ChatGPT 发布后，所有人都在研究"怎样写 prompt 才能得到更好的答案"。
            角色扮演、思维链、few-shot 示例……人们把精力集中在<strong style={{ color: 'var(--color-text-primary)' }}>一句话的措辞</strong>上。
            这是对的——但有天花板。
            无论你的 prompt 写得多精妙，模型只能看到你喂给它的那一小段文本。
          </p>
        </div>

        {/* ── 第二时代 ── */}
        <div
          className="p-5 rounded-lg"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            第二时代：Context Engineering (2025)
          </h3>
          <p
            className="text-sm leading-relaxed mb-3"
            style={{ color: 'var(--color-text-muted)' }}
          >
            核心问题："模型该看到什么？"
          </p>
          <p
            className="leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            人们意识到：<strong style={{ color: 'var(--color-text-primary)' }}>输入比措辞更重要</strong>。
            与其绞尽脑汁写 prompt，不如让模型看到正确的上下文——相关的代码、需求文档、测试用例、架构约定。
            CLAUDE.md 就是这个时代的产物：一个让你系统化地把项目知识注入模型的机制。
            Cursor Rules、Windsurf Rules 也是同一思路。关注点从"一句话的质量"转向了"输入窗口的质量"。
          </p>
        </div>

        {/* ── 第三时代 ── */}
        <div
          className="p-5 rounded-lg"
          style={{
            background: 'rgba(217, 119, 87, 0.06)',
            border: '1px solid rgba(217, 119, 87, 0.25)',
          }}
        >
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: 'var(--color-accent)' }}
          >
            第三时代：Harness Engineering (2026)
          </h3>
          <p
            className="text-sm leading-relaxed mb-3"
            style={{ color: 'var(--color-text-muted)' }}
          >
            核心问题："整个环境该怎么设计？"
          </p>
          <p
            className="leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Context Engineering 解决了"模型该看到什么"，但还有大量问题它没回答：
            当模型犯错时谁来兜底？怎样保证代码风格一致？团队里十个人的 Claude 行为怎么统一？
            模型的行为怎样可审计、可复现？
          </p>
          <p
            className="leading-relaxed mt-3"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Harness Engineering 的回答是：<strong style={{ color: 'var(--color-text-primary)' }}>不要只优化模型的输入，要设计模型运行的整个系统</strong>。
            这个系统叫做 <strong style={{ color: 'var(--color-accent)' }}>Harness</strong>（驾驭系统），它包括：
          </p>
          <ul
            className="list-disc list-inside space-y-1 mt-3 text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <li><strong style={{ color: 'var(--color-text-primary)' }}>CLAUDE.md</strong> — 上下文策展（告诉模型项目规范）</li>
            <li><strong style={{ color: 'var(--color-text-primary)' }}>Skills</strong> — 能力定义（让模型在特定场景使用特定流程）</li>
            <li><strong style={{ color: 'var(--color-text-primary)' }}>Hooks</strong> — 确定性保障（在模型外部拦截和验证行为）</li>
            <li><strong style={{ color: 'var(--color-text-primary)' }}>权限模型</strong> — 安全边界（精确控制模型能做什么）</li>
            <li><strong style={{ color: 'var(--color-text-primary)' }}>验证循环</strong> — 质量保证（自动测试、lint、type-check）</li>
          </ul>
        </div>

        {/* ── 核心公式 ── */}
        <div
          className="p-6 rounded-lg text-center"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <p
            className="text-2xl font-bold mb-3"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Agent = Model + Harness
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            模型的智能是基础，但 Harness 决定了这个智能能否可靠地为你工作。
            LangChain 的实测数据：仅改进 Harness（不换模型），Agent 的基准测试得分提升了 13.7%。
            <strong style={{ color: 'var(--color-text-primary)' }}> 基础设施比智能更重要</strong>。
          </p>
        </div>

        {/* ── 教程路线图 ── */}
        <h3
          className="text-xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          这个教程的路线图
        </h3>

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          这三个时代不是互相替代的，而是层层叠加的。你仍然需要 Prompt Engineering 的技巧，
          仍然需要 Context Engineering 的策略，然后在此基础上用 Harness Engineering 把一切串联起来。
          本教程就是按这个脉络展开的：
        </p>

        <CodeBlock
          language="bash"
          title="tutorial-roadmap.txt"
          code={`Part 1: 和 AI 对话 ── Prompt Engineering
  Ch01  Claude Code 的世界观          ← 你在这里
  Ch02  Prompt 工程
  Ch03  Vibe Coding 的边界

Part 2: 构建驾驭系统 ── Harness Engineering
  Ch04  CLAUDE.md 系统
  Ch05  Plan Mode 与规划力
  Ch06  Skills 体系
  Ch07  Hooks 自动化
  Ch08  Agent 协作

Part 3: 带领团队
  Ch09  Agent SDK 与程序化接入
  Ch10  方法论与原则
  Ch11  组织级治理`}
        />

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Part 1 教你<strong style={{ color: 'var(--color-text-primary)' }}>和 AI 对话</strong>——让你快速从"能用"到"用得好"。
          Part 2 教你<strong style={{ color: 'var(--color-text-primary)' }}>构建系统</strong>——把对话技巧固化成可复用的工程基础设施。
          Part 3 教你<strong style={{ color: 'var(--color-text-primary)' }}>规模化</strong>——让整个团队和组织安全、高效地使用 Claude Code。
        </p>

        <QualityCallout title="你的角色在升级">
          <p className="mb-2">
            注意三个时代中<strong style={{ color: 'var(--color-text-primary)' }}>人的角色</strong>的变化：
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Prompt Engineering 时代：你是<strong>提问者</strong>——研究怎么问更好的问题</li>
            <li>Context Engineering 时代：你是<strong>架构师</strong>——设计模型该看到什么信息</li>
            <li>Harness Engineering 时代：你是<strong>系统设计师</strong>——设计模型运行的整个环境</li>
          </ul>
          <p className="mt-2">
            读完这个教程，你的目标不是成为"更好的 prompt 工程师"，
            而是成为<strong style={{ color: 'var(--color-text-primary)' }}>能设计可靠 AI 工作系统的工程师</strong>。
          </p>
        </QualityCallout>
      </section>

      {/* ═══════════════════════════════════════════════════════
          Section 1.4: Token 经济学
          ═══════════════════════════════════════════════════════ */}
      <section className="space-y-8">
        <h2
          className="text-2xl font-bold mb-6"
          style={{ color: 'var(--color-text-primary)' }}
        >
          1.4 Token 经济学
        </h2>

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          在你用 Claude Code 做事的时候，有一种隐性资源在不断消耗——<strong style={{ color: 'var(--color-text-primary)' }}>token</strong>。
          Token 大致等于文本的"字节数"（英文约 4 字符 = 1 token，中文约 1-2 字 = 1 token）。
          每次交互，你的输入、系统提示、工具调用的结果、Claude 的回复——全部折算成 token。
        </p>

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Token 意味着两件事：<strong style={{ color: 'var(--color-text-primary)' }}>钱</strong>和<strong style={{ color: 'var(--color-text-primary)' }}>注意力</strong>。
        </p>

        <AnimationWrapper
          component={LazyTokenEconomy}
          durationInFrames={180}
          fallbackText="Token 经济动画加载失败"
        />

        {/* ── Token = 钱 ── */}
        <h3
          className="text-xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Token = 钱
        </h3>

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          每次交互都在花钱。不同工具的成本差异非常大：
        </p>

        <CodeBlock
          language="bash"
          title="token-cost-per-tool.txt"
          code={`工具           成本特征                      举例
──────────────────────────────────────────────────────────
Read           完整文件 token                1000 行文件 ≈ 3000-5000 tokens
Edit           仅变更部分 token              修改 3 行 ≈ 150-300 tokens
Bash           固定 ~245 tokens              无论命令多复杂，开销固定
Grep           仅匹配行 token                高效：只返回需要的内容
Glob           文件路径列表 token             极轻量

关键比例：
  Read(1000 行) ≈ 20 × Edit(改 3 行)
  Read(1000 行) ≈ 15 × Grep(搜索同文件)`}
        />

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          这意味着：当你只需要查找文件中的一小段内容时，<strong style={{ color: 'var(--color-text-primary)' }}>Grep 比 Read 便宜 10-20 倍</strong>。
          这不是理论——当你日均使用超过几十次交互时，这个差异直接反映在账单上。
          不过在 Ch01 阶段你不需要刻意优化成本，先体验，后面的章节会教你具体技巧。
        </p>

        {/* ── Token = 注意力 ── */}
        <h3
          className="text-xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Token = 注意力
        </h3>

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          这是更重要也更反直觉的一点。Claude 的上下文窗口现在有 <strong style={{ color: 'var(--color-text-primary)' }}>1M token</strong>（以 Opus 4.6 为例），
          听起来很大。但 1M token 不等于无限——随着上下文变长，模型的<strong style={{ color: 'var(--color-text-primary)' }}>注意力会被稀释</strong>。
        </p>

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
            "Lost in the Middle" 效应
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            研究表明，LLM 对上下文的注意力分布呈 <strong style={{ color: 'var(--color-text-primary)' }}>U 形曲线</strong>：
            开头的内容（如 CLAUDE.md）和最近的内容（你最新的消息）注意力最高，
            中间的内容最容易被"忽略"。这就是为什么长对话中 Claude 可能"忘记"你在第 3 轮说过的事。
          </p>
        </div>

        <CodeBlock
          language="bash"
          title="attention-distribution.txt"
          code={`注意力权重分布 (示意):

高 ████                                            ████
   ████                                            ████
   ████░░                                        ░░████
   ████░░░░░░░░                            ░░░░░░░░████
低 ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████
   ┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
   开头                    中间                      末尾
   (CLAUDE.md)        (早期对话内容)          (最近的消息)
   高注意力               容易被忽略               高注意力`}
        />

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          实际影响：当上下文窗口填充了大量内容后，质量下降不是因为"token 用完了"，
          而是因为关键信息被淹没在中间，模型的注意力已经稀释了。
          这就是为什么<strong style={{ color: 'var(--color-text-primary)' }}> CLAUDE.md 的位置如此重要</strong>——
          它被注入在上下文的开头，享有最高的注意力权重。
        </p>

        {/* ── Claude 会犯错 ── */}
        <h3
          className="text-xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Claude 会犯错——你的 Harness 就是安全网
        </h3>

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          理解了 token 经济学之后，一个重要的结论是：<strong style={{ color: 'var(--color-text-primary)' }}>Claude 不是全知全能的</strong>。
          它的注意力有限、记忆会随上下文变长而衰减、会在长对话中遗忘早期的约定。
          它偶尔会幻觉、会忽略你的部分指令、会在复杂任务中做出非最优决策。
        </p>

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          这不是说 Claude 不好用——恰恰相反，它非常强大。
          但强大不等于可靠。<strong style={{ color: 'var(--color-text-primary)' }}>可靠性来自你围绕模型构建的 Harness</strong>：
        </p>

        <ul
          className="list-disc list-inside space-y-2 text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <li>把项目规范写在 CLAUDE.md 里（而不是每次口头重复）——因为 CLAUDE.md 在上下文开头，不会被遗忘</li>
          <li>用 Hooks 在模型外部自动运行测试和 lint——因为模型可能忘了跑，但 Hook 不会</li>
          <li>用权限规则限制危险操作——因为模型可能误判，但 deny 规则是硬限制</li>
          <li>一个任务一个会话——因为上下文越长，注意力越稀释</li>
        </ul>

        <QualityCallout title="心智模型">
          <p>
            <strong style={{ color: 'var(--color-text-primary)' }}>CLAUDE.md 是偏好，Hooks 是保障。</strong>
          </p>
          <p className="mt-1">
            CLAUDE.md 告诉 Claude "应该"怎么做——但它可能在长上下文中遗忘。
            Hooks 在模型外部确定性执行——无论模型怎么决策，Hook 都会运行。
            两者配合，偏好加保障，才是完整的 Harness。
          </p>
        </QualityCallout>

        <ExerciseCard
          tier="l1"
          title="观察 Token 消耗"
          description="在 Claude Code 会话中运行 /cost 命令，查看当前会话的 token 消耗。然后运行 /context 查看上下文窗口的使用率。对比几次不同操作（Read 一个大文件 vs Grep 搜索同一个文件）后的 token 变化。"
          checkpoints={[
            '运行 /cost 并理解 input/output token 的含义',
            '运行 /context 并观察上下文使用率',
            '体验到 Read 和 Grep 的 token 成本差异',
          ]}
        />
      </section>

      {/* ═══════════════════════════════════════════════════════
          Section 1.5: 选择你的模型
          ═══════════════════════════════════════════════════════ */}
      <section className="space-y-8">
        <h2
          className="text-2xl font-bold mb-6"
          style={{ color: 'var(--color-text-primary)' }}
        >
          1.5 选择你的模型
        </h2>

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Claude 有多个模型，适用于不同的场景。不需要每次都用最贵的，也不需要每次都追求最快的——关键是匹配。
        </p>

        {/* ── 模型对比 ── */}
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: '1px solid var(--color-border)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--color-bg-secondary)' }}>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>模型</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>定位</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>上下文</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>适合场景</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--color-text-secondary)' }}>
              <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                <td className="px-4 py-3 font-mono font-semibold" style={{ color: 'var(--color-accent)' }}>Opus</td>
                <td className="px-4 py-3">最强推理，最贵</td>
                <td className="px-4 py-3">1M tokens</td>
                <td className="px-4 py-3">复杂架构设计、难 bug、重要重构</td>
              </tr>
              <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                <td className="px-4 py-3 font-mono font-semibold" style={{ color: 'var(--color-accent)' }}>Sonnet</td>
                <td className="px-4 py-3">性价比平衡</td>
                <td className="px-4 py-3">200K tokens</td>
                <td className="px-4 py-3">日常开发、代码审查、功能实现</td>
              </tr>
              <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                <td className="px-4 py-3 font-mono font-semibold" style={{ color: 'var(--color-accent)' }}>Haiku</td>
                <td className="px-4 py-3">最快最便宜</td>
                <td className="px-4 py-3">200K tokens</td>
                <td className="px-4 py-3">简单任务、批量处理、快速问答</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          切换模型的方式：在 Claude Code 中输入 <code style={{ color: 'var(--color-accent)' }}>/model</code> 即可选择。
          你也可以在启动时通过参数指定：
        </p>

        <CodeBlock
          language="bash"
          title="terminal"
          code={`# 使用 Opus（默认）
claude

# 指定使用 Sonnet
claude --model claude-sonnet-4-20250514

# 使用内置快捷方式
claude --model sonnet`}
        />

        {/* ── Effort 级别 ── */}
        <h3
          className="text-xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Effort 级别：同一个模型，不同思考深度
        </h3>

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          除了切换模型，你还可以调整同一个模型的<strong style={{ color: 'var(--color-text-primary)' }}>思考深度</strong>。
          Claude Code 支持 effort 级别，从快速响应到深度推理：
        </p>

        <div
          className="rounded-lg overflow-hidden"
          style={{ border: '1px solid var(--color-border)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--color-bg-secondary)' }}>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>级别</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>行为</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>典型场景</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--color-text-secondary)' }}>
              <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                <td className="px-4 py-3 font-mono" style={{ color: 'var(--color-accent)' }}>low</td>
                <td className="px-4 py-3">快速回答，最少思考</td>
                <td className="px-4 py-3">简单问答、格式转换</td>
              </tr>
              <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                <td className="px-4 py-3 font-mono" style={{ color: 'var(--color-accent)' }}>medium</td>
                <td className="px-4 py-3">平衡速度和质量</td>
                <td className="px-4 py-3">日常编码、常规任务</td>
              </tr>
              <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                <td className="px-4 py-3 font-mono" style={{ color: 'var(--color-accent)' }}>high</td>
                <td className="px-4 py-3">深度推理，更多思考时间</td>
                <td className="px-4 py-3">bug 调查、架构决策</td>
              </tr>
              <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                <td className="px-4 py-3 font-mono" style={{ color: 'var(--color-accent)' }}>max</td>
                <td className="px-4 py-3">最深度推理，可能很慢</td>
                <td className="px-4 py-3">极复杂问题、安全审计</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Effort 级别通过 <code style={{ color: 'var(--color-accent)' }}>Shift+Tab</code> 菜单切换，
          或在 prompt 中直接指定（如"快速帮我..."暗示低 effort，
          "仔细分析..."暗示高 effort）。
          Ch02 会详细讲解 effort 的策略性运用。
        </p>

        {/* ── 在哪里使用 ── */}
        <h3
          className="text-xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          在哪里使用 Claude Code
        </h3>

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Claude Code 不仅仅是一个 CLI 工具。你可以在多种环境中使用它：
        </p>

        <div
          className="rounded-lg overflow-hidden"
          style={{ border: '1px solid var(--color-border)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--color-bg-secondary)' }}>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>环境</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>方式</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>特点</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--color-text-secondary)' }}>
              <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>终端 (CLI)</td>
                <td className="px-4 py-3"><code style={{ color: 'var(--color-accent)' }}>claude</code> 命令</td>
                <td className="px-4 py-3">最完整的体验，本教程主要使用</td>
              </tr>
              <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>VS Code</td>
                <td className="px-4 py-3">Claude Code 扩展</td>
                <td className="px-4 py-3">编辑器内集成，适合边写边问</td>
              </tr>
              <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>JetBrains</td>
                <td className="px-4 py-3">Claude Code 插件</td>
                <td className="px-4 py-3">支持 IntelliJ、WebStorm 等全系 IDE</td>
              </tr>
              <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>Web / Desktop</td>
                <td className="px-4 py-3">claude.ai</td>
                <td className="px-4 py-3">无需安装，浏览器直接用</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          本教程以 CLI 为主线展开——它是功能最完整的方式，也是理解 Claude Code 底层机制的最佳途径。
          你在 CLI 中学到的所有概念（CLAUDE.md、权限、Hooks、Skills）在其他环境中同样适用。
        </p>

        <ExerciseCard
          tier="l1"
          title="切换模型试试看"
          description={'在 Claude Code 中用 /model 命令切换到 Sonnet，然后问同一个问题，对比 Opus 和 Sonnet 的回答质量和速度差异。再试试用 Haiku 做一个简单任务（比如"帮我把这个 JSON 格式化一下"）。'}
          checkpoints={[
            '使用 /model 成功切换了模型',
            '感受到不同模型在速度和质量上的差异',
            '形成初步判断：什么任务用什么模型',
          ]}
        />
      </section>

      {/* ═══════════════════════════════════════════════════════
          Chapter Summary
          ═══════════════════════════════════════════════════════ */}
      <section className="space-y-6">
        <div
          className="p-6 rounded-lg"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <h3
            className="text-lg font-semibold mb-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            本章要点
          </h3>
          <ul
            className="space-y-3 text-sm leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <li>
              <strong style={{ color: 'var(--color-text-primary)' }}>Claude Code 是一个 Agent</strong>
              ——它不只是回答问题，而是自主规划、调用工具、执行操作。你每说一句话，它可能在内部走 5-8 轮工具调用。
            </li>
            <li>
              <strong style={{ color: 'var(--color-text-primary)' }}>请求链路的大部分环节你都能控制</strong>
              ——从系统提示（CLAUDE.md）到权限校验（settings.json）到执行后处理（Hooks），你是环境的设计者。
            </li>
            <li>
              <strong style={{ color: 'var(--color-text-primary)' }}>Agent = Model + Harness</strong>
              ——模型智能是基础，但 Harness（驾驭系统）决定可靠性。基础设施比智能更重要。
            </li>
            <li>
              <strong style={{ color: 'var(--color-text-primary)' }}>Token = 钱 + 注意力</strong>
              ——上下文不是无限的，长对话中中间内容会被遗忘（Lost in the Middle），这解释了为什么 CLAUDE.md 放在开头。
            </li>
            <li>
              <strong style={{ color: 'var(--color-text-primary)' }}>Claude 会犯错</strong>
              ——这不是缺陷，而是你需要 Harness 的理由。CLAUDE.md 是偏好，Hooks 是保障。
            </li>
          </ul>
        </div>

        <p
          className="leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          下一章，我们开始学习<strong style={{ color: 'var(--color-text-primary)' }}> Prompt 工程</strong>——
          如何从"帮我做一下"进化到精确控制 Claude 的行为。这是 Harness Engineering 的第一块基石。
        </p>
      </section>

      {/* ═══════════════════════════════════════════════════════
          Reference Section
          ═══════════════════════════════════════════════════════ */}
      <ReferenceSection version="Claude Code v1.x">
        <div className="space-y-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {/* Token 成本表 */}
          <div>
            <h4 className="font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
              Token 成本参考表
            </h4>
            <div
              className="rounded-lg overflow-hidden"
              style={{ border: '1px solid var(--color-border)' }}
            >
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: 'var(--color-bg-surface)' }}>
                    <th className="text-left px-3 py-2" style={{ color: 'var(--color-text-primary)' }}>模型</th>
                    <th className="text-left px-3 py-2" style={{ color: 'var(--color-text-primary)' }}>输入 (per 1M tokens)</th>
                    <th className="text-left px-3 py-2" style={{ color: 'var(--color-text-primary)' }}>输出 (per 1M tokens)</th>
                    <th className="text-left px-3 py-2" style={{ color: 'var(--color-text-primary)' }}>缓存输入</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                    <td className="px-3 py-2 font-mono">Opus 4</td>
                    <td className="px-3 py-2">$15</td>
                    <td className="px-3 py-2">$75</td>
                    <td className="px-3 py-2">$1.50</td>
                  </tr>
                  <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                    <td className="px-3 py-2 font-mono">Sonnet 4</td>
                    <td className="px-3 py-2">$3</td>
                    <td className="px-3 py-2">$15</td>
                    <td className="px-3 py-2">$0.30</td>
                  </tr>
                  <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                    <td className="px-3 py-2 font-mono">Haiku 3.5</td>
                    <td className="px-3 py-2">$0.80</td>
                    <td className="px-3 py-2">$4</td>
                    <td className="px-3 py-2">$0.08</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              价格为 Anthropic API 公开定价，Claude Code 订阅用户走包月额度，不直接按此价格计费。
              缓存输入价格约为普通输入的 1/10，Prompt Caching 在 Claude Code 中默认启用。
            </p>
          </div>

          {/* System Prompt 优先级 */}
          <div>
            <h4 className="font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
              System Prompt 7 层优先级
            </h4>
            <CodeBlock
              language="yaml"
              title="system-prompt-priority.yaml"
              code={`# 优先级从高到低 (1 = 最高)
1. Managed Policy     # 组织级策略 (API 下发，用户不可覆盖)
2. Built-in           # Claude Code 内置指令 (工具使用规则、安全约束)
3. Session            # 当前会话级指令
4. CLAUDE.md (user)   # 项目 CLAUDE.md (以 user message 身份注入)
5. Rules              # .claude/settings.json 中的 rules 字段
6. Auto Memory        # Claude 自动记录的项目偏好
7. User Message       # 你当前输入的消息`}
            />
            <p className="mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              冲突时高优先级覆盖低优先级。CLAUDE.md 优先级高于你的当前消息，这是设计意图——项目规范应比临时指令更稳定。
            </p>
          </div>

          {/* Prompt Caching */}
          <div>
            <h4 className="font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
              Prompt Caching
            </h4>
            <p className="leading-relaxed">
              Claude Code 默认启用 Prompt Caching。当连续请求的前缀（system prompt + 历史消息）相同时，
              这部分 token 只计算缓存价格（约为正常输入价格的 1/10）。
              实际效果：日均使用成本可从 $15+/人降至 $5-6/人（取决于 cache 命中率）。
              保持会话内上下文稳定、减少频繁 /clear 可以提高命中率。
            </p>
          </div>

          {/* 能力全景表 */}
          <div>
            <h4 className="font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
              Claude Code 能力全景表
            </h4>
            <div
              className="rounded-lg overflow-hidden"
              style={{ border: '1px solid var(--color-border)' }}
            >
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: 'var(--color-bg-surface)' }}>
                    <th className="text-left px-3 py-2" style={{ color: 'var(--color-text-primary)' }}>工具</th>
                    <th className="text-left px-3 py-2" style={{ color: 'var(--color-text-primary)' }}>能力</th>
                    <th className="text-left px-3 py-2" style={{ color: 'var(--color-text-primary)' }}>Token 成本</th>
                    <th className="text-left px-3 py-2" style={{ color: 'var(--color-text-primary)' }}>风险等级</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                    <td className="px-3 py-2 font-mono">Read</td>
                    <td className="px-3 py-2">读取文件全部内容</td>
                    <td className="px-3 py-2">高 (全文)</td>
                    <td className="px-3 py-2">低</td>
                  </tr>
                  <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                    <td className="px-3 py-2 font-mono">Edit</td>
                    <td className="px-3 py-2">精确修改文件 (搜索-替换)</td>
                    <td className="px-3 py-2">低 (仅 diff)</td>
                    <td className="px-3 py-2">中</td>
                  </tr>
                  <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                    <td className="px-3 py-2 font-mono">Write</td>
                    <td className="px-3 py-2">创建/覆写文件</td>
                    <td className="px-3 py-2">中 (全文)</td>
                    <td className="px-3 py-2">高</td>
                  </tr>
                  <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                    <td className="px-3 py-2 font-mono">Bash</td>
                    <td className="px-3 py-2">执行任意 shell 命令</td>
                    <td className="px-3 py-2">固定 ~245t</td>
                    <td className="px-3 py-2">最高</td>
                  </tr>
                  <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                    <td className="px-3 py-2 font-mono">Grep</td>
                    <td className="px-3 py-2">正则搜索文件内容</td>
                    <td className="px-3 py-2">低 (匹配行)</td>
                    <td className="px-3 py-2">低</td>
                  </tr>
                  <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                    <td className="px-3 py-2 font-mono">Glob</td>
                    <td className="px-3 py-2">按模式匹配文件路径</td>
                    <td className="px-3 py-2">极低</td>
                    <td className="px-3 py-2">低</td>
                  </tr>
                  <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                    <td className="px-3 py-2 font-mono">Agent</td>
                    <td className="px-3 py-2">启动子代理执行子任务</td>
                    <td className="px-3 py-2">高 (乘数)</td>
                    <td className="px-3 py-2">中</td>
                  </tr>
                  <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                    <td className="px-3 py-2 font-mono">Skill</td>
                    <td className="px-3 py-2">调用预定义技能流程</td>
                    <td className="px-3 py-2">变量</td>
                    <td className="px-3 py-2">低</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* IDE 差异表 */}
          <div>
            <h4 className="font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
              IDE 集成差异表
            </h4>
            <div
              className="rounded-lg overflow-hidden"
              style={{ border: '1px solid var(--color-border)' }}
            >
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: 'var(--color-bg-surface)' }}>
                    <th className="text-left px-3 py-2" style={{ color: 'var(--color-text-primary)' }}>特性</th>
                    <th className="text-left px-3 py-2" style={{ color: 'var(--color-text-primary)' }}>CLI</th>
                    <th className="text-left px-3 py-2" style={{ color: 'var(--color-text-primary)' }}>VS Code</th>
                    <th className="text-left px-3 py-2" style={{ color: 'var(--color-text-primary)' }}>JetBrains</th>
                    <th className="text-left px-3 py-2" style={{ color: 'var(--color-text-primary)' }}>Web</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                    <td className="px-3 py-2">CLAUDE.md</td>
                    <td className="px-3 py-2">完整支持</td>
                    <td className="px-3 py-2">完整支持</td>
                    <td className="px-3 py-2">完整支持</td>
                    <td className="px-3 py-2">N/A</td>
                  </tr>
                  <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                    <td className="px-3 py-2">Hooks</td>
                    <td className="px-3 py-2">完整支持</td>
                    <td className="px-3 py-2">完整支持</td>
                    <td className="px-3 py-2">完整支持</td>
                    <td className="px-3 py-2">N/A</td>
                  </tr>
                  <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                    <td className="px-3 py-2">Skills</td>
                    <td className="px-3 py-2">完整支持</td>
                    <td className="px-3 py-2">完整支持</td>
                    <td className="px-3 py-2">完整支持</td>
                    <td className="px-3 py-2">N/A</td>
                  </tr>
                  <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                    <td className="px-3 py-2">Bash 工具</td>
                    <td className="px-3 py-2">完整支持</td>
                    <td className="px-3 py-2">通过终端</td>
                    <td className="px-3 py-2">通过终端</td>
                    <td className="px-3 py-2">受限</td>
                  </tr>
                  <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                    <td className="px-3 py-2">@ 文件引用</td>
                    <td className="px-3 py-2">支持</td>
                    <td className="px-3 py-2">支持 + GUI</td>
                    <td className="px-3 py-2">支持 + GUI</td>
                    <td className="px-3 py-2">支持</td>
                  </tr>
                  <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                    <td className="px-3 py-2">diff 预览</td>
                    <td className="px-3 py-2">文本 diff</td>
                    <td className="px-3 py-2">可视化 diff</td>
                    <td className="px-3 py-2">可视化 diff</td>
                    <td className="px-3 py-2">N/A</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              CLI 是功能最完整的方式。IDE 扩展本质上是 CLI 的 GUI 封装，底层调用相同的引擎。
            </p>
          </div>
        </div>
      </ReferenceSection>
    </div>
  )
}
