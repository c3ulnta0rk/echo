import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { MeetingSegment } from "@/lib/types";
import { MeetingSegmentItem } from "./meeting-segment";

interface MeetingTranscriptProps {
  autoScroll?: boolean;
  onSeek?: (ms: number) => void;
  segments: MeetingSegment[];
}

export const MeetingTranscript = ({
  segments,
  autoScroll = false,
  onSeek,
}: MeetingTranscriptProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(segments.length);

  useEffect(() => {
    if (
      autoScroll &&
      segments.length !== prevCountRef.current &&
      bottomRef.current
    ) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
    prevCountRef.current = segments.length;
  });

  if (segments.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
        No transcript segments yet
      </div>
    );
  }

  const uniqueSpeakers = new Set(segments.map((s) => s.speaker_label));
  const hasDiarization = uniqueSpeakers.size > 1;

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-0.5 p-2">
        {segments.map((seg) => (
          <MeetingSegmentItem
            key={seg.id || `${seg.start_ms}-${seg.speaker_label}`}
            onSeek={onSeek}
            segment={seg}
            showSpeaker={hasDiarization}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
};
