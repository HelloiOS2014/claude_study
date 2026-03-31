import { lazy } from 'react'
import { CodeBlock } from '../../components/content/CodeBlock'
import { QualityCallout } from '../../components/content/QualityCallout'
import { ExerciseCard } from '../../components/content/ExerciseCard'
import { ConfigExample } from '../../components/content/ConfigExample'
import { DecisionTree } from '../../components/content/DecisionTree'
import { ReferenceSection } from '../../components/content/ReferenceSection'
import { AnimationWrapper } from '../../components/animation/AnimationWrapper'
import { industryStats } from '../../data/industry-stats'

const LazyHookEventFlow = lazy(() => import('../../remotion/ch05/HookEventFlow'))

/* ═══════════════════════════════════════════════
   Decision Tree Data: Handler Type Selection
   ═══════════════════════════════════════════════ */

const handlerTypeTree = {
  id: 'root',
  question: '你的 Hook 需要什么能力？',
  description: '根据判断逻辑的复杂度选择最合适的 handler 类型。',
  children: [
    {
      label: '确定性规则（正则、路径、exit code）',
      node: {
        id: 'deterministic',
        question: '需要外部服务参与吗？',
        children: [
          {
            label: '不需要，本地脚本即可',
            node: {
              id: 'command',
              question: '推荐：command handler',
              result: {
                text: '通过 stdin 接收 JSON，用 shell/Node 脚本做确定性判断，通过 exit code 返回决策。零 token 消耗，毫秒级执行。',
                tier: 'l1',
              },
              description: '适用：格式化、lint、路径黑名单、危险命令拦截、密钥泄露扫描。',
            },
          },
          {
            label: '需要调用远程 API / 团队服务',
            node: {
              id: 'http',
              question: '推荐：http handler',
              result: {
                text: '将事件 payload POST 到外部 HTTP 端点，由远程服务返回决策。适合集中式策略管控和审计日志。',
                tier: 'l2',
              },
              description: '适用：Slack 通知、集中式安全策略、CI/CD 触发、合规审计。',
            },
          },
        ],
      },
    },
    {
      label: '需要语义理解（LLM 判断）',
      node: {
        id: 'semantic',
        question: '判断过程需要多少步骤？',
        children: [
          {
            label: '单次判断即可',
            node: {
              id: 'prompt',
              question: '推荐：prompt handler',
              result: {
                text: '用一个 prompt 做单轮 LLM 判断："这次修改是否完成了所有任务？" 消耗约 200-500 token，但能处理模糊判断。',
                tier: 'l2',
              },
              description: '适用：完成度检查、代码质量评估、变更摘要生成。',
            },
          },
          {
            label: '需要多步验证（读文件、跑测试等）',
            node: {
              id: 'agent',
              question: '推荐：agent handler',
              result: {
                text: '启动一个最多 50 轮的子 Agent，可使用工具（读文件、执行命令）做深度验证。功能最强但 token 消耗最大，慎用。',
                tier: 'l3',
              },
              description: '适用：自动 code review、架构一致性验证、跨文件依赖检查。',
            },
          },
        ],
      },
    },
  ],
}

