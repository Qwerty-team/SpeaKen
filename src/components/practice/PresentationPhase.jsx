import React, { useEffect, useRef, useState } from "react";
import { Video, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function PresentationPhase({ session, onComplete, analyzing }) {
  const limitSeconds = (session?.speaking_time_limit || 3) * 60;
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const stoppedRef = useRef(false);

  const [elapsed, setElapsed] = useState(0);
  const [permissionError, setPermissionError] = useState("");
  const [recording, setRecording] = useState(false);

  const stopAndAnalyze = () => {
    if (stoppedRef.current) return;
    stoppedRef.current = true;
    mediaRecorderRef.current?.stop();
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }

        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        chunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        recorder.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          onComplete(blob, Math.min(elapsedRef.current, limitSeconds));
        };

        recorder.start();
        setRecording(true);
      } catch (err) {
        setPermissionError(
          "Couldn't access your camera/microphone. Check browser permissions and try again."
        );
      }
    })();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep a ref mirror of elapsed so the recorder's onstop (captured once)
  // can read the latest value without re-creating the MediaRecorder.
  const elapsedRef = useRef(0);
  useEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);

  useEffect(() => {
    if (!recording) return;
    if (elapsed >= limitSeconds) {
      stopAndAnalyze();
      return;
    }
    const id = setTimeout(() => setElapsed((e) => e + 1), 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, recording, limitSeconds]);

  if (!session) return null;

  const progressPct = Math.min(100, (elapsed / limitSeconds) * 100);

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 text-center">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-foreground">
        <Video className="h-3.5 w-3.5" /> Presentation
      </span>
      <h1 className="mt-3 font-heading text-2xl font-bold text-foreground sm:text-3xl">
        {session.topic}
      </h1>
      <p className="mt-1 text-primary/80">
        Present in {session.language} — don't read a script.
      </p>

      <div className="relative mx-auto mt-6 aspect-video w-full overflow-hidden rounded-3xl bg-primary">
        <video ref={videoRef} className="h-full w-full object-cover" playsInline />
        {permissionError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-primary p-6 text-sm text-primary-foreground">
            {permissionError}
          </div>
        ) : (
          <>
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-foreground/80 px-2.5 py-1 text-xs font-semibold text-background">
              <span className="h-2 w-2 rounded-full bg-red-500" /> REC
            </span>
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-foreground/80 px-3 py-1 text-sm font-semibold tabular-nums text-background">
              {formatTime(Math.max(limitSeconds - elapsed, 0))}
            </span>
          </>
        )}
      </div>

      <div className="mx-auto mt-3 h-1 w-full max-w-xl overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
      </div>

      <Button
        size="lg"
        className="mt-5 w-full"
        disabled={analyzing || !!permissionError}
        onClick={stopAndAnalyze}
      >
        {analyzing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Analyzing...
          </>
        ) : (
          <>
            <Square className="h-4 w-4" /> Stop & analyze
          </>
        )}
      </Button>
      <p className="mt-2 text-xs text-stone-500">
        Spoken so far: {formatTime(elapsed)} of {formatTime(limitSeconds)}
      </p>
    </div>
  );
}
