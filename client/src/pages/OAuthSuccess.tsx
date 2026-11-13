import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");

    if (!accessToken) {
      setError("Missing authentication token");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    loginWithToken(accessToken)
      .then((user) => {
        navigate(user.hasPassword ? "/":"/setPassword")
      })
      .catch(() => {
        setError("Google sign in failed");
        setTimeout(() => navigate("/login"), 2000);
      });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      {error ? (
        <p className="text-red-600">{error} — redirecting to login...</p>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 animate-pulse">Signing you in...</p>
      )}
    </div>
  );
}