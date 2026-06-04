import { useEffect, useState } from "react";
import { useSpring } from "framer-motion";

export default function AnimatedCounter({ value, suffix = "", decimals = 0 }) {
  const spring = useSpring(0, { stiffness: 60, damping: 20 });
  const [text, setText] = useState("0");

  useEffect(() => {
    spring.set(value);
    const unsubscribe = spring.on("change", (v) => {
      setText(decimals > 0 ? v.toFixed(decimals) : String(Math.round(v)));
    });
    return () => unsubscribe();
  }, [spring, value, decimals]);

  return (
    <span className="tabular-nums font-semibold text-slate-800">
      {text}
      {suffix}
    </span>
  );
}
