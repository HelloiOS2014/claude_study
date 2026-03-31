import { lazy } from 'react'
import { useNavigate } from 'react-router-dom'
import { allChapters, quickPaths, getTierColor, getTierLabel, type Chapter, type Tier } from '../data/toc'
import { AnimationWrapper } from '../components/animation/AnimationWrapper'

const LazyClaudeCodeIntro = lazy(() => import('../remotion/shared/ClaudeCodeIntro'))

export function HomePage() {
  return (
    <div className="space-y-16">
      <HeroSection />
      <RouteGuide />
      <TierOverview />
      <ChapterGrid />
    </div>
  )
}

/* ─── Hero ───────────────────────────────────── */

function HeroSection() {
  return (
    <section className="relative py-8">
      {/* Decorative glow */}
      <div
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, var(--color-accent-glow) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="relative">
        {/* Terminal prompt */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mb-6 font-mono text-sm"
          style={{
            background: 'var(--color-accent-subtle)',
            border: '1px solid var(--color-border-accent)',
            color: 'var(--color-accent)',
          }}
        >
          <span style={{ color: 'var(--color-tier-l1)' }}>$</span>
          <span>claude</span>
          <span
            className="inline-block w-2 h-4 ml-0.5"
            style={{
              background: 'var(--color-accent)',
              animation: 'pulse-glow 1.2s ease-in-out infinite',
            }}
          />
        </div>

        <h1
          className="text-4xl sm:text-5xl font-bold tracking-tight mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Claude Code
          <span className="glow-accent-text" style={{ color: 'var(--color-accent)' }}> 使用教程</span>
        </h1>

        <p
          className="text-lg max-w-2xl leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          由浅入深的 AI 辅助开发能力养成系统。每章从「失败」开始，经「响应」到达「掌控」——
          围绕 Harness Engineering 方法论，学会设计、评估、诊断、演进 AI 周围的基础设施。
        </p>

        {/* Remotion animation placeholder */}
        <div className="mt-8 max-w-2xl">
          <AnimationWrapper
            component={LazyClaudeCodeIntro}
            durationInFrames={210}
            inputProps={{
              title: 'Claude Code',
              subtitle: 'AI 辅助开发能力养成系统',
              terminalCommand: 'claude',
              accentColor: '#D97757',
            }}
            fallbackText="ClaudeCodeIntro 动画加载失败"
          />
        </div>
      </div>
    </section>
  )
}

/* ─── Route Guide ────────────────────────────── */

function RouteGuide() {
  const navigate = useNavigate()

  return (
    <section>
      <h2
        className="text-lg font-semibold mb-4 flex items-center gap-2"
        style={{ color: 'var(--color-text-primary)' }}
      >
        <span className="font-mono text-sm" style={{ color: 'var(--color-accent)' }}>//</span>
        快速路径
      </h2>

      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)',
        }}
      >
        {quickPaths.map((path, i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-5 py-3.5"
            style={{
              borderBottom: i < quickPaths.length - 1 ? '1px solid var(--color-border)' : 'none',
            }}
          >
            <div className="flex items-center gap-2 shrink-0 sm:w-40">
              <span
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {path.label}
              </span>
              <span
                className="text-[10px] font-mono"
                style={{ color: 'var(--color-text-muted)' }}
              >
                ~{path.estimatedMinutes}m
              </span>
            </div>

            <span
              className="text-xs hidden sm:inline"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {path.target}
            </span>

            <div className="flex items-center gap-1 flex-wrap sm:ml-auto">
              {path.chapters.map((chId, ci) => (
                <button
                  key={chId}
                  onClick={() => navigate(`/${chId}`)}
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded hover:underline transition-colors"
                  style={{
                    background: 'var(--color-bg-tertiary)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {chId.replace('ch', 'Ch')}
                  {ci < path.chapters.length - 1 && (
                    <span className="ml-1" style={{ color: 'var(--color-text-muted)' }}>→</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─── Tier Overview ──────────────────────────── */

function TierOverview() {
  const tiers: { tier: Tier; title: string; desc: string; chapters: string }[] = [
    {
      tier: 'l1',
      title: 'L1 基础',
      desc: '和 AI 对话。掌握 Prompt 工程和 Vibe Coding 的边界，建立设计(Design)与评估(Evaluate)的基础直觉。',
      chapters: 'Ch01 - Ch03',
    },
    {
      tier: 'l2',
      title: 'L2 进阶',
      desc: '构建驾驭系统。掌握 CLAUDE.md、Plan Mode、Skills、Hooks，从设计到诊断(Diagnose)构建自动化 Harness。',
      chapters: 'Ch04 - Ch07',
    },
    {
      tier: 'l3',
      title: 'L3 高阶',
      desc: '规模化与治理。掌握多代理协作、SDK 集成、工作流设计、组织级治理，完成演进(Evolve)闭环。',
      chapters: 'Ch08 - Ch11',
    },
  ]

  return (
    <section>
      <h2
        className="text-lg font-semibold mb-4 flex items-center gap-2"
        style={{ color: 'var(--color-text-primary)' }}
      >
        <span className="font-mono text-sm" style={{ color: 'var(--color-accent)' }}>//</span>
        能力段位
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {tiers.map(t => (
          <div
            key={t.tier}
            className="rounded-xl p-5 transition-all"
            style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  background: getTierColor(t.tier),
                  boxShadow: `0 0 8px ${getTierColor(t.tier)}`,
                }}
              />
              <span className="font-mono text-sm font-bold" style={{ color: getTierColor(t.tier) }}>
                {t.title}
              </span>
            </div>
            <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              {t.desc}
            </p>
            <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-muted)' }}>
              {t.chapters}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─── Chapter Grid ───────────────────────────── */

function ChapterGrid() {
  const navigate = useNavigate()

  return (
    <section>
      <h2
        className="text-lg font-semibold mb-4 flex items-center gap-2"
        style={{ color: 'var(--color-text-primary)' }}
      >
        <span className="font-mono text-sm" style={{ color: 'var(--color-accent)' }}>//</span>
        全部章节
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 stagger-children">
        {allChapters.map(chapter => (
          <ChapterCard
            key={chapter.id}
            chapter={chapter}
            onClick={() => navigate(`/${chapter.id}`)}
          />
        ))}
      </div>
    </section>
  )
}

function ChapterCard({ chapter, onClick }: { chapter: Chapter; onClick: () => void }) {
  const tierColor = getTierColor(chapter.tier)

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl p-4 transition-all group"
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--color-border-accent)'
        e.currentTarget.style.background = 'var(--color-bg-tertiary)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--color-border)'
        e.currentTarget.style.background = 'var(--color-bg-secondary)'
      }}
    >
      <div className="flex items-start gap-3">
        {/* Chapter number */}
        <span
          className="font-mono text-2xl font-bold shrink-0 leading-none"
          style={{ color: tierColor, opacity: 0.6 }}
        >
          {String(chapter.number).padStart(2, '0')}
        </span>

        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded-full"
              style={{
                background: `${tierColor}15`,
                color: tierColor,
                border: `1px solid ${tierColor}30`,
              }}
            >
              {getTierLabel(chapter.tier)}
            </span>
            <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-muted)' }}>
              {chapter.estimatedMinutes} min
            </span>
          </div>

          <h3
            className="text-sm font-medium mb-1 truncate"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {chapter.title}
          </h3>

          <p
            className="text-xs truncate"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {chapter.subtitle}
          </p>
        </div>
      </div>
    </button>
  )
}
