

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/home/hero";
import { PromoBanner } from "@/components/home/promo-banner";
import { HappyHour } from "@/components/home/happy-hour";
import { FeaturedProducts } from "@/components/home/featured-products";
import { Combos } from "@/components/home/combos";
import { NightSection } from "@/components/home/night-section";
import { MysteryBoxSection } from "@/components/home/mystery-box";
import { RouletteSection } from "@/components/home/roulette-section";
import { WhatsappCta } from "@/components/home/whatsapp-cta";
import { StatusBanner }
from "@/components/home/status-banner";
export default function Home() {

  return (
    <>
      <Navbar />
  <StatusBanner />
      <HappyHour />
      <main>
        <Hero />
        <PromoBanner />
        <FeaturedProducts />
        <Combos />
        <RouletteSection /> 
        <NightSection />
        <MysteryBoxSection />
        <WhatsappCta />
      </main>
      <Footer />
      
    </>
  );
}
