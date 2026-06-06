import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const POINT_COUNT = 100;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function levelToY(level, chartHeight, padding = 4) {
  const inner = chartHeight - padding * 2;
  return chartHeight - padding - level * inner;
}

function waveSample(phase, level) {
  const rippleDepth = Math.max(0.05, level * 0.28);
  const oscillation =
    Math.sin(phase) * 0.52 +
    Math.sin(phase * 2.15 + 0.55) * 0.26 +
    Math.sin(phase * 0.58 + 1.15) * 0.14;

  const peak = level;
  const valley = level - rippleDepth;
  const t = (oscillation + 1) / 2;
  return clamp(valley + (peak - valley) * t, 0.02, 1);
}

function createInitialBuffer(level, phase = 0) {
  return Array.from({ length: POINT_COUNT }, (_, i) =>
    waveSample(phase + i * 0.34, level)
  );
}

function buildPaths(points, width, chartHeight) {
  const step = width / (points.length - 1);
  let line = `M 0 ${levelToY(points[0], chartHeight).toFixed(2)}`;

  for (let i = 1; i < points.length; i++) {
    const x0 = (i - 1) * step;
    const x1 = i * step;
    const y0 = levelToY(points[i - 1], chartHeight);
    const y1 = levelToY(points[i], chartHeight);
    const cx = ((x0 + x1) / 2).toFixed(2);
    const cy = ((y0 + y1) / 2).toFixed(2);
    line += ` Q ${x0.toFixed(2)} ${y0.toFixed(2)} ${cx} ${cy}`;
    if (i === points.length - 1) {
      line += ` T ${x1.toFixed(2)} ${y1.toFixed(2)}`;
    }
  }

  const area = `${line} L ${width} ${chartHeight} L 0 ${chartHeight} Z`;
  return { line, area };
}

function interpolateY(points, width, chartHeight, x) {
  const step = width / (points.length - 1);
  const index = x / step;
  const i = Math.floor(index);
  const t = index - i;

  if (i >= points.length - 1) return levelToY(points[points.length - 1], chartHeight);
  const y0 = levelToY(points[i], chartHeight);
  const y1 = levelToY(points[i + 1], chartHeight);
  return y0 + (y1 - y0) * t;
}

