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
      </section>

      {/* ═══════════════════════════════════════════════
          Section 13.2: 组合技二 — 大型重构的多代理编排
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          13.2 组合技二：大型重构的多代理编排
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
              团队决定将一个单体 Express 应用重构为模块化架构。涉及 50+ 文件，
              需要修改路由层、服务层、数据访问层的接口。
            </p>
            <p>
              你在一个 Claude Code 会话中开始重构。前 20 个文件改得很顺利，
              但到了第 30 个文件时，Claude 开始忘记之前定义的新接口格式。
              第 40 个文件时，它生成的代码与第 10 个文件的改动产生了接口不兼容。
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
          这是经典的<strong style={{ color: 'var(--color-text-primary)' }}>上下文容量 vs 质量</strong>的 tradeoff。
          单个会话处理 50+ 文件时，上下文窗口被历史对话和文件内容填满。
          Claude 要么开始丢失早期上下文（接口定义），要么注意力被分散到太多文件上导致每个文件的质量下降。
        </p>

        <p className="text-sm leading-relaxed mt-3" style={{ color: 'var(--color-text-secondary)' }}>
          解决方案：<strong style={{ color: 'var(--color-text-primary)' }}>按模块拆分为独立代理</strong>，
          每个代理只负责自己模块的重构，共享一份接口规范作为"合约"。
          这就是 Ch08 多代理 + Ch07 Hooks + Ch05 Plan Mode 的组合。
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
          title="大型重构多代理编排架构"
          code={`Plan Mode → 架构 Spec (按模块拆分 + 接口合约)
  │
  ├─→ Module A Agent (worktree: refactor-routes)
  │     └─ Hook: PostToolUse → 每次 Write/Edit 后自动跑测试
  │
  ├─→ Module B Agent (worktree: refactor-services)
  │     └─ Hook: PostToolUse → 每次 Write/Edit 后自动跑测试
  │
  ├─→ Module C Agent (worktree: refactor-data)
  │     └─ Hook: PostToolUse → 每次 Write/Edit 后自动跑测试
  │
  → 主 Agent: 集成验证
    → 检查跨模块接口一致性
    → 检查类型兼容性
    → 运行全量测试
    → Merge worktrees（按依赖顺序）`}
          showLineNumbers={false}
        />

        {/* ── Step-by-step ── */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          分步详解
        </h3>

        {/* Step 1 */}
        <h4
          className="text-base font-semibold mt-6"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Step 1: Plan Mode — 编写重构规范和接口合约
        </h4>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          在重构前，先用 Plan Mode 定义清晰的模块边界和接口合约。
          这份合约是所有代理的共享 "source of truth"——每个代理只需要遵守合约，
          不需要了解其他模块的实现细节。
        </p>

        <CodeBlock
          language="markdown"
          title="docs/refactor-spec.md — 重构规范（Plan Mode 产出）"
          code={`# Express 单体 → 模块化重构规范

## 模块划分
- Module A: 路由层 (src/routes/) — 17 个文件
- Module B: 服务层 (src/services/) — 22 个文件
- Module C: 数据层 (src/data/) — 14 个文件

## 接口合约

### 路由层 → 服务层
\`\`\`typescript
// 所有 Service 必须实现的标准接口
interface ServiceResult<T> {
  success: boolean
  data?: T
  error?: { code: string; message: string }
}

// 服务方法签名规范
type ServiceMethod<TInput, TOutput> = (
  input: TInput,
  context: RequestContext
) => Promise<ServiceResult<TOutput>>
\`\`\`

### 服务层 → 数据层
\`\`\`typescript
// 数据访问统一接口
interface Repository<T> {
  findById(id: string): Promise<T | null>
  findMany(filter: FilterInput): Promise<PaginatedResult<T>>
  create(data: CreateInput<T>): Promise<T>
  update(id: string, data: UpdateInput<T>): Promise<T>
  delete(id: string): Promise<void>
}
\`\`\`

## 每个模块的验收标准
1. 所有文件符合新接口合约
2. 模块内测试全部通过
3. 不依赖其他模块的实现细节（只依赖接口）
4. TypeScript 类型检查通过（零 any）`}
          showLineNumbers={false}
        />

        {/* Step 2 */}
        <h4
          className="text-base font-semibold mt-6"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Step 2: Agent 分派 — 每个模块一个独立代理
        </h4>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          使用 <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>Task</code> 工具
          分派子代理，每个代理在独立的 worktree 中工作，互不干扰。
        </p>

        <CodeBlock
          language="markdown"
          title="Agent 分派模板（主 Agent 执行）"
          code={`# ── 分派 Module A Agent ──────────────────────
Task: 重构路由层

你负责重构 src/routes/ 目录下的 17 个路由文件。

## 接口合约
（粘贴 refactor-spec.md 中的路由层 → 服务层接口定义）

## 具体要求
1. 每个路由文件改为调用 Service 层的标准接口
2. 移除路由中的直接数据库访问
3. 错误处理统一使用 ServiceResult.error
4. 每改完一个文件，运行 npm test -- --testPathPattern=routes

## 禁止事项
- 不要修改 src/services/ 或 src/data/ 中的任何文件
- 不要改变 API 的外部行为（请求/响应格式不变）

## 验收标准
- npm test -- --testPathPattern=routes 全部通过
- tsc --noEmit 无错误
- 无 any 类型

---

# ── 分派 Module B Agent ──────────────────────
Task: 重构服务层

你负责重构 src/services/ 目录下的 22 个服务文件。

## 接口合约
（粘贴完整接口定义：上游路由层接口 + 下游数据层接口）

## 具体要求
1. 每个 Service 实现 ServiceResult<T> 返回类型
2. 每个 Service 方法符合 ServiceMethod<TInput, TOutput> 签名
3. 调用数据层时使用 Repository<T> 接口
4. 每改完一个文件，运行 npm test -- --testPathPattern=services

## 禁止事项
- 不要修改 src/routes/ 或 src/data/ 中的任何文件
- 不要绕过 Repository 接口直接写 SQL

## 验收标准
- npm test -- --testPathPattern=services 全部通过
- tsc --noEmit 无错误

---

# ── 分派 Module C Agent ──────────────────────
Task: 重构数据层

你负责重构 src/data/ 目录下的 14 个数据访问文件。

## 接口合约
（粘贴 服务层 → 数据层接口定义）

## 具体要求
1. 每个数据访问类实现 Repository<T> 接口
2. 统一使用 parameterized query（消除 SQL 拼接）
3. 添加连接池管理
4. 每改完一个文件，运行 npm test -- --testPathPattern=data

## 禁止事项
- 不要修改 src/routes/ 或 src/services/ 中的任何文件
- 不要在数据层处理业务逻辑

## 验收标准
- npm test -- --testPathPattern=data 全部通过
- tsc --noEmit 无错误`}
          showLineNumbers={false}
        />

        {/* Step 3 */}
        <h4
          className="text-base font-semibold mt-6"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Step 3: Per-module Hook — 每次文件改动后自动测试
        </h4>

        <ConfigExample
          language="json"
          title="settings.json — 重构专用 Hook 配置"
          code={`{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "bash -c 'FILE=\"$CLAUDE_FILE_PATH\"; if [[ \"$FILE\" == src/routes/* ]]; then npm test -- --testPathPattern=routes --silent 2>&1 | tail -5; elif [[ \"$FILE\" == src/services/* ]]; then npm test -- --testPathPattern=services --silent 2>&1 | tail -5; elif [[ \"$FILE\" == src/data/* ]]; then npm test -- --testPathPattern=data --silent 2>&1 | tail -5; fi'",
        "description": "每次文件改动后自动运行对应模块的测试"
      },
      {
        "matcher": "Write|Edit",
        "command": "bash -c 'npx tsc --noEmit --pretty 2>&1 | head -20'",
        "description": "每次改动后检查 TypeScript 类型"
      }
    ]
  }
}`}
          annotations={[
            { line: 5, text: '根据文件路径自动判断属于哪个模块，运行对应的测试子集' },
            { line: 8, text: '类型检查确保接口合约被正确遵守，防止跨模块类型不一致' },
          ]}
        />

        <QualityCallout title="为什么用 PostToolUse 而不是最后统一跑测试？">
          <p>
            如果等 22 个文件全部改完再跑测试，一旦第 5 个文件引入了接口不兼容，
            后面 17 个文件的改动全部要返工。PostToolUse Hook 确保每个文件改动后立即验证，
            错误在第一时间被捕获。这就是 Ch07 讲的"<strong style={{ color: 'var(--color-text-primary)' }}>即时反馈循环</strong>"。
          </p>
        </QualityCallout>

        {/* Step 4 */}
        <h4
          className="text-base font-semibold mt-6"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Step 4: 集成验证 — 主 Agent 检查跨模块一致性
        </h4>

        <CodeBlock
          language="markdown"
          title="集成验证提示词（主 Agent 执行）"
          code={`所有三个模块的重构已完成。请执行集成验证：

## 验证步骤

1. **接口一致性检查**
   - 路由层调用的 Service 方法签名是否与 Service 层实现匹配？
   - Service 层调用的 Repository 方法是否与数据层实现匹配？
   - 检查所有 import 路径是否正确

2. **类型兼容性检查**
   运行: npx tsc --noEmit
   目标: 零错误

3. **全量测试**
   运行: npm test
   目标: 所有测试通过，无跳过的测试

4. **接口合约审查**
   对照 docs/refactor-spec.md 中的接口定义，
   逐一验证每个模块是否完全遵守合约。

## 输出格式
- PASS: 所有检查通过，可以进入 merge 阶段
- FAIL + 详细问题列表: 需要修复后重新验证`}
          showLineNumbers={false}
        />

        {/* Step 5 */}
        <h4
          className="text-base font-semibold mt-6"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Step 5: Merge — 按依赖顺序合并 worktrees
        </h4>

        <CodeBlock
          language="bash"
          title="Worktree 合并脚本"
          code={`#!/bin/bash
# 按依赖顺序合并三个模块的 worktree
# 依赖链: data → services → routes (底层先合并)

set -euo pipefail

MAIN_BRANCH="refactor-main"

echo "=== Step 1: 合并数据层 ==="
git merge refactor-data --no-ff -m "refactor: 数据层 Repository 接口重构"
npm test -- --testPathPattern=data
echo "数据层合并完成，测试通过"

echo "=== Step 2: 合并服务层 ==="
git merge refactor-services --no-ff -m "refactor: 服务层 ServiceResult 接口重构"
npm test -- --testPathPattern='(data|services)'
echo "服务层合并完成，跨层测试通过"

echo "=== Step 3: 合并路由层 ==="
git merge refactor-routes --no-ff -m "refactor: 路由层标准化接口调用"
npm test
echo "路由层合并完成，全量测试通过"

echo "=== Step 4: 最终验证 ==="
npx tsc --noEmit
npm test -- --coverage
echo "全量类型检查 + 测试通过，重构完成"

echo "=== 清理 worktrees ==="
git worktree remove ../refactor-routes
git worktree remove ../refactor-services
git worktree remove ../refactor-data`}
          showLineNumbers={false}
        />

        <p className="text-sm leading-relaxed mt-3" style={{ color: 'var(--color-text-secondary)' }}>
          关键：每次合并后都运行累积测试（不只是当前模块）。
          合并服务层后要跑 data + services 的测试，确保跨层接口兼容。
          只有在全量测试通过后才合并路由层。
        </p>

        {/* ── 验证 ── */}
        <ExerciseCard
          tier="l3"
          title="在你的项目上验证"
          description="选一个你项目中需要跨 3+ 模块修改的重构任务（哪怕是小规模的），用这个多代理编排方案执行。完成后检查以下清单。"
          checkpoints={[
            '接口合约文档是否在重构开始前就定义清楚了？',
            '每个代理是否只修改了自己负责的模块？',
            '所有测试是否通过（包括跨模块集成测试）？',
            '代码风格是否在三个模块间保持一致？',
            '与单会话重构对比，总时间和接口一致性是否有提升？',
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
| GitHub Actions | CI/CD 触发和编排 | Ch09 |
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
