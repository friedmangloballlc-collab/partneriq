import React, { useState, useRef } from "react";
import SEO from "@/components/SEO";
import { supabase } from "@/api/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Building2, ArrowRight, Eye, EyeOff, Wand2, UserCheck } from "lucide-react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// ─── Password strength helper ─────────────────────────────────────────────────
const getPasswordStrength = (pw) => {
  if (!pw) return { level: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { level: 1, label: "Weak", color: "#ef4444" };
  if (score <= 2) return { level: 2, label: "Fair", color: "#f59e0b" };
  if (score <= 3) return { level: 3, label: "Good", color: "#d4b04e" };
  return { level: 4, label: "Strong", color: "#22c55e" };
};

// ─── Zod schemas ────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  fullName: z.string().min(1, "Full name is required").min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
});

// ─── Inline field error component ───────────────────────────────────────────

function FieldError({ message, id }) {
  if (!message) return null;
  return <p id={id} role="alert" className="mt-1 text-xs text-red-400">{message}</p>;
}

export default function Login() {
  const [mode, setMode] = useState("login"); // login | signup | magiclink | forgot
  const [role, setRole] = useState("brand");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(null);
  const [captchaToken, setCaptchaToken] = useState(null);
  const captchaRef = useRef(null);
  const navigate = useNavigate();


  // ── Magic link still uses plain local state (not validated via RHF) ──────
  const [magicEmail, setMagicEmail] = useState("");

  // ── react-hook-form instances ────────────────────────────────────────────
  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  // ── Derive the active form so we can read its errors cleanly ─────────────
  const activeForm = mode === "login" ? loginForm : signupForm;
  const { errors } = activeForm.formState;

  // ── Watch password for strength meter ────────────────────────────────────
  const watchedPassword = signupForm.watch("password");

  // ── Auth handlers ────────────────────────────────────────────────────────

  const handleSocialLogin = async (provider) => {
    setLoading(true);
    setServerError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setServerError(error.message);
      setLoading(false);
    }
  };

  const handleMagicLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    setServerError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email: magicEmail, options: { captchaToken: captchaToken || undefined } });
      if (error) {
        setServerError(error.message || "Failed to send magic link.");
      } else {
        setMessage("Check your email for a magic link to sign in.");
      }
    } catch { setServerError("Network error. Please try again."); }
    setLoading(false);
  };

  const [forgotEmail, setForgotEmail] = useState("");

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setServerError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, { captchaToken: captchaToken || undefined });
      if (error) {
        setServerError(error.message || "Failed to send reset link.");
      } else {
        setMessage("Password reset link sent! Check your email.");
      }
    } catch { setServerError("Network error. Please try again."); }
    setLoading(false);
  };

  const handleLogin = loginForm.handleSubmit(async ({ email, password }) => {
    // Client-side rate limiting: lock after 5 failed attempts for 60 seconds
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const secs = Math.ceil((lockoutUntil - Date.now()) / 1000);
      setServerError(`Too many failed attempts. Try again in ${secs} seconds.`);
      return;
    }

    setLoading(true);
    setServerError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password, options: { captchaToken: captchaToken || undefined } });

      if (error) {
        const attempts = failedAttempts + 1;
        setFailedAttempts(attempts);
        if (attempts >= 5) {
          setLockoutUntil(Date.now() + 60000);
          setServerError("Too many failed attempts. Please wait 60 seconds.");
          setFailedAttempts(0);
        } else {
          setServerError(error.message || "Invalid email or password.");
        }
        setLoading(false);
        setTimeout(() => setServerError(null), 5000);
        return;
      }

      setFailedAttempts(0);
      setLockoutUntil(null);
    } catch (err) {
      setServerError("Network error. Please check your connection and try again.");
      setLoading(false);
      setCaptchaToken(null);
      captchaRef.current?.resetCaptcha();
      setTimeout(() => setServerError(null), 5000);
      return;
    }

    navigate("/Dashboard");
  });

  const handleSignup = signupForm.handleSubmit(async ({ fullName, email, password }) => {
    setLoading(true);
    setServerError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role }, captchaToken: captchaToken || undefined },
      });

      if (error) {
        setServerError(error.message || "Unable to create account.");
        setLoading(false);
        setTimeout(() => setServerError(null), 4000);
        return;
      }

      // Create profile
      if (data?.user?.id) {
        try {
          await supabase.from("profiles").insert({
            id: data.user.id,
            email,
            full_name: fullName,
            role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }).then(() => {}).catch(() => {});
        } catch {}
      }
    } catch {
      setServerError("Network error. Please try again.");
      setLoading(false);
      setTimeout(() => setServerError(null), 4000);
      return;
    }

    setMessage("Check your email for a confirmation link, then sign in.");
    setMode("login");
    setLoading(false);
  });

  const switchMode = (newMode) => {
    loginForm.reset();
    signupForm.reset();
    setServerError(null);
    setMessage(null);
    setMode(newMode);
  };

  const roles = [
    { value: "brand", label: "Brand", icon: Building2, desc: "I represent a brand or company" },
    { value: "talent", label: "Talent", icon: User, desc: "I am talent" },
    { value: "manager", label: "Manager", icon: UserCheck, desc: "I manage a talent's career and deals" },
    { value: "agency", label: "Agency", icon: Building2, desc: "I manage talent or brands" },
  ];

  return (
    <div className="login-outer min-h-screen flex items-center justify-center p-4" style={{ background: "#1c1b19", fontFamily: "'Instrument Sans', system-ui, sans-serif", overflowX: "hidden" }}>
      <SEO title="Sign In" description="Sign in to your Dealstage account" />
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;700&family=Instrument+Sans:wght@300;400;500&family=Instrument+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        .login-card { background: rgba(255,248,220,0.02) !important; border-color: rgba(255,248,220,0.07) !important; }
        .login-card input { background: rgba(255,248,220,0.03) !important; border-color: rgba(255,248,220,0.1) !important; color: #f5f0e6 !important; }
        .login-card button[type="submit"] { background: linear-gradient(135deg, #d4b04e, #e07b18) !important; color: #1c1b19 !important; }
        .login-card .text-indigo-400, .login-card .text-indigo-300 { color: #d4b04e !important; }
        .login-card .bg-gradient-to-r { background: linear-gradient(135deg, #d4b04e, #e07b18) !important; color: #1c1b19 !important; }
        .login-card .border-indigo-500 { border-color: rgba(212,176,78,0.4) !important; }
        .login-card .bg-indigo-500\\/10 { background: rgba(212,176,78,0.08) !important; }
        @media (max-width: 480px) {
          .login-card { padding: 1.5rem !important; }
          .login-outer { padding: 0.75rem !important; }
        }
        @media (max-width: 360px) {
          .login-card { padding: 1.25rem !important; }
          .login-logo { height: 44px !important; }
        }
      `}</style>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <img className="login-logo" src="/brand/logos/04_logo_transparent_ondark.png" alt="DealStage" style={{ height: 56 }} width={220} height={56} fetchPriority="high" />
          </div>
          <p className="text-slate-400 text-sm">
            {mode === "login" ? "Sign in to your account" : mode === "forgot" ? "Reset your password" : "Create your account"}
          </p>
        </div>

        {/* Card */}
        <div className="login-card bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          {message && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm">
              {message}
            </div>
          )}

          {serverError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {serverError}
              {mode === "signup" && serverError.toLowerCase().includes("already") && (
                <div className="mt-2 flex gap-3">
                  <button onClick={() => switchMode("login")} className="text-xs underline" style={{ color: "#d4b04e" }}>Sign in instead</button>
                  <button onClick={() => switchMode("magiclink")} className="text-xs underline" style={{ color: "#d4b04e" }}>Reset password</button>
                </div>
              )}
            </div>
          )}

          {/* Social OAuth Buttons */}
          {mode !== "magiclink" && mode !== "forgot" && (
            <div className="space-y-2 mb-6">
              <Button
                type="button"
                onClick={() => handleSocialLogin("google")}
                disabled={loading}
                variant="outline"
                aria-label="Continue with Google"
                className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 font-medium py-5"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-transparent text-slate-500">or continue with email</span>
                </div>
              </div>
            </div>
          )}

          {/* Magic Link Mode */}
          {mode === "magiclink" && (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div>
                <Label className="text-slate-300 text-sm">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    type="email"
                    value={magicEmail}
                    onChange={(e) => setMagicEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium py-5"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Send Magic Link
                  </>
                )}
              </Button>
              <p className="text-center text-sm text-slate-400">
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Back to password login
                </button>
              </p>
            </form>
          )}

          {/* Forgot Password Mode */}
          {mode === "forgot" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-sm text-slate-400 mb-2">Enter your email and we'll send you a password reset link.</p>
              <div>
                <Label className="text-slate-300 text-sm">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading || !forgotEmail}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium py-5"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : "Send Reset Link"}
              </Button>
              <p className="text-center text-sm text-slate-400">
                <button type="button" onClick={() => switchMode("login")} className="text-indigo-400 hover:text-indigo-300 font-medium">
                  Back to sign in
                </button>
              </p>
            </form>
          )}

          {/* Login / Signup form — validated by Zod */}
          {mode !== "magiclink" && mode !== "forgot" && (
            <form
              onSubmit={mode === "login" ? handleLogin : handleSignup}
              className="space-y-4"
              noValidate
            >
              {mode === "signup" && (
                <div>
                  <Label className="text-slate-300 text-sm">Full Name</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      type="text"
                      placeholder="Your full name"
                      className={`pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 ${
                        errors.fullName ? "border-red-500/60 focus:border-red-500" : ""
                      }`}
                      {...signupForm.register("fullName")}
                    />
                  </div>
                  <FieldError message={errors.fullName?.message} />
                </div>
              )}

              <div>
                <Label className="text-slate-300 text-sm">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    className={`pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 ${
                      errors.email ? "border-red-500/60 focus:border-red-500" : ""
                    }`}
                    {...activeForm.register("email")}
                  />
                </div>
                <FieldError message={errors.email?.message} />
              </div>

              <div>
                <Label className="text-slate-300 text-sm">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500 ${
                      errors.password ? "border-red-500/60 focus:border-red-500" : ""
                    }`}
                    {...activeForm.register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                  </button>
                </div>
                <FieldError message={errors.password?.message} />
                {mode === "login" && (
                  <div className="mt-1 text-right">
                    <button type="button" onClick={() => switchMode("forgot")} className="text-xs text-slate-500 hover:text-slate-300 transition-colors" style={{ color: "#d4b04e" }}>
                      Forgot password?
                    </button>
                  </div>
                )}
                {mode === "signup" && watchedPassword && (() => {
                  const strength = getPasswordStrength(watchedPassword);
                  return (
                    <div style={{ marginTop: 6 }}>
                      <div style={{ display: "flex", gap: 3, marginBottom: 4 }}>
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength.level ? strength.color : "rgba(255,248,220,0.1)", transition: "background 0.2s" }} />
                        ))}
                      </div>
                      <p style={{ fontSize: "0.65rem", color: strength.color, fontFamily: "'Instrument Mono', monospace" }}>{strength.label}</p>
                    </div>
                  );
                })()}
              </div>

              {mode === "signup" && (
                <div>
                  <Label className="text-slate-300 text-sm mb-2 block">I am a...</Label>
                  <div className="grid gap-2">
                    {roles.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value)}
                        className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                          role === r.value
                            ? "border-indigo-500 bg-indigo-500/10 text-white"
                            : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"
                        }`}
                      >
                        <r.icon className={`w-5 h-5 ${role === r.value ? "text-indigo-400" : "text-slate-500"}`} />
                        <div>
                          <p className="text-sm font-medium">{r.label}</p>
                          <p className="text-xs text-slate-500">{r.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mode === "signup" && (
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/30"
                  />
                  <span className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                    I agree to the{" "}
                    <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline">Terms of Service</a>
                    {" "}and{" "}
                    <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline">Privacy Policy</a>
                  </span>
                </label>
              )}

              {/* hCaptcha — required for both login and signup */}
              <div className="flex justify-center">
                <HCaptcha
                  sitekey="94d0565a-6c4e-4bd2-b8a6-04ac52321aca"
                  theme="dark"
                  onVerify={(token) => setCaptchaToken(token)}
                  onExpire={() => setCaptchaToken(null)}
                  ref={captchaRef}
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !captchaToken || (mode === "signup" && !acceptedTerms)}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium py-5"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === "login" ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          )}

          {mode !== "magiclink" && mode !== "forgot" && (
            <div className="mt-6 text-center space-y-3">
              <button
                onClick={() => switchMode("magiclink")}
                className="text-sm text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1 w-full"
              >
                <Wand2 className="w-3 h-3" /> Sign in with magic link (no password)
              </button>
              {mode === "login" ? (
                <p className="text-sm text-slate-400">
                  Don't have an account?{" "}
                  <button
                    onClick={() => switchMode("signup")}
                    className="text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p className="text-sm text-slate-400">
                  Already have an account?{" "}
                  <button
                    onClick={() => switchMode("login")}
                    className="text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
