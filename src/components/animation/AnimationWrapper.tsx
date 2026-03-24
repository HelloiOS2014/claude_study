import { Component, Suspense } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { Player } from '@remotion/player'

/* ═══════════════════════════════════════════════
   Error Boundary
   ═══════════════════════════════════════════════ */

interface ErrorBoundaryProps {
  fallback: ReactNode
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

class AnimationErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[AnimationWrapper] Failed to load animation:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

/* ═══════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════ */

interface AnimationWrapperProps {
  component: React.LazyExoticComponent<React.ComponentType<any>>
  durationInFrames: number
  fps?: number
  width?: number
  height?: number
  inputProps?: Record<string, any>
  fallbackText?: string
  className?: string
}

/* ═══════════════════════════════════════════════
   Fallback Card
   ═══════════════════════════════════════════════ */

function FallbackCard({ text }: { text: string }) {
  return (
    <div
      className="w-full flex items-center justify-center rounded-xl"
      style={{
        aspectRatio: '16 / 9',
        background: 'var(--color-bg-tertiary)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="text-center px-6">
        {/* Film icon */}
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-text-muted)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mx-auto mb-3"
        >
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
          <line x1="7" y1="2" x2="7" y2="22" />
          <line x1="17" y1="2" x2="17" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <line x1="2" y1="7" x2="7" y2="7" />
          <line x1="2" y1="17" x2="7" y2="17" />
          <line x1="17" y1="7" x2="22" y2="7" />
          <line x1="17" y1="17" x2="22" y2="17" />
        </svg>
        <p
          className="text-sm leading-relaxed"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {text}
        </p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   Loading Placeholder
   ═══════════════════════════════════════════════ */

function LoadingPlaceholder({ text }: { text: string }) {
  return (
    <div
      className="w-full flex items-center justify-center rounded-xl"
      style={{
        aspectRatio: '16 / 9',
        background: 'var(--color-bg-tertiary)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="text-center px-6">
        {/* Pulsing dot */}
        <div
          className="mx-auto mb-3 w-8 h-8 rounded-full"
          style={{
            background: 'rgba(217, 119, 87, 0.4)',
            animation: 'pulse-glow 2s ease-in-out infinite',
          }}
        />
        <p
          className="text-sm"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {text}
        </p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   AnimationWrapper Component
   ═══════════════════════════════════════════════ */

export function AnimationWrapper({
  component: LazyComponent,
  durationInFrames,
  fps = 30,
  width = 1920,
  height = 1080,
  inputProps = {},
  fallbackText = '动画加载失败',
  className = '',
}: AnimationWrapperProps) {
  const loadingText = '正在加载动画…'

  return (
    <div
      className={`w-auto overflow-hidden rounded-none sm:rounded-xl -mx-4 sm:-mx-6 lg:-mx-8 ${className}`}
      style={{
        border: '1px solid var(--color-border)',
        background: 'var(--color-bg-secondary)',
      }}
    >
      <AnimationErrorBoundary
        fallback={<FallbackCard text={fallbackText} />}
      >
        <Suspense fallback={<LoadingPlaceholder text={loadingText} />}>
          <div className="w-full" style={{ aspectRatio: '16 / 9' }}>
            <Player
              component={LazyComponent}
              durationInFrames={durationInFrames}
              compositionWidth={width}
              compositionHeight={height}
              fps={fps}
              inputProps={inputProps}
              autoPlay
              loop
              controls
              showVolumeControls={false}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '0.75rem',
              }}
            />
          </div>
        </Suspense>
      </AnimationErrorBoundary>
    </div>
  )
}
