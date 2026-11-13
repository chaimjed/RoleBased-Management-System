import type { User } from "../../types/User";
export type UserStatus = "ACTIVE" | "SUSPENDED" | "BANNED";

export interface AdminUser extends User {
  isVerified: boolean;
  avatarUrl: string | null;
  status: "ACTIVE" | "SUSPENDED" | "BANNED";
  statusReason: string | null;
  suspendedUntil: string | null;
  createdAt: string;
  lastActiveAt: string | null;
}

export interface PaginatedUsers {
  data: AdminUser[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
export interface UserFiltersState {
  search: string;
  role: "ALL" | string;
  status: "ALL" | "ACTIVE" | "SUSPENDED" | "BANNED";
  joinedAfter: "ALL" | "TODAY" | "WEEK" | "MONTH";
}
export interface Role {
  id: string
  name: string
  permissions: string[]
}
export interface Permission {
  id: string;
  name: string;
  label: string | null;
}