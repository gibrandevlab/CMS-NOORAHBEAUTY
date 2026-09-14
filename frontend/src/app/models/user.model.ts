export interface User {
  id: number;
  username: string;
  email: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserResponse {
  success: boolean;
  message?: string;
  data: User;
}

export interface UserListResponse {
  success: boolean;
  message?: string;
  data: User[];
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  password?: string;
}
