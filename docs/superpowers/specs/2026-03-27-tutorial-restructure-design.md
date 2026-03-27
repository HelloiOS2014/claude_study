# Claude Code 教程重构设计文档

> 日期：2026-03-27
> 状态：待用户确认

---

## 一、背景与动机

### 当前教程的问题

本教程是一个面向中文开发者的 Claude Code 交互式教学网站（React SPA），原有 10 章（Ch0-Ch9），按"AI 介入开发阶段"组织。经过全面评估，发现以下核心问题：

**结构性问题：**
- "AI 介入时机"叙事框架在内容扩展后被撑变形——Skills、Hooks、Plugin 无法自然归入"设计阶段"
- Ch5 塞了三个主题（Hooks + Skills + Plugin = 80 分钟），Ch7 塞了两个（Agent Teams + MCP），Ch8 塞了七个方法论但都浅尝辄止
- 严格线性依赖链（Ch0→Ch1→...→Ch9），不允许跳跃阅读
- Ch0 理论先行，新手第一眼看到系统提示 7 层优先级，门槛过高

**内容过时问题：**
- 上下文窗口从 200K 变为 1M（Opus 4.6），Token 经济学的核心数字和论述前提全部失效
- Hook 事件从 9 个扩展到 21+，Handler 从 3 种扩展到 4 种，新增条件执行和异步 Hook
- Skills 从 Ch5 中的一小节发展为完整体系（SKILL.md + frontmatter + 动态注入 + AgentSkills.io 标准）
- Plugin 生态完全缺失（百余个官方和合作伙伴 Plugin 的市场）
- Agent SDK 从一句话提及变为 Python/TS 完整包 + CI/CD 集成
- MCP 被过度强调——它现在是 Plugin 的底层实现细节，不应独立成章
- 社区方法论已大幅演进（GSD 变为独立 CLI，BMAD 通过 Skills 包集成）
- 成本基线、模型定价等数字过时

**缺失内容：**
- Harness Engineering（2026 年行业核心范式）完全未提及
- effort 级别（low/medium/high/max）没有系统讲解
- 调试/排错内容缺失
- Remote Control、Cloud Scheduled Tasks、/loop 等新功能未覆盖
- IDE 集成差异（VS Code / JetBrains / Xcode / Web / Desktop）未说明
- Prompt Caching 未覆盖

### 目标受众

两类读者兼顾：
- **个人开发者**：从零掌握 Claude Code，读完 Part 1 + Part 2 即可高效日常使用
- **Tech Lead / 工程经理**：评估和推动团队引入 Claude Code，重点在 Part 3 + Part 4

### 设计原则

1. **体验先行**：先动手再讲理论，不以抽象框架开篇
2. **Harness Engineering 为叙事骨架**：三个时代（Prompt → Context → Harness）作为教程路线图
3. **框架区与参考区分离**：正文讲思维模型（稳定），章末参考区放具体数字/API 细节（易变，标注版本号）
4. **非线性依赖**：硬依赖最少化，允许多种阅读路径
5. **方法论教原则不教工具**：社区方法论作为案例出现，不作为教学主体

---

## 二、叙事框架

### 三个时代（全教程的思维主线）

| 时代 | 时期 | 核心问题 | 优化什么 | 人的角色 |
|------|------|----------|----------|----------|
| Prompt Engineering | 2022-2024 | "我该怎么问？" | 指令本身 | 提问者 |
| Context Engineering | 2025 | "模型该看到什么？" | 输入窗口 | 架构师 |
| Harness Engineering | 2026 | "整个环境该怎么设计？" | 模型周围的系统 | 系统设计师 |

核心公式：**Agent = Model + Harness**

Harness 的组成：
- CLAUDE.md（上下文策展）
- Skills（能力定义）
- Hooks（确定性保障）
- 权限模型（安全边界）
- 工具集（执行能力）
- 验证循环（质量保证）
- 可观测性（行为追踪）

### 核心原则

**"CLAUDE.md 是偏好，Hooks 是保障。"**
- CLAUDE.md 告诉 Claude 应该做什么——但它可能在长上下文中"遗忘"
- Hooks 在模型外部确定性执行——无论模型怎么决策，Hook 都会运行
- 基础设施比智能更重要（LangChain 实测：仅改 Harness 不换模型，benchmark +13.7%）

### Harness 叙事的使用规则

