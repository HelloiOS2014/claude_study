import React from "react";
import { z } from "zod";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
} from "remotion";

export const ProductCardSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  backgroundColor: z.string().default("#1a1a2e"),
  logoUrl: z.string().optional(),
});

type ProductCardProps = z.infer<typeof ProductCardSchema>;

export const ProductCard: React.FC<ProductCardProps> = ({
  title,
  subtitle,
  backgroundColor,
  logoUrl,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background gradient transition
  const bgOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Title slide up + fade in
  const titleProgress = spring({
    frame: frame - 10,
    fps,
    config: { damping: 14, stiffness: 180 },
  });
  const titleTranslateY = interpolate(titleProgress, [0, 1], [80, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  // Subtitle delayed entrance
  const subtitleProgress = spring({
    frame: frame - 30,
    fps,
    config: { damping: 14, stiffness: 180 },
  });
  const subtitleTranslateY = interpolate(subtitleProgress, [0, 1], [60, 0]);
  const subtitleOpacity = interpolate(subtitleProgress, [0, 1], [0, 1]);

  // Logo animation
  const logoProgress = spring({
    frame: frame - 5,
    fps,
    config: { damping: 10, stiffness: 120 },
  });
  const logoScale = interpolate(logoProgress, [0, 1], [0.3, 1]);
  const logoOpacity = interpolate(logoProgress, [0, 1], [0, 1]);

  // Decorative line
  const lineWidth = interpolate(frame, [50, 80], [0, 400], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Exit fade
  const exitOpacity = interpolate(frame, [100, 120], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        opacity: exitOpacity,
      }}
    >
      {/* Background with gradient */}
      <AbsoluteFill
        style={{
          backgroundColor,
          opacity: bgOpacity,
        }}
      />

      {/* Gradient overlay */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.4) 100%)`,
        }}
      />

      {/* Content */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: 80,
        }}
      >
        {/* Logo */}
        {logoUrl && (
          <Sequence from={5}>
            <div
              style={{
                position: "absolute",
                top: 300,
                opacity: logoOpacity,
                transform: `scale(${logoScale})`,
              }}
            >
              <Img
                src={logoUrl}
                style={{
                  width: 200,
                  height: 200,
                  objectFit: "contain",
                }}
              />
            </div>
          </Sequence>
        )}

        {/* Decorative circle */}
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.1)",
            top: logoUrl ? 200 : 400,
            transform: `scale(${logoScale})`,
            opacity: logoOpacity * 0.5,
          }}
        />

        {/* Title */}
        <Sequence from={10}>
          <AbsoluteFill
            style={{
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <h1
              style={{
                fontSize: 90,
                fontWeight: 800,
                color: "white",
                fontFamily: "SF Pro Display, Helvetica, Arial, sans-serif",
                opacity: titleOpacity,
                transform: `translateY(${titleTranslateY}px)`,
                textAlign: "center",
                margin: 0,
                lineHeight: 1.1,
                textShadow: "0 4px 20px rgba(0,0,0,0.3)",
              }}
            >
              {title}
            </h1>
          </AbsoluteFill>
        </Sequence>

        {/* Divider line */}
        <Sequence from={50}>
          <AbsoluteFill
            style={{
              justifyContent: "center",
              alignItems: "center",
              paddingTop: 180,
            }}
          >
            <div
              style={{
                height: 3,
                width: lineWidth,
                backgroundColor: "rgba(255,255,255,0.6)",
                borderRadius: 2,
              }}
            />
          </AbsoluteFill>
        </Sequence>

        {/* Subtitle */}
        <Sequence from={30}>
          <AbsoluteFill
            style={{
              justifyContent: "center",
              alignItems: "center",
              paddingTop: 280,
            }}
          >
            <p
              style={{
                fontSize: 48,
                color: "rgba(255,255,255,0.85)",
                fontFamily: "SF Pro Display, Helvetica, Arial, sans-serif",
                opacity: subtitleOpacity,
                transform: `translateY(${subtitleTranslateY}px)`,
                textAlign: "center",
                margin: 0,
                fontWeight: 300,
                letterSpacing: 2,
              }}
            >
              {subtitle}
            </p>
          </AbsoluteFill>
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
