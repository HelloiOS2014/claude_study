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

export const RequestLifecycleSchema = z.object({
  accentColor: z.string().default('#D97757'),
})

type Props = z.infer<typeof RequestLifecycleSchema>

const NODES = [
  { label: '你的输入', tokens: 0 },
  { label: 'System Prompt', tokens: 3200 },
  { label: 'LLM 推理', tokens: 800 },
  { label: '选择工具', tokens: 100 },
  { label: 'Hook 检查', tokens: 50 },
  { label: '权限验证', tokens: 20 },
  { label: '执行工具', tokens: 245 },
  { label: '结果注入', tokens: 600 },
  { label: '回复', tokens: 400 },
]

const NODE_INTERVAL = 16

const DotGrid: React.FC<{ dotSize: string }> = ({ dotSize }) => (
  <AbsoluteFill
    style={{
      backgroundColor: '#0a0a1a',
      backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
      backgroundSize: dotSize,
    }}
  />
)

export const RequestLifecycle: React.FC<Props> = ({ accentColor }) => {
  const frame = useCurrentFrame()
  const { fps, height, px, fs, centerX } = useScale()

  const NODE_WIDTH = px(160)
  const NODE_HEIGHT = px(56)
  const GAP = px(24)

  const totalWidth = NODES.length * NODE_WIDTH + (NODES.length - 1) * GAP
  const startX = centerX(totalWidth)
  const centerYPos = height / 2

  return (
    <AbsoluteFill>
      <DotGrid dotSize={`${px(32)}px ${px(32)}px`} />

      {/* Title */}
      <Sequence from={0} durationInFrames={180}>
        <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: px(80) }}>
          <div style={{
            fontFamily: "'SF Pro Display', sans-serif",
            fontSize: fs(42),
            fontWeight: 700,
            color: '#e2e8f0',
            opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' }),
          }}>
            一条请求的完整旅程
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Nodes */}
      {NODES.map((node, i) => {
        const nodeStart = 10 + i * NODE_INTERVAL
        const progress = spring({ frame: frame - nodeStart, fps, config: { damping: 15, stiffness: 120 } })
        const isActive = frame >= nodeStart
        const x = startX + i * (NODE_WIDTH + GAP)
        const y = centerYPos - NODE_HEIGHT / 2

        // Token counter
        let cumulativeTokens = 0
        for (let j = 0; j <= i; j++) cumulativeTokens += NODES[j].tokens

        const tokenProgress = interpolate(
          frame - nodeStart,
          [0, 20],
          [0, cumulativeTokens],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        )

        return (
          <React.Fragment key={i}>
            {/* Connector line */}
            {i > 0 && (
              <div style={{
                position: 'absolute',
                left: x - GAP,
                top: centerYPos - 1,
                width: GAP,
                height: 2,
                background: isActive ? accentColor : 'rgba(255,255,255,0.1)',
                opacity: interpolate(frame - nodeStart, [0, 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                transition: 'background 0.3s',
              }} />
            )}

            {/* Node box */}
            <div style={{
              position: 'absolute',
              left: x,
              top: y,
              width: NODE_WIDTH,
              height: NODE_HEIGHT,
              borderRadius: px(12),
              border: `2px solid ${isActive ? accentColor : 'rgba(255,255,255,0.1)'}`,
              background: isActive ? 'rgba(217, 119, 87, 0.08)' : 'rgba(255,255,255,0.02)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${interpolate(progress, [0, 1], [0.8, 1])})`,
              opacity: interpolate(progress, [0, 1], [0, 1]),
              boxShadow: isActive ? `0 0 ${px(20)}px rgba(217,119,87,0.15)` : 'none',
            }}>
              <span style={{
                fontFamily: "'SF Pro Display', sans-serif",
                fontSize: fs(14),
                fontWeight: 600,
                color: isActive ? '#e2e8f0' : '#4a5068',
                textAlign: 'center',
              }}>
                {node.label}
              </span>
            </div>

            {/* Token counter */}
            {isActive && node.tokens > 0 && (
              <div style={{
                position: 'absolute',
                left: x + NODE_WIDTH / 2,
                top: y + NODE_HEIGHT + px(12),
                transform: 'translateX(-50%)',
                fontFamily: "'SF Mono', monospace",
                fontSize: fs(11),
                color: accentColor,
                opacity: interpolate(frame - nodeStart, [5, 15], [0, 0.8], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
              }}>
                +{Math.round(tokenProgress)} tokens
              </div>
            )}
          </React.Fragment>
        )
      })}

      {/* Total counter */}
      <Sequence from={10 + NODES.length * NODE_INTERVAL}>
        <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: px(120) }}>
          <div style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: fs(24),
            color: accentColor,
            opacity: interpolate(
              frame - (10 + NODES.length * NODE_INTERVAL),
              [0, 20],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            ),
          }}>
            总计 ≈ {NODES.reduce((s, n) => s + n.tokens, 0)} tokens / 次请求
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  )
}

export default RequestLifecycle
