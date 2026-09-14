export type CategoryType = 'NEWS' | 'PRODUCT';

export interface Category {
  id: number;
  name: string;
  slug: string;
  type: CategoryType;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryResponse {
  success: boolean;
  message?: string;
  data: Category;
}

export interface CategoryListResponse {
  success: boolean;
  message?: string;
  data: Category[];
}

export interface CreateCategoryDto {
  name: string;
  slug?: string;
  type: CategoryType;
}

export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  type?: CategoryType;
}
