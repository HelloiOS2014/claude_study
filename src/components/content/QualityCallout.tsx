import type { ReactNode } from 'react'

interface QualityCalloutProps {
  children: ReactNode
  title?: string
}

export function QualityCallout({
  children,
  title = '\u8D28\u91CF\u7EBF',
}: QualityCalloutProps) {
  return (
    <div
      className="my-6 rounded-r-lg overflow-hidden"
      style={{
        borderLeft: '3px solid var(--color-quality-line)',
        background: 'rgba(96, 165, 250, 0.05)',
      }}
    >
      <div className="px-4 py-4">
        {/* Title row */}
        <div className="flex items-center gap-2 mb-3">
          {/* Shield icon */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-quality-line)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          <span
            className="text-sm font-semibold"
            style={{ color: 'var(--color-quality-line)' }}
          >
            {title}
          </span>
        </div>

        {/* Content */}
        <div
          className="text-sm leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
