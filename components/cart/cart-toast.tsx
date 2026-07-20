"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { useCart } from "@/hooks/use-cart";
import type { CartToast as CartToastType } from "@/contexts/cart-context";

const AUTO_DISMISS_MS = 2400;
const EXIT_ANIMATION_MS = 250;

function ToastItem({
  toast,
  onDone,
}: {
  toast: CartToastType;
  onDone: (id: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Dispara la transición de entrada en el siguiente frame.
    const enterFrame = requestAnimationFrame(() => setVisible(true));

    const exitTimer = setTimeout(() => setVisible(false), AUTO_DISMISS_MS);
    const removeTimer = setTimeout(
      () => onDone(toast.id),
      AUTO_DISMISS_MS + EXIT_ANIMATION_MS
    );

    return () => {
      cancelAnimationFrame(enterFrame);
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [toast.id, onDone]);

  return (
    <div
      role="status"
      className={`pointer-events-auto flex items-center gap-2 rounded-2xl bg-tuki-lime px-4 py-3 shadow-soft-lg transition-all duration-300 ease-out ${
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-3 opacity-0"
      }`}
    >
      <CheckCircle2 className="h-4 w-4 shrink-0 text-tuki-night" strokeWidth={2.5} />
      <span className="font-display text-sm font-bold text-tuki-night">
        {toast.message}
      </span>
    </div>
  );
}

export function CartToast() {
  const { toasts, dismissToast } = useCart();

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[80] flex flex-col items-center gap-2 px-4">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDone={dismissToast} />
      ))}
    </div>
  );
}
