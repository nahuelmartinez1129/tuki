import type { Product } from "@/types/product";

/**
 * Item dentro del carrito. Se deriva de `Product` (misma fuente de datos
 * que ya consume la Home) y le suma únicamente la cantidad elegida.
 * Mantenerlo acoplado a `Product` evita mapeos manuales al agregar
 * un producto desde cualquier sección (destacados, combos, caja
 * misteriosa, etc).
 */
export interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

/** Cualquier producto del catálogo se puede agregar al carrito. */
export type AddableProduct = Pick<
  Product,
  "id" |
  "name" |
  "description" |
  "price" |
  "image" |
  "stock"
>;
export type PaymentMethod = "efectivo" | "transferencia" | "mercado-pago";

/**
 * Payload que se genera al finalizar la compra en /checkout.
 * Placeholder de lo que en el futuro viajará a un backend / API de pedidos.
 */
export interface CheckoutOrder {
  customerName: string;
  phone: string;
  address: string;
  notes: string;
  paymentMethod: PaymentMethod;
  items: CartItem[];
  subtotal: number;
  total: number;
  reward?: string;
  
}
