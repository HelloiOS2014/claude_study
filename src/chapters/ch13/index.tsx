import { CodeBlock } from '../../components/content/CodeBlock'
import { QualityCallout } from '../../components/content/QualityCallout'
import { ExerciseCard } from '../../components/content/ExerciseCard'
import { ConfigExample } from '../../components/content/ConfigExample'

/* ═══════════════════════════════════════════════
   Chapter 13 Component
   ═══════════════════════════════════════════════ */

export default function Ch13() {
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
            13
          </span>
          <span
            className="text-xs uppercase tracking-widest font-medium"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Cookbook
          </span>
          <span
            className="text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 rounded"
            style={{
              color: 'var(--color-accent)',
              background: 'var(--color-accent-subtle)',
              border: '1px solid var(--color-border-accent)',
            }}
          >
            Harness / 组合技
          </span>
        </div>
        <h1
          className="text-3xl md:text-4xl font-bold mb-4 leading-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          高阶组合技
        </h1>
        <p
          className="text-lg leading-relaxed max-w-3xl"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          这一章是你的 cookbook — 每个 recipe 都是完整可复制的自动化方案。
          不是概念介绍，不是 API 文档，而是<strong style={{ color: 'var(--color-text-primary)' }}>拿来就能用的实战配方</strong>。
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
            你会用组件，但不知道怎么拼
          </h3>
          <div className="text-sm leading-relaxed space-y-3" style={{ color: 'var(--color-text-secondary)' }}>
            <p>
              你会用 Hooks，会用子代理，会用 SDK。但面对一个真实问题 —
              比如"怎么让每个 PR 自动做安全审查" — 你不知道该把哪些组件怎么拼起来。
            </p>
            <p>
              单个组件你都掌握了，但从"我有一个问题"到"我有一个完整的自动化方案"之间，
              缺的不是知识，而是<strong style={{ color: 'var(--color-text-primary)' }}>组合的经验</strong>。
            </p>
            <p>
              这一章用三个完整的 recipe 给你这个经验。每个 recipe 都从失败出发，
              经过诊断和方案设计，最终给出<strong style={{ color: 'var(--color-text-primary)' }}>完整可复制的代码</strong>。
              读完之后，你不仅能直接使用这三个方案，更重要的是——你会知道如何设计自己的组合技。
            </p>
          </div>
        </div>

        <QualityCallout title="前置条件">
          <p>
            这一章假设你已经掌握了 Hooks (Ch07)、多代理 (Ch08)、SDK/CI (Ch09) 的基础。
            如果这些概念还不熟悉，建议先回去补基础。
            组合技 = 基础组件 + 连接方式 + 验证策略，三者缺一不可。
          </p>
        </QualityCallout>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 13.1: 组合技一 — 多维度自动 PR Review
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          13.1 组合技一：多维度自动 PR Review
        </h2>

        {/* ── 失败 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          失败场景
        </h3>

        <div
          className="p-5 rounded-lg"
          style={{
            background: 'rgba(248, 113, 113, 0.06)',
            border: '1px solid rgba(248, 113, 113, 0.25)',
          }}
        >
          <div className="text-sm leading-relaxed space-y-3" style={{ color: 'var(--color-text-secondary)' }}>
            <p>
              团队的 code review 只看"能不能跑"。Reviewer 瞄一眼逻辑，
              跑一下测试，approve。结果：安全漏洞反复漏过，架构问题积累到无法重构，
              代码风格因人而异，新人的 PR 没人仔细看。
            </p>
            <p>
              上线三个月后，一次安全审计发现了 12 个 SQL 注入点 — 全部都是 PR review 时漏掉的。
            </p>
          </div>
        </div>

        {/* ── 诊断 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          诊断
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          一个 reviewer 不可能同时关注安全、质量、风格三个维度。
          人在 review 第 200 行代码时已经疲劳了，注意力会集中在最显眼的问题上，
          而安全漏洞往往藏在不起眼的地方。
          解决方案不是"更仔细地 review"，而是<strong style={{ color: 'var(--color-text-primary)' }}>把维度拆开，让 AI 分别关注</strong>。
        </p>

        {/* ── 方案架构 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          方案架构
        </h3>

        <CodeBlock
          language="markdown"
          title="多维度 PR Review 架构"
          code={`GitHub PR Event (opened / synchronize)
  → GitHub Actions Workflow
    ┌─────────────────────────────────────────┐
    │  并行执行三个独立的 claude -p 调用:       │
    │                                          │
    │  1. 安全审查 (effort: high)              │
    │     → OWASP Top 10, 注入, 认证, 加密     │
    │                                          │
    │  2. 质量审查 (effort: medium)            │
    │     → 逻辑错误, 错误处理, 边界条件         │
    │                                          │
    │  3. 风格审查 (effort: low)               │
    │     → 命名规范, 代码组织, 注释质量         │
    └─────────────────────────────────────────┘
    → 汇总脚本合并三份报告
    → gh pr comment 发布结构化评审
    → 根据严重级别设置 Status Check (pass/fail)`}
          showLineNumbers={false}
        />

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          关键设计：三个 reviewer 完全独立运行，互不影响。安全审查用{' '}
          <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>effort: high</code>
          {' '}因为安全问题必须仔细检查；风格审查用{' '}
          <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>effort: low</code>
          {' '}因为风格问题不需要深度推理。这样在总成本不变的前提下，安全检查的质量大幅提升。
        </p>

        {/* ── 完整代码 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          完整代码
        </h3>

        <h4
          className="text-base font-semibold mt-6"
          style={{ color: 'var(--color-text-primary)' }}
        >
          1. GitHub Actions Workflow
        </h4>

        <ConfigExample
          language="yaml"
          title=".github/workflows/ai-pr-review.yml"
          code={`name: AI Multi-Dimension PR Review

on:
  pull_request:
    types: [opened, synchronize]

permissions:
  contents: read
  pull-requests: write
  statuses: write

jobs:
  security-review:
    runs-on: ubuntu-latest
    outputs:
      result: \${{ steps.review.outputs.result }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Get PR diff
        id: diff
        run: |
          git diff origin/\${{ github.base_ref }}...HEAD > /tmp/pr-diff.txt
      - name: Security Review
        id: review
        run: |
          result=$(claude -p \\
            --model claude-sonnet-4-20250514 \\
            --effort high \\
            --output-format json \\
            "$(cat .github/prompts/security-review.md)

            以下是本次 PR 的代码变更：
            $(cat /tmp/pr-diff.txt)")
          echo "result<<DELIM" >> $GITHUB_OUTPUT
          echo "$result" >> $GITHUB_OUTPUT
          echo "DELIM" >> $GITHUB_OUTPUT

  quality-review:
    runs-on: ubuntu-latest
    outputs:
      result: \${{ steps.review.outputs.result }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Get PR diff
        id: diff
        run: |
          git diff origin/\${{ github.base_ref }}...HEAD > /tmp/pr-diff.txt
      - name: Quality Review
        id: review
        run: |
          result=$(claude -p \\
            --model claude-sonnet-4-20250514 \\
            --effort medium \\
            --output-format json \\
            "$(cat .github/prompts/quality-review.md)

            以下是本次 PR 的代码变更：
            $(cat /tmp/pr-diff.txt)")
          echo "result<<DELIM" >> $GITHUB_OUTPUT
          echo "$result" >> $GITHUB_OUTPUT
          echo "DELIM" >> $GITHUB_OUTPUT

  style-review:
    runs-on: ubuntu-latest
    outputs:
      result: \${{ steps.review.outputs.result }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Get PR diff
        id: diff
        run: |
          git diff origin/\${{ github.base_ref }}...HEAD > /tmp/pr-diff.txt
      - name: Style Review
        id: review
        run: |
          result=$(claude -p \\
            --model claude-sonnet-4-20250514 \\
            --effort low \\
            --output-format json \\
            "$(cat .github/prompts/style-review.md)

            以下是本次 PR 的代码变更：
            $(cat /tmp/pr-diff.txt)")
          echo "result<<DELIM" >> $GITHUB_OUTPUT
          echo "$result" >> $GITHUB_OUTPUT
          echo "DELIM" >> $GITHUB_OUTPUT

  combine-results:
    needs: [security-review, quality-review, style-review]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Combine and Comment
        env:
          GH_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          SECURITY: \${{ needs.security-review.outputs.result }}
          QUALITY: \${{ needs.quality-review.outputs.result }}
          STYLE: \${{ needs.style-review.outputs.result }}
        run: |
          bash .github/scripts/combine-reviews.sh \\
            "\$SECURITY" "\$QUALITY" "\$STYLE" \\
            \${{ github.event.pull_request.number }}`}
          annotations={[
            { line: 6, text: '监听 PR 创建和更新事件，每次推送新 commit 都会重新审查' },
            { line: 14, text: '三个 review job 并行运行，互不阻塞，总时间 = 最慢的那个' },
            { line: 27, text: 'effort: high — 安全审查需要最仔细的检查，不能省' },
            { line: 51, text: 'effort: medium — 质量审查需要理解逻辑，但不需要穷举' },
            { line: 73, text: 'effort: low — 风格审查是模式匹配，不需要深度推理' },
            { line: 82, text: '等三个并行 job 全部完成后汇总结果' },
          ]}
        />

        <h4
          className="text-base font-semibold mt-6"
          style={{ color: 'var(--color-text-primary)' }}
        >
          2. 三个审查提示词
        </h4>

        <CodeBlock
          language="markdown"
          title=".github/prompts/security-review.md — 安全审查"
          code={`你是一个专注于安全的代码审查员。只关注安全问题，忽略风格和一般质量。

## 检查维度（基于 OWASP Top 10）

1. **注入攻击**: SQL 注入、命令注入、XSS
   - 所有用户输入是否经过参数化/转义？
   - 是否有字符串拼接构造 SQL/命令？

2. **认证与授权**:
   - API 端点是否有适当的认证检查？
   - 权限验证是否在业务逻辑之前？
   - 是否存在越权访问路径？

3. **敏感数据**:
   - 有无硬编码的密钥、token、密码？
   - 日志中是否泄露敏感信息？
   - 响应中是否包含不必要的内部细节？

4. **加密与传输**:
   - 密码是否使用安全哈希（bcrypt/argon2）？
   - 外部调用是否使用 HTTPS？

5. **依赖安全**:
   - 新增依赖是否有已知漏洞？
   - 是否使用了不再维护的包？

## 输出格式（JSON）
{
  "findings": [
    {
      "severity": "critical|high|medium|low",
      "category": "injection|auth|data|crypto|dependency",
      "file": "文件路径",
      "line": "行号范围",
      "description": "问题描述",
      "suggestion": "修复建议"
    }
  ],
  "summary": "总体安全评估（1-2 句话）",
  "pass": true/false
}`}
          showLineNumbers={false}
        />

        <CodeBlock
          language="markdown"
          title=".github/prompts/quality-review.md — 质量审查"
          code={`你是一个专注于代码质量的审查员。只关注逻辑正确性和错误处理，忽略安全和风格。

## 检查维度

1. **逻辑正确性**:
   - 算法是否正确？边界条件是否处理？
   - 并发场景是否考虑？竞态条件？
   - 数据类型转换是否安全？

2. **错误处理**:
   - 异常是否被正确捕获和处理？
   - 是否有裸的 try-catch 吞掉了错误？
   - 错误信息是否有助于调试？

3. **资源管理**:
   - 数据库连接/文件句柄是否正确关闭？
   - 是否有潜在的内存泄漏？
   - 定时器/监听器是否正确清理？

4. **测试覆盖**:
   - 新增逻辑是否有对应测试？
   - 测试是否覆盖了异常路径？
   - mock 是否合理（不是 mock 掉了被测逻辑）？

## 输出格式（JSON）
{
  "findings": [
    {
      "severity": "critical|high|medium|low",
      "category": "logic|error-handling|resource|test",
      "file": "文件路径",
      "line": "行号范围",
      "description": "问题描述",
      "suggestion": "修复建议"
    }
  ],
  "summary": "总体质量评估",
  "pass": true/false
}`}
          showLineNumbers={false}
        />

        <CodeBlock
          language="markdown"
          title=".github/prompts/style-review.md — 风格审查"
          code={`你是一个专注于代码风格的审查员。只关注命名、组织和可读性，忽略安全和逻辑。

## 检查维度

1. **命名规范**:
   - 变量/函数命名是否有意义且一致？
   - 是否遵循项目既有命名约定？
   - 缩写是否清晰（避免单字母变量）？

2. **代码组织**:
   - 函数长度是否合理（> 50 行考虑拆分）？
   - 文件职责是否单一？
   - import 顺序是否规范？

3. **注释质量**:
   - 复杂逻辑是否有注释说明 why（而非 what）？
   - 是否有过时/误导性注释？
   - 公共 API 是否有文档注释？

4. **一致性**:
   - 与项目既有代码风格是否一致？
   - 是否引入了新的模式但没有迁移旧代码？

## 输出格式（JSON）
{
  "findings": [
    {
      "severity": "high|medium|low",
      "category": "naming|organization|comment|consistency",
      "file": "文件路径",
      "line": "行号范围",
      "description": "问题描述",
      "suggestion": "修复建议"
    }
  ],
  "summary": "总体风格评估",
  "pass": true/false
}`}
          showLineNumbers={false}
        />

        <h4
          className="text-base font-semibold mt-6"
          style={{ color: 'var(--color-text-primary)' }}
        >
          3. 结果汇总脚本
        </h4>

        <CodeBlock
          language="bash"
          title=".github/scripts/combine-reviews.sh"
          code={`#!/bin/bash
# 汇总三个审查结果，生成结构化 PR Comment
# 用法: combine-reviews.sh "$SECURITY" "$QUALITY" "$STYLE" PR_NUMBER

set -euo pipefail

SECURITY_RESULT="$1"
QUALITY_RESULT="$2"
STYLE_RESULT="$3"
PR_NUMBER="$4"

# ── 解析各维度的 findings 数量和 pass 状态 ──
sec_pass=$(echo "$SECURITY_RESULT" | jq -r '.pass')
sec_count=$(echo "$SECURITY_RESULT" | jq '.findings | length')
sec_critical=$(echo "$SECURITY_RESULT" | jq '[.findings[] | select(.severity == "critical")] | length')

qual_pass=$(echo "$QUALITY_RESULT" | jq -r '.pass')
qual_count=$(echo "$QUALITY_RESULT" | jq '.findings | length')

style_pass=$(echo "$STYLE_RESULT" | jq -r '.pass')
style_count=$(echo "$STYLE_RESULT" | jq '.findings | length')

# ── 生成 Markdown 评审报告 ──
COMMENT="## AI Code Review Report

| 维度 | 状态 | 发现数量 |
|------|------|----------|
| 安全审查 | $([ "$sec_pass" = "true" ] && echo "PASS" || echo "FAIL") | $sec_count |
| 质量审查 | $([ "$qual_pass" = "true" ] && echo "PASS" || echo "FAIL") | $qual_count |
| 风格审查 | $([ "$style_pass" = "true" ] && echo "PASS" || echo "FAIL") | $style_count |

### 安全审查
$(echo "$SECURITY_RESULT" | jq -r '.summary')

<details>
<summary>详细发现 ($sec_count 项)</summary>

$(echo "$SECURITY_RESULT" | jq -r '.findings[] | "- **[\(.severity)]** \(.file):\(.line) — \(.description)\n  建议: \(.suggestion)"')
</details>

### 质量审查
$(echo "$QUALITY_RESULT" | jq -r '.summary')

<details>
<summary>详细发现 ($qual_count 项)</summary>

$(echo "$QUALITY_RESULT" | jq -r '.findings[] | "- **[\(.severity)]** \(.file):\(.line) — \(.description)\n  建议: \(.suggestion)"')
</details>

### 风格审查
$(echo "$STYLE_RESULT" | jq -r '.summary')

<details>
<summary>详细发现 ($style_count 项)</summary>

$(echo "$STYLE_RESULT" | jq -r '.findings[] | "- **[\(.severity)]** \(.file):\(.line) — \(.description)\n  建议: \(.suggestion)"')
</details>

---
*由 Claude Code 自动审查 | 安全(effort:high) + 质量(effort:medium) + 风格(effort:low)*"

# ── 发布 PR Comment ──
gh pr comment "$PR_NUMBER" --body "$COMMENT"

# ── 设置 Status Check ──
# 安全审查有 critical 发现 → 阻止合并
if [ "$sec_critical" -gt 0 ]; then
  echo "::error::安全审查发现 $sec_critical 个 critical 级别问题"
  exit 1
fi

# 安全或质量审查未通过 → 警告但不阻止
if [ "$sec_pass" = "false" ] || [ "$qual_pass" = "false" ]; then
  echo "::warning::审查发现需要关注的问题，请查看 PR 评论"
fi

echo "AI Review 完成: 安全($sec_count) 质量($qual_count) 风格($style_count)"`}
          showLineNumbers={false}
        />

        {/* ── 成本估算 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          成本估算
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                {['审查维度', 'effort', '预估 Token', '预估成本', '耗时'].map((h) => (
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
                ['安全审查', 'high', '~15-20K', '~$0.08-0.12', '~60 秒'],
                ['质量审查', 'medium', '~8-12K', '~$0.04-0.06', '~30 秒'],
                ['风格审查', 'low', '~3-5K', '~$0.02-0.03', '~15 秒'],
                ['总计 (每个 PR)', '—', '~26-37K', '~$0.15-0.20', '~60 秒 (并行)'],
              ].map((row, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    ...(i === 3 ? { fontWeight: 600, background: 'var(--color-bg-secondary)' } : {}),
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
          每个 PR 约 $0.15-0.20，一个月 200 个 PR 的团队约 $30-40/月。
          对比一次安全事故的修复成本（通常数千到数万美元），这个 ROI 不需要计算。
        </p>

        {/* ── 验证 ── */}
        <ExerciseCard
          tier="l2"
          title="在历史 PR 上验证"
          description="从你的仓库中挑 10 个已合并的历史 PR，用这个 workflow 跑一遍自动审查。重点对比：AI 审查发现的问题中，有多少是后来确实导致了 bug 或安全事故的？"
          checkpoints={[
            '安全审查是否发现了人工 review 遗漏的注入/认证问题？',
            '质量审查是否发现了后来导致 bug 的逻辑错误？',
            '风格审查的建议是否与团队实际规范一致？',
            '误报率（false positive）是否在可接受范围内（< 30%）？',
            '总审查时间是否比人工审查快 5 倍以上？',
          ]}
        />

        {/* ── 翻车了怎么办 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          翻车了怎么办
        </h3>

        <div className="space-y-4">
          <div
            className="p-4 rounded-lg"
            style={{
              background: 'rgba(248, 113, 113, 0.06)',
              border: '1px solid rgba(248, 113, 113, 0.25)',
            }}
          >
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              问题 1：Claude 幻觉了行号
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Review 评论引用了 diff 中不存在的行号，开发者无法定位问题。
            </p>
            <p className="text-sm leading-relaxed mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              <strong style={{ color: 'var(--color-text-primary)' }}>修复：</strong>限制上下文只给 diff（不给完整文件）。
              在 prompt 中明确添加：{' '}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>
                "Only reference lines shown in the diff above. Do not guess line numbers."
              </code>
              。如果使用 GitHub CLI 获取 diff，加{' '}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>
                --diff-only
              </code>{' '}
              标志，避免把完整文件内容也塞进上下文。
            </p>
          </div>

          <div
            className="p-4 rounded-lg"
            style={{
              background: 'rgba(248, 113, 113, 0.06)',
              border: '1px solid rgba(248, 113, 113, 0.25)',
            }}
          >
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              问题 2：安全审查对每个 innerHTML 都报警，即使已经做了 sanitize
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              团队用了 DOMPurify，但 Claude 仍然把每个 innerHTML 标记为 critical。误报太多导致团队开始忽略安全报告。
            </p>
            <p className="text-sm leading-relaxed mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              <strong style={{ color: 'var(--color-text-primary)' }}>修复：</strong>在 security-review.md 中加排除规则：{' '}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>
                "Ignore innerHTML usage in files that import DOMPurify or sanitize-html. These are already sanitized."
              </code>
              。通用原则：项目级排除规则写在 prompt 里，不要期望 Claude 自己推断。
            </p>
          </div>

          <div
            className="p-4 rounded-lg"
            style={{
              background: 'rgba(248, 113, 113, 0.06)',
              border: '1px solid rgba(248, 113, 113, 0.25)',
            }}
          >
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              问题 3：Review 评论太啰嗦，团队开始忽略
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              每个 PR 评论长达 50 行，开发者滚动到一半就关了。真正重要的问题被淹没。
            </p>
            <p className="text-sm leading-relaxed mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              <strong style={{ color: 'var(--color-text-primary)' }}>修复：</strong>在 prompt 尾部加约束：{' '}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>
                "Only report HIGH and CRITICAL severity issues. Format: one line per issue, max 5 issues per dimension."
              </code>
              。低严重度的问题放进{' '}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>
                {'<details>'}
              </code>{' '}
              折叠块里，不在主视图展示。
            </p>
          </div>

          <div
            className="p-4 rounded-lg"
            style={{
              background: 'rgba(248, 113, 113, 0.06)',
              border: '1px solid rgba(248, 113, 113, 0.25)',
            }}
          >
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              问题 4：WIP 分支也触发 review，浪费钱
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              开发者习惯开 draft PR 做备份，每次推送都触发三路审查，月底账单翻倍。
            </p>
            <p className="text-sm leading-relaxed mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              <strong style={{ color: 'var(--color-text-primary)' }}>修复：</strong>在 workflow yaml 的 job 级别加条件过滤：
            </p>
            <CodeBlock
              language="yaml"
              title="跳过 Draft PR"
              code={`jobs:
  security-review:
    if: github.event.pull_request.draft == false
    runs-on: ubuntu-latest
    # ...`}
              showLineNumbers={false}
            />
          </div>
        </div>

        {/* ── 4 周调优清单 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          4 周调优清单
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                {['周次', '任务', '目标'].map((h) => (
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
                ['Week 1', '在 5 个历史 PR 上跑，记录误报率', '建立 baseline：误报率、漏报率、每次审查耗时'],
                ['Week 2', '根据误报调 prompt，加项目特定的排除规则', '误报率从 baseline 降低 50%+'],
                ['Week 3', '调 effort 级别和严重度阈值', '成本和信噪比达到团队可接受水平'],
                ['Week 4', '复盘成本数据，决定是否精简维度（比如去掉 style review）', '确定长期运行配置'],
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
      </section>

      {/* ═══════════════════════════════════════════════
          Section 13.2: 组合技二 — 大型重构的多代理协作
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          13.2 组合技二：大型重构的多代理协作
        </h2>

        {/* ── 失败 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          失败场景
        </h3>

        <div
          className="p-5 rounded-lg"
          style={{
            background: 'rgba(248, 113, 113, 0.06)',
            border: '1px solid rgba(248, 113, 113, 0.25)',
          }}
        >
          <div className="text-sm leading-relaxed space-y-3" style={{ color: 'var(--color-text-secondary)' }}>
            <p>
              团队决定将一个 Express API 从回调式错误处理迁移到统一的{' '}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>{'Result<T, E>'}</code>{' '}
              模式。涉及 50+ 文件，跨三层：routes / services / data。
            </p>
            <p>
              你在一个 Claude Code 会话中开始重构。前 20 个文件改得很顺利，
              但到了第 30 个文件时，上下文窗口已经被前面的对话和文件内容塞满了。
              Claude 开始把{' '}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>{'Result<T>'}</code>{' '}
              的{' '}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>ok</code>{' '}
              字段跟前面定义的{' '}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>success</code>{' '}
              字段搞混，后面生成的代码跟前面的接口对不上。
              整个重构花了 4 小时，最后还有 15 个接口不一致需要手动修复。
            </p>
          </div>
        </div>

        {/* ── 诊断 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          诊断
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          上下文越长，注意力越分散。单个会话处理 50+ 文件时，
          Claude 对早期定义的接口记忆逐渐模糊，后面的代码开始偏离规范。
          解决方案不是"更大的窗口"——而是<strong style={{ color: 'var(--color-text-primary)' }}>隔离 + 共享契约</strong>：
          每个代理只看自己模块的代码，但都遵守同一份类型定义文件。
        </p>

        {/* ── Step 1: 接口契约 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Step 1: 先写接口契约
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          在任何代理开始工作之前，先手动（或用 Claude）写好共享类型文件。
          这是所有代理的 source of truth——{' '}
          <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>tsc --noEmit</code>{' '}
          在契约文件上单独通过后，才进入下一步。
        </p>

        <CodeBlock
          language="typescript"
          title="shared/result.ts — 三层共用的契约"
          code={`// shared/result.ts — 三层共用的契约
export type Result<T, E = AppError> =
  | { ok: true; data: T }
  | { ok: false; error: E };

export interface AppError {
  code: string;
  message: string;
  statusCode: number;
}

// ── 路由层契约 ──
// controller 返回 Result，路由层解包：
//   const result = await userController.getById(id);
//   if (result.ok) res.json(result.data);
//   else res.status(result.error.statusCode).json({ error: result.error });

// ── 服务层契约 ──
// service 方法统一返回 Result<T>：
//   async getUserById(id: string): Promise<Result<User>>
//   async createUser(input: CreateUserInput): Promise<Result<User>>

// ── 数据层契约 ──
// repository 方法统一返回 Result<T>：
//   async findById(id: string): Promise<Result<User>>
//   async findMany(filter: UserFilter): Promise<Result<User[]>>`}
          showLineNumbers={false}
        />

        <p className="text-sm leading-relaxed mt-3" style={{ color: 'var(--color-text-secondary)' }}>
          验证：在契约文件上单独跑{' '}
          <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>tsc --noEmit shared/result.ts</code>
          ，确认类型定义本身没有错误。这一步看似简单但极其关键——
          如果契约本身有歧义，三个代理会各自"合理解读"，最后在集成时爆炸。
        </p>

        {/* ── Step 2: Agent 分派 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Step 2: 派发 Agent
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          三个独立的{' '}
          <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>claude -p</code>{' '}
          进程，每个只操作自己的目录，共享同一份{' '}
          <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>shared/result.ts</code>{' '}
          契约。以下是实际的分派命令：
        </p>

        <CodeBlock
          language="bash"
          title="Agent A: 路由层重构"
          code={`# Agent A: 路由层重构
claude -p "Refactor all route handlers in src/routes/ to use the Result<T> \\
pattern from shared/result.ts.
Current pattern: try/catch with res.status().json().
New pattern: call service, check result.ok, return data or error.

Example migration:
  // BEFORE
  try {
    const user = await userService.getUserById(id);
    if (!user) return res.status(404).json({ message: 'Not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }

  // AFTER
  const result = await userService.getUserById(id);
  if (result.ok) {
    res.json(result.data);
  } else {
    res.status(result.error.statusCode).json({ error: result.error });
  }

CONSTRAINT: Do NOT modify files outside src/routes/.
After each file, run: npm test -- --testPathPattern=routes" \\
  --allowedTools "Read,Edit,Write,Bash,Grep,Glob" \\
  --max-turns 30`}
          showLineNumbers={false}
        />

        <CodeBlock
          language="bash"
          title="Agent B: 服务层重构"
          code={`# Agent B: 服务层重构
claude -p "Refactor all service files in src/services/ to return Result<T> \\
from shared/result.ts instead of throwing errors or returning raw values.
Current pattern: throw new Error() or return value | null.
New pattern: return { ok: true, data: value } or { ok: false, error: {...} }.

Example migration:
  // BEFORE
  async getUserById(id: string): Promise<User | null> {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  // AFTER
  async getUserById(id: string): Promise<Result<User>> {
    const user = await this.repo.findById(id);
    if (!user.ok) return user;  // propagate data layer error
    if (!user.data) return { ok: false, error: { code: 'NOT_FOUND', message: 'User not found', statusCode: 404 } };
    return { ok: true, data: user.data };
  }

CONSTRAINT: Do NOT modify files outside src/services/.
After each file, run: npm test -- --testPathPattern=services" \\
  --allowedTools "Read,Edit,Write,Bash,Grep,Glob" \\
  --max-turns 30`}
          showLineNumbers={false}
        />

        <CodeBlock
          language="bash"
          title="Agent C: 数据层重构"
          code={`# Agent C: 数据层重构
claude -p "Refactor all repository files in src/data/ to return Result<T> \\
from shared/result.ts instead of throwing or returning raw values.
Current pattern: throw on DB error, return entity or null.
New pattern: wrap in Result — { ok: true, data } or { ok: false, error }.

Example migration:
  // BEFORE
  async findById(id: string): Promise<User | null> {
    try {
      return await db.query('SELECT * FROM users WHERE id = $1', [id]);
    } catch (err) {
      throw new DatabaseError(err.message);
    }
  }

  // AFTER
  async findById(id: string): Promise<Result<User | null>> {
    try {
      const user = await db.query('SELECT * FROM users WHERE id = $1', [id]);
      return { ok: true, data: user };
    } catch (err) {
      return { ok: false, error: { code: 'DB_ERROR', message: err.message, statusCode: 500 } };
    }
  }

CONSTRAINT: Do NOT modify files outside src/data/.
After each file, run: npm test -- --testPathPattern=data" \\
  --allowedTools "Read,Edit,Write,Bash,Grep,Glob" \\
  --max-turns 30`}
          showLineNumbers={false}
        />

        {/* ── Step 3: 执行中的摩擦 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Step 3: 执行中的摩擦
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          三个 agent 同时运行。理想状态下各自完成、无交互。
          但实际执行中一定会有摩擦。以下是真实的终端输出：
        </p>

        <CodeBlock
          language="bash"
          title="终端输出 — 三个 agent 的实际状态"
          code={`# ── Agent A (routes): DONE ──
# 17/17 文件重构完成
# npm test -- --testPathPattern=routes: 34 passed, 0 failed
#
# 注意：Agent A 在重构过程中把 getUserById 重命名为 getUser，
# 理由是 "more concise, consistent with other methods"

# ── Agent B (services): NEEDS_CONTEXT ──
# 停在第 8 个文件，打印了以下消息：
# "现有代码中 UserService.getUserById 的返回类型是 Promise<User | null>，
#  但契约要求返回 Result<User>。这两个类型不兼容。
#  请确认：是直接迁移返回类型（会破坏调用方），
#  还是加一个适配器层过渡？"
#
# → 开发者回应："直接迁移返回类型。调用方由 Agent A 负责同步。"
# → Agent B 继续执行...
# → 22/22 文件重构完成

# ── Agent C (data): DONE ──
# 14/14 文件重构完成
# npm test -- --testPathPattern=data: 28 passed, 0 failed

# ── 问题暴露 ──
# Agent A 把 getUserById 重命名为 getUser
# 但 Agent C 的测试仍然 import { getUserById } from ...
# Agent B 的服务层也在调用 this.repo.getUserById(...)
# → tsc --noEmit: 3 errors found`}
          showLineNumbers={false}
        />

        <QualityCallout title="这就是多代理的现实">
          <p>
            Agent B 遇到类型不兼容时没有盲目继续，而是停下来问开发者。
            这是正确的行为——比"猜一个答案继续跑"好得多。
            但 Agent A 的自作主张重命名（<code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>getUserById → getUser</code>）
            才是真正的坑：每个 agent 各自看着自己的模块觉得"没问题"，但集成时炸了。
          </p>
        </QualityCallout>

        {/* ── Step 4: 集成验证 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Step 4: 集成验证
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          三个 agent 各自完成后，跑全局类型检查：
        </p>

        <CodeBlock
          language="bash"
          title="tsc --noEmit 输出 — 3 个类型错误"
          code={`$ tsc --noEmit

src/services/userService.ts:14:28 - error TS2339:
  Property 'getUserById' does not exist on type 'UserRepository'.
  Did you mean 'getUser'?

src/data/__tests__/userRepo.test.ts:7:10 - error TS2305:
  Module '"../../data/userRepository"' has no exported member 'getUserById'.

src/routes/__tests__/userRoutes.test.ts:22:34 - error TS2339:
  Property 'getUserById' does not exist on type 'UserService'.

Found 3 errors in 3 files.`}
          showLineNumbers={false}
        />

        <p className="text-sm leading-relaxed mt-3" style={{ color: 'var(--color-text-secondary)' }}>
          全部是 Agent A 重命名导致的。修复方案：派发一个针对性的修复 agent：
        </p>

        <CodeBlock
          language="bash"
          title="修复 agent — 只处理重命名导致的断裂"
          code={`# 修复 agent: 把所有 getUserById 引用统一为 getUser
claude -p "The function getUserById was renamed to getUser in src/routes/ \\
and src/data/userRepository.ts. Fix all remaining references:

1. In src/services/userService.ts: change this.repo.getUserById to this.repo.getUser
2. In src/data/__tests__/userRepo.test.ts: update import and usage
3. In src/routes/__tests__/userRoutes.test.ts: update mock and usage

After fixing, run: tsc --noEmit && npm test" \\
  --allowedTools "Read,Edit,Bash,Grep" \\
  --max-turns 10

# 结果:
# tsc --noEmit: 0 errors
# npm test: 74 passed, 0 failed`}
          showLineNumbers={false}
        />

        {/* ── Step 5: 合并 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Step 5: 合并
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          合并三个分支时，在{' '}
          <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>shared/result.ts</code>{' '}
          上出现了冲突——Agent A 和 Agent B 都在文件顶部添加了辅助类型：
        </p>

        <CodeBlock
          language="typescript"
          title="合并冲突 — shared/result.ts"
          code={`// shared/result.ts
export type Result<T, E = AppError> =
  | { ok: true; data: T }
  | { ok: false; error: E };

<<<<<<< routes-branch
// Agent A 添加的：路由层用的 HTTP 响应辅助
export function resultToResponse<T>(res: Response, result: Result<T>) {
  if (result.ok) res.json(result.data);
  else res.status(result.error.statusCode).json({ error: result.error });
}
=======
// Agent B 添加的：服务层用的 Result 构造辅助
export const ok = <T>(data: T): Result<T> => ({ ok: true, data });
export const fail = (code: string, message: string, statusCode = 500): Result<never> =>
  ({ ok: false, error: { code, message, statusCode } });
>>>>>>> services-branch`}
          showLineNumbers={false}
        />

        <p className="text-sm leading-relaxed mt-3" style={{ color: 'var(--color-text-secondary)' }}>
          解决方式很简单——两边的辅助函数都保留，它们不冲突：
        </p>

        <CodeBlock
          language="bash"
          title="解决冲突"
          code={`# 保留两边的辅助函数，删掉冲突标记
# 然后验证:
$ tsc --noEmit   # 0 errors
$ npm test       # 74 passed, 0 failed
$ git add . && git commit -m "refactor: migrate to Result<T> pattern across all layers"`}
          showLineNumbers={false}
        />

        {/* ── 翻车了怎么办 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          翻车了怎么办
        </h3>

        <div className="space-y-4">
          <div
            className="p-4 rounded-lg"
            style={{
              background: 'rgba(248, 113, 113, 0.06)',
              border: '1px solid rgba(248, 113, 113, 0.25)',
            }}
          >
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              问题 1：两个 agent 改了同一个文件
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Agent A 和 Agent B 都修改了{' '}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>shared/utils.ts</code>
              ，合并时产生大量冲突。
            </p>
            <p className="text-sm leading-relaxed mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              <strong style={{ color: 'var(--color-text-primary)' }}>修复：</strong>在计划阶段用{' '}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>grep -rl</code>{' '}
              检查文件归属，确保无重叠。如果某个文件被多个模块依赖，把它提到"共享层"——
              在所有模块 agent 开始之前，先完成共享文件的修改。
            </p>
          </div>

          <div
            className="p-4 rounded-lg"
            style={{
              background: 'rgba(248, 113, 113, 0.06)',
              border: '1px solid rgba(248, 113, 113, 0.25)',
            }}
          >
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              问题 2：接口契约太松，agent 各自解读不同
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              契约写了{' '}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>{'Result<T>'}</code>
              ，但没规定错误码格式。Agent A 用{' '}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>NOT_FOUND</code>
              ，Agent B 用{' '}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>UserNotFound</code>
              ，Agent C 用{' '}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>404</code>。
            </p>
            <p className="text-sm leading-relaxed mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              <strong style={{ color: 'var(--color-text-primary)' }}>修复：</strong>用具体类型而不是泛型。
              在契约中定义{' '}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>
                {'type ErrorCode = "NOT_FOUND" | "UNAUTHORIZED" | "DB_ERROR" | ...'}
              </code>
              ，并附上每个错误码的使用示例。契约越具体，agent 的解读空间越小。
            </p>
          </div>

          <div
            className="p-4 rounded-lg"
            style={{
              background: 'rgba(248, 113, 113, 0.06)',
              border: '1px solid rgba(248, 113, 113, 0.25)',
            }}
          >
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              问题 3：共享 import 文件合并冲突
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              多个 agent 都往{' '}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>shared/result.ts</code>{' '}
              加辅助函数，每次合并都冲突。
            </p>
            <p className="text-sm leading-relaxed mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              <strong style={{ color: 'var(--color-text-primary)' }}>修复：</strong>专门安排一个 "shared types" 步骤先跑。
              把所有共享类型和辅助函数在第一步全部写好，冻结后再启动模块 agent。
              在 agent 的 CONSTRAINT 中明确：{' '}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>
                "Do NOT modify any file in shared/."
              </code>
            </p>
          </div>
        </div>

        {/* ── 4 周调优清单 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          4 周调优清单
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                {['周次', '任务', '目标'].map((h) => (
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
                ['Week 1', '小规模试跑：3 个模块、<20 个文件的重构', '验证 agent 分派 + 契约 + 集成流程是否跑通'],
                ['Week 2', '优化契约粒度，补充集成测试', '消除"契约太松导致各自解读不同"的问题'],
                ['Week 3', '在真实生产级重构上使用（50+ 文件）', '验证规模化后的效果和成本'],
                ['Week 4', '提炼团队模板：标准化契约格式、agent 分派命令、集成验证脚本', '让任何团队成员都能复用'],
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

        {/* ── 验证 ── */}
        <ExerciseCard
          tier="l3"
          title="在你的项目上验证"
          description="选一个你项目中需要跨 3+ 模块修改的重构任务（哪怕是小规模的），用这个多代理协作方案执行。重点关注 agent 之间的接口一致性。"
          checkpoints={[
            '接口契约是否在重构开始前就写好并通过了 tsc --noEmit？',
            '每个 agent 是否只修改了自己负责的目录？',
            '集成验证是否发现了 agent 之间的不一致（并成功修复）？',
            'tsc --noEmit && npm test 是否在最终合并后全部通过？',
            '与单会话重构对比，接口一致性是否有明显提升？',
          ]}
        />
      </section>

      {/* ═══════════════════════════════════════════════
          Section 13.3: 组合技三 — 持续代码健康监控
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          13.3 组合技三：持续代码健康监控
        </h2>

        {/* ── 失败 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          失败场景
        </h3>

        <div
          className="p-5 rounded-lg"
          style={{
            background: 'rgba(248, 113, 113, 0.06)',
            border: '1px solid rgba(248, 113, 113, 0.25)',
          }}
        >
          <div className="text-sm leading-relaxed space-y-3" style={{ color: 'var(--color-text-secondary)' }}>
            <p>
              技术债务悄悄积累。TODO 注释从 20 个涨到 180 个，没人注意到。
              测试覆盖率从 85% 降到 62%，直到某天 CI 报告才发现。
              三个核心依赖已经两年没更新，积累了 47 个已知漏洞。
            </p>
            <p>
              这些问题都不是一天产生的——它们每天增长一点点，
              但没有任何机制在增长初期发出警告。等到发现时，
              修复成本已经从"一个下午"变成了"两个冲刺"。
            </p>
          </div>
        </div>

        {/* ── 诊断 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          诊断
        </h3>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          问题不在于团队不关心代码健康——而在于<strong style={{ color: 'var(--color-text-primary)' }}>没有定期的、自动化的检查机制</strong>。
          人会忘记做周检，会因为忙于功能开发而推迟技术债清理。
          解决方案：用定时任务 + Claude 做自动巡检，指标越线时自动创建 Issue。
        </p>

        {/* ── 方案 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          方案
        </h3>

        <ul className="space-y-2 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <span><strong style={{ color: 'var(--color-text-primary)' }}>定时触发</strong>: Cron 或 GitHub Actions schedule，每天/每周运行</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <span><strong style={{ color: 'var(--color-text-primary)' }}>多维扫描</strong>: TODO/FIXME 趋势、测试覆盖率变化、依赖年龄、复杂度热点</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <span><strong style={{ color: 'var(--color-text-primary)' }}>结构化报告</strong>: 输出 Markdown 报告，保存到 reports/ 目录，便于趋势追踪</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <span><strong style={{ color: 'var(--color-text-primary)' }}>阈值告警</strong>: 指标越线时自动创建 GitHub Issue，不依赖人记得去看报告</span>
          </li>
        </ul>

        {/* ── 完整代码 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          完整代码
        </h3>

        <h4
          className="text-base font-semibold mt-6"
          style={{ color: 'var(--color-text-primary)' }}
        >
          1. 健康监控脚本
        </h4>

        <CodeBlock
          language="bash"
          title="scripts/health-monitor.sh — 代码健康监控"
          code={`#!/bin/bash
# 代码健康监控脚本
# 用法: ./scripts/health-monitor.sh [--alert]
# --alert: 阈值越线时自动创建 GitHub Issue

set -euo pipefail

REPORT_DIR="reports/health"
DATE=$(date +%Y-%m-%d)
REPORT_FILE="$REPORT_DIR/$DATE-health-report.md"
ALERT_MODE=false

if [ "\${1:-}" = "--alert" ]; then
  ALERT_MODE=true
fi

mkdir -p "$REPORT_DIR"

# ═══ 阈值配置 ═══
TODO_THRESHOLD=100        # TODO/FIXME 数量上限
COVERAGE_THRESHOLD=70     # 测试覆盖率下限 (%)
DEP_AGE_THRESHOLD=365     # 依赖最大年龄 (天)
COMPLEXITY_THRESHOLD=20   # 函数复杂度上限

# ═══ Step 1: 收集原始指标 ═══
echo "收集代码健康指标..."

# TODO/FIXME 统计
TODO_COUNT=$(grep -rn "TODO\|FIXME\|HACK\|XXX" src/ --include="*.ts" --include="*.tsx" | wc -l | tr -d ' ')
TODO_DETAILS=$(grep -rn "TODO\|FIXME\|HACK\|XXX" src/ --include="*.ts" --include="*.tsx" | head -20)

# 测试覆盖率
COVERAGE_OUTPUT=$(npx jest --coverage --silent --coverageReporters=json-summary 2>/dev/null || echo "{}")
COVERAGE_PCT=$(echo "$COVERAGE_OUTPUT" | jq -r '.total.lines.pct // 0' 2>/dev/null || echo "0")

# 依赖年龄检查
OUTDATED=$(npm outdated --json 2>/dev/null || echo "{}")
OUTDATED_COUNT=$(echo "$OUTDATED" | jq 'length' 2>/dev/null || echo "0")

# 文件大小热点 (> 300 行的文件)
LARGE_FILES=$(find src/ -name "*.ts" -o -name "*.tsx" | xargs wc -l 2>/dev/null | sort -rn | head -10)

# ═══ Step 2: 用 Claude 生成智能分析 ═══
echo "生成 AI 分析..."

AI_ANALYSIS=$(claude -p --output-format text "你是一个代码健康分析师。基于以下原始数据，给出结构化的健康评估。

## 原始数据

### TODO/FIXME 统计
总数: $TODO_COUNT
示例:
$TODO_DETAILS

### 测试覆盖率
行覆盖率: $COVERAGE_PCT%

### 过时依赖
过时包数量: $OUTDATED_COUNT
详情: $(echo "$OUTDATED" | jq -r 'to_entries[:5] | .[] | \"  \(.key): \(.value.current) → \(.value.latest)\"' 2>/dev/null || echo '无法解析')

### 大文件热点
$LARGE_FILES

## 要求
1. 对每个维度给出 GREEN / YELLOW / RED 状态
2. 识别最需要优先处理的 3 个问题
3. 给出具体可操作的改进建议
4. 总体健康评分 (0-100)

输出纯 Markdown 格式。")

# ═══ Step 3: 生成报告 ═══
cat > "$REPORT_FILE" << REPORT
# 代码健康报告 — $DATE

## 原始指标

| 指标 | 当前值 | 阈值 | 状态 |
|------|--------|------|------|
| TODO/FIXME 数量 | $TODO_COUNT | < $TODO_THRESHOLD | $([ "$TODO_COUNT" -lt "$TODO_THRESHOLD" ] && echo "PASS" || echo "FAIL") |
| 测试覆盖率 | $COVERAGE_PCT% | > $COVERAGE_THRESHOLD% | $(echo "$COVERAGE_PCT $COVERAGE_THRESHOLD" | awk '{print ($1 > $2) ? "PASS" : "FAIL"}') |
| 过时依赖数 | $OUTDATED_COUNT | — | INFO |

## AI 分析

$AI_ANALYSIS

---
*由 health-monitor.sh 自动生成*
REPORT

echo "报告已保存: $REPORT_FILE"

# ═══ Step 4: 阈值告警 ═══
if [ "$ALERT_MODE" = true ]; then
  ALERTS=""

  if [ "$TODO_COUNT" -ge "$TODO_THRESHOLD" ]; then
    ALERTS="$ALERTS\n- TODO/FIXME 数量 ($TODO_COUNT) 超过阈值 ($TODO_THRESHOLD)"
  fi

  COVERAGE_FAIL=$(echo "$COVERAGE_PCT $COVERAGE_THRESHOLD" | awk '{print ($1 < $2) ? "true" : "false"}')
  if [ "$COVERAGE_FAIL" = "true" ]; then
    ALERTS="$ALERTS\n- 测试覆盖率 ($COVERAGE_PCT%) 低于阈值 ($COVERAGE_THRESHOLD%)"
  fi

  if [ -n "$ALERTS" ]; then
    echo "检测到阈值越线，创建 Issue..."
    gh issue create \\
      --title "代码健康告警 — $DATE" \\
      --body "$(cat << ISSUE_BODY
## 告警详情

以下指标超出阈值：
$(echo -e "$ALERTS")

## 详细报告

请查看完整报告: \`$REPORT_FILE\`

## 建议操作

1. 在本周的技术债 sprint 中优先处理以上问题
2. 运行 \`./scripts/health-monitor.sh\` 查看最新报告
3. 修复后重新运行验证

---
*由 health-monitor.sh 自动创建*
ISSUE_BODY
)" \\
      --label "tech-debt,automated"
    echo "Issue 已创建"
  else
    echo "所有指标在阈值范围内，无需告警"
  fi
fi`}
          showLineNumbers={false}
        />

        <h4
          className="text-base font-semibold mt-6"
          style={{ color: 'var(--color-text-primary)' }}
        >
          2. 定时触发配置
        </h4>

        <ConfigExample
          language="yaml"
          title=".github/workflows/health-monitor.yml — 定时触发"
          code={`name: Code Health Monitor

on:
  schedule:
    - cron: '0 9 * * 1'  # 每周一 09:00 UTC
  workflow_dispatch:       # 支持手动触发

permissions:
  contents: write
  issues: write

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - run: npm ci

      - name: Run Health Monitor
        run: bash scripts/health-monitor.sh --alert
        env:
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
          GH_TOKEN: \${{ secrets.GITHUB_TOKEN }}

      - name: Commit Report
        run: |
          git config user.name "health-monitor[bot]"
          git config user.email "bot@noreply"
          git add reports/health/
          git diff --cached --quiet || git commit -m "chore: weekly health report $(date +%Y-%m-%d)"
          git push`}
          annotations={[
            { line: 5, text: '每周一早上自动运行，也可以手动触发' },
            { line: 28, text: '--alert 模式：阈值越线自动创建 Issue' },
            { line: 34, text: '将报告提交到仓库，便于追踪历史趋势' },
          ]}
        />

        <h4
          className="text-base font-semibold mt-6"
          style={{ color: 'var(--color-text-primary)' }}
        >
          3. 报告输出格式
        </h4>

        <CodeBlock
          language="markdown"
          title="reports/health/2025-07-14-health-report.md — 示例输出"
          code={`# 代码健康报告 — 2025-07-14

## 原始指标

| 指标 | 当前值 | 阈值 | 状态 |
|------|--------|------|------|
| TODO/FIXME 数量 | 47 | < 100 | PASS |
| 测试覆盖率 | 78.3% | > 70% | PASS |
| 过时依赖数 | 12 | — | INFO |

## AI 分析

### 各维度状态

| 维度 | 状态 | 说明 |
|------|------|------|
| 代码注释 | GREEN | TODO 数量在可控范围，但有 3 个 FIXME 已存在 > 6 个月 |
| 测试覆盖 | YELLOW | 覆盖率 78% 虽然达标，但 src/payment/ 目录只有 45% |
| 依赖健康 | YELLOW | express 4.18 → 4.21 有安全修复，建议优先升级 |
| 复杂度 | RED | src/services/order.ts 的 processOrder() 圈复杂度 34 |

### 优先处理

1. **src/services/order.ts** — processOrder() 圈复杂度 34，
   建议拆分为 validateOrder / calculateTotal / applyDiscount 三个函数
2. **express 升级** — 4.18 有 2 个已知安全漏洞 (CVE-2024-xxxxx)
3. **支付模块测试** — src/payment/ 覆盖率 45%，低于全局平均

### 总体评分: 72/100

趋势: 上周 68 → 本周 72 (↑ 4)，连续 3 周改善。`}
          showLineNumbers={false}
        />

        {/* ── 投递方式说明 ── */}
        <QualityCallout title="报告投递方式">
          <p>
            健康报告的产出是一个 Markdown 文件。投递到团队有多种方式：
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>提交到 Git 仓库（上面的 workflow 已包含），通过 PR review 查看</li>
            <li>通过团队现有的通知工具转发（Slack webhook、飞书机器人等）</li>
            <li>通过 Channels (research preview) 推送到 Claude Code 的团队频道</li>
            <li>配合 GitHub Actions 的 artifact 功能保存历史</li>
          </ul>
          <p className="mt-2">
            Claude Code 不直接发送邮件或消息。选择你团队已有的投递通道即可。
          </p>
        </QualityCallout>

        {/* ── 验证 ── */}
        <ExerciseCard
          tier="l2"
          title="4 周监控验证"
          description="在你的项目中部署 health-monitor，连续运行 4 周。对比部署前后的技术债趋势。"
          checkpoints={[
            '每周报告是否按时生成？',
            '阈值告警是否在指标越线时正确触发？',
            'AI 分析的优先级建议是否合理？',
            '4 周内团队是否因为报告而提前处理了技术债？',
            '报告的 false positive（不需要关注的告警）比例是否 < 20%？',
          ]}
        />

        {/* ── 翻车了怎么办 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          翻车了怎么办
        </h3>

        <div className="space-y-4">
          <div
            className="p-4 rounded-lg"
            style={{
              background: 'rgba(248, 113, 113, 0.06)',
              border: '1px solid rgba(248, 113, 113, 0.25)',
            }}
          >
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              问题 1：AI 分析说绿灯但 TODO 数明明超标了
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              原始指标显示 TODO 数量 142（超过阈值 100），但 Claude 的分析仍然给出 GREEN 评价。
              原因：指标以散文形式喂给 Claude，模型在长文本中忽略了数字。
            </p>
            <p className="text-sm leading-relaxed mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              <strong style={{ color: 'var(--color-text-primary)' }}>修复：</strong>把指标以结构化数据（JSON）而非散文喂给 Claude。
              在 prompt 中加：{' '}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>
                "Cross-check your analysis against these numbers. If any metric exceeds its threshold, that dimension MUST be YELLOW or RED."
              </code>
            </p>
          </div>

          <div
            className="p-4 rounded-lg"
            style={{
              background: 'rgba(248, 113, 113, 0.06)',
              border: '1px solid rgba(248, 113, 113, 0.25)',
            }}
          >
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              问题 2：npm test --coverage 太慢
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              全量覆盖率测试跑了 12 分钟，GitHub Actions 超时。健康检查本身变成了 CI 瓶颈。
            </p>
            <p className="text-sm leading-relaxed mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              <strong style={{ color: 'var(--color-text-primary)' }}>修复：</strong>用增量覆盖率：{' '}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>
                npx jest --coverage --changedSince=HEAD~50
              </code>
              。只跑最近 50 个 commit 影响的文件的覆盖率。全量覆盖率可以降频到每月一次。
            </p>
          </div>

          <div
            className="p-4 rounded-lg"
            style={{
              background: 'rgba(248, 113, 113, 0.06)',
              border: '1px solid rgba(248, 113, 113, 0.25)',
            }}
          >
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              问题 3：每周创建新 Issue 即使问题一样
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              连续 3 周 TODO 超标，脚本创建了 3 个内容几乎一样的 Issue，团队开始忽略。
            </p>
            <p className="text-sm leading-relaxed mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              <strong style={{ color: 'var(--color-text-primary)' }}>修复：</strong>在创建 Issue 前先查重：
            </p>
            <CodeBlock
              language="bash"
              title="Issue 查重逻辑"
              code={`# 先检查是否已有同类 open issue
EXISTING=$(gh issue list --label "automated,tech-debt" --state open \\
  --json number,title --jq '.[].title' | grep -c "代码健康告警" || true)
if [ "$EXISTING" -gt 0 ]; then
  echo "已有同类 open issue，追加评论而非新建"
  gh issue comment "$(gh issue list --label automated --state open \\
    --json number --jq '.[0].number')" \\
    --body "周报更新 ($DATE): $ALERTS"
else
  gh issue create --title "代码健康告警 — $DATE" ...
fi`}
              showLineNumbers={false}
            />
          </div>

          <div
            className="p-4 rounded-lg"
            style={{
              background: 'rgba(248, 113, 113, 0.06)',
              border: '1px solid rgba(248, 113, 113, 0.25)',
            }}
          >
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              问题 4：jq 解析 Claude 输出失败
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              脚本用{' '}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>jq</code>{' '}
              解析 Claude 的输出，但 Claude 有时候输出的不是纯 JSON（带了 markdown 标记或前导文字），导致 jq 报错脚本崩溃。
            </p>
            <p className="text-sm leading-relaxed mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              <strong style={{ color: 'var(--color-text-primary)' }}>修复：</strong>Claude 的{' '}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>--output-format text</code>{' '}
              输出不保证是纯 JSON。在管道中加防御：{' '}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>
                {'claude -p "..." | jq -r \'.\' 2>/dev/null || echo "parse-error"'}
              </code>
              。更好的做法是用{' '}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>--output-format json</code>{' '}
              并在 prompt 中要求纯 JSON 输出。
            </p>
          </div>
        </div>

        {/* ── 4 周调优清单 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          4 周调优清单
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                {['周次', '任务', '目标'].map((h) => (
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
                ['Week 1', '手动跑 3 次，验证指标采集是否准确', '确认 TODO 统计、覆盖率、依赖检查都能正常产出数据'],
                ['Week 2', '开启 cron 自动触发，确认按时出报告', '验证 GitHub Actions schedule 稳定性，修复权限和超时问题'],
                ['Week 3', '根据团队反馈调阈值', '过松则收紧（比如 TODO 从 100 降到 80），过严则放宽'],
                ['Week 4', '加趋势对比（本周 vs 上周）', '在报告中加 delta 列，让团队看到变化方向而非只看绝对值'],
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
      </section>

      {/* ═══════════════════════════════════════════════
          Section 13.4: 设计你自己的组合技
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          13.4 设计你自己的组合技
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          上面三个 recipe 展示了组合技的构建思路。但你的团队一定有自己的特定需求。
          这一节给你一个通用框架，帮你从零设计自己的组合技。
        </p>

        {/* ── 框架 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          四步设计框架
        </h3>

        <CodeBlock
          language="markdown"
          title="组合技设计框架"
          code={`# 设计你自己的组合技

## Step 1: 定义问题
- 什么重复性工作在消耗团队时间？
- 这个问题的频率是什么？（每次 PR？每天？每周？）
- 目前的解决方式是什么？为什么不够好？

## Step 2: 选择组件
从以下组件库中选取需要的：

| 组件 | 能力 | 来源章节 |
|------|------|----------|
| claude -p | 单次无状态 AI 调用 | Ch09 |
| Hooks (Pre/Post) | 事件驱动的自动触发 | Ch07 |
| 子代理 (Task) | 并行/隔离的独立执行 | Ch08 |
| Plan Mode | 结构化任务分解 | Ch05 |
| CLAUDE.md | 持久化项目知识 | Ch06 |
| worktree | 文件级别的隔离 | Ch08 |
| GitHub Actions | CI/CD 触发和调度 | Ch09 |
| gh CLI | GitHub API 交互 | Ch09 |

## Step 3: 设计连接
- 组件之间如何传递数据？（文件、环境变量、stdout）
- 触发条件是什么？（事件、定时、手动）
- 失败时如何回退？（重试、告警、人工介入）

## Step 4: 定义验证
- 怎么知道这个组合技在正常工作？
- 关键指标是什么？（时间节省、错误减少、覆盖率提升）
- 多久 review 一次效果？`}
          showLineNumbers={false}
        />

        {/* ── 常见问题 → 组件组合表 ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          常见问题与推荐组合
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                {['问题', '推荐组件', '触发方式', '参考'].map((h) => (
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
                ['PR 质量不稳定', 'claude -p x3 + gh pr comment', 'PR event', '13.1'],
                ['大型重构容易出错', '子代理 + worktree + Hook', '手动触发', '13.2'],
                ['技术债悄悄积累', 'claude -p + cron + gh issue', '定时触发', '13.3'],
                ['新人 onboarding 慢', 'CLAUDE.md + 子代理 + PR review', '新 PR 触发', 'Ch06 + 13.1'],
                ['文档与代码不同步', 'Hook(PostToolUse) + claude -p', '每次代码修改', 'Ch07 + Ch09'],
                ['发布流程手动且易出错', 'GitHub Actions + claude -p + Hook', 'Tag 推送', 'Ch09'],
                ['测试总是后补', 'Hook(PreToolUse) + Plan Mode', '每次 Write', 'Ch07 + Ch05'],
                ['跨团队接口经常出问题', '子代理 + 接口合约 + 集成测试', '接口文件变更', '13.2'],
              ].map((row, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-2.5">
                      {j === 0 ? (
                        <strong style={{ color: 'var(--color-text-primary)' }}>{cell}</strong>
                      ) : j === 1 ? (
                        <code
                          className="font-mono text-xs px-1.5 py-0.5 rounded"
                          style={{ background: 'var(--color-bg-tertiary)' }}
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

        <p className="text-sm leading-relaxed mt-4" style={{ color: 'var(--color-text-secondary)' }}>
          <strong style={{ color: 'var(--color-text-primary)' }}>回到 Ch10 的诊断框架：</strong>
          当你面对一个新问题时，先用 Ch10 的"哪个维度出了问题"来定位根因，
          再从上面的组件表中选择对应的组合。不要从工具出发（"我想用子代理"），
          而是从问题出发（"重构总是接口不一致 → 需要接口合约 + 隔离执行 + 集成验证"）。
        </p>

        {/* ── 具体示例 ── */}
        <div
          className="p-5 rounded-lg mt-6"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            具体示例：自动生成 changelog
          </p>
          <div className="text-sm leading-relaxed space-y-2" style={{ color: 'var(--color-text-secondary)' }}>
            <p>
              <strong style={{ color: 'var(--color-text-primary)' }}>问题：</strong>
              手动写 changelog 容易漏掉变更，尤其是多人协作时。
            </p>
            <p>
              <strong style={{ color: 'var(--color-text-primary)' }}>组件：</strong>
              Agent SDK +{' '}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>git log</code>{' '}
              +{' '}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>gh pr create</code>
              。
            </p>
            <p>
              <strong style={{ color: 'var(--color-text-primary)' }}>串联：</strong>
              cron 每周触发 →{' '}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>claude -p</code>{' '}
              读取{' '}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>git log --oneline --since="1 week ago"</code>{' '}
              → 按 feat/fix/refactor 分类生成 changelog 条目 →{' '}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>gh pr create</code>{' '}
              提交 changelog 更新 PR。
            </p>
            <p>
              <strong style={{ color: 'var(--color-text-primary)' }}>验证：</strong>
              对比手动写的 changelog 覆盖率——自动版本是否覆盖了所有合并的 PR？
              是否漏掉了没有遵循 conventional commits 格式的提交？
            </p>
          </div>
        </div>

        {/* ── 练习 ── */}
        <ExerciseCard
          tier="l3"
          title="设计你团队的组合技"
          description="回顾你团队过去一个月最痛苦的重复性工作流程。用四步设计框架设计一个组合技来自动化它。不需要一步到位——先实现最小可用版本，运行 2 周后再迭代。"
          checkpoints={[
            '问题定义是否足够具体（不是"提高代码质量"，而是"PR 的安全漏洞发现率从 20% 提高到 80%"）？',
            '选择的组件是否都是你已经掌握的（先用熟悉的，别同时学新组件和组合它们）？',
            '连接设计中是否有明确的数据流和错误处理？',
            '验证标准是否可量化（数字，不是"更好"）？',
            '是否有回退方案（自动化失败时，手动流程依然可用）？',
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
              <strong style={{ color: 'var(--color-text-primary)' }}>组合技一：多维度 PR Review</strong> —
              将一个 reviewer 不可能同时做好的三个维度（安全、质量、风格）拆成三个并行的{' '}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>claude -p</code> 调用，
              用 effort 分级控制成本和质量。每个 PR 约 $0.15-0.20，远低于漏洞修复成本。
            </p>
            <p>
              <strong style={{ color: 'var(--color-text-primary)' }}>组合技二：多代理重构</strong> —
              用接口合约作为"共享协议"，让多个代理在独立 worktree 中并行重构不同模块。
              PostToolUse Hook 提供即时测试反馈，主 Agent 做跨模块集成验证。
              解决单会话上下文容量不足的核心问题。
            </p>
            <p>
              <strong style={{ color: 'var(--color-text-primary)' }}>组合技三：健康监控</strong> —
              定时运行 <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>claude -p</code> 扫描代码健康指标，
              生成结构化报告，阈值越线时自动创建 Issue。
              把技术债从"发现时已经很严重"变成"增长初期就有预警"。
            </p>
            <p>
              <strong style={{ color: 'var(--color-text-primary)' }}>设计框架</strong> —
              问题 → 组件选择 → 连接设计 → 验证标准。
              从问题出发而非从工具出发，用 Ch10 的诊断框架定位根因，再从组件表中选择组合。
            </p>
          </div>
        </div>

        <QualityCallout title="从 Cookbook 到习惯">
          <p>
            这三个 recipe 是起点，不是终点。真正的价值不在于复制这三个方案，
            而在于<strong style={{ color: 'var(--color-text-primary)' }}>养成组合思维</strong>：
            遇到重复性问题时，先想"这个能不能用 claude -p + Hook + GitHub Actions 自动化"，
            而不是"我再手动做一次"。
            当这种思维变成习惯，你就不再需要 cookbook 了。
          </p>
        </QualityCallout>
      </section>
    </div>
  )
}
