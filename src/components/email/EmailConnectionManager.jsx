import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { supabase } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, CheckCircle2, XCircle, Unplug } from "lucide-react";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const MICROSOFT_CLIENT_ID = import.meta.env.VITE_MICROSOFT_CLIENT_ID || "";
const REDIRECT_URI = "https://www.thedealstage.com/Settings";

/**
 * Build the Google OAuth consent URL for Gmail send access.
 */
function getGmailAuthUrl() {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email",
    access_type: "offline",
    prompt: "consent",
    state: "gmail",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Build the Microsoft OAuth consent URL for Outlook send access.
 */
function getOutlookAuthUrl() {
  const params = new URLSearchParams({
    client_id: MICROSOFT_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "https://graph.microsoft.com/Mail.Send offline_access openid email profile",
    state: "outlook",
  });
  return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
}

export default function EmailConnectionManager() {
  const [connection, setConnection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch the current active email connection
  const fetchConnection = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error: fetchErr } = await supabase
        .from("email_connections")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .limit(1);

      if (fetchErr) {
        console.error("Failed to fetch email connections:", fetchErr.message);
        return;
      }

      setConnection(data && data.length > 0 ? data[0] : null);
    } catch (err) {
      console.error("Error fetching email connection:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle OAuth callback - read code from URL params
  const handleOAuthCallback = useCallback(async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");

    if (!code || !state || !["gmail", "outlook"].includes(state)) return;

    // Clean URL to prevent re-processing on refresh
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);

    setConnecting(true);
    setError(null);

    try {
      const { data } = await base44.functions.invoke("connectEmailAccount", {
        provider: state,
        auth_code: code,
      });

      if (data?.error) {
        setError(data.error);
      } else if (data?.success) {
        setSuccess(`Connected ${data.email_address} via ${data.provider === "gmail" ? "Gmail" : "Outlook"}`);
        setTimeout(() => setSuccess(null), 5000);
        await fetchConnection();
      }
    } catch (err) {
      setError(err.message || "Failed to connect email account");
    } finally {
      setConnecting(false);
    }
  }, [fetchConnection]);

  useEffect(() => {
    fetchConnection();
  }, [fetchConnection]);

  useEffect(() => {
    handleOAuthCallback();
  }, [handleOAuthCallback]);

  // Disconnect the current email connection
  const handleDisconnect = async () => {
    if (!connection) return;
    setDisconnecting(true);
    setError(null);

    try {
      const { error: updateErr } = await supabase
        .from("email_connections")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", connection.id);

      if (updateErr) {
        setError("Failed to disconnect: " + updateErr.message);
      } else {
        setConnection(null);
        setSuccess("Email account disconnected");
        setTimeout(() => setSuccess(null), 4000);
      }
    } catch (err) {
      setError(err.message || "Failed to disconnect");
    } finally {
      setDisconnecting(false);
    }
  };

  const providerLabel = connection?.provider === "gmail" ? "Gmail" : "Outlook";

  return (
    <Card className="border-slate-200/60">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-base">Email Sending</CardTitle>
            <CardDescription>
              Connect your email to send outreach directly from your inbox
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading email connection...
          </div>
        ) : connection ? (
          /* ── Connected state ────────────────────────────────── */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {connection.email_address}
                  </p>
                  <p className="text-xs text-slate-400">
                    Connected via {providerLabel}
                  </p>
                </div>
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 text-xs">
                Emails sent from your inbox
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              {disconnecting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Unplug className="w-4 h-4 mr-2" />
              )}
              Disconnect
            </Button>
          </div>
        ) : (
          /* ── Not connected state ────────────────────────────── */
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-slate-100 text-slate-600 text-xs">
                Emails sent via Deal Stage
              </Badge>
            </div>
            <p className="text-sm text-slate-500">
              Connect your Gmail or Outlook account to send outreach emails
              directly from your own inbox. Replies will come straight to you.
            </p>
            {connecting ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting your email account...
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => { window.location.href = getGmailAuthUrl(); }}
                  className="border-slate-200"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Connect Gmail
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { window.location.href = getOutlookAuthUrl(); }}
                  className="border-slate-200"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="#0078D4" d="M24 7.387v10.478c0 .23-.08.424-.238.58a.788.788 0 0 1-.584.235h-8.322v-8.12L17.2 12l2.456-1.44V7.387h4.106c.228 0 .422.078.584.235.159.157.238.35.238.58zM14.856 10.56V19h-8.57a.788.788 0 0 1-.584-.235.778.778 0 0 1-.238-.58V5.184c0-.228.08-.423.238-.58a.788.788 0 0 1 .584-.236h8.57v6.192z" />
                    <path fill="#0078D4" d="M14.856 4.368v6.192L9.57 7.28l5.286-2.912zM19.656 7.387v3.173L17.2 12l-2.344-1.44V7.387h4.8z" />
                    <path fill="#0364B8" d="M9.71 8.22a4.003 4.003 0 0 1 1.474 1.486A4.072 4.072 0 0 1 11.72 12c0 .807-.179 1.55-.537 2.228a4.08 4.08 0 0 1-1.474 1.554A3.89 3.89 0 0 1 7.6 16.37a3.89 3.89 0 0 1-2.108-.588 4.08 4.08 0 0 1-1.474-1.554A4.198 4.198 0 0 1 3.48 12c0-.807.18-1.563.537-2.295a4.003 4.003 0 0 1 1.474-1.486A3.89 3.89 0 0 1 7.6 7.63c.784 0 1.5.197 2.11.59zm-3.49 6.098c.383.35.84.524 1.38.524s.997-.175 1.38-.524c.383-.35.574-.808.574-1.374V11.1c0-.566-.191-1.025-.574-1.374-.383-.35-.84-.524-1.38-.524s-.997.175-1.38.524c-.383.35-.574.808-.574 1.374v1.844c0 .566.191 1.025.574 1.374z" />
                  </svg>
                  Connect Outlook
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Status messages */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
            <XCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {success}
          </div>
        )}

        <p className="text-xs text-slate-400">
          Pro, Elite, Growth, Scale, and Agency plans can send emails directly from their connected inbox.
          Free and Starter plans send via Deal Stage with your email as the reply-to address.
        </p>
      </CardContent>
    </Card>
  );
}
