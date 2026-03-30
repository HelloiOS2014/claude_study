# Claude Code 教程改进设计文档

**日期：** 2026-03-30
**状态：** 待审核
**范围：** 11 章不变，内容从"功能说明书"升级为"能力养成系统"

---

## 一、核心诊断

### 当前问题

教程承诺"由浅入深的 AI 辅助开发**能力养成系统**"，实际交付的是"Claude Code **功能说明书**"。

具体表现：

1. **叙事结构不统一** — 强章节（Ch03/05/07）以失败开场，读者先感受痛点再学工具；弱章节（Ch06/09/10）以定义开场，读者在没有动机的情况下学配置
2. **Harness Engineering 是标签而非方法论** — Ch01 引入"Agent = Model + Harness"公式和五个组件，但后续章节各讲各的功能，读者学完 11 章不会"设计 Harness"
3. **教 WHAT 和 HOW，缺 WHEN / WHAT IF / HOW GOOD** — 读者学会了怎么配置，但不知道什么时候该用/不该用、出了问题怎么排查、怎么判断做得好不好
4. **受众定位有偏差** — 2026 年的读者大概率已有 AI 编码经验（Cursor/Copilot），Part 1 的 Prompt 基础教学可能重复他们已知的内容
5. **最新特性缺位** — Auto Mode（2026.03.24）、Channels、长时运行代理模式、21+ Hook 事件等未覆盖

### 改进原则

1. **每章从失败开场** — 遵循 Harness Engineering 核心过程：失败 → 诊断 → Harness 响应 → 验证
2. **教判断力而非配置** — 每个工具都要回答"什么时候用/不用"和"怎么判断做得好"
3. **用数据说话** — 行业数据、成本量化、质量指标支撑论点

---

## 二、章节叙事模板

每章统一四段式结构：

| 阶段 | 内容 | 读者获得什么 |
|------|------|-------------|
| **失败** | 一个具体的、读者会认同的问题场景 | 动机："我确实遇到过这个" |
| **诊断** | 为什么会出这个问题？根因是什么？ | 理解："原来问题在这里" |
| **响应** | 用本章的 Harness 组件解决它，配完整代码 | 能力："我会用了" |
| **验证** | 怎么确认问题被解决？质量标准？失灵了怎么排查？ | 判断力："我知道做得对不对" |

---

## 三、每章在学习旅程中的角色

| 章节 | 角色 | 解决的问题 | 读者到达的状态 |
|------|------|-----------|---------------|
| Ch01 | 建立世界观 | "Claude Code 到底是什么？" | 理解 Agent 的工作原理、能力边界、可控点 |
| Ch02 | 学会沟通 | "怎么让 Claude 听懂我的意思？" | 能写出结构化、可预测的 Prompt |
| Ch03 | 感受痛点 | "为什么光会写 Prompt 不够？" | 亲手体验退化，产生学 Harness 的动机 |
| Ch04 | 第一道 Harness：规范 | "每次新会话都要重新教 Claude" | 有 CLAUDE.md，输出风格稳定 |
| Ch05 | 第二道 Harness：结构 | "复杂任务做着做着就偏了" | 会用 Plan Mode 管控复杂任务 |
| Ch06 | 第三道 Harness：能力 | "反复描述同样的工作流" | 有项目专属 Skill |
| Ch07 | 第四道 Harness：保障 | "Claude 有时候忘了跑测试" | 有 Hook 流水线，质量检查不会被跳过 |
| Ch08 | 突破单会话 | "上下文太长质量下降" | 会用子代理隔离上下文和并行任务 |
| Ch09 | 脱离终端 | "必须有人坐在电脑前" | Claude 能在 CI/CD 中自动工作 |
| Ch10 | 形成方法论 | "换个项目我不知道从哪开始" | 能为新项目自主设计 Harness |
| Ch11 | 推广到团队 | "个人用得好但团队推不动" | 有权限分级、成本管控、onboarding 流程 |

---

## 四、受众定位修正

实际受众：有编程经验、可能已有 AI 编码工具使用经验的中文开发者。

Part 1 各章需要加入定位段落，区分 Claude Code 与其他 AI 工具：

