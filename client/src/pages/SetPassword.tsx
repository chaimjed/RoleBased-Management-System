import AppNavbar from "../components/AppNavbar";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { HiCheck, HiX } from "react-icons/hi";
import Button from "../components/Button";
import Alert from "../components/Alert";
import Input from "../components/Input";

export default function SetPassword() {
  const { setPassword } = useAuth();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordChecks = {
    minLength: newPassword.length >= 8,
    hasNumber: /\d/.test(newPassword),
    hasLowercase: /[a-z]/.test(newPassword),
    hasUppercase: /[A-Z]/.test(newPassword),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
  };
  const passedCount = Object.values(passwordChecks).filter(Boolean).length;
  const totalChecks = Object.keys(passwordChecks).length;

  const rules = [
    { label: "At least 8 characters", passed: passwordChecks.minLength },
    { label: "At least 1 number", passed: passwordChecks.hasNumber },
    { label: "At least 1 lowercase letter", passed: passwordChecks.hasLowercase },
    { label: "At least 1 uppercase letter", passed: passwordChecks.hasUppercase },
    { label: "At least 1 special character", passed: passwordChecks.hasSpecialChar },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setError("Passwords must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await setPassword(newPassword, confirmNewPassword);
      navigate("/");
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
            Set a password
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            You signed in with Google. Set a password so you can also log in
            with your email.
          </p>

          {error && <Alert color="failure">{error}</Alert>}

          <div>
            <Input
              id="password"
              type="password"
              label="Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              required
            />

            <div className="flex gap-1 mt-2">
              {Array.from({ length: totalChecks }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 flex-1 rounded-full ${
                    idx < passedCount ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
                  }`}
                />
              ))}
            </div>

            {passwordFocused && (
              <div className="mt-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 space-y-1.5">
                {rules.map((rule, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    {rule.passed ? (
                      <HiCheck className="text-blue-600 w-4 h-4 shrink-0" />
                    ) : (
                      <HiX className="text-gray-400 w-4 h-4 shrink-0" />
                    )}
                    <span
                      className={`text-xs ${
                        rule.passed ? "text-blue-600" : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {rule.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Input
            id="confirmNewPassword"
            type="password"
            label="Confirm the new password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
          />

          <Button type="submit" loading={loading} loadingText="Modification...">
            Set password
          </Button>
        </form>
      </div>
    </>
  );
}