import React from 'react'
import { z } from 'zod'
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
} from 'remotion'
import { useScale } from '../shared/useScale'

export const TokenEconomySchema = z.object({
  accentColor: z.string().default('#D97757'),
})

type Props = z.infer<typeof TokenEconomySchema>

const BARS = [
  { label: '读文件', value: 800, color: '#60a5fa' },
  { label: 'Grep', value: 200, color: '#34d399' },
  { label: '一轮对话', value: 500, color: '#a78bfa' },
  { label: 'Subagent', value: 2000, color: '#fbbf24' },
  { label: '10轮总计', value: 8000, color: '#f87171' },
]

const MAX_VALUE = 10000

export const TokenEconomy: React.FC<Props> = ({ accentColor }) => {
  const frame = useCurrentFrame()
  const { fps, height, px, fs } = useScale()

  const BAR_WIDTH = px(120)
  const BAR_GAP = px(60)
  const CHART_HEIGHT = px(500)
  const CHART_BOTTOM = px(700)
  const CHART_LEFT = px(360)

  return (
    <AbsoluteFill style={{
      backgroundColor: '#0a0a1a',
      backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
      backgroundSize: `${px(32)}px ${px(32)}px`,
    }}>
      {/* Title */}
      <div style={{
        position: 'absolute',
        top: px(80),
        width: '100%',
        textAlign: 'center',
        fontFamily: "'SF Pro Display', sans-serif",
        fontSize: fs(42),
        fontWeight: 700,
        color: '#e2e8f0',
        opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' }),
      }}>
        Token 消耗对比
      </div>

      {/* Y-axis label */}
      <div style={{
        position: 'absolute',
        left: CHART_LEFT - px(60),
        top: CHART_BOTTOM - CHART_HEIGHT - px(10),
        fontFamily: "'SF Mono', monospace",
        fontSize: fs(12),
        color: '#4a5068',
        transform: 'rotate(-90deg)',
        transformOrigin: 'center',
      }}>
        tokens
      </div>

      {/* Bars */}
      {BARS.map((bar, i) => {
        const barStart = 15 + i * 12
        const progress = spring({ frame: frame - barStart, fps, config: { damping: 18, stiffness: 80 } })
        const barHeight = (bar.value / MAX_VALUE) * CHART_HEIGHT * progress
        const x = CHART_LEFT + i * (BAR_WIDTH + BAR_GAP)

        const countValue = Math.round(bar.value * progress)

        return (
          <React.Fragment key={i}>
            {/* Bar */}
            <div style={{
              position: 'absolute',
              left: x,
              bottom: height - CHART_BOTTOM,
              width: BAR_WIDTH,
              height: barHeight,
              borderRadius: `${px(8)}px ${px(8)}px 0 0`,
              background: `linear-gradient(180deg, ${bar.color}, ${bar.color}88)`,
              boxShadow: `0 0 ${px(20)}px ${bar.color}33`,
            }} />

            {/* Value label */}
            <div style={{
              position: 'absolute',
              left: x + BAR_WIDTH / 2,
              bottom: height - CHART_BOTTOM + barHeight + px(8),
              transform: 'translateX(-50%)',
              fontFamily: "'SF Mono', monospace",
              fontSize: fs(16),
              fontWeight: 700,
              color: bar.color,
              opacity: interpolate(frame - barStart, [10, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            }}>
              ~{countValue}
            </div>

            {/* Label */}
            <div style={{
              position: 'absolute',
              left: x + BAR_WIDTH / 2,
              top: CHART_BOTTOM + px(16),
              transform: 'translateX(-50%)',
              fontFamily: "'SF Pro Display', sans-serif",
              fontSize: fs(14),
              color: '#7c86a0',
              opacity: interpolate(frame - barStart, [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            }}>
              {bar.label}
            </div>
          </React.Fragment>
        )
      })}

      {/* Danger zone line at 60% */}
      {(() => {
        const lineY = CHART_BOTTOM - (0.6 * CHART_HEIGHT)
        const lineOpacity = interpolate(frame, [80, 95], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        return (
          <div style={{
            position: 'absolute',
            left: CHART_LEFT - px(20),
            top: lineY,
            width: BARS.length * (BAR_WIDTH + BAR_GAP),
            height: 2,
            background: `${accentColor}`,
            opacity: lineOpacity,
          }}>
            <div style={{
              position: 'absolute',
              right: -px(180),
              top: -px(10),
              fontFamily: "'SF Mono', monospace",
              fontSize: fs(13),
              color: accentColor,
              whiteSpace: 'nowrap',
            }}>
              ⚠️ 质量衰减区 (60%)
            </div>
          </div>
        )
      })()}

      {/* Auto-compact line at 95% */}
      {(() => {
        const lineY = CHART_BOTTOM - (0.95 * CHART_HEIGHT)
        const lineOpacity = interpolate(frame, [100, 115], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        return (
          <div style={{
            position: 'absolute',
            left: CHART_LEFT - px(20),
            top: lineY,
            width: BARS.length * (BAR_WIDTH + BAR_GAP),
            height: 2,
            background: '#f87171',
            opacity: lineOpacity,
          }}>
            <div style={{
              position: 'absolute',
              right: -px(220),
              top: -px(10),
              fontFamily: "'SF Mono', monospace",
              fontSize: fs(13),
              color: '#f87171',
              whiteSpace: 'nowrap',
            }}>
              🔴 Auto-compact 触发 (95%)
            </div>
          </div>
        )
      })()}

      {/* Baseline */}
      <div style={{
        position: 'absolute',
        left: CHART_LEFT - px(20),
        top: CHART_BOTTOM,
        width: BARS.length * (BAR_WIDTH + BAR_GAP),
        height: 1,
        background: 'rgba(255,255,255,0.15)',
      }} />
    </AbsoluteFill>
  )
}

export default TokenEconomy
