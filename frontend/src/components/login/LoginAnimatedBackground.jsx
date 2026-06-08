import { motion, useTransform } from "framer-motion";

const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: `${(i * 17 + 7) % 100}%`,
  top: `${(i * 23 + 11) % 100}%`,
  size: 2 + (i % 4),
  delay: (i % 8) * 0.6,
  duration: 14 + (i % 6) * 3,
}));

const NODES = [
  { cx: 120, cy: 80 },
  { cx: 280, cy: 60 },
  { cx: 420, cy: 100 },
  { cx: 200, cy: 180 },
  { cx: 360, cy: 200 },
  { cx: 500, cy: 160 },
  { cx: 80, cy: 220 },
  { cx: 440, cy: 280 },
];

const EDGES = [
  [0, 1], [1, 2], [0, 3], [3, 4], [4, 5], [2, 5], [3, 6], [4, 7], [1, 4], [2, 7],
];

export default function LoginAnimatedBackground({ mouseX, mouseY }) {
  const meshX = useTransform(mouseX, [0, 1], [-20, 20]);
  const meshY = useTransform(mouseY, [0, 1], [-15, 15]);
  const networkX = useTransform(mouseX, [0, 1], [-8, 8]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="login-mesh-base absolute inset-0" />

      <motion.div style={{ x: meshX, y: meshY }} className="absolute inset-0">
        <div className="login-mesh-blob login-mesh-blob-1" />
        <div className="login-mesh-blob login-mesh-blob-2" />
      </motion.div>

      <div className="login-light-rays absolute inset-0" />

      {PARTICLES.map((p) => (
        <span
          key={p.id}
          className="login-particle absolute rounded-full bg-[#2563EB]/40"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}

      <motion.svg
        style={{ x: networkX }}
        viewBox="0 0 600 320"
        className="login-network-graph absolute left-[5%] top-[18%] h-[45%] w-[55%] opacity-40 lg:opacity-50"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="loginNetLine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0" />
            <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
          </linearGradient>
        </defs>
        {EDGES.map(([a, b], i) => {
          const n1 = NODES[a];
          const n2 = NODES[b];
          return (
            <line
              key={i}
              x1={n1.cx}
              y1={n1.cy}
              x2={n2.cx}
              y2={n2.cy}
              stroke="url(#loginNetLine)"
              strokeWidth="1"
              className="login-data-line"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          );
        })}
        {NODES.map((n, i) => (
          <g key={i}>
            <circle cx={n.cx} cy={n.cy} r="8" fill="#2563EB" opacity="0.08" className="login-node-pulse" />
            <circle cx={n.cx} cy={n.cy} r="3" fill="#7C3AED" opacity="0.55" />
          </g>
        ))}
      </motion.svg>

      <div className="login-orbit login-orbit-1" />
      <div className="login-orbit login-orbit-2" />
    </div>
  );
}
