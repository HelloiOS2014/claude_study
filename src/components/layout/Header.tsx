import { useTheme } from '../../hooks/useTheme'

interface HeaderProps {
  onMenuToggle: () => void
  isMobileMenuOpen: boolean
}

export function Header({ onMenuToggle, isMobileMenuOpen }: HeaderProps) {
  const { theme, toggle } = useTheme()

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 backdrop-blur-xl"
      style={{
        backgroundColor: theme === 'dark'
          ? 'rgba(10, 10, 26, 0.85)'
          : 'rgba(250, 250, 250, 0.85)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Mobile menu button */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden mr-3 p-1.5 rounded-md transition-colors"
        style={{ color: 'var(--color-text-secondary)' }}
        aria-label={isMobileMenuOpen ? '关闭菜单' : '打开菜单'}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          {isMobileMenuOpen ? (
            <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          ) : (
            <>
              <path d="M3 5H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M3 10H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M3 15H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </>
          )}
        </svg>
      </button>

      {/* Logo / Title */}
      <a href="/" className="flex items-center gap-2.5 no-underline group">
        {/* Terminal prompt icon */}
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center font-mono text-xs font-bold"
          style={{
            background: 'var(--color-accent-subtle)',
            border: '1px solid var(--color-border-accent)',
            color: 'var(--color-accent)',
          }}
        >
          &gt;_
        </div>
        <span
          className="font-semibold text-sm tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Claude Code
          <span
            className="ml-1.5 font-normal"
            style={{ color: 'var(--color-text-muted)' }}
          >
            教程
          </span>
        </span>
      </a>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search placeholder */}
      <div
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all"
        style={{
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-muted)',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <span>搜索...</span>
        <kbd
          className="ml-4 px-1.5 py-0.5 rounded text-[10px] font-mono"
          style={{
            background: 'var(--color-bg-tertiary)',
            border: '1px solid var(--color-border)',
          }}
        >
          ⌘K
        </kbd>
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggle}
        className="ml-3 p-1.5 rounded-md transition-all"
        style={{ color: 'var(--color-text-secondary)' }}
        aria-label={theme === 'dark' ? '切换到浅色主题' : '切换到深色主题'}
      >
        {theme === 'dark' ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        )}
      </button>
    </header>
  )
}
