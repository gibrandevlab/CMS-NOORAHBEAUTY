import { Category } from './category.model';

export interface Product {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number | string;
  image: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
  category?: Category;
}

export interface ProductResponse {
  success: boolean;
  message?: string;
  data: Product;
}

export interface ProductListResponse {
  success: boolean;
  message?: string;
  data: Product[];
}

export interface CreateProductDto {
  category_id: number;
  name: string;
  slug?: string;
  description?: string;
  price?: number;
  image?: string | null;
  is_active?: boolean;
}

export interface UpdateProductDto {
  category_id?: number;
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  image?: string | null;
  is_active?: boolean;
}