- **显式出现**：仅在 Ch1（引入三个时代）和 Part 2 引言（"从这里开始你在做 Harness Engineering"）
- **隐式体现**：Ch4-Ch11 的内容自然体现 Harness 思想，但不在每章重复"这是 Harness 的 XX 层"
- 避免过度渲染，让读者自己感受递进

---

## 三、章节结构

### 总览

```
Part 1: 和 AI 对话 ── Prompt Engineering（~130 min）
  Ch1  Claude Code 的世界观                    重写
  Ch2  Prompt 工程                             更新
  Ch3  Vibe Coding 的边界                      微调

Part 2: 构建驾驭系统 ── Harness Engineering（~210 min）
  Ch4  CLAUDE.md + 项目记忆                    更新 + 前移
  Ch5  Plan Mode + 结构化思考                  保留 + 后移
  Ch6  Skills 体系                             新写
  Ch7  Hooks 自动化                            新写

Part 3: AI 成为你的团队 ── Scaling the Harness（~150 min）
  Ch8  Subagent → Agent Teams                  合并重写
  Ch9  Agent SDK + 程序化接入                  新写

Part 4: AI 安全融入组织 ── Governing the Harness（~100 min）
  Ch10 工作流设计原则                          重新定位
  Ch11 治理、风险与度量                        更新
```

总计 11 章，约 590 分钟（~9.8 小时）。

### 改动量分类

| 类型 | 章节 | 工作量 |
|------|------|--------|
| 重写 | Ch1, Ch6, Ch7, Ch9 | 高 |
| 大改 | Ch4, Ch8, Ch10 | 中-高 |
| 更新 | Ch2, Ch11 | 中 |
| 微调 | Ch3, Ch5 | 低 |

### 硬依赖关系

```
Ch1 ──→ 所有后续章节
Ch4 ──→ Ch5, Ch6, Ch8
Ch6 ──→ Ch7
Ch8 ──→ Ch9
```

其余为软推荐，不强制。Ch2 和 Ch3 可在读完 Ch1 后按需阅读。Ch5（Plan Mode）和 Ch6（Skills）之间无硬依赖。

### 快速阅读路径

| 路径 | 目标 | 章节 | 时长 |
|------|------|------|------|
| 30 分钟上手 | 今天就能用 | Ch1 前半 + Ch4 快速模板 | ~30 min |
| 个人开发者 | 独立高效使用 | Part 1 + Part 2（Ch1-Ch7） | ~340 min |
| Tech Lead 评估 | 决定是否引入 | Ch1 → Ch4 → Ch8 概览 → Ch11 | ~150 min |
| 完整路径 | 系统掌握 | Ch1 → Ch11 | ~590 min |

---

## 四、每章详细设计

### 每章通用结构

```
┌─ 章节头 ─────────────────────────────────┐
│  标题 / 副标题 / 预计时长 / 等级徽章      │
│  前置条件（推荐，非强制）                  │
│  skipCondition（"如果你已经…可以跳过"）    │
├─ 正文：框架区 ────────────────────────────┤
│  概念讲解、思维模型、决策树                │
│  Remotion 动画                            │
│  交互组件（PromptCompare、CodeBlock 等）   │
│  实战案例 / 练习卡片                      │
├─ 章末：参考区（默认折叠） ────────────────┤
│  具体数字、API 细节、配置模板             │
│  标注 "截至 Claude Code vX.X"            │
│  不同背景色 / 边框，与正文视觉分隔        │
└───────────────────────────────────────────┘
```

---

### Part 1: 和 AI 对话

#### Ch1 Claude Code 的世界观（重写，~45 min）

**教学策略**：体验先行——先动手，再解释发生了什么，再给框架。

**内容结构：**

