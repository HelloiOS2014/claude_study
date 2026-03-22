import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

export const HelloWorld: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  // Title animation: fade in + slide up
  const titleOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleTranslateY = interpolate(frame, [0, 30], [50, 0], {
    extrapolateRight: "clamp",
  });

  // Subtitle animation: spring entrance with delay
  const subtitleProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 12, stiffness: 200 },
  });
  const subtitleScale = interpolate(subtitleProgress, [0, 1], [0.5, 1]);
  const subtitleOpacity = interpolate(subtitleProgress, [0, 1], [0, 1]);

  // Logo/circle animation: spring bounce
  const circleProgress = spring({
    frame: frame - 40,
    fps,
    config: { damping: 8, stiffness: 100 },
  });
  const circleScale = interpolate(circleProgress, [0, 1], [0, 1]);

  // Moving gradient bar
  const barWidth = interpolate(frame, [60, 100], [0, width * 0.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Exit animation: fade out everything
  const exitOpacity = interpolate(frame, [120, 150], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0f0f23",
        justifyContent: "center",
        alignItems: "center",
        opacity: exitOpacity,
      }}
    >
      {/* Decorative circle */}
      <Sequence from={40}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 200,
              height: 200,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              transform: `scale(${circleScale})`,
              position: "absolute",
              top: 200,
              opacity: 0.3,
            }}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Title */}
      <Sequence from={0}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h1
            style={{
              fontSize: 100,
              fontWeight: "bold",
              color: "white",
              fontFamily: "SF Pro Display, Helvetica, Arial, sans-serif",
              opacity: titleOpacity,
              transform: `translateY(${titleTranslateY}px)`,
              textAlign: "center",
              margin: 0,
            }}
          >
            Hello, Remotion!
          </h1>
        </AbsoluteFill>
      </Sequence>

      {/* Subtitle */}
      <Sequence from={20}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 150,
          }}
        >
          <p
            style={{
              fontSize: 40,
              color: "#a0a0cc",
              fontFamily: "SF Pro Display, Helvetica, Arial, sans-serif",
              opacity: subtitleOpacity,
              transform: `scale(${subtitleScale})`,
              margin: 0,
            }}
          >
            Programmatic Video Creation with React
          </p>
        </AbsoluteFill>
      </Sequence>

      {/* Animated bar */}
      <Sequence from={60}>
        <AbsoluteFill
          style={{
            justifyContent: "flex-end",
            alignItems: "center",
            paddingBottom: 200,
          }}
        >
          <div
            style={{
              height: 6,
              width: barWidth,
              borderRadius: 3,
              background:
                "linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
            }}
          />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
