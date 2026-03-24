import React from 'react'
import { z } from 'zod'
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
  spring,
} from 'remotion'
import { useScale } from '../shared/useScale'

export const PlanModeFlowSchema = z.object({
  accentColor: z.string().default('#D97757'),
})

type Props = z.infer<typeof PlanModeFlowSchema>

const STEPS = [
  { label: 'Explore', desc: '阅读代码，建立理解', icon: '🔍' },
  { label: 'Diagnose', desc: '分析约束，评估方案', icon: '🩺' },
  { label: 'Plan', desc: '制定计划，明确验证', icon: '📋' },
  { label: 'Execute', desc: '逐步实施，一步一停', icon: '⚡' },
]

const STEP_INTERVAL = 35

export const PlanModeFlow: React.FC<Props> = ({ accentColor = '#D97757' }) => {
  const frame = useCurrentFrame()
  const { px, fs, fps, centerX } = useScale()

  const BOX_W = px(300)
  const BOX_H = px(100)
  const GAP = px(80)

  const totalW = STEPS.length * BOX_W + (STEPS.length - 1) * GAP
  const startX = centerX(totalW)
  const centerY = px(420)

  return (
    <AbsoluteFill style={{
      backgroundColor: '#0a0a1a',
      backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
      backgroundSize: `${px(32)}px ${px(32)}px`,
    }}>
      {/* Title */}
      <div style={{
        position: 'absolute', top: px(80), width: '100%', textAlign: 'center',
        fontFamily: "'SF Pro Display', sans-serif", fontSize: fs(42), fontWeight: 700, color: '#e2e8f0',
        opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' }),
      }}>
        Plan Mode 四阶段框架
      </div>

      {STEPS.map((step, i) => {
        const stepStart = 15 + i * STEP_INTERVAL
        const p = spring({ frame: frame - stepStart, fps, config: { damping: 14, stiffness: 100 } })
        const isActive = frame >= stepStart
        const isPast = i < STEPS.length - 1 && frame >= stepStart + STEP_INTERVAL
        const x = startX + i * (BOX_W + GAP)

        return (
          <React.Fragment key={i}>
            {/* Arrow */}
            {i > 0 && (
              <div style={{
                position: 'absolute',
                left: x - GAP + px(10),
                top: centerY + BOX_H / 2 - 1,
                width: GAP - px(20),
                height: px(2),
                background: isActive ? accentColor : 'rgba(255,255,255,0.08)',
                opacity: interpolate(frame - stepStart, [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
              }}>
                <div style={{
                  position: 'absolute', right: px(-6), top: px(-4),
                  width: 0, height: 0,
                  borderTop: `${px(5)}px solid transparent`,
                  borderBottom: `${px(5)}px solid transparent`,
                  borderLeft: `${px(8)}px solid ${isActive ? accentColor : 'rgba(255,255,255,0.08)'}`,
                }} />
              </div>
            )}

            {/* Box */}
            <div style={{
              position: 'absolute', left: x, top: centerY,
              width: BOX_W, height: BOX_H,
              borderRadius: px(16),
              border: `${px(2)}px solid ${isActive ? (isPast ? '#4ade80' : accentColor) : 'rgba(255,255,255,0.08)'}`,
              background: isActive ? (isPast ? 'rgba(74,222,128,0.06)' : 'rgba(217,119,87,0.08)') : 'rgba(255,255,255,0.02)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: px(12),
              transform: `scale(${interpolate(p, [0, 1], [0.85, 1])})`,
              opacity: interpolate(p, [0, 1], [0, 1]),
              boxShadow: isActive && !isPast ? `0 0 ${px(30)}px ${accentColor}20` : 'none',
            }}>
              <span style={{ fontSize: fs(28) }}>{step.icon}</span>
              <span style={{
                fontFamily: "'SF Pro Display', sans-serif", fontSize: fs(22), fontWeight: 700,
                color: isActive ? '#e2e8f0' : '#4a5068',
              }}>
                {step.label}
              </span>
              {isPast && (
                <span style={{ fontSize: fs(18), color: '#4ade80', marginLeft: px(4) }}>✓</span>
              )}
            </div>

            {/* Description */}
            <div style={{
              position: 'absolute', left: x, top: centerY + BOX_H + px(20),
              width: BOX_W, textAlign: 'center',
              fontFamily: "'SF Pro Display', sans-serif", fontSize: fs(16), color: '#7c86a0',
              opacity: interpolate(frame - (stepStart + 10), [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
              transform: `translateY(${interpolate(frame - (stepStart + 10), [0, 15], [10, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)`,
            }}>
              {step.desc}
            </div>
          </React.Fragment>
        )
      })}

      {/* Bottom note */}
      <Sequence from={15 + STEPS.length * STEP_INTERVAL + 10}>
        <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: px(100) }}>
          <div style={{
            fontFamily: "'SF Pro Display', sans-serif", fontSize: fs(22), color: accentColor, fontWeight: 600,
            opacity: interpolate(frame - (15 + STEPS.length * STEP_INTERVAL + 10), [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          }}>
            偏离时随时回到 Plan → 计划不是合同，是活的
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  )
}

export default PlanModeFlow
