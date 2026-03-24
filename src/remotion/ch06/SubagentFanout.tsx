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

export const SubagentFanoutSchema = z.object({
  accentColor: z.string().default('#D97757'),
})

type Props = z.infer<typeof SubagentFanoutSchema>

const CHILDREN = [
  { label: 'Explore', model: 'Haiku', angle: -40, color: '#38bdf8' },
  { label: '实现', model: 'Sonnet', angle: 0, color: '#a78bfa' },
  { label: '测试', model: 'Sonnet', angle: 40, color: '#4ade80' },
]

const DotGrid: React.FC<{ bgSize: string }> = ({ bgSize }) => (
  <AbsoluteFill
    style={{
      backgroundColor: '#0a0a1a',
      backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
      backgroundSize: bgSize,
    }}
  />
)

export const SubagentFanout: React.FC<Props> = ({ accentColor = '#D97757' }) => {
  const frame = useCurrentFrame()
  const { px, fs, fps, width, height } = useScale()

  const CENTER_X = width / 2
  const CENTER_Y = height * 0.46
  const RADIUS = px(300)
  const CIRCLE_R = px(70)

  // Center circle entrance
  const centerP = spring({ frame: frame - 10, fps, config: { damping: 12, stiffness: 120 } })
  const centerScale = interpolate(centerP, [0, 1], [0.3, 1])
  const centerOpacity = interpolate(centerP, [0, 1], [0, 1])

  return (
    <AbsoluteFill>
      <DotGrid bgSize={`${px(32)}px ${px(32)}px`} />

      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: px(80),
          width: '100%',
          textAlign: 'center',
          fontFamily: "'SF Pro Display', sans-serif",
          fontSize: fs(42),
          fontWeight: 700,
          color: '#e2e8f0',
          opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' }),
        }}
      >
        Subagent 扇出模型
      </div>

      {/* Subtitle */}
      <div
        style={{
          position: 'absolute',
          top: px(140),
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
        主 Agent 分发任务，子 Agent 并行执行后汇总
      </div>

      {/* Center circle - 主 Agent */}
      <div
        style={{
          position: 'absolute',
          left: CENTER_X - CIRCLE_R,
          top: CENTER_Y - CIRCLE_R,
          width: CIRCLE_R * 2,
          height: CIRCLE_R * 2,
          borderRadius: '50%',
          border: `3px solid ${accentColor}`,
          background: 'rgba(217,119,87,0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${centerScale})`,
          opacity: centerOpacity,
          boxShadow: `0 0 ${px(40)}px ${accentColor}20`,
        }}
      >
        <span
          style={{
            fontFamily: "'SF Pro Display', sans-serif",
            fontSize: fs(20),
            fontWeight: 700,
            color: '#e2e8f0',
          }}
        >
          主 Agent
        </span>
        <span
          style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: fs(12),
            color: accentColor,
            marginTop: px(4),
          }}
        >
          Orchestrator
        </span>
      </div>

      {/* Child agents + connecting lines */}
      {CHILDREN.map((child, i) => {
        const fanStart = 40 + i * 16
        const fanP = spring({ frame: frame - fanStart, fps, config: { damping: 12, stiffness: 100 } })

        // Calculate position along the arc
        const angleRad = (child.angle * Math.PI) / 180
        const childX = CENTER_X + Math.sin(angleRad) * RADIUS
        const childY = CENTER_Y - Math.cos(angleRad) * RADIUS

        // Line progress
        const lineLen = interpolate(fanP, [0, 1], [0, 1])

        // Return flow (results coming back)
        const returnStart = 100 + i * 12
        const returnP = spring({ frame: frame - returnStart, fps, config: { damping: 14, stiffness: 80 } })
        const returnOpacity = interpolate(returnP, [0, 1], [0, 1])

        return (
          <React.Fragment key={i}>
            {/* Outgoing line */}
            <svg
              style={{ position: 'absolute', top: 0, left: 0, width: width, height: height, pointerEvents: 'none' }}
            >
              <line
                x1={CENTER_X}
                y1={CENTER_Y}
                x2={CENTER_X + (childX - CENTER_X) * lineLen}
                y2={CENTER_Y + (childY - CENTER_Y) * lineLen}
                stroke={child.color}
                strokeWidth={2}
                strokeDasharray="8 4"
                opacity={interpolate(fanP, [0, 1], [0, 0.5])}
              />
            </svg>

            {/* Return line (solid) */}
            {frame >= returnStart && (
              <svg
                style={{ position: 'absolute', top: 0, left: 0, width: width, height: height, pointerEvents: 'none' }}
              >
                <line
                  x1={childX}
                  y1={childY}
                  x2={childX + (CENTER_X - childX) * interpolate(returnP, [0, 1], [0, 1])}
                  y2={childY + (CENTER_Y - childY) * interpolate(returnP, [0, 1], [0, 1])}
                  stroke={child.color}
                  strokeWidth={2}
                  opacity={returnOpacity * 0.7}
                />
              </svg>
            )}

            {/* Child circle */}
            <div
              style={{
                position: 'absolute',
                left: childX - px(55),
                top: childY - px(55),
                width: px(110),
                height: px(110),
                borderRadius: '50%',
                border: `2px solid ${child.color}`,
                background: `${child.color}0a`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `scale(${interpolate(fanP, [0, 1], [0.3, 1])})`,
                opacity: interpolate(fanP, [0, 1], [0, 1]),
                boxShadow: `0 0 ${px(20)}px ${child.color}15`,
              }}
            >
              <span
                style={{
                  fontFamily: "'SF Pro Display', sans-serif",
                  fontSize: fs(18),
                  fontWeight: 700,
                  color: '#e2e8f0',
                }}
              >
                {child.label}
              </span>
              <span
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: fs(11),
                  color: child.color,
                  marginTop: px(4),
                }}
              >
                {child.model}
              </span>
            </div>

            {/* Return label */}
            {frame >= returnStart && (
              <div
                style={{
                  position: 'absolute',
                  left: childX - px(30),
                  top: childY + px(60),
                  width: px(60),
                  textAlign: 'center',
                  fontFamily: "'SF Pro Display', sans-serif",
                  fontSize: fs(12),
                  color: child.color,
                  opacity: returnOpacity * 0.8,
                }}
              >
                结果返回
              </div>
            )}
          </React.Fragment>
        )
      })}

      {/* Bottom note */}
      <Sequence from={140}>
        <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: px(80) }}>
          <div
            style={{
              fontFamily: "'SF Pro Display', sans-serif",
              fontSize: fs(22),
              color: accentColor,
              fontWeight: 600,
              opacity: interpolate(frame - 140, [0, 20], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            }}
          >
            用低成本模型做探索，高能力模型做实施
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  )
}

export default SubagentFanout
