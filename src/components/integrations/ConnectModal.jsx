import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Eye, EyeOff, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Field configs per integration type
const CREDENTIAL_CONFIGS = {
  // OAuth-based: just a connect button
  "OAuth 2.0": [{ key: "oauth", label: "Authorize via OAuth", type: "oauth" }],
  "OAuth 2.0 / Webhook": [
    { key: "webhook_url", label: "Webhook URL (optional)", type: "text", placeholder: "https://hooks.example.com/..." },
  ],
  "Bot Token / Webhook": [
    { key: "bot_token", label: "Bot Token", type: "password", placeholder: "Enter your Discord bot token" },
    { key: "webhook_url", label: "Webhook URL (optional)", type: "text", placeholder: "https://discord.com/api/webhooks/..." },
  ],
  "Meta Cloud API": [
    { key: "access_token", label: "Meta Access Token", type: "password", placeholder: "Enter your Meta access token" },
    { key: "phone_number_id", label: "Phone Number ID", type: "text", placeholder: "Enter your phone number ID" },
  ],
  "API Key": [
    { key: "api_key", label: "API Key", type: "password", placeholder: "Enter your API key" },
  ],
  "API + SDK": [
    { key: "api_key", label: "API Key / Measurement ID", type: "password", placeholder: "Enter your Measurement ID or API key" },
  ],
  "OAuth + API": [
    { key: "client_id", label: "Client ID", type: "text", placeholder: "Your OAuth Client ID" },
    { key: "client_secret", label: "Client Secret", type: "password", placeholder: "Your OAuth Client Secret" },
  ],
  "Data API v3 + Phyllo": [
    { key: "api_key", label: "API Key", type: "password", placeholder: "Enter your YouTube Data API key" },
    { key: "phyllo_client_id", label: "Phyllo Client ID (optional)", type: "text", placeholder: "Enter your Phyllo client ID" },
  ],
  "Graph API + Phyllo": [
    { key: "access_token", label: "Graph API Access Token", type: "password", placeholder: "Enter your Graph API access token" },
    { key: "phyllo_client_id", label: "Phyllo Client ID (optional)", type: "text", placeholder: "Enter your Phyllo client ID" },
  ],
  "Research API + Phyllo": [
    { key: "api_key", label: "TikTok Research API Key", type: "password", placeholder: "Enter your TikTok Research API key" },
    { key: "phyllo_client_id", label: "Phyllo Client ID (optional)", type: "text", placeholder: "Enter your Phyllo client ID" },
  ],
  "Helix API": [
    { key: "client_id", label: "Client ID", type: "text", placeholder: "Your Twitch Client ID" },
    { key: "client_secret", label: "Client Secret", type: "password", placeholder: "Your Client Secret" },
  ],
  "API v2": [
    { key: "bearer_token", label: "Bearer Token", type: "password", placeholder: "Enter your bearer token" },
  ],
  "Marketing API": [
    { key: "access_token", label: "Access Token", type: "password", placeholder: "Enter your Marketing API access token" },
    { key: "account_id", label: "Ad Account ID", type: "text", placeholder: "Enter your Ad Account ID (e.g. act_...)" },
  ],
  "API v5": [
    { key: "access_token", label: "Access Token", type: "password", placeholder: "Enter your Pinterest access token" },
  ],
  "API": [
    { key: "api_key", label: "API Key / Token", type: "password", placeholder: "Your API Key" },
  ],
  "X-API-Key (Header)": [
    { key: "api_key", label: "API Key", type: "password", placeholder: "Your GrowMeOrganic API Key" },
  ],
};

const DOCS_LINKS = {
  "YouTube": "https://developers.google.com/youtube/v3",
  "Instagram": "https://developers.facebook.com/docs/instagram-api",
  "TikTok": "https://developers.tiktok.com",
  "Twitch": "https://dev.twitch.tv/docs/api",
  "Twitter/X": "https://developer.twitter.com/en/docs",
  "LinkedIn": "https://learn.microsoft.com/en-us/linkedin/marketing",
  "Facebook": "https://developers.facebook.com",
  "Slack": "https://api.slack.com/apps",
  "Microsoft Teams": "https://learn.microsoft.com/en-us/microsoftteams/platform",
  "Discord": "https://discord.com/developers/applications",
  "Salesforce": "https://developer.salesforce.com/docs",
  "HubSpot": "https://developers.hubspot.com",
  "Pipedrive": "https://developers.pipedrive.com",
  "Mailchimp": "https://mailchimp.com/developer",
  "ActiveCampaign": "https://developers.activecampaign.com",
  "Klaviyo": "https://developers.klaviyo.com",
};

