import React from "react";
import { z } from "zod";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
const fontFamily = "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'SF Pro Display', sans-serif";

const SocialLinkSchema = z.object({
  platform: z.string(),
  handle: z.string(),
});

export const EndCardSchema = z.object({
  thankYouText: z.string().default("感谢观看"),
  socialLinks: z.array(SocialLinkSchema).default([]),
  accentColor: z.string().default("#D97757"),
});

type EndCardProps = z.infer<typeof EndCardSchema>;

export const EndCard: React.FC<EndCardProps> = ({
  thankYouText,
  socialLinks,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background fade in (0-20)
  const bgOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // "感谢观看" spring scale (10-40)
  const thankYouProgress = spring({
    frame: frame - 10,
    fps,
    config: { damping: 12, stiffness: 150 },
  });
  const thankYouScale = interpolate(thankYouProgress, [0, 1], [0.3, 1]);
  const thankYouOpacity = interpolate(thankYouProgress, [0, 1], [0, 1]);

  // Glow pulse
  const glowIntensity = interpolate(
    Math.sin(frame * 0.08),
    [-1, 1],
    [0.3, 0.8]
  );

  // Decorative line from center (30-50)
  const lineWidth = interpolate(frame, [30, 50], [0, 400], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Exit fade (155-180)
  const exitOpacity = interpolate(frame, [155, 180], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a1a",
        opacity: bgOpacity * exitOpacity,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Radial glow background */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accentColor}15 0%, transparent 70%)`,
          opacity: thankYouProgress,
        }}
      />

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 30,
          zIndex: 1,
        }}
      >
        {/* Thank you text */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: "#ffffff",
            fontFamily,
            opacity: thankYouOpacity,
            transform: `scale(${thankYouScale})`,
            textShadow: `0 0 40px rgba(255,255,255,${glowIntensity * 0.3}), 0 0 80px ${accentColor}${Math.round(glowIntensity * 40).toString(16).padStart(2, "0")}`,
          }}
        >
          {thankYouText}
        </div>

        {/* Decorative line */}
        <div
          style={{
            height: 3,
            width: lineWidth,
            background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
            borderRadius: 2,
          }}
        />

        {/* Social links */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            marginTop: 20,
          }}
        >
          {socialLinks.map((link, index) => {
            const STAGGER = 8;
            const linkDelay = 45 + index * STAGGER;
            const linkProgress = spring({
              frame: frame - linkDelay,
              fps,
              config: { damping: 14, stiffness: 180 },
            });
            const linkOpacity = interpolate(linkProgress, [0, 1], [0, 1]);
            const linkY = interpolate(linkProgress, [0, 1], [30, 0]);

            return (
              <div
                key={`${link.platform}-${index}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  opacity: linkOpacity,
                  transform: `translateY(${linkY}px)`,
                }}
              >
                <span
                  style={{
                    fontSize: 32,
                    fontWeight: 600,
                    color: accentColor,
                    fontFamily:
                      "'SF Pro Display', Helvetica, Arial, sans-serif",
                  }}
                >
                  {link.platform}
                </span>
                <span
                  style={{
                    fontSize: 32,
                    fontWeight: 400,
                    color: "rgba(255,255,255,0.8)",
                    fontFamily:
                      "'SF Pro Display', Helvetica, Arial, sans-serif",
                  }}
                >
                  {link.handle}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default EndCard
