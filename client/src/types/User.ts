export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  hasPassword: boolean;
  phone: string;
  role: string;
  permissions: string[];
}