```
1.1 你的第一次对话（5 min）
    - "打开终端，输入 claude，让它帮你做一件事"
    - 它请求权限时你看到了什么？
    - 三种权限模式简介（Ask / AcceptEdits / Auto）
    - 一次典型对话的截图/示例

1.2 刚才发生了什么？（10 min）
    - 请求生命周期简化版：
      输入 → 系统提示装配 → 模型推理 → 工具选择
      → 权限校验 → 执行 → 结果注入 → 回复
    - "这个流程中大部分环节你都能控制——
       这就是这个教程要教你的"
    - Remotion 动画：RequestLifecycle（更新）

1.3 三个时代（10 min）
    - Prompt → Context → Harness 递进
    - Agent = Model + Harness
    - "本教程的路线图：
       Part 1 学对话，Part 2 建系统，
       Part 3 带团队，Part 4 管组织"

1.4 Token 经济学（10 min）
    - 1M 上下文窗口 ≠ 无限
    - 注意力衰减（"Lost in the Middle"效应仍然存在）
    - Token = 钱的直觉（成本感知，不给精确数字）
    - "Claude 会犯错——你的 Harness 就是安全网"
    - Remotion 动画：TokenEconomy（更新）

1.5 选择你的模型（5 min）
    - Opus（最强，最贵）/ Sonnet（平衡）/ Haiku（快且便宜）
    - Fast mode / effort 级别概述
    - 在哪里使用：CLI / VS Code / JetBrains / Web / Desktop（概述）

参考区：
    - 具体 token 成本表（截至 vX.X）
    - 系统提示优先级完整列表
    - Prompt Caching 机制说明
    - 能力全景表（含实验性功能标注：Voice Mode / Computer Use / Remote Control）
    - IDE 集成差异表
```

**和原 Ch0 的关键区别：**
- 从"系统提示 7 层优先级"开头 → 从"打开终端试一下"开头
- 200K 全部替换为 1M，token 经济学论述从"空间不够"改为"注意力衰减 + 成本"
- 新增三个时代框架、模型选型、IDE 概述
- 所有易变数字移入参考区

---

#### Ch2 Prompt 工程（更新，~50 min）

**内容结构：**

```
2.1 五级 Prompt 阶梯（保留，微调措辞）
    - L1 零约束 → L5 完整契约
    - PromptCompare 组件对比
    - 说明：这是教学框架，非官方分级

2.2 结构化技巧（更新）
    - XML 语义边界
    - 编号步骤 vs 自然段落
    - 约束语的力度谱系（强语言 = 强遵从，作为经验原则而非精确测量）

2.3 控制推理深度（新增）
    - effort 级别体系：low / medium / high / max
    - ultrathink 关键词 = 触发高 effort
    - 各级别的适用场景和 token 成本差异
    - 决策树：什么任务用什么 effort
    - 后续章节（Skills frontmatter、SDK 参数）都引用此节

参考区：
    - 关键词力度层级参考表（截至 vX.X，标注为经验规律）
    - XML 标签参考列表
    - effort 级别 token 消耗估算
```

**和原 Ch1 的关键区别：**
- 关键词权重从"精确分级"改为"经验原则"，具体数字移入参考区
- 新增 effort 系统统一讲解（解决跨章节缺陷）
- 五级 Prompt 阶梯明确标注为教学框架

---

#### Ch3 Vibe Coding 的边界（微调，~40 min）

**内容结构：**

```
3.1 四轮 API 案例（保留）
    - 一致性退化的五个维度
    - 从 L1 到 L5 Prompt 如何改善

3.2 三种控制模式（保留）
    - Full Vibe / Semi-controlled / Full Control
    - 决策树：什么场景用什么模式

3.3 AI 生成代码的审查框架（保留 + 前瞻引导）
    - "你能解释每一行吗？" 决策流
    - 前瞻引导（一句话）：
      "Vibe Coding 的一致性问题，根源是 AI 每次都在'裸跑'——
       没有规范约束它的行为。Part 2 会教你怎么解决这个问题。"

参考区：（轻量）
    - Vibe Coding 常见陷阱检查表
```

**和原 Ch2 的关键区别：**
- 内容基本保留（此章内容较为稳定，不依赖具体 API）
- 删除生硬的"Harness 视角"植入，改为一句自然的前瞻引导

---

### Part 2: 构建驾驭系统

**Part 引言（独立段落）：**

> 从这一部分开始，你不再只是"和 AI 对话"，而是在构建 AI 周围的基础设施——这就是 Harness Engineering。
>
> Part 2 的四章是一个从软到硬的递进：
> - **CLAUDE.md** — 告诉 AI 应该知道什么（静态知识，可被遗忘）
> - **Plan Mode** — 规范 AI 的思考流程（API 层工具限制）
> - **Skills** — 定义 AI 能做什么（能力边界）
> - **Hooks** — 确保 AI 真的照做（确定性保障，最硬的约束）
>
> CLAUDE.md 是偏好，Hooks 是保障。偏好可以被忽略，保障不可以。

