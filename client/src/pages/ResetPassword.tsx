import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import Button from "../components/Button";
import Alert from "../components/Alert";
import Input from "../components/Input";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!token) {
      setError("Token manquant dans le lien");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/reset-password", {
        token,
        newPassword,
        confirmNewPassword,
      });
      setMessage(res.data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "An error has occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-lg bg-white dark:bg-gray-800 p-6 sm:p-8 shadow-md"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Reset password
        </h2>

        {message && (
          <Alert color="success">{message} — redirecting to the login...</Alert>
        )}
        {error && <Alert color="failure">{error}</Alert>}

        {!message && (
          <>
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

            <Button type="submit" loading={loading} loadingText="Reset...">
              Reset
            </Button>
          </>
        )}

        <p className="text-sm text-center dark:text-white">
          <Link to="/login" className="text-blue-600 hover:underline">
            Return to login
          </Link>
        </p>
      </form>
    </div>
  );
}