export interface BenchmarkEntry {
  label: string
  value: number
  unit: string
  source?: string
}

export const tokenCosts: BenchmarkEntry[] = [
  { label: '读 500 行 TS 文件', value: 800, unit: 'tokens' },
  { label: '一次 Grep 搜索', value: 200, unit: 'tokens' },
  { label: 'Bash 固定开销', value: 245, unit: 'tokens' },
  { label: '一轮对话（平均）', value: 500, unit: 'tokens' },
  { label: 'Subagent 调用 (Haiku)', value: 2000, unit: 'tokens' },
  { label: '10 轮对话后总计', value: 8000, unit: 'tokens' },
  { label: 'Tool Search 优化前', value: 72000, unit: 'tokens' },
  { label: 'Tool Search 优化后', value: 8700, unit: 'tokens' },
]

export const dailyCosts: BenchmarkEntry[] = [
  { label: '人均日消耗（均值）', value: 6, unit: 'USD' },
  { label: '人均日消耗（P90）', value: 12, unit: 'USD' },
  { label: '人均月消耗（Sonnet）', value: 150, unit: 'USD' },
  { label: '人均月消耗（Opus）', value: 300, unit: 'USD' },
  { label: 'CI PR 审查成本', value: 0.15, unit: 'USD/PR' },
  { label: '50 PRs/week 月成本', value: 30, unit: 'USD' },
]

export const qualityMetrics: BenchmarkEntry[] = [
  { label: 'AI 代码 Bug 率 vs 人类', value: 1.7, unit: 'x', source: 'CodeRabbit 2026' },
  { label: 'AI 代码安全漏洞率', value: 48, unit: '%', source: 'Multiple studies' },
  { label: '密钥泄露率 vs 基线', value: 2, unit: 'x', source: 'GitGuardian 2026' },
  { label: '重复代码增长', value: 8, unit: 'x', source: 'GitClear 2024' },
  { label: 'AI 辅助理解力下降', value: 17, unit: '%', source: 'Anthropic research' },
  { label: '使用不理解代码的开发者', value: 59, unit: '%', source: 'Clutch 2025' },
  { label: '软件交付稳定性下降', value: 7.2, unit: '%', source: 'DORA 2026' },
]

export const contextWindow: BenchmarkEntry[] = [
  { label: '200K 窗口实际可用', value: 167000, unit: 'tokens' },
  { label: '内部缓冲区', value: 33000, unit: 'tokens' },
  { label: 'Auto-compact 触发点', value: 95, unit: '%' },
  { label: 'Compact 压缩率', value: 70, unit: '%' },
  { label: '质量衰减起始点', value: 30, unit: '%' },
  { label: '缓存命中率（正常使用）', value: 90, unit: '%' },
]

export const modelPricing: BenchmarkEntry[] = [
  { label: 'Haiku 输入', value: 0.80, unit: 'USD/M tokens' },
  { label: 'Haiku 输出', value: 4.00, unit: 'USD/M tokens' },
  { label: 'Sonnet 输入', value: 3.00, unit: 'USD/M tokens' },
  { label: 'Sonnet 输出', value: 15.00, unit: 'USD/M tokens' },
  { label: 'Opus 输入', value: 15.00, unit: 'USD/M tokens' },
  { label: 'Opus 输出', value: 75.00, unit: 'USD/M tokens' },
]
