"use client";

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
import { useEffect, useState } from "react";
export default function Home() {
  const [abierto, setAbierto] =
  useState(true);

useEffect(() => {
  async function load() {
    const response = await fetch(
      "/api/configuracion"
    );

    const data = await response.json();

    setAbierto(data.abierto);
  }

  // Carga inicial
  load();

  // Consultar cada 2 segundos
  const interval = setInterval(
    load,
    1000
  );

  // Limpiar cuando se desmonta
  return () =>
    clearInterval(interval);

}, []);
  return (
    <>
      <Navbar />
  {abierto ? (
    <div className="bg-tuki-lime py-2 text-center font-display text-sm font-bold text-black">
      🟢 TUKI está abierto y esperando tu pedido.
    </div>
  ) : (
    <div className="bg-tuki-night-soft py-3 text-center font-display text-sm font-bold text-tuki-cream">
      🌙 TUKI está descansando. Volvemos pronto.
    </div>
  )}
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
