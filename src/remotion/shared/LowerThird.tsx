import React from "react";
import { z } from "zod";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

export const LowerThirdSchema = z.object({
  name: z.string(),
  title: z.string(),
  accentColor: z.string().default("#D97757"),
  position: z.enum(["left", "right"]).default("left"),
});

type LowerThirdProps = z.infer<typeof LowerThirdSchema>;

export const LowerThird: React.FC<LowerThirdProps> = ({
  name,
  title,
  accentColor,
  position,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isRight = position === "right";
  const dir = isRight ? -1 : 1;

  // Accent bar slide in (5-15)
  const barProgress = spring({
    frame: frame - 5,
    fps,
    config: { damping: 14, stiffness: 200 },
  });
  const barX = interpolate(barProgress, [0, 1], [-80 * dir, 0]);
  const barOpacity = interpolate(barProgress, [0, 1], [0, 1]);

  // Name text spring slide in (10-25)
  const nameProgress = spring({
    frame: frame - 10,
    fps,
    config: { damping: 14, stiffness: 180 },
  });
  const nameX = interpolate(nameProgress, [0, 1], [-120 * dir, 0]);
  const nameOpacity = interpolate(nameProgress, [0, 1], [0, 1]);

  // Title text delayed slide in (18-35)
  const titleProgress = spring({
    frame: frame - 18,
    fps,
    config: { damping: 14, stiffness: 180 },
  });
  const titleX = interpolate(titleProgress, [0, 1], [-100 * dir, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  // Background panel fade in (18-35)
  const panelOpacity = interpolate(frame, [18, 35], [0, 0.85], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Exit slide out (110-130)
  const exitProgress = interpolate(frame, [110, 130], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitX = interpolate(exitProgress, [0, 1], [0, -400 * dir]);
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      <div
        style={{
          position: "absolute",
          bottom: 120,
          [isRight ? "right" : "left"]: 80,
          display: "flex",
          flexDirection: isRight ? "row-reverse" : "row",
          alignItems: "stretch",
          gap: 0,
          transform: `translateX(${exitX}px)`,
          opacity: exitOpacity,
        }}
      >
        {/* Accent vertical bar */}
        <div
          style={{
            width: 6,
            backgroundColor: accentColor,
            borderRadius: 3,
            opacity: barOpacity,
            transform: `translateX(${barX}px)`,
            boxShadow: `0 0 12px ${accentColor}80`,
          }}
        />

        {/* Text content with background panel */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            padding: "16px 28px",
            position: "relative",
          }}
        >
          {/* Semi-transparent background panel */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(10, 10, 26, 0.85)",
              borderRadius: isRight ? "8px 0 0 8px" : "0 8px 8px 0",
              opacity: panelOpacity,
              backdropFilter: "blur(8px)",
            }}
          />

          {/* Name */}
          <div
            style={{
              fontSize: 42,
              fontWeight: 700,
              color: "#ffffff",
              opacity: nameOpacity,
              transform: `translateX(${nameX}px)`,
              fontFamily: "'SF Pro Display', Helvetica, Arial, sans-serif",
              position: "relative",
              zIndex: 1,
              textAlign: isRight ? "right" : "left",
            }}
          >
            {name}
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 28,
              fontWeight: 400,
              color: "rgba(255,255,255,0.75)",
              opacity: titleOpacity,
              transform: `translateX(${titleX}px)`,
              fontFamily: "'SF Pro Display', Helvetica, Arial, sans-serif",
              position: "relative",
              zIndex: 1,
              textAlign: isRight ? "right" : "left",
            }}
          >
            {title}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default LowerThird
