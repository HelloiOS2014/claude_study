export interface ConfigAnnotation {
  line: number
  text: string
}

export interface ConfigExample {
  id: string
  category: 'hook' | 'skill' | 'subagent' | 'permission' | 'claudemd' | 'ci'
  title: string
  description: string
  code: string
  language: string
  annotations: ConfigAnnotation[]
  tier: 'l1' | 'l2' | 'l3'
}

export const configExamples: ConfigExample[] = [
  // ═══ Hooks ═══
  {
    id: 'hook-autoformat',
    category: 'hook',
    title: 'PostToolUse: 编辑后自动格式化',
    description: '每次 Claude 修改文件后自动运行 prettier，确保代码风格统一。',
    tier: 'l2',
    language: 'json',
    code: `{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "prettier --write $CLAUDE_FILE_PATHS"
          }
        ]
      }
    ]
  }
}`,
    annotations: [
      { line: 4, text: 'matcher 支持正则——Edit|Write 匹配两种文件修改工具' },
      { line: 8, text: '$CLAUDE_FILE_PATHS 是被修改的文件路径，Hook 自动注入' },
    ],
  },
  {
    id: 'hook-dangerous-block',
    category: 'hook',
    title: 'PreToolUse: 危险命令拦截',
    description: '在 Bash 执行前检查命令，拦截 rm -rf、DROP TABLE 等危险操作。',
    tier: 'l2',
    language: 'json',
    code: `{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'INPUT=$(cat); CMD=$(echo \\"$INPUT\\" | jq -r \\".tool_input.command // empty\\"); if echo \\"$CMD\\" | grep -iE \\"\\\\b(rm -rf|DROP TABLE|force push|--no-verify)\\\\b\\" > /dev/null; then echo \\"Blocked: 检测到危险操作\\" >&2; exit 2; fi; exit 0'"
          }
        ]
      }
    ]
  }
}`,
    annotations: [
      { line: 5, text: '只匹配 Bash 工具——Read/Edit 不经过这个 Hook' },
      { line: 9, text: 'exit 2 = 阻断操作。stderr 信息会发送给 Claude，它会知道为什么被阻止' },
    ],
  },
  {
    id: 'hook-stop-verify',
    category: 'hook',
    title: 'Stop: 完成性验证（Prompt 型）',
    description: 'Claude 准备停止时，用 LLM 检查任务是否真正完成。',
    tier: 'l2',
    language: 'json',
    code: `{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "prompt",
            "prompt": "检查 agent 是否完成了所有请求的任务并运行了测试。如果都完成了返回 {\\"decision\\": \\"allow\\"}，否则返回 {\\"decision\\": \\"block\\", \\"reason\\": \\"未完成的任务: ...\\"}。"
          }
        ]
      }
    ]
  }
}`,
    annotations: [
      { line: 7, text: 'prompt 型 Hook 用 Haiku 模型做单轮判断，成本极低' },
      { line: 8, text: 'block 会阻止 Claude 停止，它会继续工作直到真正完成' },
    ],
  },
  {
    id: 'hook-precompact',
    category: 'hook',
    title: 'PreCompact: 上下文保存',
    description: '在 auto-compact 触发前自动保存关键上下文到文件，防止重要信息丢失。',
    tier: 'l2',
    language: 'json',
    code: `{
  "hooks": {
    "PreCompact": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "cat .claude/critical-context.md"
          }
        ]
      }
    ]
  }
}`,
    annotations: [
      { line: 8, text: 'stdout 输出会作为上下文注入 compact 后的会话中' },
      { line: 8, text: '把关键决策、API 设计等写在 .claude/critical-context.md 里' },
    ],
  },

  // ═══ Skills ═══
  {
    id: 'skill-code-review',
    category: 'skill',
    title: 'Skill: Code Review',
    description: '自定义的代码审查 Skill，在独立 subagent 中执行，不污染主会话上下文。',
    tier: 'l2',
    language: 'markdown',
    code: `---
name: code-review
description: Review recent changes for bugs and style issues
context: fork
agent: General-purpose
allowed-tools: Read, Grep, Glob, Bash
---

## Context
Recent changes: !\`git diff HEAD~1 --stat\`
Diff content: !\`git diff HEAD~1\`
Project conventions: !\`head -50 CLAUDE.md\`

## Instructions
Review the above changes for:
1. Logic errors and edge cases
2. Security vulnerabilities (OWASP top 10)
3. Consistency with project conventions
4. Test coverage gaps

Output format:
- 🔴 Critical (must fix before merge)
- 🟡 Warning (should fix)
- 🟢 Suggestion (nice to have)`,
    annotations: [
      { line: 4, text: 'context: fork 在独立 subagent 中执行，不占用主会话上下文' },
      { line: 10, text: '!`command` 语法在 Skill 加载前执行 shell 命令，注入实时数据' },
      { line: 6, text: 'allowed-tools 限制 Skill 只能读不能改——安全审查不应该有修改权限' },
    ],
  },
  {
    id: 'skill-pr-summary',
    category: 'skill',
    title: 'Skill: PR Summary',
    description: '自动生成 PR 描述，注入当前 PR 的 diff 作为上下文。',
    tier: 'l2',
    language: 'markdown',
    code: `---
name: pr-summary
description: Generate a PR summary from current changes
argument-hint: [base-branch]
disable-model-invocation: true
---

## Changes
!\`git diff \${0:-main}...HEAD --stat\`

## Diff
!\`git diff \${0:-main}...HEAD\`

## Task
Write a concise PR summary with:
1. One-line title (< 70 chars)
2. Summary: what changed and why (3-5 bullets)
3. Test plan: how to verify these changes`,
    annotations: [
      { line: 5, text: 'disable-model-invocation: true — 只允许用户手动 /pr-summary，不让 Claude 自动调用' },
      { line: 9, text: '${0:-main} 使用第一个参数作为 base branch，默认 main' },
    ],
  },

  // ═══ Subagents ═══
  {
    id: 'subagent-reviewer',
    category: 'subagent',
    title: 'Subagent: Code Reviewer',
    description: '专项代码审查 agent，使用 Opus 模型获得最好的审查质量。',
    tier: 'l3',
    language: 'markdown',
    code: `---
name: code-reviewer
description: Expert code reviewer. Use after code changes to catch bugs.
model: opus
tools:
  - Read
  - Grep
  - Glob
  - Bash
maxTurns: 15
memory: project
---

You are a senior code reviewer. Review recently changed files for:
1. Logic errors, edge cases, off-by-one errors
2. Security vulnerabilities
3. Performance issues
4. Consistency with project patterns

Be specific: cite file paths and line numbers.
Output only high-confidence findings.
Update your agent memory with patterns you discover.`,
    annotations: [
      { line: 4, text: 'model: opus — 审查任务用最强模型，值得多花成本换质量' },
      { line: 10, text: 'maxTurns: 15 — 防止 agent 无限循环消耗 token' },
      { line: 11, text: 'memory: project — 审查 agent 跨会话积累知识' },
    ],
  },
  {
    id: 'subagent-security',
    category: 'subagent',
    title: 'Subagent: Security Scanner',
    description: '安全扫描 agent，只读权限 + worktree 隔离。',
    tier: 'l3',
    language: 'markdown',
    code: `---
name: security-scanner
description: Scan codebase for security vulnerabilities
model: sonnet
tools:
  - Read
  - Grep
  - Glob
disallowedTools:
  - Edit
  - Write
  - Bash
maxTurns: 20
---

Scan the project for security issues:
1. Hardcoded secrets (API keys, passwords, tokens)
2. SQL injection vectors
3. XSS vulnerabilities
4. Insecure deserialization
5. Missing input validation at API boundaries
6. Insecure dependency versions

For each finding:
- Severity: Critical / High / Medium / Low
- File and line number
- Recommended fix`,
    annotations: [
      { line: 9, text: 'disallowedTools 明确禁止修改工具——安全扫描器不应该能改代码' },
      { line: 4, text: 'model: sonnet 够用——安全扫描更多是模式匹配，不需要 Opus' },
    ],
  },

  // ═══ Permissions ═══
  {
    id: 'perm-l1',
    category: 'permission',
    title: '权限: L1 基础使用者',
    description: 'Ask 模式 + 严格白名单。最安全的配置，适合刚开始使用 Claude Code 的人。',
    tier: 'l1',
    language: 'json',
    code: `{
  "permissions": {
    "allow": [
      "Read",
      "Glob",
      "Grep",
      "Bash(npm test *)",
      "Bash(npm run lint *)",
      "Bash(git status)",
      "Bash(git diff *)",
      "Bash(git log *)"
    ],
    "deny": [
      "Read(.env*)",
      "Read(**/credentials*)",
      "Bash(rm *)",
      "Bash(git push *)",
      "Bash(git reset *)"
    ]
  }
}`,
    annotations: [
      { line: 3, text: 'allow 列表明确了可以做什么——不在列表中的操作需要手动确认' },
      { line: 7, text: 'Bash 命令用前缀匹配——npm test * 允许所有以 npm test 开头的命令' },
      { line: 14, text: 'deny 优先级高于 allow——即使 Bash(*) 也不能绕过 deny 规则' },
      { line: 15, text: '注意：deny Read(.env*) 只挡 Read 工具，不挡 Bash 中的 cat .env' },
    ],
  },
  {
    id: 'perm-l2',
    category: 'permission',
    title: '权限: L2 熟练使用者',
    description: 'AcceptEdits + Hook 安全门控。文件编辑自动允许，Bash 命令仍需确认。',
    tier: 'l2',
    language: 'json',
    code: `{
  "permissions": {
    "allow": [
      "Read",
      "Edit",
      "Write",
      "Glob",
      "Grep",
      "Bash(npm *)",
      "Bash(git status)",
      "Bash(git diff *)",
      "Bash(git log *)",
      "Bash(git add *)",
      "Bash(git commit *)",
      "Bash(npx tsc *)",
      "Bash(npx prettier *)",
      "Bash(npx eslint *)"
    ],
    "deny": [
      "Read(.env*)",
      "Bash(rm -rf *)",
      "Bash(git push --force *)",
      "Bash(git reset --hard *)"
    ]
  }
}`,
    annotations: [
      { line: 5, text: 'Edit 和 Write 在 allow 中——文件修改无需确认（AcceptEdits 模式的核心）' },
      { line: 9, text: 'npm 命令全部允许——包括 npm install，需要信任开发者的判断' },
    ],
  },
  {
    id: 'perm-l3',
    category: 'permission',
    title: '权限: L3 深度使用者',
    description: 'Auto + Hook 安全门控。大部分操作自动允许，依赖 Hook 做最后防线。',
    tier: 'l3',
    language: 'json',
    code: `{
  "permissions": {
    "deny": [
      "Read(.env*)",
      "Read(**/secrets*)",
      "Bash(rm -rf /)",
      "Bash(git push --force *)",
      "Bash(: * | sudo *)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'INPUT=$(cat); CMD=$(echo \\"$INPUT\\" | jq -r \\".tool_input.command // empty\\"); if echo \\"$CMD\\" | grep -iE \\"\\\\b(DROP|TRUNCATE|DELETE FROM|rm -rf)\\\\b\\" > /dev/null; then echo \\"需要确认: $CMD\\" >&2; exit 1; fi'"
          }
        ]
      }
    ]
  }
}`,
    annotations: [
      { line: 3, text: 'L3 只配 deny（黑名单），不配 allow——其他全自动' },
      { line: 12, text: '依赖 Hook 而非权限系统做安全检查——更灵活，能做语义判断' },
      { line: 18, text: 'exit 1 = 弹出确认框让用户决定。exit 2 = 直接拒绝' },
    ],
  },

  // ═══ CLAUDE.md ═══
  {
    id: 'claudemd-project',
    category: 'claudemd',
    title: 'CLAUDE.md: 项目模板',
    description: '一个高质量的项目 CLAUDE.md 模板，每行都有存在的理由。',
    tier: 'l1',
    language: 'markdown',
    code: `# Project Rules

## Build & Test
- Build: \`npm run build\` (tsc + vite)
- Test: \`npm test\` (vitest)
- Lint: \`npm run lint\` (eslint + prettier)
- IMPORTANT: 每次修改代码后必须跑 \`npm test\` 确认不破坏现有测试

## Code Style
- TypeScript strict mode, 不允许 any 类型
- 函数式组件 + hooks, 不用 class 组件
- import 顺序: react → 第三方 → 项目内 → 类型

## Architecture
- IMPORTANT: src/core/ 下的文件是核心模块, 修改前必须先用 Plan Mode
- API 层在 src/api/, 业务逻辑在 src/services/, 不要混
- 数据库操作只通过 src/db/ 下的 repository 模式

## 不要做的事
- NEVER: 不要修改 .env 或任何含密钥的文件
- NEVER: 不要直接操作数据库，所有操作通过 ORM
- 不要引入新的第三方依赖而不先问我`,
    annotations: [
      { line: 4, text: '构建命令是 Claude 无法猜到的——这正是 CLAUDE.md 该写的内容' },
      { line: 7, text: 'IMPORTANT 关键字提升规则权重，Claude 更倾向于遵守' },
      { line: 13, text: '具体到"不允许 any 类型"比"写好代码"有效 1000 倍' },
      { line: 17, text: 'IMPORTANT + 修改条件——给了缓冲，不是禁止而是要求先规划' },
      { line: 22, text: 'NEVER 是最强的否定词——Claude 几乎不会违反' },
    ],
  },
  {
    id: 'claudemd-monorepo',
    category: 'claudemd',
    title: 'CLAUDE.md: Monorepo 模板',
    description: '分层 CLAUDE.md 结构，根目录全局规范 + 子包独立约定。',
    tier: 'l2',
    language: 'markdown',
    code: `# Monorepo Root CLAUDE.md

## Global Rules (applies to ALL packages)
- Package manager: pnpm (NEVER use npm or yarn)
- Node version: 20 LTS
- TypeScript strict in all packages
- IMPORTANT: 跨包修改需要先用 Plan Mode 评估影响

## Workspace Structure
- packages/api/ — Express backend (see its own CLAUDE.md)
- packages/web/ — React frontend (see its own CLAUDE.md)
- packages/shared/ — Shared types and utilities

## Cross-Package Rules
- shared/ 的改动影响 api/ 和 web/, 改之前必须评估两端
- 所有包的对外 API 通过 packages/shared/types/ 定义
- 不允许包之间的循环依赖`,
    annotations: [
      { line: 4, text: '全局规范放根目录——所有子目录都会继承' },
      { line: 10, text: '指向子包的 CLAUDE.md——子目录的规则在需要时才加载' },
      { line: 15, text: '跨包规则是根目录最有价值的内容——子包自己不会知道这些' },
    ],
  },

  // ═══ CI/CD ═══
  {
    id: 'ci-pr-review',
    category: 'ci',
    title: 'GitHub Actions: PR 自动审查',
    description: '每个 PR 自动运行 Claude Code 做代码审查，结果输出到 PR 评论。',
    tier: 'l3',
    language: 'yaml',
    code: `name: Claude Code Review
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
      - name: Run Claude Code Review
        env:
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          npx claude -p "Review this PR diff for bugs, security issues, and style problems. Output as markdown." \\
            --output-format json \\
            --allowedTools Read,Grep,Glob \\
            --max-turns 10 \\
            | jq -r '.result' > review.md
      - name: Post review comment
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const review = fs.readFileSync('review.md', 'utf8');
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: '## 🤖 Claude Code Review\\n\\n' + review
            });`,
    annotations: [
      { line: 15, text: 'fetch-depth: 0 拉取完整 git 历史，Claude 可以看到更多上下文' },
      { line: 22, text: '--allowedTools 限制 Claude 只能读不能改——CI 中绝对不能给写权限' },
      { line: 23, text: '--max-turns 10 防止 Claude 在 CI 中跑太久烧钱' },
    ],
  },
  {
    id: 'ci-batch-migration',
    category: 'ci',
    title: '批量迁移脚本',
    description: 'Fan-out 模式：用 Claude Code 批量迁移 50 个文件，每个文件独立处理。',
    tier: 'l3',
    language: 'bash',
    code: `#!/bin/bash
# 将所有 .js 文件从 CommonJS 迁移到 ESM
# 每个文件独立处理，失败不影响其他文件

set -euo pipefail

FILES=$(find src -name "*.js" -not -path "*/node_modules/*")
TOTAL=$(echo "$FILES" | wc -l | tr -d ' ')
DONE=0
FAILED=0

echo "Found $TOTAL files to migrate"

for file in $FILES; do
  echo "[$((DONE + 1))/$TOTAL] Migrating: $file"

  if npx claude -p "Convert $file from CommonJS (require/module.exports) to ESM (import/export). Keep all functionality. Only modify this one file." \\
    --allowedTools Read,Edit \\
    --max-turns 5 \\
    --output-format json > /dev/null 2>&1; then
    DONE=$((DONE + 1))
    echo "  ✅ Success"
  else
    FAILED=$((FAILED + 1))
    echo "  ❌ Failed"
  fi
done

echo ""
echo "Migration complete: $DONE succeeded, $FAILED failed out of $TOTAL"`,
    annotations: [
      { line: 7, text: '列出所有目标文件——每个文件独立处理，失败不阻塞' },
      { line: 18, text: '--allowedTools Read,Edit — 只允许读和编辑，不能运行命令' },
      { line: 19, text: '--max-turns 5 — 单个文件的迁移不应该需要超过 5 轮' },
    ],
  },
]

export function getConfigsByCategory(category: ConfigExample['category']): ConfigExample[] {
  return configExamples.filter(c => c.category === category)
}

export function getConfigById(id: string): ConfigExample | undefined {
  return configExamples.find(c => c.id === id)
}

export const configCategories = [
  { id: 'hook' as const, label: 'Hooks', description: '生命周期自动化' },
  { id: 'skill' as const, label: 'Skills', description: '自定义 Slash 命令' },
  { id: 'subagent' as const, label: 'Subagents', description: '自定义子代理' },
  { id: 'permission' as const, label: '权限配置', description: '分级权限模板' },
  { id: 'claudemd' as const, label: 'CLAUDE.md', description: '项目规范模板' },
  { id: 'ci' as const, label: 'CI/CD', description: '持续集成配置' },
]
