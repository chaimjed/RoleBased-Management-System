import { useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";
import OAuthSuccess from "./pages/OAuthSuccess";
import SetPassword from "./pages/SetPassword";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import AdminUsersPage from "./admin/pages/AdminUsersPage";
import ProtectedRoute from "./components/Protectedroute";
import Unauthorized from "./admin/pages/Unauthorized";
import RolesPage from "./admin/pages/RolesPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NotificationsProvider } from "./context/NotificationsContext";
import AuditLogPage from "./admin/pages/AuditLogPage";
function AppRoutes() {
  const { user, isAuthenticated, isLoading, hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (isLoading) return;
    if (user && !user.hasPassword && location.pathname !== "/setPassword") {
      navigate("setPassword", { replace: true });
    }
  }, [user, isLoading, location.pathname, navigate]);
  return (
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/change-password"
        element={
          isAuthenticated ? (
            <ChangePassword />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="/oauth-success" element={<OAuthSuccess />} />
      <Route
        path="/"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : hasPermission("users:read") ? (
            <Navigate to="/admin/users" replace />
          ) : (
            <Home />
          )
        }
      />
      <Route path="/setPassword" element={<SetPassword />} />
      <Route
        path="/profile"
        element={
          isAuthenticated ? <Profile /> : <Navigate to="/login" replace />
        }
      />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute permission="users:read">
            <AdminUsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/roles"
        element={
          <ProtectedRoute permission="roles:manage">
            <RolesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audit-log"
        element={
          <ProtectedRoute permission="audit:read">
            <AuditLogPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <NotificationsProvider>
            <AppRoutes />
          </NotificationsProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
export default App;
