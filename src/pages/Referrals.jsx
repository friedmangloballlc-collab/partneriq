import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Copy,
  CheckCircle2,
  Users,
  Handshake,
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Linkedin,
  Twitter,
  Star,
  Loader2,
  Gift,
  Link2,
  Zap,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateCode(fullName, email) {
  // Build a deterministic slug from name + email suffix
  const namePart = (fullName || "user")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 8);
  const emailPart = (email || "x")
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 4);
  const suffix = Math.abs(
    Array.from(email || "x").reduce((acc, c) => acc * 31 + c.charCodeAt(0), 0)
  )
    .toString(36)
    .slice(0, 4)
    .toUpperCase();
  return `${namePart}${emailPart}${suffix}`.toUpperCase().slice(0, 16);
}

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const REFERRAL_URL_BASE = "https://www.thedealstage.com/Onboarding?ref=";

// Deal Score badge color map
const SCORE_COLORS = [
  { min: 90, bg: "#4f46e5", label: "Elite" },
  { min: 75, bg: "#0ea5e9", label: "Pro" },
  { min: 60, bg: "#10b981", label: "Rising" },
  { min: 40, bg: "#f59e0b", label: "Active" },
  { min: 0, bg: "#94a3b8", label: "Starter" },
];

function getScoreMeta(score) {
  return SCORE_COLORS.find((c) => score >= c.min) || SCORE_COLORS[SCORE_COLORS.length - 1];
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <Card className="bg-white border border-slate-200">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-[12px] text-slate-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Deal Score Badge Generator ────────────────────────────────────────────────

function DealScoreBadge({ user, dealScore }) {
  const [copied, setCopied] = useState(false);
  const score = dealScore ?? 72;
  const meta = getScoreMeta(score);

  const badgeHtml = `<a href="https://www.thedealstage.com" target="_blank" style="display:inline-block;font-family:sans-serif;text-decoration:none;">
  <div style="background:${meta.bg};color:#fff;border-radius:10px;padding:12px 20px;display:inline-flex;align-items:center;gap:10px;box-shadow:0 2px 8px rgba(0,0,0,0.2);">
    <span style="font-size:22px;font-weight:900;">${score}</span>
    <div>
      <div style="font-size:10px;opacity:0.8;text-transform:uppercase;letter-spacing:1px;">Deal Score</div>
      <div style="font-size:13px;font-weight:700;">${meta.label} · ${user?.full_name || "Creator"}</div>
    </div>
    <div style="font-size:10px;opacity:0.7;margin-left:8px;">Deal Stage</div>
  </div>
</a>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(badgeHtml).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-3">
      {/* Live preview */}
      <div className="flex items-center justify-center py-4 bg-slate-50 rounded-xl border border-slate-100">
        <div
          className="inline-flex items-center gap-3 rounded-xl px-5 py-3 text-white shadow-md"
          style={{ background: meta.bg }}
        >
          <span className="text-3xl font-black">{score}</span>
          <div>
            <p className="text-[9px] uppercase tracking-widest opacity-75">Deal Score</p>
            <p className="text-[13px] font-bold">{meta.label} &middot; {user?.full_name || "Creator"}</p>
          </div>
          <div className="flex items-center gap-1 ml-2 opacity-70">
            <Zap className="w-3 h-3" />
            <span className="text-[10px]">Deal Stage</span>
          </div>
        </div>
      </div>

      {/* Embed code */}
      <div className="bg-slate-900 rounded-lg p-3 overflow-x-auto">
        <pre className="text-[10px] text-emerald-400 whitespace-pre-wrap leading-relaxed font-mono">
          {badgeHtml}
        </pre>
      </div>

      <Button
        size="sm"
        onClick={handleCopy}
        className={copied ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"}
      >
        {copied ? (
          <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Copied!</>
        ) : (
          <><Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Embed Code</>
        )}
      </Button>
    </div>
  );
}

// ── Leaderboard Row ───────────────────────────────────────────────────────────

const RANK_META = {
  0: {
    icon: <Trophy className="w-4 h-4 text-yellow-500" />,
    wrapperClass: "border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50",
    badgeClass: "bg-yellow-400 text-yellow-900",
  },
  1: {
    icon: <Medal className="w-4 h-4 text-slate-400" />,
    wrapperClass: "border-slate-300 bg-gradient-to-r from-slate-50 to-gray-50",
    badgeClass: "bg-slate-400 text-white",
  },
  2: {
    icon: <Award className="w-4 h-4 text-amber-600" />,
    wrapperClass: "border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50",
    badgeClass: "bg-amber-600 text-white",
  },
};

function LeaderboardRow({ entry, rank }) {
  const meta = RANK_META[rank] || {};
  const isTop3 = rank < 3;

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl border ${
        isTop3 ? `border-2 ${meta.wrapperClass} shadow-sm` : "border-slate-100 bg-white"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
          isTop3 ? meta.badgeClass : "bg-slate-100 text-slate-600"
        }`}
      >
        {isTop3 ? meta.icon : rank + 1}
      </div>
      <Avatar className="w-9 h-9 flex-shrink-0">
        <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-xs font-bold">
          {getInitials(entry.referrer_name || entry.referrer_email)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-slate-800 truncate">
          {entry.referrer_name || entry.referrer_email?.split("@")[0] || "User"}
        </p>
        <p className="text-[11px] text-slate-400">{entry.referral_code}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-[14px] font-bold text-indigo-600">{entry.total_referrals}</p>
        <p className="text-[10px] text-slate-400">referrals</p>
      </div>
      <div className="text-right flex-shrink-0 hidden sm:block">
        <p className="text-[13px] font-semibold text-emerald-600">{entry.converted}</p>
        <p className="text-[10px] text-slate-400">signed up</p>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Referrals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [linkCopied, setLinkCopied] = useState(false);
  const [codeSaving, setCodeSaving] = useState(false);

  // Compute this user's referral code (deterministic from name + email)
  const myCode =
    user?.referral_code ||
    (user?.email ? generateCode(user.full_name || "", user.email) : null);
  const myLink = myCode ? `${REFERRAL_URL_BASE}${myCode}` : null;

  // Ensure the referral_code is saved to the profile once we have a user
  useEffect(() => {
    if (!user || !myCode || user.referral_code) return;
    setCodeSaving(true);
    supabase
      .from("profiles")
      .update({ referral_code: myCode })
      .eq("id", user.id)
      .then(() => {
        setCodeSaving(false);
      })
      .catch(() => setCodeSaving(false));
  }, [user, myCode]);

  // My referral stats
  const { data: myReferrals = [] } = useQuery({
    queryKey: ["my_referrals", user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_email", user.email)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const totalReferrals = myReferrals.length;
  const signedUp = myReferrals.filter((r) => r.referred_signed_up).length;
  const completedFirstDeal = myReferrals.filter((r) => r.referred_first_deal).length;

  // Leaderboard: aggregate referrals per referrer
  const { data: leaderboard = [] } = useQuery({
    queryKey: ["referral_leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referrals")
        .select("referrer_email, referral_code, referred_signed_up")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;

      // Aggregate by referrer_email
      const map = {};
      for (const row of data || []) {
        const key = row.referrer_email;
        if (!map[key]) {
          map[key] = {
            referrer_email: key,
            referral_code: row.referral_code,
            total_referrals: 0,
            converted: 0,
          };
        }
        map[key].total_referrals += 1;
        if (row.referred_signed_up) map[key].converted += 1;
      }

      // Enrich with profile names
      const emails = Object.keys(map);
      if (emails.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("email, full_name")
          .in("email", emails);
        for (const p of profiles || []) {
          if (map[p.email]) map[p.email].referrer_name = p.full_name;
        }
      }

      return Object.values(map)
        .sort((a, b) => b.total_referrals - a.total_referrals)
        .slice(0, 20);
    },
  });

  // Deal score from partnerships (quick proxy: count of active deals * 10, capped 99)
  const { data: myDealScore } = useQuery({
    queryKey: ["my_deal_score_ref", user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const { count } = await supabase
        .from("partnerships")
        .select("id", { count: "exact", head: true })
        .or(`talent_name.ilike.%${user.full_name || "none"}%`);
      return Math.min(99, Math.max(10, (count || 0) * 8 + 42));
    },
  });

  const handleCopyLink = () => {
    if (!myLink) return;
    navigator.clipboard.writeText(myLink).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
      toast({ title: "Link copied!", description: "Share it to invite new members." });
    });
  };

  const shareText = `I've been using Deal Stage to close better brand deals — join me!\n${myLink}\n\n#DealStage #CreatorEconomy #Influencer`;

  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(myLink || REFERRAL_URL_BASE)}&summary=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Referral &amp; Growth</h1>
        <p className="text-[14px] text-slate-500 mt-0.5">
          Invite your network to Deal Stage and earn rewards for every successful referral.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Users}
          label="Total Referrals"
          value={totalReferrals}
          color="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          icon={CheckCircle2}
          label="Signed Up"
          value={signedUp}
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          icon={Handshake}
          label="Completed First Deal"
          value={completedFirstDeal}
          color="bg-amber-50 text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referral code card */}
        <Card className="bg-white border border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-[15px] font-semibold text-slate-800 flex items-center gap-2">
              <Gift className="w-4 h-4 text-indigo-500" />
              Your Referral Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {myCode ? (
              <>
                <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
                  <code className="text-xl font-mono font-bold text-indigo-700 tracking-widest flex-1">
                    {myCode}
                  </code>
                  {codeSaving && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />}
                </div>

                <div>
                  <p className="text-[11px] text-slate-500 mb-1 font-medium uppercase tracking-wide">
                    Your invite link
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[12px] text-slate-600 font-mono truncate">
                      {myLink}
                    </div>
                    <Button
                      size="sm"
                      onClick={handleCopyLink}
                      className={
                        linkCopied
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white flex-shrink-0"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white flex-shrink-0"
                      }
                    >
                      {linkCopied ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Share buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShareLinkedIn}
                    className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 text-[12px]"
                  >
                    <Linkedin className="w-3.5 h-3.5 mr-1.5" />
                    Share on LinkedIn
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShareTwitter}
                    className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50 text-[12px]"
                  >
                    <Twitter className="w-3.5 h-3.5 mr-1.5" />
                    Share on X
                  </Button>
                </div>

                {/* Reward info */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
                  <Star className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[12px] text-amber-800 leading-relaxed">
                    Earn rewards when your referrals sign up and complete their first deal. Rewards are credited monthly.
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 text-slate-400 py-4">
                <Loader2 className="w-5 h-5 animate-spin" />
                <p className="text-[13px]">Generating your code...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deal Score Badge card */}
        <Card className="bg-white border border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-[15px] font-semibold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Share Your Deal Score Badge
            </CardTitle>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Embed your Deal Score on your website or share it as a credibility signal.
            </p>
          </CardHeader>
          <CardContent>
            <DealScoreBadge user={user} dealScore={myDealScore} />
          </CardContent>
        </Card>
      </div>

      {/* My referrals table */}
      {myReferrals.length > 0 && (
        <Card className="bg-white border border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-[15px] font-semibold text-slate-800 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-indigo-500" />
              My Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 pr-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                      Email
                    </th>
                    <th className="text-center py-2 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                      Signed Up
                    </th>
                    <th className="text-center py-2 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                      First Deal
                    </th>
                    <th className="text-center py-2 pl-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                      Reward
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {myReferrals.map((r) => (
                    <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 pr-4 text-slate-700 font-medium">
                        {r.referred_email || <span className="text-slate-400 italic">Pending...</span>}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {r.referred_signed_up ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-slate-200 mx-auto" />
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {r.referred_first_deal ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-slate-200 mx-auto" />
                        )}
                      </td>
                      <td className="py-2.5 pl-4 text-center">
                        {r.reward_credited ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">
                            Credited
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-100 text-slate-500 border-slate-200 text-[10px]">
                            Pending
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      <Card className="bg-white border border-slate-200">
        <CardHeader className="pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-[15px] font-semibold text-slate-800 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Top Referrers
          </CardTitle>
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[11px]">
            Community Leaderboard
          </Badge>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-[13px]">No referrals yet — be the first!</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {leaderboard.map((entry, i) => (
                <LeaderboardRow key={entry.referrer_email} entry={entry} rank={i} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* How it works */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
        <CardContent className="p-6">
          <h3 className="text-[14px] font-semibold text-indigo-900 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-500" />
            How Referrals Work
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: "1", title: "Share your link", desc: "Copy your unique referral link and share it with creators, brands, or agencies." },
              { step: "2", title: "They sign up", desc: "Your contact signs up via your link and completes onboarding on Deal Stage." },
              { step: "3", title: "Earn rewards", desc: "Once they close their first deal, you earn referral rewards credited to your account." },
            ].map((item) => (
              <div key={item.step} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-[12px] font-bold flex items-center justify-center flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-indigo-800">{item.title}</p>
                  <p className="text-[12px] text-indigo-600 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
