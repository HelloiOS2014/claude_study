import type { TreeNode } from '../components/content/DecisionTree'

/* ═══════════════════════════════════════════════
   Skill vs Hook vs CLAUDE.md Decision Tree
   ═══════════════════════════════════════════════
   Used in: Ch06 (primary), potentially Ch04/Ch05 cross-refs
   ═══════════════════════════════════════════════ */

export const skillHookClaudemdTree: TreeNode = {
  id: 'root',
  question: '你想让 Claude 遵循的规则属于哪种类型？',
  description: '根据规则的性质，选择最合适的 Harness 层来实现它。',
  children: [
    {
      label: '偏好或建议',
      node: {
        id: 'preference',
        question: '需要 100% 遵守吗？',
        description:
          '比如"用 single quote"、"commit message 用英文"——如果偶尔不遵守也可以接受，CLAUDE.md 就够了。',
        children: [
          {
            label: '不需要，大多数情况遵守即可',
            node: {
              id: 'claudemd',
              question: 'CLAUDE.md',
              result: {
                text: '写入 CLAUDE.md。把规则作为项目约定写入 CLAUDE.md，Claude 会在大多数情况下遵循。适合代码风格、命名偏好、项目结构等"软性规则"。',
                tier: 'l1',
              },
              description:
                '示例：CLAUDE.md 中写 "Use single quotes for strings" — Claude 会遵循，但不会在你忘记时阻止提交。',
            },
          },
          {
            label: '需要，不能有例外',
            node: {
              id: 'hook-for-preference',
              question: 'Hook（强制执行）',
              result: {
                text: '用 Hook 强制执行。将规则实现为 pre-commit 或 post-save Hook，用 command handler（确定性脚本）做检查。即使 Claude 忘记，Hook 也会拦截。',
                tier: 'l2',
              },
              description:
                '示例：Hook 在 pre-commit 时运行 eslint --rule "quotes: [error, single]" — 不符合规则的代码无法提交。',
            },
          },
        ],
      },
    },
    {
      label: '必须执行的检查',
      node: {
        id: 'check',
        question: '检查逻辑是确定性的，还是需要判断力？',
        description:
          '确定性 = 有明确的通过/失败标准（如 lint 规则、类型检查）；需要判断力 = 要理解上下文才能判断（如安全审查、架构合理性）。',
        children: [
          {
            label: '确定性（脚本能判断对错）',
            node: {
              id: 'hook-command',
              question: 'Hook + command handler',
              result: {
                text: '用 Hook + command handler。编写 shell 脚本做确定性检查，通过 exit code 控制通过/失败。速度快、零歧义、100% 可靠。',
                tier: 'l2',
              },
              description:
                '示例：pre-commit Hook 运行 "npm run typecheck && npm run lint" — 类型错误或 lint 错误直接阻止提交。',
            },
          },
          {
            label: '需要判断力（要理解上下文）',
            node: {
              id: 'hook-agent',
              question: 'Hook + agent handler',
              result: {
                text: '用 Hook + agent handler。让 Claude 子 Agent 执行需要理解力的检查，如安全审查、架构评估。Agent 能读代码、理解意图、给出判断。',
                tier: 'l2',
              },
              description:
                '示例：pre-commit Hook 启动 Agent 审查 diff 中的安全风险 — 能发现"把密钥写在代码里"这类需要理解的问题。',
            },
          },
        ],
      },
    },
    {
      label: '可复用的多步骤工作流',
      node: {
        id: 'workflow',
        question: '由人触发还是 Claude 自动触发？',
        description:
          '人触发 = 用户输入斜杠命令（如 /deploy）主动启动；自动触发 = Claude 在对话中判断需要时自动加载。',
        children: [
          {
            label: '人手动触发（斜杠命令）',
            node: {
              id: 'skill-manual',
              question: 'Skill（手动触发）',
              result: {
                text: '创建 Skill，设置 disable-model-invocation: true。用户通过 /command 手动触发，Claude 不会自动调用。适合部署、发布、数据迁移等需要人类主动发起的流程。',
                tier: 'l3',
              },
              description:
                '示例：/deploy Skill 封装"跑测试 → 构建 → 预发布验证 → 正式发布"全流程，每次 /deploy 都执行完整步骤，不会遗漏。',
            },
          },
          {
            label: 'Claude 自动触发',
            node: {
              id: 'skill-auto',
              question: 'Skill（自动触发）',
              result: {
                text: '创建 Skill，设置 user-invocable: false。Claude 根据 description 字段自动判断何时加载。适合 code review、文档生成等 Claude 能自主判断时机的流程。',
                tier: 'l3',
              },
              description:
                '示例：code-reviewer Skill 的 description 写"Review code changes for security and performance" — Claude 检测到代码变更时自动加载。',
            },
          },
        ],
      },
    },
  ],
}
