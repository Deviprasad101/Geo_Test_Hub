import { motion } from "framer-motion";

const ORBIT_NODES = [
  { angle: 0, r: 95, color: "#2563EB", delay: 0 },
  { angle: 72, r: 95, color: "#7C3AED", delay: 0.4 },
  { angle: 144, r: 95, color: "#06B6D4", delay: 0.8 },
  { angle: 216, r: 95, color: "#10B981", delay: 1.2 },
  { angle: 288, r: 95, color: "#8B5CF6", delay: 1.6 },
];

function polarToXY(angleDeg, radius, cx, cy) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

export default function LoginNetworkVisual() {
  const cx = 100;
  const cy = 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.15 }}
      className="login-network-visual pointer-events-none absolute left-1/2 top-[42%] z-[1] hidden -translate-x-1/2 -translate-y-1/2 lg:block"
      aria-hidden
    >
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 2, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="relative h-[300px] w-[300px] xl:h-[360px] xl:w-[360px]"
      >
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-[#2563EB]/12 via-[#7C3AED]/8 to-[#06B6D4]/10 blur-2xl" />

        <svg viewBox="0 0 200 200" className="relative h-full w-full">
          <defs>
            <radialGradient id="loginCoreGlow">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle cx={cx} cy={cy} r="70" fill="url(#loginCoreGlow)" />
          <circle cx={cx} cy={cy} r="62" fill="none" stroke="#2563EB" strokeWidth="0.6" opacity="0.25" className="login-visual-spin-slow" />
          <circle cx={cx} cy={cy} r="48" fill="none" stroke="#7C3AED" strokeWidth="0.5" opacity="0.3" className="login-visual-spin-reverse" />

          {ORBIT_NODES.map((node, i) => {
            const pos = polarToXY(node.angle, node.r * 0.55, cx, cy);
            return (
              <g key={i}>
                <line
                  x1={cx}
                  y1={cy}
                  x2={pos.x}
                  y2={pos.y}
                  stroke={node.color}
                  strokeWidth="0.6"
                  opacity="0.25"
                  className="login-connection-pulse"
                  style={{ animationDelay: `${node.delay}s` }}
                />
                <circle cx={pos.x} cy={pos.y} r="4" fill={node.color} opacity="0.7" className="login-node-glow" />
              </g>
            );
          })}

          <ellipse cx={cx} cy={cy} rx="62" ry="22" fill="none" stroke="#06B6D4" strokeWidth="0.7" opacity="0.35" />
          <ellipse cx={cx} cy={cy} rx="22" ry="62" fill="none" stroke="#2563EB" strokeWidth="0.7" opacity="0.3" />
          <path d="M38 100 Q100 48 162 100" fill="none" stroke="#7C3AED" strokeWidth="0.8" opacity="0.4" />
          <circle cx={cx} cy={cy} r="5" fill="#2563EB" opacity="0.8" />
        </svg>
      </motion.div>
    </motion.div>
  );
}