---

#### Ch4 CLAUDE.md + 项目记忆（更新 + 前移，~50 min）

**教学策略**：三明治结构——先给可用的模板，再解释原理，再教优化。

**内容结构：**

```
4.1 快速开始：5 分钟写一个 CLAUDE.md（模板 + 填空）
    - 最小可用模板（项目名、技术栈、构建命令、测试命令、核心约定）
    - 练习卡片：为你的项目填写这个模板
    → 30 分钟上手快速路径读者到此可停

4.2 注入机制与优先级（更新）
    - CLAUDE.md 在 Harness 中的位置：Context Engineering 层
    - 完整优先级层级：
      Managed Policy → Global → Ancestor → Project Root
      → Local → Subdirectory → Rules
    - managed-settings.d/ 企业级配置

4.3 写好 CLAUDE.md 的方法（重新定位论述角度）
    - 旧叙事："很贵，砍到最少"
    - 新叙事："不贵了，但信噪比仍然重要"
    - 核心判断法则保留："删掉这行，Claude 会出错吗？"
      理由从"省空间"变为"减噪音，提升注意力质量"
    - IMPORTANT/MUST 权重系统：只用于 3-5 条核心规则（过度使用会稀释）
    - 优化案例（更新数字，但保留教学方法）

4.4 Auto Memory 系统（更新）
    - MEMORY.md 前 200 行自动加载
    - 四种记忆类型：user / feedback / project / reference
    - /memory 命令管理

参考区：
    - 完整优先级层级图（截至 vX.X）
    - Auto Memory frontmatter 字段参考
    - /context 命令说明（上下文健康检查工具）
    - Token 摊销数学（1M 下的新计算）
```

**和原 Ch4 的关键区别：**
- 5 分钟快速模板前置（兼顾快速路径读者）
- CLAUDE.md 优化论述翻转：从"省空间"到"提信噪比"
- managed-settings.d/ 新增
- Token 数学全部重算（1M 基准）

---

#### Ch5 Plan Mode + 结构化思考（保留 + 后移，~60 min）

**内容结构：**

```
5.1 Plan Mode 是什么
    - 不是建议——它在 API 层禁用了 Write/Edit 工具
    - Harness Engineering 的典型案例：用基础设施约束行为，而不是靠 prompt 劝说
    - 什么时候该用（复杂多步任务）/ 什么时候不该用（简单修改）

5.2 四阶段框架 EDPE（保留）
    - Explore（只分析，不提方案）
    - Diagnose（先约束条件，再生成选项）
    - Plan（分阶段 + 验证检查点 + 回滚方案）
    - Execute（严格遵循计划 + 逐步验证）
    - 说明：这是教学框架，非 Claude Code 内置功能

5.3 实战：RBAC 功能实现（保留）
    - 完整 EDPE 流程演示
    - 每阶段验证清单
    - >200 行阶段必须拆分

5.4 验证检查点的价值（保留）
    - Amazon S3 2017 案例（$2.8B 影响）
    - Git diff 友好的阶段隔离

参考区：
    - EDPE 提示模板完整版
    - Plan Mode 配置选项
```

**和原 Ch3 的关键区别：**
- 微调定位：明确标注 EDPE 为教学框架
- 从 Part 2 第一章后移到第二章（CLAUDE.md 优先）
- 内容主体保留，不做大改

---

#### Ch6 Skills 体系（新写，~50 min）

**内容结构：**

