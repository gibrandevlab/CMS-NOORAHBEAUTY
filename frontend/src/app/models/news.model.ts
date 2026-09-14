import { Category } from './category.model';

export interface News {
  id: number;
  category_id: number;
  title: string;
  slug: string;
  content: string;
  image: string | null;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
  category?: Category;
}

export interface NewsResponse {
  success: boolean;
  message?: string;
  data: News;
}

export interface NewsListResponse {
  success: boolean;
  message?: string;
  data: News[];
}

export interface CreateNewsDto {
  category_id: number;
  title: string;
  slug?: string;
  content: string;
  image?: string | null;
  is_published?: boolean;
}

export interface UpdateNewsDto {
  category_id?: number;
  title?: string;
  slug?: string;
  content?: string;
  image?: string | null;
  is_published?: boolean;
}

export interface UploadImageResponse {
  success: boolean;
  message?: string;
  url: string;
  filename: string;
}
