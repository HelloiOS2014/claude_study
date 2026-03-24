import { useVideoConfig } from 'remotion'

export function useScale() {
  const { width, height, fps } = useVideoConfig()
  const s = width / 1920

  return {
    width,
    height,
    fps,
    s,
    // 位置和尺寸：等比缩放
    px: (v: number) => Math.round(v * s),
    // 字体：缩放更慢（保持可读性）
    fs: (v: number) => Math.round(v * Math.max(s, 0.65)),
    // 居中
    centerX: (contentWidth: number) => (width - contentWidth) / 2,
    centerY: (contentHeight: number) => (height - contentHeight) / 2,
  }
}
