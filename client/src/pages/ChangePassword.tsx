import AppNavbar from "../components/AppNavbar";
import api from "../api/axios";
import { useState } from "react";
import Button from "../components/Button";
import Alert from "../components/Alert";
import Input from "../components/Input";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      setMessage(res.data.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      setError(err.response?.data?.message || "An error has occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppNavbar />
      <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8 flex items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-4 rounded-lg bg-white dark:bg-gray-800 p-6 sm:p-8 shadow-md"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Change password
          </h2>

          {message && <Alert color="success">{message}</Alert>}
          {error && <Alert color="failure">{error}</Alert>}

          <Input
            id="currentPassword"
            type="password"
            label="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />

          <Input
            id="newPassword"
            type="password"
            label="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <Input
            id="confirmNewPassword"
            type="password"
            label="Confirm the new password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
          />

          <Button type="submit" loading={loading} loadingText="Modification...">
            Change password
          </Button>
        </form>
      </div>
    </>
  );
}