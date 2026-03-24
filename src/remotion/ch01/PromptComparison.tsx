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

export const PromptComparisonSchema = z.object({
  accentColor: z.string().default('#D97757'),
})

type Props = z.infer<typeof PromptComparisonSchema>

const BAD_PROMPT = '优化这段代码'
const GOOD_PROMPT = '这段代码处理 10000 条数据需要 8 秒。\n目标 < 1 秒。\n分析 top 3 瓶颈，按影响排序。\n对最大瓶颈给出 2 个方案。\n先不改代码。'
const BAD_REACTION = 'Claude 随机选方向优化...\n可能改了你不想改的东西'
const GOOD_REACTION = 'Claude 精确定位瓶颈\n给出对比方案\n等你决定再动手'

export const PromptComparison: React.FC<Props> = ({ accentColor }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const leftProgress = spring({ frame: frame - 15, fps, config: { damping: 15, stiffness: 100 } })
  const rightProgress = spring({ frame: frame - 40, fps, config: { damping: 15, stiffness: 100 } })
  const verdictProgress = spring({ frame: frame - 120, fps, config: { damping: 12, stiffness: 80 } })

  return (
    <AbsoluteFill style={{
      backgroundColor: '#0a0a1a',
      backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
      backgroundSize: '32px 32px',
    }}>
      {/* Title */}
      <div style={{
        position: 'absolute',
        top: 60,
        width: '100%',
        textAlign: 'center',
        fontFamily: "'SF Pro Display', sans-serif",
        fontSize: 42,
        fontWeight: 700,
        color: '#e2e8f0',
        opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' }),
      }}>
        Prompt 对比
      </div>

      {/* Left — Bad */}
      <div style={{
        position: 'absolute',
        left: 120,
        top: 180,
        width: 760,
        opacity: leftProgress,
        transform: `translateX(${interpolate(leftProgress, [0, 1], [-40, 0])}px)`,
      }}>
        <div style={{
          padding: '12px 20px',
          borderRadius: '12px 12px 0 0',
          background: 'rgba(248, 113, 113, 0.1)',
          borderBottom: '2px solid rgba(248, 113, 113, 0.3)',
          fontFamily: "'SF Pro Display', sans-serif",
          fontSize: 20,
          fontWeight: 600,
          color: '#f87171',
        }}>
          ❌ 低效
        </div>
        <div style={{
          padding: '24px',
          borderRadius: '0 0 12px 12px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(248, 113, 113, 0.15)',
          borderTop: 'none',
        }}>
          <div style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: 24,
            color: '#e2e8f0',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
          }}>
            {BAD_PROMPT}
          </div>
        </div>

        {/* Bad reaction */}
        <Sequence from={70}>
          <div style={{
            marginTop: 20,
            padding: '16px 20px',
            borderRadius: 10,
            background: 'rgba(248, 113, 113, 0.05)',
            border: '1px solid rgba(248, 113, 113, 0.1)',
            opacity: interpolate(frame - 70, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          }}>
            <div style={{
              fontFamily: "'SF Pro Display', sans-serif",
              fontSize: 13,
              color: '#4a5068',
              marginBottom: 8,
            }}>Claude 的反应</div>
            <div style={{
              fontFamily: "'SF Pro Display', sans-serif",
              fontSize: 18,
              color: '#f87171',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.5,
            }}>
              {BAD_REACTION}
            </div>
          </div>
        </Sequence>
      </div>

      {/* Center arrow */}
      <div style={{
        position: 'absolute',
        left: 920,
        top: 340,
        fontSize: 36,
        color: accentColor,
        opacity: interpolate(frame, [35, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
      }}>
        →
      </div>

      {/* Right — Good */}
      <div style={{
        position: 'absolute',
        right: 120,
        top: 180,
        width: 760,
        opacity: rightProgress,
        transform: `translateX(${interpolate(rightProgress, [0, 1], [40, 0])}px)`,
      }}>
        <div style={{
          padding: '12px 20px',
          borderRadius: '12px 12px 0 0',
          background: 'rgba(74, 222, 128, 0.1)',
          borderBottom: '2px solid rgba(74, 222, 128, 0.3)',
          fontFamily: "'SF Pro Display', sans-serif",
          fontSize: 20,
          fontWeight: 600,
          color: '#4ade80',
        }}>
          ✅ 高效
        </div>
        <div style={{
          padding: '24px',
          borderRadius: '0 0 12px 12px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(74, 222, 128, 0.15)',
          borderTop: 'none',
        }}>
          <div style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: 20,
            color: '#e2e8f0',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
          }}>
            {GOOD_PROMPT}
          </div>
        </div>

        {/* Good reaction */}
        <Sequence from={90}>
          <div style={{
            marginTop: 20,
            padding: '16px 20px',
            borderRadius: 10,
            background: 'rgba(74, 222, 128, 0.05)',
            border: '1px solid rgba(74, 222, 128, 0.1)',
            opacity: interpolate(frame - 90, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          }}>
            <div style={{
              fontFamily: "'SF Pro Display', sans-serif",
              fontSize: 13,
              color: '#4a5068',
              marginBottom: 8,
            }}>Claude 的反应</div>
            <div style={{
              fontFamily: "'SF Pro Display', sans-serif",
              fontSize: 18,
              color: '#4ade80',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.5,
            }}>
              {GOOD_REACTION}
            </div>
          </div>
        </Sequence>
      </div>

      {/* Bottom verdict */}
      <div style={{
        position: 'absolute',
        bottom: 80,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        opacity: verdictProgress,
        transform: `translateY(${interpolate(verdictProgress, [0, 1], [20, 0])}px)`,
      }}>
        <div style={{
          padding: '16px 40px',
          borderRadius: 16,
          border: `1px solid ${accentColor}40`,
          background: `${accentColor}0a`,
          fontFamily: "'SF Pro Display', sans-serif",
          fontSize: 22,
          color: accentColor,
          fontWeight: 600,
        }}>
          约束越精确，结果越可控
        </div>
      </div>
    </AbsoluteFill>
  )
}

export default PromptComparison
