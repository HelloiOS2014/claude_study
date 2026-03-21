interface ExerciseCardProps {
  tier: 'l1' | 'l2' | 'l3'
  title: string
  description: string
  checkpoints?: string[] // self-test criteria
}

const tierConfig = {
  l1: {
    color: 'var(--color-tier-l1)',
    label: 'L1 练习',
    icon: (
      // Terminal/command icon
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
      </svg>
    ),
  },
  l2: {
    color: 'var(--color-tier-l2)',
    label: 'L2 练习',
    icon: (
      // Code icon
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  l3: {
    color: 'var(--color-tier-l3)',
    label: 'L3 挑战',
    icon: (
      // Flame/zap icon
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
} as const

export function ExerciseCard({
  tier,
  title,
  description,
  checkpoints = [],
}: ExerciseCardProps) {
  const { color, label, icon } = tierConfig[tier]

  return (
    <div
      className="rounded-lg overflow-hidden my-4 transition-all"
      style={{
        borderLeft: `3px solid ${color}`,
        border: `1px solid var(--color-border)`,
        borderLeftWidth: '3px',
        borderLeftColor: color,
        background: 'var(--color-bg-secondary)',
      }}
    >
      <div className="px-5 py-4">
        {/* ── Tier badge ─────────────────────────── */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium leading-none"
            style={{
              color: color,
              backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
              border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
            }}
          >
            <span className="shrink-0" style={{ color }}>{icon}</span>
            {label}
          </span>
        </div>

        {/* ── Title ──────────────────────────────── */}
        <h4
          className="text-base font-semibold mb-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {title}
        </h4>

        {/* ── Description ────────────────────────── */}
        <p
          className="text-sm leading-relaxed mb-0"
          style={{
            color: 'var(--color-text-secondary)',
            fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            marginBottom: checkpoints.length > 0 ? '0.75rem' : 0,
          }}
        >
          {description}
        </p>

        {/* ── Checkpoints ────────────────────────── */}
        {checkpoints.length > 0 && (
          <div
            className="rounded-md px-3 py-3"
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div
              className="text-[11px] uppercase tracking-wider font-medium mb-2"
              style={{ color: 'var(--color-text-muted)' }}
            >
              自测标准
            </div>
            <ul className="space-y-1.5">
              {checkpoints.map((checkpoint, index) => (
                <li key={index} className="flex items-start gap-2">
                  {/* Checkbox (visual only) */}
                  <span
                    className="flex items-center justify-center w-4 h-4 rounded shrink-0 mt-0.5"
                    style={{
                      border: `1.5px solid color-mix(in srgb, ${color} 50%, var(--color-text-muted))`,
                      background: 'transparent',
                    }}
                  >
                    {/* Empty checkbox — purely decorative */}
                  </span>
                  <span
                    className="text-sm leading-relaxed"
                    style={{
                      color: 'var(--color-text-secondary)',
                      fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    }}
                  >
                    {checkpoint}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
