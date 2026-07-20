export type ProductCategory =
  | "alfajores"
  | "gomitas"
  | "chocolates"
  | "galletitas"
  | "papas"
  | "gaseosas"
  | "combos"
  | "misterioso";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  category: ProductCategory;
  tags?: ("nuevo" | "top-ventas" | "picante" | "misterioso" | "recomendado")[];
  isCombo?: boolean;
}

export interface ComboItem extends Product {
  isCombo: true;
  includes: string[];
  savings: number;
}
