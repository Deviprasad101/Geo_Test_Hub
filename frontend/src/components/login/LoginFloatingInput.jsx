import { useState } from "react";

export default function LoginFloatingInput({
  id,
  label,
  icon: Icon,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  minLength,
  className = "",
  rightElement,
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || Boolean(value);

  return (
    <div className={`login-field group relative ${className}`}>
      <div
        className={`login-field-inner relative rounded-2xl border bg-white/80 shadow-sm transition-all duration-300 ${
          focused
            ? "border-[#2563EB]/50 shadow-md shadow-[#2563EB]/10 ring-2 ring-[#2563EB]/15"
            : "border-slate-200/90 hover:border-slate-300 hover:shadow-md"
        }`}
      >
        <Icon
          className={`pointer-events-none absolute left-4 z-10 h-[18px] w-[18px] transition-colors duration-300 ${
            focused ? "text-[#2563EB]" : "text-slate-400"
          } ${active ? "top-4" : "top-1/2 -translate-y-1/2"}`}
        />
        <label
          htmlFor={id}
          className={`pointer-events-none absolute left-12 z-10 font-medium transition-all duration-300 ${
            active
              ? "top-2.5 text-[10px] uppercase tracking-wider text-[#2563EB]"
              : "top-1/2 -translate-y-1/2 text-sm text-slate-400"
          }`}
        >
          {label}
        </label>
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={active ? placeholder : ""}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          className={`w-full bg-transparent text-sm text-slate-800 outline-none transition-all ${
            active ? "pb-3 pl-12 pr-4 pt-8" : "px-12 py-3.5"
          } ${rightElement ? "pr-11" : ""}`}
        />
        {rightElement}
      </div>
    </div>
  );
}
