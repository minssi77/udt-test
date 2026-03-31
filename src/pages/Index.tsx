/* Copyright 2026 NUREUM Labs (JIHO MIN). All rights reserved. ButtonNureum@gmail.com */
import { useState, useCallback, useEffect, useRef } from "react";
import { Play, Square, Pause } from "lucide-react";
import ScoreTable, { type Mode } from "@/components/ScoreTable";

const AUDIO_FILES: Record<Mode, string> = {
  pushup: "/audio/UDT_P.m4a",
  pullup: "/audio/UDT_P.m4a",
  situp: "/audio/UDT_S.m4a",
};

const MODE_LABELS: Record<Mode, { ko: string; en: string }> = {
  pushup: { ko: "팔굽혀펴기", en: "PUSH-UP" },
  pullup: { ko: "턱걸이", en: "PULL-UP" },
  situp: { ko: "윗몸일으키기", en: "SIT-UP" },
};

const formatTime = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const Index = () => {
  const [mode, setMode] = useState<Mode>("pushup");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initial sync
    document.title = "해군 특수전전단 체력평가";
    // Robust sync with small delay to overcome HMR or race conditions
    const timeout = setTimeout(() => {
      document.title = "해군 특수전전단 체력평가";
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (isPlaying && !isPaused && audioRef.current) {
      const checkInterval = setInterval(() => {
        const audio = audioRef.current;
        if (!audio) return;
        setElapsed(audio.currentTime);
      }, 50);
      return () => clearInterval(checkInterval);
    }
  }, [isPlaying, isPaused]);

  const handleStart = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setElapsed(0);
    setIsPlaying(true);
    setIsPaused(false);

    const audio = new Audio(AUDIO_FILES[mode]);
    audioRef.current = audio;

    audio.play().catch((err) => {
      console.error("Audio play failed:", err);
      setIsPlaying(false);
    });

    audio.onended = () => {
      setIsPlaying(false);
      setIsPaused(false);
      audioRef.current = null;
    };
  }, [mode]);

  const handleStop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
    setIsPaused(false);
    setElapsed(0);
  }, []);

  const handlePauseResume = useCallback(() => {
    if (!isPlaying || !audioRef.current) return;
    if (isPaused) {
      audioRef.current.play();
      setIsPaused(false);
    } else {
      audioRef.current.pause();
      setIsPaused(true);
    }
  }, [isPlaying, isPaused]);

  const handleModeChange = useCallback(
    (newMode: Mode) => {
      if (isPlaying) handleStop();
      setMode(newMode);
    },
    [isPlaying, handleStop]
  );

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          wakeLock = await (navigator as any).wakeLock.request("screen");
        }
      } catch (err) {
        console.error("Wake Lock error:", err);
      }
    };
    requestWakeLock();

    const handleVisibilityChange = () => {
      if (wakeLock !== null && document.visibilityState === "visible") {
        requestWakeLock();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (wakeLock) {
        wakeLock.release().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background military-stripe pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      {/* Header */}
      <header className="border-b border-border px-4 py-4 text-center">
        <div className="mx-auto max-w-md">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Naval Special Warfare Flotilla
          </p>
          <div className="flex items-baseline justify-center gap-2">
            <h1 className="font-display mt-1 text-lg font-bold uppercase tracking-wider text-foreground">
              해군 특수전전단 체력평가
            </h1>
          </div>
          <div className="mt-2 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>
      </header>

      {/* Status bar */}
      <div className="relative flex items-center justify-center px-4 py-2 border-b border-border bg-card">
        <span className="font-display text-sm font-semibold tracking-wider text-primary glow-olive">
          {MODE_LABELS[mode].ko}
        </span>
        <div className="absolute right-4 flex items-center gap-3">
          <span className="font-display text-lg tracking-widest text-muted-foreground tabular-nums">
            {formatTime(elapsed)}
          </span>
          <div className="flex items-center gap-1.5">
            <div
              className={`h-2 w-2 rounded-full ${
                isPlaying && !isPaused
                  ? "bg-primary animate-pulse-glow"
                  : isPaused
                  ? "bg-yellow-500"
                  : "bg-muted-foreground/40"
              }`}
            />
            <span className="font-body text-xs uppercase tracking-widest text-muted-foreground">
              {isPlaying && !isPaused ? "진행 중" : isPaused ? "일시정지" : "대기"}
            </span>
          </div>
        </div>
      </div>

      {/* Main: Score Table */}
      <main className="flex-1 overflow-y-auto px-3 py-4 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <ScoreTable mode={mode} />
        </div>
      </main>

      {/* Bottom Controls */}
      <footer className="border-t border-border bg-card px-4 pb-6 pt-4">
        <div className="mx-auto max-w-sm space-y-4">
          {/* Mode Selector - 3 buttons */}
          <div className="flex gap-2">
            {(["pushup", "pullup", "situp"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => handleModeChange(m)}
                className={`font-display flex-1 rounded-md border py-3 text-sm font-semibold uppercase tracking-wider transition-all ${
                  mode === m
                    ? "border-primary bg-primary text-primary-foreground glow-border"
                    : "border-border bg-secondary text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {MODE_LABELS[m].ko}
              </button>
            ))}
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-4">
            {!isPlaying ? (
              <button
                onClick={handleStart}
                className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 glow-border"
                aria-label="실행"
              >
                <Play className="ml-0.5 h-6 w-6" fill="currentColor" />
              </button>
            ) : (
              <>
                <button
                  onClick={handlePauseResume}
                  className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-border bg-secondary text-foreground transition-transform hover:scale-105 hover:border-primary/50 active:scale-95"
                  aria-label={isPaused ? "재개" : "일시정지"}
                >
                  {isPaused ? (
                    <Play className="ml-0.5 h-6 w-6" fill="currentColor" />
                  ) : (
                    <Pause className="h-6 w-6" />
                  )}
                </button>
                <button
                  onClick={handleStop}
                  className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-destructive/50 bg-destructive/10 text-destructive transition-transform hover:scale-105 hover:bg-destructive/20 active:scale-95"
                  aria-label="정지"
                >
                  <Square className="h-5 w-5" fill="currentColor" />
                </button>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
