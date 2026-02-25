"use client";

import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import EchoFooter from "@/components/landing/footer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/vs/macwhisper")({
  head: () => ({
    meta: [
      {
        title: "Echo vs MacWhisper — Free Whisper App with Live Dictation",
      },
      {
        name: "description",
        content:
          "MacWhisper transcribes files. Echo types for you in real time — global shortcut, auto-paste into any app, Windows and Linux support. Free forever, open source.",
      },
      {
        property: "og:title",
        content: "Echo vs MacWhisper — Free Whisper App with Live Dictation",
      },
      {
        property: "og:description",
        content:
          "MacWhisper transcribes files. Echo types for you in real time — global shortcut, auto-paste into any app, Windows and Linux support. Free forever, open source.",
      },
    ],
  }),
  component: MacWhisperPage,
});

const COMPARISON_ROWS = [
  {
    feature: "Price",
    echo: "Free forever",
    competitor: "Free basic · $79.99 lifetime Pro · $8.99/mo",
    echoPositive: true,
  },
  {
    feature: "Primary Use Case",
    echo: "Real-time voice dictation (speak → types for you)",
    competitor: "File transcription (existing audio/video files)",
    echoPositive: false,
  },
  {
    feature: "Platforms",
    echo: "macOS, Windows, Linux",
    competitor: "macOS only",
    echoPositive: true,
  },
  {
    feature: "Open Source",
    echo: "MIT License — fully auditable",
    competitor: "Proprietary closed source",
    echoPositive: true,
  },
  {
    feature: "Account Required",
    echo: "Never",
    competitor: "Not required",
    echoPositive: false,
  },
  {
    feature: "Global Shortcut / Auto-Paste",
    echo: "Yes — speak, it types in any app",
    competitor: "No global dictation shortcut",
    echoPositive: true,
  },
  {
    feature: "Voice Activity Detection",
    echo: "Yes — auto-detects speech start/stop",
    competitor: "Manual recording",
    echoPositive: true,
  },
  {
    feature: "LLM Post-Processing",
    echo: "Optional AI refinement",
    competitor: "Not available",
    echoPositive: true,
  },
  {
    feature: "File Transcription",
    echo: "Supported",
    competitor: "Yes — batch file processing",
    echoPositive: false,
  },
  {
    feature: "Export Formats (SRT/VTT/docx)",
    echo: "Not available",
    competitor: "Yes — SRT, VTT, docx, PDF",
    echoPositive: false,
  },
  {
    feature: "Speaker Diarization",
    echo: "Not yet",
    competitor: "Yes (Pro)",
    echoPositive: false,
  },
  {
    feature: "100+ Languages",
    echo: "Yes — Whisper supports 100+",
    competitor: "Yes — 100+ languages",
    echoPositive: false,
  },
];

const WIN_CARDS = [
  {
    title: "Built for Dictation, Not Transcription",
    description:
      "MacWhisper excels at converting existing audio files into text. Echo is built for the opposite workflow: you press a shortcut, speak, and it types directly into whatever app is in front of you — email, code editor, document, chat.",
    icon: "◈",
  },
  {
    title: "Cross-Platform and Free",
    description:
      "MacWhisper is macOS-only and costs up to $79.99 for Pro. Echo is free forever and runs on macOS, Windows, and Linux. If you use more than one operating system, Echo is the only choice.",
    icon: "⊕",
  },
  {
    title: "Open Source Transparency",
    description:
      "MacWhisper is closed source. Echo is MIT-licensed — every line of code is publicly auditable. You can see exactly how your audio is handled, contribute improvements, or fork the project entirely.",
    icon: "◎",
  },
];

