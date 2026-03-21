# Claude Code 教程项目 — 总实施计划

> **For agentic workers:** This is the master plan. Each phase has its own detailed plan file. Execute phases in order.

**Goal:** 构建一个基于 React SPA + Remotion 的 Claude Code 使用教程，按开发生命周期编排，双线交织（能力+质量），覆盖 L1-L3 全段位。

**Architecture:** Vite + React SPA，Tailwind CSS 样式，React Router 路由，@remotion/player 实时动画渲染。章节内容为 React 组件，数据（prompt 模板、配置示例）抽取到独立数据文件。

**Tech Stack:** React 19, Vite, Tailwind CSS 4, React Router, @remotion/player, react-syntax-highlighter, TypeScript

---

## 分阶段实施

项目拆为 6 个独立阶段，每阶段产出可运行、可测试的交付物：

### Phase 1: 项目脚手架 + 核心布局
**计划文件:** `2026-03-21-phase1-scaffolding.md`
**交付物:** 可运行的空壳站点——首页 + 侧边栏导航 + 路由 + 深色主题 + 响应式布局
**依赖:** 无
**预计任务数:** ~15
**Skill 提示:** 使用 `frontend-design` skill 设计页面

### Phase 2: 内容组件库
**计划文件:** `2026-03-21-phase2-content-components.md`
**交付物:** 所有可复用的内容组件——CodeBlock、PromptCompare、DecisionTree、ConfigExample、ExerciseCard、TierBadge、QualityCallout、ChapterMeta
**依赖:** Phase 1（布局 shell）
**预计任务数:** ~20
**Skill 提示:** 使用 `frontend-design` skill 设计组件

### Phase 3: Remotion 动画组件
**计划文件:** `2026-03-21-phase3-remotion-animations.md`
**交付物:** 迁移已有 6 个 Remotion 组件 + 新建 10 个教学动画组件 + AnimationWrapper 封装
**依赖:** Phase 1（项目结构）
**预计任务数:** ~25
**注意:** 可与 Phase 2 并行

### Phase 4: 数据层 + 资源库
**计划文件:** `2026-03-21-phase4-data-resources.md`
**交付物:** Prompt 模板库（26+ 模板）、配置示例库（16+ 配置）、目录结构数据、成本基准数据
**依赖:** Phase 2（ConfigExample 组件用于展示）
**预计任务数:** ~15

### Phase 5: 章节内容（Part 0 + Part 1）
**计划文件:** `2026-03-21-phase5-chapters-part0-1.md`
**交付物:** Ch0-Ch2 完整章节内容页面——认知基础 + 编码阶段介入
**依赖:** Phase 2 + Phase 3 + Phase 4
**预计任务数:** ~20
**Skill 提示:** 使用 `frontend-design` skill 设计章节页面

### Phase 6: 章节内容（Part 2 + Part 3 + Part 4）
**计划文件:** `2026-03-21-phase6-chapters-part2-4.md`
**交付物:** Ch3-Ch9 完整章节内容页面——设计阶段 + 需求阶段 + 企业实践
**依赖:** Phase 5（建立章节编写模式）
**预计任务数:** ~35

---

## 执行顺序

```
Phase 1 (脚手架)
  ├→ Phase 2 (内容组件) ──→ Phase 4 (数据层) ─┐
  └→ Phase 3 (Remotion) ──────────────────────┤
                                               ↓
                                     Phase 5 (Ch0-Ch2)
                                               ↓
                                     Phase 6 (Ch3-Ch9)
```

Phase 2 和 Phase 3 可并行执行。

---

## 当前状态

- [x] Phase 1 计划编写
- [ ] Phase 1 执行
- [ ] Phase 2 计划编写
- [ ] Phase 2 执行
- [ ] Phase 3 计划编写
- [ ] Phase 3 执行
- [ ] Phase 4 计划编写
- [ ] Phase 4 执行
- [ ] Phase 5 计划编写
- [ ] Phase 5 执行
- [ ] Phase 6 计划编写
- [ ] Phase 6 执行
