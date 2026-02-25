import { createFileRoute } from "@tanstack/react-router";
import Download from "@/components/landing/download";
import { LandingFaq } from "@/components/landing/faq";
import Features from "@/components/landing/features";
import EchoFooter from "@/components/landing/footer";
import Hero from "@/components/landing/hero";
import InterfaceShowcase from "@/components/landing/interface-showcase";
import ModelsShowcase from "@/components/landing/models-showcase";
import PrivacyManifesto from "@/components/landing/privacy-manifesto";
import VoiceDemo from "@/components/landing/voice-demo";

/*
 * CREATIVE DIRECTION
 * 1. PRODUCT SOUL — The last open-source whisper: your voice stays yours
 * 2. FEELING — Discovery of a secret capability — a hidden shortcut that changes everything
 * 3. VISUAL THREAD — The notch: Echo's signature UI appears across sections in different contexts and scales
 * 4. ANTI-REFERENCE — NOT Vercel/Linear clone. NOT corporate SaaS. A zine for a beloved open-source tool.
 * 5. SCROLL STORY — Intrigue (notch descends) → Demo (see it work) → Trust (privacy) → Power (models) → Depth (features) → Download
 * 6. DARK/LIGHT — Dark: midnight booth, warm amber glows, velvet surfaces. Light: morning paper, warm cream, ink, soft shadows.
 */

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <Hero />
      <VoiceDemo />
      <PrivacyManifesto />
      <div id="features">
        <InterfaceShowcase />
        <ModelsShowcase />
        <Features />
      </div>
      <Download />
      <LandingFaq />
      <EchoFooter />
    </div>
  );
}
