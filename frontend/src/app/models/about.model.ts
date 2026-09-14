export interface AboutUs {
  id: number;
  company_name: string;
  description: string | null;
  vision: string | null;
  mission: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AboutUsResponse {
  success: boolean;
  message?: string;
  data: AboutUs;
}

export interface UpdateAboutUsDto {
  company_name?: string;
  description?: string | null;
  vision?: string | null;
  mission?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
}
