import React from 'react'
import { z } from 'zod'
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
} from 'remotion'

export const PromptDissectionSchema = z.object({
  accentColor: z.string().default('#D97757'),
})

type Props = z.infer<typeof PromptDissectionSchema>

const LINES = [
  {
    text: '这段代码处理10000条数据需要8秒。',
    annotation: '给了具体度量 → Claude 知道瓶颈级别',
    color: '#4ade80',
  },
  {
    text: '阅读代码后分析瓶颈。',
    annotation: '强制先 Read 再回答，不凭猜测',
    color: '#4ade80',
  },
  {
    text: '只分析不修改。',
    annotation: '约束工具调用边界，防止越权',
    color: '#4ade80',
  },
]

const LINE_INTERVAL = 40
const ANNOTATION_DELAY = 20

export const PromptDissection: React.FC<Props> = ({ accentColor }) => {
  const frame = useCurrentFrame()

  return (
    <AbsoluteFill style={{
      backgroundColor: '#0a0a1a',
      backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
      backgroundSize: '32px 32px',
    }}>
      {/* Title */}
      <div style={{
        position: 'absolute',
        top: 80,
        width: '100%',
        textAlign: 'center',
        fontFamily: "'SF Pro Display', sans-serif",
        fontSize: 42,
        fontWeight: 700,
        color: '#e2e8f0',
        opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' }),
      }}>
        Prompt 逐句解析
      </div>

      {/* Prompt card */}
      <div style={{
        position: 'absolute',
        left: 200,
        top: 200,
        width: 1520,
      }}>
        {LINES.map((line, i) => {
          const lineStart = 20 + i * LINE_INTERVAL
          const annotationStart = lineStart + ANNOTATION_DELAY

          const lineOpacity = interpolate(frame - lineStart, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          const lineY = interpolate(frame - lineStart, [0, 15], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          const annotationOpacity = interpolate(frame - annotationStart, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          const annotationX = interpolate(frame - annotationStart, [0, 15], [-20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

          return (
            <div key={i} style={{ marginBottom: 48 }}>
              {/* Prompt line */}
              <div style={{
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                fontSize: 28,
                color: '#e2e8f0',
                padding: '16px 24px',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${frame >= annotationStart ? accentColor + '40' : 'rgba(255,255,255,0.06)'}`,
                opacity: lineOpacity,
                transform: `translateY(${lineY}px)`,
              }}>
                <span style={{ color: '#4a5068', marginRight: 12 }}>{i + 1}</span>
                {line.text}
              </div>

              {/* Annotation */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginTop: 12,
                marginLeft: 48,
                opacity: annotationOpacity,
                transform: `translateX(${annotationX}px)`,
              }}>
                <div style={{
                  width: 24,
                  height: 2,
                  background: line.color,
                  borderRadius: 1,
                }} />
                <span style={{
                  fontFamily: "'SF Pro Display', sans-serif",
                  fontSize: 20,
                  color: line.color,
                  fontWeight: 500,
                }}>
                  {line.annotation}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom verdict */}
      <Sequence from={20 + LINES.length * LINE_INTERVAL + 15}>
        <AbsoluteFill style={{
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: 100,
        }}>
          <div style={{
            fontFamily: "'SF Pro Display', sans-serif",
            fontSize: 24,
            color: accentColor,
            padding: '16px 32px',
            borderRadius: 12,
            border: `1px solid ${accentColor}40`,
            background: `${accentColor}0a`,
            opacity: interpolate(
              frame - (20 + LINES.length * LINE_INTERVAL + 15),
              [0, 20],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            ),
          }}>
            每一句都有明确目的 → 精确的 Prompt = 精确的结果
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  )
}
