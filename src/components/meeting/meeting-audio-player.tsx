import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import { Download, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatTime(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface MeetingAudioPlayerProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  meetingId: number;
  meetingTitle?: string;
}

export const MeetingAudioPlayer = ({
  meetingId,
  meetingTitle,
  audioRef,
}: MeetingAudioPlayerProps) => {
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const loadAudio = async () => {
      const path = await invoke<string | null>("get_meeting_audio_path", {
        meetingId,
      });
      if (!cancelled && path) {
        setAudioSrc(convertFileSrc(path, "asset"));
      }
    };
    loadAudio();
    return () => {
      cancelled = true;
    };
  }, [meetingId]);

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    setCurrentTime(e.currentTarget.currentTime);
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    setDuration(e.currentTarget.duration);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const bar = progressRef.current;
    if (!(audio && bar) || duration === 0) {
      return;
    }

    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width)
    );
    audio.currentTime = ratio * duration;
  };

  if (!audioSrc) {
    return null;
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/20 px-3 py-2">
      <audio
        onEnded={() => setIsPlaying(false)}
        onLoadedMetadata={handleLoadedMetadata}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onTimeUpdate={handleTimeUpdate}
        preload="metadata"
        ref={audioRef}
        src={audioSrc}
      >
        <track kind="captions" />
      </audio>

      <Button
        className="size-7 shrink-0"
        onClick={togglePlay}
        size="icon"
        variant="ghost"
      >
        {isPlaying ? (
          <Pause className="size-3.5" />
        ) : (
          <Play className="size-3.5" />
        )}
      </Button>

      <span className="shrink-0 font-mono text-muted-foreground text-xs">
        {formatTime(currentTime)}
      </span>

      <div
        aria-label="Audio progress"
        aria-valuemax={duration}
        aria-valuemin={0}
        aria-valuenow={currentTime}
        className="relative h-1.5 flex-1 cursor-pointer rounded-full bg-foreground/10"
        onClick={handleProgressClick}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" && audioRef.current) {
            audioRef.current.currentTime = Math.min(duration, currentTime + 5);
          }
          if (e.key === "ArrowLeft" && audioRef.current) {
            audioRef.current.currentTime = Math.max(0, currentTime - 5);
          }
        }}
        ref={progressRef}
        role="slider"
        tabIndex={0}
      >
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-100"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      <span className="shrink-0 font-mono text-muted-foreground text-xs">
        {formatTime(duration)}
      </span>

      <Button
        className="size-7 shrink-0"
        onClick={async () => {
          const response = await fetch(audioSrc);
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${meetingTitle ?? "meeting"}.wav`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }}
        size="icon"
        title="Download audio"
        variant="ghost"
      >
        <Download className="size-3.5" />
      </Button>
    </div>
  );
};