```
6.1 Skills 是什么
    - Harness 的能力层：告诉 Claude 如何处理特定任务
    - Skills vs MCP：Skills = prompt 指令（在上下文中），MCP = 外部工具能力（在上下文外）
    - Skills 遵循 AgentSkills.io 开放标准
    - 说明："本教程以 TypeScript 为例，原则适用于任何语言。Skills 本身是 Markdown，语言无关。"

6.2 写你的第一个 Skill（实战先行）
    - 示例 1：/deploy Skill（用户调用，自动化部署流程）
    - 示例 2：code-reviewer Skill（Claude 自动调用，代码审查）
    - 通过实战自然引出 5 个核心 frontmatter 字段：
      name, description, allowed-tools, context, model
    - 动态注入演示：!`command` 在加载时运行 shell 命令
    - 字符串替换：$ARGUMENTS, $N, ${CLAUDE_SESSION_ID}

6.3 Skill 的作用域与优先级
    - 个人 ~/.claude/skills/
    - 项目 .claude/skills/
    - Plugin（市场安装，命名空间隔离）
    - 优先级：enterprise > personal > project

6.4 从 Plugin 市场获取能力
    - /plugin 浏览和安装
    - 官方和合作伙伴 Plugin 生态概览（不写死数量，用"百余个"）
    - 如何评估 Plugin 质量（Anthropic Verified 标志）
    - 常用 Plugin 推荐（按场景：前端/后端/DevOps/设计）

6.5 常见问题排查（新增）
    - Skill 没加载？检查路径和 frontmatter
    - Skill 和其他 Skill 冲突？检查 description 和命名空间
    - 调试技巧：/debug skill

参考区：
    - SKILL.md 完整 frontmatter 字段参考（12+ 个字段）
    - 内置 Skills 列表（/batch, /loop, /simplify, /debug 等）
    - 常用 Plugin 清单（截至 vX.X）
```

---

#### Ch7 Hooks 自动化（新写，~50 min）

**教学策略**：做中学——通过构建质量流水线来教核心概念，而不是先列出所有事件再练习。

**内容结构：**

```
7.1 为什么需要 Hooks（5 min）
    - "CLAUDE.md 是偏好，Hooks 是保障"——用具体例子说明
    - 例子：CLAUDE.md 写了"所有代码必须通过 ESLint"，
      但 Claude 在第 20 轮对话中忘记了。
      Hook 在每次文件编辑后自动运行 ESLint——不依赖模型记忆。

7.2 实战：构建质量流水线（25 min，边做边学）
    - Layer 1: Auto-format
      → 事件：PostToolUse（matcher: Write/Edit）
      → Handler：Command（零 token，运行 Prettier）
      → 退出码：0=通过, 2=拒绝并回滚
    - Layer 2: Auto-lint
      → 事件：PostToolUse（matcher: Write/Edit）
      → Handler：Command（运行 ESLint --fix）
    - Layer 3: 完成度检查
      → 事件：Stop
      → Handler：Prompt（单轮 LLM 判断"任务真的完成了吗？"）
    - Layer 4: 安全门禁
      → 事件：PreToolUse（matcher: Bash）
      → Handler：Command（正则检查危险命令）
    - 完整 settings.json 示例

    通过这个实战，读者自然学会了：
    - 4 个最常用事件（PreToolUse, PostToolUse, Stop, UserPromptSubmit）
    - 三种退出状态（0/1/2）
    - "最严格者胜出"规则
    - Command 和 Prompt 两种 Handler 类型

7.3 进阶模式（15 min）
    - Agent Handler：多轮子代理深度验证（昂贵，只用于关键检查）
    - HTTP Handler：远程验证服务、团队策略执行、审计日志
    - 条件执行：if 字段，按文件路径/工具名过滤
    - 异步 Hook：async: true，非阻塞执行
    - 决策树：什么场景选什么 Handler 类型

7.4 权限模型深入（5 min）
    - Ch1 介绍了三种权限模式（Ask/AcceptEdits/Auto）
    - 权限与 Hooks 的关系：Hooks 可以覆盖权限决策
    - settings.json 中的 allow/deny 规则
    - 团队级权限策略设计

7.5 常见问题排查（新增）
    - Hook 不触发？检查 matcher 和事件名
    - Hook 运行但没效果？检查退出码
    - 调试技巧：hook 的 stdout/stderr 日志

参考区：
    - 21+ 生命周期事件完整列表及触发时机
    - Hook 配置 JSON Schema
    - matcher 语法参考
    - 常用 Hook 模板库
```

---

### Part 3: AI 成为你的团队

---

#### Ch8 Subagent → Agent Teams（合并重写，~80 min）

**内容结构：**

