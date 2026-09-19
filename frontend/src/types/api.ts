import { Product } from './product';
import { SearchState, FilterChip } from './search-state';

export interface ConverseResponse {
  session_id: string;
  search_state: SearchState;
  products: Product[];
  total_results: number;
  chips: FilterChip[];
  acknowledgment: string;
  clarification: string | null;
}
