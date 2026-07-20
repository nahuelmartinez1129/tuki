"use client";

import { Search, X } from "lucide-react";

interface ProductSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function ProductSearch({ value, onChange }: ProductSearchProps) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-tuki-cream/40" />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar alfajores, gomitas, combos..."
        className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-10 text-sm text-tuki-cream placeholder:text-tuki-cream/40 font-body transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tuki-lime"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Limpiar búsqueda"
          className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-tuki-cream/50 hover:text-tuki-lime"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
