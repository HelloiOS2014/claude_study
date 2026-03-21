# Claude Code 使用教程设计文档

> 日期：2026-03-21
> 状态：待审阅

---

## 一、项目概述

### 目标

制作一份由浅入深的 Claude Code 使用教程，标准是**任何人拿着教程都能从零上手并逐步步入高阶**。教程不是功能参考手册，而是按认知阶梯编排的能力养成系统。

### 受众

教程面向企业内部所有技术相关人员。不按职级区分，按 Claude Code 使用熟练度分级：

- **L1 基础使用者**：能用 Claude Code 完成基本编码任务
- **L2 熟练使用者**：能用 Plan Mode、Hooks、Skills 构建高效工作流
- **L3 深度使用者**：能用 Subagent、Agent Teams、MCP 做全流程 AI 辅助开发

管理者（Tech Lead、架构师、CTO、CEO）不需要单独的内容区域——技术教学中自然融入企业关注点，每个知识点的叙事弧从实操一路延伸到决策和治理层面。

### 核心设计原则

1. **按开发生命周期编排**：AI 介入越晚 = 操作越基础，介入越早 = 操作越高阶。功能不单独成章，在需要时自然引入
2. **双线交织**：每章 = 能力教学（主线）+ 质量保障与监管（副线）
3. **深度自然分层**：同一段内容，L1 拿走实操，L2 拿走原理和决策框架，L3/管理者拿走治理方案和风险判断
4. **不割裂**：没有"管理者专区"或"架构师专题"——一条叙事线服务所有人
5. **诚实**：不回避 AI 的缺陷和风险（bug 率 1.7x、密钥泄露 2x、生产事故），正视问题才能解决问题
6. **不推销**：不推广 Anthropic 特定计划或产品，聚焦用 Claude Code 自带能力解决问题

### 每个知识点的叙事弧

```
实操（L1 拿走）
  → 原理（L2 拿走）
    → 决策框架（L2/L3 拿走）
      → 风险与对策 + 团队/企业关注点（管理者拿走）
        → 失败案例（所有人拿走教训）
```

### 四支柱教学法

Ch0-Ch8 的每章应尽量覆盖以下四个支柱（Ch9 作为总结章例外）：

| 支柱 | 含义 |
|------|------|
| 认知模型 | Claude Code 底层在干什么，原理是什么 |
| Prompt 工程 | 同一个意图，不同说法的效果差异，逐词拆解 |
| 组合实战 | 多个功能串联成完整工作流 |
| 失败学 | 真实翻车 + 诊断 + 修复 |

---

## 二、技术选型

### 教程载体

React SPA，整合 @remotion/player 实时渲染教学动画。

| 层面 | 选择 | 理由 |
|------|------|------|
| 构建工具 | Vite + React | 快，和 Remotion 共享 React |
| 路由 | React Router | 章节导航 + 锚点定位 |
| 动画 | @remotion/player | 实时渲染，复用已有 Remotion 组件 |
| 样式 | Tailwind CSS | 快速开发，深色主题友好 |
| 代码高亮 | react-syntax-highlighter | 已有项目在用 |
| 语言 | 中文为主 | 关键术语保留英文原文 |

### Remotion 组件复用

已有可复用：ChapterCard、CodeShowcase、DataChart、LowerThird、EndCard、ClaudeCodeIntro

需要新建约 10 个动画组件（详见第六节）。

### 贯穿实战场景

不用一个项目贯穿全教程（Vibe Coding 和 Agent Teams 的复杂度跨度太大，强行用同一个项目会牵强）。改为每个 Part 有递进的实战场景，后一个 Part 的输入是前一个 Part 的产出：

| Part | 实战场景 | 承接关系 |
|------|---------|---------|
| Part 0 | 解剖实验：不写代码，观测 token 消耗 | 建立直觉 |
| Part 1 | 从零建 Express REST API（CRUD + 验证 + 错误处理） | Part 2 的自动化对象 |
| Part 2 | 为 Part 1 的 API 搭建自动化 + 并行化体系 | Part 3 的团队项目基础 |
| Part 3 | 跨层并行开发 + 外部集成 + CI/CD | Part 4 的审计目标 |
| Part 4 | 对前面产出做质量审计 + 治理体系搭建 | 最终交付物 |

---

## 三、章节设计

### 首页

- ClaudeCodeIntro Remotion 动画
- 段位带概览（L1 → L2 → L3 渐进路线图）
- 推荐阅读路线表格：

| 你的情况 | 推荐路线 |
|---------|---------|
| 第一次使用 Claude Code | Ch0 → Ch1 → Ch2 → ... 顺序读 |
| 有经验，想快速进阶 | Ch0（快速过）→ Ch3 → Ch5 → Ch6 → 感兴趣的章节 |
| 关注架构与治理 | 每章全读，重点关注决策框架和团队治理段落 |
| 需要决策依据，时间有限 | Ch0 摘要 → 每章质量线段落 → Ch9（风险、治理与落地） |

---

### Part 0：认知基础

#### Ch0 — Claude Code 的底层世界

**目标**：读完能画出 Claude Code 的完整运行链路图，能预判每个操作的资源消耗。所有人必读——即使是管理者，也需要理解基本原理才能做出正确的治理决策。

##### 0.1 一条请求的完整旅程

**能力教学**：

- 实操：打开 Claude Code，输入"读一下 package.json"，观察过程
- 完整链路拆解：
  ```
  你的输入 → System Prompt 组装（110+ 条件片段、7 层优先级）
  → LLM 推理 → 选择工具（Read）→ PreToolUse Hook 检查
  → 权限验证（deny→ask→allow 严格顺序）
  → Bash 安全两阶段分析（前缀检测 + 路径提取，Haiku 模型自动执行）
  → 执行工具 → PostToolUse Hook → 结果注入上下文
  → LLM 再次推理 → 回复
  ```
- 每一步的 token 成本：Bash 固定 245 token 开销、Read 全文 token 计费、Edit 仅 diff
- System Prompt 的 7 层优先级：Managed Policy → Built-in → Session → CLAUDE.md(user message) → Rules → Auto Memory → User Message。冲突时高层级赢（CLAUDE.md 写"详细解释"会被内置 prompt"简洁回答"覆盖）

**质量线**：

- 这条链路中的每一步都是可拦截的审计点——Hook 插在哪里、权限卡在哪里
- 团队治理角度：了解数据流向才能评估风险。无论使用什么计划，以下技术手段（Hook + 权限 + CLAUDE.md）都能在你这一端控制数据暴露范围

