import {
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
} from "flowbite-react";
import { HiPencil, HiTrash, HiUser } from "react-icons/hi";
import type { AdminUser } from "../types/types";
import { useAuth } from "../../context/AuthContext";

interface Props {
  users: AdminUser[];
  loading: boolean;
  onEdit: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
  onActivate: (id: string) => Promise<void>;
  onOpenStatusModal: (
    user: AdminUser,
    targetStatus: "SUSPENDED" | "BANNED",
  ) => void;
}

export default function UsersTable({
  users,
  loading,
  onEdit,
  onDelete,
  onActivate,
  onOpenStatusModal,
}: Props) {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission("users:edit") || hasPermission("roles:manage");
  const canDelete = hasPermission("users:delete");

  const statusStyles: Record<AdminUser["status"], string> = {
    ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    SUSPENDED:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    BANNED: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-8 w-8 rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 animate-spin" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-10">
        No users found
      </p>
    );
  }

  function formatRelative(dateStr: string | null): string {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 30) return `${diffDay}d ago`;
    return date.toLocaleDateString();
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <Table>
        <TableHead>
          <TableHeadCell>User</TableHeadCell>
          <TableHeadCell>Email</TableHeadCell>
          <TableHeadCell>Role</TableHeadCell>
          <TableHeadCell>Verified</TableHeadCell>
          <TableHeadCell>Status</TableHeadCell>
          <TableHeadCell>Joined</TableHeadCell>
          <TableHeadCell>Last active</TableHeadCell>
          {(canEdit || canDelete) && (
            <TableHeadCell>
              <span className="sr-only">Actions</span>
            </TableHeadCell>
          )}
        </TableHead>
        <TableBody className="divide-y divide-gray-100 dark:divide-gray-700">
          {users.map((user) => (
            <TableRow key={user.id} className="bg-white dark:bg-gray-800">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden flex items-center justify-center shrink-0">
                    {user.avatarUrl ? (
                      <img
                        src={`http://localhost:3000${user.avatarUrl}`}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <HiUser className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                  <span className="text-gray-900 dark:text-white font-medium whitespace-nowrap">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
              </TableCell>

              <TableCell className="text-gray-600 dark:text-gray-300">
                {user.email}
              </TableCell>

              <TableCell>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    user.role === "ADMIN"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {user.role}
                </span>
              </TableCell>

              <TableCell>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    user.isVerified
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                  }`}
                >
                  {user.isVerified ? "Verified" : "Pending"}
                </span>
              </TableCell>

              <TableCell>
                {canEdit ? (
                  <select
                    value={user.status}
                    onChange={(e) => {
                      const value = e.target.value as AdminUser["status"];
                      if (value === "ACTIVE") {
                        onActivate(user.id);
                      } else {
                        onOpenStatusModal(user, value);
                      }
                    }}
                    className={`text-xs px-2 py-1 rounded-full font-medium border-0 outline-none ${statusStyles[user.status]}`}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="BANNED">Banned</option>
                  </select>
                ) : (
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyles[user.status]}`}
                  >
                    {user.status}
                  </span>
                )}
              </TableCell>

              <TableCell className="text-gray-600 dark:text-gray-300 whitespace-nowrap">
                {formatDate(user.createdAt)}
              </TableCell>

              <TableCell className="text-gray-600 dark:text-gray-300 whitespace-nowrap">
                {formatRelative(user.lastActiveAt)}
              </TableCell>

              {(canEdit || canDelete) && (
                <TableCell>
                  <div className="flex justify-end gap-2">
                    {canEdit && (
                      <button
                        onClick={() => onEdit(user)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                        title="Edit"
                      >
                        <HiPencil className="w-4 h-4" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => onDelete(user)}
                        className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        title="Delete"
                      >
                        <HiTrash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}