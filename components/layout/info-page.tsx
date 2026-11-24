import type { ReactNode } from "react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

/*
 * Marco común de las páginas informativas del
 * footer (cómo funciona, zonas, preguntas).
 */
export function InfoPage({
  titulo,
  bajada,
  children,
}: {
  titulo: string;
  bajada: string;
  children: ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen overflow-x-hidden bg-tuki-night bg-night-texture pb-20 pt-12">
        <div className="container max-w-2xl">
          <h1 className="font-display text-3xl font-extrabold text-tuki-cream sm:text-4xl">
            {titulo}
          </h1>
          <p className="mt-2 text-sm text-tuki-cream/70">{bajada}</p>

          <div className="mt-8 flex flex-col gap-4">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export function InfoCard({
  titulo,
  children,
}: {
  titulo?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-tuki-night-soft p-5 shadow-soft ring-1 ring-white/5">
      {titulo && (
        <h2 className="font-display text-lg font-bold text-tuki-cream">
          {titulo}
        </h2>
      )}
      <div className="mt-2 text-sm leading-relaxed text-tuki-cream/70">
        {children}
      </div>
    </section>
  );
}
