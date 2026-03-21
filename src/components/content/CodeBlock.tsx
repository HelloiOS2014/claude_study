import { useState, useCallback, useRef } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface CodeBlockProps {
  code: string
  language?: string
  title?: string
  highlightLines?: number[]
  showLineNumbers?: boolean
}

/* ── Language metadata ─────────────────────────────── */

const languageDotColors: Record<string, string> = {
  typescript: '#3178c6',
  tsx: '#3178c6',
  javascript: '#f7df1e',
  jsx: '#f7df1e',
  python: '#3776ab',
  rust: '#dea584',
  go: '#00add8',
  html: '#e34c26',
  css: '#264de4',
  json: '#a8a8a8',
  bash: '#4eaa25',
  shell: '#4eaa25',
  sh: '#4eaa25',
  zsh: '#4eaa25',
  yaml: '#cb171e',
  yml: '#cb171e',
  toml: '#9c4121',
  sql: '#e38c00',
  markdown: '#083fa1',
  md: '#083fa1',
  graphql: '#e535ab',
  docker: '#2496ed',
  dockerfile: '#2496ed',
}

const languageDisplayNames: Record<string, string> = {
  typescript: 'TypeScript',
  tsx: 'TSX',
  javascript: 'JavaScript',
  jsx: 'JSX',
  python: 'Python',
  rust: 'Rust',
  go: 'Go',
  html: 'HTML',
  css: 'CSS',
  json: 'JSON',
  bash: 'Bash',
  shell: 'Shell',
  sh: 'Shell',
  zsh: 'Zsh',
  yaml: 'YAML',
  yml: 'YAML',
  toml: 'TOML',
  sql: 'SQL',
  markdown: 'Markdown',
  md: 'Markdown',
  graphql: 'GraphQL',
  docker: 'Docker',
  dockerfile: 'Dockerfile',
}

/* ── Component ─────────────────────────────────────── */

export function CodeBlock({
  code,
  language = 'typescript',
  title,
  highlightLines = [],
  showLineNumbers = true,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleCopy = useCallback(async () => {
    // Prevent stacking timeouts on rapid clicks
    if (timerRef.current) clearTimeout(timerRef.current)

    try {
      await navigator.clipboard.writeText(code)
    } catch {
      // Fallback for insecure contexts or older browsers
      const textarea = document.createElement('textarea')
      textarea.value = code
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }

    setCopied(true)
    timerRef.current = setTimeout(() => {
      setCopied(false)
      timerRef.current = null
    }, 2000)
  }, [code])

  const langLower = language.toLowerCase()
  const dotColor = languageDotColors[langLower] ?? 'var(--color-text-muted)'
  const displayName = languageDisplayNames[langLower] ?? language

  const highlightSet = new Set(highlightLines)

  // Strip a single trailing newline to avoid a blank last line in the renderer
  const trimmedCode = code.endsWith('\n') ? code.slice(0, -1) : code

  return (
    <div
      className="rounded-xl overflow-hidden font-mono text-sm group/code"
      style={{
        border: '1px solid var(--color-border)',
        background: 'var(--color-bg-secondary)',
      }}
    >
      {/* ── Title bar ─────────────────────────────── */}
      {title && (
        <div
          className="flex items-center gap-2 px-4 py-2.5 text-xs select-none"
          style={{
            background: 'var(--color-bg-tertiary)',
            borderBottom: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}
        >
          {/* macOS traffic-light dots */}
          <div className="flex items-center gap-1.5 mr-2">
            <span
              className="block w-[11px] h-[11px] rounded-full"
              style={{ background: 'rgba(255, 95, 87, 0.8)' }}
              aria-hidden="true"
            />
            <span
              className="block w-[11px] h-[11px] rounded-full"
              style={{ background: 'rgba(255, 189, 46, 0.8)' }}
              aria-hidden="true"
            />
            <span
              className="block w-[11px] h-[11px] rounded-full"
              style={{ background: 'rgba(39, 201, 63, 0.8)' }}
              aria-hidden="true"
            />
          </div>

          {/* File tab with language-coloured dot */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className="block w-2 h-2 rounded-full shrink-0"
              style={{ background: dotColor }}
              aria-hidden="true"
            />
            <span
              className="truncate"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {title}
            </span>
          </div>

          <div className="flex-1" />

          {/* Language badge (inside title bar) */}
          <span
            className="px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider shrink-0"
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
            }}
          >
            {displayName}
          </span>
        </div>
      )}

      {/* ── Code area ─────────────────────────────── */}
      <div className="relative">
        {/* Language badge — shown only when there is no title bar */}
        {!title && (
          <span
            className="absolute top-2.5 left-3 z-10 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider select-none pointer-events-none"
            style={{
              background: 'var(--color-bg-tertiary)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
            }}
          >
            {displayName}
          </span>
        )}

        {/* ── Copy button ───────────────────────── */}
        <button
          onClick={handleCopy}
          className={[
            'absolute top-2.5 right-2.5 z-10',
            'flex items-center gap-1.5 px-2.5 py-1 rounded-md',
            'text-xs font-sans select-none cursor-pointer',
            'transition-all duration-200 ease-out',
            // Visibility: always visible on mobile, fade on desktop hover
            copied
              ? 'opacity-100'
              : 'opacity-100 sm:opacity-0 sm:group-hover/code:opacity-100',
          ].join(' ')}
          style={{
            background: copied
              ? 'var(--color-accent-subtle)'
              : 'var(--color-bg-tertiary)',
            border: `1px solid ${
              copied ? 'var(--color-border-accent)' : 'var(--color-border)'
            }`,
            color: copied
              ? 'var(--color-accent)'
              : 'var(--color-text-muted)',
          }}
          aria-label="Copy code"
        >
          {copied ? (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          )}
          <span>{copied ? '已复制' : '复制'}</span>
        </button>

        {/* ── Syntax highlighter ──────────────────── */}
        <SyntaxHighlighter
          language={langLower}
          style={oneDark}
          showLineNumbers={showLineNumbers}
          wrapLines
          lineNumberStyle={{
            minWidth: '3em',
            paddingRight: '1em',
            textAlign: 'right',
            userSelect: 'none',
            color: 'var(--color-text-muted)',
            opacity: 0.5,
          }}
          lineProps={(lineNumber: number) => {
            const isHighlighted = highlightSet.has(lineNumber)
            return {
              style: {
                display: 'block',
                backgroundColor: isHighlighted
                  ? 'rgba(217, 119, 87, 0.08)'
                  : undefined,
                borderLeft: isHighlighted
                  ? '3px solid var(--color-accent)'
                  : '3px solid transparent',
                paddingLeft: '0.75em',
                transition: 'background-color 150ms ease',
              },
            }
          }}
          customStyle={{
            margin: 0,
            padding: '1.25em 1em',
            paddingTop: title ? '1.25em' : '2.5em',
            background: 'var(--color-bg-secondary)',
            fontSize: '0.8125rem',
            lineHeight: '1.7',
            borderRadius: 0,
          }}
          codeTagProps={{
            style: {
              fontFamily:
                "'SF Mono', 'Fira Code', 'JetBrains Mono', 'Cascadia Code', monospace",
            },
          }}
        >
          {trimmedCode}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}
