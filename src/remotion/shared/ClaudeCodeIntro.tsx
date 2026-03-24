import React from "react";
import { z } from "zod";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
  spring,
} from "remotion";
import { useScale } from "./useScale";

export const ClaudeCodeIntroSchema = z.object({
  title: z.string().default("Claude Code"),
  subtitle: z.string().default("使用教程"),
  terminalCommand: z.string().default("claude"),
  accentColor: z.string().default("#D97757"),
});

type ClaudeCodeIntroProps = z.infer<typeof ClaudeCodeIntroSchema>;

// ─── Sub-components ──────────────────────────────────────────

const DotGridBackground: React.FC<{ frame: number }> = ({ frame }) => {
  const { px } = useScale();
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });
  const offsetX = frame * 0.15;
  const offsetY = frame * 0.1;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a1a",
        backgroundImage:
          "radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)",
        backgroundSize: `${px(40)}px ${px(40)}px`,
        backgroundPosition: `${offsetX}px ${offsetY}px`,
        opacity,
      }}
    />
  );
};

const ScanLine: React.FC<{ accentColor: string }> = ({
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { px } = useScale();
  const top = interpolate(frame, [0, 30], [-10, 110], {
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [0, 5, 25, 30], [0, 0.8, 0.8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: `${top}%`,
        left: 0,
        width: "100%",
        height: px(3),
        background: accentColor,
        boxShadow: `0 0 20px ${accentColor}, 0 0 60px ${accentColor}, 0 0 100px ${accentColor}`,
        opacity,
        zIndex: 10,
      }}
    />
  );
};

const TerminalTyping: React.FC<{
  command: string;
  accentColor: string;
}> = ({ command, accentColor }) => {
  const frame = useCurrentFrame();
  const { fs } = useScale();
  const CHAR_FRAMES = 3;
  const fullText = `$ ${command}`;

  // Prompt appears at frame 0 of this sequence (global frame 15)
  // Then characters type out
  const charCount = Math.min(
    fullText.length,
    Math.floor(frame / CHAR_FRAMES)
  );
  const typedText = fullText.slice(0, charCount);

  // Cursor blink
  const cursorOpacity = interpolate(
    frame % 16,
    [0, 8, 16],
    [1, 0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Fade out during glitch phase (this sequence runs from 15, glitch at ~85)
  const fadeOut = interpolate(frame, [55, 70], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeOut,
      }}
    >
      <div
        style={{
          fontFamily: "'SF Mono', 'Fira Code', 'Courier New', monospace",
          fontSize: fs(64),
          color: "#4ade80",
          textShadow: "0 0 10px rgba(74,222,128,0.5)",
        }}
      >
        <span>{typedText}</span>
        <span
          style={{
            opacity: cursorOpacity,
            color: accentColor,
            marginLeft: 2,
          }}
        >
          █
        </span>
      </div>
    </AbsoluteFill>
  );
};

const GlitchFlash: React.FC<{
  accentColor: string;
}> = ({ accentColor }) => {
  const frame = useCurrentFrame();
  // Multi-pulse flash pattern over 15 frames
  const flashOpacity = interpolate(
    frame,
    [0, 3, 6, 9, 12, 15],
    [0, 0.9, 0.1, 0.7, 0.2, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Alternate white and coral
  const isCoralFlash = frame % 6 >= 3;
  const flashColor = isCoralFlash ? accentColor : "#ffffff";

  // Horizontal shake (deterministic)
  const shakeX = Math.sin(frame * 37) * 3;
  const shakeY = Math.sin(frame * 23) * 2;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: flashColor,
        opacity: flashOpacity,
        transform: `translate(${shakeX}px, ${shakeY}px)`,
        zIndex: 20,
      }}
    />
  );
};

