import { useState } from "react";
import AppNavbar from "../../components/AppNavbar";
import Alert from "../../components/Alert";
import UserFilters from "../components/UserFilters";
import UsersTable from "../components/UsersTable";
import Pagination from "../components/Pagination";
import EditUserModal, {
  type EditUserFormData,
} from "../components/EditUserModal";
import DeleteUserModal from "../components/DeleteUserModal";
import { useAdminUsers } from "../hooks/useAdminUsers";
import type { AdminUser } from "../types/types";
import CreateUserModal, {
  type CreateUserFormData,
} from "../components/CreateUserModal";
import { useAuth } from "../../context/AuthContext";
import StatusActionModal from "../components/StatusActionModal";

export default function AdminUsersPage() {
  const {
    users,
    meta,
    page,
    setPage,
    filters,
    setFilters,
    loading,
    error,
    updateUser,
    assignRole,
    deleteUser,
    createUser,
    resendVerification,
    updateStatus,
    startExport,
  } = useAdminUsers();
  const { hasPermission } = useAuth();
  const [exporting, setExporting] = useState(false);

  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);
  const [statusModalUser, setStatusModalUser] = useState<AdminUser | null>(
    null,
  );
  const [statusModalTarget, setStatusModalTarget] = useState<
    "SUSPENDED" | "BANNED" | null
  >(null);

  const handleActivate = async (id: string) => {
    setActionError("");
    try {
      await updateStatus(id, { status: "ACTIVE" });
    } catch (err: any) {
      setActionError(
        err.response?.data?.message || "Failed to reactivate user",
      );
    }
  };

  const handleOpenStatusModal = (
    user: AdminUser,
    target: "SUSPENDED" | "BANNED",
  ) => {
    setStatusModalUser(user);
    setStatusModalTarget(target);
  };

  const handleConfirmStatus = async (data: {
    status: "SUSPENDED" | "BANNED";
    reason: string;
    delayDays?: number;
  }) => {
    await updateStatus(statusModalUser!.id, data);
  };

  const handleCreate = async (data: CreateUserFormData) => {
    await createUser(data);
  };
  const handleSave = async (id: string, data: EditUserFormData) => {
    const { roleId, ...profileData } = data;
    await Promise.all([updateUser(id, profileData), assignRole(id, roleId)]);
  };
  const handleExport = async () => {
    setExporting(true);
    setActionError("");
    try {
      await startExport();
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Failed to start export");
    } finally {
      setExporting(false);
    }
  };
  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    setDeleteLoading(true);
    setActionError("");
    try {
      await deleteUser(deletingUser.id);
      setDeletingUser(null);
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Failed to delete user");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <AppNavbar />
      <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              User Management
            </h1>
            <div className="flex gap-2">
              {hasPermission("users:export") && (
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={exporting}
                  className="text-sm font-medium px-4 py-2 rounded-full text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-60"
                >
                  {exporting ? "Starting..." : "Export"}
                </button>
              )}
              {hasPermission("users:edit") && (
                <button
                  type="button"
                  onClick={() => setCreatingUser(true)}
                  className="text-sm font-medium px-4 py-2 rounded-full text-white bg-gray-900 dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-700"
                >
                  + Create user
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-4">
              <Alert color="failure">{error}</Alert>
            </div>
          )}
          {actionError && (
            <div className="mb-4">
              <Alert color="failure">{actionError}</Alert>
            </div>
          )}

          <UserFilters
            filters={filters}
            onChange={setFilters}
            showAddUser={false}
          />

          <UsersTable
            users={users}
            loading={loading}
            onEdit={setEditingUser}
            onDelete={setDeletingUser}
            onActivate={handleActivate}
            onOpenStatusModal={handleOpenStatusModal}
          />

          {meta && (
            <Pagination
              page={page}
              totalPages={meta.totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>

      <CreateUserModal
        open={creatingUser}
        onSave={handleCreate}
        onClose={() => setCreatingUser(false)}
      />
      <EditUserModal
        user={editingUser}
        onSave={handleSave}
        onResendVerification={resendVerification}
        onClose={() => setEditingUser(null)}
      />
      <DeleteUserModal
        user={deletingUser}
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingUser(null)}
      />
      <StatusActionModal
        user={statusModalUser}
        targetStatus={statusModalTarget}
        onConfirm={handleConfirmStatus}
        onClose={() => {
          setStatusModalUser(null);
          setStatusModalTarget(null);
        }}
      />
    </>
  );
}
