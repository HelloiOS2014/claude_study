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

export const McpArchitectureSchema = z.object({
  accentColor: z.string().default('#D97757'),
})

type Props = z.infer<typeof McpArchitectureSchema>

const MCP_SERVERS = [
  { label: 'DB', desc: '数据库查询', color: '#38bdf8', x: 400 },
  { label: 'GitHub', desc: '代码仓库', color: '#a78bfa', x: 960 },
  { label: 'Playwright', desc: '浏览器自动化', color: '#4ade80', x: 1520 },
]

const CENTER_X = 960
const CENTER_Y = 400
const CENTER_W = 260
const CENTER_H = 80
const SERVER_Y = 700
const SERVER_W = 200
const SERVER_H = 100

const DotGrid: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: '#0a0a1a',
      backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
      backgroundSize: '32px 32px',
    }}
  />
)

export const McpArchitecture: React.FC<Props> = ({ accentColor }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Center box entrance
  const centerP = spring({ frame: frame - 10, fps, config: { damping: 12, stiffness: 120 } })

  return (
    <AbsoluteFill>
      <DotGrid />

      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          width: '100%',
          textAlign: 'center',
          fontFamily: "'SF Pro Display', sans-serif",
          fontSize: 42,
          fontWeight: 700,
          color: '#e2e8f0',
          opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' }),
        }}
      >
        MCP 服务器架构
      </div>

      {/* Subtitle */}
      <div
        style={{
          position: 'absolute',
          top: 140,
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
        Model Context Protocol 统一工具接入层
      </div>

      {/* Protocol label */}
      <div
        style={{
          position: 'absolute',
          left: CENTER_X,
          top: CENTER_Y + CENTER_H / 2 + 30,
          transform: 'translateX(-50%)',
          fontFamily: "'SF Mono', monospace",
          fontSize: 14,
          color: 'rgba(255,255,255,0.3)',
          letterSpacing: 2,
          opacity: interpolate(frame, [30, 45], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        MCP PROTOCOL (stdio / SSE)
      </div>

      {/* Center box: Claude Code */}
      <div
        style={{
          position: 'absolute',
          left: CENTER_X - CENTER_W / 2,
          top: CENTER_Y - CENTER_H / 2,
          width: CENTER_W,
          height: CENTER_H,
          borderRadius: 16,
          border: `3px solid ${accentColor}`,
          background: 'rgba(217,119,87,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${interpolate(centerP, [0, 1], [0.5, 1])})`,
          opacity: interpolate(centerP, [0, 1], [0, 1]),
          boxShadow: `0 0 40px ${accentColor}20`,
        }}
      >
        <span
          style={{
            fontFamily: "'SF Pro Display', sans-serif",
            fontSize: 24,
            fontWeight: 700,
            color: '#e2e8f0',
          }}
        >
          Claude Code
        </span>
      </div>

      {/* MCP Server boxes + connecting lines */}
      {MCP_SERVERS.map((server, i) => {
        const delay = 35 + i * 18
        const sp = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 100 } })

        // Line from center to server
        const lineProgress = interpolate(sp, [0, 1], [0, 1])

        // Data flow animation (pulsing dots on line)
        const pulseStart = delay + 25
        const pulsePhase = ((frame - pulseStart) % 30) / 30
        const pulseActive = frame >= pulseStart

        return (
          <React.Fragment key={i}>
            {/* Connecting line */}
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 1920,
                height: 1080,
                pointerEvents: 'none',
              }}
            >
              <line
                x1={CENTER_X}
                y1={CENTER_Y + CENTER_H / 2}
                x2={CENTER_X + (server.x - CENTER_X) * lineProgress}
                y2={CENTER_Y + CENTER_H / 2 + (SERVER_Y - SERVER_H / 2 - CENTER_Y - CENTER_H / 2) * lineProgress}
                stroke={server.color}
                strokeWidth={2}
                strokeDasharray="6 4"
                opacity={interpolate(sp, [0, 1], [0, 0.5])}
              />
              {/* Pulse dot traveling along line */}
              {pulseActive && (
                <circle
                  cx={CENTER_X + (server.x - CENTER_X) * pulsePhase}
                  cy={CENTER_Y + CENTER_H / 2 + (SERVER_Y - SERVER_H / 2 - CENTER_Y - CENTER_H / 2) * pulsePhase}
                  r={4}
                  fill={server.color}
                  opacity={0.8}
                />
              )}
            </svg>

            {/* Server box */}
            <div
              style={{
                position: 'absolute',
                left: server.x - SERVER_W / 2,
                top: SERVER_Y - SERVER_H / 2,
                width: SERVER_W,
                height: SERVER_H,
                borderRadius: 14,
                border: `2px solid ${server.color}`,
                background: `${server.color}0a`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transform: `scale(${interpolate(sp, [0, 1], [0.5, 1])})`,
                opacity: interpolate(sp, [0, 1], [0, 1]),
                boxShadow: `0 0 20px ${server.color}15`,
              }}
            >
              <span
                style={{
                  fontFamily: "'SF Pro Display', sans-serif",
                  fontSize: 22,
                  fontWeight: 700,
                  color: '#e2e8f0',
                }}
              >
                {server.label}
              </span>
              <span
                style={{
                  fontFamily: "'SF Pro Display', sans-serif",
                  fontSize: 13,
                  color: server.color,
                }}
              >
                {server.desc}
              </span>
            </div>
          </React.Fragment>
        )
      })}

      {/* Bottom note */}
      <Sequence from={110}>
        <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 60 }}>
          <div
            style={{
              fontFamily: "'SF Pro Display', sans-serif",
              fontSize: 22,
              color: accentColor,
              fontWeight: 600,
              opacity: interpolate(frame - 110, [0, 20], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            }}
          >
            一套协议，无限扩展工具能力
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  )
}
