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

export const ClaudeMdHierarchySchema = z.object({
  accentColor: z.string().default('#D97757'),
})

type Props = z.infer<typeof ClaudeMdHierarchySchema>

const FILES = [
  { path: '~/.claude/CLAUDE.md', priority: 'P0 全局', indent: 0, color: '#f87171' },
  { path: './CLAUDE.md', priority: 'P1 项目根', indent: 1, color: '#fb923c' },
  { path: './src/CLAUDE.md', priority: 'P2 子目录', indent: 2, color: '#fbbf24' },
  { path: './.claude/rules/*.md', priority: 'P3 规则集', indent: 3, color: '#4ade80' },
]

const STEP_INTERVAL = 28
const ROW_HEIGHT = 80
const INDENT_PX = 60

const DotGrid: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: '#0a0a1a',
      backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
      backgroundSize: '32px 32px',
    }}
  />
)

export const ClaudeMdHierarchy: React.FC<Props> = ({ accentColor }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const startY = 280
  const baseX = 340

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
        CLAUDE.md 层级体系
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
        越近的文件优先级越高，覆盖上层指令
      </div>

      {/* File tree */}
      {FILES.map((file, i) => {
        const stepStart = 20 + i * STEP_INTERVAL
        const p = spring({
          frame: frame - stepStart,
          fps,
          config: { damping: 14, stiffness: 120 },
        })

        const x = baseX + file.indent * INDENT_PX
        const y = startY + i * ROW_HEIGHT

        // Slide from left
        const slideX = interpolate(p, [0, 1], [-80, 0])
        const opacity = interpolate(p, [0, 1], [0, 1])

        // Connector line to parent
        const showConnector = file.indent > 0 && frame >= stepStart

        return (
          <React.Fragment key={i}>
            {/* Vertical + horizontal connector lines */}
            {showConnector && (
              <>
                {/* Vertical line from parent */}
                <div
                  style={{
                    position: 'absolute',
                    left: x - INDENT_PX / 2 + 8,
                    top: y - ROW_HEIGHT + 40,
                    width: 2,
                    height: ROW_HEIGHT - 10,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    opacity: interpolate(frame - stepStart, [0, 10], [0, 1], {
                      extrapolateLeft: 'clamp',
                      extrapolateRight: 'clamp',
                    }),
                  }}
                />
                {/* Horizontal line to node */}
                <div
                  style={{
                    position: 'absolute',
                    left: x - INDENT_PX / 2 + 8,
                    top: y + 28,
                    width: INDENT_PX / 2 - 8,
                    height: 2,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    opacity: interpolate(frame - stepStart, [0, 10], [0, 1], {
                      extrapolateLeft: 'clamp',
                      extrapolateRight: 'clamp',
                    }),
                  }}
                />
              </>
            )}

            {/* File row */}
            <div
              style={{
                position: 'absolute',
                left: x,
                top: y,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                opacity,
                transform: `translateX(${slideX}px)`,
              }}
            >
              {/* File icon dot */}
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  backgroundColor: file.color,
                  boxShadow: `0 0 12px ${file.color}60`,
                  flexShrink: 0,
                }}
              />

              {/* File path */}
              <span
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 24,
                  color: '#e2e8f0',
                  fontWeight: 600,
                }}
              >
                {file.path}
              </span>

              {/* Priority badge */}
              <div
                style={{
                  padding: '4px 14px',
                  borderRadius: 8,
                  backgroundColor: `${file.color}18`,
                  border: `1px solid ${file.color}40`,
                  fontFamily: "'SF Pro Display', sans-serif",
                  fontSize: 15,
                  fontWeight: 600,
                  color: file.color,
                  whiteSpace: 'nowrap',
                }}
              >
                {file.priority}
              </div>
            </div>
          </React.Fragment>
        )
      })}

      {/* Arrow showing override direction */}
      <Sequence from={20 + FILES.length * STEP_INTERVAL + 10}>
        <AbsoluteFill
          style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 100 }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontFamily: "'SF Pro Display', sans-serif",
              fontSize: 22,
              color: accentColor,
              fontWeight: 600,
              opacity: interpolate(
                frame - (20 + FILES.length * STEP_INTERVAL + 10),
                [0, 20],
                [0, 1],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
              ),
            }}
          >
            <span>覆盖方向</span>
            <span style={{ fontSize: 28 }}>↓</span>
            <span>近距离文件 &gt; 全局文件</span>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  )
}

export default ClaudeMdHierarchy
