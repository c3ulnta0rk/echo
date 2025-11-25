"use client";

import { motion, useInView } from "motion/react";
import { useRef, useState } from "react";
import { Cpu, Zap, Globe, Languages, Timer, HardDrive } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModelData {
  id: string;
  name: string;
  description: string;
  sizeMb: number;
  accuracyScore: number;
  speedScore: number;
  engine: "whisper" | "parakeet";
  features: string[];
  recommended?: boolean;
}

const models: ModelData[] = [
  {
    id: "parakeet-tdt-0.6b-v3",
    name: "Parakeet V3",
    description: "Fast and accurate with automatic language detection",
    sizeMb: 478,
    accuracyScore: 0.8,
    speedScore: 0.85,
    engine: "parakeet",
    features: ["Auto language detection", "CPU optimized", "Fast inference"],
    recommended: true,
  },
  {
    id: "parakeet-tdt-0.6b-v2",
    name: "Parakeet V2",
    description: "Best accuracy for English speakers",
    sizeMb: 473,
    accuracyScore: 0.85,
    speedScore: 0.85,
    engine: "parakeet",
    features: ["English only", "Highest accuracy", "CPU optimized"],
  },
  {
    id: "small",
    name: "Whisper Small",
    description: "Fast and fairly accurate",
    sizeMb: 487,
    accuracyScore: 0.6,
    speedScore: 0.85,
    engine: "whisper",
    features: ["Multi-language", "GPU accelerated", "Lightweight"],
  },
  {
    id: "medium",
    name: "Whisper Medium",
    description: "Good accuracy, medium speed",
    sizeMb: 492,
    accuracyScore: 0.75,
    speedScore: 0.6,
    engine: "whisper",
    features: ["Multi-language", "GPU accelerated", "Balanced"],
  },
  {
    id: "turbo",
    name: "Whisper Turbo",
    description: "Balanced accuracy and speed",
    sizeMb: 1600,
    accuracyScore: 0.8,
    speedScore: 0.4,
    engine: "whisper",
    features: ["Multi-language", "GPU accelerated", "High quality"],
  },
  {
    id: "large",
    name: "Whisper Large",
    description: "Highest accuracy for Whisper models",
    sizeMb: 1100,
    accuracyScore: 0.85,
    speedScore: 0.3,
    engine: "whisper",
    features: ["Multi-language", "GPU accelerated", "Best quality"],
  },
];

function ModelCard({
  model,
  index,
  isSelected,
  onClick,
}: {
  model: ModelData;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onClick={onClick}
      className={`relative w-full text-left p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
        isSelected
          ? "bg-secondary border-primary/30 shadow-md shadow-primary/10"
          : "hover:bg-secondary border-border bg-background"
      }`}
    >
      {model.recommended && (
        <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full">
          Recommended
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-foreground truncate">
              {model.name}
            </h3>
            <span
              className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                model.engine === "parakeet"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-blue-500/20 text-blue-400"
              )}
            >
              {model.engine === "parakeet" ? "Parakeet" : "Whisper"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
            {model.description}
          </p>
        </div>
        <div className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
          {model.sizeMb >= 1000
            ? `${(model.sizeMb / 1000).toFixed(1)} GB`
            : `${model.sizeMb} MB`}
        </div>
      </div>

      {/* Stats bars */}
      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground w-14">
            Accuracy
          </span>
          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${model.accuracyScore * 100}%` }}
              transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
              className="h-full bg-primary rounded-full"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground w-14">Speed</span>
          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${model.speedScore * 100}%` }}
              transition={{ duration: 0.8, delay: index * 0.1 + 0.4 }}
              className="h-full bg-green-500 rounded-full"
            />
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function ModelDetail({ model }: { model: ModelData }) {
  return (
    <motion.div
      key={model.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              model.engine === "parakeet"
                ? "bg-green-500/20"
                : "bg-blue-500/20"
            }`}
          >
            {model.engine === "parakeet" ? (
              <Cpu className="w-5 h-5 text-green-400" />
            ) : (
              <Zap className="w-5 h-5 text-blue-400" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-medium text-foreground">{model.name}</h3>
            <p className="text-sm text-muted-foreground">{model.description}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-secondary/30 rounded-lg p-4 border border-white/5">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <HardDrive className="w-4 h-4" />
            <span className="text-xs">Download Size</span>
          </div>
          <p className="text-lg font-medium text-foreground tabular-nums">
            {model.sizeMb >= 1000
              ? `${(model.sizeMb / 1000).toFixed(1)} GB`
              : `${model.sizeMb} MB`}
          </p>
        </div>
        <div className="bg-secondary/30 rounded-lg p-4 border border-white/5">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Timer className="w-4 h-4" />
            <span className="text-xs">Processing</span>
          </div>
          <p className="text-lg font-medium text-foreground">
            {model.speedScore >= 0.8
              ? "Very Fast"
              : model.speedScore >= 0.5
                ? "Medium"
                : "Slower"}
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="flex-1">
        <h4 className="text-sm font-medium text-foreground mb-3">Features</h4>
        <div className="flex flex-wrap gap-2">
          {model.features.map((feature, i) => (
            <motion.span
              key={feature}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary/50 border border-white/5 rounded-full text-xs text-foreground"
            >
              {feature.includes("language") || feature.includes("English") ? (
                <Languages className="w-3 h-3" />
              ) : feature.includes("CPU") || feature.includes("GPU") ? (
                <Cpu className="w-3 h-3" />
              ) : (
                <Globe className="w-3 h-3" />
              )}
              {feature}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Engine badge */}
      <div className="mt-6 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Engine</span>
          <span
            className={`text-xs font-medium px-2 py-1 rounded-md ${
              model.engine === "parakeet"
                ? "bg-green-500/20 text-green-400"
                : "bg-blue-500/20 text-blue-400"
            }`}
          >
            {model.engine === "parakeet" ? "NVIDIA Parakeet" : "OpenAI Whisper"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function ModelsShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [selectedModel, setSelectedModel] = useState<ModelData>(models[0]);

  return (
    <section
      ref={containerRef}
      className="py-20 bg-background text-foreground overflow-hidden"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-medium lg:text-5xl mb-4">
            Choose Your Model
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-sm md:text-base font-light">
            Echo supports multiple transcription engines. Pick the one that best
            fits your needs — from lightning-fast CPU models to high-accuracy
            GPU-accelerated options.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="max-w-5xl mx-auto"
        >
          <div className="grid lg:grid-cols-[1fr_320px] gap-6">
            {/* Model List */}
            <div className="order-2 lg:order-1 grid sm:grid-cols-2 gap-3">
              {models.map((model, index) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  index={index}
                  isSelected={selectedModel.id === model.id}
                  onClick={() => setSelectedModel(model)}
                />
              ))}
            </div>

            {/* Selected Model Detail */}
            <div className="order-1 lg:order-2 bg-secondary/20 rounded-2xl border border-white/5 p-6 lg:sticky lg:top-24 h-fit">
              <ModelDetail model={selectedModel} />
            </div>
          </div>
        </motion.div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center text-xs text-muted-foreground mt-8"
        >
          All models run 100% locally on your device. No cloud processing, no
          data sent anywhere.
        </motion.p>
      </div>
    </section>
  );
}
