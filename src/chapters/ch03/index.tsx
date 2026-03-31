import { lazy } from 'react'
import { CodeBlock } from '../../components/content/CodeBlock'
import { PromptCompare } from '../../components/content/PromptCompare'
import { QualityCallout } from '../../components/content/QualityCallout'
import { ExerciseCard } from '../../components/content/ExerciseCard'
import { DecisionTree } from '../../components/content/DecisionTree'
import { AnimationWrapper } from '../../components/animation/AnimationWrapper'
import { ReferenceSection } from '../../components/content/ReferenceSection'
import { industryStats } from '../../data/industry-stats'

const LazyVibeCodingCurve = lazy(() => import('../../remotion/ch02/VibeCodingCurve'))

/* ═══════════════════════════════════════════════
   Decision Tree Data
   ═══════════════════════════════════════════════ */

const acceptChangeTree = {
  id: 'root',
  question: '你能解释这段 AI 生成的代码每一行在做什么吗?',
  description: '这是接受 AI 代码变更前的第一道关卡。',
  children: [
    {
      label: '能, 完全理解',
      node: {
        id: 'understood',
        question: '代码是否通过了所有相关测试?',
        children: [
          {
            label: '是, 测试全过',
            node: {
              id: 'tests-pass',
              question: '变更是否覆盖了需求中的所有条目?',
              description: '对照需求清单逐项检查, 不仅看做了什么, 也看漏了什么。',
              children: [
                {
                  label: '是, 全部覆盖',
                  node: {
                    id: 'accept',
                    question: '接受变更',
                    result: {
                      text: '可以接受这次变更。提交前写一句话总结你对这次修改的理解, 作为 commit message 的一部分。',
                      tier: 'l1',
                    },
                  },
                },
                {
                  label: '有遗漏',
                  node: {
                    id: 'missing-req',
                    question: '补充需求',
                    result: {
                      text: '不要接受。将遗漏的需求明确列出, 作为新的 prompt 让 Claude 补充实现。注意: 要在同一个会话中补充, 避免上下文丢失。',
                      tier: 'l2',
                    },
                  },
                },
              ],
            },
          },
          {
            label: '没有测试 / 测试失败',
            node: {
              id: 'no-tests',
              question: '测试失败或缺失',
              result: {
                text: '不要接受。先让 Claude 编写或修复测试, 确认测试通过后再回到这个决策流程。没有测试覆盖的代码不应进入主分支。',
                tier: 'l2',
              },
            },
          },
        ],
      },
    },
    {
      label: '不太确定 / 有些部分不懂',
      node: {
        id: 'partial',
        question: '你不理解的部分属于哪种情况?',
        description: '诚实面对自己的理解盲区, 这是成长的起点。',
        children: [
          {
            label: '语法或 API 不熟悉',
            node: {
              id: 'syntax',
              question: '学习机会',
              result: {
                text: '暂不接受。先让 Claude 解释这些语法/API 的作用, 或自行查文档。理解后再接受。这是你提升技能的最佳时机 -- 不要浪费它。',
                tier: 'l1',
              },
            },
          },
          {
            label: '业务逻辑看不懂为什么这样写',
            node: {
              id: 'logic',
              question: '需要深入审查',
              result: {
                text: '拒绝接受。业务逻辑是你的核心责任。让 Claude 逐步解释设计决策, 或者用更受控的方式(Semi-controlled)重新实现, 确保每一步你都参与决策。',
                tier: 'l3',
              },
            },
          },
        ],
      },
    },
    {
      label: '完全看不懂',
      node: {
        id: 'no-understand',
        question: '理解债务警报',
        result: {
          text: '立即拒绝。这是典型的 "理解债务" -- 你正在积累自己无法维护的代码。回退到更受控的模式: 把任务拆小, 每一步都确保理解, 逐步构建。记住: 代码是你署名的, 不是 Claude 署名的。',
          tier: 'l3',
        },
      },
    },
  ],
}

const controlLevelTree = {
  id: 'ctrl-root',
  question: '你正在构建什么类型的代码?',
  description: '根据场景选择合适的控制等级, 避免过度或不足。',
  children: [
    {
      label: '一次性脚本 / 原型探索',
      node: {
        id: 'script',
        question: '代码的生命周期多长?',
        children: [
          {
            label: '用完即弃',
            node: {
              id: 'throwaway',
              question: '推荐: Full Vibe',
              result: {
                text: 'Full Vibe Coding 是最佳选择。快速出结果, 不需要高质量代码。验证想法比代码质量重要。',
                tier: 'l1',
              },
            },
          },
          {
            label: '可能会保留',
            node: {
              id: 'maybe-keep',
              question: '推荐: Semi-controlled',
              result: {
                text: '用 Semi-controlled 模式。指定技术栈和关键约束, 让代码有一定质量基础。如果真的要保留, 后续重构成本可控。',
                tier: 'l2',
              },
            },
          },
        ],
      },
    },
    {
      label: '生产功能 / 团队协作代码',
      node: {
        id: 'production',
        question: '涉及安全敏感逻辑吗? (认证、支付、权限)',
        children: [
          {
            label: '是, 安全敏感',
            node: {
              id: 'security',
              question: '推荐: Full Control',
              result: {
                text: '必须使用 Full Control 模式。先写详细 spec, 再逐步实现。安全相关代码的每一行都必须经过你的审查和理解。考虑使用 Plan Mode (Ch05) 来管理复杂度。',
                tier: 'l3',
              },
            },
          },
          {
            label: '否, 常规功能',
            node: {
              id: 'normal-prod',
              question: '推荐: Semi-controlled',
              result: {
                text: 'Semi-controlled 是效率和质量的最佳平衡。指定技术选型、接口规范和关键约束, 让 Claude 在限定范围内发挥。',
                tier: 'l2',
              },
            },
          },
        ],
      },
    },
    {
      label: '重构 / 调试现有代码',
      node: {
        id: 'refactor',
        question: '推荐: Semi-controlled + 明确边界',
        result: {
          text: '重构和调试必须指定明确的范围边界: 哪些文件可以改, 哪些不能碰, 预期行为是什么。否则 Claude 可能引入意料之外的变更。始终在重构前确保有测试覆盖。',
          tier: 'l2',
        },
      },
    },
  ],
}