const TitleReveal: React.FC<{
  fps: number;
  title: string;
  subtitle: string;
  accentColor: string;
}> = ({ fps, title, subtitle, accentColor }) => {
  const frame = useCurrentFrame();
  const { px, fs } = useScale();
  const [titlePart1, titlePart2] = (() => {
    const parts = title.split(" ");
    if (parts.length >= 2) {
      return [parts.slice(0, -1).join(" "), parts[parts.length - 1]];
    }
    return [title, ""];
  })();

  // "Claude" spring animation
  const part1Progress = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 180 },
  });
  const part1Scale = interpolate(part1Progress, [0, 1], [0.3, 1]);
  const part1Y = interpolate(part1Progress, [0, 1], [60, 0]);
  const part1Opacity = interpolate(part1Progress, [0, 1], [0, 1]);

  // "Code" spring with 5 frame delay
  const part2Progress = spring({
    frame: frame - 5,
    fps,
    config: { damping: 12, stiffness: 180 },
  });
  const part2Scale = interpolate(part2Progress, [0, 1], [0.3, 1]);
  const part2Y = interpolate(part2Progress, [0, 1], [60, 0]);
  const part2Opacity = interpolate(part2Progress, [0, 1], [0, 1]);

  // Glow pulse
  const glowIntensity = interpolate(
    Math.sin(frame * 0.1),
    [-1, 1],
    [0.4, 0.8]
  );

  // Subtitle (appears at frame 35 relative to title sequence start at 95)
  const subtitleDelay = 35;
  const subtitleOpacity = interpolate(
    frame - subtitleDelay,
    [0, 20],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const subtitleY = interpolate(
    frame - subtitleDelay,
    [0, 20],
    [25, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Decorative underline
  const lineProgress = spring({
    frame: frame - 25,
    fps,
    config: { damping: 200, stiffness: 180 },
  });
  const lineWidth = interpolate(lineProgress, [0, 1], [0, px(500)]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Title */}
      <div
        style={{
          display: "flex",
          gap: px(30),
          marginBottom: px(30),
        }}
      >
        <span
          style={{
            fontFamily: "'SF Pro Display', Helvetica, Arial, sans-serif",
            fontSize: fs(130),
            fontWeight: 800,
            color: "#ffffff",
            opacity: part1Opacity,
            transform: `scale(${part1Scale}) translateY(${part1Y}px)`,
            textShadow: `0 0 40px rgba(255,255,255,${glowIntensity * 0.3}), 0 0 80px rgba(255,255,255,${glowIntensity * 0.15})`,
          }}
        >
          {titlePart1}
        </span>
        <span
          style={{
            fontFamily: "'SF Pro Display', Helvetica, Arial, sans-serif",
            fontSize: fs(130),
            fontWeight: 800,
            color: accentColor,
            opacity: part2Opacity,
            transform: `scale(${part2Scale}) translateY(${part2Y}px)`,
            textShadow: `0 0 40px rgba(217,119,87,${glowIntensity * 0.6}), 0 0 80px rgba(217,119,87,${glowIntensity * 0.3}), 0 0 120px rgba(217,119,87,${glowIntensity * 0.15})`,
          }}
        >
          {titlePart2}
        </span>
      </div>

      {/* Decorative underline */}
      <div
        style={{
          height: px(3),
          width: lineWidth,
          background: `linear-gradient(90deg, transparent, ${accentColor}, #E8845C, transparent)`,
          borderRadius: px(2),
          marginBottom: px(40),
        }}
      />

      {/* Subtitle */}
      <div
        style={{
          fontFamily: "'SF Pro Display', Helvetica, Arial, sans-serif",
          fontSize: fs(52),
          fontWeight: 300,
          color: "rgba(255,255,255,0.8)",
          letterSpacing: 8,
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
        }}
      >
        {subtitle}
      </div>
    </AbsoluteFill>
  );
};

// ─── Main Composition ────────────────────────────────────────

export const ClaudeCodeIntro: React.FC<ClaudeCodeIntroProps> = ({
  title,
  subtitle,
  terminalCommand,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useScale();

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a1a" }}>
      {/* Stage 1: Dot grid background (0-210) */}
      <DotGridBackground frame={frame} />

      {/* Stage 1: CRT scan line (0-30) */}
      <Sequence from={0} durationInFrames={30}>
        <ScanLine
          accentColor={accentColor}
        />
      </Sequence>

      {/* Stage 2: Terminal typing (15-90) */}
      <Sequence from={15} durationInFrames={75}>
        <TerminalTyping
          command={terminalCommand}
          accentColor={accentColor}
        />
      </Sequence>

      {/* Stage 3: Glitch flash transition (85-100) */}
      <Sequence from={85} durationInFrames={15}>
        <GlitchFlash
          accentColor={accentColor}
        />
      </Sequence>

      {/* Stage 4 & 5: Title + subtitle reveal (95-210) */}
      <Sequence from={95}>
        <TitleReveal
          fps={fps}
          title={title}
          subtitle={subtitle}
          accentColor={accentColor}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export default ClaudeCodeIntro
