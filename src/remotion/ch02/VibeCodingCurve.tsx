import React from 'react'
import { z } from 'zod'
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from 'remotion'
import { useScale } from '../shared/useScale'

export const VibeCodingCurveSchema = z.object({
  accentColor: z.string().default('#D97757'),
})

type Props = z.infer<typeof VibeCodingCurveSchema>

// Quality curve points (x: context%, y: quality%)
const CURVE_POINTS = [
  [0, 95], [5, 96], [10, 95], [15, 94], [20, 92],
  [25, 88], [30, 82], [35, 75], [40, 68], [45, 62],
  [50, 57], [55, 50], [60, 42], [65, 35], [70, 28],
  [75, 22], [80, 18], [85, 15], [90, 12], [95, 8], [100, 5],
]

const MARKERS = [
  { x: 30, label: '⚠️ 质量开始衰减', color: '#fbbf24' },
  { x: 60, label: '🔴 应该 /compact', color: '#D97757' },
  { x: 95, label: '💀 Auto-compact', color: '#f87171' },
]

export const VibeCodingCurve: React.FC<Props> = ({ accentColor }) => {
  const frame = useCurrentFrame()
  const { px, fs, width, height } = useScale()

  const CHART_LEFT = px(200)
  const CHART_RIGHT = px(1720)
  const CHART_TOP = px(200)
  const CHART_BOTTOM = px(800)
  const CHART_W = CHART_RIGHT - CHART_LEFT
  const CHART_H = CHART_BOTTOM - CHART_TOP

  function toScreen(x: number, y: number): [number, number] {
    return [
      CHART_LEFT + (x / 100) * CHART_W,
      CHART_BOTTOM - (y / 100) * CHART_H,
    ]
  }

  // How far along the curve we've drawn (0 to 1)
  const drawProgress = interpolate(frame, [20, 140], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Build SVG path
  const visiblePoints = Math.floor(drawProgress * CURVE_POINTS.length)
  const pathPoints = CURVE_POINTS.slice(0, Math.max(2, visiblePoints)).map(([x, y]) => toScreen(x, y))

  let pathD = ''
  if (pathPoints.length >= 2) {
    pathD = `M ${pathPoints[0][0]} ${pathPoints[0][1]}`
    for (let i = 1; i < pathPoints.length; i++) {
      pathD += ` L ${pathPoints[i][0]} ${pathPoints[i][1]}`
    }
  }

  return (
    <AbsoluteFill style={{
      backgroundColor: '#0a0a1a',
      backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
      backgroundSize: `${px(32)}px ${px(32)}px`,
    }}>
      {/* Title */}
      <div style={{
        position: 'absolute',
        top: px(60),
        width: '100%',
        textAlign: 'center',
        fontFamily: "'SF Pro Display', sans-serif",
        fontSize: fs(42),
        fontWeight: 700,
        color: '#e2e8f0',
        opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' }),
      }}>
        Vibe Coding 的质量衰减曲线
      </div>

      {/* Axes */}
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* X axis */}
        <line x1={CHART_LEFT} y1={CHART_BOTTOM} x2={CHART_RIGHT} y2={CHART_BOTTOM} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
        {/* Y axis */}
        <line x1={CHART_LEFT} y1={CHART_TOP} x2={CHART_LEFT} y2={CHART_BOTTOM} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />

        {/* Grid lines */}
        {[20, 40, 60, 80].map(v => {
          const [, y] = toScreen(0, v)
          return <line key={v} x1={CHART_LEFT} y1={y} x2={CHART_RIGHT} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
        })}

        {/* Curve */}
        {pathD && (
          <>
            {/* Glow */}
            <path d={pathD} fill="none" stroke={accentColor} strokeWidth={px(4)} opacity={0.3} filter="url(#glow)" />
            {/* Main line */}
            <path d={pathD} fill="none" stroke={accentColor} strokeWidth={px(3)} strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}

        {/* Dot at current position */}
        {pathPoints.length > 0 && (
          <circle
            cx={pathPoints[pathPoints.length - 1][0]}
            cy={pathPoints[pathPoints.length - 1][1]}
            r={px(6)}
            fill={accentColor}
          >
            <animate attributeName="r" values={`${px(5)};${px(8)};${px(5)}`} dur="1s" repeatCount="indefinite" />
          </circle>
        )}

        {/* Filter for glow */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation={px(4)} result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
      </svg>

      {/* Axis labels */}
      <div style={{
        position: 'absolute',
        bottom: height - CHART_BOTTOM - px(50),
        left: CHART_LEFT + CHART_W / 2,
        transform: 'translateX(-50%)',
        fontFamily: "'SF Mono', monospace",
        fontSize: fs(14),
        color: '#4a5068',
      }}>
        上下文使用量 (%)
      </div>
      <div style={{
        position: 'absolute',
        left: CHART_LEFT - px(80),
        top: CHART_TOP + CHART_H / 2,
        transform: 'rotate(-90deg)',
        fontFamily: "'SF Mono', monospace",
        fontSize: fs(14),
        color: '#4a5068',
      }}>
        输出质量
      </div>

      {/* Markers */}
      {MARKERS.map((marker, i) => {
        const [mx] = toScreen(marker.x, 0)
        const markerVisible = drawProgress >= marker.x / 100
        const markerOpacity = markerVisible
          ? interpolate(frame - (20 + (marker.x / 100) * 120), [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          : 0

        return (
          <React.Fragment key={i}>
            {/* Vertical line */}
            <div style={{
              position: 'absolute',
              left: mx,
              top: CHART_TOP,
              width: 1,
              height: CHART_H,
              background: `${marker.color}30`,
              opacity: markerOpacity,
            }} />
            {/* Label */}
            <div style={{
              position: 'absolute',
              left: mx,
              top: CHART_BOTTOM + px(30) + i * px(28),
              transform: 'translateX(-50%)',
              fontFamily: "'SF Pro Display', sans-serif",
              fontSize: fs(16),
              color: marker.color,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              opacity: markerOpacity,
            }}>
              {marker.label}
            </div>
          </React.Fragment>
        )
      })}
    </AbsoluteFill>
  )
}

export default VibeCodingCurve
