import type { TreeNode } from '../components/content/DecisionTree'

/* ═══════════════════════════════════════════════
   Skill vs Hook vs CLAUDE.md Decision Tree
   ═══════════════════════════════════════════════
   Used in: Ch06 (primary), potentially Ch04/Ch05 cross-refs
   ═══════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════
   Diagnostic Tree: Claude 行为异常排查
   ═══════════════════════════════════════════════
   Used in: Ch10 (primary)
   ═══════════════════════════════════════════════ */

export const diagnosticTree: TreeNode = {
  id: 'diag-root',
  question: 'Claude 的表现哪里不对？',
  description: '根据观察到的症状，沿决策树定位根因并找到修复方案。',
  children: [
    {
      label: '忽略了项目规范',
      node: {
        id: 'diag-ignore-spec',
        question: '检查 Context 使用情况：/cost 或 /status 查看上下文占用比例',
        description:
          'CLAUDE.md 里写了规则但 Claude 没遵循——先看上下文是否已经被稀释。',
        children: [
          {
            label: '上下文占用 >70%',
            node: {
              id: 'diag-context-dilution',
              question: '上下文稀释 — 规则被"淹没"了',
              result: {
                text: '上下文窗口接近饱和时，早期注入的 CLAUDE.md 规则会被大量后续内容稀释。修复：(1) 运行 /compact 压缩上下文；(2) 把大任务拆分到 Subagent 执行（Ch08），每个 Subagent 获得新鲜上下文；(3) 在 PreCompact Hook 中保留关键规则。',
                tier: 'l2',
              },
            },
          },
          {
            label: '上下文占用 <70%',
            node: {
              id: 'diag-weak-wording',
              question: '规则表述太弱 — Claude 把它当成"建议"',
              result: {
                text: '上下文充足但规则仍被忽略，说明措辞缺乏约束力。修复：(1) 升级措辞——用 MUST / NEVER / ALWAYS 替代"建议"、"尽量"（Ch03 控制等级）；(2) 对关键规则升级为 Hook 强制执行（Ch07），让确定性脚本做最后把关。',
                tier: 'l1',
              },
            },
          },
        ],
      },
    },
    {
      label: '做了不该做的事',
      node: {
        id: 'diag-forbidden',
        question: '检查 CLAUDE.md 中是否有明确的 deny 规则？',
        description:
          '比如修改了不该动的文件、运行了危险命令——需要看是缺少禁令还是禁令没生效。',
        children: [
          {
            label: '没有 deny 规则',
            node: {
              id: 'diag-add-deny',
              question: '缺少禁令 — Claude 不知道不能做',
              result: {
                text: '没写禁令等于默认允许。修复：在 CLAUDE.md 中添加明确的 deny 规则，格式为 "NEVER: [行为]"。示例：\n- NEVER modify files in /db/migrations/ without explicit approval\n- NEVER run rm -rf or git push --force\n- NEVER commit .env or credentials files',
                tier: 'l1',
              },
            },
          },
          {
            label: '有 deny 规则但仍然违反了',
            node: {
              id: 'diag-deny-failed',
              question: '禁令失效 — 需要升级为 Hook 强制执行',
              result: {
                text: 'CLAUDE.md 中的 deny 规则是"软性"的——Claude 会尽量遵守但无法 100% 保证。修复：(1) 将关键禁令升级为 PreToolUse Hook（Ch07），用确定性脚本拦截；(2) 对高危操作（如 Bash 命令）配置 allowedTools 白名单限制工具范围。',
                tier: 'l2',
              },
            },
          },
        ],
      },
    },
    {
      label: '输出质量下降',
      node: {
        id: 'diag-quality-drop',
        question: '质量下降是从什么时候开始的？',
        description:
          '关键区分：一开始就不好 vs 后来才变差，原因完全不同。',
        children: [
          {
            label: '前 5 轮就开始 — 一上来就不好',
            node: {
              id: 'diag-prompt-quality',
              question: 'Prompt 质量问题 — 输入不够好',
              result: {
                text: '早期质量就差说明不是上下文衰减，而是指令本身有问题。修复：(1) 检查 CLAUDE.md 是否有矛盾规则（Ch04）；(2) 使用 Plan Mode 先让 Claude 理解需求再动手（Ch05 EDPE 流程）；(3) 提供具体示例而不是抽象描述——"像 X 文件中的 Y 函数那样"比"写出优雅的代码"有效 10 倍。',
                tier: 'l1',
              },
            },
          },
          {
            label: '15 轮以上才开始 — 前面还行后面变差',
            node: {
              id: 'diag-context-decay',
              question: '上下文衰减 — 窗口被历史信息污染',
              result: {
                text: '经典上下文衰减症状：注意力随窗口填充而分散。修复：(1) 及时 /compact 压缩（配置 PreCompact Hook 保留关键信息）；(2) 大任务拆分为 Subagent 执行（Ch08），每个获得新鲜 200K 窗口；(3) 超过 20 轮的任务考虑开新 session 并传递 HANDOFF.md。',
                tier: 'l2',
              },
            },
          },
        ],
      },
    },
    {
      label: '太慢或太贵',
      node: {
        id: 'diag-perf',
        question: '检查：主要瓶颈在哪？',
        description:
          '慢和贵的根因不同——先定位是延迟问题还是 Token 消耗问题。',
        children: [
          {
            label: '响应延迟高 — 每次回复要等很久',
            node: {
              id: 'diag-latency',
              question: '延迟优化',
              result: {
                text: '修复：(1) 降低 reasoning effort——对简单任务使用 effort: "low"（Ch03 控制等级），减少思考 Token；(2) 指导 Claude 用 Grep 替代 Read 做搜索（更快定位文件）；(3) 检查 Subagent 数量——过多并行 Subagent 会竞争 API 限额导致排队。',
                tier: 'l1',
              },
            },
          },
          {
            label: 'Token 消耗大 — 费用高',
            node: {
              id: 'diag-cost',
              question: '成本优化',
              result: {
                text: '修复：(1) 检查是否有不必要的循环（maxIterations 是否设了上限？）；(2) Subagent 的 maxTurns 是否合理（建议 3-10 轮，不要 50 轮）；(3) 大量读文件场景改用 Grep + Glob 替代全文 Read；(4) 考虑对非核心任务用 Haiku 替代 Sonnet（Ch09 SDK 中 model 参数）。',
                tier: 'l3',
              },
            },
          },
        ],
      },
    },
  ],
}

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
