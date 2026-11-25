/**
 * ==========================================================
 * EXPORTAR CLIENTES PARA WHATSAPP
 * ==========================================================
 *
 * Solo LEE la base: no cambia nada.
 *
 * Junta los pedidos ENTREGADOS por teléfono (un cliente
 * por número) y arma un CSV con nombre, número, cantidad
 * de pedidos, último pedido, total gastado y un link de
 * WhatsApp con el mensaje ya escrito.
 *
 * Uso (en el VPS o en tu PC):
 *      npx tsx scripts/exportar-clientes.ts
 *
 * Crea backups/clientes-whatsapp-AAAA-MM-DD.csv
 * (backups/ no se sube a git: tiene datos de clientes).
 *
 * Se descartan números que no parecen celulares
 * argentinos completos (pedidos de prueba).
 * ==========================================================
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// {nombre} se reemplaza por el primer nombre del cliente.
const MENSAJE = `¡Hola {nombre}! 🌙 Volvimos con TUKI.

Esta noche abrimos a las 21:30 y para festejar, de 21:30 a 23:30 te regalamos gomitas en pedidos desde $6.000 🍬

Pedí en 1 minuto en somostuki.com

Si no querés recibir más mensajes, respondé BAJA y no te escribimos más.`;

/*
 * Lleva el número a formato internacional de WhatsApp
 * (549 + código de área + número, sin 0 ni 15).
 * Devuelve null si no parece un celular completo.
 */
function normalizar(telefono: string): string | null {
  let d = telefono.replace(/\D/g, "");
  if (d.startsWith("549")) d = d.slice(3);
  else if (d.startsWith("54")) d = d.slice(2);
  if (d.startsWith("0")) d = d.slice(1);

  // 2291 15 123456 → 2291 123456 (código de 4 cifras,
  // el caso de Miramar). Otros largos se dejan.
  if (d.length === 12 && d.slice(4, 6) === "15") {
    d = d.slice(0, 4) + d.slice(6);
  }

  if (d.length !== 10) return null;
  return "549" + d;
}

const csv = (v: string | number) => {
  const s = String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

async function main() {
  const pedidos = await prisma.pedido.findMany({
    where: { estado: "ENTREGADO" },
    select: {
      nombre: true,
      telefono: true,
      total: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  type Cliente = {
    nombre: string;
    numero: string;
    pedidos: number;
    total: number;
    ultimo: Date;
  };

  const clientes = new Map<string, Cliente>();
  const descartados = new Set<string>();

  for (const p of pedidos) {
    const numero = normalizar(p.telefono);
    if (!numero) {
      descartados.add(p.telefono);
      continue;
    }
    const c = clientes.get(numero);
    if (c) {
      c.pedidos += 1;
      c.total += p.total;
      c.ultimo = p.createdAt;
      c.nombre = p.nombre.trim() || c.nombre;
    } else {
      clientes.set(numero, {
        nombre: p.nombre.trim(),
        numero,
        pedidos: 1,
        total: p.total,
        ultimo: p.createdAt,
      });
    }
  }

  const lista = [...clientes.values()].sort(
    (a, b) => b.ultimo.getTime() - a.ultimo.getTime()
  );

  const filas = [
    ["nombre", "numero", "pedidos", "ultimo_pedido", "total_gastado", "link_whatsapp"].join(","),
    ...lista.map((c) => {
      const primerNombre =
        c.nombre.split(/\s+/)[0] || "";
      const texto = MENSAJE.replace(
        "{nombre}",
        primerNombre
      ).replace("¡Hola ! ", "¡Hola! ");
      const link = `https://wa.me/${c.numero}?text=${encodeURIComponent(texto)}`;
      return [
        csv(c.nombre),
        c.numero,
        c.pedidos,
        c.ultimo.toISOString().slice(0, 10),
        c.total,
        link,
      ].join(",");
    }),
  ];

  const dir = path.join(process.cwd(), "backups");
  fs.mkdirSync(dir, { recursive: true });
  const archivo = path.join(
    dir,
    `clientes-whatsapp-${new Date().toISOString().slice(0, 10)}.csv`
  );
  // BOM para que Excel lea bien los acentos.
  fs.writeFileSync(archivo, "﻿" + filas.join("\n"));

  console.log(`Pedidos entregados: ${pedidos.length}`);
  console.log(`Clientes únicos:    ${lista.length}`);
  console.log(
    `Último pedido:      ${pedidos.at(-1)?.createdAt.toISOString().slice(0, 10) ?? "-"}`
  );
  if (descartados.size) {
    console.log(
      `Números descartados (incompletos o de prueba): ${descartados.size}`
    );
  }
  console.log(`\nArchivo: ${archivo}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
