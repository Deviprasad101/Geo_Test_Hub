function BrandTitle({ size = "md" }) {
  const textClass =
    size === "lg"
      ? "text-3xl sm:text-4xl"
      : size === "sm"
        ? "text-lg sm:text-xl"
        : "text-xl sm:text-2xl";

  const underlineW = size === "lg" ? "w-14" : "w-10";

  return (
    <div className="pb-1 leading-none">
      <h1
        className={`geo-brand-title font-bold tracking-tight ${textClass}`}
      >
        <span className="relative inline-block text-slate-900">
          Geo
          <span
            className={`absolute -bottom-1.5 left-0 flex items-center gap-0.5 ${size === "lg" ? "-bottom-2" : ""}`}
            aria-hidden
          >
            <span
              className={`h-0.5 ${underlineW} rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-violet-500`}
            />
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
          </span>
        </span>
        <span className="font-extrabold text-sky-500"> Test</span>
        <span className="text-slate-900"> Hub</span>
      </h1>
    </div>
  );
}

export default function GeoTestHubBrand({
  size = "md",
  className = "",
  showCard = true,
}) {
  const pad = size === "lg" ? "px-5 py-3.5 sm:px-6" : "px-3.5 py-2 sm:px-4";

  const inner = (
    <div className={pad}>
      <BrandTitle size={size} />
    </div>
  );

  if (!showCard) {
    return <div className={className}>{inner}</div>;
  }

  return (
    <div
      className={`rounded-2xl border border-slate-100/90 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.08)] ${className}`}
    >
      {inner}
    </div>
  );
}
