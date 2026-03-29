import { CodeBlock } from '../../components/content/CodeBlock'
import { QualityCallout } from '../../components/content/QualityCallout'
import { ExerciseCard } from '../../components/content/ExerciseCard'
import { ConfigExample } from '../../components/content/ConfigExample'
import { DecisionTree } from '../../components/content/DecisionTree'
import type { TreeNode } from '../../components/content/DecisionTree'
import { ReferenceSection } from '../../components/content/ReferenceSection'

/* ═══════════════════════════════════════════════
   Decision Tree: 选择程序化接入方式
   ═══════════════════════════════════════════════ */

const accessMethodTree: TreeNode = {
  id: 'root',
  question: '你的自动化场景是什么？',
  description: '根据触发方式和运行环境选择最合适的程序化接入路径。',
  children: [
    {
      label: '代码提交或 PR 触发',
      node: {
        id: 'ci',
        question: '推荐：CI/CD 集成',
        result: {
          text: '在 GitHub Actions / GitLab CI 中调用 claude -p "..." --bare。用 --allowedTools 限制权限，--output-format 控制输出格式。最成熟、最常用的自动化路径。',
          tier: 'l1',
        },
      },
    },
    {
      label: '定时执行（每天/每周）',
      node: {
        id: 'scheduled',
        question: '机器需要一直开着吗？',
        children: [
          {
            label: '有固定机器/服务器',
            node: {
              id: 'cron-local',
              question: '推荐：CronCreate（会话内 cron）',
              result: {
                text: '在 Claude Code 会话中使用 CronCreate 工具注册定时任务。依赖本地机器在线，但配置简单、无额外成本。',
                tier: 'l2',
              },
            },
          },
          {
            label: '机器可能关机/不固定',
            node: {
              id: 'cloud-scheduled',
              question: '推荐：Cloud Scheduled Tasks',
              result: {
                text: '使用 Anthropic Cloud 托管的定时任务。机器可以关机，任务在云端执行。继承 Web MCP 配置，适合团队级自动化。',
                tier: 'l3',
              },
            },
          },
        ],
      },
    },
    {
      label: '在自己的应用中嵌入 Claude Code',
      node: {
        id: 'sdk',
        question: '推荐：Agent SDK（Python / TypeScript）',
        result: {
          text: '使用 claude_agent_sdk（Python）或 @anthropic-ai/claude-agent-sdk（TypeScript）在你的应用中调用 Claude Code。支持流式输出、会话管理、错误处理。最灵活的方式。',
          tier: 'l2',
        },
      },
    },
    {
      label: '在手机/远程浏览器控制本地 Claude',
      node: {
        id: 'remote',
        question: '推荐：Remote Control（Research Preview）',
        result: {
          text: '使用 claude remote-control 启动远程控制模式。代码留在本地，只传输聊天消息（加密）。适合移动办公和远程服务器场景。注意：仍在 Research Preview 阶段。',
          tier: 'l3',
        },
      },
    },
  ],
}

/* ═══════════════════════════════════════════════
   Chapter 9: Agent SDK + 程序化接入
   ═══════════════════════════════════════════════ */

