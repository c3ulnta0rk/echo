"use client";

import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import EchoFooter from "@/components/landing/footer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/vs/super-whisper")({
  head: () => ({
    meta: [
      {
        title: "Echo vs Super Whisper — Free Open-Source Alternative",
      },
      {
        name: "description",
        content:
          "Echo is a free, open-source alternative to Super Whisper. Works on macOS, Windows, and Linux — no $249 lifetime fee, no account, 100% offline.",
      },
      {
        property: "og:title",
        content: "Echo vs Super Whisper — Free Open-Source Alternative",
      },
      {
        property: "og:description",
        content:
          "Echo is a free, open-source alternative to Super Whisper. Works on macOS, Windows, and Linux — no $249 lifetime fee, no account, 100% offline.",
      },
    ],
  }),
  component: SuperWhisperPage,
});

const COMPARISON_ROWS = [
  {
    feature: "Price",
    echo: "Free forever",
    competitor: "$8.49/mo · $84.99/yr · $249.99 lifetime",
    echoPositive: true,
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
    competitor: "License required",
    echoPositive: true,
  },
  {
    feature: "Offline Processing",
    echo: "100% local — always offline",
    competitor: "Yes (local Whisper models)",
    echoPositive: false,
  },
  {
    feature: "Global Shortcut / Auto-Paste",
    echo: "Push-to-talk, pastes anywhere",
    competitor: "Yes — global shortcuts",
    echoPositive: false,
  },
  {
    feature: "LLM Post-Processing",
    echo: "Optional AI refinement",
    competitor: "Yes — included",
    echoPositive: false,
  },
  {
    feature: "100+ Languages",
    echo: "Yes — Whisper supports 100+",
    competitor: "Yes",
    echoPositive: false,
  },
  {
    feature: "Speaker Diarization",
    echo: "Not yet",
    competitor: "Yes",
    echoPositive: false,
  },
  {
    feature: "Custom Modes (coding/email)",
    echo: "Via LLM prompts",
    competitor: "Yes — dedicated mode system",
    echoPositive: false,
  },
  {
    feature: "Recording History Search",
    echo: "Not available",
    competitor: "Yes",
    echoPositive: false,
  },
  {
    feature: "iOS Companion App",
    echo: "Not available",
    competitor: "Yes",
    echoPositive: false,
  },
];

const WIN_CARDS = [
  {
    title: "Free Is Not a Compromise",
    description:
      "Super Whisper costs $249.99 for lifetime access — for software that runs locally on hardware you already own. Echo does the same core job for free, forever, under an MIT license anyone can audit.",
    icon: "∞",
  },
  {
    title: "Windows and Linux Support",
    description:
      "Super Whisper is macOS-exclusive. Echo runs natively on macOS, Windows, and Linux. Switch machines, switch OS, or share a workflow with colleagues on different platforms — Echo travels with you.",
    icon: "⊕",
  },
  {
    title: "Fully Open Source",
    description:
      "Super Whisper is proprietary. Echo is MIT-licensed: every line of code is public, auditable, and forkable. No black boxes, no vendor lock-in, no risk of the app going away.",
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
                Super Whisper
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

function SuperWhisperPage() {
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
              Echo vs Super Whisper
            </span>
            <h1 className="mb-6 max-w-3xl font-bold font-display text-[clamp(2rem,4.5vw,3.25rem)] text-foreground leading-tight tracking-[-0.03em]">
              The free Super Whisper alternative{" "}
              <span className="font-display font-light text-muted-foreground italic">
                for every platform
              </span>
            </h1>
            <p className="mb-4 max-w-2xl font-body text-base text-muted-foreground leading-relaxed">
              Super Whisper is a polished macOS dictation app — but it costs
              $249.99 for lifetime access, runs only on macOS, and is closed
              source. Echo is free forever, works on macOS, Windows, and Linux,
              and is fully open source under the MIT license.
            </p>
            <p className="mb-8 max-w-2xl rounded-xl border border-border/60 bg-card px-5 py-3 font-body text-muted-foreground text-sm italic leading-relaxed">
              Echo is free forever. Super Whisper costs $249.99 for lifetime
              access — for a tool you run locally on your own hardware.
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
                "✓ 100% Offline",
                "✓ Open Source",
                "✓ Windows + Linux",
                "✓ No Account",
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
            Why choose Echo over Super Whisper
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
