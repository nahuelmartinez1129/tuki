import type { Product } from "@/types/product";

/**
 * Catálogo mock para la Home. Cuando exista backend/CMS,
 * este archivo se reemplaza por un fetch a la API sin tocar los componentes,
 * ya que consumen el tipo `Product` y no esta fuente directamente.
 */
export const featuredProducts: Product[] = [
  {
    id: "tita",
    name: "Tita",
    description:
      "Galletita rellena sabor limón con baño de repostería.",
    price: 1290,
    image: "/productos/tita.png",
    category: "galletitas",
    tags: ["top-ventas"],
  },
  {
    id: "misky-negro",
    name: "Misky Chocolate",
    description:
      "Chocolate con leche clásico, ideal para cualquier antojo.",
    price: 1200,
    image: "/productos/misky-negro.png",
    category: "chocolates",
  },
  {
    id: "misky-blanco",
    name: "Misky Blanco",
    description:
      "Chocolate blanco suave y cremoso.",
    price: 1200,
    image: "/productos/misky-blanco.png",
    category: "chocolates",
  },
  {
    id: "oblea-smack",
    name: "Smack",
    description:
      "Oblea de 5 capas bañada en chocolate.",
    price: 370,
    image: "/productos/oblea-smack.png",
    category: "galletitas",
    tags: ["recomendado"],
  },
  {
    id: "chocolate-block",
    name: "Cofler Block",
    description:
      "Chocolate con maní, un clásico argentino.",
    price: 2200,
    image: "/productos/chocolate-block.png",
    category: "chocolates",
  },
  {
    id: "chocolate-shot",
    name: "Shot",
    description:
      "Chocolate con leche relleno con maní crocante.",
    price: 1750,
    image: "/productos/chocolate-shot.png",
    category: "chocolates",
  },
  {
    id: "alfajor-gula",
    name: "Bomba Gula Extrema",
    description:
      "Alfajor relleno con dulce de leche y mousse de chocolate.",
    price: 1500,
    image: "/productos/alfajor-gula.png",
    category: "alfajores",
    tags: ["nuevo"],
  },
  {
    id: "aguila-clasica",
    name: "Águila Minitorta Clásica",
    description:
      "Minitorta de chocolate con relleno clásico.",
    price: 1800,
    image: "/productos/aguila-minitorta-clasica.png",
    category: "alfajores",
  },
  {
    id: "aguila-dark",
    name: "Águila Minitorta Dark",
    description:
      "Versión dark para los amantes del chocolate intenso.",
    price: 1800,
    image: "/productos/aguila-minitorta-dark.png",
    category: "alfajores",
  },
  {
  id: "gomitas-dientitos",
  name: "Dientitos (Unidad)",
  description:
    "¡Los clásicos dientitos! Se venden por unidad.",
  price: 100,
  image: "/productos/dientitos.jpg",
  category: "gomitas",
  tags: ["recomendado"],
},
{
  id: "gomitas-conitos",
  name: "Conitos (50 g)",
  description:
    "Gomitas suaves y frutales. Presentación de 50g.",
  price: 800,
  image: "/productos/gomita-conitos.jpg",
  category: "gomitas",
},
{
  id: "gomitas-anillos",
  name: "Anillos (50 g)",
  description:
    "Anillos frutales cubiertos de azúcar. 50g.",
  price: 300,
  image: "/productos/gomita-anillos.jpg",
  category: "gomitas",
},
];

export const comboProducts: Product[] = [
  {
    id: "combo-noche-tuki-1",
    name: "Combo 1 Noche Tuki",
    description: "1 Gula + 1 Oblea Smack + 1 Cub Smack + 1 Shot.",
    price: 3900,
    
    image:
      "/productos/combo-1.png",
    category: "combos",
    isCombo: true,
    tags: ["top-ventas"],
  },
  {
    id: "combo-noche-tuki-2",
    name: "Combo 2 Noche Tuki",
    description: "1 Aguila + 1 Gula + 1 Shot + 8 gomitas dientitos.",
    price: 5800,
    
    image:
      "/productos/combo-2.png",
    category: "combos",
    isCombo: true,
  },
  {
    id: "combo-noche-tuki-3",
    name: "Combo 3 Noche Tuki",
    description: "2 Aguila + 2 Bolsitas de gomitas (conitos y anillos) + 2 Misky.",
    price: 6500,
    
    image:
      "/productos/combo-3.png",
    category: "combos",
    isCombo: true,
    tags: ["nuevo"],
  },
];

/**
 * Catálogo completo para /menu. Combina destacados + combos.
 * No se usa en la Home (que sigue consumiendo `featuredProducts` /
 * `comboProducts` directamente) para no tocar su comportamiento actual.
 */
export const allProducts: Product[] = [...featuredProducts, ...comboProducts];

export type MenuCategoryGroup = "todos" | "dulces" | "salados" | "bebidas" | "combos";

export const CATEGORY_GROUP_LABELS: Record<MenuCategoryGroup, string> = {
  todos: "Todos",
  dulces: "Dulces",
  salados: "Salados",
  bebidas: "Bebidas",
  combos: "Combos",
};

/** Mapea la categoría fina del producto a su grupo visible en el filtro del menú. */
export function getMenuGroup(product: Product): MenuCategoryGroup {
  switch (product.category) {
    case "alfajores":
    case "gomitas":
    case "chocolates":
    case "galletitas":
    case "misterioso":
      return "dulces";
    case "papas":
      return "salados";
    case "gaseosas":
      return "bebidas";
    case "combos":
      return "combos";
    default:
      return "todos";
  }
}