export default function Ch09() {
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
            09
          </span>
          <span
            className="text-xs uppercase tracking-widest font-medium"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Programmatic Access
          </span>
        </div>
        <h1
          className="text-3xl md:text-4xl font-bold mb-4 leading-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Agent SDK + 程序化接入：让 Claude Code 进入你的基础设施
        </h1>
        <p
          className="text-lg leading-relaxed max-w-3xl"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          到目前为止，Claude Code 需要一个人坐在终端前打字。
          但真正的自动化不需要人值守 -- PR 提交时自动审查、每天凌晨自动跑安全扫描、
          你的 SaaS 后端直接调用 Claude Code 的能力。
          这一章，我们让 Claude Code 脱离交互式终端，进入 CI/CD 流水线、定时任务、
          自定义应用，甚至你的手机。
        </p>
      </header>

      {/* ═══════════════════════════════════════════════
          Section 9.1: 为什么需要程序化接入
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          9.1 为什么需要程序化接入
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          交互式 CLI 是 Claude Code 的默认模式：你打字，它回复，你确认，它执行。
          这对日常开发非常好用，但有一个根本限制 --
          <strong style={{ color: 'var(--color-text-primary)' }}>需要一个人坐在终端前</strong>。
        </p>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          想象这些场景：
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: 'CI/CD',
              desc: 'PR 提交后自动审查代码质量和安全性，不需要人工触发',
              icon: '01',
            },
            {
              title: '定时任务',
              desc: '每天凌晨扫描依赖漏洞、生成技术债务报告',
              icon: '02',
            },
            {
              title: '远程控制',
              desc: '在手机上控制服务器上的 Claude Code，处理紧急问题',
              icon: '03',
            },
            {
              title: '自定义应用',
              desc: '在你的 SaaS 后端嵌入 Claude Code 的代码分析能力',
              icon: '04',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl p-5 space-y-2"
              style={{
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="shrink-0 font-mono text-xs px-1.5 py-0.5 rounded"
                  style={{
                    background: 'var(--color-accent-subtle)',
                    color: 'var(--color-accent)',
                  }}
                >
                  {item.icon}
                </span>
                <h3
                  className="text-base font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {item.title}
                </h3>
              </div>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          这些场景的共同点：<strong style={{ color: 'var(--color-text-primary)' }}>无人值守</strong>。
          程序化接入就是让 Claude Code 能在没有人坐在终端前的情况下运行，
          并且能被你的代码、脚本、CI 系统调用。
        </p>

        <CodeBlock
          language="bash"
          title="programmatic-vs-interactive.txt"
          code={`交互式（Interactive）                    程序化（Programmatic）
═══════════════════════                  ═══════════════════════
你坐在终端前打字                          脚本/CI/应用自动调用
需要确认每个工具使用                      预设 allowedTools，自动执行
输出给人看                                输出给程序解析（JSON/stream）
一次性对话                                可被调度、循环、嵌入
成本不敏感（你在看着）                    需要成本控制（可能 100+ 次/天）`}
        />

        <DecisionTree
          root={accessMethodTree}
          title="选择程序化接入方式"
        />

        <QualityCallout title="程序化接入的核心原则">
          <p>
            程序化 = 无人值守。这意味着两件事必须提前解决：
            <strong>权限</strong>（Claude 能做什么）和<strong>成本</strong>（一次执行花多少钱）。
            交互模式下你可以随时拒绝危险操作、随时中断。
            程序化模式下没有人看着 -- 所以必须用 --allowedTools 白名单、
            --maxTurns 限制轮数、--bare 跳过自动发现来控制行为边界。
          </p>
        </QualityCallout>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 9.2: Agent SDK
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          9.2 Agent SDK
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          程序化接入有两个层级：CLI 模式（最简单，一行命令）和 SDK 模式（最灵活，嵌入应用）。
          我们从 CLI 开始，逐步深入。
        </p>

        {/* ── CLI mode ── */}
        <h3
          className="text-lg font-semibold mt-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          CLI 模式：一行命令搞定
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <code style={{ color: 'var(--color-accent)' }}>claude -p</code> 是进入程序化模式的钥匙。
          加上 <code style={{ color: 'var(--color-accent)' }}>-p</code>（print mode）后，Claude Code 不再等待交互输入，
          而是执行完就退出 -- 完美适配脚本和 CI。
        </p>

        <CodeBlock
          language="bash"
          title="cli-basic.sh"
          code={`# 最简形式：一句话 prompt
claude -p "分析 src/ 目录下的代码架构"

# 限制工具权限（推荐用于自动化）
claude -p "检查 auth.py 的安全性" \\
  --allowedTools "Read,Grep,Glob"

# --bare：跳过 CLAUDE.md 自动发现、Git 扫描等初始化
# 推荐用于 CI/CD 和脚本，减少延迟和不确定性
claude -p "审查这个 PR 的代码质量" \\
  --allowedTools "Read,Grep,Glob" \\
  --bare

# 指定输出格式
claude -p "列出所有 TODO 注释" \\
  --output-format json \\
  --bare

# 流式 JSON 输出（适合实时处理）
claude -p "重构 utils.ts" \\
  --output-format stream-json \\
  --allowedTools "Read,Edit" \\
  --bare`}
        />

        <ConfigExample
          code={`# --output-format 三种模式对比

# text（默认）：纯文本，适合人阅读或简单脚本
claude -p "总结这个项目" --output-format text
# 输出：这是一个 React + TypeScript 项目，使用 Vite 构建...

# json：结构化 JSON，适合程序解析
claude -p "列出所有导出函数" --output-format json
# 输出：{"result": "...", "cost": {...}, "session_id": "..."}

# stream-json：逐条 JSON 事件流，适合实时 UI 更新
claude -p "重构代码" --output-format stream-json
# 输出：
# {"type": "assistant", "content": "开始分析..."}
# {"type": "tool_use", "tool": "Read", "input": {...}}
# {"type": "tool_result", "output": "..."}
# {"type": "assistant", "content": "重构完成。"}`}
          language="bash"
          title="output-format 对比"
          annotations={[
            { line: 3, text: 'text：最简单，终端直接可读' },
            { line: 7, text: 'json：包含结果、成本、session_id 等元数据' },
            { line: 11, text: 'stream-json：每个事件一行 JSON，实时推送' },
          ]}
        />

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <code style={{ color: 'var(--color-accent)' }}>--json-schema</code> 让你强制 Claude 按指定结构输出，
          确保程序能稳定解析：
        </p>

        <CodeBlock
          language="bash"
          title="json-schema-example.sh"
          code={`# 用 JSON Schema 强制输出结构
claude -p "分析 src/auth.ts 的安全性" \\
  --output-format json \\
  --json-schema '{
    "type": "object",
    "properties": {
      "issues": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "severity": {"type": "string", "enum": ["critical", "warning", "info"]},
            "line": {"type": "number"},
            "description": {"type": "string"},
            "fix": {"type": "string"}
          },
          "required": ["severity", "description"]
        }
      },
      "overall_score": {"type": "number", "minimum": 0, "maximum": 10}
    },
    "required": ["issues", "overall_score"]
  }' \\
  --allowedTools "Read,Grep" \\
  --bare`}
        />

        {/* ── Session management ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          会话管理：--continue 和 --resume
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          程序化模式下，每次 <code style={{ color: 'var(--color-accent)' }}>claude -p</code> 默认创建新会话。
          但很多场景需要在同一个上下文中连续工作：
        </p>

        <CodeBlock
          language="bash"
          title="session-management.sh"
          code={`# --continue：继续上一个会话（不指定 ID，自动找最近的）
claude -p "现在修复你刚才发现的第一个问题" --continue

# --resume：通过 session ID 恢复指定会话
# 先获取 session ID（从 json 输出中）
RESULT=$(claude -p "分析 auth.py 的安全性" --output-format json --bare)
SESSION_ID=$(echo $RESULT | jq -r '.session_id')

# 稍后用同一个会话继续
claude -p "修复你发现的 SQL 注入问题" --resume "$SESSION_ID"

# 实际应用：分阶段 CI 流水线
# Step 1: 分析
ANALYSIS=$(claude -p "分析这个 PR 的所有问题" \\
  --output-format json --bare \\
  --allowedTools "Read,Grep,Glob")

SESSION=$(echo $ANALYSIS | jq -r '.session_id')

# Step 2: 基于分析结果修复（同一个上下文）
claude -p "修复你发现的所有 warning 级别以上的问题" \\
  --resume "$SESSION" \\
  --allowedTools "Read,Edit,Grep,Glob" \\
  --bare`}
        />

        {/* ── Python SDK ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Python SDK
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          当你需要在 Python 应用中嵌入 Claude Code 的能力时，使用 Agent SDK。
          它提供了流式输出、会话管理、错误处理等完整功能。
        </p>

        <CodeBlock
          language="python"
          title="python-sdk-basic.py"
          code={`from claude_agent_sdk import query, ClaudeAgentOptions

# 基础用法：流式输出
async for message in query(
    prompt="Find and fix the bug in auth.py",
    options=ClaudeAgentOptions(allowed_tools=["Read", "Edit", "Bash"]),
):
    print(message)


# 完整示例：带错误处理和会话管理
import asyncio
from claude_agent_sdk import (
    query,
    ClaudeAgentOptions,
    ClaudeAgentError,
    RateLimitError,
)

async def review_code(file_path: str) -> dict:
    """用 Claude Code 审查代码，返回结构化结果。"""
    results = []
    session_id = None

    try:
        async for message in query(
            prompt=f"审查 {file_path} 的代码质量和安全性，输出 JSON 格式的问题列表",
            options=ClaudeAgentOptions(
                allowed_tools=["Read", "Grep", "Glob"],
                output_format="json",
                bare=True,  # 跳过自动发现，加快启动
            ),
        ):
            results.append(message)
            if hasattr(message, 'session_id'):
                session_id = message.session_id

    except RateLimitError as e:
        # 速率限制：等待后重试
        await asyncio.sleep(e.retry_after)
        return await review_code(file_path)  # 递归重试

    except ClaudeAgentError as e:
        return {"error": str(e), "file": file_path}

    return {
        "file": file_path,
        "results": results,
        "session_id": session_id,
    }


# 批量审查多个文件
async def batch_review(files: list[str]):
    """并发审查多个文件。"""
    tasks = [review_code(f) for f in files]
    return await asyncio.gather(*tasks)`}
        />

        {/* ── TypeScript SDK ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          TypeScript SDK
        </h3>

        <CodeBlock
          language="typescript"
          title="typescript-sdk-basic.ts"
          code={`import { query, type ClaudeAgentMessage } from "@anthropic-ai/claude-agent-sdk";

// 基础用法：流式输出
for await (const message of query({
  prompt: "Find and fix the bug in auth.py",
  options: { allowedTools: ["Read", "Edit", "Bash"] },
})) {
  console.log(message);
}


// 完整示例：Express 中间件集成
import express from "express";
import { query, ClaudeAgentError } from "@anthropic-ai/claude-agent-sdk";

const app = express();

app.post("/api/review", async (req, res) => {
  const { filePath } = req.body;

  try {
    const messages: ClaudeAgentMessage[] = [];

    for await (const msg of query({
      prompt: \`审查 \${filePath} 的代码质量，输出 JSON 格式的问题列表\`,
      options: {
        allowedTools: ["Read", "Grep", "Glob"],
        outputFormat: "json",
        bare: true,
      },
    })) {
      messages.push(msg);
    }

    res.json({ success: true, messages });
  } catch (err) {
    if (err instanceof ClaudeAgentError) {
      res.status(500).json({ error: err.message, code: err.code });
    } else {
      res.status(500).json({ error: "Unknown error" });
    }
  }
});`}
        />

        {/* ── Error handling ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          错误处理与重试策略
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          程序化调用最容易遇到的三类错误：速率限制、上下文溢出、工具执行失败。
          每种需要不同的重试策略：
        </p>

        <CodeBlock
          language="python"
          title="error-handling.py"
          code={`import asyncio
import random
from claude_agent_sdk import query, ClaudeAgentOptions

async def resilient_query(prompt: str, max_retries: int = 3):
    """带指数退避重试的弹性查询。"""
    for attempt in range(max_retries):
        try:
            results = []
            async for msg in query(
                prompt=prompt,
                options=ClaudeAgentOptions(
                    allowed_tools=["Read", "Grep"],
                    bare=True,
                ),
            ):
                results.append(msg)
            return results

        except RateLimitError as e:
            # 速率限制：使用服务端建议的等待时间
            wait = e.retry_after or (2 ** attempt + random.uniform(0, 1))
            print(f"速率限制，等待 {wait:.1f}s 后重试 ({attempt + 1}/{max_retries})")
            await asyncio.sleep(wait)

        except ContextOverflowError:
            # 上下文溢出：无法重试，需要缩小 prompt
            raise ValueError(f"Prompt 太长或产生了过多工具调用，请缩小范围")

        except ToolExecutionError as e:
            # 工具执行失败：记录并继续（不一定需要重试）
            print(f"工具执行失败: {e.tool_name} - {e.message}")
            if attempt == max_retries - 1:
                raise

    raise RuntimeError(f"重试 {max_retries} 次后仍然失败")`}
        />

        <QualityCallout title="--bare 是程序化模式的必选项">
          <p>
            没有 --bare 时，Claude Code 会在启动时扫描 Git 仓库、读取 CLAUDE.md、
            收集环境信息 -- 这在交互模式下很有用，但在 CI/CD 中是不确定性的来源。
            --bare 跳过所有自动发现，让行为完全可预测。
            如果你确实需要 CLAUDE.md 的指令，用 --append-system-prompt 显式注入。
          </p>
        </QualityCallout>

        <ExerciseCard
          tier="l1"
          title="用 CLI 模式自动化一个任务"
          description="选择你项目中的一个重复性任务（如检查 TODO 注释、统计代码行数、检查未使用的导入），用 claude -p 写一个 shell 脚本来自动化它。要求：1) 使用 --bare 和 --allowedTools；2) 使用 --output-format json 获取结构化输出；3) 用 jq 解析结果并输出关键信息。"
          checkpoints={[
            '脚本使用 claude -p 而非交互模式',
            '包含 --bare 标志',
            '--allowedTools 只授予必要的权限（如只读任务不给 Edit/Bash）',
            '用 --output-format json 输出并用 jq 解析',
            '脚本可以无人值守运行（无交互提示）',
          ]}
        />
      </section>

      {/* ═══════════════════════════════════════════════
          Section 9.3: CI/CD 集成
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          9.3 CI/CD 集成
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          CI/CD 是程序化接入最成熟、最高 ROI 的场景。
          每个 PR 自动获得 AI 代码审查 -- 不遗漏、不拖延、成本可控。
        </p>

        {/* ── GitHub Actions ── */}
        <h3
          className="text-lg font-semibold mt-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          GitHub Actions：完整 PR 审查工作流
        </h3>

        <ConfigExample
          code={`name: AI Code Review
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # 需要完整历史来生成 diff

      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code

      - name: Run Claude Review
        env:
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          # 获取 PR diff 作为上下文
          git diff origin/\${{ github.base_ref }}...HEAD > /tmp/pr-diff.txt

          # 运行审查
          npx claude -p "You are a senior code reviewer. Review the PR diff at /tmp/pr-diff.txt for:
          1. Security issues (injection, XSS, hardcoded secrets)
          2. Performance problems (N+1 queries, memory leaks)
          3. Logic errors and edge cases
          4. Code style violations

          Be specific: cite file names and line numbers.
          Only flag real issues, not style preferences." \\
            --allowedTools "Read,Grep,Glob" \\
            --output-format text \\
            --bare > /tmp/review.txt

      - name: Post Review Comment
        if: always()
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const review = fs.readFileSync('/tmp/review.txt', 'utf8');
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: '## AI Code Review\\n\\n' + review
            });`}
          language="yaml"
          title=".github/workflows/ai-review.yml"
          annotations={[
            { line: 3, text: 'PR 创建和更新时触发' },
            { line: 11, text: '需要写 PR 评论的权限' },
            { line: 16, text: 'fetch-depth: 0 才能获取完整 diff' },
            { line: 23, text: 'API Key 存在 GitHub Secrets 中，不在代码里' },
            { line: 28, text: '生成 diff 文件作为 Claude 的输入' },
            { line: 36, text: '--bare 确保行为可预测' },
          ]}
        />

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          更进一步：让 Claude 不只是审查，还能自动修复简单问题并提交。
          这需要给 Edit 工具权限，并在 CI 中自动提交：
        </p>

        <CodeBlock
          language="yaml"
          title="auto-fix-workflow.yml (关键片段)"
          code={`      - name: Auto-fix Simple Issues
        env:
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          npx claude -p "Fix all ESLint auto-fixable issues and unused imports in the changed files.
          Only fix issues that are clearly wrong - do not refactor or change logic." \\
            --allowedTools "Read,Edit,Grep,Glob,Bash(npm run lint)" \\
            --bare

      - name: Commit Fixes (if any)
        run: |
          if [ -n "$(git status --porcelain)" ]; then
            git config user.name "claude-bot"
            git config user.email "claude-bot@ci.local"
            git add -A
            git commit -m "fix: auto-fix lint issues [claude-bot]"
            git push
          fi`}
        />

        {/* ── GitLab CI ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          GitLab CI/CD
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          同样的思路适用于 GitLab CI。核心差异在于语法和变量名：
        </p>

        <CodeBlock
          language="yaml"
          title=".gitlab-ci.yml"
          code={`ai-review:
  stage: test
  image: node:20
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
  variables:
    ANTHROPIC_API_KEY: $ANTHROPIC_API_KEY  # 在 GitLab CI/CD Variables 中配置
  script:
    - npm install -g @anthropic-ai/claude-code
    - git diff origin/$CI_MERGE_REQUEST_TARGET_BRANCH_NAME...HEAD > /tmp/diff.txt
    - |
      npx claude -p "Review the code diff at /tmp/diff.txt for security and quality issues." \\
        --allowedTools "Read,Grep,Glob" \\
        --output-format text \\
        --bare > /tmp/review.txt
    - cat /tmp/review.txt
  artifacts:
    paths:
      - /tmp/review.txt
    expire_in: 7 days`}
        />

        {/* ── Security ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          安全与成本控制
        </h3>

        <div
          className="rounded-xl p-6 space-y-4"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <h4
            className="text-base font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            CI/CD 安全清单
          </h4>
          <ul className="space-y-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {[
              { rule: 'API Key 管理', detail: '使用 CI 平台的 Secrets 管理（GitHub Secrets / GitLab Variables），绝不硬编码在 YAML 中' },
              { rule: '最小权限', detail: '只给 Claude 完成任务所需的工具。审查只需要 Read,Grep,Glob；修复才需要 Edit' },
              { rule: '--bare 必选', detail: '跳过自动发现，防止 Claude 读取不该看到的配置文件或仓库信息' },
              { rule: '限制 Bash 范围', detail: '如果必须给 Bash 权限，用 Bash(specific_command) 语法限制可执行的命令' },
              { rule: '成本预算', detail: '为每次 CI 运行设置 token 上限。一次 PR 审查通常消耗 5K-20K token（约 $0.02-0.10）' },
              { rule: '不要给 secrets 访问', detail: 'Claude 不需要访问其他 CI secrets（数据库密码等）。环境变量只传 ANTHROPIC_API_KEY' },
            ].map((item) => (
              <li key={item.rule} className="flex items-start gap-3">
                <span
                  className="shrink-0 mt-0.5 font-mono text-xs px-1.5 py-0.5 rounded"
                  style={{
                    background: 'var(--color-accent-subtle)',
                    color: 'var(--color-accent)',
                  }}
                >
                  !
                </span>
                <span>
                  <strong style={{ color: 'var(--color-text-primary)' }}>{item.rule}</strong>
                  {' -- '}
                  {item.detail}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <CodeBlock
          language="bash"
          title="cost-estimation.sh"
          code={`# 粗略成本估算（基于 Claude Sonnet 定价）
#
# PR 审查（只读）：
#   输入 ~3K tokens（diff + prompt）
#   输出 ~1K tokens（审查意见）
#   成本 ≈ $0.015/次
#   每月 200 个 PR → $3/月
#
# 代码修复（读写）：
#   输入 ~5K tokens（diff + prompt + 文件内容）
#   输出 ~3K tokens（修复代码 + 说明）
#   成本 ≈ $0.04/次
#   每月 100 次修复 → $4/月
#
# 安全扫描（深度）：
#   输入 ~10K tokens（多文件 + 深度分析 prompt）
#   输出 ~2K tokens（安全报告）
#   成本 ≈ $0.05/次
#   每天 1 次 → $1.5/月

# 提示：用 --output-format json 获取每次调用的实际 token 消耗
claude -p "审查代码" --output-format json --bare | jq '.usage'`}
        />

        <ExerciseCard
          tier="l2"
          title="为你的项目配置 CI/CD 审查"
          description="在你的 GitHub 仓库中配置 AI Code Review 工作流：1) 创建 .github/workflows/ai-review.yml；2) 在 GitHub Secrets 中添加 ANTHROPIC_API_KEY；3) 提交一个带故意问题的 PR（如 SQL 注入、未使用的导入），观察审查结果；4) 调整 prompt 直到审查质量令你满意。"
          checkpoints={[
            '工作流文件使用 --bare 和 --allowedTools 限制权限',
            '审查结果作为 PR 评论自动发布',
            'API Key 存储在 Secrets 中而非代码中',
            '能检测到你故意引入的安全问题',
            '误报率可接受（不超过 20%）',
          ]}
        />
      </section>

      {/* ═══════════════════════════════════════════════
          Section 9.4: 定时与循环
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          9.4 定时与循环
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          除了"事件触发"（PR 提交），很多自动化需要"时间触发" -- 每 5 分钟检查部署状态、
          每天生成技术债务报告。Claude Code 提供了三种时间触发机制，
          适用于不同的可靠性和持久性需求。
        </p>

        {/* ── /loop ── */}
        <h3
          className="text-lg font-semibold mt-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          /loop：会话内循环
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <code style={{ color: 'var(--color-accent)' }}>/loop</code> 在当前 Claude Code 会话内
          按指定间隔重复执行命令。最简单的定时机制，但会话关闭就停止。
        </p>

        <CodeBlock
          language="bash"
          title="loop-examples.sh"
          code={`# 基本语法：/loop <间隔> <命令或描述>
# 在 Claude Code 交互式会话中使用：

claude> /loop 5m check deploy status on staging
# Claude 每 5 分钟检查一次 staging 环境的部署状态

claude> /loop 10m run npm test and report any new failures
# 每 10 分钟跑一次测试，报告新增的失败

claude> /loop 30m check if there are any new error logs in production
# 每 30 分钟检查生产环境日志

# 默认间隔：10 分钟
claude> /loop check for unreviewed PRs
# 不指定间隔时默认每 10 分钟执行

# 适用场景：
# - 部署后观察期（"盯着"一个刚部署的服务）
# - 长时间运行的测试/构建的进度监控
# - 等待外部依赖就绪（"API 可用了告诉我"）`}
        />

        {/* ── CronCreate/CronDelete/CronList ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          CronCreate / CronDelete / CronList：会话内 Cron
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          比 /loop 更强大：使用标准 cron 表达式，支持复杂调度。
          但仍然依赖本地机器在线 -- Claude Code 进程关闭后任务也停止。
        </p>

        <CodeBlock
          language="bash"
          title="cron-examples.sh"
          code={`# CronCreate：注册定时任务
# 在 Claude Code 会话中，Claude 可以调用 CronCreate 工具：

# 每天早上 9 点检查依赖更新
CronCreate(
  schedule: "0 9 * * *",
  command: "检查 package.json 中是否有过时的依赖，生成更新建议",
  name: "daily-dep-check"
)

# 每周一下午 2 点生成技术债务报告
CronCreate(
  schedule: "0 14 * * 1",
  command: "扫描代码库中的 TODO/FIXME/HACK 注释，生成技术债务报告保存到 reports/ 目录",
  name: "weekly-tech-debt"
)

# CronList：查看当前所有定时任务
CronList()
# 输出：
# - daily-dep-check: "0 9 * * *" (每天 09:00)
# - weekly-tech-debt: "0 14 * * 1" (每周一 14:00)

# CronDelete：移除定时任务
CronDelete(name: "daily-dep-check")`}
        />

        {/* ── Cloud Scheduled Tasks ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Cloud Scheduled Tasks：云端定时任务
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          终极方案：任务在 Anthropic 云端执行，你的机器可以关机。
          适合团队级别的自动化，继承 Web 端配置的 MCP 服务器。
        </p>

        <CodeBlock
          language="bash"
          title="cloud-scheduled.sh"
          code={`# Cloud Scheduled Tasks 通过 claude schedule 命令管理

# 创建云端定时任务
claude schedule create \\
  --name "nightly-security-scan" \\
  --cron "0 2 * * *" \\
  --prompt "扫描整个代码库的安全问题，包括依赖漏洞、硬编码密钥、SQL 注入风险。生成报告。" \\
  --allowed-tools "Read,Grep,Glob" \\
  --repo "github.com/myorg/myrepo"

# 列出所有云端任务
claude schedule list
# 输出：
# nightly-security-scan  0 2 * * *   active   last: 2025-03-28 02:00
# weekly-dep-update      0 10 * * 1  active   last: 2025-03-24 10:00

# 查看任务执行历史
claude schedule history nightly-security-scan

# 手动触发一次（不等到定时）
claude schedule run nightly-security-scan

# 暂停/恢复
claude schedule pause nightly-security-scan
claude schedule resume nightly-security-scan

# 删除
claude schedule delete nightly-security-scan`}
        />

        <ConfigExample
          code={`# Cloud Scheduled Tasks 的优势：

1. 机器无关
   - 任务在 Anthropic 云端执行
   - 你的笔记本可以关机、断网
   - 适合"每天凌晨 2 点"这种无人在线的场景

2. 继承 Web MCP 配置
   - 如果你在 claude.ai 配置了 GitHub MCP、Jira MCP 等
   - Cloud Scheduled Tasks 自动继承这些配置
   - 不需要在每个任务中重新配置

3. 团队共享
   - 一个人创建的定时任务，团队成员都能看到
   - 执行结果通过 Web Dashboard 查看
   - 适合团队级别的自动化（每日站会摘要、周报生成等）

4. 限制
   - 无法访问本地文件系统（代码需要在 Git 仓库中）
   - MCP 服务器限于 Web 端配置的服务
   - 成本按正常 API 调用计费`}
          language="bash"
          title="Cloud Scheduled Tasks 特性概览"
        />

        {/* ── Decision: which one ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          选择哪种定时机制？
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>特性</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>/loop</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>CronCreate</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>Cloud Scheduled</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--color-text-secondary)' }}>
              {[
                ['持久性', '会话关闭即停', '进程关闭即停', '云端持久运行'],
                ['调度语法', '简单间隔（5m, 1h）', 'Cron 表达式', 'Cron 表达式'],
                ['机器依赖', '需要终端开着', '需要机器在线', '无需机器在线'],
                ['本地文件访问', '完整访问', '完整访问', '仅 Git 仓库'],
                ['MCP 服务器', '本地配置', '本地配置', 'Web 端配置'],
                ['适合场景', '临时监控（1-2小时）', '开发期间定期任务', '长期自动化'],
                ['配置复杂度', '最低', '中等', '较高'],
              ].map(([feature, loop, cron, cloud]) => (
                <tr key={feature} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td className="py-2 px-4 font-medium" style={{ color: 'var(--color-text-primary)' }}>{feature}</td>
                  <td className="py-2 px-4">{loop}</td>
                  <td className="py-2 px-4">{cron}</td>
                  <td className="py-2 px-4">{cloud}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <QualityCallout title="从简单开始，按需升级">
          <p>
            大多数人只需要 /loop。部署后想盯 30 分钟？用 /loop 5m check deploy status。
            需要每天跑？升级到 CronCreate。需要跨机器、跨团队、无人值守？
            再升级到 Cloud Scheduled Tasks。不要一开始就上最复杂的方案。
          </p>
        </QualityCallout>
      </section>

      {/* ═══════════════════════════════════════════════
          Divider: 实验性功能
          ═══════════════════════════════════════════════ */}
      <hr className="my-8" style={{ borderColor: 'var(--color-border)' }} />
      <div className="px-4 py-3 rounded-lg text-xs" style={{ background: 'var(--color-accent-subtle)', border: '1px solid var(--color-border-accent)' }}>
        <span style={{ color: 'var(--color-accent)' }}>Research Preview</span>
        <span className="ml-2" style={{ color: 'var(--color-text-secondary)' }}>以下内容基于远程控制 Research Preview API，功能可能随版本变化。</span>
      </div>

      {/* ═══════════════════════════════════════════════
          Section 9.5: 远程控制
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          9.5 远程控制
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          想象你正在吃晚饭，收到报警：生产环境出了 bug。你不需要回家开电脑 --
          拿出手机，连接到办公室机器上正在运行的 Claude Code，直接开始排查。
          代码留在本地，只有聊天消息通过加密通道传输。
        </p>

        <CodeBlock
          language="bash"
          title="remote-control-setup.sh"
          code={`# 在你的开发机上启动远程控制模式
claude remote-control

# 输出：
# Remote control enabled.
# Access URL: https://claude.ai/remote/abc-123-def
# QR Code: [二维码]
#
# Your code stays local. Only chat messages are transmitted (encrypted).
# Press Ctrl+C to stop remote control.

# 在手机/平板浏览器上打开上面的 URL
# 或扫描二维码
# 你会看到和终端一样的 Claude Code 界面`}
        />

        <div
          className="rounded-xl p-6 space-y-4"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <h3
            className="text-lg font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            远程控制的安全模型
          </h3>
          <ul className="space-y-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <li className="flex items-start gap-3">
              <span className="shrink-0 mt-0.5 font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}>1</span>
              <span><strong style={{ color: 'var(--color-text-primary)' }}>代码不离开本地</strong> -- 所有文件读写、命令执行都在你的机器上完成。远程端只能看到 Claude 的对话输出。</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="shrink-0 mt-0.5 font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}>2</span>
              <span><strong style={{ color: 'var(--color-text-primary)' }}>端到端加密</strong> -- 聊天消息在传输过程中加密，Anthropic 服务器只做消息中继。</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="shrink-0 mt-0.5 font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}>3</span>
              <span><strong style={{ color: 'var(--color-text-primary)' }}>一次性链接</strong> -- 每次启动 remote-control 生成新的唯一 URL。链接不可复用，也不可被暴力猜测。</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="shrink-0 mt-0.5 font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}>4</span>
              <span><strong style={{ color: 'var(--color-text-primary)' }}>权限继承</strong> -- 远程控制继承本地 Claude Code 的所有权限设置（.claude/settings.json）。你在远程端不能获得比本地更多的权限。</span>
            </li>
          </ul>
        </div>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          典型使用场景：
        </p>

        <CodeBlock
          language="bash"
          title="remote-use-cases.txt"
          code={`场景 1：移动办公
  你在外出时收到报警。手机打开远程控制链接，
  让 Claude 帮你查日志、定位问题、甚至提交热修复。
  代码从未离开办公室的机器。

场景 2：远程服务器
  你在云服务器上运行 Claude Code（通过 SSH）。
  启动 remote-control 后，在自己的浏览器中用更好的 UI 操作。
  比 SSH 终端的体验好得多。

场景 3：结对编程
  启动 remote-control，把链接发给同事。
  你们可以同时看到 Claude 的操作，讨论策略。
  （注意：目前只支持单个控制端）

场景 4：演示/教学
  在投影仪上打开远程控制页面，
  用手机控制 Claude Code 做现场演示。
  观众看到的是干净的 Web UI 而非终端。`}
        />

        <QualityCallout title="远程控制 != 远程桌面">
          <p>
            远程控制不是 TeamViewer 或 RDP。你无法看到本地机器的屏幕、操作其他应用。
            你只能与 Claude Code 对话 -- 通过 Claude 间接操作本地文件系统。
            这是一个有意的限制：最小化远程访问的攻击面。
          </p>
        </QualityCallout>
      </section>

      {/* ═══════════════════════════════════════════════
          Section: Provider 支持
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          9.6 多 Provider 支持
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Claude Code 的程序化接入不限于 Anthropic 直连 API。
          企业用户可以通过 Amazon Bedrock、Google Vertex AI 或 Azure AI Foundry 接入，
          享受各云平台的合规、计费和私有网络能力。
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>Provider</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>环境变量</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>适合场景</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--color-text-secondary)' }}>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4 font-mono text-xs" style={{ color: 'var(--color-accent)' }}>Anthropic API</td>
                <td className="py-3 px-4 font-mono text-xs">ANTHROPIC_API_KEY</td>
                <td className="py-3 px-4">个人开发者、小团队、最快上手</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4 font-mono text-xs" style={{ color: 'var(--color-accent)' }}>Amazon Bedrock</td>
                <td className="py-3 px-4 font-mono text-xs">CLAUDE_CODE_USE_BEDROCK=1</td>
                <td className="py-3 px-4">AWS 重度用户、需要 VPC 内调用</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4 font-mono text-xs" style={{ color: 'var(--color-accent)' }}>Google Vertex AI</td>
                <td className="py-3 px-4 font-mono text-xs">CLAUDE_CODE_USE_VERTEX=1</td>
                <td className="py-3 px-4">GCP 用户、需要与 BigQuery/GKE 集成</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-3 px-4 font-mono text-xs" style={{ color: 'var(--color-accent)' }}>Azure AI Foundry</td>
                <td className="py-3 px-4 font-mono text-xs">CLAUDE_CODE_USE_FOUNDRY=1</td>
                <td className="py-3 px-4">Azure 生态、企业合规需求</td>
              </tr>
            </tbody>
          </table>
        </div>

        <CodeBlock
          language="bash"
          title="provider-config.sh"
          code={`# Anthropic API（默认）
export ANTHROPIC_API_KEY="sk-ant-..."
claude -p "分析代码" --bare

# Amazon Bedrock
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION="us-west-2"
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
claude -p "分析代码" --bare

# Google Vertex AI
export CLAUDE_CODE_USE_VERTEX=1
export CLOUD_ML_REGION="us-east5"
export ANTHROPIC_VERTEX_PROJECT_ID="my-project"
claude -p "分析代码" --bare

# Azure AI Foundry
export CLAUDE_CODE_USE_FOUNDRY=1
export AZURE_OPENAI_ENDPOINT="https://my-resource.openai.azure.com"
export AZURE_OPENAI_API_KEY="..."
claude -p "分析代码" --bare

# 在 CI/CD 中切换 Provider：
# GitHub Actions 中使用 Bedrock
# .github/workflows/review.yml:
#   env:
#     CLAUDE_CODE_USE_BEDROCK: "1"
#     AWS_REGION: "us-west-2"
#     AWS_ACCESS_KEY_ID: \${{ secrets.AWS_ACCESS_KEY_ID }}
#     AWS_SECRET_ACCESS_KEY: \${{ secrets.AWS_SECRET_ACCESS_KEY }}`}
        />

        <ExerciseCard
          tier="l3"
          title="构建端到端自动化流水线"
          description="把本章学到的技术组合成一个完整的自动化方案：1) GitHub Actions 在 PR 时自动审查代码（9.3）；2) 用 Cloud Scheduled Tasks 每天凌晨扫描安全问题（9.4）；3) 用 Python SDK 构建一个简单的 Web Dashboard 展示审查结果（9.2）。不需要全部实现 -- 选择其中两个组合即可。"
          checkpoints={[
            'CI/CD 审查能自动触发并发布评论',
            '定时任务能在无人值守的情况下执行',
            '至少有一个场景使用了 SDK（Python 或 TypeScript）',
            '所有场景都遵循安全最佳实践（最小权限、--bare、Secrets 管理）',
            '能说清楚每个组件的成本预估',
          ]}
        />
      </section>

      {/* ═══════════════════════════════════════════════
          Reference Section
          ═══════════════════════════════════════════════ */}
      <ReferenceSection version="Claude Code 2025">
        <div className="space-y-8">

          {/* ── CLI params ── */}
          <div>
            <h3
              className="text-base font-semibold mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              SDK CLI 参数速查
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
                      borderBottom: '1px solid var(--color-border)',
                      background: 'var(--color-bg-tertiary)',
                    }}
                  >
                    <th className="text-left py-2 px-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>参数</th>
                    <th className="text-left py-2 px-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>说明</th>
                    <th className="text-left py-2 px-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>默认值</th>
                  </tr>
                </thead>
                <tbody style={{ color: 'var(--color-text-secondary)' }}>
                  {[
                    ['-p, --print', '进入程序化模式（非交互式），执行完退出', '(无)'],
                    ['--bare', '跳过自动发现（CLAUDE.md、Git 等），行为可预测', 'false'],
                    ['--allowedTools', '工具白名单，逗号分隔', '(所有工具)'],
                    ['--disallowedTools', '工具黑名单，逗号分隔', '(无)'],
                    ['--output-format', 'text / json / stream-json', 'text'],
                    ['--json-schema', '强制输出符合指定 JSON Schema', '(无)'],
                    ['--continue', '继续最近的会话', 'false'],
                    ['--resume <id>', '恢复指定 session ID 的会话', '(无)'],
                    ['--max-turns', '最大对话轮数', '(无限制)'],
                    ['--append-system-prompt', '追加系统提示（配合 --bare 使用）', '(无)'],
                    ['--model', '指定模型（如 claude-sonnet-4-20250514）', '(默认模型)'],
                    ['--permission-mode', 'auto / plan / bypassPermissions', '(继承)'],
                  ].map(([param, desc, def]) => (
                    <tr key={param} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td className="py-2 px-3 font-mono whitespace-nowrap" style={{ color: 'var(--color-accent)' }}>{param}</td>
                      <td className="py-2 px-3">{desc}</td>
                      <td className="py-2 px-3 font-mono">{def}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Python SDK API ── */}
          <div>
            <h3
              className="text-base font-semibold mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Python SDK API 参考
            </h3>
            <CodeBlock
              language="python"
              title="python-api-reference.py"
              code={`from claude_agent_sdk import (
    query,                    # 主入口：异步生成器，流式返回消息
    ClaudeAgentOptions,       # 配置选项
    ClaudeAgentError,         # 基础异常
    RateLimitError,           # 速率限制（含 retry_after 属性）
    ContextOverflowError,     # 上下文超限
    ToolExecutionError,       # 工具执行失败
)

# ClaudeAgentOptions 字段：
options = ClaudeAgentOptions(
    allowed_tools=["Read", "Edit"],   # 工具白名单
    disallowed_tools=["Bash"],        # 工具黑名单
    output_format="json",             # text / json / stream-json
    json_schema={...},                # 强制输出结构
    bare=True,                        # 跳过自动发现
    max_turns=20,                     # 最大轮数
    model="claude-sonnet-4-20250514", # 指定模型
    resume_session_id="abc-123",      # 恢复会话
    append_system_prompt="...",       # 追加系统提示
    permission_mode="auto",           # 权限模式
)

# 安装：pip install claude-agent-sdk`}
            />
          </div>

          {/* ── TypeScript SDK API ── */}
          <div>
            <h3
              className="text-base font-semibold mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              TypeScript SDK API 参考
            </h3>
            <CodeBlock
              language="typescript"
              title="typescript-api-reference.ts"
              code={`import {
  query,                    // 主入口：AsyncGenerator，流式返回消息
  type ClaudeAgentOptions,  // 配置选项类型
  type ClaudeAgentMessage,  // 消息类型
  ClaudeAgentError,         // 基础异常
  RateLimitError,           // 速率限制
} from "@anthropic-ai/claude-agent-sdk";

// ClaudeAgentOptions 类型：
interface ClaudeAgentOptions {
  allowedTools?: string[];           // 工具白名单
  disallowedTools?: string[];        // 工具黑名单
  outputFormat?: "text" | "json" | "stream-json";
  jsonSchema?: Record<string, unknown>;
  bare?: boolean;                    // 跳过自动发现
  maxTurns?: number;                 // 最大轮数
  model?: string;                    // 指定模型
  resumeSessionId?: string;          // 恢复会话
  appendSystemPrompt?: string;       // 追加系统提示
  permissionMode?: "auto" | "plan" | "bypassPermissions";
}

// 安装：npm install @anthropic-ai/claude-agent-sdk`}
            />
          </div>

          {/* ── Provider env vars ── */}
          <div>
            <h3
              className="text-base font-semibold mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Provider 环境变量速查
            </h3>
            <CodeBlock
              language="bash"
              title="provider-env-vars.sh"
              code={`# ── Anthropic API (默认) ──
ANTHROPIC_API_KEY="sk-ant-..."

# ── Amazon Bedrock ──
CLAUDE_CODE_USE_BEDROCK=1
AWS_REGION="us-west-2"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
# 可选：AWS_PROFILE, AWS_SESSION_TOKEN

# ── Google Vertex AI ──
CLAUDE_CODE_USE_VERTEX=1
CLOUD_ML_REGION="us-east5"
ANTHROPIC_VERTEX_PROJECT_ID="my-gcp-project"
# 认证：gcloud auth application-default login

# ── Azure AI Foundry ──
CLAUDE_CODE_USE_FOUNDRY=1
AZURE_OPENAI_ENDPOINT="https://my-resource.openai.azure.com"
AZURE_OPENAI_API_KEY="..."`}
            />
          </div>

          {/* ── GitHub Actions template ── */}
          <div>
            <h3
              className="text-base font-semibold mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              GitHub Actions YAML 模板（可直接复制）
            </h3>
            <CodeBlock
              language="yaml"
              title=".github/workflows/claude-review.yml"
              code={`name: Claude Code Review
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Run Claude Review
        env:
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          git diff origin/\${{ github.base_ref }}...HEAD > /tmp/diff.txt
          npx -y @anthropic-ai/claude-code -p \\
            "Review the diff at /tmp/diff.txt. Flag security issues, bugs, and performance problems. Be specific with file:line references." \\
            --allowedTools "Read,Grep,Glob" \\
            --output-format text \\
            --bare > /tmp/review.txt

      - name: Post Comment
        if: always()
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const review = fs.readFileSync('/tmp/review.txt', 'utf8');
            if (review.trim()) {
              await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
                body: '## Claude Code Review\\n\\n' + review
              });
            }`}
            />
          </div>

          {/* ── Cloud Scheduled Tasks config ── */}
          <div>
            <h3
              className="text-base font-semibold mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Cloud Scheduled Tasks 配置
            </h3>
            <CodeBlock
              language="bash"
              title="cloud-schedule-reference.sh"
              code={`# 创建
claude schedule create \\
  --name "<task-name>" \\
  --cron "<cron-expression>" \\
  --prompt "<任务描述>" \\
  --allowed-tools "<tools>" \\
  --repo "<repo-url>"

# 管理命令
claude schedule list                      # 列出所有任务
claude schedule history <name>            # 查看执行历史
claude schedule run <name>                # 手动触发
claude schedule pause <name>              # 暂停
claude schedule resume <name>             # 恢复
claude schedule delete <name>             # 删除
claude schedule update <name> --cron "..."  # 更新调度

# Cron 表达式速查
# ┌───────── 分 (0-59)
# │ ┌─────── 时 (0-23)
# │ │ ┌───── 日 (1-31)
# │ │ │ ┌─── 月 (1-12)
# │ │ │ │ ┌─ 周几 (0-6, 0=周日)
# │ │ │ │ │
# * * * * *
# 0 2 * * *     每天凌晨 2:00
# 0 9 * * 1-5   工作日早上 9:00
# 0 */6 * * *   每 6 小时
# 0 10 * * 1    每周一上午 10:00
# 0 0 1 * *     每月 1 日零点`}
            />
          </div>

        </div>
      </ReferenceSection>
    </div>
  )
}
