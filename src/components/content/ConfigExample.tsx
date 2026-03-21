import { useState, useCallback } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface ConfigAnnotation {
  line: number // 1-based line number
  text: string // annotation text
}

interface ConfigExampleProps {
  code: string
  language?: string // 'json' | 'yaml' | 'toml' | 'markdown'
  title: string // e.g. "settings.json — PostToolUse Hook"
  annotations?: ConfigAnnotation[]
  copyable?: boolean // default true
}

const languageDotColors: Record<string, string> = {
  json: '#a8a8a8',
  yaml: '#cb171e',
  yml: '#cb171e',
  toml: '#9c4121',
  markdown: '#083fa1',
  md: '#083fa1',
}

const languageDisplayNames: Record<string, string> = {
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  toml: 'TOML',
  markdown: 'Markdown',
  md: 'Markdown',
}

export function ConfigExample({
  code,
  language = 'json',
  title,
  annotations = [],
  copyable = true,
}: ConfigExampleProps) {
  const [copied, setCopied] = useState(false)
  const [expandedLines, setExpandedLines] = useState<Set<number>>(new Set())

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = code
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [code])

  const toggleAnnotation = useCallback((line: number) => {
    setExpandedLines(prev => {
      const next = new Set(prev)
      if (next.has(line)) {
        next.delete(line)
      } else {
        next.add(line)
      }
      return next
    })
  }, [])

  const langLower = language.toLowerCase()
  const dotColor = languageDotColors[langLower] ?? 'var(--color-text-muted)'
  const displayName = languageDisplayNames[langLower] ?? language

  // Build a lookup map: line number -> annotation text
  const annotationMap = new Map<number, string>()
  for (const ann of annotations) {
    annotationMap.set(ann.line, ann.text)
  }

  // Strip one trailing newline so the highlighter doesn't render a blank last line
  const trimmedCode = code.endsWith('\n') ? code.slice(0, -1) : code
  const lines = trimmedCode.split('\n')

  return (
    <div
      className="rounded-xl overflow-hidden font-mono text-sm group my-4"
      style={{
        border: '1px solid var(--color-border)',
        background: 'var(--color-bg-secondary)',
      }}
    >
      {/* ── Title bar ─────────────────────────────── */}
      <div
        className="flex items-center gap-2 px-4 py-2 text-xs select-none"
        style={{
          background: 'var(--color-bg-tertiary)',
          borderBottom: '1px solid var(--color-border)',
          color: 'var(--color-text-secondary)',
        }}
      >
        {/* Traffic-light dots decoration */}
        <div className="flex items-center gap-1.5 mr-2">
          <span
            className="block w-2.5 h-2.5 rounded-full"
            style={{ background: 'rgba(255,95,87,0.8)' }}
          />
          <span
            className="block w-2.5 h-2.5 rounded-full"
            style={{ background: 'rgba(255,189,46,0.8)' }}
          />
          <span
            className="block w-2.5 h-2.5 rounded-full"
            style={{ background: 'rgba(39,201,63,0.8)' }}
          />
        </div>

        {/* File title */}
        <div className="flex items-center gap-1.5">
          <span
            className="block w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: dotColor }}
          />
          <span style={{ color: 'var(--color-text-primary)' }}>{title}</span>
        </div>

        <div className="flex-1" />

        {/* Config badge */}
        <span
          className="px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider"
          style={{
            background: 'var(--color-accent-subtle)',
            border: '1px solid var(--color-border-accent)',
            color: 'var(--color-accent)',
          }}
        >
          config
        </span>

        {/* Language badge */}
        <span
          className="px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider"
          style={{
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-muted)',
          }}
        >
          {displayName}
        </span>

        {/* Copy button */}
        {copyable && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all cursor-pointer"
            style={{
              background: copied ? 'var(--color-accent-subtle)' : 'var(--color-bg-surface)',
              border: `1px solid ${copied ? 'var(--color-border-accent)' : 'var(--color-border)'}`,
              color: copied ? 'var(--color-accent)' : 'var(--color-text-muted)',
            }}
            aria-label="Copy config"
          >
            {copied ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
            )}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        )}
      </div>

      {/* ── Code area with annotations ─────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ background: 'var(--color-bg-secondary)' }}>
          <tbody>
            {lines.map((line, index) => {
              const lineNumber = index + 1
              const annotation = annotationMap.get(lineNumber)
              const isExpanded = expandedLines.has(lineNumber)

              return (
                <ConfigLine
                  key={lineNumber}
                  line={line}
                  lineNumber={lineNumber}
                  language={langLower}
                  annotation={annotation}
                  isExpanded={isExpanded}
                  onToggle={annotation ? () => toggleAnnotation(lineNumber) : undefined}
                />
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ─── Single code line + optional annotation row ───────── */

interface ConfigLineProps {
  line: string
  lineNumber: number
  language: string
  annotation?: string
  isExpanded: boolean
  onToggle?: () => void
}

function ConfigLine({
  line,
  lineNumber,
  language,
  annotation,
  isExpanded,
  onToggle,
}: ConfigLineProps) {
  return (
    <>
      {/* Code line row */}
      <tr
        className="transition-colors"
        style={{
          background: isExpanded
            ? 'rgba(217, 119, 87, 0.06)'
            : undefined,
        }}
      >
        {/* Line number */}
        <td
          className="text-right select-none align-top px-3 pt-0.5"
          style={{
            color: 'var(--color-text-muted)',
            opacity: 0.5,
            width: '3em',
            fontSize: '0.8125rem',
            lineHeight: '1.7',
          }}
        >
          {lineNumber}
        </td>

        {/* Code content */}
        <td
          className="pr-3 align-top"
          style={{
            borderLeft: annotation
              ? isExpanded
                ? '3px solid var(--color-accent)'
                : '3px solid transparent'
              : '3px solid transparent',
            paddingLeft: '0.75em',
          }}
        >
          <SyntaxHighlighter
            language={language}
            style={oneDark}
            customStyle={{
              margin: 0,
              padding: 0,
              background: 'transparent',
              fontSize: '0.8125rem',
              lineHeight: '1.7',
              display: 'inline',
            }}
            codeTagProps={{
              style: {
                fontFamily: "'SF Mono', 'Fira Code', 'JetBrains Mono', 'Cascadia Code', monospace",
              },
            }}
            PreTag="span"
            CodeTag="span"
          >
            {line || ' '}
          </SyntaxHighlighter>
        </td>

        {/* Annotation icon */}
        <td
          className="align-top select-none"
          style={{ width: '2em', paddingTop: '2px' }}
        >
          {annotation && (
            <button
              onClick={onToggle}
              className="flex items-center justify-center w-5 h-5 rounded transition-all cursor-pointer"
              style={{
                color: isExpanded ? 'var(--color-accent)' : 'var(--color-text-muted)',
                background: isExpanded ? 'var(--color-accent-subtle)' : 'transparent',
              }}
              aria-label={`Toggle annotation for line ${lineNumber}`}
              title={annotation}
            >
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
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </button>
          )}
        </td>
      </tr>

      {/* Annotation expanded row */}
      {annotation && isExpanded && (
        <tr>
          <td />
          <td
            colSpan={2}
            className="pb-2"
            style={{
              borderLeft: '3px solid var(--color-accent)',
              paddingLeft: '0.75em',
            }}
          >
            <div
              className="flex items-start gap-2 px-3 py-2 rounded-md text-xs leading-relaxed"
              style={{
                background: 'var(--color-accent-subtle)',
                color: 'var(--color-text-secondary)',
                fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 mt-0.5"
              >
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>{annotation}</span>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
