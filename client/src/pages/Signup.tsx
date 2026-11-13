import { useState } from "react";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { HiCheck, HiX } from "react-icons/hi";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import GoogleAuthButton from "../components/GoogleAuthButton";
import Input from "../components/Input";
import Button from "../components/Button";
import Alert from "../components/Alert";

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const navigate = useNavigate();
  const [signupMessage, setSignupMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) {
      setFormErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs[e.target.name];
        return newErrs;
      });
    }
  };

  const passwordChecks = {
    minLength: formData.password.length >= 8,
    hasNumber: /\d/.test(formData.password),
    hasLowercase: /[a-z]/.test(formData.password),
    hasUppercase: /[A-Z]/.test(formData.password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };
  const passedCount = Object.values(passwordChecks).filter(Boolean).length;
  const totalChecks = Object.keys(passwordChecks).length;

  const rules = [
    { label: "At least 8 characters", passed: passwordChecks.minLength },
    { label: "At least 1 number", passed: passwordChecks.hasNumber },
    {
      label: "At least 1 lowercase letter",
      passed: passwordChecks.hasLowercase,
    },
    {
      label: "At least 1 uppercase letter",
      passed: passwordChecks.hasUppercase,
    },
    {
      label: "At least 1 special character",
      passed: passwordChecks.hasSpecialChar,
    },
  ];

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.firstName) errors.firstName = "First name is required";
    if (!formData.lastName) errors.lastName = "Last name is required";
    if (!formData.dateOfBirth) {
      errors.dateOfBirth = "Date of birth is required";
    } else {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
      if (age < 12) errors.dateOfBirth = "You must be at least 12 years old";
    }
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    if (!formData.phone) errors.phone = "Phone number is required";
    if (!formData.password) errors.password = "Password is required";
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await api.post("/auth/signup", formData);
      setSignupMessage(res.data.message);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "An error has occurred");
    } finally {
      setLoading(false);
    }
  };
  if (signupMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-sm w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center space-y-4">
          <div className="text-4xl">📧</div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Check your email
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {signupMessage}
          </p>
          <Link
            to="/login"
            className="inline-block text-sm text-blue-600 hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <Alert color="success">
          Registration successful! Please verify your email to activate your
          account.
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-md space-y-4 rounded-lg bg-white dark:bg-gray-800 p-6 sm:p-8 shadow-md"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Create an account
        </h2>

        {error && <Alert color="failure">{error}</Alert>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="firstName"
            name="firstName"
            label="First name"
            value={formData.firstName}
            onChange={handleChange}
            error={formErrors.firstName}
          />
          <Input
            id="lastName"
            name="lastName"
            label="Last name"
            value={formData.lastName}
            onChange={handleChange}
            error={formErrors.lastName}
          />
        </div>

        <Input
          id="dateOfBirth"
          name="dateOfBirth"
          type="date"
          label="Date of birth"
          value={formData.dateOfBirth}
          onChange={handleChange}
          error={formErrors.dateOfBirth}
        />

        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          value={formData.email}
          onChange={handleChange}
          error={formErrors.email}
        />

        <div>
          <label
            htmlFor="phone"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Phone
          </label>
          <PhoneInput
            defaultCountry="TN"
            value={formData.phone}
            placeholder="Phone"
            onChange={(value) => {
              setFormData((prev) => ({ ...prev, phone: value || "" }));
              if (formErrors.phone)
                setFormErrors((prev) => ({ ...prev, phone: "" }));
            }}
            className={`flex w-full rounded-lg border px-3 py-1 text-sm outline-none
              [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:py-1.5 [&_.PhoneInputInput]:ml-2
              dark:[&_.PhoneInputInput]:text-white dark:[&_.PhoneInputCountrySelect]:bg-gray-700 dark:[&_.PhoneInputCountrySelect]:text-white
              ${
                formErrors.phone
                  ? "bg-red-50 border-red-500 focus-within:ring-2 focus-within:ring-red-500 dark:bg-gray-700"
                  : "bg-gray-50 border-gray-300 dark:bg-gray-700 dark:border-gray-600 focus-within:ring-2 focus-within:ring-blue-500"
              }`}
          />
          {formErrors.phone && (
            <p className="mt-1.5 text-xs text-red-600 dark:text-red-500">
              {formErrors.phone}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              error={formErrors.password}
              required
            />

            <div className="flex gap-1 mt-2">
              {Array.from({ length: totalChecks }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 flex-1 rounded-full ${
                    idx < passedCount
                      ? "bg-blue-600"
                      : "bg-gray-200 dark:bg-gray-700"
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
                        rule.passed
                          ? "text-blue-600"
                          : "text-gray-500 dark:text-gray-400"
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
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={formErrors.confirmPassword}
            required
          />
        </div>

        <Button type="submit" loading={loading} loadingText="Registering...">
          Register
        </Button>

        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white dark:bg-gray-800 px-3 text-gray-500 dark:text-gray-400">
              or
            </span>
          </div>
        </div>

        <GoogleAuthButton />

        <p className="text-sm text-center dark:text-white">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
