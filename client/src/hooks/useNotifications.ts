import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { Notification } from '../types/notification';



export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await axios.get<Notification[]>('/notifications');
      return data;
    },
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => axios.patch(`/notifications/${id}/read`),
    onSuccess: (_data, id) => {
      queryClient.setQueryData(['notifications'], (old: Notification[] = []) =>
        old.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    },
  });
}