export default function ConnectModal({ integration, onClose, onConnect, isConnected }) {
  const [fields, setFields] = useState({});
  const [showPassword, setShowPassword] = useState({});
  const [saved, setSaved] = useState(false);

  if (!integration) return null;

  const authType = integration.type || integration.method || "API Key";
  const fieldConfig = CREDENTIAL_CONFIGS[authType] || CREDENTIAL_CONFIGS["API Key"];
  const isOAuth = fieldConfig.some(f => f.type === "oauth");
  const docsUrl = DOCS_LINKS[integration.name];

  const handleSave = () => {
    // Save to localStorage keyed by integration name
    const existing = JSON.parse(localStorage.getItem("piq_credentials") || "{}");
    existing[integration.name] = { ...fields, connected: true, auth_type: authType };
    localStorage.setItem("piq_credentials", JSON.stringify(existing));
    setSaved(true);
    setTimeout(() => {
      onConnect(integration.name);
      onClose();
    }, 800);
  };

  const handleDisconnect = () => {
    const existing = JSON.parse(localStorage.getItem("piq_credentials") || "{}");
    delete existing[integration.name];
    localStorage.setItem("piq_credentials", JSON.stringify(existing));
    onConnect(integration.name); // toggles off
    onClose();
  };

  const handleOAuth = () => {
    // Simulate OAuth flow
    setSaved(true);
    setTimeout(() => {
      onConnect(integration.name);
      onClose();
    }, 1000);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            {integration.color && (
              <div className={`w-10 h-10 rounded-xl ${integration.color} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white font-bold text-sm">{integration.logo || integration.name?.slice(0, 2).toUpperCase()}</span>
              </div>
            )}
            <div>
              <DialogTitle className="text-base">{integration.name}</DialogTitle>
              <Badge variant="outline" className="text-[10px] mt-0.5">{authType}</Badge>
            </div>
          </div>
          <DialogDescription className="text-xs text-slate-500 leading-relaxed">
            {integration.description || `Connect your ${integration.name} account to enable data sync.`}
          </DialogDescription>
        </DialogHeader>

        {saved ? (
          <div className="flex flex-col items-center justify-center py-6 gap-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            <p className="text-sm font-semibold text-slate-700">
              {isOAuth ? "Redirecting to authorize..." : "Credentials saved!"}
            </p>
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            {/* Always show OAuth login option first */}
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-xs text-emerald-700 font-medium mb-2">Option 1: Log in directly (Recommended)</p>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleOAuth}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Authorize with {integration.name}
                </Button>
              </div>
            </div>

            {/* Always show API key option second */}
            {!isOAuth && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
                <p className="text-xs text-amber-700 font-medium">Option 2: Connect with API credentials</p>
                {fieldConfig.filter(f => f.type !== "oauth").map(f => (
                  <div key={f.key} className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-600">{f.label}</Label>
                    <div className="relative">
                      <Input
                        type={f.type === "password" && !showPassword[f.key] ? "password" : "text"}
                        placeholder={f.placeholder}
                        value={fields[f.key] || ""}
                        onChange={e => setFields(prev => ({ ...prev, [f.key]: e.target.value }))}
                        className="text-sm pr-10"
                      />
                      {f.type === "password" && (
                        <button
                          type="button"
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          onClick={() => setShowPassword(prev => ({ ...prev, [f.key]: !prev[f.key] }))}
                        >
                          {showPassword[f.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {docsUrl && (
                  <a href={docsUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                    <ExternalLink className="w-3 h-3" /> View API documentation
                  </a>
                )}

                <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white" onClick={handleSave}
                  disabled={Object.values(fields).every(v => !v)}>
                  Verify & Connect
                </Button>
              </div>
            )}

            {isOAuth && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
                <p className="text-xs text-amber-700 font-medium">Option 2: Connect with API Key</p>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600">API Key / Access Token</Label>
                  <div className="relative">
                    <Input
                      type={showPassword["api_key"] ? "text" : "password"}
                      placeholder={`Your ${integration.name} API key`}
                      value={fields["api_key"] || ""}
                      onChange={e => setFields(prev => ({ ...prev, api_key: e.target.value }))}
                      className="text-sm pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      onClick={() => setShowPassword(prev => ({ ...prev, api_key: !prev.api_key }))}
                    >
                      {showPassword["api_key"] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {docsUrl && (
                  <a href={docsUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                    <ExternalLink className="w-3 h-3" /> View API documentation
                  </a>
                )}
                <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white" onClick={handleSave}
                  disabled={!fields["api_key"]}>
                  Verify & Connect
                </Button>
              </div>
            )}

            {isConnected && (
              <Button variant="outline" className="w-full text-red-500 border-red-200 hover:bg-red-50 text-xs" onClick={handleDisconnect}>
                Disconnect {integration.name}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}