**失败案例**：展示一个因权限配置不当导致 Claude 访问了不该访问的文件的事件链——它为什么发生、怎么预防

🎬 动画：`RequestLifecycle` — 链路节点逐一亮起 + 每步 token 计数器

##### 0.2 上下文窗口经济学

**能力教学**：

- 实操：用 `/cost` 和 `/context` 亲手测量——读 500 行文件 ≈ X token、Grep 搜索 ≈ X token、10 轮对话后上下文用量
- 量化数据：200K 窗口实际可用 ~167K（33K 内部缓冲）；auto-compact 在 95-98% 触发；compact 压缩率 60-80%
- 关键认知：**质量在 20-40% 使用量时就因注意力稀释开始衰减**——不是等快满了才管理，是一直要管理
- "Lost in the Middle" 效应：首因（CLAUDE.md 位置）+ 近因（最后一句话）权重高，中间被忽略
- 决策框架：`/compact`（60%+ 主动压缩）vs `/clear`（换任务重置）vs 新会话（HANDOFF.md 续接）vs 1M context 模型
- `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` 环境变量手动调阈值

**质量线**：

- 上下文 = 成本。每日人均 ~$6（90%+ 缓存读取），P90 $12。不懂上下文管理的团队成本可翻倍
- 上下文饱和是质量事故的主要诱因——Claude 在上下文满时的回复质量显著下降，可能产出与前面矛盾的代码

**失败案例**：开发者在一个 session 做 5 个不相关任务，上下文爆满，auto-compact 丢失关键架构决定，后续实现全部偏离

🎬 动画：`TokenEconomy` — 上下文窗口可视化

##### 0.3 模型、工具与权限

**能力教学**：

- 实操：`/model` 切换体验差异；Shift+Tab 循环三种权限模式
- 模型路由：Haiku 自动用于 Bash 安全分析、Explore subagent、WebFetch、会话摘要（你没有选择权，系统自动路由）；你选的模型只影响主推理
- 工具集：Read/Edit/Write/Bash/Grep/Glob/Agent/Skill 各自的能力和成本
- 权限安全模型关键盲区：**Read/Edit deny 规则不阻止 Bash 中的 cat/sed**。`deny Read(.env)` 只挡 Read 工具，`cat .env` 在 Bash 里照样执行。Ch5 会教怎么用 Hook 堵这个漏洞
- 权限 5 层优先级：Managed > CLI > Local > Shared > User。任何层级的 deny 不可被低层级 allow 覆盖

**质量线**：

- 权限分级是监管基础设施。按使用熟练度（L1/L2/L3）+ 变更影响范围分级——和职级无关
- 对于有组织账户的团队，可通过 Managed Policy 强制策略，使用者无法绕过。没有组织账户时，通过 git 提交的 CLAUDE.md + 项目级 settings.json 也能实现类似的团队约束（只是使用者理论上能本地覆盖）
- Auto 模式的真实风险：完整展示一个 Auto 模式下 Claude 误删 `.env` 的事件链——上下文中有模糊的"清理不需要的文件"指令

##### 0.4 市场位置与能力边界（诚实评估）

**能力教学**：

- Claude Code 定位："委托者"（帮你做事）vs Cursor/Copilot"加速器"（让你打字更快）——不冲突，可共存互补
- 2026 数据：87% 开发者日常使用 AI 工具

**质量线**：

- 诚实的能力边界：AI 代码 bug 率 1.7x 人类（CodeRabbit 470 PR 研究）、48% 含安全漏洞、重复代码 8x 增长
- 生产事故：Amazon AWS AI agent 删环境（15h 宕机）、支付系统 AI 静默移除熔断器（$28 亿损失）——共同根因：零人类审查
- **教程后续每一章都在教如何避免这些情况——既教怎么用，也教怎么确保用对了**

---

### Part 1：编码阶段介入（L1 能力养成）

> AI 介入开发生命周期的最后环节——编码实现。这是最基础也是最常用的介入方式。

#### Ch1 — 用 AI 写代码：从对话到精确控制

**目标**：掌握和 Claude Code 高效沟通的方法论，能精确控制 AI 的行为。

##### 1.1 Prompt 解剖实验室

**能力教学**：

- 实操：同一个任务（"优化这段代码的性能"），5 种写法，亲自运行对比结果
- 逐词拆解每种写法为什么有效/无效：
  - ❌ "优化这段代码" → 无约束，AI 随机选方向
  - ⚠️ "优化这段代码的性能" → 方向对但可能做微优化而非架构优化
  - ✅ "这段代码处理 10000 条数据需要 8 秒。阅读代码后分析瓶颈。只分析不修改。"
    - "10000 条/8 秒" → 给具体度量，Claude 知道瓶颈级别
    - "阅读代码后" → 强制先 Read 再回答
    - "只分析不修改" → 约束工具调用边界
  - ✅✅ 完整版（指定文件 + top 3 排序 + 2 方案对比 + 不改代码）逐项分析为什么最有效
- 契约式 prompt 结构：Role(1行) → Success Criteria → Constraints → Uncertainty Handling → Output Format

🎬 动画：`PromptDissection` — 契约式 prompt 结构逐行展开 + 每部分的作用标注

**质量线**：

- prompt 质量直接影响代码质量——48% AI 安全漏洞中很大一部分是 prompt 不精确导致的（"帮我写登录"没提安全要求，Claude 不会主动做密码哈希）
- **Prompt 工程不是效率工具，是质量工具**——团队应该将 prompt 编写能力纳入 AI 使用培训

##### 1.2 特殊权重词与结构化技巧

**能力教学**：

- 实操：在 CLAUDE.md 中用 "IMPORTANT: 所有 API 必须验证输入" vs "所有 API 应该验证输入"，对比遵循率
- 词典：IMPORTANT/CRITICAL/MUST/NEVER 的强化效果；XML 标签（`<instructions>`/`<constraints>`）创建语义边界防指令泄漏；"ultrathink" 触发深度推理；编号步骤 vs 自然语言段落
- 多步指令 XML 协议模板（task/context/instructions/constraints/verification）
- phase 分离（Research → Plan → Execute → Review）防上下文污染

##### 1.3 Token 效率 12 技

**能力教学**：