export default function AnimatedWaveChart({
  value = 50,
  color = "#3b82f6",
  glowColor = "rgba(59,130,246,0.4)",
  height = 36,
  speed = 1,
  className = "",
  pulsePosition = 0.72,
}) {
  const instanceId = useId().replace(/:/g, "");
  const reduceMotion = useReducedMotion();
  const containerRef = useRef(null);

  const normalizedTarget = clamp(Number(value) || 0, 0, 100) / 100;
  const levelRef = useRef(normalizedTarget);
  const targetRef = useRef(normalizedTarget);
  const phaseRef = useRef(0);
  const pointsRef = useRef(createInitialBuffer(normalizedTarget));

  const pathRef = useRef(null);
  const glowPathRef = useRef(null);
  const areaRef = useRef(null);
  const dotRef = useRef(null);
  const levelLineRef = useRef(null);
  const widthRef = useRef(120);
  const [svgWidth, setSvgWidth] = useState(120);
  const [displayLevel, setDisplayLevel] = useState(normalizedTarget);

  useEffect(() => {
    targetRef.current = normalizedTarget;
  }, [normalizedTarget]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const updateWidth = (nextWidth) => {
      const width = Math.max(60, Math.round(nextWidth));
      widthRef.current = width;
      setSvgWidth(width);
    };

    const observer = new ResizeObserver(([entry]) => {
      updateWidth(entry.contentRect.width);
    });
    observer.observe(container);
    updateWidth(container.getBoundingClientRect().width);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      levelRef.current = targetRef.current;
      pointsRef.current = createInitialBuffer(levelRef.current);
      setDisplayLevel(levelRef.current);

      const width = widthRef.current;
      const { line, area } = buildPaths(pointsRef.current, width, height);
      pathRef.current?.setAttribute("d", line);
      glowPathRef.current?.setAttribute("d", line);
      areaRef.current?.setAttribute("d", area);

      const levelY = levelToY(levelRef.current, height);
      levelLineRef.current?.setAttribute("y1", levelY.toFixed(2));
      levelLineRef.current?.setAttribute("y2", levelY.toFixed(2));
      levelLineRef.current?.setAttribute("x2", String(width));
      return undefined;
    }

    let rafId = 0;
    let lastTime = performance.now();
    let lastLevelUi = levelRef.current;

    const tick = (time) => {
      const delta = Math.min(32, time - lastTime);
      lastTime = time;

      const levelDelta = targetRef.current - levelRef.current;
      levelRef.current += levelDelta * Math.min(1, 0.09 * (delta / 16.67));

      const phaseStep = 0.13 * speed * (delta / 16.67);
      phaseRef.current += phaseStep;

      const points = pointsRef.current;
      const sample = waveSample(phaseRef.current, levelRef.current);
      points.shift();
      points.push(sample);

      const width = widthRef.current;
      const { line, area } = buildPaths(points, width, height);
      pathRef.current?.setAttribute("d", line);
      glowPathRef.current?.setAttribute("d", line);
      areaRef.current?.setAttribute("d", area);

      const levelY = levelToY(levelRef.current, height);
      levelLineRef.current?.setAttribute("y1", levelY.toFixed(2));
      levelLineRef.current?.setAttribute("y2", levelY.toFixed(2));
      levelLineRef.current?.setAttribute("x2", String(width));

      const dotX = width * pulsePosition;
      const dotY = interpolateY(points, width, height, dotX);
      dotRef.current?.setAttribute("cx", dotX.toFixed(2));
      dotRef.current?.setAttribute("cy", dotY.toFixed(2));

      if (Math.abs(levelRef.current - lastLevelUi) > 0.004) {
        lastLevelUi = levelRef.current;
        setDisplayLevel(levelRef.current);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [height, normalizedTarget, pulsePosition, reduceMotion, speed]);

  const strokeGradientId = `wave-stroke-${instanceId}`;
  const fillGradientId = `wave-fill-${instanceId}`;
  const glowFilterId = `wave-glow-${instanceId}`;
  const clipId = `wave-clip-${instanceId}`;
  const initial = buildPaths(pointsRef.current, svgWidth, height);
  const levelY = levelToY(displayLevel, height);
  const gridLines = [0.25, 0.5, 0.75];

  return (
    <div
      ref={containerRef}
      className={`animated-wave-chart w-full ${className}`}
      style={{ height }}
      aria-hidden="true"
    >
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${svgWidth} ${height}`}
        preserveAspectRatio="none"
        className="animated-wave-chart__svg"
      >
        <defs>
          <linearGradient id={strokeGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="40%" stopColor={color} stopOpacity="0.95" />
            <stop offset="100%" stopColor={color} stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id={fillGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.32" />
            <stop offset="55%" stopColor={color} stopOpacity="0.14" />
            <stop offset="100%" stopColor={color} stopOpacity="0.03" />
          </linearGradient>
          <filter id={glowFilterId} x="-25%" y="-60%" width="150%" height="220%">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id={clipId}>
            <rect x="0" y="0" width={svgWidth} height={height} />
          </clipPath>
        </defs>

        <rect
          x="0"
          y="0"
          width={svgWidth}
          height={height}
          rx="6"
          className="animated-wave-chart__bg"
        />

        {gridLines.map((mark) => (
          <line
            key={mark}
            x1="0"
            y1={levelToY(mark, height)}
            x2={svgWidth}
            y2={levelToY(mark, height)}
            className="animated-wave-chart__grid"
          />
        ))}

        <rect
          x="0"
          y="0"
          width={svgWidth}
          height={Math.max(0, levelY - 1)}
          className="animated-wave-chart__empty"
        />

        <line
          ref={levelLineRef}
          x1="0"
          y1={levelY}
          x2={svgWidth}
          y2={levelY}
          className="animated-wave-chart__level-line"
          stroke={color}
        />

        <path
          ref={glowPathRef}
          d={initial.line}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animated-wave-chart__glow"
          style={{ filter: `drop-shadow(0 0 4px ${glowColor})` }}
          opacity="0.4"
          clipPath={`url(#${clipId})`}
        />

        <path
          ref={areaRef}
          d={initial.area}
          fill={`url(#${fillGradientId})`}
          className="animated-wave-chart__fill"
          clipPath={`url(#${clipId})`}
        />

        <path
          ref={pathRef}
          d={initial.line}
          fill="none"
          stroke={`url(#${strokeGradientId})`}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${glowFilterId})`}
          className="animated-wave-chart__line"
          clipPath={`url(#${clipId})`}
        />

        <motion.circle
          ref={dotRef}
          r={2.5}
          fill={color}
          className="animated-wave-chart__pulse"
          style={{
            filter: `drop-shadow(0 0 5px ${glowColor}) drop-shadow(0 0 2px ${color})`,
          }}
          animate={
            reduceMotion
              ? undefined
              : {
                  opacity: [0.5, 1, 0.5],
                  r: [2, 3, 2],
                }
          }
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </svg>
    </div>
  );
}
