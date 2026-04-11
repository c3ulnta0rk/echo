import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useMeetingStore } from "@/stores/meeting-store";

interface MeetingSummaryProps {
  meetingId: number;
  summary: string | null | undefined;
}

export const MeetingSummary = ({ meetingId, summary }: MeetingSummaryProps) => {
  const [expanded, setExpanded] = useState(!!summary);
  const [generating, setGenerating] = useState(false);
  const generateSummary = useMeetingStore((s) => s.generateSummary);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateSummary(meetingId);
      setExpanded(true);
    } catch {
      toast.error("Failed to generate summary");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="rounded-lg border border-border/20">
      <button
        className="flex w-full items-center justify-between px-4 py-2.5 text-left"
        onClick={() => setExpanded(!expanded)}
        type="button"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-muted-foreground" />
          <span className="font-medium text-sm">Summary</span>
        </div>
        {expanded ? (
          <ChevronUp className="size-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="border-border/20 border-t px-4 py-3">
          {summary ? (
            <div className="whitespace-pre-wrap text-sm">{summary}</div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-4">
              <p className="text-muted-foreground text-sm">
                No summary generated yet
              </p>
              <Button
                disabled={generating}
                onClick={handleGenerate}
                size="sm"
                variant="outline"
              >
                <Sparkles className="mr-1.5 size-3.5" />
                {generating ? "Generating..." : "Generate Summary"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
