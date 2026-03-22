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

export const AgentTeamsTopologySchema = z.object({
  accentColor: z.string().default('#D97757'),
})

type Props = z.infer<typeof AgentTeamsTopologySchema>

const NODE_R = 40

const DotGrid: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: '#0a0a1a',
      backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
      backgroundSize: '32px 32px',
    }}
  />
)

// Star topology nodes (left side)
const STAR_CENTER = { x: 480, y: 520 }
const STAR_CHILDREN = [
  { x: 320, y: 380, label: '搜索' },
  { x: 640, y: 380, label: '编码' },
  { x: 320, y: 660, label: '测试' },
  { x: 640, y: 660, label: '文档' },
]

// Mesh topology nodes (right side)
const MESH_NODES = [
  { x: 1160, y: 380, label: 'Agent A' },
  { x: 1400, y: 380, label: 'Agent B' },
  { x: 1160, y: 660, label: 'Agent C' },
  { x: 1400, y: 660, label: 'Agent D' },
  { x: 1280, y: 520, label: '协调者' },
]

export const AgentTeamsTopology: React.FC<Props> = ({ accentColor }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Section label animations
  const leftLabelP = spring({ frame: frame - 10, fps, config: { damping: 14, stiffness: 120 } })
  const rightLabelP = spring({ frame: frame - 15, fps, config: { damping: 14, stiffness: 120 } })

  return (
    <AbsoluteFill>
      <DotGrid />

      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          width: '100%',
          textAlign: 'center',
          fontFamily: "'SF Pro Display', sans-serif",
          fontSize: 42,
          fontWeight: 700,
          color: '#e2e8f0',
          opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' }),
        }}
      >
        Agent 协作拓扑
      </div>

      {/* Divider line */}
      <div
        style={{
          position: 'absolute',
          left: 960,
          top: 200,
          width: 2,
          height: interpolate(frame, [15, 40], [0, 600], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          backgroundColor: 'rgba(255,255,255,0.1)',
        }}
      />

      {/* Left label: Subagent 星型 */}
      <div
        style={{
          position: 'absolute',
          left: 480,
          top: 230,
          transform: 'translateX(-50%)',
          fontFamily: "'SF Pro Display', sans-serif",
          fontSize: 28,
          fontWeight: 700,
          color: '#38bdf8',
          opacity: interpolate(leftLabelP, [0, 1], [0, 1]),
        }}
      >
        Subagent 星型
      </div>

      {/* Right label: Teams 网状 */}
      <div
        style={{
          position: 'absolute',
          left: 1280,
          top: 230,
          transform: 'translateX(-50%)',
          fontFamily: "'SF Pro Display', sans-serif",
          fontSize: 28,
          fontWeight: 700,
          color: '#a78bfa',
          opacity: interpolate(rightLabelP, [0, 1], [0, 1]),
        }}
      >
        Teams 网状
      </div>

      {/* ── Left: Star topology ── */}
      {/* Center node */}
      {(() => {
        const cp = spring({ frame: frame - 25, fps, config: { damping: 12, stiffness: 120 } })
        return (
          <div
            style={{
              position: 'absolute',
              left: STAR_CENTER.x - NODE_R,
              top: STAR_CENTER.y - NODE_R,
              width: NODE_R * 2,
              height: NODE_R * 2,
              borderRadius: '50%',
              border: '3px solid #38bdf8',
              background: 'rgba(56,189,248,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${interpolate(cp, [0, 1], [0.3, 1])})`,
              opacity: interpolate(cp, [0, 1], [0, 1]),
              boxShadow: '0 0 20px rgba(56,189,248,0.15)',
            }}
          >
            <span style={{ fontFamily: "'SF Pro Display', sans-serif", fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>
              主控
            </span>
          </div>
        )
      })()}

      {/* Star children + lines */}
      {STAR_CHILDREN.map((child, i) => {
        const delay = 40 + i * 12
        const cp = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 100 } })
        const lineLen = interpolate(cp, [0, 1], [0, 1])

        return (
          <React.Fragment key={`star-${i}`}>
            {/* Line from center to child */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, pointerEvents: 'none' }}>
              <line
                x1={STAR_CENTER.x}
                y1={STAR_CENTER.y}
                x2={STAR_CENTER.x + (child.x - STAR_CENTER.x) * lineLen}
                y2={STAR_CENTER.y + (child.y - STAR_CENTER.y) * lineLen}
                stroke="#38bdf8"
                strokeWidth={2}
                opacity={interpolate(cp, [0, 1], [0, 0.4])}
              />
            </svg>

            {/* Child node */}
            <div
              style={{
                position: 'absolute',
                left: child.x - 35,
                top: child.y - 35,
                width: 70,
                height: 70,
                borderRadius: '50%',
                border: '2px solid rgba(56,189,248,0.5)',
                background: 'rgba(56,189,248,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `scale(${interpolate(cp, [0, 1], [0.3, 1])})`,
                opacity: interpolate(cp, [0, 1], [0, 1]),
              }}
            >
              <span style={{ fontFamily: "'SF Pro Display', sans-serif", fontSize: 13, fontWeight: 600, color: '#94d8f6' }}>
                {child.label}
              </span>
            </div>
          </React.Fragment>
        )
      })}

      {/* ── Right: Mesh topology ── */}
      {/* All mesh lines first (all-to-all connections) */}
      {MESH_NODES.map((nodeA, i) =>
        MESH_NODES.map((nodeB, j) => {
          if (j <= i) return null
          const delay = 80 + Math.max(i, j) * 8
          const lp = interpolate(frame - delay, [0, 15], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
          return (
            <svg key={`mesh-line-${i}-${j}`} style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, pointerEvents: 'none' }}>
              <line
                x1={nodeA.x}
                y1={nodeA.y}
                x2={nodeA.x + (nodeB.x - nodeA.x) * lp}
                y2={nodeA.y + (nodeB.y - nodeA.y) * lp}
                stroke="#a78bfa"
                strokeWidth={1.5}
                opacity={lp * 0.3}
              />
            </svg>
          )
        })
      )}

      {/* Mesh nodes */}
      {MESH_NODES.map((node, i) => {
        const delay = 70 + i * 10
        const np = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 100 } })
        const isCoord = node.label === '协调者'

        return (
          <div
            key={`mesh-${i}`}
            style={{
              position: 'absolute',
              left: node.x - (isCoord ? NODE_R : 35),
              top: node.y - (isCoord ? NODE_R : 35),
              width: isCoord ? NODE_R * 2 : 70,
              height: isCoord ? NODE_R * 2 : 70,
              borderRadius: '50%',
              border: `${isCoord ? 3 : 2}px solid ${isCoord ? '#a78bfa' : 'rgba(167,139,250,0.5)'}`,
              background: isCoord ? 'rgba(167,139,250,0.08)' : 'rgba(167,139,250,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${interpolate(np, [0, 1], [0.3, 1])})`,
              opacity: interpolate(np, [0, 1], [0, 1]),
              boxShadow: isCoord ? '0 0 20px rgba(167,139,250,0.15)' : 'none',
            }}
          >
            <span
              style={{
                fontFamily: "'SF Pro Display', sans-serif",
                fontSize: isCoord ? 14 : 12,
                fontWeight: isCoord ? 700 : 600,
                color: isCoord ? '#e2e8f0' : '#c4b5fd',
              }}
            >
              {node.label}
            </span>
          </div>
        )
      })}

      {/* Comparison labels at bottom */}
      <Sequence from={150}>
        <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 60 }}>
          <div
            style={{
              display: 'flex',
              gap: 80,
              opacity: interpolate(frame - 150, [0, 20], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'SF Pro Display', sans-serif", fontSize: 18, color: '#38bdf8', fontWeight: 600 }}>
                星型: 中心控制
              </div>
              <div style={{ fontFamily: "'SF Pro Display', sans-serif", fontSize: 14, color: '#7c86a0', marginTop: 4 }}>
                简单可控，单点瓶颈
              </div>
            </div>
            <div style={{ width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.1)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'SF Pro Display', sans-serif", fontSize: 18, color: '#a78bfa', fontWeight: 600 }}>
                网状: 对等协作
              </div>
              <div style={{ fontFamily: "'SF Pro Display', sans-serif", fontSize: 14, color: '#7c86a0', marginTop: 4 }}>
                灵活强大，复杂度高
              </div>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  )
}
