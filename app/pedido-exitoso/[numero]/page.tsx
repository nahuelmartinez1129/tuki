"use client";

import { useEffect } from "react";
import {
  useRouter,
  useParams,
} from "next/navigation";

import { CheckCircle } from "lucide-react";

export default function PedidoExitosoPage() {
  const router = useRouter();

  const params =
    useParams<{
      numero: string;
    }>();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push(
        `/pedido/${params.numero}`
      );
    }, 5000);

    return () =>
      clearTimeout(timeout);
  }, [params.numero, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-tuki-night px-4">
      <div className="w-full max-w-md rounded-3xl bg-tuki-night-soft p-8 text-center">
        <CheckCircle className="mx-auto h-20 w-20 text-tuki-lime" />

        <h1 className="mt-6 text-3xl font-bold text-tuki-cream">
          ¡Pedido recibido!
        </h1>

        <p className="mt-4 text-tuki-cream/70">
          Tu pedido fue enviado correctamente al local.
        </p>

        <p className="mt-2 text-tuki-cream/70">
          Pedido #{params.numero}
        </p>

        <p className="mt-6 text-sm text-tuki-lime">
          Redirigiendo al seguimiento del pedido...
        </p>
      </div>
    </main>
  );
}