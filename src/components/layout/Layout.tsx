import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'

export function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
      <Header
        onMenuToggle={() => setIsMobileMenuOpen(prev => !prev)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex pt-14">
        {/* Desktop Sidebar — hidden on mobile */}
        <aside
          className="hidden lg:block fixed top-14 bottom-0 overflow-y-auto shrink-0"
          style={{
            width: '280px',
            backgroundColor: 'var(--color-bg-secondary)',
            borderRight: '1px solid var(--color-border)',
          }}
        >
          <Sidebar />
        </aside>

        {/* Main Content — no margin on mobile, 280px margin on desktop */}
        <main className="flex-1 min-h-[calc(100vh-3.5rem)] ml-0 lg:ml-[280px]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-14">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
