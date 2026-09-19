export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string | null;
  brand: string;
  price: number;
  rating: number;
  review_count: number;
  colors: string[];
  sizes: string[];
  material: string | null;
  gender: string | null;
  tags: string[];
  image_url: string;
  in_stock: boolean;
}
