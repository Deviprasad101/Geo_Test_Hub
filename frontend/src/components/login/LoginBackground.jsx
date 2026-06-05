export default function LoginBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at top right, rgba(99,102,241,0.15), transparent 40%),
            radial-gradient(circle at bottom left, rgba(59,130,246,0.15), transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(6,182,212,0.06), transparent 55%)
          `,
        }}
      />
      <div className="login-dots-bg absolute inset-0 opacity-70" />
      <div className="login-dots-bg-layer absolute inset-0 opacity-45" />

      <div className="absolute -left-24 top-16 h-80 w-80 rounded-full bg-[#2563EB]/20 blur-[100px]" />
      <div className="absolute -right-20 bottom-20 h-96 w-96 rounded-full bg-[#7C3AED]/15 blur-[110px]" />
      <div className="absolute left-1/3 top-1/2 h-64 w-64 rounded-full bg-[#06B6D4]/10 blur-[90px]" />
    </div>
  );
}
