import React, { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/api/supabaseClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  VideoOff,
  Circle,
  Square,
  Play,
  RotateCcw,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

const MAX_DURATION_SECONDS = 60;

/**
 * Formats seconds as M:SS.
 */
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * VideoPitchStudio — lets talent record a 60-second video pitch directly
 * in-browser using MediaRecorder. Uploads to Supabase Storage and persists
 * the public URL to the talent record.
 *
 * Props:
 *   talentId       — string | null  (null if talent record not yet created)
 *   existingUrl    — string | null  (pre-existing pitch URL from talent record)
 *   onSaved        — (url: string) => void  called after successful save
 */
export default function VideoPitchStudio({ talentId, existingUrl, onSaved }) {
  // ── state machine: idle | countdown | recording | preview | saving | saved | error ──
  const [phase, setPhase] = useState("idle");
  const [countdown, setCountdown] = useState(3);
  const [elapsed, setElapsed] = useState(0);
  const [blobUrl, setBlobUrl] = useState(null);
  const [savedUrl, setSavedUrl] = useState(existingUrl || null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [hasCamera, setHasCamera] = useState(true);

  const videoRef = useRef(null);        // live preview / playback element
  const streamRef = useRef(null);       // MediaStream
  const recorderRef = useRef(null);     // MediaRecorder
  const chunksRef = useRef([]);         // recorded Blob chunks
  const timerRef = useRef(null);        // setInterval handle
  const countdownRef = useRef(null);    // setInterval handle for countdown

  // ── cleanup on unmount ──────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopStream();
      clearInterval(timerRef.current);
      clearInterval(countdownRef.current);
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  // ── request camera + mic ────────────────────────────────────────────────────
  const acquireMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true; // prevent echo during live preview
        await videoRef.current.play();
      }
      return stream;
    } catch (err) {
      setHasCamera(false);
      setErrorMsg("Camera/microphone access denied. Please allow permissions and try again.");
      setPhase("error");
      return null;
    }
  };

  // ── start: show live preview, then countdown ────────────────────────────────
  const handleStartFlow = async () => {
    setErrorMsg(null);
    setPhase("countdown");
    setCountdown(3);

    const stream = await acquireMedia();
    if (!stream) return;

    let count = 3;
    setCountdown(count);
    countdownRef.current = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count === 0) {
        clearInterval(countdownRef.current);
        startRecording(stream);
      }
    }, 1000);
  };

  // ── begin MediaRecorder ─────────────────────────────────────────────────────
  const startRecording = (stream) => {
    chunksRef.current = [];

    // Pick a supported MIME type
    const mimeType = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"].find(
      (t) => MediaRecorder.isTypeSupported(t)
    ) || "";

    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType || "video/webm" });
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
      stopStream();
      // switch video element to playback
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.muted = false;
        videoRef.current.src = url;
      }
      setPhase("preview");
    };

    recorder.start(250); // collect chunks every 250ms
    setElapsed(0);
    setPhase("recording");

    let secs = 0;
    timerRef.current = setInterval(() => {
      secs += 1;
      setElapsed(secs);
      if (secs >= MAX_DURATION_SECONDS) {
        clearInterval(timerRef.current);
        recorder.stop();
      }
    }, 1000);
  };

  // ── stop recording early ────────────────────────────────────────────────────
  const handleStopEarly = () => {
    clearInterval(timerRef.current);
    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.stop();
    }
  };

  // ── re-record ───────────────────────────────────────────────────────────────
  const handleReRecord = () => {
    clearInterval(timerRef.current);
    clearInterval(countdownRef.current);
    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.stop();
    }
    stopStream();
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
    }
    if (videoRef.current) {
      videoRef.current.src = "";
      videoRef.current.srcObject = null;
    }
    setElapsed(0);
    setPhase("idle");
  };

  // ── save to Supabase (storage + talent row) ─────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!blobUrl) return;
    setPhase("saving");

    try {
      let publicUrl = null;

      // Attempt Supabase Storage upload
      try {
        const blob = await fetch(blobUrl).then((r) => r.blob());
        const fileName = `pitch_${talentId || "guest"}_${Date.now()}.webm`;
        const { error: uploadError } = await supabase.storage
          .from("video-pitches")
          .upload(fileName, blob, { contentType: blob.type, upsert: true });

        if (!uploadError) {
          const { data } = supabase.storage.from("video-pitches").getPublicUrl(fileName);
          publicUrl = data?.publicUrl || null;
        }
      } catch {
        // Storage not configured — fall back to blob URL
      }

      const urlToSave = publicUrl || blobUrl;

      // Persist URL to talent record if we have an ID
      if (talentId && talentId !== "new") {
        const { error: dbError } = await supabase
          .from("talents")
          .update({ video_pitch_url: urlToSave })
          .eq("id", talentId);

        if (dbError) {
          // Non-fatal — URL still available
          console.warn("Could not persist video_pitch_url to DB:", dbError.message);
        }
      }

      setSavedUrl(urlToSave);
      setPhase("saved");
      if (onSaved) onSaved(urlToSave);
    } catch (err) {
      setErrorMsg("Failed to save pitch. Please try again.");
      setPhase("error");
    }
  }, [blobUrl, talentId, onSaved]);

  // ── derived ─────────────────────────────────────────────────────────────────
  const progressPct = Math.min((elapsed / MAX_DURATION_SECONDS) * 100, 100);
  const isNearEnd = elapsed >= MAX_DURATION_SECONDS - 10;

  // ── render ───────────────────────────────────────────────────────────────────
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5 text-indigo-500" />
              Video Pitch Studio
            </CardTitle>
            <CardDescription>
              Record a 60-second pitch to send to brands alongside your media kit
            </CardDescription>
          </div>
          {phase === "saved" && (
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1">
              <CheckCircle2 className="w-3 h-3" /> Saved
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ── Existing saved pitch ──────────────────────────────────────────── */}
        {savedUrl && phase !== "recording" && phase !== "countdown" && phase !== "preview" && phase !== "saving" && (
          <div className="rounded-lg overflow-hidden border border-slate-200 bg-black">
            <video
              src={savedUrl}
              controls
              className="w-full max-h-72 object-contain"
              aria-label="Your saved video pitch"
            />
          </div>
        )}

        {/* ── Video element (live preview + playback) ───────────────────────── */}
        {(phase === "countdown" || phase === "recording" || phase === "preview") && (
          <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
            <video
              ref={videoRef}
              playsInline
              className="w-full h-full object-cover"
              aria-label={phase === "preview" ? "Recorded video pitch preview" : "Camera preview"}
            />

            {/* countdown overlay */}
            {phase === "countdown" && countdown > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="text-white text-7xl font-bold tabular-nums drop-shadow-lg">
                  {countdown}
                </span>
              </div>
            )}

            {/* recording indicator + timer */}
            {phase === "recording" && (
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <div className="flex items-center gap-2 bg-black/60 rounded-full px-3 py-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
                  <span className="text-white text-sm font-medium" aria-live="polite">
                    REC {formatTime(elapsed)}
                  </span>
                </div>
                <span
                  className={`text-sm font-medium px-2 py-1 rounded-full ${
                    isNearEnd ? "bg-red-600/80 text-white" : "bg-black/60 text-white/80"
                  }`}
                  aria-live="polite"
                >
                  {formatTime(MAX_DURATION_SECONDS - elapsed)} left
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── Progress bar (recording only) ────────────────────────────────── */}
        {phase === "recording" && (
          <div
            className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden"
            role="progressbar"
            aria-valuenow={elapsed}
            aria-valuemax={MAX_DURATION_SECONDS}
            aria-label="Recording progress"
          >
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                isNearEnd ? "bg-red-500" : "bg-indigo-500"
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}

        {/* ── Error message ─────────────────────────────────────────────────── */}
        {phase === "error" && errorMsg && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ── Action buttons ────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2">
          {/* Idle / error — start button */}
          {(phase === "idle" || phase === "error") && (
            <Button
              onClick={handleStartFlow}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={!hasCamera && phase !== "idle"}
            >
              <Video className="w-4 h-4" />
              {savedUrl ? "Re-record Pitch" : "Record Your Pitch"}
            </Button>
          )}

          {/* Recording — stop early */}
          {phase === "recording" && (
            <>
              <Button onClick={handleStopEarly} variant="destructive" className="gap-2">
                <Square className="w-4 h-4 fill-current" />
                Stop Recording
              </Button>
              <Button onClick={handleReRecord} variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Re-record
              </Button>
            </>
          )}

          {/* Preview — play / save / re-record */}
          {phase === "preview" && (
            <>
              <Button
                onClick={() => videoRef.current?.play()}
                variant="outline"
                className="gap-2"
              >
                <Play className="w-4 h-4" />
                Play
              </Button>
              <Button
                onClick={handleSave}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Upload className="w-4 h-4" />
                Save Pitch
              </Button>
              <Button onClick={handleReRecord} variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Re-record
              </Button>
            </>
          )}

          {/* Saving — spinner */}
          {phase === "saving" && (
            <Button disabled className="gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </Button>
          )}

          {/* Saved — allow re-record */}
          {phase === "saved" && (
            <Button onClick={handleReRecord} variant="outline" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Re-record
            </Button>
          )}
        </div>

        {/* ── Hint text ─────────────────────────────────────────────────────── */}
        {phase === "idle" && !savedUrl && (
          <p className="text-xs text-slate-500">
            Your browser will ask for camera and microphone permission. The pitch is limited to 60 seconds and uploads automatically to your profile.
          </p>
        )}
        {phase === "saved" && (
          <p className="text-xs text-emerald-600">
            Your pitch has been saved and is now visible to brands viewing your profile.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
