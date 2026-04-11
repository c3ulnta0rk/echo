import { describe, expect, it } from "bun:test";
import {
  ExportFormatSchema,
  MeetingSchema,
  MeetingSegmentSchema,
  MeetingStatusSchema,
} from "@/lib/types";
import { formatElapsed } from "./meeting-controls";

// ── formatElapsed ──────────────────────────────────────────────────────

describe("formatElapsed", () => {
  it("returns 00:00:00 for zero", () => {
    expect(formatElapsed(0)).toBe("00:00:00");
  });

  it("formats seconds only", () => {
    expect(formatElapsed(5000)).toBe("00:00:05");
  });

  it("formats minutes and seconds", () => {
    expect(formatElapsed(125_000)).toBe("00:02:05");
  });

  it("formats hours, minutes, and seconds", () => {
    expect(formatElapsed(3_661_000)).toBe("01:01:01");
  });

  it("truncates sub-second values", () => {
    expect(formatElapsed(1999)).toBe("00:00:01");
  });

  it("handles large values", () => {
    // 10 hours
    expect(formatElapsed(36_000_000)).toBe("10:00:00");
  });
});

// ── Zod schemas ────────────────────────────────────────────────────────

describe("MeetingStatusSchema", () => {
  it("accepts valid statuses", () => {
    for (const status of ["recording", "processing", "complete", "error"]) {
      expect(MeetingStatusSchema.safeParse(status).success).toBe(true);
    }
  });

  it("rejects invalid status", () => {
    expect(MeetingStatusSchema.safeParse("paused").success).toBe(false);
  });

  it("rejects non-string", () => {
    expect(MeetingStatusSchema.safeParse(42).success).toBe(false);
  });
});

describe("ExportFormatSchema", () => {
  it("accepts all export formats", () => {
    for (const format of ["srt", "vtt", "txt", "markdown"]) {
      expect(ExportFormatSchema.safeParse(format).success).toBe(true);
    }
  });

  it("rejects invalid format", () => {
    expect(ExportFormatSchema.safeParse("pdf").success).toBe(false);
  });
});

describe("MeetingSegmentSchema", () => {
  const validSegment = {
    id: 1,
    meeting_id: 1,
    speaker_label: "Alice",
    start_ms: 0,
    end_ms: 5000,
    text: "Hello world",
    confidence: 0.95,
    audio_source: "mic",
  };

  it("accepts a valid segment", () => {
    expect(MeetingSegmentSchema.safeParse(validSegment).success).toBe(true);
  });

  it("accepts null confidence", () => {
    expect(
      MeetingSegmentSchema.safeParse({ ...validSegment, confidence: null })
        .success
    ).toBe(true);
  });

  it("accepts missing confidence", () => {
    const { confidence: _, ...noConfidence } = validSegment;
    expect(MeetingSegmentSchema.safeParse(noConfidence).success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const { text: _, ...noText } = validSegment;
    expect(MeetingSegmentSchema.safeParse(noText).success).toBe(false);
  });

  it("rejects wrong field types", () => {
    expect(
      MeetingSegmentSchema.safeParse({ ...validSegment, start_ms: "zero" })
        .success
    ).toBe(false);
  });
});

describe("MeetingSchema", () => {
  const validMeeting = {
    id: 1,
    title: "Weekly Standup",
    start_time: 1_700_000_000,
    end_time: 1_700_001_800,
    duration_ms: 1_800_000,
    mic_file_name: "meeting-1-mic.wav",
    system_file_name: null,
    summary: "Key decisions made.",
    status: "complete",
  };

  it("accepts a valid meeting", () => {
    expect(MeetingSchema.safeParse(validMeeting).success).toBe(true);
  });

  it("accepts minimal meeting (only required fields)", () => {
    const minimal = {
      id: 1,
      title: "Standup",
      start_time: 1_700_000_000,
      status: "recording",
    };
    expect(MeetingSchema.safeParse(minimal).success).toBe(true);
  });

  it("rejects invalid status value", () => {
    expect(
      MeetingSchema.safeParse({ ...validMeeting, status: "paused" }).success
    ).toBe(false);
  });

  it("rejects missing title", () => {
    const { title: _, ...noTitle } = validMeeting;
    expect(MeetingSchema.safeParse(noTitle).success).toBe(false);
  });

  it("accepts null optional fields", () => {
    const withNulls = {
      ...validMeeting,
      end_time: null,
      duration_ms: null,
      mic_file_name: null,
      system_file_name: null,
      summary: null,
    };
    expect(MeetingSchema.safeParse(withNulls).success).toBe(true);
  });
});
