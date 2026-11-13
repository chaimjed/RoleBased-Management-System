import { useState } from "react";
import AppNavbar from "../../components/AppNavbar";
import Alert from "../../components/Alert";

import { useRoles } from "../hooks/useRole";
import { usePermissions } from "../hooks/usePermissions";
import { useAuth } from "../../context/AuthContext";

export default function RolesPage() {
  const { roles, loading, error, createRole, setPermissions, deleteRole } = useRoles();
  const { permissions } = usePermissions();
  const { hasPermission } = useAuth();
  const canManage = hasPermission("roles:manage");

  const [newRoleName, setNewRoleName] = useState("");
  const [savingRoleId, setSavingRoleId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const togglePermission = async (roleId: string, current: string[], permName: string) => {
    const next = current.includes(permName)
      ? current.filter((p) => p !== permName)
      : [...current, permName];
    setSavingRoleId(roleId);
    setActionError("");
    try {
      await setPermissions(roleId, next);
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Failed to update permissions");
    } finally {
      setSavingRoleId(null);
    }
  };

  const handleCreate = async () => {
    if (!newRoleName.trim()) return;
    try {
      await createRole(newRoleName.trim());
      setNewRoleName("");
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Failed to create role");
    }
  };

  const handleDelete = async (roleId: string) => {
    try {
      await deleteRole(roleId);
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Failed to delete role");
    }
  };

  return (
    <>
      <AppNavbar />
      <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Roles & Permissions
          </h1>

          {error && <div className="mb-4"><Alert color="failure">{error}</Alert></div>}
          {actionError && <div className="mb-4"><Alert color="failure">{actionError}</Alert></div>}

{canManage && (
  <div className="flex gap-2 mb-6">
    <input
      id="newRoleName"
      type="text"
      placeholder="New role name"
      value={newRoleName}
      onChange={(e) => setNewRoleName(e.target.value)}
      className="w-full max-w-xs text-sm rounded-lg p-2 outline-none border bg-gray-50 border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
    />
    <button
      type="button"
      onClick={handleCreate}
      className="shrink-0 text-sm font-medium px-3 py-2 rounded-lg text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-60"
    >
      Create role
    </button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{role.name}</h3>
                    {canManage && (
                      <button
                        onClick={() => handleDelete(role.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3">
{permissions.map((perm) => {
  const checked = role.permissions.includes(perm.name);
  return (
    <label
      key={perm.id}
      className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300"
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={!canManage || savingRoleId === role.id}
        onChange={() => togglePermission(role.id, role.permissions, perm.name)}
      />
      {perm.label ?? perm.name}
    </label>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}