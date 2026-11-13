import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Socket } from "socket.io-client";
import { createNotificationSocket } from "./socket";
import { useAuth } from "./AuthContext";
import type { Notification } from "../types/notification";
import { notificationsApi } from "../admin/api/notificationsApi";
import { requestNotificationPermission } from "../utils/notificationPermission";

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refetch: () => Promise<void>;
}

const NotificationsContext = createContext<
  NotificationsContextType | undefined
>(undefined);

function showOsNotification(notification: Notification) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  if (document.visibilityState === "visible" && document.hasFocus()) return;

  const osNotif = new Notification("Account update", {
    body: notification.message,
    // icon: "/notification-icon.png",
    tag: notification.id,
  });

  osNotif.onclick = () => {
    window.focus();
    osNotif.close();
  };
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, accessToken } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const fetchNotifications = async () => {
    const data = await notificationsApi.list();
    setNotifications(data);
  };

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setNotifications([]);
      return;
    }

    requestNotificationPermission();
    fetchNotifications();

    const socket = createNotificationSocket(accessToken);
    socketRef.current = socket;

    socket.on("notification", (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      showOsNotification(notification);
    });
    socket.on("notification:update", (updated: Notification) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === updated.id ? updated : n)),
      );
      if (updated.data?.status === "ready") {
        showOsNotification(updated);
      }
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, accessToken]);

  const markAsRead = async (id: string) => {
    await notificationsApi.markAsRead(id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  const markAllAsRead = async () => {
    await notificationsApi.markAllAsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        refetch: fetchNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context)
    throw new Error("useNotifications must be used in NotificationsProvider");
  return context;
}
