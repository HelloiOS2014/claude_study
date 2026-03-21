interface TierBadgeProps {
  tier: 'l1' | 'l2' | 'l3'
  size?: 'sm' | 'md'
}

const tierConfig = {
  l1: {
    label: 'L1 \u57FA\u7840',
    colorVar: 'var(--color-tier-l1)',
    bg: 'rgba(74, 222, 128, 0.1)',
    border: 'rgba(74, 222, 128, 0.25)',
  },
  l2: {
    label: 'L2 \u8FDB\u9636',
    colorVar: 'var(--color-tier-l2)',
    bg: 'rgba(250, 204, 21, 0.1)',
    border: 'rgba(250, 204, 21, 0.25)',
  },
  l3: {
    label: 'L3 \u9AD8\u9636',
    colorVar: 'var(--color-tier-l3)',
    bg: 'rgba(248, 113, 113, 0.1)',
    border: 'rgba(248, 113, 113, 0.25)',
  },
} as const

export function TierBadge({ tier, size = 'sm' }: TierBadgeProps) {
  const config = tierConfig[tier]
  const isSmall = size === 'sm'

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-full ${
        isSmall ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      }`}
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
        color: config.colorVar,
      }}
    >
      <span
        className={`rounded-full shrink-0 ${isSmall ? 'w-1.5 h-1.5' : 'w-2 h-2'}`}
        style={{ background: config.colorVar }}
      />
      {config.label}
    </span>
  )
}
