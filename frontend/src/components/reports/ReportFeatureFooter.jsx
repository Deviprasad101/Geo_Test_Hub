import { Lock, Rocket, Shield, ShieldCheck } from "lucide-react";

const FEATURES = [
  {
    icon: Shield,
    title: "Security",
    desc: "Enterprise grade security & compliance",
    iconClass: "bg-blue-100 text-blue-600",
  },
  {
    icon: Lock,
    title: "Data Integrity",
    desc: "Validated & verified datasets",
    iconClass: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: Rocket,
    title: "Performance",
    desc: "Optimized for accuracy & speed",
    iconClass: "bg-violet-100 text-violet-600",
  },
  {
    icon: ShieldCheck,
    title: "Reliability",
    desc: "Trusted by research teams & enterprises",
    iconClass: "bg-amber-100 text-amber-600",
  },
];

export default function ReportFeatureFooter() {
  return (
    <div className="grid gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4 lg:p-5">
      {FEATURES.map((item) => (
        <div key={item.title} className="flex items-start gap-3 px-2 py-1">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.iconClass}`}
          >
            <item.icon size={18} strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800">{item.title}</p>
            <p className="text-xs leading-relaxed text-slate-500">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
