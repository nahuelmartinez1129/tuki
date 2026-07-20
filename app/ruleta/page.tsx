import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

import { RouletteSection } from "@/components/home/roulette-section";

export default function RuletaPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen">
        <RouletteSection />
      </main>

      <Footer />
    </>
  );
}