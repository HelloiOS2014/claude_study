import React from 'react'
import { z } from 'zod'
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion'

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
const CARD_W = 360
const CARD_H = 200
const GAP_X = 60
const GAP_Y = 50
const STEP_INTERVAL = 18

const DotGrid: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: '#0a0a1a',
      backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
      backgroundSize: '32px 32px',
    }}
  />
)

const GaugeBar: React.FC<{ progress: number; color: string }> = ({ progress }) => {
  const width = interpolate(progress, [0, 1], [0, 100])
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
          width: `${width}%`,
          height: '100%',
          borderRadius: 3,
          background: `linear-gradient(90deg, #ef4444, ${gaugeColor})`,
          boxShadow: `0 0 8px ${gaugeColor}40`,
        }}
      />
    </div>
  )
}

export const RiskMatrix: React.FC<Props> = ({ accentColor }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const totalW = COLS * CARD_W + (COLS - 1) * GAP_X
  const totalH = 2 * CARD_H + GAP_Y
  const startX = (1920 - totalW) / 2
  const startY = (1080 - totalH) / 2 + 40

  return (
    <AbsoluteFill>
      <DotGrid />

      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: 70,
          width: '100%',
          textAlign: 'center',
          fontFamily: "'SF Pro Display', sans-serif",
          fontSize: 42,
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
          top: 130,
          width: '100%',
          textAlign: 'center',
          fontFamily: "'SF Pro Display', sans-serif",
          fontSize: 22,
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
              borderRadius: 16,
              border: `2px solid ${isActive ? accentColor : 'rgba(255,255,255,0.08)'}`,
              background: `rgba(255,255,255,${pulseOpacity})`,
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transform: `scale(${interpolate(cp, [0, 1], [0.85, 1])})`,
              opacity: interpolate(cp, [0, 1], [0, 1]),
              boxShadow: isActive ? `0 0 30px ${accentColor}15` : 'none',
            }}
          >
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 28 }}>{risk.icon}</span>
              <div>
                <div
                  style={{
                    fontFamily: "'SF Pro Display', sans-serif",
                    fontSize: 22,
                    fontWeight: 700,
                    color: isActive ? '#e2e8f0' : '#94a3b8',
                  }}
                >
                  {risk.label}
                </div>
                <div
                  style={{
                    fontFamily: "'SF Pro Display', sans-serif",
                    fontSize: 14,
                    color: '#64748b',
                    marginTop: 2,
                  }}
                >
                  {risk.desc}
                </div>
              </div>
            </div>

            {/* Gauge */}
            <div style={{ marginTop: 12 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 6,
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 11,
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
        <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 50 }}>
          <div
            style={{
              fontFamily: "'SF Pro Display', sans-serif",
              fontSize: 22,
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
