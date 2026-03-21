import { useState, useCallback } from 'react'

/* ─── Types ─── */

interface TreeNode {
  id: string
  question: string
  description?: string
  children?: {
    label: string
    node: TreeNode
  }[]
  result?: {
    text: string
    tier?: 'l1' | 'l2' | 'l3'
  }
}

interface DecisionTreeProps {
  root: TreeNode
  title?: string
}

/* ─── Tier helpers ─── */

const TIER_COLORS: Record<string, string> = {
  l1: 'var(--color-tier-l1)',
  l2: 'var(--color-tier-l2)',
  l3: 'var(--color-tier-l3)',
}

const TIER_LABELS: Record<string, string> = {
  l1: 'L1 — 基础',
  l2: 'L2 — 进阶',
  l3: 'L3 — 高级',
}

/* ─── Breadcrumb step ─── */

interface BreadcrumbStep {
  question: string
  answer: string
}

/* ─── Component ─── */

export function DecisionTree({ root, title }: DecisionTreeProps) {
  const [currentNode, setCurrentNode] = useState<TreeNode>(root)
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbStep[]>([])
  const [animating, setAnimating] = useState(false)

  const handleChoice = useCallback(
    (label: string, nextNode: TreeNode) => {
      if (animating) return
      setAnimating(true)

      setBreadcrumbs((prev) => [
        ...prev,
        { question: currentNode.question, answer: label },
      ])

      // Brief delay so the exit transition can play
      setTimeout(() => {
        setCurrentNode(nextNode)
        setAnimating(false)
      }, 200)
    },
    [currentNode, animating],
  )

  const handleReset = useCallback(() => {
    setAnimating(true)
    setTimeout(() => {
      setCurrentNode(root)
      setBreadcrumbs([])
      setAnimating(false)
    }, 200)
  }, [root])

  const isResult = !!currentNode.result
  const tierColor = currentNode.result?.tier
    ? TIER_COLORS[currentNode.result.tier]
    : 'var(--color-accent)'
  const tierLabel = currentNode.result?.tier
    ? TIER_LABELS[currentNode.result.tier]
    : null

  return (
    <div
      className="my-8 rounded-xl overflow-hidden"
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Header */}
      {title && (
        <div
          className="px-5 py-3 text-sm font-semibold flex items-center gap-2"
          style={{
            borderBottom: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
        >
          {/* Tree icon */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
          >
            <circle cx="12" cy="5" r="3" />
            <line x1="12" y1="8" x2="12" y2="14" />
            <line x1="12" y1="14" x2="6" y2="20" />
            <line x1="12" y1="14" x2="18" y2="20" />
          </svg>
          {title}
        </div>
      )}

      <div className="p-5">
        {/* ── Breadcrumb trail ── */}
        {breadcrumbs.length > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-1.5 text-xs">
            {breadcrumbs.map((step, i) => (
              <span key={i} className="contents">
                {/* Question pill */}
                <span
                  className="inline-flex items-center rounded-md px-2 py-1"
                  style={{
                    background: 'var(--color-bg-surface)',
                    color: 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {step.question}
                </span>

                {/* Arrow */}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-text-muted)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>

                {/* Answer pill */}
                <span
                  className="inline-flex items-center rounded-md px-2 py-1 font-medium"
                  style={{
                    background: 'var(--color-accent-subtle)',
                    color: 'var(--color-accent)',
                    border: '1px solid var(--color-border-accent)',
                  }}
                >
                  {step.answer}
                </span>

                {/* Separator arrow (except after last) */}
                {i < breadcrumbs.length - 1 && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-text-muted)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                )}
              </span>
            ))}
          </div>
        )}

        {/* ── Current node ── */}
        <div
          className="transition-all"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? 'translateY(8px)' : 'translateY(0)',
            transitionDuration: '200ms',
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {!isResult ? (
            <>
              {/* Question box */}
              <div
                className="rounded-lg p-4 mb-4"
                style={{
                  background: 'var(--color-bg-tertiary)',
                  borderLeft: '3px solid var(--color-accent)',
                  boxShadow: '0 0 16px var(--color-accent-glow)',
                }}
              >
                <p
                  className="text-base font-medium leading-relaxed"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {currentNode.question}
                </p>
                {currentNode.description && (
                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {currentNode.description}
                  </p>
                )}
              </div>

              {/* Choice buttons */}
              <div className="flex flex-wrap gap-3">
                {currentNode.children?.map((child) => (
                  <button
                    key={child.label}
                    onClick={() => handleChoice(child.label, child.node)}
                    className="group relative rounded-lg px-5 py-2.5 text-sm font-medium cursor-pointer transition-all"
                    style={{
                      background: 'var(--color-bg-elevated)',
                      color: 'var(--color-text-primary)',
                      border: '1px solid var(--color-border-hover)',
                      transitionDuration: '200ms',
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget
                      el.style.borderColor = 'var(--color-accent)'
                      el.style.boxShadow =
                        '0 0 12px var(--color-accent-glow), 0 0 4px var(--color-accent-glow)'
                      el.style.color = 'var(--color-accent)'
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget
                      el.style.borderColor = 'var(--color-border-hover)'
                      el.style.boxShadow = 'none'
                      el.style.color = 'var(--color-text-primary)'
                    }}
                  >
                    {child.label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Result card */}
              <div
                className="rounded-lg p-5"
                style={{
                  background: 'var(--color-bg-tertiary)',
                  borderLeft: `3px solid ${tierColor}`,
                  boxShadow: `0 0 20px color-mix(in srgb, ${tierColor} 15%, transparent)`,
                }}
              >
                {/* Tier badge */}
                {tierLabel && (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold mb-3"
                    style={{
                      color: tierColor,
                      background: `color-mix(in srgb, ${tierColor} 12%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${tierColor} 30%, transparent)`,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: tierColor }}
                    />
                    {tierLabel}
                  </span>
                )}

                {/* Result text */}
                <p
                  className="text-base font-medium leading-relaxed"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {currentNode.result!.text}
                </p>

                {currentNode.description && (
                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {currentNode.description}
                  </p>
                )}
              </div>

              {/* Reset button */}
              <button
                onClick={handleReset}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium cursor-pointer transition-all"
                style={{
                  background: 'var(--color-bg-elevated)',
                  color: 'var(--color-accent)',
                  border: '1px solid var(--color-border-accent)',
                  transitionDuration: '200ms',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget
                  el.style.background = 'var(--color-accent-subtle)'
                  el.style.boxShadow = '0 0 12px var(--color-accent-glow)'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget
                  el.style.background = 'var(--color-bg-elevated)'
                  el.style.boxShadow = 'none'
                }}
              >
                {/* Restart icon */}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
                重新开始
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
