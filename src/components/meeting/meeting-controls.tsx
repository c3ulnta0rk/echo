import { Mic, Square } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useMeetingStore } from "@/stores/meeting-store";

export function formatElapsed(ms: number): string {
  const totalSecs = Math.floor(ms / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface MeetingControlsProps {
  onStarted?: () => void;
}

export const MeetingControls = ({ onStarted }: MeetingControlsProps) => {
  const status = useMeetingStore((s) => s.status);
  const elapsedMs = useMeetingStore((s) => s.elapsedMs);
  const setElapsedMs = useMeetingStore((s) => s.setElapsedMs);
  const startMeeting = useMeetingStore((s) => s.startMeeting);
  const stopMeeting = useMeetingStore((s) => s.stopMeeting);
  const [title, setTitle] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const isRecording = status === "recording";
  const isProcessing = status === "processing";

  // Timer
  useEffect(() => {
    if (isRecording) {
      startTimeRef.current = Date.now() - elapsedMs;
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startTimeRef.current);
      }, 200);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, setElapsedMs, elapsedMs]);

  const handleStart = useCallback(async () => {
    try {
      await startMeeting(title || undefined);
      onStarted?.();
    } catch {
      toast.error("Failed to start meeting");
    }
  }, [startMeeting, title, onStarted]);

  const handleStop = useCallback(async () => {
    try {
      await stopMeeting();
    } catch {
      toast.error("Failed to stop meeting");
    }
  }, [stopMeeting]);

  if (isRecording || isProcessing) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="inline-block size-2.5 animate-pulse rounded-full bg-red-500" />
          <span className="font-mono text-sm">
            {isProcessing ? "Processing..." : formatElapsed(elapsedMs)}
          </span>
        </div>
        <Button
          disabled={isProcessing}
          onClick={handleStop}
          size="sm"
          variant="destructive"
        >
          <Square className="mr-1.5 size-3.5" />
          Stop Meeting
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <input
        className="h-9 rounded-md border border-border/40 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground/30"
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Meeting title (optional)"
        type="text"
        value={title}
      />
      <Button onClick={handleStart} size="sm">
        <Mic className="mr-1.5 size-3.5" />
        Start Meeting
      </Button>
    </div>
  );
};