/* ═══════════════════════════════════════════════
   Chapter 7: Hooks 自动化
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
            Automation Layer
          </span>
          <span
            className="text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 rounded"
            style={{
              color: 'var(--color-accent)',
              background: 'var(--color-accent-subtle)',
              border: '1px solid var(--color-border-accent)',
            }}
          >
            Harness / 保障层
          </span>
        </div>
        <h1
          className="text-3xl md:text-4xl font-bold mb-4 leading-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Hooks 自动化：让质量检查永不遗漏
        </h1>
        <p
          className="text-lg leading-relaxed max-w-3xl"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          CLAUDE.md 告诉 Claude "要遵守什么规范"，但它是偏好，不是保障 --
          在第 20 轮对话中，Claude 可能忘记跑 ESLint。
          Hooks 系统在 Claude 的每个操作节点插入自动化检查，把"希望它做"变成"保证它做"。
          这一章，我们从零构建一条四层质量流水线，在实战中学会 21+ 事件、4 种 handler、exit code 语义。
        </p>
        <p
          className="text-base leading-relaxed max-w-3xl mt-3"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          在 Ch03-06 中我们逐步给 DemoAPI 加了规范（CLAUDE.md）、结构（Plan Mode）、能力（Skills）。
          但 Claude 仍然可能在第 20 轮忘了跑 lint。现在我们给 DemoAPI 加上最后一道保障 -- Hooks。
        </p>
      </header>

      {/* ═══════════════════════════════════════════════
          Section 7.1: 为什么需要 Hooks
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          7.1 为什么需要 Hooks
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          你的 CLAUDE.md 写着"每次修改代码后必须通过 ESLint"。前 5 轮对话，Claude 记得住。
          到第 20 轮呢？随着上下文变长，指令被稀释，Claude 可能会直接跳过 lint 检查。
          这不是 Claude 的恶意 -- 是 LLM 注意力衰减的客观规律。
        </p>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Hook 的解决方案很简单：<strong>不依赖模型记住规则，让 harness 强制执行。</strong>
          Claude 每次编辑文件后，PostToolUse 事件自动触发，ESLint 自动运行 -- 不管 Claude 记不记得，不管是第 1 轮还是第 100 轮。
        </p>

        <CodeBlock
          language="bash"
          title="hooks-vs-instructions.txt"
          code={`CLAUDE.md 指令（偏好）                    Hooks（保障）
═══════════════════════                  ═══════════════════════
"请在编辑后运行 ESLint"                  编辑后自动运行 ESLint
依赖模型注意力                            依赖事件触发，确定性执行
上下文稀释后可能遗忘                      永不遗忘
建议性                                    强制性
token 消耗（每轮提醒）                    零 token 消耗（command handler）
适合：风格偏好、思考方式                  适合：质量检查、安全规则`}
        />

        <QualityCallout title="CLAUDE.md 是偏好，Hooks 是保障">
          把 CLAUDE.md 想象成团队的编码规范文档 -- 新人可能忘记遵守。
          Hooks 则像 CI/CD 流水线 -- 不管谁提交代码，检查都会自动运行。
          最佳实践：用 CLAUDE.md 传达"为什么"和"怎么想"，用 Hooks 保障"必须做什么"。
        </QualityCallout>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          数据佐证：LangChain 在仅修改 harness 配置（增加 Hooks 自动化检查、不改模型和 prompt）后，
          SWE-bench 基准测试得分提升了 <strong>+{industryStats.hooksBenchImprovement}</strong>。
          这说明工程化 harness 对输出质量的影响可以和 prompt 工程相当。
        </p>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 7.2: 实战：构建质量流水线
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          7.2 实战：构建质量流水线
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          不讲理论了，直接动手。我们要逐层构建一条四层质量流水线。
          每一层都会自然引出 Hook 的核心概念 -- 事件、handler、exit code、matcher。
          建完之后，你会发现你已经掌握了 Hook 系统的所有关键知识。
        </p>

        <AnimationWrapper
          component={LazyHookEventFlow}
          durationInFrames={210}
          fallbackText="Hook 事件流动画加载失败"
        />

        {/* ── Layer 1: Auto-format ── */}
        <h3
          className="text-lg font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Layer 1: 自动格式化（PostToolUse + command + Prettier）
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          目标：Claude 每次编辑或创建文件后，自动运行 Prettier 格式化。
          这是最简单的 Hook，也是理解整个系统的切入点。
        </p>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          先写 Hook 脚本。它通过 stdin 接收 JSON payload（包含工具名和输入参数），
          提取文件路径后运行 Prettier。脚本的 exit code 决定 Claude 下一步怎么做。
        </p>

        <CodeBlock
          language="bash"
          title=".claude/hooks/auto-format.sh"
          code={`#!/bin/bash
# PostToolUse hook: 自动格式化被修改的文件
# 通过 stdin 接收 JSON payload，提取文件路径后运行 prettier

set -euo pipefail

# 1. 从 stdin 读取事件 payload
PAYLOAD=$(cat)

# 2. 提取工具名和文件路径
TOOL_NAME=$(echo "$PAYLOAD" | jq -r '.tool_name // empty')
FILE_PATH=$(echo "$PAYLOAD" | jq -r '.tool_input.file_path // .tool_input.path // empty')

# 3. 只处理 Edit 和 Write 工具
if [[ "$TOOL_NAME" != "Edit" && "$TOOL_NAME" != "Write" ]]; then
  exit 0
fi

# 4. 文件路径为空则跳过
if [[ -z "$FILE_PATH" || ! -f "$FILE_PATH" ]]; then
  exit 0
fi

# 5. 文件类型过滤
case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.css|*.scss|*.html|*.md|*.yaml|*.yml)
    ;; # 支持的文件类型，继续
  *)
    exit 0 ;; # 不支持的文件类型，跳过
esac

# 6. 运行 prettier，失败时降级（不阻断工作流）
if npx prettier --write "$FILE_PATH" 2>/dev/null; then
  echo "Formatted: $FILE_PATH"
else
  echo "Prettier skipped: $FILE_PATH" >&2
fi

exit 0`}
          highlightLines={[8, 11, 15, 34]}
        />

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          然后在 settings.json 中注册这个 Hook：
        </p>

        <ConfigExample
          title=".claude/settings.json -- Layer 1"
          language="json"
          code={`{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "type": "command",
        "command": "bash .claude/hooks/auto-format.sh"
      }
    ]
  }
}`}
          annotations={[
            { line: 3, text: 'PostToolUse: 工具执行完成后触发。这里指 Edit/Write 执行完毕后。' },
            { line: 5, text: 'matcher: 正则匹配工具名。"Edit|Write" 只在 Edit 或 Write 工具触发时执行此 Hook。' },
            { line: 6, text: 'type: "command" 表示执行本地脚本。零 token 消耗，毫秒级完成。' },
            { line: 7, text: 'command: 要执行的 shell 命令。事件 payload 通过 stdin 传入。' },
          ]}
        />

        <QualityCallout title="你刚学到的概念">
          <strong>PostToolUse 事件</strong> -- 工具执行完毕后触发。<br />
          <strong>command handler</strong> -- 执行本地脚本，通过 stdin 接收 JSON、通过 exit code 返回决策。<br />
          <strong>matcher</strong> -- 正则表达式，过滤哪些工具触发此 Hook。<br />
          <strong>exit 0</strong> -- Allow（放行），操作继续。stdout 输出作为上下文反馈给 Claude。
        </QualityCallout>

        {/* ── Layer 2: Auto-lint ── */}
        <h3
          className="text-lg font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Layer 2: 自动 Lint（PostToolUse + command + ESLint）
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          原理和 Layer 1 相同，只是换了工具。关键新知识：<strong>同一事件可以注册多个 Hook，按声明顺序执行。</strong>
          所以我们先 format 再 lint -- 顺序在 settings.json 中体现。
        </p>

        <CodeBlock
          language="bash"
          title=".claude/hooks/auto-lint.sh"
          code={`#!/bin/bash
# PostToolUse hook: 自动 lint 修复被修改的文件
set -euo pipefail

PAYLOAD=$(cat)
TOOL_NAME=$(echo "$PAYLOAD" | jq -r '.tool_name // empty')
FILE_PATH=$(echo "$PAYLOAD" | jq -r '.tool_input.file_path // .tool_input.path // empty')

if [[ "$TOOL_NAME" != "Edit" && "$TOOL_NAME" != "Write" ]]; then
  exit 0
fi

if [[ -z "$FILE_PATH" || ! -f "$FILE_PATH" ]]; then
  exit 0
fi

# ESLint 只处理 JS/TS 文件
case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx) ;;
  *) exit 0 ;;
esac

# --fix 自动修复，失败时记录但不阻断
if npx eslint --fix "$FILE_PATH" 2>/dev/null; then
  echo "Linted: $FILE_PATH"
else
  echo "ESLint issues in: $FILE_PATH" >&2
fi

exit 0`}
        />

        {/* ── Layer 3: Completion check ── */}
        <h3
          className="text-lg font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Layer 3: 完成度检查（Stop + prompt handler）
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Layer 1-2 是事后清理，Layer 3 是"拦截 Claude 想停下来的那一刻"。
          当 Claude 认为任务完成、准备停止时，<strong>Stop 事件</strong>触发。
          我们用一个 <strong>prompt handler</strong> 让 LLM 做一次语义检查 -- 判断任务是否真的完成了。
        </p>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          prompt handler 不需要外部脚本，直接在配置中写 prompt。LLM 读取当前上下文，
          返回 EXIT_CODE=0（完成）或 EXIT_CODE=1（有遗漏）。
        </p>

        <ConfigExample
          title="Stop hook -- prompt handler"
          language="json"
          code={`{
  "hooks": {
    "Stop": [
      {
        "type": "prompt",
        "prompt": "Review the conversation and all changes made. Check:\\n1. Were ALL tasks in the original request completed?\\n2. Were tests written or updated for new/changed code?\\n3. Are there any leftover TODO or FIXME comments?\\n4. Were any files left in a broken state?\\n\\nIf everything is complete, respond EXIT_CODE=0.\\nIf anything is missing, respond EXIT_CODE=1 and list what's incomplete."
      }
    ]
  }
}`}
          annotations={[
            { line: 3, text: 'Stop: Claude 准备停止时触发。没有 matcher -- Stop 是全局事件。' },
            { line: 5, text: 'type: "prompt" 表示发送一个 prompt 给 LLM 做单轮判断。消耗约 200-500 token。' },
            { line: 6, text: 'prompt 内容直接发送给 LLM。LLM 通过 EXIT_CODE=N 返回决策。' },
          ]}
        />

        <QualityCallout title="新概念：exit code 语义">
          <strong>exit 0 = Allow</strong> -- 放行，操作继续。<br />
          <strong>exit 1 = Ask</strong> -- 暂停，让用户决定是否继续。适合"不确定"的灰色地带。<br />
          <strong>exit 2 = Deny</strong> -- 直接拒绝，操作取消。适合确定性的安全规则。<br />
          Layer 3 用 exit 1（Ask） -- 因为完成度判断是主观的，应该让用户拍板。
        </QualityCallout>

        {/* ── Layer 4: Security gate ── */}
        <h3
          className="text-lg font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Layer 4: 安全门禁（PreToolUse + command + 正则）
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          前三层都是"事后"Hook（PostToolUse、Stop），Layer 4 是"事前"拦截：
          在 Claude 执行 Bash 命令<em>之前</em>，检查命令是否包含危险模式。
          这是 <strong>PreToolUse 事件</strong>的核心用途。
        </p>

        <CodeBlock
          language="bash"
          title=".claude/hooks/block-dangerous.sh"
          code={`#!/bin/bash
# PreToolUse hook: 拦截危险的 Bash 命令
set -euo pipefail

PAYLOAD=$(cat)
TOOL_NAME=$(echo "$PAYLOAD" | jq -r '.tool_name // empty')

# 只检查 Bash 工具
if [[ "$TOOL_NAME" != "Bash" ]]; then
  exit 0
fi

COMMAND=$(echo "$PAYLOAD" | jq -r '.tool_input.command // empty')

# 危险命令黑名单（正则匹配）
DANGEROUS_PATTERNS=(
  "rm -rf /"
  "rm -rf ~"
  "rm -rf \\."
  "DROP TABLE"
  "DROP DATABASE"
  "TRUNCATE TABLE"
  "git push.*--force"
  "git push.*-f "
  "git reset --hard"
  "chmod 777"
  ":(){ :|:& };:"
  "> /dev/sda"
  "mkfs\\."
  "dd if=.*of=/dev/"
)

for pattern in "\${DANGEROUS_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qiE "$pattern"; then
    echo "BLOCKED: 检测到危险命令模式 '$pattern'" >&2
    echo "原始命令: $COMMAND" >&2
    echo "如需执行，请在终端中手动运行。" >&2
    exit 2  # Deny -- 直接拒绝，不询问用户
  fi
done

exit 0`}
          highlightLines={[16, 39]}
        />

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          注意 exit 2（Deny） -- 危险命令不是"可能有问题"，是"确定不该执行"。
          Deny 意味着操作直接取消，不给用户选择的余地。
          这是和 exit 1（Ask）的关键区别。
        </p>

        <QualityCallout title="新概念：PreToolUse 事件">
          <strong>PreToolUse</strong> -- 工具调用<em>前</em>触发，可以拦截或修改操作。<br />
          <strong>PostToolUse</strong> -- 工具调用<em>后</em>触发，用于后处理和反馈。<br />
          Pre 可以 Deny 阻止操作，Post 只能反馈结果。这是两个事件的本质区别。
        </QualityCallout>

        {/* ── Complete pipeline ── */}
        <h3
          className="text-lg font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          完整流水线：四层 Hook 整合
        </h3>

        <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          把四层 Hook 组合到一个 settings.json 中。声明顺序就是同事件内的执行顺序。
        </p>

        <ConfigExample
          title=".claude/settings.json -- 完整质量流水线"
          language="json"
          code={`{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "type": "command",
        "command": "bash .claude/hooks/block-dangerous.sh"
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "type": "command",
        "command": "bash .claude/hooks/auto-format.sh"
      },
      {
        "matcher": "Edit|Write",
        "type": "command",
        "command": "bash .claude/hooks/auto-lint.sh"
      }
    ],
    "Stop": [
      {
        "type": "prompt",
        "prompt": "Review all changes. Check: 1) All tasks done? 2) Tests written? 3) No TODOs left? 4) No broken files? EXIT_CODE=0 if complete, EXIT_CODE=1 if not."
      }
    ]
  },
  "permissions": {
    "allow": [
      "Bash(npm test)",
      "Bash(npx prettier*)",
      "Bash(npx eslint*)"
    ]
  }
}`}
          annotations={[
            { line: 3, text: 'PreToolUse: 工具执行前触发。安全门禁放在这里，在危险操作发生前拦截。' },
            { line: 5, text: 'matcher: "Bash" 只匹配 Bash 工具调用。其他工具（Edit/Write）不触发此 Hook。' },
            { line: 10, text: 'PostToolUse: 工具执行后触发。格式化和 lint 都在编辑完成后运行。' },
            { line: 12, text: '"Edit|Write" 用正则 OR 语法匹配两个工具。' },
            { line: 16, text: '同事件多个 Hook 按声明顺序执行：先 format（行 14）再 lint（行 19）。' },
            { line: 22, text: 'Stop 事件不需要 matcher -- 全局触发。prompt handler 做语义检查。' },
            { line: 29, text: 'permissions.allow 白名单让 Hook 脚本调用的工具不会被权限拦截。' },
          ]}
        />

        <QualityCallout title="最严格胜出（Most Strict Wins）">
          当同一事件注册多个 Hook 时，所有 Hook 都会执行（不会短路），最终取最严格的结果：
          任何一个 Hook 返回 exit 2 → 整体 Deny；没有 Deny 但有 exit 1 → 整体 Ask；
          全部 exit 0 → Allow。一个安全 Hook 的 Deny 就能否决所有其他 Hook 的 Allow。
        </QualityCallout>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          恭喜！你已经构建了一条完整的质量流水线。回顾一下你学到的核心概念：
        </p>

        <CodeBlock
          language="bash"
          title="concepts-learned.txt"
          code={`通过构建流水线，你掌握了：

事件（Events）
  PreToolUse    工具执行前触发（可拦截）
  PostToolUse   工具执行后触发（可反馈）
  Stop          Claude 准备停止时触发

Handler 类型
  command       本地脚本，零 token，确定性执行
  prompt        单轮 LLM 判断，少量 token

配置元素
  matcher       正则匹配工具名，过滤触发条件
  exit code     0=Allow  1=Ask  2=Deny
  执行顺序       声明顺序 = 执行顺序
  最严格胜出     多个 Hook 结果取最严格的`}
        />

        <ExerciseCard
          tier="l1"
          title="构建你的质量流水线"
          description="在你自己的项目中配置 Layer 1-4 的完整质量流水线。创建 .claude/hooks/ 目录，编写脚本，配置 settings.json。然后让 Claude 编辑一个文件，观察 PostToolUse Hook 是否自动触发格式化和 lint。"
          checkpoints={[
            '创建 .claude/hooks/ 目录和 3 个脚本文件',
            '.claude/settings.json 包含 PreToolUse、PostToolUse、Stop 三个事件',
            'Claude 编辑文件后自动格式化（观察 stdout 输出 "Formatted: ..."）',
            '尝试让 Claude 执行 rm -rf /，确认被 Deny 拦截',
            'permissions.allow 包含必要的白名单规则',
          ]}
        />

        {/* ── 7.2.5 Auto Mode ── */}
        <h3
          className="text-lg font-semibold mt-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          7.2.5 Auto Mode：Claude 自带的安全分类器
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          你刚刚手工构建了四层 Hook 流水线。Claude Code 还内置了一个"零配置"的安全层 -- <strong>Auto Mode</strong>。
          它和你的 Hook 互补，不是替代。
        </p>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <strong>工作原理：</strong>当你启用 Auto Mode 后，一个独立的 Sonnet/Opus 分类器会在每个操作执行前做安全审查。
          这个分类器和主 Agent 完全独立 -- 主 Agent 无法影响分类器的判断，分类器也不会干预主 Agent 的推理过程。
        </p>

        <div
          className="rounded-lg p-5 space-y-4"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>
              自动放行（约 {industryStats.autoModeApprovalRate} 的请求）
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              常规文件读取、标准代码编辑、典型工具调用 -- 分类器判定为安全后自动放行，不打断工作流。
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>
              自动拦截
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              超出任务范围的操作升级、针对未识别基础设施的操作、破坏性命令 -- 分类器会阻止执行并提示用户。
            </p>
          </div>
        </div>

        <ConfigExample
          title="启用 Auto Mode"
          language="bash"
          code={`# 方式 1：在会话中启用（交互式）
> /auto-mode

# 方式 2：通过管理员设置（Team plan）
# Admin Console → Organization Settings → Auto Mode → Enable

# 方式 3：CLI 参数
claude --auto-mode`}
          annotations={[
            { line: 2, text: '在对话中输入 /auto-mode 即时切换。再次输入可关闭。' },
            { line: 5, text: 'Team plan 管理员可以为整个组织统一启用或禁用。' },
          ]}
        />

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
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>适合启用</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>不建议启用</th>
              </tr>
            </thead>
            <tbody>
              {[
                { yes: '已有成熟 deny 规则和 Hooks 的项目', no: '不熟悉的代码库（先手动了解再开）' },
                { yes: '非安全关键的日常开发工作', no: '安全敏感操作（密钥管理、权限变更）' },
                { yes: 'Team plan 用户（管理员可统一管控）', no: '生产基础设施访问（数据库、部署）' },
              ].map((row, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                    {row.yes}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                    {row.no}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <QualityCallout title="Hook 与 Auto Mode 的关系">
          Hook 是你定义的自动检查，Auto Mode 是 Claude 自带的安全分类器 -- 两者互补，不是替代。
          你的 PreToolUse Hook 依然会执行，Auto Mode 的分类器在 Hook 之外独立运行。
          最严格胜出原则依然适用：Hook Deny + Auto Mode Allow = Deny。
        </QualityCallout>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 7.3: 进阶模式
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          7.3 进阶模式
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          7.2 用到了 command 和 prompt 两种 handler。实际上 Hook 系统还支持 agent 和 http handler，
          以及条件执行、异步执行等进阶能力。掌握这些模式，你可以应对更复杂的自动化场景。
        </p>

        {/* ── Agent handler ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Agent Handler：多轮深度验证
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          agent handler 启动一个子 Agent（最多 50 轮对话），可以使用工具（读文件、执行 Bash 等）做深度验证。
          功能最强，但 token 消耗也最大 -- 一次执行可能消耗数千 token。
          只在需要跨文件验证、运行测试等复杂场景下使用。
        </p>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          下面是一个完整的 agent handler 实战示例 -- 每次编辑文件后自动做 code review：
        </p>

        <ConfigExample
          title="agent handler -- 自动 Code Review"
          language="json"
          code={`{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "type": "agent",
        "agent": {
          "prompt": "Review the file that was just modified. Check: 1) TypeScript strict mode compliance 2) Security issues (injection, XSS, hardcoded secrets) 3) Proper error handling. Report issues found, or say 'No issues found' if clean.",
          "model": "haiku",
          "maxTurns": 5
        }
      }
    ]
  }
}`}
          annotations={[
            { line: 5, text: 'matcher: "Write|Edit" -- 只在文件被创建或编辑后触发 review。' },
            { line: 6, text: 'type: "agent" -- 启动子 Agent 做多轮验证，区别于 "prompt" 的单轮判断。' },
            { line: 8, text: 'agent.prompt: 子 Agent 的任务指令。它可以读文件、跑命令来验证。' },
            { line: 9, text: 'agent.model: "haiku" 用快速小模型降低成本。也可选 "sonnet" 或 "opus"。' },
            { line: 10, text: 'agent.maxTurns: 限制子 Agent 最多 5 轮交互。默认 50，建议按需缩小。' },
          ]}
        />

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          agent handler 和 prompt handler 的区别：prompt 只做单轮判断（"看一眼得出结论"），
          agent 可以多轮操作（"打开文件看看、跑个测试、分析结果"）。
          代价是 agent 需要 3-10 秒启动时间，且每轮都消耗 token。
        </p>

        <CodeBlock
          language="bash"
          title="agent-vs-prompt.txt"
          code={`agent handler 字段说明：

  matcher      正则匹配触发的工具名（同 command handler）
  type         "agent" -- 启动子 Agent
  agent.prompt 子 Agent 收到的任务指令
  agent.model  子 Agent 使用的模型（haiku / sonnet / opus）
               - haiku: 最快最便宜，适合格式检查
               - sonnet: 平衡，适合 code review
               - opus: 最强，适合架构验证
  agent.maxTurns  最大交互轮数（默认 50，建议 5-20）
                  轮数越多 = token 消耗越高

何时用 agent 而非 prompt？
  prompt: "这段代码有安全问题吗？" → 看一眼就能答
  agent:  "检查所有修改的文件，跑测试，验证类型" → 需要多步操作`}
        />

        {/* ── HTTP handler ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          HTTP Handler：团队策略与审计
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          http handler 将事件 payload 通过 HTTP POST 发送到外部端点。
          远程服务收到 payload 后，通过 HTTP 响应返回决策。
          这是团队级别集中式策略管控和审计日志的理想方案。
        </p>

        <CodeBlock
          language="json"
          title="http-hook-example.json"
          code={`{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "type": "http",
        "url": "https://your-team-server.com/api/claude-audit",
        "headers": {
          "Authorization": "Bearer $TEAM_AUDIT_TOKEN"
        }
      }
    ]
  }
}`}
        />

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          典型场景：团队安全服务做集中式代码审查、Slack 通知 Channel 记录 Claude 的操作日志、
          或调用第三方安全扫描 API（如 Snyk、Semgrep）。HTTP 响应体 JSON 中包含{' '}
          <code style={{ color: 'var(--color-accent)' }}>exitCode</code> 和{' '}
          <code style={{ color: 'var(--color-accent)' }}>message</code> 字段，
          语义与 command handler 的 exit code 相同。
        </p>

        {/* ── Four types comparison ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          四种 Handler 对比
        </h3>

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
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>类型</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>执行方式</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>Token 消耗</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>适用场景</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  type: 'command',
                  exec: '本地脚本，stdin/stdout',
                  tokens: '零',
                  use: '格式化、lint、路径拦截、密钥扫描',
                  color: 'var(--color-tier-l1)',
                },
                {
                  type: 'prompt',
                  exec: '单轮 LLM 判断',
                  tokens: '200-500',
                  use: '完成度检查、代码质量评估',
                  color: 'var(--color-tier-l2)',
                },
                {
                  type: 'agent',
                  exec: '多轮子 Agent（最多 50 轮）',
                  tokens: '数千+',
                  use: '深度 review、跨文件验证、运行测试',
                  color: 'var(--color-tier-l3)',
                },
                {
                  type: 'http',
                  exec: 'HTTP POST 到外部端点',
                  tokens: '零（本地）',
                  use: '团队策略、审计日志、第三方扫描',
                  color: 'var(--color-tier-l2)',
                },
              ].map((row) => (
                <tr
                  key={row.type}
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  <td className="px-4 py-3 font-semibold" style={{ color: row.color }}>
                    {row.type}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                    {row.exec}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                    {row.tokens}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                    {row.use}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Decision tree ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          选型决策树
        </h3>

        <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          不确定该用哪种 handler？点击下面的决策树，按需求特征走到推荐结果。
        </p>

        <DecisionTree
          root={handlerTypeTree}
          title="Handler 类型选择器"
        />

        {/* ── Conditional execution ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          条件执行：if 字段
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          有时你只想在特定条件下触发 Hook。<code style={{ color: 'var(--color-accent)' }}>if</code> 字段
          接受一个 shell 命令，只有命令返回 exit 0 时 Hook 才会执行。
          这比在脚本内部做条件判断更清晰，也让 settings.json 成为"一眼就能看懂"的配置。
        </p>

        <CodeBlock
          language="json"
          title="conditional-hook.json"
          code={`{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "type": "command",
        "command": "bash .claude/hooks/auto-format.sh",
        "if": "test -f node_modules/.bin/prettier"
      }
    ]
  }
}`}
        />

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          上例中，只有当项目安装了 Prettier 时（<code style={{ color: 'var(--color-accent)' }}>test -f</code> 检查文件存在），
          格式化 Hook 才会执行。在没有 Prettier 的项目中，这个 Hook 自动跳过。
        </p>

        {/* ── Async hooks ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          异步执行：async 字段
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          默认情况下，Hook 是同步执行的 -- Claude 会等待 Hook 完成后才继续。
          对于不需要阻塞工作流的操作（如日志记录、通知），可以设置{' '}
          <code style={{ color: 'var(--color-accent)' }}>{"\"async\": true"}</code> 让 Hook 在后台执行。
        </p>

        <CodeBlock
          language="json"
          title="async-hook.json"
          code={`{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "type": "http",
        "url": "https://your-team.com/api/audit-log",
        "async": true
      }
    ]
  }
}`}
        />

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          async Hook 的 exit code 会被忽略 -- 因为 Claude 不等它完成。
          所以 async 只适合"发出去就行"的场景，不适合需要决策（Allow/Ask/Deny）的安全检查。
        </p>

        {/* ── SessionStart event ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          SessionStart：会话启动时的环境校验
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          SessionStart 在新会话开始时触发一次。最佳用途是<strong>环境验证</strong>（检查 Node 版本、必要工具是否安装）
          和<strong>上下文注入</strong>（把项目状态、最近的 git log 注入到 Claude 的初始上下文）。
        </p>

        <ConfigExample
          title="SessionStart -- 环境验证 + 上下文注入"
          language="json"
          code={`{
  "hooks": {
    "SessionStart": [
      {
        "type": "command",
        "command": "bash .claude/hooks/session-init.sh"
      }
    ]
  }
}`}
          annotations={[
            { line: 3, text: 'SessionStart: 会话开始时触发一次。没有 matcher -- 全局事件。' },
            { line: 6, text: '脚本检查环境并输出项目状态，stdout 会注入 Claude 初始上下文。' },
          ]}
        />

        <CodeBlock
          language="bash"
          title=".claude/hooks/session-init.sh"
          code={`#!/bin/bash
# SessionStart hook: 环境验证 + 项目状态注入

set -euo pipefail

# 1. 环境验证 -- 缺少关键工具时警告（不阻断）
MISSING=""
command -v node  >/dev/null 2>&1 || MISSING="$MISSING node"
command -v jq    >/dev/null 2>&1 || MISSING="$MISSING jq"
command -v npx   >/dev/null 2>&1 || MISSING="$MISSING npx"

if [[ -n "$MISSING" ]]; then
  echo "WARNING: missing tools:$MISSING" >&2
fi

# 2. Node 版本检查
NODE_VER=$(node -v 2>/dev/null || echo "unknown")
echo "Environment: Node $NODE_VER, $(uname -s)"

# 3. 项目状态注入 -- 让 Claude 一开始就了解当前情况
if [[ -f package.json ]]; then
  echo "Project: $(jq -r '.name // "unnamed"' package.json)"
fi
echo "Git branch: $(git branch --show-current 2>/dev/null || echo 'not a git repo')"
echo "Last commit: $(git log --oneline -1 2>/dev/null || echo 'no commits')"

exit 0`}
        />

        {/* ── PostCompact event ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          PostCompact：上下文压缩后保留关键决策
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          当对话变长时，Claude Code 会自动压缩上下文（compact）。压缩过程中，一些中间讨论和决策细节可能丢失。
          PostCompact 在压缩完成后触发，可以用来<strong>把关键决策写入进度文件</strong>，防止重要信息随压缩消失。
        </p>

        <ConfigExample
          title="PostCompact -- 保存关键决策"
          language="json"
          code={`{
  "hooks": {
    "PostCompact": [
      {
        "type": "command",
        "command": "bash .claude/hooks/save-progress.sh"
      }
    ]
  }
}`}
          annotations={[
            { line: 3, text: 'PostCompact: 上下文压缩后触发。用来补救压缩可能丢失的信息。' },
            { line: 6, text: '将当前进度和关键决策写入文件，Claude 下次可以读取。' },
          ]}
        />

        <CodeBlock
          language="bash"
          title=".claude/hooks/save-progress.sh"
          code={`#!/bin/bash
# PostCompact hook: 保存关键决策到进度文件

PROGRESS_FILE=".claude/progress.md"

# 记录压缩发生的时间
echo "---" >> "$PROGRESS_FILE"
echo "Compact at: $(date '+%Y-%m-%d %H:%M')" >> "$PROGRESS_FILE"

# 保存当前 git 状态作为进度快照
echo "Modified files:" >> "$PROGRESS_FILE"
git diff --name-only 2>/dev/null >> "$PROGRESS_FILE"

# 提示 Claude 下次读取进度文件
echo "Progress saved to $PROGRESS_FILE -- read it to restore context."

exit 0`}
        />

        <QualityCallout title="SessionStart + PostCompact = 上下文保险">
          SessionStart 在会话开头注入项目状态，PostCompact 在压缩后保留关键决策。
          两者配合使用，即使在长对话中 Claude 也不会"失忆"。
          搭配 PreCompact（压缩前注入关键信息），形成完整的上下文保护链。
        </QualityCallout>

        {/* ── Other events reference ── */}
        <ReferenceSection version="其他 Hook 事件">
          <div>
            <p
              className="text-xs mb-3"
              style={{ color: 'var(--color-text-muted)' }}
            >
              除了 PreToolUse、PostToolUse、Stop、SessionStart、PostCompact，Hook 系统还支持以下事件。
              大多数项目不需要用到全部事件 -- 按需选用即可。
            </p>
            <div
              className="rounded-lg overflow-hidden"
              style={{
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg-secondary)',
              }}
            >
              <table className="w-full text-xs">
                <thead>
                  <tr
                    style={{
                      background: 'var(--color-bg-tertiary)',
                      borderBottom: '1px solid var(--color-border)',
                    }}
                  >
                    <th className="text-left px-3 py-2 font-medium" style={{ color: 'var(--color-text-primary)' }}>事件</th>
                    <th className="text-left px-3 py-2 font-medium" style={{ color: 'var(--color-text-primary)' }}>触发时机</th>
                    <th className="text-left px-3 py-2 font-medium" style={{ color: 'var(--color-text-primary)' }}>典型用途</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { event: 'TaskCreated', when: '任务被创建时', use: '任务审计、Slack 通知' },
                    { event: 'WorktreeCreate', when: 'Git worktree 创建时', use: '环境隔离初始化' },
                    { event: 'WorktreeRemove', when: 'Git worktree 移除时', use: '资源清理' },
                    { event: 'CwdChanged', when: '工作目录变更时', use: '环境感知、路径校验' },
                    { event: 'FileChanged', when: '文件被外部修改时', use: '热重载、冲突检测' },
                    { event: 'StopFailure', when: 'Stop hook 返回非零后', use: '失败后的补救措施' },
                    { event: 'Elicitation', when: 'Claude 需要向用户提问时', use: '问题过滤、自动回答' },
                    { event: 'ElicitationResult', when: '用户回答了 Claude 的问题后', use: '回答记录、分析' },
                    { event: 'InstructionsLoaded', when: '指令文件加载后', use: '指令审计、动态注入' },
                    { event: 'ConfigChange', when: '配置发生变更时', use: '配置审计、热重载' },
                    { event: 'SessionEnd', when: '会话结束时', use: '清理资源、生成报告' },
                  ].map((row) => (
                    <tr
                      key={row.event}
                      style={{ borderBottom: '1px solid var(--color-border)' }}
                    >
                      <td className="px-3 py-2 font-mono font-semibold" style={{ color: 'var(--color-accent)' }}>
                        {row.event}
                      </td>
                      <td className="px-3 py-2" style={{ color: 'var(--color-text-secondary)' }}>
                        {row.when}
                      </td>
                      <td className="px-3 py-2" style={{ color: 'var(--color-text-secondary)' }}>
                        {row.use}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ReferenceSection>

        <ExerciseCard
          tier="l2"
          title="给流水线增加安全层"
          description="在 7.2 的质量流水线基础上，增加两个安全 Hook：1) 受保护文件拦截（PreToolUse，阻止修改 .env、credentials.json 等），注意 matcher 要包含 Bash 工具防止绕过；2) 密钥泄露扫描（PostToolUse，正则匹配 AWS/OpenAI/Anthropic API key 模式）。密钥扫描用 exit 1（Ask），文件保护用 exit 2（Deny）。"
          checkpoints={[
            '受保护文件 Hook 的 matcher 包含 "Edit|Write|Bash" -- 防止 Bash 绕过',
            '密钥扫描用 exit 1（Ask 用户确认），文件保护用 exit 2（Deny 直接拒绝）',
            '密钥扫描跳过测试文件（*.test.* / __mocks__/ 等）避免误报',
            'Bash 工具的文件保护检查 redirect 模式（>、>>、tee 等）',
            '测试：让 Claude 尝试修改 .env 文件，确认被拦截',
          ]}
        />
      </section>

      {/* ═══════════════════════════════════════════════
          Section 7.4: 权限模型深入
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          7.4 权限模型深入
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Ch01 介绍了 Claude Code 的三级权限模型（Ask / AcceptEdits / Auto）。
          现在你已经理解了 Hooks，我们可以更深入地看权限模型如何与 Hooks 协同工作。
        </p>

        {/* ── Permission modes ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          三级权限与 Hook 的关系
        </h3>

        <CodeBlock
          language="bash"
          title="permission-modes.txt"
          code={`权限模式                执行                    Hook 交互
═══════════════════     ═══════════════════     ═══════════════════
Ask（默认）             每次工具调用前询问用户   Hooks 在用户确认后、工具执行前触发
AcceptEdits             文件编辑需确认，         PreToolUse Hook 在确认后触发
                        Bash 自动执行            PostToolUse Hook 在执行后触发
Auto                    所有操作自动执行         Hooks 是你唯一的安全保障！

关键理解:
- 权限系统决定"用户是否允许操作"
- Hooks 决定"系统是否允许操作"
- 两者是 AND 关系: 权限放行 + Hook 放行 = 操作执行
- Hook 的 Deny 可以覆盖权限的放行（但不能反过来）`}
        />

        <QualityCallout title="Auto 模式下 Hook 尤为重要">
          当你使用 <code style={{ color: 'var(--color-accent)' }}>--auto</code> 参数运行 Claude Code 时，
          所有操作自动执行，不再有人工确认环节。此时 Hooks 是你唯一的安全屏障。
          建议：在 Auto 模式下，至少配置危险命令拦截和受保护文件拦截两个 PreToolUse Hook。
        </QualityCallout>

        {/* ── settings.json allow/deny ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          settings.json 的 allow/deny 规则
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          除了 Hook exit code，settings.json 的 <code style={{ color: 'var(--color-accent)' }}>permissions</code> 字段
          提供了一套声明式的权限规则。它定义哪些工具调用自动放行（allow）、哪些直接拒绝（deny）。
        </p>

        <ConfigExample
          title="permissions 配置"
          language="json"
          code={`{
  "permissions": {
    "allow": [
      "Read",
      "Glob",
      "Grep",
      "Bash(npm test)",
      "Bash(npx prettier*)",
      "Bash(npx eslint*)",
      "Bash(git log*)",
      "Bash(git diff*)",
      "Bash(git status)"
    ],
    "deny": [
      "Bash(curl*)",
      "Bash(wget*)",
      "Bash(ssh*)",
      "Bash(rm -rf*)"
    ]
  }
}`}
          annotations={[
            { line: 3, text: 'allow: 自动放行的工具调用，跳过用户确认。用通配符 * 匹配参数前缀。' },
            { line: 7, text: '允许 Hook 脚本调用的工具（prettier、eslint）自动执行，避免每次弹确认框。' },
            { line: 14, text: 'deny: 直接拒绝的工具调用。优先级高于 allow -- deny 总是胜出。' },
            { line: 15, text: '禁止 Claude 下载外部文件，防止引入未知代码。' },
          ]}
        />

        {/* ── Execution priority ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          执行优先级
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          当同一事件注册了来自不同来源的 Hook 时，按以下优先级执行。
          高层级来源的 Deny 不可被低层级覆盖。
        </p>

        <CodeBlock
          language="bash"
          title="hook-priority.txt"
          code={`执行顺序（从高到低）：

1. Managed Hooks     — Anthropic 内置安全规则（不可覆盖）
2. Global Hooks      — ~/.claude/settings.json 中定义
3. Project Hooks     — .claude/settings.json 中定义
4. Plugin Hooks      — 通过插件注册

规则：
- 所有来源的 Hook 都会执行（不会短路）
- 最终结果取"最严格"的
- Managed Hook 的 Deny 绝对生效
- 公司管理员可以通过 Global Hooks 设置团队安全底线`}
        />

        {/* ── Team strategy ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          团队权限策略建议
        </h3>

        <div
          className="rounded-lg p-5 space-y-4"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>
              Global（~/.claude/settings.json）-- 安全底线
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              由运维或安全团队统一配置。包含：危险命令拦截、密钥泄露扫描、受保护路径规则。
              所有项目自动继承，开发者不能覆盖 Deny 规则。
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>
              Project（.claude/settings.json）-- 项目定制
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              随代码库提交到 git。包含：项目特有的格式化规则、lint 配置、完成度检查标准。
              可以在 Global 基础上添加更严格的规则，但不能放松 Global 的限制。
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>
              个人偏好 -- 不要放安全相关 Hook
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              个人可以添加便利性 Hook（如自动格式化偏好），但安全规则必须在 Global 或 Project 层面定义。
              个人的 allow 规则不能突破 Global/Project 的 deny。
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 7.5: 验证：你的 Hook 有效吗？
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          7.5 验证：你的 Hook 有效吗？
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          配好 Hook 不等于配对了 Hook。Hook 太严格，Claude 做大量无用功；Hook 太松，形同虚设。
          本节提供度量标准、紧急旁路和排查流程，帮你验证 Hook 是否真正有效。
        </p>

        {/* ── Effectiveness metric ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          拦截率：Hook 有效性的核心指标
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <strong>Hook 拦截率</strong> = 被 Hook 拦截（exit 1 或 exit 2）的操作次数 / 总操作次数。
          这是衡量 Hook 配置质量的最直观指标。
        </p>

        <CodeBlock
          language="bash"
          title="interception-rate.txt"
          code={`Hook 拦截率健康区间：1% ~ 20%

  > 20%  太严格 — Claude 频繁被拦截，做了大量"白费"的推理
         → 检查 matcher 是否太宽泛（.* 匹配所有工具？）
         → 检查脚本逻辑是否过于保守

  1-20%  健康区间 — Hook 在关键时刻介入，大部分操作顺畅执行
         → 定期检查拦截的操作是否都是"该拦的"

  < 1%   太松 — Hook 几乎不触发，形同虚设
         → 检查 matcher 是否太窄（只匹配了极少数工具？）
         → 检查 exit code 是否总是返回 0

如何测量？在 Hook 脚本中增加计数：
  echo "[$(date)] tool=$TOOL_NAME exit=$EXIT_CODE" >> /tmp/hook-stats.log
  一天后统计：grep -c "exit=[12]" /tmp/hook-stats.log`}
        />

        {/* ── Emergency bypass ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          紧急旁路：--no-hooks
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          当 Hook 出 bug 导致工作完全阻塞时，可以用{' '}
          <code style={{ color: 'var(--color-accent)' }}>--no-hooks</code> 临时禁用所有 Hook：
        </p>

        <CodeBlock
          language="bash"
          title="emergency-bypass.sh"
          code={`# 紧急旁路：临时禁用所有 Hook
claude --no-hooks

# 重要：这只是急救措施，不是长期方案！
# 用完后必须修复导致问题的 Hook，然后恢复正常运行。
# 永远不要让 --no-hooks 成为常态。`}
        />

        <QualityCallout title="--no-hooks 是急救药，不是维生素">
          如果你发现自己经常需要 --no-hooks，说明你的 Hook 配置有根本问题。
          回到拦截率指标：检查是哪些 Hook 过于严格，修复它们，而不是绕过整个系统。
        </QualityCallout>

        {/* ── Troubleshooting table ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          排查流程：Hook 误拦截
        </h3>

        <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          当 Hook 错误地阻止了合法操作，按以下步骤排查：
        </p>

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
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>步骤</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>检查内容</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {[
                { step: '1. matcher 模式', check: '正则是否太宽泛？', action: '".*" 改为具体工具名，如 "Bash"' },
                { step: '2. exit code 逻辑', check: '脚本是否在不该拒绝时返回了 exit 2？', action: '检查条件分支，确认 Deny 只用于确定性危险' },
                { step: '3. 手动测试脚本', check: '脚本单独运行是否正常？', action: 'echo \'{"tool_name":"Edit"}\' | bash .claude/hooks/your-hook.sh; echo $?' },
                { step: '4. 最严格胜出', check: '是否有其他 Hook 返回了更严格的结果？', action: '检查同事件的所有 Hook，找到返回 Deny 的那个' },
                { step: '5. 来源优先级', check: 'Global Hook 是否覆盖了 Project Hook？', action: '检查 ~/.claude/settings.json 中的 Hook 和 deny 规则' },
              ].map((row) => (
                <tr
                  key={row.step}
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  <td className="px-4 py-3 font-semibold" style={{ color: 'var(--color-accent)' }}>
                    {row.step}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                    {row.check}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                    <code className="text-xs" style={{ color: 'var(--color-accent)' }}>{row.action}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ExerciseCard
          tier="l2"
          title="测量你的 Hook 拦截率"
          description="在你的四层质量流水线上工作一天，测量 Hook 的拦截率。在每个 Hook 脚本中添加日志行记录 exit code，一天后统计拦截率。目标：保持在 1-20% 的健康区间。如果偏高，缩窄 matcher；如果偏低，检查脚本逻辑是否过于宽松。"
          checkpoints={[
            '每个 Hook 脚本末尾添加了 exit code 日志记录',
            '一天后统计拦截率（exit 1 + exit 2 次数 / 总触发次数）',
            '拦截率在 1-20% 区间内（或已调整 Hook 使其进入区间）',
            '被拦截的操作都是"该拦的"，没有明显误报',
          ]}
        />
      </section>

      {/* ═══════════════════════════════════════════════
          Section 7.6: 常见问题排查
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          7.6 常见问题排查
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Hook 配错了通常不会报错 -- 它只是"不触发"或"没效果"。以下是三个最常见的问题及诊断方法。
        </p>

        {/* ── Problem 1 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          问题 1：Hook 不触发
        </h3>

        <div
          className="rounded-lg p-5 space-y-3"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            检查清单：
          </p>
          <ul className="text-sm space-y-2" style={{ color: 'var(--color-text-secondary)' }}>
            <li>
              <strong>事件名拼写</strong> -- 区分大小写！是 <code style={{ color: 'var(--color-accent)' }}>PostToolUse</code> 不是{' '}
              <code style={{ color: 'var(--color-text-muted)' }}>postToolUse</code> 或{' '}
              <code style={{ color: 'var(--color-text-muted)' }}>post_tool_use</code>。
            </li>
            <li>
              <strong>matcher 正则</strong> -- 确认 matcher 能匹配到目标工具。
              <code style={{ color: 'var(--color-accent)' }}>"Edit|Write"</code> 匹配 Edit 和 Write，
              但 <code style={{ color: 'var(--color-text-muted)' }}>"edit|write"</code> 不匹配（区分大小写）。
            </li>
            <li>
              <strong>settings.json 位置</strong> -- 项目级 Hook 放在 <code style={{ color: 'var(--color-accent)' }}>.claude/settings.json</code>（项目根目录），
              不是 <code style={{ color: 'var(--color-text-muted)' }}>~/.claude/settings.json</code>（那是全局配置）。
            </li>
            <li>
              <strong>JSON 语法</strong> -- settings.json 必须是合法 JSON。多余的逗号、缺少引号都会导致整个文件失效。
            </li>
            <li>
              <strong>if 条件</strong> -- 如果配置了 <code style={{ color: 'var(--color-accent)' }}>if</code> 字段，
              检查条件命令是否返回 exit 0。
            </li>
          </ul>
        </div>

        {/* ── Problem 2 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          问题 2：Hook 触发了但没效果
        </h3>

        <div
          className="rounded-lg p-5 space-y-3"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            检查清单：
          </p>
          <ul className="text-sm space-y-2" style={{ color: 'var(--color-text-secondary)' }}>
            <li>
              <strong>exit code 错误</strong> -- 想拦截操作但用了 exit 0（Allow）？要用 exit 2（Deny）。
              想让用户确认但用了 exit 0？要用 exit 1（Ask）。
            </li>
            <li>
              <strong>脚本权限</strong> -- 确认脚本有执行权限：
              <code style={{ color: 'var(--color-accent)' }}>chmod +x .claude/hooks/your-script.sh</code>。
              或者在 command 中用 <code style={{ color: 'var(--color-accent)' }}>bash .claude/hooks/your-script.sh</code> 显式调用。
            </li>
            <li>
              <strong>jq 未安装</strong> -- command handler 脚本通常依赖 jq 解析 JSON。
              如果 jq 未安装，脚本会静默失败。
            </li>
            <li>
              <strong>prompt handler 输出格式</strong> -- prompt handler 必须在输出中包含{' '}
              <code style={{ color: 'var(--color-accent)' }}>EXIT_CODE=N</code>，否则默认为 exit 0。
            </li>
          </ul>
        </div>

        {/* ── Problem 3 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          问题 3：如何调试 Hook
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Hook 的 stdout 输出会作为上下文反馈给 Claude（你能在对话中看到），
          stderr 输出会显示在 Claude Code 的状态栏或日志中。利用这两个通道做调试：
        </p>

        <CodeBlock
          language="bash"
          title="debug-hook.sh"
          code={`#!/bin/bash
# 调试技巧: 在 Hook 脚本开头添加日志

PAYLOAD=$(cat)

# 将 payload 写入日志文件（调试用，上线后删除）
echo "[$(date)] Hook triggered" >> /tmp/claude-hook-debug.log
echo "$PAYLOAD" | jq '.' >> /tmp/claude-hook-debug.log

# stderr 输出会显示在 Claude Code 状态栏
echo "DEBUG: tool_name=$(echo $PAYLOAD | jq -r '.tool_name')" >&2

# stdout 输出会作为上下文反馈给 Claude
echo "Hook processed successfully"

exit 0`}
        />

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          调试完成后记得移除日志输出。生产环境中 Hook 应该尽量安静 --
          只在有意义的时候（如检测到问题）才输出信息。
        </p>

        <ExerciseCard
          tier="l1"
          title="诊断一个不工作的 Hook"
          description="故意制造一个不工作的 Hook 来练习排查技能：1) 在 settings.json 中故意把事件名写成 'postToolUse'（小写），观察 Hook 不触发；2) 修正后用 exit 0 替代 exit 2，观察 Hook 触发但不拦截；3) 使用 /tmp/claude-hook-debug.log 方法检查 payload 内容。"
          checkpoints={[
            '能识别事件名大小写错误导致的"不触发"问题',
            '能区分 exit 0/1/2 的行为差异',
            '能通过日志文件查看 Hook 接收到的 JSON payload',
            '能通过 stderr 在 Claude Code 中看到调试信息',
          ]}
        />
      </section>

      {/* ═══════════════════════════════════════════════
          Reference Section
          ═══════════════════════════════════════════════ */}
      <ReferenceSection version="Claude Code 2025">
        <div className="space-y-8">

          {/* ── 21+ Events ── */}
          <div>
            <h3
              className="text-base font-semibold mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              完整事件列表（21+ 事件）
            </h3>
            <div
              className="rounded-lg overflow-hidden"
              style={{
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg-secondary)',
              }}
            >
              <table className="w-full text-xs">
                <thead>
                  <tr
                    style={{
                      background: 'var(--color-bg-tertiary)',
                      borderBottom: '1px solid var(--color-border)',
                    }}
                  >
                    <th className="text-left px-3 py-2 font-medium" style={{ color: 'var(--color-text-primary)' }}>事件</th>
                    <th className="text-left px-3 py-2 font-medium" style={{ color: 'var(--color-text-primary)' }}>触发时机</th>
                    <th className="text-left px-3 py-2 font-medium" style={{ color: 'var(--color-text-primary)' }}>Matcher</th>
                    <th className="text-left px-3 py-2 font-medium" style={{ color: 'var(--color-text-primary)' }}>典型用途</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { event: 'SessionStart', when: '会话开始（仅一次）', matcher: '无', use: '环境初始化、日志开始' },
                    { event: 'UserPromptSubmit', when: '用户按回车后、发 LLM 前', matcher: '无', use: '输入过滤、注入检测' },
                    { event: 'PreToolUse', when: '工具调用前', matcher: 'tool_name', use: '安全拦截、权限控制' },
                    { event: 'PostToolUse', when: '工具调用后', matcher: 'tool_name', use: '格式化、lint、密钥扫描' },
                    { event: 'Stop', when: 'Claude 准备停止前', matcher: '无', use: '完成度检查、摘要生成' },
                    { event: 'StopFailure', when: 'Stop hook 返回非零后', matcher: '无', use: '失败后的补救措施' },
                    { event: 'SubagentStart', when: '子 Agent 启动时', matcher: '无', use: '子任务日志、资源限制' },
                    { event: 'SubagentStop', when: '子 Agent 结束时', matcher: '无', use: '子任务结果收集' },
                    { event: 'PreCompact', when: '上下文压缩前', matcher: '无', use: '注入关键信息防丢失' },
                    { event: 'PostCompact', when: '上下文压缩后', matcher: '无', use: '验证压缩质量' },
                    { event: 'TaskCreated', when: '任务创建时', matcher: '无', use: '任务审计、通知' },
                    { event: 'TaskCompleted', when: '任务完成时', matcher: '无', use: '结果收集、下一步触发' },
                    { event: 'Notification', when: '需通知用户时', matcher: '无', use: '自定义通知渠道' },
                    { event: 'CwdChanged', when: '工作目录变更', matcher: '无', use: '环境感知、路径校验' },
                    { event: 'FileChanged', when: '文件被外部修改', matcher: '无', use: '热重载、冲突检测' },
                    { event: 'InstructionsLoaded', when: '指令文件加载后', matcher: '无', use: '指令审计、自定义注入' },
                    { event: 'TeammateIdle', when: '团队模式中其他 Agent 空闲', matcher: '无', use: '负载均衡、任务分发' },
                    { event: 'WorktreeCreate', when: 'Git worktree 创建时', matcher: '无', use: '环境隔离初始化' },
                    { event: 'WorktreeRemove', when: 'Git worktree 移除时', matcher: '无', use: '资源清理' },
                  ].map((row) => (
                    <tr
                      key={row.event}
                      style={{ borderBottom: '1px solid var(--color-border)' }}
                    >
                      <td className="px-3 py-2 font-mono font-semibold" style={{ color: 'var(--color-accent)' }}>
                        {row.event}
                      </td>
                      <td className="px-3 py-2" style={{ color: 'var(--color-text-secondary)' }}>
                        {row.when}
                      </td>
                      <td className="px-3 py-2" style={{ color: 'var(--color-text-muted)' }}>
                        {row.matcher}
                      </td>
                      <td className="px-3 py-2" style={{ color: 'var(--color-text-secondary)' }}>
                        {row.use}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── JSON Schema ── */}
          <div>
            <h3
              className="text-base font-semibold mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Hook 配置 JSON Schema
            </h3>
            <CodeBlock
              language="json"
              title="hook-config-schema.json"
              code={`{
  "hooks": {
    "<EventName>": [
      {
        "matcher": "regex_pattern",       // 可选，正则匹配工具名
        "type": "command | prompt | agent | http",
        "command": "shell command",        // type=command 时必填
        "prompt": "LLM prompt text",       // type=prompt|agent 时必填
        "url": "https://endpoint",         // type=http 时必填
        "headers": { "key": "value" },     // type=http 时可选
        "maxTurns": 20,                    // type=agent 时可选（默认 50）
        "if": "shell condition command",   // 可选，条件执行
        "async": false                     // 可选，异步执行（默认 false）
      }
    ]
  }
}`}
            />
          </div>

          {/* ── Matcher syntax ── */}
          <div>
            <h3
              className="text-base font-semibold mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Matcher 语法参考
            </h3>
            <CodeBlock
              language="bash"
              title="matcher-syntax.txt"
              code={`Matcher 是正则表达式，匹配工具名（区分大小写）

常用模式：
  "Bash"              仅匹配 Bash 工具
  "Edit|Write"        匹配 Edit 或 Write
  "Edit|Write|Bash"   匹配三个工具（防绕过）
  ".*"                匹配所有工具（慎用）
  "Read|Glob|Grep"    匹配只读工具

内置工具名：
  Edit       编辑文件
  Write      创建/覆盖文件
  Read       读取文件
  Bash       执行 shell 命令
  Glob       文件模式搜索
  Grep       内容搜索
  WebFetch   HTTP 请求
  WebSearch  网页搜索
  TodoRead   读取待办
  TodoWrite  写入待办

MCP 工具名格式：
  mcp__<server>_<tool>    如 mcp__playwright_navigate`}
            />
          </div>

          {/* ── Exit code reference ── */}
          <div>
            <h3
              className="text-base font-semibold mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Exit Code 速查
            </h3>
            <CodeBlock
              language="bash"
              title="exit-codes.txt"
              code={`Exit Code   含义      行为                        适用场景
═════════   ═══════   ═══════════════════════════  ═══════════════════════
0           Allow     放行，操作继续执行           格式化成功、lint 通过
                      stdout → Claude 上下文
1           Ask       暂停，询问用户是否继续       密钥疑似泄露、完成度不确定
                      stderr → 状态栏显示
2           Deny      拒绝，操作直接取消           危险命令、受保护文件
                      stderr → 状态栏显示

多 Hook 合并规则（最严格胜出）：
  任何一个 exit 2 → 整体 Deny
  没有 2 但有 1   → 整体 Ask
  全部 0          → Allow`}
            />
          </div>

          {/* ── Hook templates ── */}
          <div>
            <h3
              className="text-base font-semibold mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              常用 Hook 模板
            </h3>

            <p
              className="text-xs mb-3"
              style={{ color: 'var(--color-text-muted)' }}
            >
              以下模板可直接复制到你的项目中使用。
            </p>

            <CodeBlock
              language="json"
              title="template-precompact.json -- 上下文保留"
              code={`{
  "hooks": {
    "PreCompact": [
      {
        "type": "command",
        "command": "echo 'PRESERVE: 项目用 Express+TS, JWT RS256, PostgreSQL+Prisma, Zod 校验, Vitest 测试'"
      }
    ]
  }
}`}
            />

            <CodeBlock
              language="json"
              title="template-injection-scan.json -- 注入检测"
              code={`{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Read|Glob|Grep",
        "type": "command",
        "command": "bash .claude/hooks/injection-scan.sh"
      }
    ]
  }
}`}
            />

            <CodeBlock
              language="json"
              title="template-session-log.json -- 会话审计日志"
              code={`{
  "hooks": {
    "SessionStart": [
      {
        "type": "command",
        "command": "echo \"Session started at $(date) in $(pwd)\" >> .claude/audit.log"
      }
    ],
    "Stop": [
      {
        "type": "command",
        "command": "echo \"Session stopped at $(date)\" >> .claude/audit.log"
      }
    ]
  }
}`}
            />

            <CodeBlock
              language="json"
              title="template-protected-files.json -- 受保护文件"
              code={`{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write|Bash",
        "type": "command",
        "command": "bash .claude/hooks/protect-files.sh"
      }
    ]
  }
}`}
            />
          </div>

          {/* ── Payload examples ── */}
          <div>
            <h3
              className="text-base font-semibold mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              事件 Payload 示例
            </h3>
            <CodeBlock
              language="json"
              title="payload-examples.json"
              code={`// PreToolUse / PostToolUse payload
{
  "session_id": "abc-123",
  "tool_name": "Edit",
  "tool_input": {
    "file_path": "/project/src/index.ts",
    "old_string": "console.log('debug')",
    "new_string": ""
  },
  "tool_output": "..."  // 仅 PostToolUse 有此字段
}

// Stop payload
{
  "session_id": "abc-123",
  "reason": "task_complete",
  "summary": "Implemented user authentication with JWT"
}

// SessionStart payload
{
  "session_id": "abc-123",
  "cwd": "/Users/dev/my-project"
}

// UserPromptSubmit payload
{
  "session_id": "abc-123",
  "prompt_text": "Add input validation to the login endpoint"
}`}
            />
          </div>
        </div>
      </ReferenceSection>
    </div>
  )
}
