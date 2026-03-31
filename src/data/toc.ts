export type Tier = 'l1' | 'l2' | 'l3'

export interface Chapter {
  id: string
  number: number
  title: string
  subtitle: string
  tier: Tier
  part: number
  partTitle: string
  partSubtitle: string
  estimatedMinutes: number
  skipCondition: string
  prerequisites: string[]
  hardDependencies: string[]
}

export interface Part {
  number: number
  title: string
  subtitle: string
  description: string
  tier: Tier
  chapters: Chapter[]
}

export const parts: Part[] = [
  {
    number: 1,
    title: '和 AI 对话',
    subtitle: 'Prompt Engineering',
    description: '学会和 Claude Code 对话，理解它的能力边界',
    tier: 'l1',
    chapters: [
      {
        id: 'ch01',
        number: 1,
        title: 'Claude Code 的世界观',
        subtitle: '心智模型、请求生命周期、Token 经济学、模型选型',
        tier: 'l1',
        part: 1,
        partTitle: '和 AI 对话',
        partSubtitle: 'Prompt Engineering',
        estimatedMinutes: 45,
        skipCondition: '你已深入理解 Claude Code 的系统架构、1M 上下文经济和 Harness Engineering 概念',
        prerequisites: [],
        hardDependencies: [],
      },
      {
        id: 'ch02',
        number: 2,
        title: 'Prompt 工程',
        subtitle: '五级 Prompt 阶梯、结构化技巧、effort 级别',
        tier: 'l1',
        part: 1,
        partTitle: '和 AI 对话',
        partSubtitle: 'Prompt Engineering',
        estimatedMinutes: 50,
        skipCondition: '你已掌握 XML 语义边界、effort 级别和结构化 Prompt 技巧',
        prerequisites: ['ch01'],
        hardDependencies: ['ch01'],
      },
      {
        id: 'ch03',
        number: 3,
        title: 'Vibe Coding 的边界',
        subtitle: '一致性退化、Agentic Engineering 转型、三种控制模式、代码审查框架',
        tier: 'l1',
        part: 1,
        partTitle: '和 AI 对话',
        partSubtitle: 'Prompt Engineering',
        estimatedMinutes: 40,
        skipCondition: '你已能判断何时用 Vibe Coding、何时需要精确控制',
        prerequisites: ['ch02'],
        hardDependencies: ['ch01'],
      },
    ],
  },
  {
    number: 2,
    title: '构建驾驭系统',
    subtitle: 'Harness Engineering',
    description: '构建 AI 周围的基础设施——CLAUDE.md 是偏好，Hooks 是保障',
    tier: 'l2',
    chapters: [
      {
        id: 'ch04',
        number: 4,
        title: 'CLAUDE.md + 项目记忆',
        subtitle: '快速模板、注入机制、信噪比优化、Auto Memory',
        tier: 'l2',
        part: 2,
        partTitle: '构建驾驭系统',
        partSubtitle: 'Harness Engineering',
        estimatedMinutes: 60,
        skipCondition: '你已能编写高 ROI 的 CLAUDE.md 并理解 Auto Memory 系统',
        prerequisites: ['ch01'],
        hardDependencies: ['ch01'],
      },
      {
        id: 'ch05',
        number: 5,
        title: 'Plan Mode + 结构化思考',
        subtitle: '四阶段框架 EDPE、验证检查点、API 层约束',
        tier: 'l2',
        part: 2,
        partTitle: '构建驾驭系统',
        partSubtitle: 'Harness Engineering',
        estimatedMinutes: 60,
        skipCondition: '你已能在复杂任务中稳定使用 Plan Mode 的 EDPE 流程',
        prerequisites: ['ch04'],
        hardDependencies: ['ch04'],
      },
      {
        id: 'ch06',
        number: 6,
        title: 'Skills 体系',
        subtitle: 'SKILL.md 格式、动态注入、Plugin 市场、AgentSkills.io',
        tier: 'l2',
        part: 2,
        partTitle: '构建驾驭系统',
        partSubtitle: 'Harness Engineering',
        estimatedMinutes: 50,
        skipCondition: '你已编写过自定义 Skill 并从 Plugin 市场安装过工具',
        prerequisites: ['ch04'],
        hardDependencies: ['ch04'],
      },
      {
        id: 'ch07',
        number: 7,
        title: 'Hooks 自动化',
        subtitle: '21+ 事件、四种 Handler、Auto Mode 门禁、质量流水线、权限深入',
        tier: 'l2',
        part: 2,
        partTitle: '构建驾驭系统',
        partSubtitle: 'Harness Engineering',
        estimatedMinutes: 50,
        skipCondition: '你已搭建过 Hook 质量流水线并配置过权限策略',
        prerequisites: ['ch06'],
        hardDependencies: ['ch06'],
      },
    ],
  },
  {
    number: 3,
    title: 'AI 成为你的团队',
    subtitle: 'Scaling the Harness',
    description: '从单代理到多代理，从终端到基础设施',
    tier: 'l3',
    chapters: [
      {
        id: 'ch08',
        number: 8,
        title: 'Subagent → Agent Teams',
        subtitle: '上下文隔离、五种内置类型、自定义 Agent、多代理协作',
        tier: 'l3',
        part: 3,
        partTitle: 'AI 成为你的团队',
        partSubtitle: 'Scaling the Harness',
        estimatedMinutes: 90,
        skipCondition: '你已自定义过 Subagent 并使用过 Agent Teams 协作',
        prerequisites: ['ch06', 'ch07'],
        hardDependencies: ['ch04'],
      },
      {
        id: 'ch09',
        number: 9,
        title: 'Agent SDK + 程序化接入',
        subtitle: 'Python/TS SDK、CI/CD、定时任务、远程控制',
        tier: 'l3',
        part: 3,
        partTitle: 'AI 成为你的团队',
        partSubtitle: 'Scaling the Harness',
        estimatedMinutes: 70,
        skipCondition: '你已在 CI/CD 管线中集成过 Agent SDK',
        prerequisites: ['ch08'],
        hardDependencies: ['ch08'],
      },
    ],
  },
  {
    number: 4,
    title: 'AI 安全融入组织',
    subtitle: 'Governing the Harness',
    description: '工作流设计、治理体系、风险管控',
    tier: 'l3',
    chapters: [
      {
        id: 'ch10',
        number: 10,
        title: '工作流设计原则',
        subtitle: 'Spec 驱动、上下文隔离、验证循环、方法论案例',
        tier: 'l3',
        part: 4,
        partTitle: 'AI 安全融入组织',
        partSubtitle: 'Governing the Harness',
        estimatedMinutes: 60,
        skipCondition: '你已能从第一性原理设计 AI 辅助工作流',
        prerequisites: ['ch08'],
        hardDependencies: [],
      },
      {
        id: 'ch11',
        number: 11,
        title: '治理、风险与度量',
        subtitle: '四层防御、分级管理、健康指标、成本管控',
        tier: 'l3',
        part: 4,
        partTitle: 'AI 安全融入组织',
        partSubtitle: 'Governing the Harness',
        estimatedMinutes: 70,
        skipCondition: '你已建立了完整的 AI 辅助开发治理体系',
        prerequisites: ['ch10'],
        hardDependencies: [],
      },
    ],
  },
  {
    number: 5,
    title: '进阶',
    subtitle: 'Advanced Patterns',
    description: '让 Claude 指挥 Claude，把 Harness 组件组合成自动化流水线',
    tier: 'l3',
    chapters: [
      {
        id: 'ch12',
        number: 12,
        title: '让 Claude 指挥 Claude',
        subtitle: 'Superpowers 工作流、自动化流水线、团队适配',
        tier: 'l3',
        part: 5,
        partTitle: '进阶',
        partSubtitle: 'Advanced Patterns',
        estimatedMinutes: 70,
        skipCondition: '你已熟练使用 superpowers 或类似自动化工作流',
        prerequisites: ['ch08', 'ch09'],
        hardDependencies: ['ch08'],
      },
      {
        id: 'ch13',
        number: 13,
        title: '高阶组合技',
        subtitle: '多维度 PR Review、大型重构协作、持续健康监控',
        tier: 'l3',
        part: 5,
        partTitle: '进阶',
        partSubtitle: 'Advanced Patterns',
        estimatedMinutes: 60,
        skipCondition: '你已搭建过多组件联动的自动化流水线',
        prerequisites: ['ch12'],
        hardDependencies: ['ch08', 'ch09'],
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

export interface QuickPath {
  label: string
  target: string
  chapters: string[]
  estimatedMinutes: number
}

export const quickPaths: QuickPath[] = [
  {
    label: '30 分钟上手',
    target: '今天就能用',
    chapters: ['ch01', 'ch04'],
    estimatedMinutes: 30,
  },
  {
    label: '个人开发者',
    target: '独立高效使用',
    chapters: ['ch01', 'ch02', 'ch03', 'ch04', 'ch05', 'ch06', 'ch07'],
    estimatedMinutes: 345,
  },
  {
    label: 'Tech Lead 评估',
    target: '决定是否引入团队',
    chapters: ['ch01', 'ch04', 'ch08', 'ch11'],
    estimatedMinutes: 225,
  },
  {
    label: '进阶玩法',
    target: '自动化流水线',
    chapters: ['ch12', 'ch13'],
    estimatedMinutes: 130,
  },
  {
    label: '完整路径',
    target: '系统掌握',
    chapters: allChapters.map(c => c.id),
    estimatedMinutes: allChapters.reduce((sum, c) => sum + c.estimatedMinutes, 0),
  },
]
