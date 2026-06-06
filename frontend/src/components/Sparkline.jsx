import { useId } from "react";
import { motion } from "framer-motion";

function buildPolylinePoints(points, width, height, offsetX = 0) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = width / (points.length - 1 || 1);

  return points
    .map((v, i) => {
      const x = offsetX + i * step;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
}

function StaticSparkline({ points, color, width, height }) {
  const coords = buildPolylinePoints(points, width, height);

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={coords}
      />
    </svg>
  );
}

function AnimatedSparkline({ points, color, width, height, duration = 2.8 }) {
  const gradientId = useId().replace(/:/g, "");
  const coordsA = buildPolylinePoints(points, width, height, 0);
  const coordsB = buildPolylinePoints(points, width, height, width);
  const stroke = `url(#${gradientId})`;

  return (
    <svg width={width} height={height} className="overflow-hidden">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="50%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <motion.g
        animate={{ x: [0, -width] }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <polyline
          fill="none"
          stroke={stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={coordsA}
          className="sparkline-wave-line"
        />
        <polyline
          fill="none"
          stroke={stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={coordsB}
          className="sparkline-wave-line"
        />
      </motion.g>
    </svg>
  );
}

export default function Sparkline({
  points,
  color = "#3b82f6",
  width = 120,
  height = 32,
  animated = false,
  duration,
}) {
  if (!points?.length) return null;

  if (animated) {
    return (
      <AnimatedSparkline
        points={points}
        color={color}
        width={width}
        height={height}
        duration={duration}
      />
    );
  }

  return (
    <StaticSparkline points={points} color={color} width={width} height={height} />
  );
}