/* ═══════════════════════════════════════════════
   Chapter 3 Component
   ═══════════════════════════════════════════════ */

export default function Ch03() {
  return (
    <div className="space-y-16">
      {/* ═══ Chapter Header ═══ */}
      <header>
        <div className="flex items-center gap-3 mb-4">
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold"
            style={{
              background: 'var(--color-accent-subtle)',
              color: 'var(--color-accent)',
              border: '1px solid var(--color-border-accent)',
            }}
          >
            03
          </span>
          <span
            className="text-xs uppercase tracking-widest font-medium"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Coding Phase
          </span>
          <span
            className="text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 rounded"
            style={{
              color: 'var(--color-accent)',
              background: 'var(--color-accent-subtle)',
              border: '1px solid var(--color-border-accent)',
            }}
          >
            Harness / 基础层
          </span>
        </div>
        <h1
          className="text-3xl md:text-4xl font-bold mb-4 leading-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          用 AI 改代码：重构、调试与优化
        </h1>
        <p
          className="text-lg leading-relaxed max-w-3xl"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          如果你在 Cursor 或 Copilot 中经历过"写到后面越来越乱"，那就是 Vibe Coding 退化。
          Andrej Karpathy 在 2026 年 2 月将解决方案命名为 <strong>Agentic Engineering</strong> —— 人负责架构决策，AI 负责实现。
          这一章我们用一个真实的 Express API 项目（我们叫它 <strong>DemoAPI</strong>）来系统体验退化的过程。
          <strong>这个项目将贯穿 Part 2（Ch04-07），你接下来会用 Harness Engineering 逐步修复它的所有问题。</strong>
        </p>
      </header>

      {/* ═══════════════════════════════════════════════
          Section 3.1: 四轮 API 案例 / Vibe Coding 能力边界测试
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          3.1 四轮 API 案例
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          让我们做一个实验：从零开始，用纯 Vibe Coding（只描述想要什么，不给任何技术约束）构建一个
          Express REST API —— 我们叫它 <strong>DemoAPI</strong>。我们逐轮观察代码质量的变化。
        </p>

        {/* Round 1 */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Round 1：创建项目骨架
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          提示词："帮我创建一个 Express API 项目，要有用户管理功能"
        </p>
        <CodeBlock
          language="typescript"
          title="src/index.ts (Round 1 - Claude 生成)"
          code={`import express from 'express';

const app = express();
app.use(express.json());

interface User {
  id: number;
  name: string;
  email: string;
}

const users: User[] = [];
let nextId = 1;

app.get('/users', (req, res) => {
  res.json(users);
});

app.post('/users', (req, res) => {
  const { name, email } = req.body;
  const user: User = { id: nextId++, name, email };
  users.push(user);
  res.status(201).json(user);
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});`}
        />
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          干净、简洁、完全可用。此时你可能会想："Vibe Coding 太棒了！"
        </p>

        {/* Round 2 */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Round 2：添加 CRUD 操作
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          提示词："加上更新和删除用户的接口"
        </p>
        <CodeBlock
          language="typescript"
          title="src/index.ts (Round 2 - 追加)"
          code={`app.put('/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex(u => u.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { name, email } = req.body;
  users[index] = { ...users[index], name, email };
  res.json(users[index]);
});

app.delete('/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex(u => u.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  users.splice(index, 1);
  res.status(204).send();
});`}
        />
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          依然不错。风格一致，代码结构清晰。但注意 -- 我们已经用了不少上下文窗口了。
        </p>

        {/* Round 3 */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Round 3：添加帖子功能 -- 裂痕出现
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          提示词："加一个帖子功能，用户可以发帖"
        </p>
        <CodeBlock
          language="typescript"
          title="src/index.ts (Round 3 - 风格开始漂移)"
          code={`// Claude 生成的帖子接口 -- 注意响应格式的变化
app.post('/posts', (req, res) => {
  const { title, content, userId } = req.body;
  const post = {
    id: nextPostId++,
    title,
    content,
    userId,
    createdAt: new Date().toISOString(),  // 用户接口没有这个字段
  };
  posts.push(post);
  // 注意：用户接口返回的是 res.status(201).json(user)
  // 但这里返回的包裹了一层 { success: true, data: ... }
  res.status(201).json({
    success: true,
    data: post,
    message: 'Post created successfully'
  });
});

app.get('/posts', (req, res) => {
  // 用户列表返回的是裸数组 res.json(users)
  // 这里却变成了 { posts: [...], total: N }
  res.json({
    posts,
    total: posts.length
  });
});`}
          highlightLines={[10, 14, 15, 16, 21, 22]}
        />

        <QualityCallout title="风格漂移信号">
          <p>
            Round 3 暴露了 Vibe Coding 的第一个典型问题：<strong>响应格式不一致</strong>。
            用户接口返回裸对象/数组，帖子接口突然包裹了 <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>{`{ success, data, message }`}</code> 结构。
            这不是 bug -- 代码能跑 -- 但前端开发者会很痛苦。
          </p>
        </QualityCallout>

        {/* Round 4 */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Round 4：添加评论 -- 设计决策丢失
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          提示词："让用户能评论帖子"
        </p>
        <CodeBlock
          language="typescript"
          title="src/routes/comments.ts (Round 4 - Claude 突然拆文件了)"
          code={`// Round 4: Claude 突然决定拆分路由到独立文件
// 但前面的 users 和 posts 还在 index.ts 里
import { Router } from 'express';

const router = Router();

// 错误处理风格也变了：前面用 res.status(404).json({error: '...'})
// 这里变成了 try-catch + next(err)
router.post('/posts/:postId/comments', async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { text, author } = req.body;  // 字段命名也变了: userId -> author

    // 突然引入了 UUID，前面用的是自增 ID
    const comment = {
      id: crypto.randomUUID(),
      postId: parseInt(postId),
      text,
      author,
      timestamp: Date.now(),  // 前面用的是 ISO string，这里用时间戳
    };

    comments.push(comment);
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
});

export default router;`}
          highlightLines={[2, 9, 12, 16, 20]}
        />

        <p className="text-base leading-relaxed mt-4" style={{ color: 'var(--color-text-secondary)' }}>
          到 Round 4，累积的不一致已经构成了真正的技术债务：
        </p>

        {/* Inconsistency summary table */}
        <div className="overflow-x-auto my-4">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th className="text-left py-2 px-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>维度</th>
                <th className="text-left py-2 px-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>Round 1-2 (Users)</th>
                <th className="text-left py-2 px-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>Round 3 (Posts)</th>
                <th className="text-left py-2 px-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>Round 4 (Comments)</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--color-text-secondary)' }}>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-2 px-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>响应格式</td>
                <td className="py-2 px-3">裸对象/数组</td>
                <td className="py-2 px-3" style={{ color: '#f87171' }}>{`{ success, data }`}</td>
                <td className="py-2 px-3" style={{ color: '#f87171' }}>裸对象 (又变回来了)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-2 px-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>ID 策略</td>
                <td className="py-2 px-3">自增数字</td>
                <td className="py-2 px-3">自增数字</td>
                <td className="py-2 px-3" style={{ color: '#f87171' }}>UUID</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-2 px-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>时间格式</td>
                <td className="py-2 px-3">无</td>
                <td className="py-2 px-3">ISO string</td>
                <td className="py-2 px-3" style={{ color: '#f87171' }}>Unix 时间戳</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-2 px-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>错误处理</td>
                <td className="py-2 px-3">{`res.status().json()`}</td>
                <td className="py-2 px-3">{`res.status().json()`}</td>
                <td className="py-2 px-3" style={{ color: '#f87171' }}>try-catch + next(err)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>文件结构</td>
                <td className="py-2 px-3">全在 index.ts</td>
                <td className="py-2 px-3">全在 index.ts</td>
                <td className="py-2 px-3" style={{ color: '#f87171' }}>突然拆分路由</td>
              </tr>
            </tbody>
          </table>
        </div>

        <AnimationWrapper
          component={LazyVibeCodingCurve}
          durationInFrames={180}
          fallbackText="Vibe Coding 曲线动画加载失败"
        />

        <QualityCallout>
          <p className="mb-2">
            <strong>理解债务是 Vibe Coding 最大的隐性成本。</strong>
          </p>
          <p className="mb-2">
            根据 GitClear 2024 研究，<strong>59% 的开发者</strong>承认自己在使用他们并不完全理解的 AI 生成代码。
            Google 内部数据显示，完全委托给 AI 的代码片段，开发者的<strong>理解度评分平均下降 17%</strong>。
          </p>
          <p className="mb-2">
            行业数据印证了这种风险：AI 生成的代码比人工编写的代码平均多 <strong>{industryStats.logicErrorMultiplier} 逻辑错误</strong>，
            <strong>{industryStats.securityVulnerabilityRate}</strong> 含有安全漏洞，代码流转率高出 <strong>{industryStats.codeChurnIncrease}</strong>。
          </p>
          <p>
            Vibe Coding 是 "理解债务" 最大的来源。你写得越快，欠得越多。
            当 bug 出现时（一定会的），你将面对一堆自己不理解的代码。
            这就是为什么我们需要渐进式控制。
          </p>
        </QualityCallout>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 3.2: 三种控制模式
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          3.2 三种控制模式
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          同一个任务 -- "给 Express API 添加用户注册功能" -- 我们分别用三种控制等级来实现，
          观察输出质量的差异。
        </p>

        {/* Level 1: Full Vibe */}
        <h3
          className="text-lg font-semibold mt-8 flex items-center gap-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          <span
            className="inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold"
            style={{ background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80' }}
          >
            1
          </span>
          Full Vibe -- 完全放手
        </h3>

        <PromptCompare
          bad={{
            prompt: '帮我加个用户注册功能',
            explanation: '没有指定任何技术约束。Claude 会自己做所有决策：密码如何存储、验证逻辑怎么写、路由格式是什么。',
          }}
          good={{
            label: '结果',
            prompt: `// Claude 的产出 -- 能用, 但决策不透明
app.post('/register', (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password) {
    return res.status(400).json({ msg: 'Missing fields' });
  }
  // 明文存密码! Claude 有时会, 有时不会做加密
  const user = { id: nextId++, username, password, email };
  users.push(user);
  res.json({ msg: 'Registered', user });
});`,
            explanation: '结果可用但充满隐患：明文密码、没有输入验证、没有重复检查、响应格式与前面的接口不一致（msg vs error）。',
          }}
        />

        {/* Level 2: Semi-controlled */}
        <h3
          className="text-lg font-semibold mt-8 flex items-center gap-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          <span
            className="inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold"
            style={{ background: 'rgba(250, 204, 21, 0.15)', color: '#facc15' }}
          >
            2
          </span>
          Semi-controlled -- 指定关键约束
        </h3>

        <PromptCompare
          bad={{
            label: '约束 Prompt',
            prompt: `实现用户注册 POST /api/register:
- 使用 bcrypt 加密密码 (saltRounds=12)
- 用 zod 做输入验证
- 邮箱必须唯一
- 统一响应格式: { data, error }
- 密码至少 8 位`,
            explanation: '指定了技术栈（bcrypt, zod）、安全要求（加密、验证）和接口规范（响应格式）。留给 Claude 的只是实现细节。',
          }}
          good={{
            label: '结果',
            prompt: `// Claude 的产出 -- 质量显著提升
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100),
});

app.post('/api/register', async (req, res) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      data: null,
      error: result.error.flatten(),
    });
  }
  // ... bcrypt + 唯一性检查 + 统一响应 ...
});`,
            explanation: '关键决策由你做，实现细节由 Claude 做。代码风格一致、安全合规、可维护。',
          }}
        />

        {/* Level 3: Full Control */}
        <h3
          className="text-lg font-semibold mt-8 flex items-center gap-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          <span
            className="inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold"
            style={{ background: 'rgba(248, 113, 113, 0.15)', color: '#f87171' }}
          >
            3
          </span>
          Full Control -- Plan Mode 预览
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Ch05 会详细讲 Plan Mode。这里先预览它的效果：你先写详细 spec，再让 Claude 分步执行。
        </p>

        <CodeBlock
          language="markdown"
          title="registration-spec.md (你写的规格文档)"
          code={`# 用户注册功能 Spec

## 文件结构
- src/schemas/auth.ts    -- zod schemas
- src/services/auth.ts   -- 业务逻辑 (纯函数, 可测试)
- src/routes/auth.ts     -- 路由层 (薄, 只做转发)
- src/middleware/validate.ts -- 通用验证中间件

## 接口定义
POST /api/v1/auth/register
Request:  { email: string, password: string, name: string }
Response: { data: { id, email, name, createdAt }, error: null }
Error:    { data: null, error: { code: string, message: string } }

## 业务规则
1. 密码: bcrypt, saltRounds=12, 最少 8 字符, 至少 1 个数字
2. 邮箱: 唯一, 存储前 toLowerCase()
3. 错误码: EMAIL_TAKEN, VALIDATION_ERROR, INTERNAL_ERROR
4. 不返回 password 字段

## 实现步骤
Step 1: 创建 zod schema (auth.ts)
Step 2: 创建验证中间件
Step 3: 实现 AuthService.register()
Step 4: 连接路由
Step 5: 添加单元测试`}
        />

        <CodeBlock
          language="typescript"
          title="src/services/auth.ts (Full Control 产出 -- Step 3)"
          code={`import bcrypt from 'bcrypt';
import { z } from 'zod';

const SALT_ROUNDS = 12;

export const registerSchema = z.object({
  email: z.string().email().transform(v => v.toLowerCase()),
  password: z
    .string()
    .min(8, '密码至少 8 位')
    .regex(/\\d/, '密码至少包含 1 个数字'),
  name: z.string().min(1).max(100),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export class AuthService {
  constructor(private db: UserRepository) {}

  async register(input: RegisterInput) {
    // 1. 检查邮箱唯一性
    const existing = await this.db.findByEmail(input.email);
    if (existing) {
      throw new AppError('EMAIL_TAKEN', '该邮箱已被注册', 409);
    }

    // 2. 加密密码
    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

    // 3. 创建用户 (不返回密码)
    const user = await this.db.create({
      email: input.email,
      password: hashedPassword,
      name: input.name,
    });

    const { password: _, ...safeUser } = user;
    return safeUser;
  }
}`}
        />

        {/* Comparison table */}
        <h4 className="text-base font-semibold mt-8 mb-3" style={{ color: 'var(--color-text-primary)' }}>
          三种模式对比
        </h4>
        <div className="overflow-x-auto my-4">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                <th className="text-left py-2 px-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>维度</th>
                <th className="text-left py-2 px-3 font-semibold" style={{ color: '#4ade80' }}>Full Vibe</th>
                <th className="text-left py-2 px-3 font-semibold" style={{ color: '#facc15' }}>Semi-controlled</th>
                <th className="text-left py-2 px-3 font-semibold" style={{ color: '#f87171' }}>Full Control</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--color-text-secondary)' }}>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-2 px-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>代码质量</td>
                <td className="py-2 px-3">能用, 但风格不一致</td>
                <td className="py-2 px-3">良好, 关键决策可控</td>
                <td className="py-2 px-3">优秀, 架构清晰</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-2 px-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>Token 消耗</td>
                <td className="py-2 px-3">~2K (低)</td>
                <td className="py-2 px-3">~5K (中)</td>
                <td className="py-2 px-3">~12K (高)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-2 px-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>返工次数</td>
                <td className="py-2 px-3">2-4 次 (修风格/安全)</td>
                <td className="py-2 px-3">0-1 次</td>
                <td className="py-2 px-3">0 次</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-2 px-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>实际总成本</td>
                <td className="py-2 px-3" style={{ color: '#f87171' }}>~10K (含返工)</td>
                <td className="py-2 px-3" style={{ color: '#4ade80' }}>~5K</td>
                <td className="py-2 px-3">~12K</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>你的理解程度</td>
                <td className="py-2 px-3" style={{ color: '#f87171' }}>低 -- "能用就行"</td>
                <td className="py-2 px-3" style={{ color: '#facc15' }}>中 -- 知道关键部分</td>
                <td className="py-2 px-3" style={{ color: '#4ade80' }}>高 -- 完全掌控</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          注意 "实际总成本" 行：Full Vibe 看起来最便宜，但加上返工后反而比 Semi-controlled 贵。
          这是一个反复出现的规律：<strong>前期省的约束成本，后期会以返工成本的形式加倍偿还</strong>。
        </p>

        {/* Decision tree for control level */}
        <DecisionTree
          root={controlLevelTree}
          title="选择控制等级：决策指南"
        />
      </section>

      {/* ═══════════════════════════════════════════════
          Section 2.3: Slash 命令的战术使用
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          2.3 Slash 命令的战术使用
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Claude Code 的 slash 命令是你管理会话的核心工具。
          用得好，它们能显著延长有效上下文的寿命；用不好，你会在不知不觉中丢失关键信息。
        </p>

        {/* /compact */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          <code className="font-mono" style={{ color: 'var(--color-accent)' }}>/compact</code> -- 上下文压缩
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>/compact</code> 会让
          Claude 总结当前对话，丢弃冗余细节，保留关键信息。最佳使用时机是<strong>在完成一个阶段之后</strong>，
          而不是等到上下文窗口快满时自动触发。
        </p>

        <PromptCompare
          bad={{
            label: '被动使用',
            prompt: '... (一直对话到 Claude 自动提示上下文将满) ...\n\n[系统自动 compact -- 此时已经丢失了大量中间决策]',
            explanation: '等到自动触发时，Claude 已经没有足够的上下文空间来做高质量的总结，关键设计决策很可能被丢弃。',
          }}
          good={{
            label: '主动使用',
            prompt: '/compact preserve the API design decisions: unified response format {data, error}, bcrypt for passwords, zod validation, RESTful naming convention',
            explanation: '在完成一个阶段后主动触发，并用自然语言指定需要保留的关键信息。这样 Claude 会优先保留你标记的决策。',
          }}
        />

        <QualityCallout title="黄金时机">
          <p>
            每完成一个功能模块后立即 <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>/compact</code>。
            就像写代码要定期 commit 一样，管理上下文也需要定期 "存档"。
            别等到上下文窗口告急 -- 那时候压缩质量会大幅下降。
          </p>
        </QualityCallout>

        {/* /clear vs /compact */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          <code className="font-mono" style={{ color: 'var(--color-accent)' }}>/clear</code> vs <code className="font-mono" style={{ color: 'var(--color-accent)' }}>/compact</code> -- 何时用哪个
        </h3>

        <div className="overflow-x-auto my-4">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                <th className="text-left py-2 px-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>场景</th>
                <th className="text-left py-2 px-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>命令</th>
                <th className="text-left py-2 px-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>原因</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--color-text-secondary)' }}>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-2 px-3">做完用户模块, 开始订单模块</td>
                <td className="py-2 px-3 font-mono" style={{ color: 'var(--color-accent)' }}>/compact</td>
                <td className="py-2 px-3">同一个项目, 前面的设计决策仍然相关</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-2 px-3">项目 A 做完, 切到项目 B</td>
                <td className="py-2 px-3 font-mono" style={{ color: 'var(--color-accent)' }}>/clear</td>
                <td className="py-2 px-3">完全不同的上下文, 旧信息只会造成干扰</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-2 px-3">调试一个 bug 调了很久</td>
                <td className="py-2 px-3 font-mono" style={{ color: 'var(--color-accent)' }}>/compact</td>
                <td className="py-2 px-3">保留 "尝试过但失败了" 的信息, 避免重复</td>
              </tr>
              <tr>
                <td className="py-2 px-3">同一个会话做了不相关的事</td>
                <td className="py-2 px-3 font-mono" style={{ color: 'var(--color-accent)' }}>/clear</td>
                <td className="py-2 px-3">不相关的上下文会污染后续决策</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          className="rounded-lg p-4 my-4"
          style={{
            background: 'var(--color-bg-tertiary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            <strong style={{ color: 'var(--color-text-primary)' }}>"厨房里的沉没成本" 比喻：</strong>
            你在厨房做了一道菜，台面上全是这道菜的食材残渣。如果你接下来要做同一道菜的配菜（<code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-surface)' }}>/compact</code>），
            保留台面的布局有意义。但如果你要做一道完全不同的菜（<code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-surface)' }}>/clear</code>），
            请先把台面清干净 -- 上一道菜的残渣只会碍事。
            <strong style={{ color: 'var(--color-accent)' }}> 绝不要在同一个没清理的会话里做不相关的工作。</strong>
          </p>
        </div>

        {/* Esc+Esc */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          <code className="font-mono" style={{ color: 'var(--color-accent)' }}>Esc + Esc</code> -- 回退操作
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          当 Claude 做了你不满意的修改时，连按两次 Esc 触发回退。系统会提供三种恢复模式：
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
          {[
            {
              title: '对话 + 代码',
              desc: '同时回退对话历史和文件修改。最常用，相当于 "这一步完全不要了"。',
              tag: '最常用',
            },
            {
              title: '仅对话',
              desc: '只回退对话，保留文件变更。适合 "代码改得对，但我想换个方式继续对话"。',
              tag: '偶尔用',
            },
            {
              title: '仅代码',
              desc: '只回退文件，保留对话。适合 "思路对，但实现有问题，我想基于这个讨论重新生成"。',
              tag: '偶尔用',
            },
          ].map((mode) => (
            <div
              key={mode.title}
              className="rounded-lg p-4"
              style={{
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {mode.title}
                </span>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{
                    background: 'var(--color-accent-subtle)',
                    color: 'var(--color-accent)',
                    border: '1px solid var(--color-border-accent)',
                  }}
                >
                  {mode.tag}
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {mode.desc}
              </p>
            </div>
          ))}
        </div>

        <QualityCallout title="重要限制">
          <p>
            Esc+Esc 的代码回退只追踪 Claude 通过其工具操作（文件编辑、创建等）所做的变更。
            它<strong>不追踪 Bash 命令的副作用</strong>（如 <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>rm</code>、
            <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>mv</code>、数据库操作），
            也<strong>不追踪你手动做的编辑</strong>。涉及破坏性 Bash 操作时，确保有 git 保护。
          </p>
        </QualityCallout>

        {/* /cost */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          <code className="font-mono" style={{ color: 'var(--color-accent)' }}>/cost</code> -- 成本监控
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          养成每 15 分钟检查一次 <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>/cost</code> 的习惯。
          它会告诉你当前会话消耗了多少 token 和费用。如果一个简单任务的成本异常高，
          通常意味着你的 prompt 不够精确，Claude 在做大量无效探索。
        </p>

        <CodeBlock
          language="bash"
          title="Terminal"
          code={`> /cost

Session cost: $0.42
  Input tokens:  45,230
  Output tokens: 12,847
  Cache reads:   31,200
  Cache writes:   8,500

# 如果一个 CRUD 接口花了 $0.40+, 你的 prompt 需要改进`}
        />
      </section>

      {/* ═══════════════════════════════════════════════
          Section 2.4: Claude Code 自身的调试
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          2.4 Claude Code 自身的调试
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          当 Claude Code 本身出问题（连不上、MCP 报错、行为异常）时，你需要知道如何调试工具本身。
        </p>

        {/* /doctor */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          <code className="font-mono" style={{ color: 'var(--color-accent)' }}>/doctor</code> -- 健康检查
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>/doctor</code> 是
          你遇到问题时的第一个命令。它会检查：
        </p>

        <CodeBlock
          language="bash"
          title="Terminal"
          code={`> /doctor

✓ Claude Code version: 1.0.12 (latest)
✓ Authentication: valid API key
✓ Network: connected to api.anthropic.com
✓ Settings: ~/.claude/settings.json valid
✓ Project config: .claude/settings.local.json valid
✓ MCP servers: 2/2 healthy
  ✓ filesystem (stdio) - connected
  ✓ github (stdio) - connected
✓ Permissions: all required permissions granted
✗ Plugin: eslint-mcp outdated (v0.3.1 → v0.4.0)

1 issue found. Run with --fix to auto-repair.`}
        />

        {/* /debug */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          <code className="font-mono" style={{ color: 'var(--color-accent)' }}>/debug</code> -- 会话日志分析
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bg-tertiary)' }}>/debug</code> 会读取当前会话的调试日志并分析问题。
          当 Claude 的行为不符合预期时（比如忽略了你的指令、重复犯同一个错误），这个命令能帮你找到原因。
        </p>

        {/* Verbose flags */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          调试启动参数
        </h3>

        <CodeBlock
          language="bash"
          title="Terminal"
          code={`# 详细日志模式 -- 显示每个 API 调用的详情
claude --verbose

# MCP 调试模式 -- 查看 MCP server 的通信细节
claude --mcp-debug

# 两者组合使用
claude --verbose --mcp-debug`}
        />

        {/* Session log location */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          会话日志位置
        </h3>

        <CodeBlock
          language="bash"
          title="Terminal"
          code={`# 会话日志存储位置
~/.claude/projects/<project-hash>/<session-id>.jsonl

# 查找最近的会话日志
ls -lt ~/.claude/projects/*/  | head -20

# 查看最近一次会话的原始日志 (JSON Lines 格式)
tail -50 ~/.claude/projects/<project-hash>/<latest-session>.jsonl`}
        />

        {/* Hidden env vars */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          隐藏环境变量
        </h3>

        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          这些环境变量在官方文档中不太显眼，但在调试时非常有用：
        </p>

        <CodeBlock
          language="bash"
          title="Terminal"
          code={`# 启用 SDK 级别的调试输出
export DEBUG_SDK=true

# 将调试日志写入自定义目录
export CLAUDE_CODE_DEBUG_LOGS_DIR=~/claude-debug-logs

# 调整 MCP server 超时时间 (毫秒, 默认 10000)
export MCP_TIMEOUT=30000

# 使用示例: 调试 MCP 连接超时问题
MCP_TIMEOUT=60000 DEBUG_SDK=true claude --mcp-debug`}
        />

        {/* Common issues table */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          常见问题速查表
        </h3>

        <div className="overflow-x-auto my-4">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                <th className="text-left py-2 px-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>症状</th>
                <th className="text-left py-2 px-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>可能原因</th>
                <th className="text-left py-2 px-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>排查步骤</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--color-text-secondary)' }}>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-2 px-3">"Connection refused"</td>
                <td className="py-2 px-3">API key 过期或网络问题</td>
                <td className="py-2 px-3 font-mono text-xs">/doctor → 检查 auth + network</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-2 px-3">MCP server 启动失败</td>
                <td className="py-2 px-3">依赖缺失或路径错误</td>
                <td className="py-2 px-3 font-mono text-xs">claude --mcp-debug → 查看 stderr</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-2 px-3">Claude 忽略项目配置</td>
                <td className="py-2 px-3">settings.local.json 语法错误</td>
                <td className="py-2 px-3 font-mono text-xs">/doctor → 检查 project config</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-2 px-3">响应异常缓慢</td>
                <td className="py-2 px-3">上下文过大或 MCP 超时</td>
                <td className="py-2 px-3 font-mono text-xs">/cost 查看 token 量, 考虑 /compact</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-2 px-3">重复犯同一个错误</td>
                <td className="py-2 px-3">关键指令被 compact 丢弃</td>
                <td className="py-2 px-3 font-mono text-xs">/debug 分析, 将指令写入 CLAUDE.md</td>
              </tr>
              <tr>
                <td className="py-2 px-3">文件编辑权限被拒</td>
                <td className="py-2 px-3">allowedTools 配置限制</td>
                <td className="py-2 px-3 font-mono text-xs">检查 .claude/settings.local.json</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          Section 3.3: AI 生成代码的审查框架
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          3.3 AI 生成代码的审查框架
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          在编码阶段，每次 Claude 的修改通常只涉及 1-5 个文件。
          这个规模正好适合逐行审查。以下是推荐的 review 流程：
        </p>

        {/* Review pipeline */}
        <div
          className="rounded-xl p-6 my-6"
          style={{
            background: 'var(--color-bg-tertiary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
            {[
              { step: 'AI 生成代码', color: 'var(--color-text-muted)' },
              { step: '逐行审查 diff', color: 'var(--color-accent)' },
              { step: '确认能解释每一行', color: 'var(--color-accent)' },
              { step: '运行测试', color: 'var(--color-accent)' },
              { step: 'Commit', color: '#4ade80' },
            ].map((item, i) => (
              <span key={item.step} className="flex items-center gap-2">
                <span
                  className="px-3 py-1.5 rounded-lg"
                  style={{
                    background: 'var(--color-bg-secondary)',
                    color: item.color,
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {item.step}
                </span>
                {i < 4 && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-text-muted)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5l7 7-7 7" />
                  </svg>
                )}
              </span>
            ))}
          </div>
        </div>

        <QualityCallout title="核心原则">
          <p className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            如果你无法解释它，就不要接受它。
          </p>
          <p className="mt-2">
            Review 不仅要看 Claude 改了什么，还要看它<strong>漏了什么</strong>。
            AI 擅长实现你要求的东西，但不擅长发现你忘了要求的东西（边界情况、错误处理、安全检查）。
          </p>
        </QualityCallout>

        {/* Diff review example */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Review 实例：审查 AI 生成的 diff
        </h3>

        <CodeBlock
          language="bash"
          title="Terminal - git diff 输出"
          code={`diff --git a/src/routes/auth.ts b/src/routes/auth.ts
index 3a1b2c3..4d5e6f7 100644
--- a/src/routes/auth.ts
+++ b/src/routes/auth.ts
@@ -15,6 +15,24 @@ router.post('/register', validate(registerSchema), async (req, res) => {
  }
});

+router.post('/login', async (req, res) => {
+  const { email, password } = req.body;          // ⚠️ 没有输入验证!
+  const user = await db.findByEmail(email);
+  if (!user) {
+    return res.status(401).json({                 // ✓ 没有暴露 "用户不存在"
+      data: null,
+      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
+    });
+  }
+  const valid = await bcrypt.compare(password, user.password);
+  if (!valid) {
+    return res.status(401).json({
+      data: null,
+      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
+    });
+  }
+  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!);  // ⚠️ 没有过期时间!
+  res.json({ data: { token }, error: null });
+});`}
          highlightLines={[5, 18]}
        />

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          这段 diff 看起来 "能用"，但审查时发现两个遗漏：
        </p>

        <div className="overflow-x-auto my-4">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                <th className="text-left py-2 px-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>问题</th>
                <th className="text-left py-2 px-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>风险</th>
                <th className="text-left py-2 px-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>修复</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--color-text-secondary)' }}>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-2 px-3">login 没有输入验证</td>
                <td className="py-2 px-3" style={{ color: '#f87171' }}>注入攻击、类型错误</td>
                <td className="py-2 px-3">添加 zod schema + validate 中间件</td>
              </tr>
              <tr>
                <td className="py-2 px-3">JWT 没有设置过期时间</td>
                <td className="py-2 px-3" style={{ color: '#f87171' }}>token 永不过期 = 安全漏洞</td>
                <td className="py-2 px-3 font-mono text-xs">{`jwt.sign(payload, secret, { expiresIn: '24h' })`}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Requirement verification */}
        <h3
          className="text-lg font-semibold mt-8"
          style={{ color: 'var(--color-text-primary)' }}
        >
          需求验证清单
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          每次 Review 时，用一张表格对照需求和实现：
        </p>

        <div className="overflow-x-auto my-4">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                <th className="text-left py-2 px-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>需求条目</th>
                <th className="text-center py-2 px-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>已实现?</th>
                <th className="text-left py-2 px-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>对应文件</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--color-text-secondary)' }}>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-2 px-3">POST /login 接口</td>
                <td className="py-2 px-3 text-center" style={{ color: '#4ade80' }}>Yes</td>
                <td className="py-2 px-3 font-mono text-xs">src/routes/auth.ts</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-2 px-3">输入验证 (email + password)</td>
                <td className="py-2 px-3 text-center" style={{ color: '#f87171' }}>No</td>
                <td className="py-2 px-3 font-mono text-xs">--</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-2 px-3">统一错误格式</td>
                <td className="py-2 px-3 text-center" style={{ color: '#4ade80' }}>Yes</td>
                <td className="py-2 px-3 font-mono text-xs">src/routes/auth.ts:20-23</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-2 px-3">密码错误不暴露用户存在</td>
                <td className="py-2 px-3 text-center" style={{ color: '#4ade80' }}>Yes</td>
                <td className="py-2 px-3 font-mono text-xs">src/routes/auth.ts:20,27</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-2 px-3">JWT token 有过期时间</td>
                <td className="py-2 px-3 text-center" style={{ color: '#f87171' }}>No</td>
                <td className="py-2 px-3 font-mono text-xs">--</td>
              </tr>
              <tr>
                <td className="py-2 px-3">单元测试</td>
                <td className="py-2 px-3 text-center" style={{ color: '#f87171' }}>No</td>
                <td className="py-2 px-3 font-mono text-xs">--</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* L1 rule */}
        <div
          className="rounded-lg p-4 my-6"
          style={{
            background: 'rgba(248, 113, 113, 0.05)',
            border: '1px solid rgba(248, 113, 113, 0.2)',
            borderLeft: '3px solid #f87171',
          }}
        >
          <p className="text-sm font-semibold mb-2" style={{ color: '#f87171' }}>
            L1 硬性要求
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            每个 PR 必须包含 "我对本次变更的理解" -- 用你自己的话解释 Claude 做了什么、为什么这样做。
            <strong style={{ color: 'var(--color-text-primary)' }}> "Claude 做的" 不是一个可接受的解释。</strong>
            你可以用 AI 生成代码，但你必须能像自己写的一样解释它。
            如果你做不到，说明你还没有准备好提交这段代码。
          </p>
        </div>

        {/* Decision tree for accepting changes */}
        <DecisionTree
          root={acceptChangeTree}
          title="我应该接受这次 AI 变更吗?"
        />

        <p className="mt-4" style={{ color: 'var(--color-text-secondary)' }}>
          Vibe Coding 的一致性问题，根源是 AI 每次都在"裸跑"——没有规范约束它的行为。Part 2 会教你怎么解决这个问题。
        </p>
      </section>

      {/* ═══════════════════════════════════════════════
          Exercises
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          本章练习
        </h2>

        <ExerciseCard
          tier="l1"
          title="Vibe Coding 边界探索"
          description="用纯 Vibe Coding（不给任何技术约束）让 Claude 构建一个简单的 Express API：包含至少 3 个资源（如 users, posts, comments）。每轮只给一句话的 prompt。记录在第几轮出现风格不一致，记录具体的不一致点。"
          checkpoints={[
            '完成了至少 4 轮 Vibe Coding 对话',
            '记录了首次出现不一致的轮次编号',
            '能列出至少 3 个具体的不一致点（如响应格式、ID策略、错误处理风格）',
            '记录了每轮的 token 消耗（用 /cost）',
          ]}
        />

        <ExerciseCard
          tier="l2"
          title="Semi-controlled 对照实验"
          description="用 Semi-controlled 模式重新实现 L1 练习中相同的 API。在 prompt 中指定：技术栈（如 zod + bcrypt）、响应格式、错误处理规范、命名约定。比较两种模式下的 token 消耗和代码质量。"
          checkpoints={[
            '在 prompt 中明确指定了至少 4 个约束（技术栈、格式、规范等）',
            '生成的 API 在所有资源上保持了一致的代码风格',
            '对比了 Full Vibe 和 Semi-controlled 的 token 消耗',
            '写出了两种模式的优劣对比总结（至少 3 个维度）',
          ]}
        />

        <ExerciseCard
          tier="l3"
          title="项目定制 Review Checklist"
          description="为你当前负责的项目设计一份 AI 代码审查清单。清单必须包含以下五个类别，每个类别至少 3 个检查项。在实际的 AI 生成代码上试用这份清单，记录发现的问题。"
          checkpoints={[
            '逻辑正确性: 是否覆盖了所有边界情况、异常路径、空值处理',
            '风格一致性: 是否与项目现有代码的命名、结构、模式保持一致',
            '安全检查: 是否存在注入风险、敏感数据泄露、权限绕过',
            '测试覆盖: 是否有对应的单元测试/集成测试, 覆盖率是否达标',
            '理解验证: 你能否用自己的话解释每一处修改的目的和实现方式',
            '在至少 1 个真实的 AI 生成的 PR 上使用了这份清单',
            '记录了清单帮你发现的至少 1 个问题',
          ]}
        />
      </section>

      <ReferenceSection version="Claude Code v1.x">
        <div className="text-sm space-y-2" style={{ color: 'var(--color-text-secondary)' }}>
          <p>Vibe Coding 常见陷阱检查表（待补充）</p>
        </div>
      </ReferenceSection>

      {/* ═══════════════════════════════════════════════
          Harness Preview: DemoAPI → Part 2
          ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <h2
          className="text-2xl font-bold pb-2"
          style={{
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          接下来：用 Harness Engineering 修复 DemoAPI
        </h2>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          DemoAPI 的四轮退化暴露了 Vibe Coding 的系统性问题。Part 2（Ch04-07）将逐一用
          Harness Engineering 的工具链修复它们。以下是问题到解决方案的映射：
        </p>

        <div className="overflow-x-auto my-4">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                <th className="text-left py-2 px-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>DemoAPI 问题</th>
                <th className="text-left py-2 px-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>Harness 组件</th>
                <th className="text-left py-2 px-3 font-semibold" style={{ color: 'var(--color-text-primary)' }}>章节</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--color-text-secondary)' }}>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-2 px-3">响应格式不一致</td>
                <td className="py-2 px-3 font-semibold" style={{ color: 'var(--color-accent)' }}>CLAUDE.md</td>
                <td className="py-2 px-3">Ch04</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-2 px-3">复杂功能方向偏了</td>
                <td className="py-2 px-3 font-semibold" style={{ color: 'var(--color-accent)' }}>Plan Mode</td>
                <td className="py-2 px-3">Ch05</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-2 px-3">每次部署重复描述步骤</td>
                <td className="py-2 px-3 font-semibold" style={{ color: 'var(--color-accent)' }}>Skills</td>
                <td className="py-2 px-3">Ch06</td>
              </tr>
              <tr>
                <td className="py-2 px-3">长对话忘了跑 lint</td>
                <td className="py-2 px-3 font-semibold" style={{ color: 'var(--color-accent)' }}>Hooks</td>
                <td className="py-2 px-3">Ch07</td>
              </tr>
            </tbody>
          </table>
        </div>

        <QualityCallout title="Harness Engineering 循环">
          <p>
            每一章的修复都遵循同一个循环：
            <strong>观察失败</strong> → <strong>诊断根因</strong> → <strong>构建 Harness 响应</strong> → <strong>验证有效</strong>。
            DemoAPI 是你在 Part 2 中持续使用的实验场 —— 你将亲手把它从"能跑但混乱"改造成"工程级可维护"。
          </p>
        </QualityCallout>
      </section>
    </div>
  )
}
