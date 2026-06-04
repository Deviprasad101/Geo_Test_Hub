/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        secondary: "#0EA5E9",
        surface: "#F8FAFC",
        accent: "#7C3AED",
      },
      backgroundImage: {
        "audit-gradient": "linear-gradient(135deg, #6366f1 0%, #8b5cf6 45%, #a855f7 100%)",
        "page-glow":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.12), transparent)",
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.06)",
        "card-hover": "0 4px 12px rgba(37, 99, 235, 0.12), 0 12px 32px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};
