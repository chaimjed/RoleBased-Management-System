import api from "../../api/axios";
import type { Notification } from "../../types/notification";
export const notificationsApi = {
  list: () => api.get<Notification[]>("/notifications").then((res) => res.data),
  unreadCount: () => api.get<number>("/notifications/unread-count").then((res) => res.data),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`).then((res) => res.data),
  markAllAsRead: () => api.patch("/notifications/read-all").then((res) => res.data),
};