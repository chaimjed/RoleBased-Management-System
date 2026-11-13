import { useEffect, useState, useRef } from "react";
import { HiPencil, HiUser } from "react-icons/hi";
import AppNavbar from "../components/AppNavbar";
import api from "../api/axios";
import Button from "../components/Button";
import Alert from "../components/Alert";
import Input from "../components/Input";
import PhoneInput from "react-phone-number-input";

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  avatarUrl: string | null;
  isVerified: boolean;
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => {
        setProfile(res.data);
        setFormData({
          firstName: res.data.firstName,
          lastName: res.data.lastName,
          dateOfBirth: res.data.dateOfBirth.split("T")[0],
          phone: res.data.phone,
        });
      })
      .catch(() => setError("Impossible de charger le profil"));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditToggle = () => {
    if (isEditing && profile) {
      setFormData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        dateOfBirth: profile.dateOfBirth.split("T")[0],
        phone: profile.phone,
      });
    }
    setError("");
    setSuccess("");
    setIsEditing(!isEditing);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await api.patch("/auth/me", formData);
      setProfile(res.data);
      setSuccess("Profil mis à jour avec succès");
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 6 * 1024 * 1024) {
      setError("Image trop volumineuse (max 6MB)");
      return;
    }

    setError("");
    setAvatarUploading(true);

    const uploadFormData = new FormData();
    uploadFormData.append("avatar", file);

    try {
      const res = await api.post("/auth/avatar", uploadFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile(res.data);
      setSuccess("Avatar mis à jour");
    } catch (err: any) {
      setError(err.response?.data?.message || "Échec de l'upload");
    } finally {
      setAvatarUploading(false);
    }
  };

  if (error && !profile) {
    return (
      <>
        <AppNavbar />
        <div className="pt-20 flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <Alert color="failure">{error}</Alert>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <AppNavbar />
        <div className="pt-20 flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="h-10 w-10 rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 animate-spin" />
        </div>
      </>
    );
  }

  const avatarSrc = profile.avatarUrl
    ? `http://localhost:3000${profile.avatarUrl}`
    : null;

  return (
    <>
      <AppNavbar />
      <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8 flex items-start sm:items-center justify-center">
        <div className="w-full max-w-lg rounded-lg bg-white dark:bg-gray-800 shadow-md overflow-hidden">
          <div className="h-24 bg-blue-600" />

          <div className="px-6 sm:px-8 pb-8">
            <div className="flex justify-center -mt-12 mb-4">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <HiUser className="w-12 h-12 text-gray-400" />
                  )}
                  {avatarUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                      <div className="h-5 w-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    </div>
                  )}
                </div>
                <button
                  onClick={handleAvatarClick}
                  disabled={avatarUploading}
                  className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-1.5 shadow-md"
                  title="Changer l'avatar"
                >
                  <HiPencil className="w-3.5 h-3.5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {profile.email}
              </p>
              <span
                className={`inline-block mt-2 text-xs px-2.5 py-1 rounded-full font-medium ${
                  profile.isVerified
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                }`}
              >
                {profile.isVerified ? "✓ Compte vérifié" : "Non vérifié"}
              </span>
            </div>

            {success && (
              <div className="mb-4">
                <Alert color="success">{success}</Alert>
              </div>
            )}
            {error && (
              <div className="mb-4">
                <Alert color="failure">{error}</Alert>
              </div>
            )}

            {!isEditing ? (
              <>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">
                      Phone
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {profile.phone}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">
                      Date Of Birth
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {new Date(profile.dateOfBirth).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <Button onClick={handleEditToggle}>Edit</Button>
                </div>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    id="firstName"
                    name="firstName"
                    label="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    id="lastName"
                    name="lastName"
                    label="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  label="Date Of Birth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
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

                <div className="flex gap-2 pt-2">
                  <div className="flex-1">
                    <Button type="submit" loading={loading} loadingText="Saving...">
                      Save
                    </Button>
                  </div>
                  <div className="flex-1">
                    <Button variant="light" onClick={handleEditToggle} type="button">
                      Cancel
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}