- **Ch01 开头：** "如果你用过 Cursor 或 Copilot，Claude Code 最大的不同是它是一个 **Agent**（自主决定行动），而不是 **Copilot**（等你指令）。这意味着你需要学会**设计它的运行环境**，而不只是写好 Prompt。"
- **Ch02 开头：** "你可能已经会写 Prompt 了。这章教的不是基础 Prompt，而是 Claude **特有的**精确控制技巧 — XML 语义边界、权重词层级、effort 级别。这些是其他 AI 工具没有的。"
- **Ch03 开头：** "如果你在 Cursor 中经历过'写到后面越来越乱'，那就是 Vibe Coding 退化。这章用 Agentic Engineering 的视角系统分析它的根因，并给出 Claude Code 特有的解决方案。"

---

## 五、贯穿项目设计

### 范围

Ch03-07 使用同一个项目 **TaskFlow API**（任务管理 REST API），Ch08-11 各自使用最适合的场景。

### 原因

- Ch03-07 都是个人开发场景，一个 CRUD API 能自然生成所有需要的痛点
- Ch08-11 涉及多代理/自动化/团队场景，单个 API 无法自然支撑（强行贯穿会硬凑）

### TaskFlow 演进

| 章节 | TaskFlow 版本 | 发生了什么 |
|------|--------------|-----------|
| Ch03 | v0 | Vibe Coding 搭出 CRUD，4 轮后风格崩溃（已有内容） |
| Ch04 | v1 | 加 CLAUDE.md，用同样的 prompt 重新生成 Posts/Comments，展示 before/after diff |
| Ch05 | v2 | 用 Plan Mode EDPE 设计 RBAC 认证（已有 RBAC 示例，显式连接到 TaskFlow） |
| Ch06 | v3 | 写 /api-test 和 /deploy Skill |
| Ch07 | v4 | 搭四层 Hook 流水线 |

### Ch03 改动

- 开头给 API 命名为 TaskFlow，声明"这个项目贯穿 Part 2"
- 末尾加预告表：每个痛点 → 对应的 Harness 组件 → 在哪一章解决

### Ch08-11 各自场景

| 章节 | 场景 | 为什么这个场景更好 |
|------|------|-------------------|
| Ch08 | 中型 monorepo 的重构任务 | 自然需要并行开发和上下文隔离 |
| Ch09 | GitHub 开源项目的 CI/CD | 自然需要自动化和无人值守 |
| Ch10 | 回顾 Ch03-09 所有场景 | 从真实经验中归纳，不是先讲后证 |
| Ch11 | 10 人工程团队 | 自然需要权限分级和成本管控 |

---

## 六、Harness Engineering 方法论交付

### 不用自编框架

不使用自编的"设计画布"和"成熟度模型"作为核心方法论。改为交付 Harness Engineering 的原生过程：

> **观察失败 → 诊断根因 → 构建 Harness 响应 → 验证有效**

这个循环在 Ch01 引入，在每章中实践，在 Ch10 中显式化为可迁移的方法论。

### Ch01 中的引入方式

在 1.3"三个时代"的 Harness Engineering 部分末尾加：

> "你在这个教程中会反复经历同一个循环：**观察失败 → 诊断根因 → 构建 Harness 响应 → 验证有效**。每一章就是一次这个循环。学完 11 章，你不只是会用 Claude Code 的功能，而是掌握了 Harness Engineering 的思维方式 — 面对任何 AI 工具都适用的工程方法论。"

### Ch10 中的显式化

Ch10 的核心不再是罗列方法论（GSD/BMAD/RIPER），而是：

1. **回顾 Ch03-09 的 8 次 失败→响应 循环**，总结规律
2. **提炼诊断框架**（交互式 DecisionTree 组件）：

```
Claude 表现不对
├─ 忽略了项目规范？
│   ├─ 上下文 > 70% → /compact 或拆 session
│   └─ 上下文 < 70% → 规则措辞太弱，升级为 MUST/NEVER 或改 Hook
├─ 做了不该做的事？
│   ├─ 有 deny 规则吗？→ 没有 → 加 deny
│   └─ 有 → 检查 Hook 覆盖
├─ 输出质量下降？
│   ├─ < 5 轮 → Prompt 质量问题
│   └─ > 15 轮 → 上下文衰减，拆 session 或用子代理
└─ 太慢或太贵？
    ├─ 检查 effort 级别
    ├─ Grep 替代 Read
    └─ 子代理数量是否过多
```

