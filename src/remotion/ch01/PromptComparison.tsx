import React from 'react'
import { z } from 'zod'
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
} from 'remotion'
import { useScale } from '../shared/useScale'

export const PromptComparisonSchema = z.object({
  accentColor: z.string().default('#D97757'),
})

type Props = z.infer<typeof PromptComparisonSchema>

const BAD_PROMPT = '优化这段代码'
const GOOD_PROMPT = '这段代码处理 10000 条数据需要 8 秒。\n目标 < 1 秒。\n分析 top 3 瓶颈，按影响排序。\n对最大瓶颈给出 2 个方案。\n先不改代码。'
const BAD_REACTION = 'Claude 随机选方向优化...\n可能改了你不想改的东西'
const GOOD_REACTION = 'Claude 精确定位瓶颈\n给出对比方案\n等你决定再动手'

export const PromptComparison: React.FC<Props> = ({ accentColor = '#D97757' }) => {
  const frame = useCurrentFrame()
  const { fps, px, fs } = useScale()

  const leftProgress = spring({ frame: frame - 15, fps, config: { damping: 15, stiffness: 100 } })
  const rightProgress = spring({ frame: frame - 40, fps, config: { damping: 15, stiffness: 100 } })
  const verdictProgress = spring({ frame: frame - 120, fps, config: { damping: 12, stiffness: 80 } })

  return (
    <AbsoluteFill style={{
      backgroundColor: '#0a0a1a',
      backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
      backgroundSize: `${px(32)}px ${px(32)}px`,
    }}>
      {/* Title */}
      <div style={{
        position: 'absolute',
        top: px(60),
        width: '100%',
        textAlign: 'center',
        fontFamily: "'SF Pro Display', sans-serif",
        fontSize: fs(42),
        fontWeight: 700,
        color: '#e2e8f0',
        opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' }),
      }}>
        Prompt 对比
      </div>

      {/* Left — Bad */}
      <div style={{
        position: 'absolute',
        left: px(120),
        top: px(180),
        width: px(760),
        opacity: leftProgress,
        transform: `translateX(${interpolate(leftProgress, [0, 1], [-40, 0])}px)`,
      }}>
        <div style={{
          padding: `${px(12)}px ${px(20)}px`,
          borderRadius: `${px(12)}px ${px(12)}px 0 0`,
          background: 'rgba(248, 113, 113, 0.1)',
          borderBottom: '2px solid rgba(248, 113, 113, 0.3)',
          fontFamily: "'SF Pro Display', sans-serif",
          fontSize: fs(20),
          fontWeight: 600,
          color: '#f87171',
        }}>
          ❌ 低效
        </div>
        <div style={{
          padding: px(24),
          borderRadius: `0 0 ${px(12)}px ${px(12)}px`,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(248, 113, 113, 0.15)',
          borderTop: 'none',
        }}>
          <div style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: fs(24),
            color: '#e2e8f0',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
          }}>
            {BAD_PROMPT}
          </div>
        </div>

        {/* Bad reaction — no Sequence to avoid absolute positioning overlay */}
        <div style={{
          marginTop: px(12),
          padding: `${px(10)}px ${px(14)}px`,
          borderRadius: px(10),
          background: 'rgba(248, 113, 113, 0.05)',
          border: '1px solid rgba(248, 113, 113, 0.1)',
          opacity: interpolate(frame, [70, 85], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}>
          <div style={{
            fontFamily: "'SF Pro Display', sans-serif",
            fontSize: fs(13),
            color: '#4a5068',
            marginBottom: px(6),
          }}>Claude 的反应</div>
          <div style={{
            fontFamily: "'SF Pro Display', sans-serif",
            fontSize: fs(16),
            color: '#f87171',
            whiteSpace: 'pre-wrap',
            lineHeight: 1.4,
          }}>
            {BAD_REACTION}
          </div>
        </div>
      </div>

      {/* Center arrow */}
      <div style={{
        position: 'absolute',
        left: px(920),
        top: px(340),
        fontSize: fs(36),
        color: accentColor,
        opacity: interpolate(frame, [35, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
      }}>
        →
      </div>

      {/* Right — Good */}
      <div style={{
        position: 'absolute',
        right: px(120),
        top: px(180),
        width: px(760),
        opacity: rightProgress,
        transform: `translateX(${interpolate(rightProgress, [0, 1], [40, 0])}px)`,
      }}>
        <div style={{
          padding: `${px(12)}px ${px(20)}px`,
          borderRadius: `${px(12)}px ${px(12)}px 0 0`,
          background: 'rgba(74, 222, 128, 0.1)',
          borderBottom: '2px solid rgba(74, 222, 128, 0.3)',
          fontFamily: "'SF Pro Display', sans-serif",
          fontSize: fs(20),
          fontWeight: 600,
          color: '#4ade80',
        }}>
          ✅ 高效
        </div>
        <div style={{
          padding: px(24),
          borderRadius: `0 0 ${px(12)}px ${px(12)}px`,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(74, 222, 128, 0.15)',
          borderTop: 'none',
        }}>
          <div style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: fs(20),
            color: '#e2e8f0',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
          }}>
            {GOOD_PROMPT}
          </div>
        </div>

        {/* Good reaction — no Sequence to avoid absolute positioning overlay */}
        <div style={{
          marginTop: px(12),
          padding: `${px(10)}px ${px(14)}px`,
          borderRadius: px(10),
          background: 'rgba(74, 222, 128, 0.05)',
          border: '1px solid rgba(74, 222, 128, 0.1)',
          opacity: interpolate(frame, [90, 105], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}>
          <div style={{
            fontFamily: "'SF Pro Display', sans-serif",
            fontSize: fs(13),
            color: '#4a5068',
            marginBottom: px(6),
          }}>Claude 的反应</div>
          <div style={{
            fontFamily: "'SF Pro Display', sans-serif",
            fontSize: fs(16),
            color: '#4ade80',
            whiteSpace: 'pre-wrap',
            lineHeight: 1.4,
          }}>
            {GOOD_REACTION}
          </div>
        </div>
      </div>

      {/* Bottom verdict */}
      <div style={{
        position: 'absolute',
        bottom: px(80),
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        opacity: verdictProgress,
        transform: `translateY(${interpolate(verdictProgress, [0, 1], [20, 0])}px)`,
      }}>
        <div style={{
          padding: `${px(16)}px ${px(40)}px`,
          borderRadius: px(16),
          border: `1px solid ${accentColor}40`,
          background: `${accentColor}0a`,
          fontFamily: "'SF Pro Display', sans-serif",
          fontSize: fs(22),
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
