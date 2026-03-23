import React, { useEffect, useState } from "react";
import { supabase } from "@/api/supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for PKCE code in query params
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          setStatus("success");
          setTimeout(() => navigate("/Dashboard", { replace: true }), 1500);
          return;
        }

        // For hash-based flow, Supabase auto-detects — listen for auth state
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (event === "SIGNED_IN" && session) {
              setStatus("success");
              setTimeout(() => navigate("/Dashboard", { replace: true }), 1500);
              subscription.unsubscribe();
            } else if (event === "PASSWORD_RECOVERY") {
              // Redirect to password reset page
              navigate("/reset-password", { replace: true });
              subscription.unsubscribe();
            }
          }
        );

        // Timeout after 10 seconds if no auth event fires
        setTimeout(() => {
          setStatus((prev) => {
            if (prev === "verifying") {
              subscription.unsubscribe();
              return "error";
            }
            return prev;
          });
          setErrorMessage("Verification timed out. The link may have expired.");
        }, 10000);
      } catch (err) {
        setStatus("error");
        setErrorMessage(err.message || "Failed to verify your account.");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {status === "verifying" && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mx-auto" />
            <h1 className="text-xl font-semibold text-white">
              Verifying your account...
            </h1>
            <p className="text-sm text-slate-400">
              Please wait while we confirm your email.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h1 className="text-xl font-semibold text-white">
              Account verified!
            </h1>
            <p className="text-sm text-slate-400">
              Redirecting you to your dashboard...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <XCircle className="w-12 h-12 text-red-400 mx-auto" />
            <h1 className="text-xl font-semibold text-white">
              Verification failed
            </h1>
            <p className="text-sm text-slate-400">
              {errorMessage}
            </p>
            <Link
              to="/login"
              className="inline-block mt-4 px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
