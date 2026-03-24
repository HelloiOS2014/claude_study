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

export const RiskMatrixSchema = z.object({
  accentColor: z.string().default('#D97757'),
})

type Props = z.infer<typeof RiskMatrixSchema>

const RISKS = [
  { label: '准确性', desc: '幻觉与错误输出', icon: '🎯' },
  { label: '安全', desc: '注入与数据泄露', icon: '🛡' },
  { label: '稳定性', desc: '服务中断与降级', icon: '⚙' },
  { label: '合规', desc: '许可与隐私法规', icon: '📋' },
  { label: '组织', desc: '技能退化与依赖', icon: '👥' },
  { label: '成本', desc: 'Token 消耗失控', icon: '💰' },
]

const COLS = 3
const STEP_INTERVAL = 18

const DotGrid: React.FC = () => {
  const { px } = useScale()
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0a0a1a',
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
        backgroundSize: `${px(32)}px ${px(32)}px`,
      }}
    />
  )
}

const GaugeBar: React.FC<{ progress: number; color: string }> = ({ progress, color }) => {
  const barWidth = interpolate(progress, [0, 1], [0, 100])
  // Color transitions from red to yellow to green
  const r = Math.round(interpolate(progress, [0, 0.5, 1], [239, 250, 74]))
  const g = Math.round(interpolate(progress, [0, 0.5, 1], [68, 204, 222]))
  const b = Math.round(interpolate(progress, [0, 0.5, 1], [68, 21, 128]))
  const gaugeColor = `rgb(${r},${g},${b})`

  return (
    <div
      style={{
        width: '100%',
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${barWidth}%`,
          height: '100%',
          borderRadius: 3,
          background: `linear-gradient(90deg, ${color}40, ${gaugeColor})`,
          boxShadow: `0 0 8px ${gaugeColor}40`,
        }}
      />
    </div>
  )
}

export const RiskMatrix: React.FC<Props> = ({ accentColor = '#D97757' }) => {
  const frame = useCurrentFrame()
  const { fps, px, fs, centerX, centerY } = useScale()

  const CARD_W = px(360)
  const CARD_H = px(200)
  const GAP_X = px(60)
  const GAP_Y = px(50)

  const totalW = COLS * CARD_W + (COLS - 1) * GAP_X
  const totalH = 2 * CARD_H + GAP_Y
  const startX = centerX(totalW)
  const startY = centerY(totalH) + px(40)

  return (
    <AbsoluteFill>
      <DotGrid />

      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: px(70),
          width: '100%',
          textAlign: 'center',
          fontFamily: "'SF Pro Display', sans-serif",
          fontSize: fs(42),
          fontWeight: 700,
          color: '#e2e8f0',
          opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' }),
        }}
      >
        风险评估矩阵
      </div>

      {/* Subtitle */}
      <div
        style={{
          position: 'absolute',
          top: px(130),
          width: '100%',
          textAlign: 'center',
          fontFamily: "'SF Pro Display', sans-serif",
          fontSize: fs(22),
          color: '#7c86a0',
          opacity: interpolate(frame, [5, 20], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        六大风险维度逐项审视
      </div>

      {/* Risk cards in 2x3 grid */}
      {RISKS.map((risk, i) => {
        const col = i % COLS
        const row = Math.floor(i / COLS)
        const x = startX + col * (CARD_W + GAP_X)
        const y = startY + row * (CARD_H + GAP_Y)

        const cardStart = 15 + i * STEP_INTERVAL
        const cp = spring({
          frame: frame - cardStart,
          fps,
          config: { damping: 14, stiffness: 100 },
        })

        // Gauge animation (starts shortly after card appears)
        const gaugeStart = cardStart + 12
        const gaugeProgress = interpolate(frame - gaugeStart, [0, 25], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })

        // Highlight pulse when active
        const isActive = frame >= cardStart && frame < cardStart + STEP_INTERVAL + 10
        const pulseOpacity = isActive
          ? interpolate(Math.sin((frame - cardStart) * 0.3), [-1, 1], [0.03, 0.08])
          : 0.02

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: CARD_W,
              height: CARD_H,
              borderRadius: px(16),
              border: `${px(2)}px solid ${isActive ? accentColor : 'rgba(255,255,255,0.08)'}`,
              background: `rgba(255,255,255,${pulseOpacity})`,
              padding: `${px(20)}px ${px(24)}px`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transform: `scale(${interpolate(cp, [0, 1], [0.85, 1])})`,
              opacity: interpolate(cp, [0, 1], [0, 1]),
              boxShadow: isActive ? `0 0 ${px(30)}px ${accentColor}15` : 'none',
            }}
          >
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: px(12) }}>
              <span style={{ fontSize: fs(28) }}>{risk.icon}</span>
              <div>
                <div
                  style={{
                    fontFamily: "'SF Pro Display', sans-serif",
                    fontSize: fs(22),
                    fontWeight: 700,
                    color: isActive ? '#e2e8f0' : '#94a3b8',
                  }}
                >
                  {risk.label}
                </div>
                <div
                  style={{
                    fontFamily: "'SF Pro Display', sans-serif",
                    fontSize: fs(14),
                    color: '#64748b',
                    marginTop: px(2),
                  }}
                >
                  {risk.desc}
                </div>
              </div>
            </div>

            {/* Gauge */}
            <div style={{ marginTop: px(12) }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: px(6),
                  fontFamily: "'SF Mono', monospace",
                  fontSize: fs(11),
                  color: '#64748b',
                }}
              >
                <span>风险</span>
                <span>已缓解</span>
              </div>
              <GaugeBar progress={gaugeProgress} color={accentColor} />
            </div>
          </div>
        )
      })}

      {/* Bottom summary */}
      <Sequence from={15 + RISKS.length * STEP_INTERVAL + 15}>
        <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: px(50) }}>
          <div
            style={{
              fontFamily: "'SF Pro Display', sans-serif",
              fontSize: fs(22),
              color: accentColor,
              fontWeight: 600,
              opacity: interpolate(
                frame - (15 + RISKS.length * STEP_INTERVAL + 15),
                [0, 20],
                [0, 1],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
              ),
            }}
          >
            系统化评估，逐项制定缓解策略
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  )
}

export default RiskMatrix
