import { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Alert, Spinner } from "flowbite-react";
import api from "../api/axios";

export default function VerifyEmail() {
 const [searchParams] = useSearchParams();
const token = searchParams.get("token");

const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
const [message, setMessage] = useState("");
const hasRun= useRef(false)

useEffect(() => {
  if(hasRun.current)return
  hasRun.current=true

  const verifyEmail = async () => {
    if (!token) {
      setStatus("error");
      setMessage("Missing token");
      return;
    }

    try {
      await api.get("/auth/verify-email", {
        params: { token },
      });

      setStatus("success");
      setMessage("Email successfully verified");
    } catch (err: any) {
      setStatus("error");
      setMessage(
        err.response?.data?.message || "Verification error"
      );
    }
  };

  verifyEmail();
}, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-8 shadow-md text-center">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <Spinner size="xl" />
            <p className="dark:text-white">Verification in progress...</p>
          </div>
        )}

        {status === "success" && (
          <>
            <Alert color="success" className="mb-4">
              {message}
            </Alert>
            <Link to="/login" className="text-blue-600 hover:underline">
              Go to the login page
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <Alert color="failure" className="mb-4">
              {message}
            </Alert>
            <Link to="/signup" className="text-blue-600 hover:underline">
              Return to registration
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