```
前 60%：Subagent（稳定功能）

8.1 为什么需要 Subagent（10 min）
    - 问题：主对话上下文膨胀 → 注意力质量下降
    - 解法：派独立代理去干活，只拿回摘要（~200 token）
    - 隔离模型：子代理收到什么 / 不收到什么 / 返回什么
    - 成本 vs 主上下文权衡：什么时候值得用、什么时候不值得

8.2 五种内置 Subagent（10 min）
    - Explore（Haiku，只读）：快速代码搜索
    - Plan（主模型，只读）：深度分析
    - General-purpose（主模型，全工具）：独立任务
    - Bash（主模型，Shell）：系统命令
    - Guide（主模型，只读）：教学解释
    - 决策树：什么任务派给什么类型

8.3 自定义 Agent（15 min）
    - 5 个核心 frontmatter 字段：name, description, tools, model, maxTurns
    - 实战 1：code-reviewer agent（只读，15 轮，安全审查重点）
    - 实战 2：implementer agent（全工具，30 轮，worktree 隔离）
    - Worktree 隔离模式 + sparsePaths（monorepo 场景）

8.4 上下文摘要的局限（5 min，新增）
    - ~200 token 摘要会丢失什么？
    - 什么信息适合子代理去查（精确搜索），什么不适合（需要全局理解）

后 40%：Agent Teams（实验性功能）

⚠️ 实验性标注：
"Agent Teams 需要 CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS 启用。
 API 可能随版本变化。以下内容基于 2026.02 版本。"

8.5 从星型到网状（10 min）
    - Subagent 的局限：主代理是瓶颈，无法感知后续变更
    - Teams 的解法：共享任务列表，队友直接协作
    - 拓扑对比图：星型 vs 网状

8.6 Teams 实战（15 min）
    - 文件所有权：防止多代理冲突
    - 通信机制：文件系统 + 任务状态（仅此两种）
    - 案例：用户通知系统（backend/frontend/test 三个队友）

8.7 高级模式（10 min）
    - 竞争假设：3 个队友从不同角度调查同一个 bug
    - 多维代码审查

参考区：
    - 自定义 Agent 完整 frontmatter 字段（15 个）
    - Teams 配置参考
    - Hook 事件：TeammateIdle, TaskCompleted
```

---

#### Ch9 Agent SDK + 程序化接入（新写，~70 min）

**内容结构：**

```
9.1 为什么需要程序化接入（5 min）
    - 交互式 CLI 的局限：需要人坐在终端前
    - 四种场景：CI/CD、定时任务、远程控制、自定义应用

9.2 Agent SDK（20 min）
    - CLI 模式：claude -p "..." --allowedTools "..."
    - --bare 模式（跳过自动发现，推荐用于脚本/CI）
    - Python SDK 示例（完整可运行代码）
    - TypeScript SDK 示例（完整可运行代码）
    - 关键参数：output-format, json-schema, continue/resume
    - 错误处理：agent 失败时的重试和降级策略

9.3 CI/CD 集成（20 min）
    - 实战：GitHub Actions PR 自动审查
      → 完整 YAML + Agent SDK 调用
    - GitLab CI/CD 概览
    - 安全考量：token 管理、权限最小化、--bare 推荐
    - 成本控制：CI/CD 场景下的预算设置

9.4 定时与循环（15 min）
    - /loop：会话内循环（"每 5 分钟检查部署状态"）
    - CronCreate/CronDelete/CronList：会话内定时
    - Cloud Scheduled Tasks：机器关了也能跑，继承 Web 端 MCP 配置
    - 决策树：什么场景用哪种

9.5 远程控制（10 min，Research Preview 标注）
    - claude remote-control 子命令
    - 从手机/浏览器控制本地 Claude Code
    - 代码和文件留在本地，只传输聊天消息（加密通道）
    - 适用场景：移动办公、远程服务器

参考区：
    - SDK CLI 完整参数表
    - Python/TS SDK API 参考
    - Provider 支持（Anthropic / Bedrock / Vertex / Foundry）
    - GitHub Actions 完整 YAML 模板
    - Cloud Scheduled Tasks 配置参考
```

---

### Part 4: AI 安全融入组织

---

#### Ch10 工作流设计原则（重新定位，~50 min）

**教学策略**：教原则，不教工具。方法论作为案例出现，不作为教学主体。

**内容结构：**

