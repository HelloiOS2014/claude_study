export type Tier = 'l1' | 'l2' | 'l3'

export interface Chapter {
  id: string
  number: number
  title: string
  subtitle: string
  tier: Tier
  part: number
  partTitle: string
  estimatedMinutes: number
  skipCondition: string
  prerequisites: string[]
}

export interface Part {
  number: number
  title: string
  description: string
  tier: Tier
  chapters: Chapter[]
}

export const parts: Part[] = [
  {
    number: 0,
    title: '认知基础',
    description: '理解 Claude Code 的底层世界',
    tier: 'l1',
    chapters: [
      {
        id: 'ch00',
        number: 0,
        title: 'Claude Code 的底层世界',
        subtitle: '一条请求的完整旅程、上下文经济学、模型与权限',
        tier: 'l1',
        part: 0,
        partTitle: '认知基础',
        estimatedMinutes: 45,
        skipCondition: '你已深入理解 Claude Code 的系统架构和 token 经济模型',
        prerequisites: [],
      },
    ],
  },
  {
    number: 1,
    title: '编码阶段介入',
    description: 'AI 介入开发最后环节——编码实现',
    tier: 'l1',
    chapters: [
      {
        id: 'ch01',
        number: 1,
        title: '用 AI 写代码：从对话到精确控制',
        subtitle: 'Prompt 工程、Token 效率、约束语',
        tier: 'l1',
        part: 1,
        partTitle: '编码阶段介入',
        estimatedMinutes: 60,
        skipCondition: '你已掌握 Claude Code 的 Prompt 工程和上下文管理策略',
        prerequisites: ['ch00'],
      },
      {
        id: 'ch02',
        number: 2,
        title: '用 AI 改代码：重构、调试与优化',
        subtitle: 'Vibe Coding 边界、渐进式控制、Slash 命令',
        tier: 'l1',
        part: 1,
        partTitle: '编码阶段介入',
        estimatedMinutes: 50,
        skipCondition: '你已能判断何时用 Vibe Coding、何时需要精确控制',
        prerequisites: ['ch01'],
      },
    ],
  },
  {
    number: 2,
    title: '设计阶段介入',
    description: 'AI 介入方案设计、规范建立、自动化搭建',
    tier: 'l2',
    chapters: [
      {
        id: 'ch03',
        number: 3,
        title: '用 AI 做方案设计：Plan Mode + 结构化思考',
        subtitle: '四阶段框架、Extended Thinking、决策树',
        tier: 'l2',
        part: 2,
        partTitle: '设计阶段介入',
        estimatedMinutes: 70,
        skipCondition: '你已能在复杂任务中稳定使用 Plan Mode 并知道何时不该用',
        prerequisites: ['ch02'],
      },
      {
        id: 'ch04',
        number: 4,
        title: '用 AI 建团队规范：CLAUDE.md + 项目记忆',
        subtitle: '注入机制、Auto Memory、团队治理',
        tier: 'l2',
        part: 2,
        partTitle: '设计阶段介入',
        estimatedMinutes: 50,
        skipCondition: '你已能编写高质量 CLAUDE.md 并建立团队治理流程',
        prerequisites: ['ch03'],
      },
      {
        id: 'ch05',
        number: 5,
        title: '用 AI 做自动化：Hooks + Skills',
        subtitle: '事件模型、四种 Hook 类型、自定义 Skill、Plugin',
        tier: 'l2',
        part: 2,
        partTitle: '设计阶段介入',
        estimatedMinutes: 80,
        skipCondition: '你已搭建过 Hook 自动化流水线和自定义 Skill',
        prerequisites: ['ch04'],
      },
    ],
  },
  {
    number: 3,
    title: '需求与架构阶段介入',
    description: 'AI 介入技术调研、架构决策、全流程管理',
    tier: 'l3',
    chapters: [
      {
        id: 'ch06',
        number: 6,
        title: '用 AI 做技术调研：Subagent 并行探索',
        subtitle: '上下文隔离、Worktree、持久记忆、成本控制',
        tier: 'l3',
        part: 3,
        partTitle: '需求与架构阶段介入',
        estimatedMinutes: 70,
        skipCondition: '你已能自定义 Subagent 并用 Worktree 隔离做并行开发',
        prerequisites: ['ch05'],
      },
      {
        id: 'ch07',
        number: 7,
        title: '用 AI 做架构决策：多角度分析与验证',
        subtitle: 'Agent Teams、MCP、竞争假设、多维审查',
        tier: 'l3',
        part: 3,
        partTitle: '需求与架构阶段介入',
        estimatedMinutes: 90,
        skipCondition: '你已使用过 Agent Teams 和 MCP 做多维度架构验证',
        prerequisites: ['ch06'],
      },
      {
        id: 'ch08',
        number: 8,
        title: '用 AI 管理全流程：从需求到交付',
        subtitle: '社区方法论、CI/CD、SDK、Git Worktree',
        tier: 'l3',
        part: 3,
        partTitle: '需求与架构阶段介入',
        estimatedMinutes: 90,
        skipCondition: '你已能组合多种方法论和工具覆盖完整开发生命周期',
        prerequisites: ['ch07'],
      },
    ],
  },
  {
    number: 4,
    title: '企业实践',
    description: '风险、治理与落地',
    tier: 'l3',
    chapters: [
      {
        id: 'ch09',
        number: 9,
        title: '风险、治理与落地',
        subtitle: '质量保障、分级管理、度量体系、安全、落地路线图',
        tier: 'l3',
        part: 4,
        partTitle: '企业实践',
        estimatedMinutes: 60,
        skipCondition: '你已建立了完整的 AI 辅助开发治理体系',
        prerequisites: ['ch08'],
      },
    ],
  },
]

export const allChapters = parts.flatMap(p => p.chapters)

export function getChapter(id: string): Chapter | undefined {
  return allChapters.find(c => c.id === id)
}

export function getTierColor(tier: Tier): string {
  const colors = { l1: 'var(--color-tier-l1)', l2: 'var(--color-tier-l2)', l3: 'var(--color-tier-l3)' }
  return colors[tier]
}

export function getTierLabel(tier: Tier): string {
  const labels = { l1: 'L1 基础', l2: 'L2 进阶', l3: 'L3 高阶' }
  return labels[tier]
}
