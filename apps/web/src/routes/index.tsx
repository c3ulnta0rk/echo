import { createFileRoute } from '@tanstack/react-router'
import Hero from '@/components/landing/hero'
import Waveform from '@/components/landing/waveform'
import Features from '@/components/landing/features'
import Download from '@/components/landing/download'
import EchoFooter from '@/components/landing/footer'
import { Architecture } from '@/components/landing/architecture'
import { LandingFaq } from '@/components/landing/faq'
import Stats from '@/components/landing/stats'
import InterfaceShowcase from '@/components/landing/interface-showcase'
import ModelsShowcase from '@/components/landing/models-showcase'

export const Route = createFileRoute('/')({ component: App })

function ArchitectureSection() {
  return (
    <section className="py-20 bg-background text-foreground overflow-hidden">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-medium lg:text-5xl">Built with Rust</h2>
          <p className="text-muted-foreground text-lg">
            Echo is engineered for performance and safety. By leveraging Rust's memory safety and speed, we ensure that your transcription happens instantly without compromising your system's stability.
          </p>
          <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>Zero Garbage Collection pauses</span>
              </li>
              <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>Minimal memory footprint</span>
              </li>
              <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>Native system integration</span>
              </li>
          </ul>
        </div>
        <div className="h-[300px] md:h-[400px] w-full flex items-center justify-center">
          <Architecture className="w-full h-full max-w-md" />
        </div>
      </div>
    </section>
  )
}

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Hero />
      <div id="features">
        <Waveform />
        <InterfaceShowcase />
        <ModelsShowcase />
        <ArchitectureSection />
        <Stats />
        <Features />
      </div>
      <Download />
      <LandingFaq />
      <EchoFooter />
    </div>
  )
}
