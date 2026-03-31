/**
 * Centralized industry statistics for the tutorial.
 * Update this file when data changes — all chapters reference it.
 */
export const industryStats = {
  /** Developer adoption rate for AI coding tools (2026) */
  aiToolAdoption: '84%',
  /** Claude Code market share among AI coding agents */
  claudeCodeShare: '40.8%',
  /** AI-generated code logic error multiplier vs human code */
  logicErrorMultiplier: '1.75x',
  /** Percentage of AI-generated code with security vulnerabilities */
  securityVulnerabilityRate: '45%',
  /** Code churn rate increase with AI tools */
  codeChurnIncrease: '41%',
  /** Gartner forecast: AI-generated code share by end of 2026 */
  gartnerAiCodeForecast: '60%',
  /** SWE-bench improvement from Hooks alone (LangChain data) */
  hooksBenchImprovement: '13.7%',
  /** Auto Mode: percentage of permission prompts users approve */
  autoModeApprovalRate: '93%',
} as const

export type IndustryStat = keyof typeof industryStats
