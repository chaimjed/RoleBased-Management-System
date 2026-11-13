import api from "../../api/axios";
import type { PaginatedUsers, UserFiltersState } from "../types/types";

export const adminUsersApi = {
  list: (page: number, limit: number, filters: UserFiltersState) => {
    const params: Record<string, string | number> = { page, limit };
    if (filters.search) params.search = filters.search;
    if (filters.role !== "ALL") params.role = filters.role;
    if (filters.status !== "ALL") params.status = filters.status;
    if (filters.joinedAfter !== "ALL") {
      const now = new Date();
      const map: Record<string, Date> = {
        TODAY: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        WEEK: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        MONTH: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      };
      params.joinedAfter = map[filters.joinedAfter].toISOString();
    }

    return api
      .get<PaginatedUsers>("/users", { params })
      .then((res) => res.data);
  },
  
  update: (
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      isVerified?: boolean;
    },
  ) => api.patch(`/users/${id}`, data).then((res) => res.data),

  assignRole: (userId: string, roleId: string) =>
    api.patch(`/users/${userId}/role`, { roleId }).then((res) => res.data),
  create: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
    roleId: string;
  }) => api.post("/users", data).then((res) => res.data),
  remove: (id: string) => api.delete(`/users/${id}`).then((res) => res.data),
  resendVerification: (id: string) =>
    api.post(`/users/${id}/resend-verification`).then((res) => res.data),
  updateStatus: (
    id: string,
    data: {
      status: "ACTIVE" | "SUSPENDED" | "BANNED";
      reason?: string;
      delayDays?: number;
    },
  ) => api.patch(`/users/${id}/status`, data).then((res) => res.data),
  
startExport: (filters: UserFiltersState) => {
  const body: Record<string, string> = {};
  if (filters.search) body.search = filters.search;
  if (filters.role !== "ALL") body.role = filters.role;
  if (filters.status !== "ALL") body.status = filters.status;
  if (filters.joinedAfter !== "ALL") {
    const now = new Date();
    const map: Record<string, Date> = {
      TODAY: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      WEEK: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      MONTH: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    };
    body.joinedAfter = map[filters.joinedAfter].toISOString();
  }
  return api.post<{ jobId: string }>("/users/export", body).then((res) => res.data);
},

getExportStatus: (jobId: string) =>
  api.get<{ status: string }>(`/users/export/${jobId}/status`).then((res) => res.data),

downloadExport: async (jobId: string) => {
  const res = await api.get(`/users/export/${jobId}/download`, {
    responseType: "blob",
  });
  return res.data as Blob;
},
};
