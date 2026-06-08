import { useState } from "react";

export default function LoginFloatingInput({
  id,
  label,
  icon: Icon,
  type = "text",
  value,
  onChange,
  autoComplete,
  required,
  minLength,
  className = "",
  rightElement,
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`login-field ${className}`}>
      <div
        className={`login-field-inner relative rounded-2xl border bg-white/80 shadow-sm transition-all duration-300 ${
          focused
            ? "border-[#2563EB]/50 shadow-md shadow-[#2563EB]/10 ring-2 ring-[#2563EB]/15"
            : "border-slate-200/90 hover:border-slate-300 hover:shadow-md"
        }`}
      >
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder=" "
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          className={`login-float-input w-full bg-transparent text-sm text-slate-800 outline-none placeholder-transparent ${
            rightElement ? "pr-11" : ""
          }`}
        />

        <label htmlFor={id} className="login-float-label pointer-events-none absolute left-12 z-10 font-medium">
          {label}
        </label>

        <Icon className="login-float-icon pointer-events-none absolute left-4 z-10 h-[18px] w-[18px]" />

        {rightElement}
      </div>
    </div>
  );
}
