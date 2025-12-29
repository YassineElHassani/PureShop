export enum CurrencyCode {
  MAD = 'MAD',
  EUR = 'EUR',
  USD = 'USD',
}

export type SortOrder = 'asc' | 'desc';

export interface IBaseEntity {
  id: string;
}

export interface IAuditTrail {
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface IMoney {
  amount: number;
  currency: CurrencyCode;
}

export interface IPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IPaginatedResponse<T> {
  data: T[];
  meta: IPaginationMeta;
}

export interface IPaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
}

export interface IQueryRange {
  min?: number;
  max?: number;
}
