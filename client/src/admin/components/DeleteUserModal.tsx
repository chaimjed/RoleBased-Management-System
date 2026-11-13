import Button from "../../components/Button";
import type { AdminUser } from "../types/types";

interface Props {
  user: AdminUser | null;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteUserModal({ user, loading, onConfirm, onCancel }: Props) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md w-full max-w-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Delete user
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          Are you sure you want to delete {user.firstName} {user.lastName} (
          {user.email})? 
        </p>

        <div className="flex gap-2">
          <Button variant="light" onClick={onCancel} type="button">
            Cancel
          </Button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="w-full font-medium rounded-lg text-sm px-5 py-2.5 text-white bg-red-600 hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}