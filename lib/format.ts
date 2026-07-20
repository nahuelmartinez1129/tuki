const priceFormatter = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 0,
});

/**
 * Formatea un número como precio en pesos argentinos: 8500 -> "$8.500".
 * Se usa exclusivamente en los componentes nuevos del carrito/checkout;
 * las tarjetas de la Home mantienen su formato original a propósito.
 */
export function formatPrice(value: number) {
  return `$${priceFormatter.format(value)}`;
}
