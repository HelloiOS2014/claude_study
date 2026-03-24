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

export const HookEventFlowSchema = z.object({
  accentColor: z.string().default('#D97757'),
})

type Props = z.infer<typeof HookEventFlowSchema>

const STAGES = [
  { label: '输入', type: 'normal' as const },
  { label: 'PreToolUse', type: 'hook' as const },
  { label: '执行', type: 'normal' as const },
  { label: 'PostToolUse', type: 'hook' as const },
  { label: 'Stop', type: 'hook' as const },
]

const HOOKS: Record<string, string[]> = {
  PreToolUse: ['Allow', 'Deny'],
  PostToolUse: ['修改结果', '通过'],
  Stop: ['Allow', 'Deny'],
}

const BOX_W = 180
const BOX_H = 64
const GAP = 70
const STEP_INTERVAL = 30

const DotGrid: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: '#0a0a1a',
      backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
      backgroundSize: '32px 32px',
    }}
  />
)

export const HookEventFlow: React.FC<Props> = ({ accentColor }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const totalW = STAGES.length * BOX_W + (STAGES.length - 1) * GAP
  const startX = (1920 - totalW) / 2
  const centerY = 440

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
        Hook 事件流
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
        在关键节点拦截并控制 Agent 行为
      </div>

      {/* Timeline stages */}
      {STAGES.map((stage, i) => {
        const stepStart = 20 + i * STEP_INTERVAL
        const p = spring({ frame: frame - stepStart, fps, config: { damping: 14, stiffness: 120 } })
        const isHook = stage.type === 'hook'
        const x = startX + i * (BOX_W + GAP)

        const hookBranches = isHook ? HOOKS[stage.label] || [] : []
        const branchStart = stepStart + 18

        return (
          <React.Fragment key={i}>
            {/* Connector arrow */}
            {i > 0 && (
              <div
                style={{
                  position: 'absolute',
                  left: x - GAP + 5,
                  top: centerY + BOX_H / 2 - 1,
                  width: GAP - 10,
                  height: 2,
                  background: frame >= stepStart ? accentColor : 'rgba(255,255,255,0.08)',
                  opacity: interpolate(frame - stepStart, [0, 10], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  }),
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    right: -5,
                    top: -4,
                    width: 0,
                    height: 0,
                    borderTop: '5px solid transparent',
                    borderBottom: '5px solid transparent',
                    borderLeft: `8px solid ${frame >= stepStart ? accentColor : 'rgba(255,255,255,0.08)'}`,
                  }}
                />
              </div>
            )}

            {/* Stage box */}
            <div
              style={{
                position: 'absolute',
                left: x,
                top: centerY,
                width: BOX_W,
                height: BOX_H,
                borderRadius: 14,
                border: `2px solid ${isHook ? '#818cf8' : (frame >= stepStart ? accentColor : 'rgba(255,255,255,0.08)')}`,
                background: isHook
                  ? 'rgba(129,140,248,0.08)'
                  : frame >= stepStart
                    ? 'rgba(217,119,87,0.08)'
                    : 'rgba(255,255,255,0.02)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `scale(${interpolate(p, [0, 1], [0.85, 1])})`,
                opacity: interpolate(p, [0, 1], [0, 1]),
                boxShadow: isHook ? '0 0 20px rgba(129,140,248,0.15)' : 'none',
              }}
            >
              <span
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 17,
                  fontWeight: 700,
                  color: isHook ? '#a5b4fc' : '#e2e8f0',
                  textAlign: 'center',
                }}
              >
                {stage.label}
              </span>
            </div>

            {/* Hook label */}
            {isHook && (
              <div
                style={{
                  position: 'absolute',
                  left: x,
                  top: centerY - 28,
                  width: BOX_W,
                  textAlign: 'center',
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 12,
                  color: '#818cf8',
                  letterSpacing: 1,
                  opacity: interpolate(p, [0, 1], [0, 0.7]),
                }}
              >
                HOOK
              </div>
            )}

            {/* Branch hooks (allow/deny) */}
            {hookBranches.map((branch, bi) => {
              const bp = spring({
                frame: frame - branchStart - bi * 8,
                fps,
                config: { damping: 14, stiffness: 100 },
              })
              const isAllow = branch === 'Allow' || branch === '通过'
              const branchColor = isAllow ? '#4ade80' : '#f87171'
              const yOffset = bi === 0 ? -80 : 80

              return (
                <React.Fragment key={`${i}-${bi}`}>
                  {/* Vertical line from box to branch */}
                  <div
                    style={{
                      position: 'absolute',
                      left: x + BOX_W / 2 - 1,
                      top: yOffset < 0 ? centerY + yOffset + 36 : centerY + BOX_H,
                      width: 2,
                      height: Math.abs(yOffset) - (yOffset < 0 ? 36 : 0),
                      backgroundColor: `${branchColor}40`,
                      opacity: interpolate(bp, [0, 1], [0, 1]),
                    }}
                  />
                  {/* Branch pill */}
                  <div
                    style={{
                      position: 'absolute',
                      left: x + BOX_W / 2 - 40,
                      top: centerY + BOX_H / 2 + yOffset - 16,
                      width: 80,
                      height: 32,
                      borderRadius: 16,
                      border: `1.5px solid ${branchColor}60`,
                      background: `${branchColor}12`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: `scale(${interpolate(bp, [0, 1], [0.7, 1])})`,
                      opacity: interpolate(bp, [0, 1], [0, 1]),
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'SF Pro Display', sans-serif",
                        fontSize: 13,
                        fontWeight: 600,
                        color: branchColor,
                      }}
                    >
                      {branch}
                    </span>
                  </div>
                </React.Fragment>
              )
            })}
          </React.Fragment>
        )
      })}

      {/* Bottom note */}
      <Sequence from={20 + STAGES.length * STEP_INTERVAL + 20}>
        <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 80 }}>
          <div
            style={{
              fontFamily: "'SF Pro Display', sans-serif",
              fontSize: 22,
              color: accentColor,
              fontWeight: 600,
              opacity: interpolate(
                frame - (20 + STAGES.length * STEP_INTERVAL + 20),
                [0, 20],
                [0, 1],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
              ),
            }}
          >
            Hooks 让你在不修改 Agent 代码的情况下控制行为
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  )
}

export default HookEventFlow
