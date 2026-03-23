import { CodeBlock } from '../../components/content/CodeBlock'
import { PromptCompare } from '../../components/content/PromptCompare'
import { QualityCallout } from '../../components/content/QualityCallout'
import { ExerciseCard } from '../../components/content/ExerciseCard'
import { ConfigExample } from '../../components/content/ConfigExample'
import { DecisionTree } from '../../components/content/DecisionTree'

/* ═══════════════════════════════════════════════
   Decision Tree Data: Hook Type Selection
   ═══════════════════════════════════════════════ */

const hookTypeTree = {
  id: 'root',
  question: '你的自动化需求是什么类型?',
  description: '根据需求特征选择最合适的 Hook 类型。',
  children: [
    {
      label: '确定性规则判断',
      node: {
        id: 'deterministic',
        question: '需要外部服务参与吗?',
        children: [
          {
            label: '不需要, 本地执行',
            node: {
              id: 'command',
              question: '推荐: Command Hook',
              result: {
                text: '使用 Command Hook。通过 stdin 接收 JSON, 用脚本做确定性判断 (路径匹配、正则检测、文件类型过滤), 通过 exit code 返回结果。执行快、可预测、零 token 消耗。',
                tier: 'l1',
              },
              description: '适用场景: 格式化、lint、路径黑名单、危险命令拦截、密钥泄露扫描。',
            },
          },
          {
            label: '需要调用外部 API',
            node: {
              id: 'http',
              question: '推荐: HTTP Hook',
              result: {
                text: '使用 HTTP Hook。将事件 payload 发送到外部 HTTP 端点, 由远程服务做判断。适合团队共享的集中式策略管控, 或需要调用第三方安全扫描服务的场景。',
                tier: 'l2',
              },
              description: '适用场景: Slack 通知、集中式安全策略服务、CI/CD 触发、审计日志。',
            },
          },
        ],
      },
    },
    {
      label: '需要语义理解',
      node: {
        id: 'semantic',
        question: '判断过程需要多少步骤?',
        children: [
          {
            label: '单次判断即可',
            node: {
              id: 'prompt',
              question: '推荐: Prompt Hook',
              result: {
                text: '使用 Prompt Hook。用一个 LLM prompt 做单轮语义判断: "这次修改是否完成了所有任务?" "这段代码是否有安全隐患?" 消耗少量 token, 但能处理模糊判断。',
                tier: 'l2',
              },
              description: '适用场景: 完成度检查、代码质量评估、变更摘要生成。',
            },
          },
          {
            label: '需要多步验证 (读文件、跑测试等)',
            node: {
              id: 'agent',
              question: '推荐: Agent Hook',
              result: {
                text: '使用 Agent Hook。启动一个最多 50 轮的子 Agent, 可以使用工具 (读文件、执行命令) 进行深度验证。功能最强, 但 token 消耗最大, 慎用。',
                tier: 'l3',
              },
              description: '适用场景: 自动 code review、架构一致性验证、跨文件依赖检查。',
            },
          },
        ],
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
            Automation Phase
          </span>
        </div>
        <h1
          className="text-3xl md:text-4xl font-bold mb-4 leading-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          用 AI 做自动化：Hooks + Skills
        </h1>
        <p
          className="text-lg leading-relaxed max-w-3xl"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          前几章我们学会了如何写好 prompt、如何做 Plan、如何构建项目。但每次都要手动检查代码格式、
          手动跑 lint、手动确认任务完成度 -- 这些重复劳动正是 AI 应该自动化的。
          Hook 系统让你在 Claude 的每一个操作节点插入自动化检查，Skills 系统让你把复杂的工作流封装成一键触发的命令。
          这一章，我们要把 Claude Code 从"一个聊天工具"变成"一条自动化质量流水线"。
        </p>
      </header>

      {/* ═══════════════════════════════════════════════
          Section 5.1: Hook 事件模型
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          5.1 Hook 事件模型
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Hook 的本质是事件驱动的拦截器。Claude Code 在执行过程中会触发一系列生命周期事件，
          你可以在任何事件节点注册 Hook，对事件进行拦截、修改或阻止。
          理解这 9 个事件是使用 Hook 的前提。
        </p>

        <CodeBlock
          language="bash"
          title="hook-lifecycle-events.txt"
          code={`Claude Code 生命周期事件（按执行顺序）
═══════════════════════════════════════════

SessionStart        会话开始时触发（仅一次）
  │                 Matcher: 无
  │                 Payload: { session_id, cwd }
  ▼
UserPromptSubmit    用户按下回车后、发送给 LLM 前
  │                 Matcher: 无
  │                 Payload: { prompt_text, session_id }
  ▼
┌─────── Agentic Loop ──────────────────┐
│                                        │
│  PreToolUse       工具调用前            │
│    │              Matcher: tool_name    │
│    │              (Edit, Write, Bash,   │
│    │               Glob, Grep, Read...) │
│    │              Payload: { tool_name, │
│    │                tool_input }        │
│    ▼                                   │
│  [工具执行]                             │
│    │                                   │
│    ▼                                   │
│  PostToolUse      工具调用后            │
│    │              Matcher: tool_name    │
│    │              Payload: { tool_name, │
│    │                tool_input,         │
│    │                tool_output }       │
│    ▼                                   │
│  (循环直到任务完成)                      │
│                                        │
│  SubagentStart    子 Agent 启动时       │
│    │              Matcher: 无           │
│    │              Payload: { task }     │
│    ▼                                   │
│  SubagentStop     子 Agent 结束时       │
│    │              Matcher: 无           │
│    │              Payload: { task,      │
│    │                result }            │
│    ▼                                   │
│  PreCompact       上下文压缩前          │
│                   Matcher: 无           │
│                   Payload: { summary,   │
│                     message_count }     │
│                                        │
└────────────────────────────────────────┘
  │
  ▼
Notification        需要通知用户时
  │                 Matcher: 无
  │                 Payload: { message }
  ▼
Stop                任务完成、Claude 停止前
                    Matcher: 无
                    Payload: { reason, summary }`}
        />

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          三种返回状态
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          每个 Hook 执行后通过 exit code 告诉 Claude Code 下一步该做什么：
        </p>

        <CodeBlock
          language="bash"
          title="hook-exit-codes.sh"
          code={`# exit 0 — Allow（放行）
# Hook 执行成功，操作继续。stdout 输出会作为上下文反馈给 Claude。
exit 0

# exit 1 — Ask（询问用户）
# Hook 发现潜在问题，暂停操作，让用户决定是否继续。
# 用于"不确定是否应该阻止"的灰色地带。
echo "检测到可能的安全风险：文件包含 API key 模式" >&2
exit 1

# exit 2 — Deny（拒绝）
# Hook 明确拒绝此操作，操作被取消，不会执行。
# 用于确定性的安全规则。
echo "禁止操作：不允许修改 .env 文件" >&2
exit 2`}
        />

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          执行优先级
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          当同一事件注册了多个 Hook 时，按以下顺序执行。高优先级的拒绝会覆盖低优先级的放行：
        </p>

        <CodeBlock
          language="bash"
          title="hook-execution-order.txt"
          code={`执行顺序（从高到低）:

1. Managed Hooks     — Anthropic 内置的安全规则（不可覆盖）
2. Global Hooks      — ~/.claude/settings.json 中定义
3. Project Hooks     — .claude/settings.json 中定义
4. Plugin Hooks      — 通过插件注册

规则：
- 所有 Hook 都会执行（不会短路）
- 最终结果取"最严格"的那个
- 任何一个 Hook 返回 exit 2 → 整体 Deny
- 没有 exit 2 但有 exit 1 → 整体 Ask
- 全部 exit 0 → Allow`}
        />

        <QualityCallout title="关键理解">
          Hook 不是"建议"，是"拦截"。一个 Deny 就能阻止操作，不管其他 Hook 怎么说。
          这意味着你的安全 Hook 永远有最终否决权 -- 这是 Hook 系统安全性的基石。
        </QualityCallout>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 5.2: 四种 Hook 类型与选型
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          5.2 四种 Hook 类型与选型
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Claude Code 支持四种 Hook 类型，它们在能力、成本和适用场景上有显著差异。
          选错类型会导致流水线要么太慢（用 Agent 做简单格式化），要么太弱（用 Command 做语义判断）。
        </p>

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Command Hook：确定性脚本
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          通过 stdin 接收事件 JSON payload，执行本地脚本，通过 stdout/stderr + exit code 返回结果。
          零 token 消耗，执行速度最快，适合所有确定性规则。
        </p>

        <CodeBlock
          language="json"
          title="command-hook-structure.json"
          code={`{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "type": "command",
        "command": "node .claude/hooks/format-check.js"
      }
    ]
  }
}`}
        />

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Prompt Hook：单轮 LLM 判断
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          发送一个 prompt 给 LLM 做单次语义判断。适合需要"理解"才能判断的场景，
          比如判断任务是否真的完成、代码改动是否合理。消耗少量 token。
        </p>

        <CodeBlock
          language="json"
          title="prompt-hook-structure.json"
          code={`{
  "hooks": {
    "Stop": [
      {
        "type": "prompt",
        "prompt": "Review the work done in this session. Check: 1) Are all requested features implemented? 2) Are there tests for new code? 3) Are there any TODO comments left? If anything is incomplete, respond with EXIT_CODE=1 and explain what's missing. Otherwise respond with EXIT_CODE=0."
      }
    ]
  }
}`}
        />

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Agent Hook：多轮深度验证
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          启动一个子 Agent（最多 50 轮对话），可以使用工具（读文件、执行 Bash 命令等）。
          功能最强但 token 消耗最大，适合需要跨文件验证、运行测试等复杂场景。
        </p>

        <CodeBlock
          language="json"
          title="agent-hook-structure.json"
          code={`{
  "hooks": {
    "Stop": [
      {
        "type": "agent",
        "prompt": "Verify the changes made in this session: 1) Read all modified files and check for code quality issues. 2) Run 'npm test' and verify all tests pass. 3) Check that no console.log statements were left in production code. Report any issues found.",
        "maxTurns": 20
      }
    ]
  }
}`}
        />

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          HTTP Hook：外部服务集成
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          将事件 payload 通过 HTTP POST 发送到外部端点。适合团队级别的集中式策略管控、
          审计日志记录、或需要调用第三方服务的场景。
        </p>

        <CodeBlock
          language="json"
          title="http-hook-structure.json"
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

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          选型决策树
        </h3>

        <DecisionTree
          root={hookTypeTree}
          title="Hook 类型选择器"
        />

        <PromptCompare
          bad={{
            label: '过度设计',
            prompt: `Stop hook 用 Agent 类型来检查代码格式
→ 每次停止消耗 5000+ token
→ 启动子 Agent 需要 3-5 秒`,
            explanation: '格式检查是确定性规则，用 Command hook 运行 prettier 即可，零 token 消耗，毫秒级完成。',
          }}
          good={{
            label: '合理选型',
            prompt: `PostToolUse hook 用 Command 运行 prettier
Stop hook 用 Prompt 检查任务完成度
Agent hook 仅用于深度 code review`,
            explanation: '每种类型用在最合适的场景：确定性用 Command，语义判断用 Prompt，复杂验证用 Agent。',
          }}
        />
      </section>

      {/* ═══════════════════════════════════════════════
          Section 5.3: 实战：自动化质量流水线
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          5.3 实战：自动化质量流水线
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          基于前几章构建的 Express API 项目，我们来搭建一条完整的自动化质量流水线。
          目标：Claude 每次编辑代码后自动格式化、自动 lint 修复；完成任务前自动检查完成度；
          执行 Bash 命令前自动拦截危险操作。
        </p>

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Layer 1: 自动格式化 (PostToolUse + Prettier)
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          每次 Claude 编辑或创建文件后，自动运行 prettier 格式化。
          注意：我们需要一个中间脚本来做文件类型过滤和失败降级，而不是直接调用 prettier。
        </p>

        <CodeBlock
          language="bash"
          title=".claude/hooks/auto-format.sh"
          code={`#!/bin/bash
# PostToolUse hook: 自动格式化被修改的文件
# 通过 stdin 接收 JSON payload, 提取文件路径后运行 prettier

set -euo pipefail

# 从 stdin 读取 JSON payload
PAYLOAD=$(cat)

# 提取工具名和文件路径
TOOL_NAME=$(echo "$PAYLOAD" | jq -r '.tool_name // empty')
FILE_PATH=$(echo "$PAYLOAD" | jq -r '.tool_input.file_path // .tool_input.path // empty')

# 只处理 Edit 和 Write 工具
if [[ "$TOOL_NAME" != "Edit" && "$TOOL_NAME" != "Write" ]]; then
  exit 0
fi

# 文件路径为空则跳过
if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

# 文件类型过滤: 只格式化前端/后端代码文件
case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.css|*.scss|*.html|*.md|*.yaml|*.yml)
    # 支持的文件类型, 继续
    ;;
  *)
    # 不支持的文件类型 (二进制文件、图片等), 跳过
    exit 0
    ;;
esac

# 检查文件是否存在 (可能是删除操作)
if [[ ! -f "$FILE_PATH" ]]; then
  exit 0
fi

# 运行 prettier, 失败时降级为跳过 (不阻断工作流)
if npx prettier --write "$FILE_PATH" 2>/dev/null; then
  echo "Formatted: $FILE_PATH"
else
  echo "Prettier skipped (not installed or parse error): $FILE_PATH" >&2
  # 格式化失败不应阻断编辑操作, exit 0 继续
fi

exit 0`}
          highlightLines={[12, 23, 37, 44]}
        />

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Layer 2: 自动 Lint 修复 (PostToolUse + ESLint)
        </h3>

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

if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

# ESLint 只处理 JS/TS 文件
case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx)
    ;;
  *)
    exit 0
    ;;
esac

if [[ ! -f "$FILE_PATH" ]]; then
  exit 0
fi

# --fix 自动修复, 失败时记录但不阻断
if npx eslint --fix "$FILE_PATH" 2>/dev/null; then
  echo "Linted: $FILE_PATH"
else
  echo "ESLint reported issues in: $FILE_PATH" >&2
  # lint 错误反馈给 Claude, 但不阻断操作
fi

exit 0`}
        />

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Layer 3: 完成度检查 (Stop + Prompt Hook)
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Claude 认为任务完成要停止时，用一个 Prompt Hook 做最后的语义检查。
          如果发现遗漏，返回 exit 1 让用户决定是否继续。
        </p>

        <CodeBlock
          language="json"
          title="stop-hook-prompt.json"
          code={`{
  "type": "prompt",
  "prompt": "Review the conversation and changes made. Check these criteria:\\n1. Were ALL tasks in the original request completed?\\n2. Were tests written or updated for new/changed code?\\n3. Are there any leftover TODO or FIXME comments?\\n4. Were any files left in a broken state?\\n\\nIf everything is complete, respond EXIT_CODE=0.\\nIf anything is missing, respond EXIT_CODE=1 and list what's incomplete."
}`}
        />

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Layer 4: 危险命令拦截 (PreToolUse + Bash)
        </h3>

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

# 危险命令黑名单 (正则匹配)
DANGEROUS_PATTERNS=(
  "rm -rf /"
  "rm -rf ~"
  "rm -rf \."
  "DROP TABLE"
  "DROP DATABASE"
  "TRUNCATE TABLE"
  "git push.*--force"
  "git push.*-f "
  "git reset --hard"
  "chmod 777"
  ":(){ :|:& };:"
  "> /dev/sda"
  "mkfs\."
  "dd if=.*of=/dev/"
)

for pattern in "\${DANGEROUS_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qiE "$pattern"; then
    echo "BLOCKED: 检测到危险命令模式 '$pattern'" >&2
    echo "原始命令: $COMMAND" >&2
    echo "如果你确实需要执行此操作, 请手动在终端中运行。" >&2
    exit 2  # Deny - 直接拒绝
  fi
done

exit 0`}
          highlightLines={[17, 34, 37]}
        />

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          完整 settings.json 配置
        </h3>

        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          将四层 Hook 整合到项目的 .claude/settings.json 中。注意 Hook 的声明顺序就是同一事件内的执行顺序。
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
        "prompt": "Review the conversation and changes made. Check: 1) Were ALL tasks completed? 2) Were tests written/updated? 3) Any leftover TODOs? 4) Any broken files? If complete: EXIT_CODE=0. If incomplete: EXIT_CODE=1 with details."
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
            { line: 5, text: 'matcher 使用正则匹配工具名。"Bash" 只匹配 Bash 工具的调用。' },
            { line: 7, text: 'Hook 脚本通过 stdin 接收完整的事件 JSON payload。' },
            { line: 12, text: '"Edit|Write" 匹配 Edit 或 Write 工具。| 是正则 OR 语法。' },
            { line: 17, text: '同一事件可以注册多个 Hook，按声明顺序执行。先 format 再 lint。' },
            { line: 25, text: 'Prompt hook 不需要 matcher，Stop 事件全局触发。' },
            { line: 26, text: 'prompt 内容直接发送给 LLM 做单轮判断，消耗约 200-500 token。' },
            { line: 30, text: 'permissions.allow 白名单确保 Hook 脚本调用的工具不会被权限拦截。' },
            { line: 32, text: '允许 prettier 和 eslint 的自动执行，避免每次都弹权限确认。' },
          ]}
        />

        <QualityCallout title="流水线执行流程">
          Claude 编辑文件 → PostToolUse 触发 → auto-format.sh 格式化 → auto-lint.sh 修复 lint →
          Claude 继续工作 → ... → Claude 准备停止 → Stop 触发 → Prompt hook 检查完成度 →
          如果有遗漏，用户被告知并可以让 Claude 继续。整个过程对 Claude 几乎透明。
        </QualityCallout>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 5.4: 安全 Hook
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          5.4 安全 Hook
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          5.3 的流水线解决了代码质量问题，但还有一类更严肃的问题：安全。
          Claude 可能会修改 .env 文件、在代码中硬编码 API key、或在 Bash 中执行危险操作。
          安全 Hook 是你的最后一道防线。
        </p>

        <QualityCallout title="质量线">
          Hook 是在 AI 操作和代码提交之间插入自动化质量检查的机制。
          数据表明，使用 Claude Code 而不配置安全 Hook 时，密钥泄露率是基线的 2 倍。
          这不是因为 Claude 恶意泄露，而是因为它在示例代码和测试中倾向于使用真实格式的 token。
        </QualityCallout>

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          受保护文件拦截
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          阻止 Claude 修改敏感文件。关键点：不仅要拦截 Edit/Write 工具，还要拦截 Bash 工具 --
          否则 Claude 可以通过 <code style={{ color: 'var(--color-accent)' }}>echo "..." {'>'} .env</code> 绕过你的 PreToolUse 拦截。
          这是 Ch0 提到的权限盲区。
        </p>

        <CodeBlock
          language="bash"
          title=".claude/hooks/protect-files.sh"
          code={`#!/bin/bash
# PreToolUse hook: 阻止修改受保护文件
# 适用 matcher: "Edit|Write|Bash"  ← 注意包含 Bash!
set -euo pipefail

PAYLOAD=$(cat)
TOOL_NAME=$(echo "$PAYLOAD" | jq -r '.tool_name // empty')

# ── 受保护文件列表 ──
PROTECTED_PATTERNS=(
  "\.env$"
  "\.env\..*"
  "credentials\.json"
  "serviceAccount.*\.json"
  "\.pem$"
  "\.key$"
  "id_rsa"
  "\.claude/settings\.json"
)

# ── 对 Edit/Write 工具：直接检查 file_path ──
if [[ "$TOOL_NAME" == "Edit" || "$TOOL_NAME" == "Write" ]]; then
  FILE_PATH=$(echo "$PAYLOAD" | jq -r '.tool_input.file_path // empty')
  for pattern in "\${PROTECTED_PATTERNS[@]}"; do
    if echo "$FILE_PATH" | grep -qE "$pattern"; then
      echo "BLOCKED: 禁止修改受保护文件: $FILE_PATH" >&2
      echo "匹配规则: $pattern" >&2
      exit 2
    fi
  done
fi

# ── 对 Bash 工具：检查命令是否操作受保护文件 ──
# 这是防止 Claude 用 Bash 绕过 Edit/Write 拦截的关键
if [[ "$TOOL_NAME" == "Bash" ]]; then
  COMMAND=$(echo "$PAYLOAD" | jq -r '.tool_input.command // empty')
  for pattern in "\${PROTECTED_PATTERNS[@]}"; do
    # 检查命令中是否包含受保护文件的操作
    if echo "$COMMAND" | grep -qE "(>|>>|tee|cp|mv|sed -i|chmod|chown).*$pattern"; then
      echo "BLOCKED: Bash 命令尝试修改受保护文件" >&2
      echo "命令: $COMMAND" >&2
      echo "匹配规则: $pattern" >&2
      exit 2
    fi
  done
fi

exit 0`}
          highlightLines={[3, 35, 40]}
        />

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          密钥泄露扫描
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          在 PostToolUse 阶段扫描 Claude 写入文件的内容，检测是否包含密钥模式。
        </p>

        <CodeBlock
          language="bash"
          title=".claude/hooks/secret-scan.sh"
          code={`#!/bin/bash
# PostToolUse hook: 扫描写入内容是否包含密钥
set -euo pipefail

PAYLOAD=$(cat)
TOOL_NAME=$(echo "$PAYLOAD" | jq -r '.tool_name // empty')

if [[ "$TOOL_NAME" != "Edit" && "$TOOL_NAME" != "Write" ]]; then
  exit 0
fi

FILE_PATH=$(echo "$PAYLOAD" | jq -r '.tool_input.file_path // .tool_input.path // empty')

if [[ -z "$FILE_PATH" || ! -f "$FILE_PATH" ]]; then
  exit 0
fi

# 跳过测试文件和 mock 目录 (它们经常包含假 token)
case "$FILE_PATH" in
  *__tests__*|*__mocks__*|*.test.*|*.spec.*|*fixture*)
    exit 0
    ;;
esac

# 密钥模式列表
SECRET_PATTERNS=(
  "AKIA[0-9A-Z]{16}"                    # AWS Access Key
  "sk-[a-zA-Z0-9]{48}"                  # OpenAI API Key
  "sk-ant-[a-zA-Z0-9-]{80,}"            # Anthropic API Key
  "ghp_[a-zA-Z0-9]{36}"                 # GitHub Personal Access Token
  "gho_[a-zA-Z0-9]{36}"                 # GitHub OAuth Token
  "xoxb-[0-9]{11}-[0-9]{11}-[a-zA-Z0-9]{24}"  # Slack Bot Token
  "-----BEGIN (RSA |EC )?PRIVATE KEY-----"     # Private Keys
  "mongodb\\+srv://[^:]+:[^@]+@"        # MongoDB Connection String
  "postgres://[^:]+:[^@]+@"             # PostgreSQL Connection String
)

FOUND_SECRETS=0

for pattern in "\${SECRET_PATTERNS[@]}"; do
  if grep -qE "$pattern" "$FILE_PATH" 2>/dev/null; then
    echo "WARNING: 检测到疑似密钥模式" >&2
    echo "  文件: $FILE_PATH" >&2
    echo "  模式: $pattern" >&2
    FOUND_SECRETS=1
  fi
done

if [[ $FOUND_SECRETS -eq 1 ]]; then
  echo "" >&2
  echo "建议: 使用环境变量替代硬编码的密钥。" >&2
  exit 1  # Ask - 让用户确认是否为误报
fi

exit 0`}
          highlightLines={[20, 28, 49]}
        />

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Prompt Injection 扫描
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          当 Claude 读取外部文件或用户输入时，内容可能包含 prompt injection 攻击。
          可以集成 parry 等注入检测工具作为 Hook。
        </p>

        <CodeBlock
          language="bash"
          title=".claude/hooks/injection-scan.sh"
          code={`#!/bin/bash
# PostToolUse hook: 扫描读取内容是否包含注入攻击
# matcher: "Read|Glob|Grep"
set -euo pipefail

PAYLOAD=$(cat)
TOOL_NAME=$(echo "$PAYLOAD" | jq -r '.tool_name // empty')
TOOL_OUTPUT=$(echo "$PAYLOAD" | jq -r '.tool_output // empty')

# 检查工具输出中是否有注入模式
INJECTION_PATTERNS=(
  "ignore previous instructions"
  "ignore all previous"
  "disregard.*instructions"
  "you are now"
  "new system prompt"
  "IMPORTANT: override"
  "<system>"
)

for pattern in "\${INJECTION_PATTERNS[@]}"; do
  if echo "$TOOL_OUTPUT" | grep -qiE "$pattern"; then
    echo "WARNING: 检测到疑似 prompt injection" >&2
    echo "  工具: $TOOL_NAME" >&2
    echo "  模式: $pattern" >&2
    exit 1  # Ask 用户确认
  fi
done

exit 0`}
        />

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          PreCompact 上下文保留 Hook
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          当上下文窗口快满、Claude 要做 compact（压缩上下文）时，
          你可以通过 PreCompact hook 注入关键信息，确保压缩后不会丢失重要上下文。
        </p>

        <CodeBlock
          language="json"
          title="precompact-hook.json"
          code={`{
  "hooks": {
    "PreCompact": [
      {
        "type": "command",
        "command": "echo 'CRITICAL CONTEXT TO PRESERVE: 1) We are building an Express API with TypeScript. 2) Auth uses JWT with RS256. 3) Database is PostgreSQL with Prisma ORM. 4) All endpoints must have input validation with Zod. 5) Test framework is Vitest.'"
      }
    ]
  }
}`}
        />

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          完整安全 Hook 配置
        </h3>

        <ConfigExample
          title=".claude/settings.json -- 安全 Hook 层"
          language="json"
          code={`{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write|Bash",
        "type": "command",
        "command": "bash .claude/hooks/protect-files.sh"
      },
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
        "command": "bash .claude/hooks/secret-scan.sh"
      },
      {
        "matcher": "Read|Glob|Grep",
        "type": "command",
        "command": "bash .claude/hooks/injection-scan.sh"
      },
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
    "PreCompact": [
      {
        "type": "command",
        "command": "echo 'PRESERVE: Express+TS, JWT RS256, PostgreSQL+Prisma, Zod validation, Vitest'"
      }
    ],
    "Stop": [
      {
        "type": "prompt",
        "prompt": "Review all changes. Check: 1) All tasks done? 2) Tests written? 3) No TODOs left? 4) No secrets in code? EXIT_CODE=0 if complete, EXIT_CODE=1 if not."
      }
    ]
  }
}`}
          annotations={[
            { line: 5, text: '关键：matcher 包含 Bash，防止通过 echo > file 绕过 Edit/Write 拦截。' },
            { line: 10, text: '危险命令拦截放在文件保护之后，因为它们检查不同的维度。' },
            { line: 17, text: '安全扫描在格式化之前执行，先检查安全再修复格式。' },
            { line: 22, text: '扫描 Read/Glob/Grep 的输出，检测外部内容中的注入攻击。' },
            { line: 36, text: 'PreCompact 确保上下文压缩时不丢失关键项目信息。' },
            { line: 42, text: 'Stop hook 是最后一道关卡，综合检查所有维度。' },
          ]}
        />
      </section>

      {/* ═══════════════════════════════════════════════
          Section 5.5: Skills 系统
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          5.5 Skills 系统
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Hook 解决了"自动触发"的问题，但有些工作流需要"手动触发"：
          code review、生成 changelog、重构检查等。Skills 系统让你把这些复杂工作流封装成
          斜杠命令，一键触发。
        </p>

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Skills vs Commands
        </h3>

        <CodeBlock
          language="bash"
          title="skills-vs-commands.txt"
          code={`Skills（技能）                           Commands（命令）
═══════════════════════                  ═══════════════════════
用户定义的斜杠命令                        Claude 内置的斜杠命令
/review, /changelog, /refactor           /help, /clear, /compact
存储在 .claude/skills/ 目录              内置在 Claude Code 中
Markdown 文件 + frontmatter              不可自定义
可以调用 LLM 和工具                       固定功能
支持参数替换和动态上下文                    无参数系统
可以在 context: fork 中隔离执行           在主会话中执行`}
        />

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Skill 文件结构与 Frontmatter 字段
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          每个 Skill 是一个 Markdown 文件，放在 .claude/skills/ 目录下。
          文件开头的 YAML frontmatter 定义元数据和行为参数。
        </p>

        <ConfigExample
          title=".claude/skills/example.md -- Skill 文件结构"
          language="markdown"
          code={`---
name: review
description: Perform a thorough code review on recent changes
arguments:
  - name: scope
    description: "What to review: 'staged', 'branch', or a file path"
    required: false
    default: "staged"
allowed-tools: Read, Bash, Glob, Grep
context: fork
disable-model-invocation: false
max-turns: 30
model: claude-sonnet-4-20250514
---

# Code Review Skill

You are a senior code reviewer. Review the changes specified by the user.

## Instructions

1. First, understand the scope of changes
2. Check for bugs, security issues, and code quality
3. Provide actionable feedback with line references`}
          annotations={[
            { line: 2, text: 'name: 定义触发命令名。用 /review 调用此 Skill。' },
            { line: 3, text: 'description: 在 Skill 列表中显示的描述文字。' },
            { line: 4, text: 'arguments: 定义 Skill 接受的参数列表。调用时 /review staged。' },
            { line: 5, text: 'name: 参数名，在模板中用 $ARGUMENTS 或 $0, $1 引用。' },
            { line: 9, text: 'allowed-tools: 限制 Skill 可以使用的工具，减少安全风险。' },
            { line: 10, text: 'context: fork 表示在隔离上下文中执行，不污染主会话。' },
            { line: 11, text: 'disable-model-invocation: true 时禁止 Skill 调用 LLM，只执行模板内容。' },
            { line: 12, text: 'max-turns: 限制 Skill 的最大对话轮数，防止失控。' },
            { line: 13, text: 'model: 指定使用的模型。Skill 可以用比主会话更便宜/快的模型。' },
          ]}
        />

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          12 个 Frontmatter 字段详解
        </h3>

        <CodeBlock
          language="yaml"
          title="frontmatter-fields.yaml"
          code={`# ── 基础字段 ──
name: review                    # 必填。命令名，用 /name 触发
description: "Code review"      # 推荐。在列表中的描述
arguments:                      # 可选。参数定义
  - name: target
    description: "Review target"
    required: false
    default: "staged"

# ── 行为控制 ──
context: fork                   # fork | main (默认 main)
                                # fork: 隔离执行，不影响主会话上下文
                                # main: 在主会话中执行，共享上下文
allowed-tools: Read, Bash       # 逗号分隔。限制可用工具
max-turns: 30                   # 最大对话轮数 (默认无限)
model: claude-sonnet-4-20250514      # 指定模型 (默认跟随主会话)

# ── 安全控制 ──
disable-model-invocation: false # true 时禁止调用 LLM
                                # 用于纯模板 Skill (无 AI 判断)

# ── 高级字段 ──
inherit-context: true           # 是否继承主会话上下文
timeout: 300                    # 超时秒数
tags: [review, quality]         # 标签，用于分类`}
        />

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          动态上下文注入：!command 语法
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Skill 模板中可以用 <code style={{ color: 'var(--color-accent)' }}>{'`!command`'}</code> 语法动态注入命令输出。
          这让 Skill 能在每次调用时获取最新的项目状态。
        </p>

        <CodeBlock
          language="markdown"
          title="dynamic-context-example.md"
          code={`---
name: review-staged
description: Review currently staged changes
context: fork
---

# Review Staged Changes

Here are the currently staged changes:

\`!git diff --cached\`

Here is the project structure for context:

\`!find src -name "*.ts" | head -20\`

Review these changes for:
1. Bugs and logic errors
2. Security vulnerabilities
3. Code style consistency
4. Missing error handling`}
          highlightLines={[11, 15]}
        />

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <code style={{ color: 'var(--color-accent)' }}>{'`!git diff --cached`'}</code> 在 Skill 启动时被替换为实际的 git diff 输出。
          这意味着每次调用 /review-staged 时，Claude 都能看到最新的暂存区变更。
        </p>

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          参数替换
        </h3>

        <CodeBlock
          language="markdown"
          title="argument-substitution.md"
          code={`---
name: explain
description: Explain a file or function in detail
arguments:
  - name: target
    description: "File path or function name"
    required: true
---

# Explain: $ARGUMENTS

Read and analyze the following:
- If $0 is a file path, read the entire file
- If $0 is a function name, search for it in the codebase

$ARGUMENTS — 所有参数拼接为一个字符串
$0        — 第一个参数
$1        — 第二个参数
$2        — 第三个参数 (以此类推)

用法示例:
  /explain src/auth/jwt.ts       → $ARGUMENTS = "src/auth/jwt.ts", $0 = "src/auth/jwt.ts"
  /explain validateToken strict   → $ARGUMENTS = "validateToken strict", $0 = "validateToken", $1 = "strict"`}
        />

        <QualityCallout title="context: fork 的重要性">
          如果你的 Skill 需要读取大量文件或执行耗时操作，务必使用 context: fork。
          否则这些操作的输出会填满主会话的上下文窗口，导致后续对话质量下降甚至触发 compact。
          fork 模式下，Skill 执行完毕后，只有最终结果会返回给主会话。
        </QualityCallout>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 5.6: 实战：从零写 Code Review Skill
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          5.6 实战：从零写 Code Review Skill
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          我们来完整实现一个 Code Review Skill，逐行解释每个设计决策。
          这个 Skill 应该能对当前分支的变更做深度 review，输出结构化的反馈报告。
        </p>

        <CodeBlock
          language="markdown"
          title=".claude/skills/review.md"
          code={`---
name: review
description: Deep code review for current branch changes vs main
arguments:
  - name: base
    description: "Base branch to compare against"
    required: false
    default: "main"
allowed-tools: Read, Bash, Glob, Grep
context: fork
max-turns: 30
model: claude-sonnet-4-20250514
---

# Code Review: Current Branch vs $0

## Context

You are a senior engineer performing a thorough code review.
Your goal is to find real issues, not nitpick style (that's handled by automated tools).

## Changes to Review

\`!git diff $0...HEAD --stat\`

### Detailed Diff

\`!git diff $0...HEAD\`

### Recent Commits

\`!git log $0...HEAD --oneline\`

## Review Checklist

For each file changed, check:

### 1. Correctness
- Logic errors, off-by-one, null/undefined handling
- Edge cases not covered
- Race conditions in async code

### 2. Security
- SQL injection, XSS, CSRF vulnerabilities
- Hardcoded secrets or credentials
- Improper input validation
- Authentication/authorization gaps

### 3. Design
- Does the change follow existing patterns in the codebase?
- Are there unnecessary abstractions or missing abstractions?
- Is the naming clear and consistent?

### 4. Error Handling
- Are errors caught and handled appropriately?
- Are error messages helpful for debugging?
- Are there missing try/catch blocks around I/O operations?

### 5. Tests
- Are there tests for new functionality?
- Do tests cover edge cases?
- Are test names descriptive?

## Output Format

Organize your review as:

### Critical Issues (must fix)
- [FILE:LINE] Description of issue

### Suggestions (should consider)
- [FILE:LINE] Description of suggestion

### Positive Notes
- Things done well that should be continued

### Summary
One paragraph summary of the overall quality and readiness to merge.`}
          highlightLines={[9, 10, 12, 24, 28, 32]}
        />

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          逐行设计决策解释
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
              Line 9: allowed-tools: Read, Bash, Glob, Grep
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              只允许读取类操作。故意不包含 Edit/Write -- review 不应该修改代码。
              如果需要自动修复，那应该是另一个 Skill（/fix）。职责分离。
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>
              Line 10: context: fork
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              Review 需要读取大量文件内容，如果在主会话中执行，diff 输出会填满上下文窗口。
              fork 模式让 review 在隔离环境中执行，只有最终报告返回主会话。
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>
              Line 12: model: claude-sonnet-4-20250514
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              Review 不需要最强的生成能力（不写代码），但需要较好的理解能力。
              Sonnet 在 review 场景下性价比更高。如果你的主会话用的是 Opus，这可以省不少 token。
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>
              Line 24-32: 动态上下文注入
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              三个 !command 在 Skill 启动时执行：先看变更统计（整体感知），再看详细 diff（深入分析），
              最后看 commit 历史（理解意图）。$0 引用用户传入的 base 分支参数。
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>
              Review Checklist 设计
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              故意不包含"代码风格"检查 -- 那是 prettier/eslint Hook 的职责。
              Review Skill 聚焦于机器难以自动检测的问题：逻辑正确性、设计合理性、安全漏洞。
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>
              Output Format 要求
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              用 [FILE:LINE] 格式引用，让反馈可以直接定位到代码。
              分三级（Critical / Suggestions / Positive）避免把所有问题混在一起。
              "Positive Notes" 是有意加的 -- 正面反馈帮助建立好的模式。
            </p>
          </div>
        </div>

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          使用方式
        </h3>

        <CodeBlock
          language="bash"
          title="skill-usage.sh"
          code={`# 默认对比 main 分支
/review

# 对比指定分支
/review develop

# 对比指定 commit
/review HEAD~5`}
        />
      </section>

      {/* ═══════════════════════════════════════════════
          Section 5.7: Plugin 系统
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          5.7 Plugin 系统
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          当你的 Hook + Skills 组合成为一套可复用的工作流时，就可以打包成 Plugin 在团队或社区中共享。
          Plugin = Skills + Agents + Hooks + MCP 配置的打包产物。
        </p>

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Plugin 目录结构
        </h3>

        <CodeBlock
          language="bash"
          title="plugin-directory-structure.txt"
          code={`my-quality-plugin/
├── manifest.json            # Plugin 清单（必须）
├── skills/
│   ├── review.md            # Code Review Skill
│   ├── changelog.md         # Changelog 生成 Skill
│   └── refactor.md          # 重构检查 Skill
├── hooks/
│   ├── auto-format.sh       # 自动格式化 Hook
│   ├── secret-scan.sh       # 密钥扫描 Hook
│   └── block-dangerous.sh   # 危险命令拦截 Hook
├── agents/
│   └── deep-review.md       # 深度 Review Agent 配置
└── mcp/
    └── config.json          # MCP 服务器配置`}
        />

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Plugin Manifest
        </h3>

        <ConfigExample
          title="manifest.json -- Plugin 清单"
          language="json"
          code={`{
  "name": "quality-pipeline",
  "version": "1.0.0",
  "description": "Automated quality pipeline for TypeScript projects",
  "author": "your-team",
  "homepage": "https://github.com/your-team/quality-plugin",
  "skills": [
    "skills/review.md",
    "skills/changelog.md",
    "skills/refactor.md"
  ],
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "type": "command",
        "command": "bash hooks/block-dangerous.sh"
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "type": "command",
        "command": "bash hooks/auto-format.sh"
      },
      {
        "matcher": "Edit|Write",
        "type": "command",
        "command": "bash hooks/secret-scan.sh"
      }
    ]
  },
  "mcp": {
    "servers": {}
  }
}`}
          annotations={[
            { line: 2, text: 'Plugin 名字必须唯一，安装时用这个名字引用。' },
            { line: 7, text: '列出所有 Skill 文件的相对路径。' },
            { line: 12, text: 'Hook 定义格式和 settings.json 中完全一致，直接合并到项目配置中。' },
            { line: 31, text: 'Plugin 可以包含 MCP 服务器配置，扩展 Claude 的工具能力。' },
          ]}
        />

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          社区 Plugin 推荐
        </h3>

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
            推荐社区 Plugin
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {[
              {
                name: 'claudekit',
                desc: '全功能工具箱：包含格式化、lint、测试、changelog 等常用 Skills 和 Hooks。适合快速搭建质量流水线。',
                url: 'github.com/anthropics/claudekit',
              },
              {
                name: 'claude-hud',
                desc: '开发状态仪表盘：实时显示 token 消耗、Hook 执行状态、工具调用统计。帮助优化工作流性能。',
                url: 'github.com/anthropics/claude-hud',
              },
              {
                name: 'Ralph Wiggum',
                desc: '安全扫描 Plugin：集成多种安全检测（密钥泄露、依赖漏洞、代码注入），开箱即用的安全防护层。',
                url: 'github.com/anthropics/ralph-wiggum',
              },
            ].map((plugin) => (
              <div key={plugin.name} className="px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    {plugin.name}
                  </span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded"
                    style={{
                      background: 'var(--color-bg-surface)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    {plugin.url}
                  </span>
                </div>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {plugin.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 5.8: Hook 失败模式
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          5.8 Hook 失败模式
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Hook 系统强大但也容易出错。以下是最常见的三类失败模式及其诊断方法。
        </p>

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          死循环 (Dead Loop)
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          最危险的失败模式。当 Hook 的行为触发了另一个 Hook，形成无限循环。
        </p>

        <CodeBlock
          language="bash"
          title="dead-loop-example.txt"
          code={`# 典型死循环场景:
#
# PostToolUse(Edit) hook → 运行 prettier → prettier 修改文件
#   → 触发 PostToolUse(Write)?
#
# 实际上 Claude Code 的 Hook 系统有内置保护:
# Hook 执行的工具调用不会触发新的 Hook。
# 但如果你用 Agent hook, Agent 的工具调用 CAN 触发 Hook!
#
# 危险配置:
# Stop hook (Agent) → Agent 发现问题 → Agent 修改文件
#   → PostToolUse(Edit) hook 触发 → 格式化 → Agent 看到格式变了
#   → Agent 再次修改 → ...
#
# 解决方案:
# 1. Agent hook 的 allowed-tools 不要包含 Edit/Write
# 2. 设置 max-turns 限制
# 3. 用 /hooks 命令检查 Hook 链路`}
        />

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          诊断工具：/hooks 命令
        </h3>

        <CodeBlock
          language="bash"
          title="hooks-inspection.sh"
          code={`# 查看当前生效的所有 Hook
/hooks

# 输出示例:
# ┌─────────────────────────────────────────────────────┐
# │ Active Hooks                                         │
# ├───────────────┬────────────┬─────────────────────────┤
# │ Event         │ Type       │ Source                   │
# ├───────────────┼────────────┼─────────────────────────┤
# │ PreToolUse    │ command    │ .claude/settings.json    │
# │  └─ Bash      │            │ block-dangerous.sh       │
# │ PreToolUse    │ command    │ .claude/settings.json    │
# │  └─ Edit|Write│            │ protect-files.sh         │
# │ PostToolUse   │ command    │ .claude/settings.json    │
# │  └─ Edit|Write│            │ auto-format.sh           │
# │ PostToolUse   │ command    │ .claude/settings.json    │
# │  └─ Edit|Write│            │ auto-lint.sh             │
# │ Stop          │ prompt     │ .claude/settings.json    │
# └───────────────┴────────────┴─────────────────────────┘

# 查看 Hook 执行日志
# Claude Code 的 Hook 日志在 ~/.claude/logs/ 目录
ls -la ~/.claude/logs/

# 查看最近的 Hook 执行记录
# 日志包含: 触发事件、Hook 类型、exit code、执行时间、stdout/stderr
tail -f ~/.claude/logs/hooks.log`}
        />

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          性能影响
        </h3>

        <CodeBlock
          language="bash"
          title="hook-performance-impact.txt"
          code={`Hook 类型的性能开销:
═══════════════════════════════════════════

Command Hook
  延迟: 10-100ms (取决于脚本复杂度)
  Token: 0
  适合: 每次工具调用都触发

Prompt Hook
  延迟: 1-3s (等待 LLM 响应)
  Token: 200-500 per invocation
  适合: 低频事件 (Stop, SessionStart)

Agent Hook
  延迟: 10-60s (多轮对话)
  Token: 2000-10000 per invocation
  适合: 仅在关键节点触发

HTTP Hook
  延迟: 100ms-5s (取决于网络和服务端)
  Token: 0
  适合: 异步通知 (不阻塞主流程时)

建议:
- PostToolUse 只用 Command hook (每次编辑都触发, 必须快)
- Stop 可以用 Prompt hook (每次会话结束只触发一次)
- Agent hook 仅用于手动触发的 Skill 中, 不要放在自动触发的事件上`}
        />

        <QualityCallout title="性能规则">
          如果你的 PostToolUse Hook 执行超过 200ms，Claude 的编辑体验会明显变慢。
          格式化 + lint 两个 Hook 的总耗时应控制在 500ms 以内。
          如果超时，考虑合并为一个脚本，或使用异步执行模式。
        </QualityCallout>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 5.9: 设计阶段的 Review 策略
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          5.9 设计阶段的 Review 策略
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          有了自动化流水线后，人类的 review 重点应该从"检查格式和低级错误"转向"验证设计和逻辑"。
          但不同规模的变更需要不同的 review 策略。
        </p>

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          中等变更 (5-15 files): Plan-First Review
        </h3>

        <CodeBlock
          language="bash"
          title="review-strategy-medium.txt"
          code={`中等变更 Review 流程:
═══════════════════════

Step 1: 先 Review Plan (高优先级)
  ├── 检查架构决策是否合理
  ├── 检查是否遗漏了重要的边界情况
  ├── 检查技术选型是否符合项目约定
  └── 检查接口设计是否与现有代码一致

Step 2: 抽查实现 (中优先级)
  ├── 选取最复杂的 2-3 个文件深入审查
  ├── 检查错误处理是否完善
  ├── 检查测试覆盖的关键路径
  └── 其余文件信任自动化 (lint + format + type check)

Step 3: 验证集成 (基本检查)
  ├── 跑一遍完整测试
  ├── 手动测试关键用户路径
  └── 检查 CI 是否全绿

时间分配:
  Plan Review:     40%
  抽查实现:        40%
  集成验证:        20%`}
        />

        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Hook 自动化后，人类聚焦三件事
        </h3>

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            {
              title: '逻辑正确性',
              items: [
                '业务逻辑是否符合需求',
                '边界条件是否处理',
                '并发/异步是否安全',
                '数据流是否正确',
              ],
              color: 'var(--color-tier-l1)',
            },
            {
              title: '设计合理性',
              items: [
                '抽象层次是否合适',
                '接口设计是否一致',
                '是否过度/不足工程化',
                '依赖方向是否正确',
              ],
              color: 'var(--color-tier-l2)',
            },
            {
              title: '安全性',
              items: [
                '认证/授权是否完整',
                '输入验证是否充分',
                '是否有注入风险',
                '敏感数据是否保护',
              ],
              color: 'var(--color-tier-l3)',
            },
          ].map((focus) => (
            <div
              key={focus.title}
              className="rounded-lg p-4"
              style={{
                border: `1px solid var(--color-border)`,
                borderTop: `3px solid ${focus.color}`,
                background: 'var(--color-bg-secondary)',
              }}
            >
              <h4
                className="text-sm font-semibold mb-3"
                style={{ color: focus.color }}
              >
                {focus.title}
              </h4>
              <ul className="space-y-1.5">
                {focus.items.map((item, i) => (
                  <li
                    key={i}
                    className="text-sm flex items-start gap-2"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <span style={{ color: focus.color, flexShrink: 0 }}>-</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <PromptCompare
          bad={{
            label: '低效 Review',
            prompt: `逐行检查所有 15 个文件的格式
手动确认每个变量命名是否符合规范
在 Review 中修改缩进和空行问题`,
            explanation: '这些全是自动化 Hook 应该处理的。你在做机器的工作。',
          }}
          good={{
            label: '高效 Review',
            prompt: `花 40% 时间审查 Plan 的架构决策
抽查最复杂的 3 个文件的业务逻辑
验证安全相关代码的认证/授权逻辑`,
            explanation: '机器处理格式和 lint，人类聚焦逻辑、设计和安全 -- 各自做擅长的事。',
          }}
        />
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
          练习
        </h2>

        <ExerciseCard
          tier="l1"
          title="配置 PostToolUse Prettier Hook"
          description="在你的项目中配置一个 PostToolUse Hook，让 Claude 每次编辑 .ts/.tsx 文件后自动运行 prettier --write。验证：让 Claude 写一段故意格式混乱的代码，确认保存后自动被格式化。"
          checkpoints={[
            '.claude/settings.json 中正确配置了 PostToolUse Hook',
            'Hook 脚本能正确解析 stdin JSON payload',
            '只对 .ts/.tsx 文件触发格式化（其他类型跳过）',
            '格式化失败时不阻断 Claude 的操作（exit 0）',
            'permissions.allow 中白名单了 prettier 命令',
          ]}
        />

        <ExerciseCard
          tier="l2"
          title="搭建完整四层质量流水线"
          description="实现 5.3 节的完整四层流水线：Layer 1 自动格式化、Layer 2 自动 lint、Layer 3 完成度检查、Layer 4 危险命令拦截。在你的 Express API 项目上完整测试每一层。"
          checkpoints={[
            '四层 Hook 全部在 .claude/settings.json 中正确配置',
            'Layer 1: 编辑 .ts 文件后自动格式化生效',
            'Layer 2: 编辑后 ESLint 自动修复生效',
            'Layer 3: Claude 停止时 Prompt hook 正确检查完成度',
            'Layer 4: 执行 rm -rf / 等危险命令被 exit 2 拦截',
            'permissions.allow 白名单配置正确，Hook 脚本不被权限拦截',
            '/hooks 命令显示所有 Hook 正确加载',
          ]}
        />

        <ExerciseCard
          tier="l3"
          title="编写 Code Review Skill 并实战测试"
          description="基于 5.6 节实现完整的 Code Review Skill，然后在 3 个真实 PR 上测试它。记录每次 review 的质量：是否发现了真实问题？是否有大量误报？根据结果迭代优化 Skill 模板。"
          checkpoints={[
            '.claude/skills/review.md 文件正确创建并可通过 /review 触发',
            'context: fork 隔离执行，不污染主会话',
            '动态上下文 (!git diff) 正确注入',
            '在 PR #1 上测试：review 输出格式化且有行号引用',
            '在 PR #2 上测试：发现至少一个自动化工具未检测到的问题',
            '在 PR #3 上测试：根据前两次结果优化后的 Skill 更精准',
            '记录三次测试的误报率，目标控制在 30% 以下',
          ]}
        />
      </section>
    </div>
  )
}