- 实操：精确路径 vs 模糊描述的 token 对比
- 12 个技术（每个给量化收益 + 适用场景）：
  1. Skills 按需加载（省 ~15K token/session）
  2. 预处理 Hook（万行日志 → 百行错误）
  3. `.claudeignore` 排除（仅 `.next/` 省 30-40%）
  4. 精确文件路径（vs "帮我找找"）
  5. Subagent 隔离冗长输出
  6. 模型分级路由（Haiku 探索 / Sonnet 实现 / Opus 架构）
  7. Tool Search 自动延迟加载（85% 减少）
  8. 定向 `/compact`（自然语言引导保留什么）
  9. 单轮交互处理关键任务（避免多轮稀释）
  10. `@引用` 精确文件 vs 让 Claude 搜索
  11. 管道输入 `git diff | claude -p` 脚本化
  12. `.claudeignore` + 精确 @引用的组合

**质量线**：

- token 效率 = 成本效率 = 质量效率（上下文越满，产出质量越低）
- 12 个技术累计省 60% 上下文。团队推广后可显著降低月度使用成本

##### 1.4 约束语的精确用法

**能力教学**：

- 对比实验（每对给 Claude 的实际行为差异）：
  - "先不要改代码"（有效约束工具调用）vs "请谨慎修改"（无效）
  - "一步一停"（真的停）vs "按步骤执行"（可能连续跑）
  - "如果不确定就问我"（触发澄清）vs "尽力做"（可能幻觉）
  - "用项目现有的 XX 模式"（锚定代码风格）vs "用最佳实践"（Claude 自由发挥）
- 上下文投喂策略：@引用 / 让 Claude 搜索 / 管道输入 / 粘贴代码——各自的 token 成本和场景

##### 1.5 应对 Claude "遗忘"

**能力教学**：

- 原理：不是真的遗忘——上下文饱和后的注意力稀释，或 compact 后的信息丢失
- 7 种对策（详细配置）：
  1. 定向 `/compact`（`/compact preserve the API design decisions`）
  2. CLAUDE.md 锚定（每轮重载，关键规则不会被 compact 摘要掉）
  3. HANDOFF.md 跨会话续接
  4. PreCompact Hook 自动保存上下文
  5. Session checkpoint（`~/.claude/projects/[hash]/[session].jsonl`）
  6. 新会话 + spec 文件（最干净的上下文）
  7. 1M context 模型

**失败案例**：30 轮对话后 Claude 产出与前面矛盾的代码——诊断过程（检查 `/context` 发现 85% 使用率）+ 修复方法（compact + 重申关键决定）

🎬 动画：`PromptComparison` — 好/坏 prompt 左右对比 + Claude 反应差异

---

#### Ch2 — 用 AI 改代码：重构、调试与优化

**目标**：从"说需求出代码"进化到"精确控制每一步"。理解 Vibe Coding 的能力边界。

##### 2.1 Vibe Coding 的能力边界测试

**能力教学**：

- 实操：用纯 Vibe Coding 从零建 Express API（CRUD + 输入验证 + 错误处理）
- 记录每轮的 token 消耗和代码质量
- 观测：第 1-2 轮顺利 → 第 3 轮风格不一致 → 第 4 轮"忘记"设计决定
- 画出 "质量 vs 上下文使用量" 曲线——这条曲线是 Ch3 的动机

**质量线**：

- 59% 开发者承认使用了自己不完全理解的 AI 代码
- 委派式使用 AI 的开发者理解力测试得分低 17%（Anthropic 自己的研究）
- **Vibe Coding 是"理解力债务"的最大来源**——管理者需要关注团队中不加思考就接受 AI 代码的行为

##### 2.2 渐进式控制的三个等级

**能力教学**：

- 同一个中等任务三种做法各做一遍，对比：
  - 全 Vibe："帮我加用户注册"
  - 半控制："用 Prisma + bcrypt，先只做 POST /register，输入验证用 zod"
  - 全控制：Plan Mode（Ch3 预览）
- 对比维度：代码质量、token 消耗、返工次数、你对代码的理解程度
- 决策框架：Vibe 够用（小脚本/一次性工具/探索原型）vs 必须精确控制（生产代码/安全相关/多人协作）

##### 2.3 Slash 命令的战术使用

**能力教学**：

- `/compact` 最佳时机：完成一个阶段时主动压缩，不等自动触发 + 自然语言引导
- `/clear` vs `/compact` 决策：不同任务 `/clear`，同任务太长 `/compact`
- `Esc+Esc` rewind 三种模式（对话+代码 / 仅对话 / 仅代码）+ 限制（不追踪 Bash 命令和手动编辑）
- `/cost` 每 15 分钟看一次的习惯
- 会话卫生：不在一个会话做不相关的事

##### 2.4 Claude Code 自身的调试

**能力教学**：

- `/doctor`（检查安装/设置/MCP/插件/上下文）
- `/debug` skill（读 session debug log）
- `--verbose` 和 `--mcp-debug` 看内部过程
- session log 位置和解读
- 隐藏环境变量：`DEBUG_SDK`、`CLAUDE_CODE_DEBUG_LOGS_DIR`、`MCP_TIMEOUT`
- 常见问题速查表

##### 2.5 编码阶段的 Review 策略

**质量线**：

- 变更规模通常小（1-5 文件），review 策略：
  ```
  AI 改完 → 逐行看 diff → 能解释每行为什么这样改 → 跑测试 → 提交
  ```
- 关键原则：不能解释就不接受。不只看改了什么，还看漏改了什么
- L1 使用者特殊要求：每个 PR 附"我理解的变更意图"——不接受"Claude 改的"作为理由
- 需求对照检查：用表格逐条比对需求点是否实现

🎬 动画：`VibeCodingCurve` — 质量 vs 上下文使用量折线图

---

### Part 2：设计阶段介入（L2 能力养成）

> AI 介入开发生命周期的中间环节——方案设计、规范建立、自动化搭建。需要判断力，不是照着做就行。

#### Ch3 — 用 AI 做方案设计：Plan Mode + 结构化思考

**目标**：掌握 Plan Mode 的思维框架，学会在实施前强制插入思考和审查环节。

##### 3.1 Plan Mode 的底层实现

**能力教学**：

- 原理：Plan Mode 改变系统 prompt 中的工具权限约束——Write/Edit 被禁用。不是 Claude "自觉"不改
- Shift+Tab 循环三种模式（Normal → Accept Edits → Plan）

##### 3.2 四阶段思维框架

**能力教学**（完整实战——在 Ch2 的 Express API 上加 RBAC）：

