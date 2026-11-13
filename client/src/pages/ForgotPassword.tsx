import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Input from "../components/Input";
import Button from "../components/Button";
import Alert from "../components/Alert";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.data.message);
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
          Forgot your password
        </h2>

        {message && <Alert color="success">{message}</Alert>}
        {error && <Alert color="failure">{error}</Alert>}

        {!message && (
          <>
            <Input
              id="email"
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button type="submit" loading={loading} loadingText="Sending...">
              Send the reset link
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