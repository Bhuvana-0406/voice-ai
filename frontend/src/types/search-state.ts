export interface SearchState {
  query: string | null;
  category: string | null;
  subcategory: string | null;
  brand: string | null;
  color: string | null;
  min_price: number | null;
  max_price: number | null;
  min_rating: number | null;
  size: string | null;
  material: string | null;
  gender: string | null;

  exclude_brands: string[];
  exclude_colors: string[];
  exclude_materials: string[];

  semantic_modifiers: string[];

  sort_by: string;
}

export interface FilterChip {
  label: string;
  field: string;
  type: 'filter' | 'exclusion' | 'semantic';
  removable: boolean;
}
