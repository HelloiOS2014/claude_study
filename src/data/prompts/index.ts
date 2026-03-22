export interface PromptTemplate {
  id: string
  category: 'explore' | 'implement' | 'review' | 'debug' | 'plan' | 'constraint'
  title: string
  prompt: string
  variables?: string[]
  scenario: string
  analysis: string
}

export const promptTemplates: PromptTemplate[] = [
  // ═══ 探索类 ═══
  {
    id: 'explore-codebase',
    category: 'explore',
    title: '代码库理解',
    prompt: '阅读以下文件，告诉我你的理解：\n1. {文件列表}\n\n先不要做任何修改。描述：整体架构、数据流、关键依赖。',
    variables: ['文件列表'],
    scenario: '接手新项目或进入不熟悉的模块时',
    analysis: '"先不要做任何修改"约束了工具调用，Claude 只会用 Read 不会用 Edit。指定文件列表避免 Claude 扫描整个项目浪费 token。',
  },
  {
    id: 'explore-bug',
    category: 'explore',
    title: 'Bug 调查',
    prompt: '这段代码在 {条件} 下报错 {错误}。先阅读 {文件} 和它 import 的所有模块，分析 top 3 可能原因，按可能性排序。',
    variables: ['条件', '错误', '文件'],
    scenario: '遇到 bug 但不确定根因时',
    analysis: '"top 3 按可能性排序"迫使 Claude 做优先级判断而非罗列所有可能。指定"import 的所有模块"确保分析范围够但不过大。',
  },
  {
    id: 'explore-architecture',
    category: 'explore',
    title: '架构审查',
    prompt: '阅读项目的核心模块，描述：\n1. 整体架构模式\n2. 数据流向\n3. 关键依赖关系\n4. 潜在的架构风险\n\n只描述不建议修改。',
    variables: [],
    scenario: '评估项目架构健康度时',
    analysis: '"只描述不建议修改"聚焦在分析上。编号步骤确保 Claude 按顺序覆盖每个方面不遗漏。',
  },
  {
    id: 'explore-dependency',
    category: 'explore',
    title: '依赖链分析',
    prompt: '分析 {文件} 的所有依赖链，找出哪些模块会被 {变更描述} 影响。列出影响范围和风险等级。',
    variables: ['文件', '变更描述'],
    scenario: '做大改动前评估影响范围',
    analysis: '明确了分析目标（影响范围）和输出格式（风险等级），避免 Claude 泛泛而谈。',
  },
  {
    id: 'explore-patterns',
    category: 'explore',
    title: '模式识别',
    prompt: '在项目中找到所有 {模式} 的使用方式，总结一致性和不一致之处。如果发现不一致，说明哪种是正确的做法。',
    variables: ['模式'],
    scenario: '统一代码风格或找出不一致的实现时',
    analysis: '"总结一致性和不一致"比"列出所有用法"更有价值。要求 Claude 做判断（哪种正确）而非只列事实。',
  },

  // ═══ 实现类 ═══
  {
    id: 'impl-constrained',
    category: 'implement',
    title: '约束式实现',
    prompt: '按以下约束实现功能：\n{约束列表}\n\n一步一停，每步完成后等我确认再继续。',
    variables: ['约束列表'],
    scenario: '需要精确控制实现方式时',
    analysis: '"一步一停"是最强的控制约束——Claude 真的会在每步后停下等你确认。约束列表提前限定了方案空间。',
  },
  {
    id: 'impl-step',
    category: 'implement',
    title: '单步执行',
    prompt: '按照之前的计划，执行 Step {N}：{具体任务}。完成后停下来，告诉我改了什么、怎么验证。',
    variables: ['N', '具体任务'],
    scenario: 'Plan Mode 后逐步执行时',
    analysis: '"按照之前的计划"锚定上下文，防止 Claude 偏离计划。"怎么验证"确保每步可验证。',
  },
  {
    id: 'impl-refactor',
    category: 'implement',
    title: '安全重构',
    prompt: '重构 {文件} 中的 {函数/模块}，保持所有现有测试通过。先读测试理解预期行为，再重构。完成后跑测试验证。',
    variables: ['文件', '函数/模块'],
    scenario: '重构时确保不破坏现有功能',
    analysis: '"先读测试"确保 Claude 理解预期行为再动手。"保持测试通过"是硬约束不是建议。',
  },
  {
    id: 'impl-migration',
    category: 'implement',
    title: '代码迁移',
    prompt: '将 {文件} 从 {旧模式} 迁移到 {新模式}。要求：\n1. 保持向后兼容\n2. 列出每个改动点和原因\n3. 不引入新依赖',
    variables: ['文件', '旧模式', '新模式'],
    scenario: '技术栈升级或模式迁移时',
    analysis: '三条约束分别防止破坏兼容性、确保可追溯、限制范围蔓延。',
  },
  {
    id: 'impl-tdd',
    category: 'implement',
    title: 'TDD 起手',
    prompt: '为 {功能} 写一个失败的测试。只写测试，不写实现。测试应该验证 {预期行为}。',
    variables: ['功能', '预期行为'],
    scenario: 'TDD 流程的红灯阶段',
    analysis: '"只写测试不写实现"是硬约束。先写测试迫使你明确预期行为。',
  },

  // ═══ 审查类 ═══
  {
    id: 'review-code',
    category: 'review',
    title: '代码审查',
    prompt: 'Review {文件} 的最近改动，关注：\n1. 逻辑正确性和边界情况\n2. 安全漏洞（OWASP Top 10）\n3. 与项目现有风格的一致性\n\n输出格式：\n🔴 必须修复\n🟡 建议修复\n🟢 可选优化',
    variables: ['文件'],
    scenario: '代码提交前的审查',
    analysis: '三级输出格式迫使 Claude 做优先级判断。指定 OWASP Top 10 比"检查安全"更精确。',
  },
  {
    id: 'review-security',
    category: 'review',
    title: '安全扫描',
    prompt: '扫描 {范围} 中的安全问题：\n1. 输入验证缺失\n2. 认证/授权绕过\n3. 敏感数据暴露\n4. 依赖漏洞\n5. 注入风险（SQL/XSS/命令）\n\n每个问题标注严重等级和修复建议。',
    variables: ['范围'],
    scenario: '安全审计或上线前检查',
    analysis: '编号清单确保 Claude 逐项检查不遗漏。"严重等级+修复建议"比"列出问题"更有行动价值。',
  },
  {
    id: 'review-plan',
    category: 'review',
    title: '计划审查',
    prompt: '审查这个实施计划：\n{计划内容}\n\n检查：\n1. 步骤是否完整（有无遗漏）\n2. 依赖关系是否正确\n3. 有没有遗漏的影响范围\n4. 每步的验证方式是否可执行',
    variables: ['计划内容'],
    scenario: 'Plan Mode 产出后的质量检查',
    analysis: '四个检查维度覆盖了计划最常见的问题。"验证方式是否可执行"防止计划只有步骤没有验证。',
  },
  {
    id: 'review-requirements',
    category: 'review',
    title: '需求对照',
    prompt: '对照需求清单逐条检查实现：\n{需求列表}\n\n每条标记：✅ 已实现 / ❌ 未实现 / ⚠️ 部分实现。标注对应的实现文件和行号。',
    variables: ['需求列表'],
    scenario: '功能完成后验证需求覆盖',
    analysis: '三种状态 + 文件行号 = 可追溯的验证报告。比"检查是否实现了"精确得多。',
  },
  {
    id: 'review-architecture',
    category: 'review',
    title: '架构影响评估',
    prompt: '评估 {改动描述} 对项目架构的影响：\n1. 是否引入新的耦合？\n2. 是否违反现有模式？\n3. 长期可维护性如何？\n4. 有没有更简单的方案？',
    variables: ['改动描述'],
    scenario: '大改动前的架构评估',
    analysis: '"有没有更简单的方案"是最有价值的问题——防止过度工程。',
  },

  // ═══ 调试类 ═══
  {
    id: 'debug-systematic',
    category: 'debug',
    title: '系统化调试',
    prompt: '这段代码在 {条件} 下 {实际表现}，预期应该 {预期表现}。\n1. 先阅读相关代码\n2. 列出 top 3 可能原因\n3. 对排名第 1 的给出验证方法\n4. 先不改代码',
    variables: ['条件', '实际表现', '预期表现'],
    scenario: '遇到 bug 需要系统化排查时',
    analysis: '四步结构：先理解（1）→ 假设（2）→ 验证方法（3）→ 不急着改（4）。"先不改代码"防止 Claude 跳过诊断直接修。',
  },
  {
    id: 'debug-performance',
    category: 'debug',
    title: '性能诊断',
    prompt: '{操作} 需要 {当前时间}，目标 < {目标时间}。\n1. 分析性能瓶颈 top 3\n2. 按影响排序\n3. 对最大瓶颈给出 2 个方案并对比\n4. 先不改代码',
    variables: ['操作', '当前时间', '目标时间'],
    scenario: '性能优化时',
    analysis: '给了具体数字（当前 vs 目标），Claude 知道需要多大的改善幅度。"2 个方案对比"强制多角度思考。',
  },
  {
    id: 'debug-regression',
    category: 'debug',
    title: '回归追踪',
    prompt: '{功能} 在最近开始出问题。\n1. 查看 git log 找出最近的相关改动\n2. 分析哪些改动可能导致回归\n3. 给出验证假设的方法',
    variables: ['功能'],
    scenario: '功能突然坏了，怀疑是最近的改动导致',
    analysis: '利用 git 历史定位，比盲目读代码高效得多。',
  },

  // ═══ 规划类 ═══
  {
    id: 'plan-detailed',
    category: 'plan',
    title: '详细实施计划',
    prompt: '为 {任务} 制定实施计划：\n1. 每步改什么文件和改动摘要\n2. 步骤间依赖关系\n3. 每步完成后的验证方式\n\n我要能逐步执行，每步间可以暂停检查。',
    variables: ['任务'],
    scenario: '中等以上复杂度的功能开发',
    analysis: '三要素（文件/依赖/验证）确保计划可执行不是空谈。"逐步执行+暂停"约束了计划粒度。',
  },
  {
    id: 'plan-multi-option',
    category: 'plan',
    title: '多方案对比',
    prompt: '给出实现 {需求} 的 2-3 个方案：\n每个标注：\n- 改动范围（涉及哪些文件）\n- 优缺点\n- 风险点\n- 预估改动量\n\n推荐一个并说明原因。',
    variables: ['需求'],
    scenario: '不确定最佳方案时',
    analysis: '强制 Claude 给多个方案而非只给"最佳"方案。"推荐+理由"让你做选择而非被动接受。',
  },
  {
    id: 'plan-scope',
    category: 'plan',
    title: '影响范围评估',
    prompt: '评估 {任务} 的影响范围：\n1. 涉及哪些文件？\n2. 有哪些风险点？\n3. 有没有我可能没想到的问题？\n4. 是否需要 Plan Mode？',
    variables: ['任务'],
    scenario: '开始任务前快速评估复杂度',
    analysis: '"我可能没想到的问题"最有价值——让 Claude 作为审查者挑战你的假设。',
  },

  // ═══ 约束类 ═══
  {
    id: 'constraint-readonly',
    category: 'constraint',
    title: '只读约束',
    prompt: '只分析不修改。',
    variables: [],
    scenario: '需要 Claude 只做分析不动代码时',
    analysis: '虽然在 Plan Mode 下 Claude 也不能改文件，但在 Normal 模式下这句话能有效约束工具调用。',
  },
  {
    id: 'constraint-step-stop',
    category: 'constraint',
    title: '一步一停',
    prompt: '一步一停，每步完成后等我确认再继续。',
    variables: [],
    scenario: '需要逐步控制执行节奏时',
    analysis: 'Claude 真的会在每步后停下。注意"按步骤执行"不等于"一步一停"——前者可能连续跑。',
  },
  {
    id: 'constraint-ask',
    category: 'constraint',
    title: '不确定就问',
    prompt: '如果不确定就问我，不要猜测。',
    variables: [],
    scenario: '需要 Claude 在模糊地带寻求确认时',
    analysis: '减少幻觉。没有这句话，Claude 倾向于"猜一个合理的"继续干。',
  },
  {
    id: 'constraint-pattern',
    category: 'constraint',
    title: '沿用现有模式',
    prompt: '用项目现有的 {模式名} 模式，不要引入新模式。',
    variables: ['模式名'],
    scenario: '确保一致性时',
    analysis: '锚定到现有代码风格。没有这句，Claude 可能用它认为的"最佳实践"覆盖项目约定。',
  },
  {
    id: 'constraint-scope',
    category: 'constraint',
    title: '范围限定',
    prompt: '只改 {范围}，不要动其他文件。',
    variables: ['范围'],
    scenario: '限制改动范围时',
    analysis: '防止 Claude 顺手"改进"你没让它改的文件。在自动化场景中尤其重要。',
  },
  {
    id: 'constraint-verify',
    category: 'constraint',
    title: '先验证再继续',
    prompt: '改完后先跑 {验证命令}，确认通过再继续下一步。',
    variables: ['验证命令'],
    scenario: '确保每步都有验证时',
    analysis: '把验证从可选变成必须。Claude 会实际运行命令并根据结果决定是否继续。',
  },
]

export function getPromptsByCategory(category: PromptTemplate['category']): PromptTemplate[] {
  return promptTemplates.filter(p => p.category === category)
}

export function getPromptById(id: string): PromptTemplate | undefined {
  return promptTemplates.find(p => p.id === id)
}

export const promptCategories = [
  { id: 'explore' as const, label: '探索类', description: '理解代码，不做修改' },
  { id: 'implement' as const, label: '实现类', description: '精确控制代码生成' },
  { id: 'review' as const, label: '审查类', description: '多维度质量检查' },
  { id: 'debug' as const, label: '调试类', description: '系统化问题排查' },
  { id: 'plan' as const, label: '规划类', description: '方案设计和评估' },
  { id: 'constraint' as const, label: '约束类', description: '可组合的行为控制' },
]
