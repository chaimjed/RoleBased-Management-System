import { useState, useEffect } from "react";
import { rolesApi } from "../api/rolesApi";
import type { Permission } from "../types/types";

export function usePermissions() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    rolesApi.listPermissions().then(setPermissions).finally(() => setLoading(false));
  }, []);

  return { permissions, loading };
}