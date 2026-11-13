import api from "../../api/axios";
import type { Permission, Role } from "../types/types";

export const rolesApi = {
  list: () => api.get<Role[]>("/roles").then((res) => res.data),

  create: (name: string) =>
    api.post<Role>("/roles", { name }).then((res) => res.data),

  setPermissions: (roleId: string, permissionNames: string[]) =>
    api
      .patch<Role>(`/roles/${roleId}/permissions`, { permissionNames })
      .then((res) => res.data),

  remove: (roleId: string) =>
    api.delete(`/roles/${roleId}`).then((res) => res.data),

  listPermissions: () =>
 api.get<Permission[]>("/permissions").then((res) => res.data), };