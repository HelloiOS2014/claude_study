import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getChapter, getTierColor, getTierLabel, allChapters } from '../data/toc'
import { useProgress } from '../hooks/useProgress'

export function ChapterPage() {
  const { chapterId } = useParams<{ chapterId: string }>()
  const navigate = useNavigate()
  const chapter = chapterId ? getChapter(chapterId) : undefined
  const { markStarted, markCompleted, isCompleted } = useProgress()

  // Mark as started on mount
  useEffect(() => {
    if (chapterId) markStarted(chapterId)
  }, [chapterId, markStarted])

  if (!chapter) {
    return (
      <div className="py-20 text-center">
        <p className="font-mono text-sm" style={{ color: 'var(--color-text-muted)' }}>
          章节未找到
        </p>
      </div>
    )
  }

  const tierColor = getTierColor(chapter.tier)
  const completed = chapterId ? isCompleted(chapterId) : false

  // Find prerequisite chapters
  const prereqChapters = chapter.prerequisites
    .map(id => allChapters.find(c => c.id === id))
    .filter(Boolean)

  return (
    <article>
      {/* Chapter Meta Header */}
      <header className="mb-12">
        {/* Tier + Part */}
        <div className="flex items-center gap-3 mb-4">
          <span
            className="text-xs font-mono px-2 py-1 rounded-md font-bold"
            style={{
              background: `${tierColor}15`,
              color: tierColor,
              border: `1px solid ${tierColor}30`,
            }}
          >
            {getTierLabel(chapter.tier)}
          </span>
          <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
            Part {chapter.part} · {chapter.partTitle}
          </span>
        </div>

        {/* Title */}
        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          <span className="font-mono mr-2" style={{ color: tierColor, opacity: 0.5 }}>
            {String(chapter.number).padStart(2, '0')}
          </span>
          {chapter.title}
        </h1>

        {/* Subtitle */}
        <p className="text-base mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          {chapter.subtitle}
        </p>

        {/* Meta info bar */}
        <div
          className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3.5 rounded-xl text-xs"
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          {/* Estimated time */}
          <div className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--color-text-muted)' }}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span style={{ color: 'var(--color-text-secondary)' }}>
              约 {chapter.estimatedMinutes} 分钟
            </span>
          </div>

          {/* Prerequisites */}
          {prereqChapters.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span style={{ color: 'var(--color-text-muted)' }}>前置：</span>
              {prereqChapters.map(pc => (
                <button
                  key={pc!.id}
                  onClick={() => navigate(`/${pc!.id}`)}
                  className="font-mono underline-offset-2 hover:underline transition-colors"
                  style={{ color: 'var(--color-accent)' }}
                >
                  Ch{pc!.number}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Skip condition */}
        <div
          className="mt-3 px-5 py-3 rounded-xl text-xs"
          style={{
            background: 'var(--color-accent-subtle)',
            border: '1px solid var(--color-border-accent)',
          }}
        >
          <span style={{ color: 'var(--color-accent)' }}>可以跳过？</span>
          <span className="ml-2" style={{ color: 'var(--color-text-secondary)' }}>
            如果{chapter.skipCondition}，可以跳到下一章。
          </span>
        </div>
      </header>

      {/* Chapter content placeholder */}
      <div
        className="rounded-xl p-8 text-center"
        style={{
          background: 'var(--color-bg-secondary)',
          border: '1px dashed var(--color-border)',
        }}
      >
        <div className="font-mono text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>
          &lt;ChapterContent /&gt;
        </div>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          章节内容将在 Phase 5-6 实现
        </p>
      </div>

      {/* Mark complete button */}
      <div className="mt-12 flex justify-center">
        <button
          onClick={() => chapterId && markCompleted(chapterId)}
          disabled={completed}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all"
          style={{
            background: completed ? 'var(--color-bg-tertiary)' : 'var(--color-accent)',
            color: completed ? 'var(--color-text-muted)' : '#fff',
            cursor: completed ? 'default' : 'pointer',
            boxShadow: completed ? 'none' : '0 0 20px var(--color-accent-glow)',
          }}
        >
          {completed ? (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 8L7 11L12 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              已完成
            </>
          ) : (
            '标记为已完成'
          )}
        </button>
      </div>
    </article>
  )
}
