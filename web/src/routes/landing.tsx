import { Nav } from "@/components/Nav";
import { Hero } from "@/components/hero/Hero";
import { EngineSection } from "@/components/sections/EngineSection";
import { SearchSection } from "@/components/sections/SearchSection";
import { SynthSection } from "@/components/sections/SynthSection";
import { VoicesSection } from "@/components/sections/VoicesSection";
import { ApiSection } from "@/components/sections/ApiSection";
import { DeploySection } from "@/components/sections/DeploySection";
import { Gallery } from "@/components/Gallery";
import { CtaStrip } from "@/components/CtaStrip";
import { Footer } from "@/components/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-void text-primary">
      <Nav />
      <main>
        <Hero />
        <EngineSection />
        <SearchSection />
        <SynthSection />
        <VoicesSection />
        <ApiSection />
        <DeploySection />
        <Gallery />
        <CtaStrip />
      </main>
      <Footer />
    </div>
  );
}
