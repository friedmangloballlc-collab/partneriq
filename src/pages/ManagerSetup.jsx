import React, { useState, useRef } from "react";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserCheck,
  Link2,
  Upload,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Mail,
  User,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";

const TALENT_CATEGORIES = [
  "Athletes",
  "Creators",
  "Musicians",
  "Speakers",
  "Models",
  "Actors",
  "Podcasters",
  "Coaches",
  "Influencers",
  "Entertainers",
  "Journalists",
  "Authors",
];

// Step indicator for the Path 2 wizard
function WizardStepIndicator({ currentStep }) {
  const steps = [
    { num: 1, label: "Verification" },
    { num: 2, label: "Talent Info" },
    { num: 3, label: "Confirm" },
  ];

  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((step, idx) => (
        <React.Fragment key={step.num}>
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors ${
                currentStep > step.num
                  ? "bg-amber-500 border-amber-500 text-white"
                  : currentStep === step.num
                  ? "bg-amber-50 border-amber-500 text-amber-700"
                  : "bg-background border-border text-muted-foreground"
              }`}
            >
              {currentStep > step.num ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                step.num
              )}
            </div>
            <span
              className={`text-xs font-medium hidden sm:block ${
                currentStep === step.num
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={`flex-1 h-px ${
                currentStep > step.num ? "bg-amber-400" : "bg-border"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// File drop zone for document upload
function DocumentDropZone({ file, onFileChange, accept = ".pdf,.doc,.docx" }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFileChange(dropped);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
        isDragging
          ? "border-amber-400 bg-amber-50"
          : file
          ? "border-emerald-300 bg-emerald-50/40"
          : "border-border hover:border-amber-300 hover:bg-amber-50/30"
      }`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          if (e.target.files[0]) onFileChange(e.target.files[0]);
        }}
      />
      {file ? (
        <div className="flex flex-col items-center gap-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          <p className="text-sm font-medium text-foreground">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {(file.size / 1024 / 1024).toFixed(2)} MB — click to replace
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload className="w-8 h-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            Drop file here or click to browse
          </p>
          <p className="text-xs text-muted-foreground">PDF, DOC, or DOCX</p>
        </div>
      )}
    </div>
  );
}

export default function ManagerSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Path 1 — invite code
  const [inviteCode, setInviteCode] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");

  // Path 2 — multi-step wizard
  const [wizardStep, setWizardStep] = useState(1);
  const [agreementFile, setAgreementFile] = useState(null);
  const [authLetterFile, setAuthLetterFile] = useState(null);
  const [talentName, setTalentName] = useState("");
  const [talentEmail, setTalentEmail] = useState("");
  const [talentCategory, setTalentCategory] = useState("");
  const [talentBio, setTalentBio] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  // ── Path 1: connect via invite code/link ────────────────────────────────────
  const handleInviteConnect = async () => {
    if (!inviteCode.trim()) {
      setInviteError("Please enter an invite code or link.");
      return;
    }
    setInviteError("");
    setInviteLoading(true);

    try {
      // Extract code from full URL if pasted as link
      const code = inviteCode.includes("/")
        ? inviteCode.split("/").pop().trim()
        : inviteCode.trim();

      // Look up the invite in the talents table by invite_code field
      const { data: talent, error } = await supabase
        .from("talents")
        .select("id, name, email")
        .eq("invite_code", code)
        .maybeSingle();

      if (error) throw error;

      if (!talent) {
        setInviteError(
          "No talent account found for this code. Please check and try again."
        );
        setInviteLoading(false);
        return;
      }

      // Link manager to the talent
      await supabase
        .from("profiles")
        .update({ manager_of: talent.id })
        .eq("id", user.id);

      toast({
        title: "Connected!",
        description: `You are now connected as the manager for ${talent.name}.`,
      });

      navigate("/Dashboard");
    } catch (err) {
      console.error("Invite connect error:", err);
      setInviteError(err.message || "Something went wrong. Please try again.");
    } finally {
      setInviteLoading(false);
    }
  };

  // ── Path 2: wizard step navigation ──────────────────────────────────────────
  const canProceedStep1 = agreementFile || authLetterFile;
  const canProceedStep2 =
    talentName.trim() && talentEmail.trim() && talentCategory;

  const handleWizardSubmit = async () => {
    setSubmitLoading(true);
    try {
      const userId = user?.id;

      // 1. Upload verification document(s) to Supabase Storage
      let verificationFilePath = null;
      const fileToUpload = agreementFile || authLetterFile;
      if (fileToUpload) {
        const safeName = fileToUpload.name.replace(/\s+/g, "_");
        const storagePath = `manager-verification/${userId}/${Date.now()}_${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from("manager-verification")
          .upload(storagePath, fileToUpload);
        if (uploadError) throw uploadError;
        verificationFilePath = storagePath;
      }

      // 2. Create the talent profile in the talents table
      const { data: newTalent, error: talentError } = await supabase
        .from("talents")
        .insert({
          name: talentName.trim(),
          email: talentEmail.trim(),
          category: talentCategory,
          bio: talentBio.trim() || null,
          status: "pending",
          created_by_manager: userId,
        })
        .select("id")
        .single();

      if (talentError) throw talentError;

      // 3. Update the manager's profile with the talent linkage and verification status
      await supabase
        .from("profiles")
        .update({
          manager_of: newTalent.id,
          manager_verification_status: "pending",
          manager_verification_file: verificationFilePath,
        })
        .eq("id", userId);

      toast({
        title: "Profile created",
        description: `A confirmation email will be sent to ${talentEmail}.`,
      });

      navigate("/Dashboard");
    } catch (err) {
      console.error("Manager setup error:", err);
      toast({
        title: "Setup failed",
        description:
          err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 mb-4">
            <UserCheck className="w-7 h-7 text-amber-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Set Up Your Manager Account
          </h1>
          <p className="mt-2 text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            Choose how to connect with your talent. You can enter an invite code
            they shared, or create their profile directly.
          </p>
        </div>

        {/* Two-path cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* ── PATH 1: Invite code ─────────────────────────────────────────── */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center">
                  <Link2 className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">
                    I have an invite
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className="text-[10px] text-indigo-600 border-indigo-200 bg-indigo-50 mt-0.5"
                  >
                    Path 1
                  </Badge>
                </div>
              </div>
              <CardDescription className="text-sm leading-relaxed">
                Your talent sent you an invite link or code. Enter it here to
                connect your accounts instantly.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="invite-code">Invite code or link</Label>
                <Input
                  id="invite-code"
                  placeholder="e.g. ABC123 or https://partneriq.com/invite/ABC123"
                  value={inviteCode}
                  onChange={(e) => {
                    setInviteCode(e.target.value);
                    if (inviteError) setInviteError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleInviteConnect();
                  }}
                />
                {inviteError && (
                  <div className="flex items-center gap-1.5 text-red-600 text-xs mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {inviteError}
                  </div>
                )}
              </div>

              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                onClick={handleInviteConnect}
                disabled={inviteLoading}
              >
                {inviteLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                {inviteLoading ? "Connecting..." : "Connect"}
              </Button>

              <p className="text-xs text-muted-foreground text-center pt-1">
                Ask your talent to share their invite link from their Dashboard.
              </p>
            </CardContent>
          </Card>

          {/* ── PATH 2: Multi-step wizard ───────────────────────────────────── */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">
                    Set up talent profile
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className="text-[10px] text-amber-700 border-amber-200 bg-amber-50 mt-0.5"
                  >
                    Path 2
                  </Badge>
                </div>
              </div>
              <CardDescription className="text-sm leading-relaxed">
                Create a profile on behalf of your talent. You will need to
                upload authorization documents and your talent will confirm via
                email.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <WizardStepIndicator currentStep={wizardStep} />

              {/* ── Step 1: Verification documents ─────────────────────── */}
              {wizardStep === 1 && (
                <div className="space-y-5">
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Upload a management agreement or power of attorney to
                      verify your authority to act on behalf of your talent. Your
                      document will be reviewed by our team.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                      Management Agreement
                    </Label>
                    <DocumentDropZone
                      file={agreementFile}
                      onFileChange={setAgreementFile}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground font-medium">
                      OR
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
                      Power of Attorney / Authorization Letter
                    </Label>
                    <DocumentDropZone
                      file={authLetterFile}
                      onFileChange={setAuthLetterFile}
                    />
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    Documents are encrypted and only accessed by our compliance
                    team.
                  </p>

                  <Button
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white gap-2"
                    onClick={() => setWizardStep(2)}
                    disabled={!canProceedStep1}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* ── Step 2: Talent information ──────────────────────────── */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="talent-name" className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                      Talent&apos;s full legal name
                      <span className="text-red-500 text-xs ml-0.5">*</span>
                    </Label>
                    <Input
                      id="talent-name"
                      placeholder="Full legal name"
                      value={talentName}
                      onChange={(e) => setTalentName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="talent-email" className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                      Talent&apos;s email address
                      <span className="text-red-500 text-xs ml-0.5">*</span>
                    </Label>
                    <Input
                      id="talent-email"
                      type="email"
                      placeholder="talent@example.com"
                      value={talentEmail}
                      onChange={(e) => setTalentEmail(e.target.value)}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      We will send a confirmation email to this address.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-muted-foreground" />
                      Talent category
                      <span className="text-red-500 text-xs ml-0.5">*</span>
                    </Label>
                    <Select
                      value={talentCategory}
                      onValueChange={setTalentCategory}
                    >
                      <SelectTrigger id="talent-category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {TALENT_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat.toLowerCase()}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="talent-bio">
                      Talent bio{" "}
                      <span className="text-muted-foreground font-normal text-xs">
                        (optional)
                      </span>
                    </Label>
                    <Textarea
                      id="talent-bio"
                      placeholder="A short bio describing your talent's background, expertise, and audience..."
                      value={talentBio}
                      onChange={(e) => setTalentBio(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      className="flex-1 gap-1.5"
                      onClick={() => setWizardStep(1)}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </Button>
                    <Button
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white gap-2"
                      onClick={() => setWizardStep(3)}
                      disabled={!canProceedStep2}
                    >
                      Review
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* ── Step 3: Confirmation ─────────────────────────────────── */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-muted/30 divide-y divide-border">
                    {/* Document */}
                    <div className="flex items-start gap-3 p-4">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                          Verification Document
                        </p>
                        <p className="text-sm text-foreground font-medium">
                          {(agreementFile || authLetterFile)?.name || "No file"}
                        </p>
                        <Badge
                          variant="outline"
                          className="text-[10px] mt-1 text-amber-700 border-amber-200 bg-amber-50"
                        >
                          Pending review
                        </Badge>
                      </div>
                    </div>

                    {/* Talent name */}
                    <div className="flex items-start gap-3 p-4">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                          Talent Name
                        </p>
                        <p className="text-sm text-foreground font-medium">
                          {talentName}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {talentCategory}
                        </p>
                      </div>
                    </div>

                    {/* Talent email */}
                    <div className="flex items-start gap-3 p-4">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                          Confirmation Email
                        </p>
                        <p className="text-sm text-foreground font-medium">
                          {talentEmail}
                        </p>
                      </div>
                    </div>

                    {/* Bio (if provided) */}
                    {talentBio && (
                      <div className="flex items-start gap-3 p-4">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                            Bio
                          </p>
                          <p className="text-sm text-foreground leading-relaxed">
                            {talentBio}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* What happens next */}
                  <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 space-y-2">
                    <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                      What happens next
                    </p>
                    <ul className="space-y-1.5">
                      {[
                        `A verification email will be sent to ${talentEmail}`,
                        "Your manager access will be active once your talent confirms",
                        "Our team will review your document within 1–2 business days",
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-indigo-900">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      className="flex-1 gap-1.5"
                      onClick={() => setWizardStep(2)}
                      disabled={submitLoading}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </Button>
                    <Button
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white gap-2"
                      onClick={handleWizardSubmit}
                      disabled={submitLoading}
                    >
                      {submitLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <UserCheck className="w-4 h-4" />
                      )}
                      {submitLoading ? "Creating..." : "Create Talent Profile"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer note */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          You can also complete this setup later from your Dashboard settings.
        </p>
      </div>
    </div>
  );
}