3. **教读者为自己的项目设计 Harness**：不是填画布，而是"遇到什么问题就加什么组件"的迭代思维
4. 方法论对比（GSD/BMAD/RIPER 等）降级为折叠 ReferenceSection

---

## 七、逐章具体改动

### P0 — 按读者影响排序的优先修复

#### Ch04 CLAUDE.md + 项目记忆（中量改动，当前 641 行 → 目标 900+）

**补"失败"开场：**
具体案例 — 你昨天花 30 分钟教 Claude 项目的命名规范和文件结构（统一响应格式 `{data, error}`、文件放 `src/routes/` 等）。今天开新 session，它全忘了：响应格式变成 `{success, result}`，文件放到了根目录。展示两个 session 的输出 diff。

**补 TaskFlow 对比实验：**
新增一节 — 用 Ch03 同样的 prompt（"加帖子功能""加评论功能"），有 CLAUDE.md 后重新生成。展示 before/after diff：响应格式统一了、ID 策略一致了、文件结构没漂移。

**补内容：**
- Auto Memory 从"提一嘴"扩为完整教学：四种记忆类型（user/feedback/project/reference）的实际案例、什么值得记什么不值得
- 团队协作维护 CLAUDE.md 的实践：版本控制、review 流程、信噪比审计
- `managed-settings.d/` 组织策略目录

**补"验证"：**
- 质量标准：同一个 prompt 跑 3 次，输出风格一致率 > 80%
- 瘦身指标：超过 60 行必须审计，问"删掉这行 Claude 会出错吗？"
- 排障流程：Claude 无视规则 → 检查优先级层级 → 检查上下文占用率 → 检查措辞权重级别

#### Ch06 Skills 体系（中量改动，当前 1016 行 → 目标 1200+）

**补"失败"开场：**
你每次让 Claude 做部署都要写一大段 prompt 描述步骤（跑测试 → 构建 → 推镜像 → 更新 k8s），而且每次细节略有不同，偶尔漏掉"先切到 staging 环境验证"这一步。上个月就因为漏了这步直接部署到了生产。

**补判断力内容：**
- **Skill vs Hook vs CLAUDE.md 三选一决策树**（全教程最需要但不存在的一张决策树）：
  - 是偏好/建议 → CLAUDE.md
  - 是必须执行的检查 → Hook
  - 是可复用的多步骤工作流 → Skill
- Plugin 市场部分更新为当前真实状态，不夸大数量

**补"验证"：**
- 质量标准：Skill 触发准确率（track 误触发和漏触发次数）
- 排障：Skill 不触发 → 检查 description 措辞 → 检查 scope → 检查 `!command` 是否有输出 → 检查 `$ARGUMENTS` 替换顺序

#### Ch07 Hooks + Auto Mode（中量改动，当前 1494 行 → 目标 1700+）

**已有"失败"开场 ✓**（Claude 忘跑 lint）

**补 Auto Mode：**
新增一节 — Auto Mode 安全分类器的工作原理（独立的 Sonnet/Opus 分类器审查每个操作）、适用场景（93% 权限请求被批准的任务类型）、不适用场景（涉及未知基础设施的操作）。定位为 Hook 的自然延伸：Hook 是"你定义的自动检查"，Auto Mode 是"Claude 自带的安全分类器"。

**补 Hook 事件：**
教透 5 个核心事件（PreToolUse / PostToolUse / Stop / SessionStart / PostCompact），其余 16+ 以折叠 ReferenceSection 呈现。不列全表当教学内容。

**补"验证"：**
- agent handler 给一个完整可运行的示例（目前只有概念描述）
- Hook 有效性指标：拦截率 > 20% 说明太严（Claude 在做无用功），< 1% 说明太松
- 排障：Hook 误拦截 → `--no-hooks` 紧急绕过 → 事后修复流程

#### Ch09 Agent SDK + 程序化接入（重写，当前估计 600-800 行 → 目标 1200+）

**补"失败"开场：**
你度假了一周，回来发现 5 个 PR 堆积没人 review。或者：每次手动让 Claude 做 code review 要 10 分钟，一天 20 个 PR 就是 3 小时人力。

**重写内容：**

