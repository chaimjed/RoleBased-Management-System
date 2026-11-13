import { useState, useEffect, useCallback } from "react";
import { rolesApi } from "../api/rolesApi";
import type { Role } from "../types/types";

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRoles(await rolesApi.list());
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load roles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const createRole = async (name: string) => {
    await rolesApi.create(name);
    await fetchRoles();
  };

  const setPermissions = async (roleId: string, permissionNames: string[]) => {
    await rolesApi.setPermissions(roleId, permissionNames);
    await fetchRoles();
  };

  const deleteRole = async (roleId: string) => {
    await rolesApi.remove(roleId);
    await fetchRoles();
  };

  return { roles, loading, error, createRole, setPermissions, deleteRole, refetch: fetchRoles };
}