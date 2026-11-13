import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiBell } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationsContext";
import type { Notification } from "../types/notification";
import { adminUsersApi } from "../admin/api/adminUsersApi";

export default function AppNavbar() {
  const { isAuthenticated, logout, user, hasPermission } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const homeLink = hasPermission("users:read") ? "/admin/users" : "/";

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user?.firstName
    ? user.firstName.charAt(0).toUpperCase()
    : "U";

  const formatRelative = (dateStr: string) => {
    const diffMin = Math.floor(
      (Date.now() - new Date(dateStr).getTime()) / 60000,
    );
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${Math.floor(diffHr / 24)}d ago`;
  };
  async function triggerDownload(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
  const handleDownload = async (jobId: string) => {
    try {
      const blob = await adminUsersApi.downloadExport(jobId);
      await triggerDownload(blob, `users-export-${jobId}.csv`);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  const handleNotificationClick = (n: Notification) => {
    if (!n.isRead) markAsRead(n.id);
    if (n.type === "EXPORT_READY" && n.data?.jobId) {
      handleDownload(n.data.jobId);
    }
  };
  return (
    <nav className="bg-white dark:bg-gray-800 fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-700">
      <div className="flex flex-wrap items-center justify-between mx-auto p-4">
        <Link
          to={homeLink}
          className="self-center text-xl font-semibold whitespace-nowrap text-gray-900 dark:text-white"
        >
          MyApp
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to={homeLink}
            className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
          >
            Welcome
          </Link>

          {hasPermission("roles:manage") && (
            <Link
              to="/admin/roles"
              className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
            >
              Roles
            </Link>
          )}
          {hasPermission("audit:read") && (
            <Link
              to="/admin/audit-log"
              className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
            >
              Activity Log
            </Link>
          )}
          {isAuthenticated && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen((prev) => !prev)}
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <HiBell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-600 rounded-full">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-700 rounded-lg shadow divide-y divide-gray-100 dark:divide-gray-600 z-30 max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-center text-gray-500 dark:text-gray-400">
                      No notifications
                    </p>
                  ) : (
                    <ul>
                      {notifications.map((n) => (
                        <li
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 ${
                            !n.isRead ? "bg-blue-50 dark:bg-gray-800" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {n.data?.status === "preparing" && (
                              <span className="h-3.5 w-3.5 rounded-full border-2 border-gray-300 border-t-blue-600 animate-spin shrink-0" />
                            )}
                            <p className="text-gray-800 dark:text-gray-100">
                              {n.message}
                            </p>
                          </div>

                          {n.data?.status === "ready" &&
                            n.type === "EXPORT_READY" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(n.data!.jobId!);
                                }}
                                className="mt-2 text-xs font-medium px-2.5 py-1 rounded-md text-white bg-blue-600 hover:bg-blue-700"
                              >
                                Download
                              </button>
                            )}

                          <p className="mt-1 text-xs text-gray-400">
                            {formatRelative(n.createdAt)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 text-white font-semibold text-sm hover:ring-2 hover:ring-blue-300 dark:hover:ring-blue-800 focus:outline-none"
              >
                {initials}
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow divide-y divide-gray-100 dark:divide-gray-600 z-30">
                  <div className="px-4 py-3">
                    <span className="block text-sm text-gray-900 dark:text-white truncate">
                      {user?.email ?? "User"}
                    </span>
                  </div>
                  <ul className="py-1">
                    <li>
                      <Link
                        to="/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        Profile
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/change-password"
                        onClick={() => setIsMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        Password
                      </Link>
                    </li>
                  </ul>
                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-white bg-blue-600 hover:bg-blue-700 rounded-lg text-sm px-4 py-2"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
