import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'

export function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
      {/* Header */}
      <Header
        onMenuToggle={() => setIsMobileMenuOpen(prev => !prev)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Mobile Navigation Drawer */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Body */}
      <div className="flex pt-14">
        {/* Desktop Sidebar */}
        <aside
          className="hidden lg:block fixed top-14 bottom-0 overflow-y-auto"
          style={{
            width: 'var(--sidebar-width)',
            backgroundColor: 'var(--color-bg-secondary)',
            borderRight: '1px solid var(--color-border)',
          }}
        >
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main
          className="flex-1 min-h-[calc(100vh-3.5rem)]"
          style={{ marginLeft: 'var(--sidebar-width)' }}
        >
          {/* Responsive: remove margin on mobile */}
          <style>{`
            @media (max-width: 1023px) {
              main { margin-left: 0 !important; }
            }
          `}</style>

          <div className="max-w-4xl mx-auto px-6 sm:px-8 py-10 sm:py-14">
            <div className="animate-fade-in">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
