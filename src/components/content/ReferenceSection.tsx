import { useState, type ReactNode } from 'react'

interface ReferenceSectionProps {
  version?: string
  children: ReactNode
}

export function ReferenceSection({ version, children }: ReferenceSectionProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <section
      className="mt-12 rounded-xl overflow-hidden"
      style={{
        border: '1px solid var(--color-border)',
        background: 'var(--color-bg-reference)',
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <div className="flex items-center gap-2">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <path d="M11 1H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1Z" />
            <path d="M4 4h6M4 7h6M4 10h3" />
          </svg>
          <span className="text-sm font-medium">参考数据</span>
          {version && (
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded"
              style={{
                background: 'var(--color-accent-subtle)',
                color: 'var(--color-accent)',
              }}
            >
              {version}
            </span>
          )}
        </div>

        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="currentColor"
          className="transition-transform"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform var(--transition-fast)',
            color: 'var(--color-text-muted)',
          }}
        >
          <path d="M2 4.5L6 8.5L10 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="px-5 pb-5 pt-2 border-t"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {children}
        </div>
      )}
    </section>
  )
}
