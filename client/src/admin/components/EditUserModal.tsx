import { useState, useEffect } from "react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Alert from "../../components/Alert";
import type { AdminUser } from "../types/types";
import { useRoles } from "../hooks/useRole";

export interface EditUserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roleId: string;
}

interface Props {
  user: AdminUser | null;
  onSave: (id: string, data: EditUserFormData) => Promise<void>;
  onResendVerification: (id: string) => Promise<void>;
  onClose: () => void;
}

export default function EditUserModal({
  user,
  onSave,
  onResendVerification,
  onClose,
}: Props) {
  const { roles, loading: rolesLoading } = useRoles();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [roleId, setRoleId] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sendVerification, setSendVerification] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        email: user.email,
        phone: user.phone ?? "",
      });
      setSendVerification(false);
      setFormErrors({});
      setError("");
    }
  }, [user]);

  useEffect(() => {
    if (user && roles.length > 0) {
      const currentRole = roles.find((r) => r.name === user.role);
      setRoleId(currentRole?.id ?? roles[0].id);
    }
  }, [user, roles]);

  if (!user) return null;

  const emailChanged = formData.email.trim() !== user.email;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[e.target.name];
        return next;
      });
    }
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setLoading(true);
    try {
      await onSave(user.id, { ...formData, roleId });
      if (emailChanged && sendVerification) {
        await onResendVerification(user.id);
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update user");
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
          Edit user
        </h3>

        {error && <Alert color="failure">{error}</Alert>}

        <div className="grid grid-cols-2 gap-3">
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
          id="email"
          name="email"
          type="email"
          label="Email"
          value={formData.email}
          onChange={handleChange}
          error={formErrors.email}
        />

        {emailChanged ? (
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={sendVerification}
              onChange={(e) => setSendVerification(e.target.checked)}
            />
            Send verification email to the new address
          </label>
        ) : (
          user.isVerified && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your account is verified with this email.
            </p>
          )
        )}

        <Input
          id="phone"
          name="phone"
          label="Phone"
          value={formData.phone}
          onChange={handleChange}
          error={formErrors.phone}
        />

        <div>
          <label
            htmlFor="editRole"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Role
          </label>
          <select
            id="editRole"
            value={roleId}
            disabled={rolesLoading}
            onChange={(e) => setRoleId(e.target.value)}
            className="text-sm rounded-lg block w-full p-2.5 outline-none border bg-gray-50 border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="light" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} loadingText="Saving...">
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}
