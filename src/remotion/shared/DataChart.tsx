import React from "react";
import { z } from "zod";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

const DataItemSchema = z.object({
  label: z.string(),
  value: z.number(),
  color: z.string(),
});

export const ChartSchema = z.object({
  title: z.string().default(""),
  data: z.array(DataItemSchema).default([]),
});

type ChartProps = z.infer<typeof ChartSchema>;

const Bar: React.FC<{
  item: z.infer<typeof DataItemSchema>;
  index: number;
  maxValue: number;
  barWidth: number;
  chartHeight: number;
}> = ({ item, index, maxValue, barWidth, chartHeight }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Stagger each bar's entrance
  const delay = 30 + index * 10;

  const barProgress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const targetHeight = (item.value / maxValue) * chartHeight;
  const barHeight = interpolate(barProgress, [0, 1], [0, targetHeight]);

  // Animated counter
  const displayValue = Math.round(
    interpolate(barProgress, [0, 1], [0, item.value])
  );

  // Label fade in
  const labelOpacity = interpolate(barProgress, [0, 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: barWidth,
        gap: 12,
      }}
    >
      {/* Value label */}
      <span
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: "white",
          fontFamily: "SF Mono, monospace",
          opacity: labelOpacity,
          minHeight: 36,
        }}
      >
        ${displayValue.toLocaleString()}
      </span>

      {/* Bar container */}
      <div
        style={{
          width: barWidth * 0.6,
          height: chartHeight,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        {/* The bar itself */}
        <div
          style={{
            width: "100%",
            height: barHeight,
            backgroundColor: item.color,
            borderRadius: "8px 8px 0 0",
            boxShadow: `0 0 20px ${item.color}40`,
          }}
        />
      </div>

      {/* Category label */}
      <span
        style={{
          fontSize: 26,
          color: "rgba(255,255,255,0.7)",
          fontFamily: "SF Pro Display, Helvetica, Arial, sans-serif",
          opacity: labelOpacity,
          fontWeight: 500,
        }}
      >
        {item.label}
      </span>
    </div>
  );
};

export const DataChart: React.FC<ChartProps> = ({ title, data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const maxValue = data.length > 0 ? Math.max(...data.map((d) => d.value)) : 1;

  // Title animation
  const titleProgress = spring({
    frame: frame - 5,
    fps,
    config: { damping: 14, stiffness: 180 },
  });
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);
  const titleTranslateY = interpolate(titleProgress, [0, 1], [30, 0]);

  // Grid lines fade in
  const gridOpacity = interpolate(frame, [15, 35], [0, 0.15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Exit fade
  const exitOpacity = interpolate(frame, [155, 180], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const chartHeight = 500;
  const barWidth = 180;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0f0f23",
        justifyContent: "center",
        alignItems: "center",
        opacity: exitOpacity,
      }}
    >
      {/* Grid lines */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {[0.25, 0.5, 0.75, 1].map((ratio) => (
          <div
            key={ratio}
            style={{
              position: "absolute",
              width: data.length * barWidth + 100,
              height: 1,
              backgroundColor: "white",
              opacity: gridOpacity,
              top: `calc(50% + ${chartHeight / 2 + 30 - chartHeight * ratio}px)`,
            }}
          />
        ))}
      </AbsoluteFill>

      {/* Title */}
      <Sequence from={5}>
        <AbsoluteFill
          style={{
            justifyContent: "flex-start",
            alignItems: "center",
            paddingTop: 100,
          }}
        >
          <h1
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "white",
              fontFamily: "SF Pro Display, Helvetica, Arial, sans-serif",
              opacity: titleOpacity,
              transform: `translateY(${titleTranslateY}px)`,
              margin: 0,
            }}
          >
            {title}
          </h1>
        </AbsoluteFill>
      </Sequence>

      {/* Bars */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 80,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 40,
            alignItems: "flex-end",
          }}
        >
          {data.map((item, index) => (
            <Bar
              key={item.label}
              item={item}
              index={index}
              maxValue={maxValue}
              barWidth={barWidth}
              chartHeight={chartHeight}
            />
          ))}
        </div>
      </AbsoluteFill>

      {/* Watermark */}
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "flex-end",
          padding: 40,
        }}
      >
        <span
          style={{
            fontSize: 18,
            color: "rgba(255,255,255,0.2)",
            fontFamily: "SF Pro Display, Helvetica, Arial, sans-serif",
          }}
        >
          Powered by Remotion
        </span>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default DataChart
