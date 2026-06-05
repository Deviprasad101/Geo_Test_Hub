import { motion } from "framer-motion";
import { FlaskConical, Lock, ShieldCheck, Zap } from "lucide-react";

const STATS = [
  {
    icon: ShieldCheck,
    title: "Enterprise Security",
    stat: "Built for reliability",
    gradient: "from-[#2563EB] to-[#06B6D4]",
  },
  {
    icon: Lock,
    title: "Encrypted Workspace",
    stat: "Your data is protected",
    gradient: "from-[#7C3AED] to-[#2563EB]",
  },
  {
    icon: Zap,
    title: "Sandbox Testing",
    stat: "Safe validation",
    gradient: "from-[#F59E0B] to-[#EF4444]",
  },
  {
    icon: FlaskConical,
    title: "Research Focused",
    stat: "Innovation driven",
    gradient: "from-[#10B981] to-[#06B6D4]",
  },
];

export default function LoginTrustBar() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.35 }}
      className="relative z-10 shrink-0 px-4 py-3 sm:px-6 lg:px-10 lg:py-4"
    >
      <div className="login-trust-bar mx-auto flex max-w-[1400px] flex-col divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white shadow-sm sm:flex-row sm:divide-x sm:divide-y-0">
        {STATS.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 + i * 0.05 }}
            className="flex flex-1 items-center gap-3 px-4 py-3 lg:gap-3.5 lg:px-5 lg:py-3.5"
          >
            <div
              className={`inline-flex shrink-0 rounded-lg bg-gradient-to-br ${item.gradient} p-2 text-white`}
            >
              <item.icon size={15} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-[#0F172A]">{item.title}</p>
              <p className="truncate text-[10px] font-medium text-slate-500 lg:text-[11px]">
                {item.stat}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.footer>
  );
}