| 节 | 内容 |
|---|------|
| 9.1 四种接入模式 | 保留现有决策树（好的部分） |
| 9.2 CLI 模式实战 | `claude -p` 完整参数 + 一个可运行的批量脚本（扫描 TODO 注释生成报告） |
| 9.3 SDK 最小示例 | 一个 Python PR review bot（收到 webhook → 拉 diff → 分析 → 评论到 PR），不写完整 SDK 教程 |
| 9.4 CI/CD 集成 | **完整可复制的 GitHub Actions workflow**：PR 触发 → Claude review → 评论 → 状态检查。含 secrets 管理、超时、费用限制 |
| 9.5 定时任务 + Channels | CronCreate 本地定时 + Channels（Telegram/Discord）简介 |
| 9.6 无人值守安全 | 三件事：超时熔断（`--max-turns`）、预算上限、凭证清洗（`CLAUDE_CODE_SUBPROCESS_ENV_SCRUB`） |

**补"验证"：**
- 质量标准：CI 集成后 PR review 覆盖率 100%，平均响应 < 5min
- 排障：CI 中超时 → 检查 `--max-turns` → 检查输入大小 → 检查 `--bare` 模式

### P1 — 弱章节加厚

#### Ch08 Subagent → Agent Teams（大量改动，当前 1660 行 → 目标 1800+）

**补"失败"开场：**
设计一个读者可以自己复现的实验 — 在长会话中（上下文 > 70%），重复早期的一条精确指令，对比输出质量差异。引用已有数据（上下文 > 70% 精度下降）。子代理的动机是"上下文防火墙"。

**补内容：**
- 每种内置类型（Explore/Plan/General-purpose）给完整调用代码 + 返回结果 + 成本估算
- 自定义 Agent 定义（frontmatter: effort/maxTurns/disallowedTools/model）
- **Worktree 隔离实操**：创建机制（磁盘上的真实 git worktree）、文件可见性、合并策略、完整示例
- **Agent Teams 完整教学**：共享任务列表、`SendMessage` 跨代理通信、拓扑决策树（扇出/链式/协作）
- **长时运行代理**：Anthropic 的 Initializer + Coding Agent 模式和 GAN 三代理架构（Planner/Generator/Evaluator）

**补"验证"：**
- ROI 决策树：任务 < 2min 直接做，> 5min 且可拆 → 子代理
- 质量标准：子代理 token 消耗 / 手动做的消耗 < 1.5x（否则不划算）
- 排障：低质量结果 → 检查 prompt 上下文是否给足 → 检查 maxTurns → 检查模型选择

#### Ch10 工作流设计原则（重写核心，当前 695 行 → 目标 1000+）

**补"失败"开场：**
具体案例 — 一个团队用了 Hook 保证每次提交通过 lint 和测试（Ch07 做到了），但一个大功能做了三天才发现数据库 schema 设计有根本性问题。原因：没用 Plan Mode 先做架构验证就直接开写了。有保障（Hook）但没结构（Plan）仍然会翻车。

**重写核心结构：**
1. 回顾 Ch03-09 的 8 次 失败→响应 循环，总结规律
2. 从经验中归纳三原则（Spec 驱动 / 上下文隔离 / 验证循环）— 原则从做中来，不是先讲后证
3. **诊断框架**（交互式 DecisionTree）：Claude 表现不对时的排查路径
4. 教读者为新项目设计 Harness："遇到什么问题就加什么组件"的迭代思维
5. 方法论对比（GSD/BMAD/RIPER）降级为折叠 ReferenceSection

#### Ch11 治理、风险与落地（扩写，当前 1321 行 → 目标 1600+）

**补"失败"开场：**
L1 开发者用 Auto 模式，Claude 修改了核心支付模块引入微妙的 regression bug（金额计算精度丢失），通过了 code review（reviewer 信任了 Claude 的修改），在生产环境才暴露 — 3 天后财务对账发现差异。

**补内容：**
- **落地路线图合入**：
  - 小团队（5-15 人）月度计划：Week 1 统一 CLAUDE.md + 权限分级 → Week 2-3 Hook 流水线 + review 流程 → Week 4+ 子代理试点
  - 中大团队（50+ 人）季度计划：Managed Policy 部署 + `managed-settings.d/` + SDK 集成 CI/CD + 指标看板