```
10.1 三个核心原则（15 min）
    - Spec 驱动：先写规格再执行，不要边想边做
      → 所有成功的方法论都收敛到了这一点
    - 上下文隔离：第 50 个任务和第 1 个任务质量一样
      → 每个任务拿到新鲜上下文，不受前面任务污染
    - 验证循环：每步产出都经过自动验证，失败自动修复
      → 验证 alone 可以将完成率从 83% 提升到 96%

10.2 设计你自己的工作流（15 min）
    - 实战案例：为团队搭建"PR 自动审查流水线"
      → 识别需求：每个 PR 需要安全审查 + 代码风格 + 测试覆盖
      → 写 Spec：定义审查维度和通过标准
      → 拆解任务：3 个独立审查 Agent（安全/风格/测试）
      → 配 Harness：每个 Agent 的 Skills + Hooks
      → 设验证门禁：所有 Agent 通过 → 自动 approve，任一失败 → 标记 review
      → 对应技术：Ch6 Skills + Ch7 Hooks + Ch8 Subagent + Ch9 SDK

10.3 社区方法论案例研究（15 min）
    - GSD — 上下文隔离的典范
      每个 executor 拿新鲜上下文，现在是独立 CLI
    - BMAD — 角色分工的典范
      21 角色覆盖完整产品生命周期，通过 claude-code-bmad-skills 集成
    - Writer/Reviewer — 验证循环的典范
      独立 session 消除确认偏差，零配置
    - 对比表：按项目类型 × 团队规模推荐

10.4 反模式（5 min）
    - 无限循环：没有 maxIterations 的自我迭代（$297 教训）
    - 上下文污染：50 轮对话后质量崩塌
    - 过度编排：简单 bug 修复用了 21 个角色

参考区：
    - GSD / BMAD / Writer-Reviewer / RIPER-5 项目链接
    - 各方法论适用场景对比表
    - 成本估算参考
```

---

#### Ch11 治理、风险与度量（更新，~50 min）

**内容结构：**

```
11.1 四层纵深防御（15 min）
    - Layer 1 预防：权限 + CLAUDE.md + Plan 强制 + Hook 拦截 + Worktree
    - Layer 2 过程：逐步执行 + 自动测试 + Stop Hook + 成本监控
    - Layer 3 事后：需求验证矩阵 + 分级审查 + AI Review
    - Layer 4 治理：会话日志 + Git blame + Managed Policy + 度量
    - 每层引用对应章节（"权限见 Ch1/Ch7""Hook 见 Ch7""Skills 见 Ch6"）

11.2 分级管理制度（更新）
    - 基于 Claude Code 使用经验分级，而非职级
    - L1（< 1 月）：Ask 模式 + 白名单工具 + 逐行审查
    - L2（1-6 月）：AcceptEdits + Hooks + Plan 审查 + AI 审查 + 抽检
    - L3（> 6 月）：Auto 模式 + Hook 门禁 + 分级审查
    - 升级标准明确（L1→L2：3 月稳定期；L2→L3：完成 1 个 Plan 项目）
    - 审查策略矩阵（变更大小 × 经验等级 × 安全敏感度）

11.3 四个核心健康指标（保留框架）
    - AI PR Bug Rate：≤ 1.2x 人类基线
    - Change Failure Rate：< 5%
    - 平均审查轮次：趋势不应上升
    - 需求准确率：> 80%
    - 预警信号：bug 率上升、个人异常、审查轮次增长、理解差距
    - 诊断指引：每个预警对应检查项

11.4 成本管控（更新）
    - 团队预算设置
    - Token 消耗追踪
    - 何时该用 Sonnet 而不是 Opus（回引 Ch1 模型选型）
    - Plugin 安全评估（新增）：
      评估权限要求、检查 Plugin 源码、确认 Anthropic Verified 状态
    - 数据隐私考量（新增）：Claude Code 发送什么数据？企业合规注意事项

参考区：
    - 成本基线参考表（截至 vX.X，模型定价 + 日均消耗估算）
    - Managed Policy 配置参考
    - managed-settings.d/ 配置参考
    - 审查检查表模板
    - 安全评估 checklist
```

---

## 五、内容修正清单

### 必须修正的过时事实

| 原文位置 | 原文内容 | 修正为 |
|----------|----------|--------|
| 原 Ch0 | 上下文窗口 200K，保留 33K，可用 167K | Opus 4.6 = 1M，移入参考区标注版本 |
| 原 Ch0 | Token 成本：Bash ~245 tokens | 移入参考区，标注"截至 vX.X" |
| 原 Ch0 | auto-compact 在 95-98% 触发 | 需实测验证 1M 下的阈值，暂移入参考区 |
| 原 Ch4 | CLAUDE.md 50 行 ≈ 1,500 token，优化到最少 | 重算 1M 基准，论述从"省空间"改为"提信噪比" |
| 原 Ch5 | 9 个 Hook 事件 | 更新为 21+ 个，核心 5-6 个在正文教学，完整列表在参考区 |
| 原 Ch5 | 3 种 Handler 类型 | 更新为 4 种（+HTTP），新增条件执行和异步 Hook |
| 原 Ch9 | Sonnet $3/$15，Opus $15/$75 | 验证 4.6 系列定价，移入参考区标注版本 |