- **Explore**（5 分钟）：
  - prompt："先不做任何修改。阅读以下内容，告诉我你的理解：1.当前用户模型 2.API 路由结构 3.ORM 和 migration 方式 4.有无现有权限代码"
  - 逐词分析为什么这样写（限制阅读范围省 token、只问现状不问方案、确认理解对齐）
  - 判断点：Claude 的理解和你的认知一致吗？不一致现在纠正成本最低

- **Diagnose**（5 分钟）：
  - prompt："需求约束：扁平标签式权限、向后兼容、migration 可回滚。分析实现路径、必改文件、风险点"
  - 为什么先给约束再问方案——约束是过滤器，砍掉 80% 不可行路径
  - "我可能没想到的问题"——让 Claude 挑战你的需求

- **Plan**（10 分钟）：
  - prompt："制定具体实施计划：每步改什么文件、步骤间依赖关系、每步验证方式"
  - Ctrl+G 在编辑器中直接改计划
  - 没有验证步骤的计划等于没有计划

- **Execute**（分步进行）：
  - "按计划执行 Step 1。完成后停下来等我确认。"
  - 一步一停，每步运行验证命令，确认后继续
  - 偏离时立刻切回 Plan Mode 修正

**质量线**：

- Plan 文档的审查清单：每步是否有验证方式？文件改动范围是否合理？有无遗漏的影响范围？
- 先 review Plan（20 行文档）比事后 review 15 个文件的 diff 效率高 10 倍
- **Plan Mode 的本质是强制在实施前插入思考和审查环节**——Amazon $28 亿事故的根因就是缺少这个环节
- 团队治理：可要求团队所有涉及 3+ 文件的变更必须有 Plan 文档并经过审查

##### 3.3 决策框架

**能力教学**：

| 信号 | 做法 | 原因 |
|------|------|------|
| 一句话能描述改什么 | 直接做 | 不需要规划 |
| 3+ 文件 | 规划 | 多文件需要协调依赖 |
| 不熟悉这部分代码 | 先 Explore | 建立心智模型再决定 |
| 说不清"做完是什么样" | 先 Diagnose | 需求不清，Plan 也救不了 |
| 上下文 > 60% | 先 /compact 再规划 | 窗口不够时规划质量下降 |
| 涉及 DB schema | 必须规划 | migration 回滚代价太高 |
| 需要他人审查 | 规划 + 导出 | Plan 就是 PR description 草稿 |

- Extended Thinking：Plan + `Alt+T` 的实测对比；"ultrathink" 单次触发
- 多方案竞标：让 Claude 给 2-3 个方案并对比

##### 3.4 Plan 的复用价值

**能力教学**：Plan 产出直接变成 PR Description / 设计文档 / Code Review checklist / 任务拆分卡片——每种转换的格式

##### 3.5 失败模式

- 规划过度（20 分钟规划结果需求变了）→ 不确定的需求只规划第一步
- 规划太粗（"重构认证模块"没到函数级别）→ 要求细化到伪代码
- 没有验证步骤（3 步后才发现 Step 1 错了）→ 每步必须有可执行的验证命令
- 上下文快满还在规划 → 先 /compact 再规划

🎬 动画：`PlanModeFlow` — Explore→Diagnose→Plan→Execute 状态切换

---

#### Ch4 — 用 AI 建团队规范：CLAUDE.md + 项目记忆

**目标**：将团队知识持久化，让 Claude 的行为符合团队标准。

##### 4.1 注入机制

**能力教学**：

