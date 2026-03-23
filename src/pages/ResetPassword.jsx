import React, { useState, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import { Lock, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("ready"); // ready | success | error
  const [errorMessage, setErrorMessage] = useState("");
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  const strength = getPasswordStrength(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const canSubmit = password.length >= 8 && passwordsMatch && !loading;

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "PASSWORD_RECOVERY") {
          setIsRecoveryMode(true);
        }
      }
    );

    // Also check if we already have a session (user clicked recovery link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsRecoveryMode(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setStatus("success");
      setTimeout(() => navigate("/Dashboard", { replace: true }), 2000);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  if (!isRecoveryMode) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-4">
          <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mx-auto" />
          <h1 className="text-xl font-semibold text-white">
            Verifying reset link...
          </h1>
          <p className="text-sm text-slate-400">
            If nothing happens,{" "}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300">
              request a new reset link
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h1 className="text-xl font-semibold text-white">
            Password updated!
          </h1>
          <p className="text-sm text-slate-400">
            Redirecting you to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-xl font-semibold text-white">
              Set your new password
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Choose a strong password for your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="text-sm text-slate-300">New Password</Label>
              <div className="relative mt-1.5">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="bg-slate-800 border-slate-700 text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && (
                <div className="mt-2" role="status" aria-live="polite" aria-atomic="true">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-colors"
                        style={{
                          backgroundColor: i <= strength.level ? strength.color : "#334155",
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: strength.color }}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm text-slate-300">Confirm Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="mt-1.5 bg-slate-800 border-slate-700 text-white"
              />
              {confirmPassword && !passwordsMatch && (
                <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
              )}
            </div>

            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-sm text-red-400">{errorMessage}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
