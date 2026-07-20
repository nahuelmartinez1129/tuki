import Link from "next/link";
import { Instagram, MessageCircle } from "lucide-react";

const FOOTER_LINKS = [
  {
    title: "Menú",
    links: [
      { label: "Destacados", href: "#destacados" },
      { label: "Combos", href: "#combos" },
      { label: "Caja Misteriosa", href: "#noche" },
    ],
  },
  {
    title: "Tuki",
    links: [
      { label: "Cómo funciona", href: "#" },
      { label: "Zonas de envío", href: "#" },
      { label: "Preguntas frecuentes", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-tuki-night-soft pb-28 pt-12 sm:pb-12">
      <div className="container">
        <div className="grid gap-10 sm:grid-cols-[1.2fr,1fr,1fr]">
          <div>
            <span className="font-display text-2xl font-extrabold text-tuki-cream">
              tuki
            </span>
            <p className="mt-3 max-w-xs text-sm text-tuki-cream/60">
              Delivery nocturno de golosinas y antojos dulces. Porque las
              ganas no avisan.
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href="https://www.instagram.com/tuki.delivery_/"
                target="_blank"
                aria-label="Instagram de Tuki"
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-tuki-cream/80 transition-colors hover:bg-tuki-lime hover:text-tuki-night"
              >
                <Instagram className="h-4.5 w-4.5" />
              </a>
             
            </div>
          </div>

          {FOOTER_LINKS.map((group) => (
            <div key={group.title}>
              <p className="font-display text-sm font-bold text-tuki-cream">
                {group.title}
              </p>
              <ul className="mt-3 flex flex-col gap-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-tuki-cream/60 transition-colors hover:text-tuki-lime"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col-reverse items-center justify-between gap-4 border-t border-white/5 pt-6 sm:flex-row">
          <p className="text-xs text-tuki-cream/40">
            © {new Date().getFullYear()} Tuki. Hecho de noche, con mucha
            azúcar.
          </p>
          <p className="text-xs text-tuki-cream/40">
            No te vayas a dormir con ganas 🌙
          </p>
        </div>
      </div>
    </footer>
  );
}
