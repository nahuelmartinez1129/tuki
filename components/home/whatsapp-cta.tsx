import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { buildWhatsAppLink } from "@/lib/constants";

export function WhatsappCta() {
  return (
    <section className="bg-background px-4 py-14">
      <div className="container relative overflow-hidden rounded-3xl bg-tuki-turquoise p-8 text-center shadow-soft-lg sm:p-12">
        <div className="pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-10 -right-6 h-40 w-40 rounded-full bg-white/10" />

        <div className="relative flex flex-col items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
            <MessageCircle className="h-7 w-7 text-tuki-cream" />
          </span>

          <h2 className="max-w-sm font-display text-2xl font-extrabold text-tuki-cream sm:max-w-md sm:text-3xl">
            ¿Listo para tu próximo antojo?
          </h2>
          <p className="max-w-xs text-sm text-tuki-cream/85 sm:max-w-sm">
            La noche todavía tiene algo preparado para vos.
          </p>

          <Button size="lg" variant="yellow" asChild className="mt-2">
  <a href="#destacados">
    Ver Menú
  </a>
</Button>
        </div>
      </div>
    </section>
  );
}