- CLAUDE.md 是 user message（不是 system prompt！）→ 会被内置 system prompt 覆盖
- 层级：Managed Policy → 全局 → 祖先目录 → 项目根 → local → 子目录（按需）→ rules/*.md（条件）
- `@path/to/import` 递归最多 5 层
- 子目录 CLAUDE.md 只在 Claude 访问该目录时加载（按需，不预加载）

##### 4.2 写好 CLAUDE.md 的科学

**能力教学**：

- 逐行分析一个真实 CLAUDE.md 的 token 性价比
- 黄金法则："删掉这行，Claude 会犯错吗？"
- 反面教材（无效行）："写干净代码" / "使用 ESLint" / 逐文件描述目录结构
- 正面教材（有效行）：非标准构建命令、团队特有约定、不明显的 gotcha
- 量化：50 行 × ~30 token × 30 轮对话 = ~45K token。每行都在反复花钱
- IMPORTANT/MUST 等强化词在 CLAUDE.md 中的实测效果

**质量线**：

- CLAUDE.md 提交到 git，可以 PR review——**像对待代码一样对待 AI 的行为规范**
- L3 使用者可用 CLAUDE.md 执行架构约束："IMPORTANT: 所有新 API 必须遵循 hexagonal architecture"

##### 4.3 Auto Memory 系统

**能力教学**：

- `MEMORY.md` 前 200 行自动加载；topic 文件按需读取
- memory 类型（user/feedback/project/reference）各自的写入时机
- 跨会话知识积累

##### 4.4 团队 CLAUDE.md 治理

**能力教学 + 质量线（自然融合）**：

- 谁写：tech lead 定初版，全员 PR review 修改
- 怎么测：改 CLAUDE.md 后让 Claude 做同一件事对比前后
- 何时裁剪：月度审计
- Monorepo 策略：根目录（全局规范）→ packages/*（包级约定）→ 子模块（细节）
- `/init` → 使用 → 发现犯错 → 加规则 → 验证 → 定期裁剪 的迭代闭环

**四支柱补齐**：

- Prompt 工程：CLAUDE.md 的写法本身就是 prompt 工程——对比同一条规则的不同写法（"用 ESLint" vs "IMPORTANT: 所有新代码必须通过 eslint --fix，不允许 any 类型"）对 Claude 行为的影响
- 组合实战：CLAUDE.md + Auto Memory + `/init` 的组合，构建会"自进化"的项目记忆系统
- 失败案例：CLAUDE.md 写了 80 行，token 性价比极低，其中 60% 是 Claude 本来就知道的信息——诊断过程（逐行评估"删掉会犯错吗"）+ 裁剪后效果对比

🎬 动画：`ClaudeMdHierarchy` — 文件层级树逐步展开 + 优先级标注

---

#### Ch5 — 用 AI 做自动化：Hooks + Skills

**目标**：把手动的质量保障工作变成自动执行。

##### 5.1 Hook 事件模型

**能力教学**：

- 实操：最简 PostToolUse Hook——Edit 后自动 prettier
- 9+ 事件的触发时机、matcher、payload
- 执行顺序：Managed → Global → Project → Plugin
- 三种返回：allow / deny(exit 2) / ask

##### 5.2 四种 Hook 类型与选型

**能力教学**：

- Command / Prompt / Agent / HTTP 各自的能力和限制
- 决策树：纯确定性 → command；语义判断 → prompt；多步验证 → agent；外部通知 → http
- 每种完整配置 JSON（可复制粘贴）

##### 5.3 实战：自动化质量流水线

**能力教学 + 质量线（深度融合）**：

在 Ch2 的 Express API 上搭建完整流水线：

```
PostToolUse(Edit/Write) → prettier --write
  → PostToolUse(Edit/Write) → eslint --fix
    → Stop hook(prompt) → "所有任务完成了吗？测试跑了吗？"
      → 未完成 → block，继续
      → 完成 → allow
```

加安全门控：
```
PreToolUse(Bash) → 拦截 rm -rf / DROP TABLE / force push
PreToolUse(Read/Edit) → 保护 .env 等敏感文件
PreToolUse(Bash) → 同时拦截 cat .env（堵 Ch0 讲的权限盲区）
```

每个 Hook 给出：完整 settings.json + 脚本代码 + 边缘情况处理 + 调试方法

**质量线**：

- Hook 是**在 AI 操作和代码提交之间插入自动化质量检查的机制**
- 密钥泄露防护：PostToolUse 扫描输出中的密钥模式
- parry 注入扫描集成
- PreCompact Hook 保存关键上下文（解决 Ch1 的遗忘问题）
- 团队可通过 `allowManagedHooksOnly: true` 阻止使用者自定义或绕过 Hook

##### 5.4 Skills 系统

**能力教学**：

- Skills vs Commands 区别
- 12 个 frontmatter 字段详解
- 动态上下文注入 `` !`command` ``
- 字符串替换 `$ARGUMENTS` 系列
- `context: fork` 隔离执行
- `disable-model-invocation: true` 安全控制

##### 5.5 实战：从零写 Code Review Skill

**能力教学**：

- 完整 Skill 文件（frontmatter + prompt 模板 + 动态上下文）
- 逐行解释设计决策
- 测试和迭代优化

**质量线**：

- 自定义 Skill 将团队最佳实践编码为可复用流程
- 好的 Code Review Skill 在人类审查前过滤 80% 低级问题

##### 5.6 Plugin 系统

**能力教学**：

- Plugin = Skills + Agents + Hooks + MCP 的打包
- 目录结构和 manifest
- 社区 Plugin 索引

##### 5.7 Hook 失败模式

- 死循环识别与修复
- `/hooks` 查看 + 日志定位
- 性能影响评估

##### 5.8 设计阶段的 Review 策略

**质量线**：

- 变更规模中等（5-15 文件），核心转变：**先 review 计划，再抽查实现**
  ```
  Plan 产出 → 人 review Plan（成本低价值高）
  → Plan 通过 → 执行 → 只需抽查"执行是否符合计划"
  ```
- Hook 自动化分担 review 负担后，人类只需关注：逻辑正确性、设计合理性、安全性

🎬 动画：`HookEventFlow` — 事件触发 → Hook 执行 → 结果反馈时序图

---

### Part 3：需求与架构阶段介入（L3 能力养成）

> AI 介入开发生命周期的早期环节——技术调研、架构决策、全流程管理。需要全局视野。

#### Ch6 — 用 AI 做技术调研：Subagent 并行探索

**目标**：掌握上下文隔离和并行化，用 Subagent 把昂贵操作赶出主上下文。

##### 6.1 上下文隔离模型

**能力教学**：

- Subagent 只收到 prompt + 最小 system prompt，不收主会话历史
- 返回摘要而非完整 transcript
- Subagent transcript 独立存储，不受主会话 compact 影响
- **这就是为什么 Subagent 是上下文管理的核心武器**

##### 6.2 内置 vs 自定义 Subagent

**能力教学**：

- 内置 5 种（Explore/Plan/General-purpose/Bash/Guide）解剖
- 自定义 `.claude/agents/*.md` 的 15 字段 frontmatter 完整讲解
- 实操：写一个 code-reviewer agent 和一个 security-scanner agent
- 给 Subagent 写任务描述的 prompt 技巧——信息量不够返回垃圾，太多浪费 token

##### 6.3 关键模式

**能力教学**：

- **Worktree 隔离**：`isolation: worktree`，修改在副本中，主代码不受影响
- **持久记忆**：`memory: project`，展示 10 次调用后越来越聪明的 agent
- **成本控制**：Explore→Haiku / 实现→Sonnet / 架构→Opus + `maxTurns` 防跑飞
- **三阶段流水线**：pm-spec → architect-review → implementer-tester（每阶段 prompt 模板）
- **SendMessage 续接**：通过 agent ID 恢复完整上下文

##### 6.4 实战：并行 Bug 修复

**能力教学**：

- 主 Agent 规划 → Explore Subagent 搜索 → General-purpose 写修复 → 另一个写测试
- 并行执行 + 结果汇总

##### 6.5 Subagent 失败模式

- 改了不该改的文件 → worktree 隔离
- 返回垃圾 → prompt 信息量不够
- 耗尽 maxTurns → 任务粒度太大

**质量线**：

- Subagent 调研结果需要交叉验证——一个 Subagent 的发现让另一个 Subagent 验证
- Worktree 隔离 = 试错零风险的沙箱
- 成本可控：Haiku 搜索 ~¥0.05-0.1/次 vs 人工 20 分钟

🎬 动画：`SubagentFanout` — 主 Agent 分发任务 + 收回结果的扇出图

---

#### Ch7 — 用 AI 做架构决策：多角度分析与验证

**目标**：用 Agent Teams 和 MCP 做多维度架构验证和外部集成。

##### 7.1 Agent Teams 架构

**能力教学**：

- Subagent = 星型（单向汇报），Teams = 网状（peer-to-peer inbox + 共享任务列表）
- 为什么需要升级：测试 agent 需要知道后端 agent 改了什么 API——Subagent 模式下不知道，Teams 可以直接问
- 开启：`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`

##### 7.2 Teams 实战

**能力教学**：

- 跨层并行开发：Team Lead + 前端 teammate + 后端 teammate + 测试 teammate
- 任务分解：3-5 teammate、每人 5-6 任务、按文件所有权划分
- `blockedBy`/`blocks` 依赖管理
- 通信限制：teammate 文字输出互不可见，必须通过文件或任务更新通信
- 显示模式：Shift+Down 切换 vs tmux 多窗格

##### 7.3 高级模式

**能力教学**：

- 竞争假设：3 个 teammate 独立调查同一个 bug 的不同假设
- 9-agent Code Review（HAMY labs 方案）
- Anthropic Code Review 实现（5 reviewer、置信度评分、54% 实质建议、<1% 误报）

##### 7.4 MCP：连接外部系统

**能力教学**：

- MCP 协议原理：stdio / SSE / Streamable HTTP
- 实操接入：Playwright MCP（浏览器自动化）
- **自建 MCP Server**：
  - Python FastMCP 从零建数据库查询 MCP（完整代码）
  - TypeScript SDK 版本
  - MCP Inspector 测试
  - 安全：输入验证、认证、速率限制
- 多 MCP 编排：同时接入 DB + GitHub + Playwright
- 将 MCP 限定到 Subagent（避免 tool description 占满主会话）

**质量线**：

- Teams 的成本是线性增长——**不是省钱是省时间**
- 每接入一个 MCP 多一个攻击面——审核来源、限制权限、监控调用
- MCP 供应链风险：Cline/OpenClaw 事件（1184 恶意 skill）
- 团队治理：大变更（15-50+ 文件）的 Review 策略：
  ```
  第一层：自动化（CI 测试 + lint + 安全扫描）
  第二层：AI Review AI（独立 Subagent/Agent Teams 多角度审查，置信度过滤）
  第三层：人类战略审查（看 AI Review 报告 + Plan 文档 + 风险加权抽查关键文件）
  ```
- 风险加权抽查：安全/支付/DB schema/对外接口 → 必须人工看；格式/import/测试 → 信任自动化

**四支柱补齐**：

- Prompt 工程：给 Team Lead 和 Teammate 写任务描述的技巧——任务边界不清会导致 teammate 之间冲突（同时改同一个文件）。精确的任务描述模板（目标 + 文件范围 + 约束 + 完成标准）
- 失败案例：两个 teammate 同时修改了 `routes/index.ts`，产生冲突——诊断（任务分解时文件所有权没有明确划分）+ 修复（重新分解任务，每个 teammate 只触碰自己的文件集合）

🎬 动画：`AgentTeamsTopology` — 星型 vs 网状拓扑对比

---

#### Ch8 — 用 AI 管理全流程：从需求到交付

**目标**：将前面所有能力组合成完整的端到端工作流。

**四支柱**：

- 认知模型：各社区方法论的底层模型差异——Ralph Wiggum 是反馈循环、RIPER 是阶段隔离、GSD 是波次并行。理解模型才能判断什么时候用哪个
- Prompt 工程：不同方法论的 prompt 模板差异——Ralph 需要精确的 completion-promise、RIPER 需要阶段化指令、AB Method 需要 spec 格式化
- 组合实战：Context Priming（基底）+ RIPER（流程）+ Writer/Reviewer（质量关）的三层组合工作流
- 失败案例：Ralph Wiggum 没设 maxIterations，通宵跑了 200 次循环，花了 $200+ 但任务无法完成（因为成功标准定义不精确）——诊断 + 修复（精确的 completion-promise + maxIterations 安全阀）

##### 8.1 社区方法论深度拆解

**能力教学**（每种：完整原理 → 配置 → 5 分钟上手 → 适用场景 → 不适用 → 成本 → 组合方式）：

- **Ralph Wiggum**：Stop hook 循环自迭代。~$10.42/h。maxIterations 必须设。适合有测试的绿地项目。完整 settings.json + safety guardrails + 真实案例（YC hackathon $297 完成 6 repo）
- **RIPER-5**：5 阶段（Research/Innovate/Plan/Execute/Review）+ 3 agent 整合 + Memory Bank。适合复杂重构。完整配置 + slash 命令
- **AB Method**：Spec 驱动 + 顺序 mission + 8 专项 agent。`npx ab-method`。适合全栈开发
- **GSD (Get Shit Done)**：12 agent 编排 + 波次并行 + 每执行器 200K 新鲜上下文。`npx get-shit-done-cc`。适合大型项目。~23K GitHub stars
- **BMAD**：21 agent 敏捷团队模拟 + 34+ workflows。`npx bmad-method install`。适合产品全生命周期
- **Writer/Reviewer**：双会话消除确认偏差。零配置。适合高质量要求场景
- **Context Priming**：工程化上下文投喂——CLAUDE.md + Skills + 动态注入 + PreCompact Hook。所有项目的基底框架
- **SuperClaude**：16 认知 persona + 30 命令 + 7 行为模式。`pipx install superclaude`

方法论组合建议：Context Priming（基底）+ RIPER（流程）+ Writer/Reviewer（质量关）

对比矩阵（自动化程度、适用场景、成本、安装方式）

**质量线**：

- 方法论选型风险：Ralph Wiggum 不设 maxIterations 会烧钱、GSD 的 12 agent 在小项目上是过度工程、BMAD 的 21 agent 学习曲线陡峭
- 团队治理：统一方法论选型，不同项目类型对应不同方法论，避免每个人用不同的方式导致团队协作混乱

##### 8.2 CI/CD 集成

**能力教学**：

- 可复制粘贴的 GitHub Actions YAML（PR 自动审查 + flaky test 检测）
- fan-out 批量迁移脚本（50 文件 CommonJS → ESM）
- `--allowedTools` CI 权限限制
- 成本：50 PRs/week → $6-40/month
- PromptPwnd 攻击防护——CI 中处理不可信输入的安全措施

##### 8.3 SDK 编程式调用

**能力教学**：

- `claude -p` 一次性模式 + `--output-format json/stream-json`
- `@anthropic-ai/claude-agent-sdk`：query() API、自定义 MCP tool、session resume、权限控制
- 构建自定义 UI、集成内部平台
- `claude mcp serve`：把 Claude Code 暴露为 MCP server

**质量线**：

- SDK 调用的权限控制：编程式调用必须用 `--allowedTools` 限制工具范围 + `--max-turns` 限制执行轮次
- session resume 的安全考量：恢复会话时检查上下文是否被污染
- 自动化脚本的审计：SDK 调用应记录到日志，便于出问题时追溯

##### 8.4 Git Worktree 并行开发

**能力教学**：

- 复现 incident.io 模式（4-5 个 Claude 各在独立 worktree）
- `claude --worktree feature-x`
- 自定义 bash function 快速创建 worktree + 启动 Claude

**质量线**：

- 稳定性实况（不美化）：声称 99.85%，实测 99.36%。90 天 109 起事故。2026.3 全球宕机 14h
- 输出一致性：模型更新可能静默降低质量——CLAUDE.md 锚定 + Hook 格式化缓解
- 容灾三级：API 慢→降 Haiku / 不可用→传统开发+HANDOFF.md / 长期→项目资产不依赖平台
- **AI 是加速器不是依赖——团队成员必须能在无 AI 条件下工作**

🎬 动画：`McpArchitecture` — Claude Code ↔ MCP ↔ External Service 连接动画

---

### Part 4：企业实践

#### Ch9 — 风险、治理与落地

**目标**：将前 8 章分散的企业关注点汇总为可执行的治理体系和落地方案。不是新内容，是索引 + 整合 + 行动计划。

##### 9.1 全链路质量保障体系总结

汇总前 8 章的质量手段为四层防线：

```
事前防线（防止问题产生）：
  权限分级 + CLAUDE.md 约束 + Plan 强制 + Hook 阻断 + Worktree 隔离

事中监控（过程中实时检查）：
  一步一停 + PostToolUse 自动测试 + Stop Hook 验证 + 成本监控 + 上下文健康度

事后审查（输出物验证）：
  需求对照检查 + 按规模分层 Review + 理解力验证 + AI Review AI

监管基础设施（持续可见和可控）：
  会话日志审计 + git blame 追溯 + Managed Policy + 度量体系
```

##### 9.2 分级管理制度

按使用熟练度 + 变更影响范围分级：

| 级别 | 权限 | 使用边界 | Review 要求 | 升级条件 |
|------|------|---------|------------|---------|
| L1 | Ask + 白名单 | 编码阶段介入、小变更 | 每个 PR 人工逐行 review + 理解力验证 | AI PR bug 率连续 3 月 ≤ 团队均值 + 通过 L2 能力验证 |
| L2 | AcceptEdits + Hook | 设计阶段介入、中等变更 | Plan 文档审查 + AI Review + 人工抽查关键文件 | AI PR 质量稳定 + 完成 1 个 Plan Mode 项目 |
| L3 | AcceptEdits/Auto + Hook 门控 | 全阶段、大变更 | 分层 Review（自动化→AI→人类战略审查） | 团队认可 + 质量数据支撑 |

升级不按工龄或职级，按 Claude Code 使用质量和能力验证。

##### 9.3 度量体系

健康指标：
- AI 辅助 PR 的 bug 率 vs 纯人工 PR 的 bug 率
- 变更失败率（merge 后需要 hotfix 的比例）
- 平均 review 轮次
- 需求实现准确率

预警信号：
- bug 率持续高于人工基线 → 加强 review 或限制使用范围
- 某人的 AI PR bug 率显著高于均值 → 需要培训
- review 轮次持续增加 → AI 产出质量下降，可能 CLAUDE.md 需要更新
- 大量 PR 被要求"解释代码"时答不上来 → 理解力债务在积累

##### 9.4 成本管控

- ccusage 团队使用量分析 + Grafana dashboard
- 每日人均 ~$6（均值）/ $12（P90）/ $100-200/月
- 预算上限设置
- 模型路由降本（Haiku 探索 / Sonnet 实现 / 仅复杂架构用 Opus）

##### 9.5 安全配置汇总

- 权限分级模板（L1/L2/L3 对应的 settings.json）
- 安全 Hook 全家桶（文件保护 + 密钥扫描 + 注入防护 + 危险命令拦截）
- Managed Policy 部署
- 数据处理注意事项（了解所用计划的数据政策，用技术手段控制暴露范围）
- 版权提示（AI-only 代码不受版权保护，要求充分人工编辑）

##### 9.6 落地路线图

| 阶段 | 时间 | 目标 | 验收标准 |
|------|------|------|---------|
| Phase 0 评估 | 1 周 | 1-2 人试用，跑通基础流程 | 能独立完成 Plan → Implement → Commit |
| Phase 1 试点 | 2-4 周 | 5 人小组，建立 CLAUDE.md，配 Hooks 和权限 | 主动使用率 > 80%，收集定量数据 |
| Phase 2 推广 | 1-3 月 | 全团队，部署 Managed Policy，成本监控 | 每人日均使用 > 2h，效率指标可量化 |
| Phase 3 深度集成 | 持续 | CI/CD、自定义 Skills 库、MCP 生态、Agent Teams | 全流程 AI 辅助 + 治理体系成熟 |

每阶段的培训内容：

| 周次 | 内容 | 目标 |
|------|------|------|
| 第 1 周 | Ch0-Ch2 | 所有人能独立用 Claude Code，提交 1 个小 PR |
| 第 2 周 | Ch3-Ch4 | 团队 CLAUDE.md 建立，每人用 Plan Mode 完成 1 个中等任务 |
| 第 3 周 | Ch5 | PostToolUse Hook + 至少 1 个自定义 Skill 上线 |
| 第 4 周 | Ch6-Ch7 | 每人完成 1 次 Subagent 并行任务 |

##### 9.7 风险矩阵总览

一张表汇总所有风险 + 对策 + 指向前面章节的具体段落（不是新内容，是索引）。

🎬 动画：`RiskMatrix` — 风险等级矩阵 + 对策弹出

---

## 四、资源库设计

教程中引用的可复用资源，统一收录在 `src/data/` 目录。

### Prompt 模板库

按用途分类：

| 类别 | 数量 | 示例 |
|------|------|------|
| 探索类 | 5+ | "阅读以下文件，告诉我你的理解：1... 2... 3..." |
| 实现类 | 5+ | "按以下约束实现功能：[约束列表]。一步一停。" |
| 审查类 | 5+ | "Review 这段代码，关注：安全/性能/一致性。输出 🔴🟡🟢 三级" |
| 调试类 | 3+ | "这段代码在 X 条件下报错 Y。先阅读相关文件，分析 top 3 可能原因" |
| 规划类 | 3+ | "制定实施计划：每步改什么文件、依赖关系、验证方式" |
| 约束类 | 5+ | 常用约束语速查（"只分析不修改" / "一步一停" / "如果不确定就问我"） |

每个模板：prompt 原文 + 变量标注 + 使用场景 + 为什么有效的分析

### 配置示例库

按场景分类：

| 场景 | 内容 |
|------|------|
| Hook：编辑后自动格式化 | settings.json + 脚本 + 注意事项 |
| Hook：危险命令拦截 | settings.json + 脚本 + 边缘情况 |
| Hook：Stop 完成性验证 | prompt 型 + agent 型两个版本 |
| Hook：密钥泄露扫描 | PostToolUse 扫描模式 |
| Hook：PreCompact 上下文保存 | 自动保存 + 恢复 |
| Skill：Code Review | 完整 SKILL.md + 解释 |
| Skill：PR Summary | frontmatter + 动态注入 |
| Subagent：Code Reviewer | agents/*.md + frontmatter |
| Subagent：Security Scanner | agents/*.md + frontmatter |
| 权限：L1 配置 | settings.json 模板 |
| 权限：L2 配置 | settings.json 模板 |
| 权限：L3 配置 | settings.json 模板 |
| CLAUDE.md：项目模板 | 带注释的模板 |
| CLAUDE.md：Monorepo 模板 | 分层结构 |
| GitHub Actions：PR 审查 | 完整 workflow yaml |
| GitHub Actions：批量迁移 | fan-out 脚本 |

每个配置：完整可复制内容 + 逐行注释 + 适用场景 + 注意事项

---

## 五、前端项目架构

```
claude_study/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx          # 章节导航 + 段位颜色 + 进度条
│   │   │   ├── Header.tsx           # 顶栏 + 搜索 + 主题切换
│   │   │   └── ChapterMeta.tsx      # 章节顶部：段位标记、预计时间、跳过条件
│   │   ├── content/
│   │   │   ├── CodeBlock.tsx        # 语法高亮 + 复制 + 行号 + 高亮行
│   │   │   ├── PromptCompare.tsx    # 好/坏 prompt 左右对比
│   │   │   ├── DecisionTree.tsx     # 交互式决策树
│   │   │   ├── ConfigExample.tsx    # 配置示例（JSON/YAML + 逐行注释）
│   │   │   ├── ExerciseCard.tsx     # 练习卡片（L1/L2/L3 三级）
│   │   │   ├── TierBadge.tsx        # 段位标记
│   │   │   └── QualityCallout.tsx   # 质量线内容的视觉标识
│   │   └── animation/
│   │       ├── RemotionPlayer.tsx   # @remotion/player 封装
│   │       └── AnimationWrapper.tsx # 懒加载 + fallback 图片
│   ├── remotion/
│   │   ├── shared/                  # 通用元素
│   │   ├── ch00/                    # Ch0 动画
│   │   └── ...
│   ├── chapters/
│   │   ├── ch00/
│   │   │   ├── index.tsx
│   │   │   ├── sections/
│   │   │   └── exercises/
│   │   └── ...
│   ├── data/
│   │   ├── toc.ts                   # 目录结构
│   │   ├── prompts/                 # Prompt 模板库
│   │   ├── configs/                 # 配置示例库
│   │   └── benchmarks/              # 性能/成本数据
│   ├── hooks/                       # React hooks
│   ├── styles/
│   ├── App.tsx
│   └── main.tsx
├── public/videos/                   # 预渲染视频备用
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

关键交互：
- 侧边栏：章节树 + 当前高亮 + localStorage 进度
- 搜索：基于章节内容的全文搜索
- 深色主题默认（终端风格）
- 响应式（管理层可能在手机看）
- Remotion 动画懒加载 + 不支持时降级为静态图
- 质量线内容用视觉标识（如侧边色条）区分，但不割裂

---

## 六、Remotion 动画清单

| 章节 | 动画 | 类型 | 组件 |
|------|------|------|------|
| 首页 | ClaudeCodeIntro | 标题动画 | 复用已有 |
| Ch0 | RequestLifecycle | 链路图 | 新建 |
| Ch0 | TokenEconomy | 数据可视化 | 复用 DataChart 改造 |
| Ch1 | PromptDissection | 文字逐行高亮 | 新建 |
| Ch1 | PromptComparison | 左右对比 | 新建 |
| Ch2 | VibeCodingCurve | 折线图 | 复用 DataChart 改造 |
| Ch3 | PlanModeFlow | 状态机 | 新建 |
| Ch4 | ClaudeMdHierarchy | 树形结构 | 新建 |
| Ch5 | HookEventFlow | 时序图 | 新建 |
| Ch6 | SubagentFanout | 扇出图 | 新建 |
| Ch7 | AgentTeamsTopology | 网络拓扑 | 新建 |
| Ch8 | McpArchitecture | 架构图 | 新建 |
| Ch9 | RiskMatrix | 矩阵图 | 新建 |
| 每章 | ChapterCard | 章节标题卡 | 复用已有 |
| 每章 | CodeShowcase | 代码展示 | 复用已有 |

现有复用 6 个，新建约 10 个。

---

## 七、实战练习体系

每章末尾有分层练习：

- **L1 练习**：跟着教程操作一遍，验证结果与教程一致
- **L2 练习**：在自己的项目上应用本章技巧，记录效果
- **L3 练习**：组合本章 + 前面章节技巧解决开放问题

示例（Ch3 Plan Mode）：
- L1：按教程用 Plan Mode 给示例 API 添加 CRUD 端点，截图每步 token 消耗
- L2：在自己项目中用 Plan Mode 规划一个中等功能，对比 Plan 与实际执行的偏离度
- L3：同一任务分别用"直接做"和"Plan Mode"，量化对比 token 消耗、返工次数、代码质量

每个练习有自测标准（3 个条件）。

---

## 八、内容保鲜策略

Claude Code 迭代极快，教程需要区分稳定层和易变层：

**稳定层**（不常变，教程核心价值）：
- 思维框架（四阶段 Plan、决策树、质量保障体系）
- Prompt 工程原理（上下文位置效应、约束语机制）
- 治理理念（分级管理、分层 Review、度量体系）

**易变层**（可能随版本更新变化）：
- 具体命令和快捷键
- 配置格式和 API
- 模型名称和定价
- 社区工具和方法论版本

易变层组织策略：
- 抽取到 `src/data/` 目录的独立数据文件中
- 教程正文引用数据文件而非硬编码
- 更新时只改数据文件，不动教程正文

---

## 九、内容准确性验证

| 类别 | 验证方式 |
|------|---------|
| Token 消耗数据 | 实际运行测量（在教程开发过程中亲测记录） |
| 配置示例 | 全部在真实环境中验证可运行 |
| 社区方法论 | 至少安装运行一遍核心流程 |
| 生产事故数据 | 标注来源链接，注明时间 |
| API/命令行为 | 在当前版本实测 |
| 行业研究数据 | 标注来源和研究时间 |

数据来源标注规范：所有非自测数据标注来源名称和时间（如"CodeRabbit 2026 研究"），不标注 URL（避免链接失效）。
