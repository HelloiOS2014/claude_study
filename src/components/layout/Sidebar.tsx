import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { parts, getTierColor, type Part, type Chapter } from '../../data/toc'
import { useProgress } from '../../hooks/useProgress'

interface SidebarProps {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { isCompleted, completedCount } = useProgress()
  const currentPath = location.pathname.replace('/', '') || ''

  const [expandedParts, setExpandedParts] = useState<Set<number>>(() => {
    // Auto-expand the part that contains the current chapter
    const currentPart = parts.find(p =>
      p.chapters.some(c => c.id === currentPath)
    )
    return new Set(currentPart ? [currentPart.number] : [0])
  })

  const togglePart = (partNumber: number) => {
    setExpandedParts(prev => {
      const next = new Set(prev)
      if (next.has(partNumber)) next.delete(partNumber)
      else next.add(partNumber)
      return next
    })
  }

  const handleChapterClick = (chapterId: string) => {
    navigate(`/${chapterId}`)
    onNavigate?.()
  }

  const totalChapters = parts.flatMap(p => p.chapters).length

  return (
    <nav className="h-full flex flex-col" style={{ color: 'var(--color-text-secondary)' }}>
      {/* Part list */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <div className="stagger-children">
          {parts.map(part => (
            <PartGroup
              key={part.number}
              part={part}
              isExpanded={expandedParts.has(part.number)}
              currentChapterId={currentPath}
              onToggle={() => togglePart(part.number)}
              onChapterClick={handleChapterClick}
              isCompleted={isCompleted}
            />
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="px-4 py-3 border-t"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
            进度
          </span>
          <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
            {completedCount}/{totalChapters}
          </span>
        </div>
        <div
          className="h-1 rounded-full overflow-hidden"
          style={{ background: 'var(--color-bg-tertiary)' }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${(completedCount / totalChapters) * 100}%`,
              background: completedCount === totalChapters
                ? 'var(--color-tier-l1)'
                : 'var(--color-accent)',
              boxShadow: completedCount > 0 ? '0 0 8px var(--color-accent-glow)' : 'none',
              transition: 'width var(--transition-slow)',
            }}
          />
        </div>
      </div>
    </nav>
  )
}

/* ─── Part Group ────────────────────────────── */

interface PartGroupProps {
  part: Part
  isExpanded: boolean
  currentChapterId: string
  onToggle: () => void
  onChapterClick: (id: string) => void
  isCompleted: (id: string) => boolean
}

function PartGroup({
  part,
  isExpanded,
  currentChapterId,
  onToggle,
  onChapterClick,
  isCompleted,
}: PartGroupProps) {
  return (
    <div className="mb-1">
      {/* Part header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-left transition-colors group"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {/* Expand arrow */}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="currentColor"
          className="shrink-0 transition-transform"
          style={{
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform var(--transition-fast)',
            color: 'var(--color-text-muted)',
          }}
        >
          <path d="M4.5 2L8.5 6L4.5 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* Part number badge */}
        <span
          className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0"
          style={{
            background: 'var(--color-accent-subtle)',
            color: 'var(--color-accent)',
          }}
        >
          P{part.number}
        </span>

        {/* Part title */}
        <span className="text-xs font-medium truncate">
          {part.title}
        </span>
      </button>

      {/* Chapters */}
      {isExpanded && (
        <div className="ml-3 pl-3 border-l" style={{ borderColor: 'var(--color-border)' }}>
          {part.chapters.map(chapter => (
            <ChapterItem
              key={chapter.id}
              chapter={chapter}
              isCurrent={chapter.id === currentChapterId}
              completed={isCompleted(chapter.id)}
              onClick={() => onChapterClick(chapter.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Chapter Item ──────────────────────────── */

interface ChapterItemProps {
  chapter: Chapter
  isCurrent: boolean
  completed: boolean
  onClick: () => void
}

function ChapterItem({ chapter, isCurrent, completed, onClick }: ChapterItemProps) {
  const tierColor = getTierColor(chapter.tier)

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-all text-xs group ${
        isCurrent ? 'sidebar-active-indicator' : ''
      }`}
      style={{
        background: isCurrent ? 'var(--color-accent-subtle)' : 'transparent',
        color: isCurrent ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
      }}
    >
      {/* Tier dot */}
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{
          background: tierColor,
          boxShadow: isCurrent ? `0 0 6px ${tierColor}` : 'none',
        }}
      />

      {/* Chapter number */}
      <span className="font-mono text-[10px] shrink-0" style={{ color: 'var(--color-text-muted)' }}>
        {String(chapter.number).padStart(2, '0')}
      </span>

      {/* Title */}
      <span className={`truncate ${isCurrent ? 'font-medium' : ''}`}>
        {chapter.title}
      </span>

      {/* Completed check */}
      {completed && (
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          className="shrink-0 ml-auto"
          style={{ color: 'var(--color-tier-l1)' }}
        >
          <path
            d="M3.5 7L6 9.5L10.5 4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  )
}
