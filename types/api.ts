// Base API response types used by proxyHelper

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiPaginatedResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T[];
  metadata: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ApiError {
  success: false;
  message: string;
  error?: {
    code?: string;
    detail?: string;
    fields?: Record<string, string[]>;
  };
}
