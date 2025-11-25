"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

export default function InterfaceShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={containerRef}
      className="relative py-24 md:py-32 bg-linear-to-b from-background via-neutral-500/10 to-background overflow-hidden"
    >
      {/* Ambient glow effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl font-medium lg:text-5xl text-foreground mb-4">
            Beautiful & Intuitive
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-sm md:text-base font-light">
            A clean, native interface that stays out of your way. Configure your
            shortcuts, choose your microphone, and start transcribing in
            seconds.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 48, scale: 0.95 }}
          animate={
            isInView
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: 48, scale: 0.95 }
          }
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Glow behind the image */}
          <div className="absolute inset-0 bg-linear-to-t from-primary/20 via-primary/5 to-transparent rounded-3xl blur-2xl transform scale-95" />

          {/* Main image container */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10">
            <img
              src="/opengraph-image.png"
              alt="Echo app interface showing the settings panel with options for shortcuts, language, microphone selection, and audio feedback"
              className="w-full h-auto"
              loading="lazy"
            />

            {/* Subtle overlay gradient for depth */}
            <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Floating feature badges */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="absolute -left-4 top-1/4 hidden lg:flex items-center gap-2 bg-background/80 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 shadow-lg"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-foreground">
              Push to Talk
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="absolute -right-4 top-1/3 hidden lg:flex items-center gap-2 bg-background/80 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 shadow-lg"
          >
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-sm font-medium text-foreground">
              Custom Shortcuts
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-2 bg-background/80 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 shadow-lg"
          >
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-sm font-medium text-foreground">
              Audio Feedback
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
