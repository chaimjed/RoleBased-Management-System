import { useState, useEffect } from "react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Alert from "../../components/Alert";
import { useRoles } from "../hooks/useRole";

export interface CreateUserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string; 
  password: string;
  roleId: string;

}

interface Props {
  open: boolean;
  onSave: (data: CreateUserFormData) => Promise<void>;
  onClose: () => void;
}
const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  dateOfBirth: "",
};
export default function CreateUserModal({ open, onSave, onClose }: Props) {
  const { roles, loading: rolesLoading } = useRoles();
  const [formData, setFormData] = useState(emptyForm);
  const [roleId, setRoleId] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setFormData(emptyForm);
      setFormErrors({});
      setError("");
    }
  }, [open]);

  useEffect(() => {
    if (roles.length > 0 && !roleId) {
      const adminRole = roles.find((r) => r.name === "ADMIN");
      setRoleId(adminRole?.id ?? roles[0].id);
    }
  }, [roles, roleId]);

  if (!open) return null;

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
    if (!formData.dateOfBirth) errors.dateOfBirth = "Date of birth is required";
    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!formData.password || formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }
    if (!roleId) errors.role = "Role is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setLoading(true);
    try {
      await onSave({ ...formData, roleId });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create user");
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
          Create user
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

        <Input
          id="phone"
          name="phone"
          label="Phone"
          value={formData.phone}
          onChange={handleChange}
          error={formErrors.phone}
        />
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
          id="password"
          name="password"
          type="password"
          label="Temporary password"
          value={formData.password}
          onChange={handleChange}
          error={formErrors.password}
        />

        <div>
          <label
            htmlFor="createRole"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Role
          </label>
          <select
            id="createRole"
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
          {formErrors.role && (
            <p className="mt-1 text-xs text-red-600">{formErrors.role}</p>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="light" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} loadingText="Creating...">
            Create
          </Button>
        </div>
      </form>
    </div>
  );
}
