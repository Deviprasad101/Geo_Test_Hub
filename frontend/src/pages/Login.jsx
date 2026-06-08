import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion, useMotionValue } from "framer-motion";
import { AlertCircle, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { isAuthenticated, login, register } from "../lib/auth";
import LoginHeader from "../components/LoginHeader";
import LoginAnimatedBackground from "../components/login/LoginAnimatedBackground";
import LoginNetworkVisual from "../components/login/LoginNetworkVisual";
import LoginFloatingInput from "../components/login/LoginFloatingInput";
import LoginHero from "../components/login/LoginHero";
import LoginFeatureCards from "../components/login/LoginFeatureCards";

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
  const [mouseGlow, setMouseGlow] = useState({ x: 50, y: 50 });

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

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

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
    setMouseGlow({ x: x * 100, y: y * 100 });
  };

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
    <div
      className="login-page relative flex flex-col"
      onMouseMove={handleMouseMove}
    >
      <LoginAnimatedBackground mouseX={mouseX} mouseY={mouseY} />
      <LoginNetworkVisual />

      <motion.div
        className="login-mouse-glow pointer-events-none absolute inset-0 z-[1]"
        style={{
          background: `radial-gradient(600px circle at ${mouseGlow.x}% ${mouseGlow.y}%, rgba(37,99,235,0.07), transparent 45%)`,
        }}
        aria-hidden
      />

      <LoginHeader />

      <main className="relative z-10 mx-auto grid min-h-0 w-full max-w-[1440px] flex-1 grid-cols-1 items-center gap-8 overflow-hidden px-4 py-6 sm:px-8 lg:grid-cols-2 lg:gap-12 lg:px-12 lg:py-8">
        <motion.section
          id="hero"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex min-h-0 min-w-0 flex-col justify-center"
        >
          <LoginHero />
          <LoginFeatureCards />
        </motion.section>

        <motion.div
          id="login-form"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex items-center justify-center"
        >
          <div className="login-card-ambient pointer-events-none absolute inset-0 rounded-[32px] blur-3xl" aria-hidden />

          <div className="login-login-card relative z-10 w-full max-w-[440px] p-7 sm:p-8">
            <div className="login-login-card-glow" aria-hidden />
            <div className="login-login-card-shine pointer-events-none absolute inset-0 rounded-[32px]" aria-hidden />

            <div className="relative">
              <div className="mb-7 text-center">
                <h2 className="login-gradient-text text-[1.65rem] font-bold sm:text-[1.85rem]">
                  {isRegister ? "Create Account" : "Welcome back"}
                </h2>
                <p className="mt-2 text-base font-semibold text-[#0F172A]">
                  {isRegister ? "Register for GVIP" : "Sign in securely"}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Connect to the validation backend with your account.
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50/90 px-3.5 py-3 text-xs text-red-700 backdrop-blur-sm"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegister && (
                  <LoginFloatingInput
                    id="login-name"
                    label="Full name"
                    icon={User}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                  />
                )}

                <LoginFloatingInput
                  id="login-email"
                  label="Email"
                  icon={Mail}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dev@example.com"
                  autoComplete="email"
                  required
                />

                <div>
                  <div className="mb-1.5 flex items-center justify-end">
                    {!isRegister && (
                      <button type="button" className="text-xs font-medium text-[#2563EB] hover:underline">
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <LoginFloatingInput
                    id="login-password"
                    label="Password"
                    icon={Lock}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isRegister ? "Min. 8 characters" : "Enter password"}
                    autoComplete={isRegister ? "new-password" : "current-password"}
                    required
                    minLength={isRegister ? 8 : undefined}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-4 top-1/2 z-10 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    }
                  />
                </div>

                {!isRegister && (
                  <label className="flex cursor-pointer items-center gap-2.5 px-1">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-[#2563EB]"
                    />
                    <span className="text-sm text-slate-600">Remember me</span>
                  </label>
                )}

                <motion.button
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submitting}
                  className="login-btn-premium relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#2563EB]/30 disabled:opacity-60"
                >
                  <span className="relative z-10">
                    {submitting ? "Please wait…" : isRegister ? "Create Account" : "Sign In"}
                  </span>
                </motion.button>

                <p className="pt-1 text-center text-sm text-slate-500">
                  {isRegister ? (
                    <>
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setIsRegister(false);
                          setError(null);
                        }}
                        className="font-semibold text-[#2563EB] hover:underline"
                      >
                        Sign in
                      </button>
                    </>
                  ) : (
                    <>
                      Need an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setIsRegister(true);
                          setError(null);
                        }}
                        className="font-semibold text-[#2563EB] hover:underline"
                      >
                        Create one
                      </button>
                    </>
                  )}
                </p>
              </form>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
