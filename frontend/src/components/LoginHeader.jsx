import { motion } from "framer-motion";
import HeaderLogos from "./HeaderLogos";
import GeoTestHubBrand from "./GeoTestHubBrand";

export default function LoginHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="login-navbar z-30 shrink-0 border-b border-slate-100 bg-white/90 shadow-sm backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-10 lg:py-3">
        <GeoTestHubBrand size="sm" showCard={false} className="shrink-0" />

        <HeaderLogos
          logoClassName="h-7 w-auto max-w-[4rem] object-contain sm:h-8 md:h-9 md:max-w-none"
        />
      </div>
    </motion.header>
  );
}