### 需重新定位的论述

| 章节 | 旧论述 | 新论述 |
|------|--------|--------|
| Ch4 | "CLAUDE.md 很贵，砍到最少" | "不贵了，但信噪比仍然重要——写对的内容比写少的内容更关键" |
| Ch1 | "Token 非常珍贵，严格管控" | "空间充裕但注意力会衰减，成本仍需关注" |

### 需补充的跨章节内容

| 内容 | 放置位置 | 说明 |
|------|----------|------|
| effort 系统 | Ch2 新增 2.3 节 | 统一讲解 effort + ultrathink，后续章节引用 |
| 调试排错 | Ch6 新增 6.5、Ch7 新增 7.5 | Skills 和 Hooks 的常见问题排查 |
| "Claude 会犯错" | Ch1 1.4 节 | 在 Token 经济学中加入"Harness = 安全网"的概念 |
| 语言说明 | Ch6 开头 | "本教程以 TypeScript 为例，原则适用于任何语言" |

### 需加免责声明的经验数据

| 数据 | 处理方式 |
|------|----------|
| 关键词 S/A/B/C 权重 | 标注"经验规律，随模型更新可能变化" |
| 编号步骤 ~90% 遵从率 | 标注"经验观察，非精确测量" |
| 20-40% 注意力衰减阈值 | 标注"基于 200K 模型的研究，1M 下需进一步验证" |
| auto-compact 压缩率 60-80% | 标注"截至 vX.X，可能随版本变化" |

---

## 六、UI/UX 设计要点

### 参考区组件

```tsx
<ReferenceSection version="Claude Code v1.x.x" defaultCollapsed={true}>
  {/* 具体数字、API 细节、配置模板 */}
</ReferenceSection>
```

- 默认折叠，点击展开
- 不同背景色（比正文区略深或加边框），与教学内容视觉分隔
- 标题固定格式："参考数据（截至 Claude Code vX.X）"
- 快速路径读者可完全跳过

### 快速路径导航

首页展示四条路径，每条路径：
- 显示涉及的章节（高亮）
- 估计总时长
- 一句话描述目标
- 跳过的章节标记为"可选补充"

### 章节依赖指示

- 每章顶部显示"推荐前置"（不用"必须"字眼）
- 已完成的前置章节自动打勾（利用现有 useProgress hook）
- 未完成前置时显示温和提示，不阻断阅读

---

## 七、维护策略

### 版本更新检查流程

当 Claude Code 发布新版本时：

1. **参考区扫描**：检查所有标注了版本号的参考区，验证数字/API 是否仍然准确
2. **事件列表更新**：检查 Hook 事件是否新增/移除
3. **能力全景表更新**：检查实验性功能是否转为正式
4. **成本基线验证**：检查模型定价是否变化
5. **框架区通常不需要改动**——除非发生范式级变化

### 内容稳定性分级

| 稳定性 | 内容类型 | 更新频率 |
|--------|----------|----------|
| 高 | 思维框架（三个时代、EDPE、三原则） | 极少 |
| 高 | 教学案例（S3 事件、Express API 案例） | 极少 |
| 中 | 功能介绍（Skills/Hooks/Teams 的概念） | 随大版本 |
| 低 | 具体数字（token 成本、事件列表、定价） | 随每个版本 |
| 低 | Plugin 市场信息 | 持续变化 |

---

## 八、不在范围内

以下内容明确排除在本次重构之外：

- Plugin 开发与发布流程（面向生态开发者，非教程目标受众）
- MCP Server 开发（已降级为底层实现细节）
- Voice Mode / Computer Use 的深度教学（Research Preview，不稳定）
- 多语言代码示例（主线用 TypeScript，Hooks 用 bash，原则适用于所有语言）
- Remotion 动画的具体设计（需要单独的动画设计文档）
- 现有 React 组件的重构（技术实现，不属于内容设计）