- **成本治理量化**：每人每日预算公式、异常告警（token 消耗 > 日均 3x 触发告警）
- L1→L2 具体考核标准：配对 review 达标次数 + 独立 Plan Mode 项目完成数 + bug 率不高于团队均值持续 3 月
- **事故响应**："谁 approve 谁负责"原则 + 事后复盘模板

### P2 — 轻量更新

#### Ch01（小改动）

- 权限表加 Auto Mode 行（安全分类器简介）
- 1.3 末尾加 Harness Engineering 迭代过程的引入段落（失败→诊断→响应→验证）
- 1.4 Token 经济学补 Opus 4.6 定价 + effort 三档对 token 影响 + 衰减临界点（70%/85%/90%）
- 开头加受众定位段（vs Cursor/Copilot 的区别）

#### Ch02（极小改动）

- 开头加受众定位段（"这章教的是 Claude 特有的精确控制技巧"）

#### Ch03（小改动）

- 开头给 API 命名为 TaskFlow + 受众定位段（Agentic Engineering 术语）
- 末尾加痛点→Harness 组件映射预告表
- 补行业风险数据（1.75x 逻辑错误率、45% 安全漏洞率、41% 代码流转率）

#### Ch05（小改动）

- RBAC 案例显式连接到 TaskFlow
- 补"Plan 执行失败的回退策略"小节

### P3 — 全教程横切改进

- **行业数据注入**：40.8% 采用率、Gartner "60% 代码将由 AI 生成"等数据分散到各章 QualityCallout
- **Harness Engineering 线索强化**：每章开头标注"本章解决的问题"和"对应 Harness 的哪个组件"
- **Channels / /loop**：作为 Ch09 的一小节提及，不深展

---

## 八、四种能力的交付验证

教程完成后读者应具备四种能力：

| 能力 | 含义 | 在哪里教 | 验证方式 |
|------|------|---------|---------|
| **设计** | 面对新项目，决定需要哪些 Harness 组件 | Ch10 诊断框架 + Harness 设计方法 | Exercise：给一个项目描述，读者列出 Harness 方案并说明理由 |
| **评估** | 判断当前 Harness 是否有效 | 每章"验证"阶段的质量标准 | 每章给出可量化指标（如风格一致率 > 80%、Hook 拦截率 1%-20%） |
| **诊断** | Claude 表现不对时定位问题 | Ch10 诊断框架 DecisionTree | Exercise：给一个"Claude 行为异常"描述，读者走诊断流程 |
| **演进** | 从个人 Harness 推广到团队 | Ch11 落地路线图 | Exercise：为自己的团队写一份 Harness onboarding 文档 |

---

## 九、执行优先级

```
Phase 1 — P0：多数读者使用的章节补深度
├── Ch04 CLAUDE.md 扩写（失败开场 + TaskFlow 对比 + 验证标准）
├── Ch06 Skills 扩写（失败开场 + 三选一决策树 + 排障）
├── Ch07 Hooks 扩写（Auto Mode + 5 核心事件教透 + 有效性指标）
└── Ch09 Agent SDK 重写（CLI/SDK/CI-CD 完整代码 + 安全）

Phase 2 — P1：弱章节加厚
├── Ch08 Subagent 加厚（Agent Teams + Worktree + 长时运行 + ROI）
├── Ch10 工作流重写核心（回顾→归纳→诊断框架）
└── Ch11 治理扩写（落地路线图 + 成本量化 + 事故响应）

Phase 3 — P2：轻量更新
├── Ch01 补 Auto Mode + 迭代过程 + 受众定位
├── Ch02 补受众定位段
├── Ch03 补 TaskFlow 命名 + 预告表 + 行业数据
└── Ch05 补失败回退 + TaskFlow 连接

Phase 4 — P3：横切改进
├── 行业数据注入各章
├── Harness Engineering 线索标注
└── toc.ts + HomePage 更新
```

---

## 十、不做的事

- **不新增章节** — 11 章保持不变，在现有框架内加深度
- **不写完整 SDK 教程** — Ch09 给最小示例，完整 SDK 引导到官方文档
- **不发明方法论框架** — 用 Anthropic 原生的 Harness Engineering 迭代过程
- **不列全所有特性** — 教透核心特性，其余以折叠参考呈现
- **不强行贯穿同一个项目** — Ch03-07 用 TaskFlow，Ch08-11 用各自自然的场景