function ComparisonTable() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      initial={{ opacity: 0, y: 24 }}
      ref={ref}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="overflow-hidden rounded-2xl border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-border border-b">
              <th className="px-6 py-4 text-left font-display font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                Feature
              </th>
              <th className="bg-brand/10 px-6 py-4 text-left font-display font-semibold text-foreground text-xs uppercase tracking-wider">
                Echo
              </th>
              <th className="px-6 py-4 text-left font-display font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                MacWhisper
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row, index) => (
              <tr
                className={`border-border border-b last:border-0 ${index % 2 === 0 ? "bg-background" : "bg-card/40"}`}
                key={row.feature}
              >
                <td className="px-6 py-4 font-medium text-foreground">
                  {row.feature}
                </td>
                <td className="bg-brand/5 px-6 py-4">
                  {row.echoPositive ? (
                    <span className="font-medium text-foreground">
                      <span className="mr-1.5 text-green-600 dark:text-green-400">
                        ✓
                      </span>
                      {row.echo}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      <span className="mr-1.5">—</span>
                      {row.echo}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {row.echoPositive ? (
                    <>
                      <span className="mr-1.5 text-destructive">✗</span>
                      {row.competitor}
                    </>
                  ) : (
                    <>
                      <span className="mr-1.5 text-green-600 dark:text-green-400">
                        ✓
                      </span>
                      {row.competitor}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function WinCards() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div className="grid gap-6 md:grid-cols-3" ref={ref}>
      {WIN_CARDS.map((card, index) => (
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          initial={{ opacity: 0, y: 24 }}
          key={card.title}
          transition={{
            duration: 0.5,
            delay: index * 0.1,
            ease: "easeOut",
          }}
        >
          <div className="flex h-full flex-col rounded-2xl border border-border/60 bg-card p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 font-display text-foreground text-lg">
              {card.icon}
            </div>
            <h3 className="mb-2 font-bold font-display text-foreground text-lg tracking-tight">
              {card.title}
            </h3>
            <p className="flex-1 font-body text-muted-foreground text-sm leading-relaxed">
              {card.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function MacWhisperPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <main className="pt-24">
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-4 pt-16 pb-12">
          <motion.div
            animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            initial={{ opacity: 0, y: 24 }}
            ref={heroRef}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="mb-5 inline-block rounded-full border border-brand/30 bg-brand/10 px-3 py-1 font-body text-foreground text-sm">
              Echo vs MacWhisper
            </span>
            <h1 className="mb-6 max-w-3xl font-bold font-display text-[clamp(2rem,4.5vw,3.25rem)] text-foreground leading-tight tracking-[-0.03em]">
              Real-time dictation,{" "}
              <span className="font-display font-light text-muted-foreground italic">
                not just file transcription
              </span>
            </h1>
            <p className="mb-4 max-w-2xl font-body text-base text-muted-foreground leading-relaxed">
              MacWhisper is excellent at transcribing audio and video files —
              4.7 stars and 1,500+ App Store reviews prove it. But if you want
              to speak and have it type in your email, code editor, or document,
              that's a different tool. That's Echo.
            </p>
            <p className="mb-8 max-w-2xl rounded-xl border border-border/60 bg-card px-5 py-3 font-body text-muted-foreground text-sm italic leading-relaxed">
              If you need to transcribe recordings, MacWhisper is excellent. If
              you want to type with your voice in real time, use Echo.
            </p>
            <Button asChild size="lg">
              <Link hash="download" to="/">
                Download Echo Free
              </Link>
            </Button>
          </motion.div>
        </section>

        {/* Quick wins bar */}
        <section className="border-border border-y bg-card/40 py-5">
          <div className="mx-auto max-w-5xl px-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-body font-semibold text-muted-foreground text-sm">
                Echo wins on:
              </span>
              {[
                "✓ Free Forever",
                "✓ Live Dictation",
                "✓ Auto-Paste",
                "✓ Windows + Linux",
                "✓ Open Source",
              ].map((badge) => (
                <span
                  className="rounded-full border border-brand/25 bg-brand/10 px-3 py-1 font-body font-medium text-foreground text-xs"
                  key={badge}
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison table */}
        <section className="mx-auto max-w-5xl px-4 py-16">
          <motion.h2
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 font-bold font-display text-2xl text-foreground tracking-tight md:text-3xl"
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.5 }}
          >
            Feature by feature
          </motion.h2>
          <ComparisonTable />
        </section>

        {/* Why Echo */}
        <section className="mx-auto max-w-5xl px-4 pb-16">
          <motion.h2
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 font-bold font-display text-2xl text-foreground tracking-tight md:text-3xl"
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.5 }}
          >
            Why Echo for daily voice dictation
          </motion.h2>
          <WinCards />
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-5xl px-4 pb-24">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 rounded-2xl border border-border/60 bg-card px-8 py-14 text-center"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="font-bold font-display text-2xl text-foreground tracking-tight md:text-3xl">
              Ready to switch?
            </h2>
            <p className="max-w-sm font-body text-muted-foreground text-sm">
              No account. No cloud. Free forever.
            </p>
            <Button asChild className="mt-2" size="lg">
              <Link hash="download" to="/">
                Download Echo Free
              </Link>
            </Button>
            <p className="font-body text-muted-foreground text-xs">
              Free forever · MIT License ·{" "}
              <a
                className="hover:underline"
                href="https://github.com/damien-schneider/Echo"
                rel="noopener noreferrer"
                target="_blank"
              >
                Open source on GitHub
              </a>
            </p>
          </motion.div>
        </section>
      </main>
      <EchoFooter />
    </div>
  );
}
