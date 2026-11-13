import { useState, useEffect } from "react";
import Button from "../../components/Button";
import Alert from "../../components/Alert";
import type { AdminUser } from "../types/types";

interface Props {
  user: AdminUser | null;
  targetStatus: "SUSPENDED" | "BANNED" | null;
  onConfirm: (data: { status: "SUSPENDED" | "BANNED"; reason: string; delayDays?: number }) => Promise<void>;
  onClose: () => void;
}

export default function StatusActionModal({ user, targetStatus, onConfirm, onClose }: Props) {
  const [reason, setReason] = useState("");
  const [delayDays, setDelayDays] = useState(7);
  const [reasonError, setReasonError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (targetStatus) {
      setReason("");
      setDelayDays(7);
      setReasonError("");
      setError("");
    }
  }, [targetStatus, user]);

  if (!user || !targetStatus) return null;

  const isSuspend = targetStatus === "SUSPENDED";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setReasonError("Reason is required");
      return;
    }
    setReasonError("");
    setError("");
    setLoading(true);
    try {
      await onConfirm({
        status: targetStatus,
        reason: reason.trim(),
        ...(isSuspend ? { delayDays } : {}),
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${isSuspend ? "suspend" : "ban"} user`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md w-full max-w-sm p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {isSuspend ? "Suspend" : "Ban"} {user.firstName} {user.lastName}
        </h3>

        {error && <Alert color="failure">{error}</Alert>}

        <div>
          <label
            htmlFor="reason"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Reason
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (reasonError) setReasonError("");
            }}
            rows={3}
            className="text-sm rounded-lg block w-full p-2.5 outline-none border bg-gray-50 border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Explain why this account is being suspended..."
          />
          {reasonError && <p className="mt-1 text-xs text-red-600">{reasonError}</p>}
        </div>

        {isSuspend && (
          <div>
            <label
              htmlFor="delayDays"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Duration
            </label>
            <select
              id="delayDays"
              value={delayDays}
              onChange={(e) => setDelayDays(Number(e.target.value))}
              className="text-sm rounded-lg block w-full p-2.5 outline-none border bg-gray-50 border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value={7}>7 days</option>
              <option value={15}>15 days</option>
              <option value={30}>30 days</option>
            </select>
          </div>
        )}

        <p className="text-xs text-gray-500 dark:text-gray-400">
          An email will be sent to {user.email} notifying them of this action
        </p>

        <div className="flex gap-2 pt-2">
          <Button variant="light" type="button" onClick={onClose}>
            Cancel
          </Button>
          <button
            type="submit"
            disabled={loading}
            className="w-full font-medium rounded-lg text-sm px-5 py-2.5 text-white bg-red-600 hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? "Processing..." : isSuspend ? "Suspend" : "Ban"}
          </button>
        </div>
      </form>
    </div>
  );
}