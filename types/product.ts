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
  compareAtPrice?: number | null;
  image: string;
  category: string;
  stock?: number;
  tags?: string[];
  isCombo?: boolean;
}

export interface ComboItem extends Product {
  isCombo: true;
  includes: string[];
  savings: number;
}
