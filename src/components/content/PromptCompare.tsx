interface PromptSide {
  prompt: string
  label?: string
  explanation: string
}

interface PromptCompareProps {
  bad: PromptSide
  good: PromptSide
}

function PromptColumn({
  side,
  variant,
}: {
  side: PromptSide
  variant: 'bad' | 'good'
}) {
  const isBad = variant === 'bad'
  const icon = isBad ? '\u274C' : '\u2705'
  const label = side.label ?? (isBad ? '\u4F4E\u6548' : '\u9AD8\u6548')
  const borderColor = isBad
    ? 'rgba(248, 113, 113, 0.3)'
    : 'rgba(74, 222, 128, 0.3)'
  const headerBg = isBad
    ? 'rgba(248, 113, 113, 0.08)'
    : 'rgba(74, 222, 128, 0.08)'
  const labelColor = isBad ? '#f87171' : '#4ade80'

  return (
    <div
      className="flex-1 min-w-0 rounded-xl overflow-hidden flex flex-col"
      style={{
        border: `1px solid ${borderColor}`,
        background: 'var(--color-bg-secondary)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium"
        style={{
          background: headerBg,
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        <span className="text-base leading-none">{icon}</span>
        <span style={{ color: labelColor }}>{label}</span>
      </div>

      {/* Prompt block */}
      <div
        className="font-mono text-[13px] leading-relaxed whitespace-pre-wrap px-4 py-3"
        style={{
          color: 'var(--color-text-primary)',
          background: 'var(--color-bg-primary)',
          margin: '12px',
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
        }}
      >
        {side.prompt}
      </div>

      {/* Explanation */}
      <div
        className="px-4 pb-4 text-sm leading-relaxed mt-auto"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {side.explanation}
      </div>
    </div>
  )
}

export function PromptCompare({ bad, good }: PromptCompareProps) {
  return (
    <div className="my-6">
      <div className="flex flex-col md:flex-row items-stretch gap-4">
        {/* Bad prompt column */}
        <PromptColumn side={bad} variant="bad" />

        {/* Arrow between columns — visible only on desktop */}
        <div className="hidden md:flex items-center justify-center shrink-0">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full"
            style={{
              background: 'var(--color-bg-tertiary)',
              border: '1px solid var(--color-border)',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Good prompt column */}
        <PromptColumn side={good} variant="good" />
      </div>
    </div>
  )
}
