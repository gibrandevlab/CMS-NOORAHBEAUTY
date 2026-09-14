export interface Vendor {
  id: number;
  name: string;
  logo: string | null;
  address: string | null;
  contact: string | null;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VendorResponse {
  success: boolean;
  message?: string;
  data: Vendor;
}

export interface VendorListResponse {
  success: boolean;
  message?: string;
  data: Vendor[];
}

export interface CreateVendorDto {
  name: string;
  logo?: string | null;
  address?: string | null;
  contact?: string | null;
}

export interface UpdateVendorDto {
  name?: string;
  logo?: string | null;
  address?: string | null;
  contact?: string | null;
}
