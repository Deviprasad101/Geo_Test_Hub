import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, Eye, EyeOff, Globe, Lock, Mail, User } from "lucide-react";
import { isAuthenticated, login, register } from "../lib/auth";
import LoginHeader from "../components/LoginHeader";
import LoginBackground from "../components/login/LoginBackground";
import LoginHero from "../components/login/LoginHero";
import LoginFeatureCards from "../components/login/LoginFeatureCards";
import LoginTrustBar from "../components/login/LoginTrustBar";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  if (isAuthenticated()) {
    return <Navigate to="/audit/new" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (isRegister) {
        await register({ email, password, fullName: fullName || email.split("@")[0] });
      } else {
        await login(email, password);
      }
      navigate("/audit/new");
    } catch (err) {
      setError(err.message || "Authentication failed. Check the backend is running on port 8000.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page relative flex flex-col bg-gradient-to-br from-[#f4f6fb] via-[#f0f2f7] to-[#eef2ff]">
      <LoginBackground />
      <LoginHeader />

      <main className="relative z-10 mx-auto flex min-h-0 w-full max-w-[1400px] flex-1 flex-col items-stretch gap-3 overflow-hidden px-4 py-3 sm:px-6 lg:flex-row lg:gap-8 lg:px-10 lg:py-4">
        <motion.section
          id="hero"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="flex min-h-0 min-w-0 flex-1 flex-col justify-center overflow-hidden lg:max-w-[55%]"
        >
          <LoginHero />
          <LoginFeatureCards />
        </motion.section>

        <motion.div
          id="login-form"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="relative flex min-h-0 w-full flex-1 shrink-0 items-center justify-center overflow-hidden lg:flex-none lg:max-w-[420px] xl:max-w-[440px]"
        >
          <div className="login-login-card relative z-10 w-full max-h-full overflow-hidden p-5 sm:p-6 lg:p-7">
            <div className="login-login-card-glow" aria-hidden />
            <div className="login-login-card-border" aria-hidden />

            <div className="relative">
              <div className="mb-4 flex flex-col items-center text-center lg:mb-5">
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB] via-[#7C3AED] to-[#06B6D4] shadow-lg shadow-[#2563EB]/30 lg:h-14 lg:w-14"
                >
                  <Globe size={24} className="text-white lg:h-7 lg:w-7" strokeWidth={1.75} />
                </motion.div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7C3AED] lg:text-xs">
                  {isRegister ? "Create Account" : "Welcome Back"}
                </p>
                <h2 className="mt-1 text-lg font-bold text-[#0F172A] lg:text-xl">
                  {isRegister ? "Register for GVIP" : "Sign in securely"}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Connect to the validation backend with your account.
                </p>
              </div>

              {error && (
                <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-3.5">
                {isRegister && (
                  <div>
                    <label htmlFor="login-name" className="mb-1 block text-xs font-medium text-slate-700">
                      Full name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="login-name"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your name"
                        className="login-input !py-3"
                        autoComplete="name"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="login-email" className="mb-1 block text-xs font-medium text-slate-700">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@organization.com"
                      className="login-input !py-3"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label htmlFor="login-password" className="text-xs font-medium text-slate-700">
                      Password
                    </label>
                    {!isRegister && (
                      <button type="button" className="text-[10px] font-medium text-[#2563EB] lg:text-xs">
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isRegister ? "At least 8 characters" : "Enter your password"}
                      className="login-input !py-3 pr-10"
                      autoComplete={isRegister ? "new-password" : "current-password"}
                      required
                      minLength={isRegister ? 8 : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {!isRegister && (
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-[#2563EB]"
                    />
                    <span className="text-xs text-slate-600">Remember me</span>
                  </label>
                )}

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={submitting}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] py-3 text-sm font-semibold text-white shadow-lg shadow-[#2563EB]/30 disabled:opacity-60"
                >
                  {submitting ? "Please wait…" : isRegister ? "Create Account" : "Sign In"}
                  <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
                </motion.button>

                <button
                  type="button"
                  onClick={() => {
                    setIsRegister((v) => !v);
                    setError(null);
                  }}
                  className="w-full text-center text-xs font-medium text-[#2563EB] hover:underline"
                >
                  {isRegister
                    ? "Already have an account? Sign in"
                    : "Need an account? Create one"}
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </main>

      <div id="benchmarks" className="sr-only" aria-hidden />
      <div id="datasets" className="sr-only" aria-hidden />
      <div id="reports" className="sr-only" aria-hidden />

      <LoginTrustBar />
    </div>
  );
}
