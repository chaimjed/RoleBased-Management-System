import { useState } from "react";
import { adminUsersApi } from "../api/adminUsersApi";
import type {

  UserFiltersState,
} from "../types/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useAdminUsers() {
  
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filters, setFiltersState] = useState<UserFiltersState>({
    search: "",
    role: "ALL",
    status: "ALL",
    joinedAfter: "ALL",
  });
const setFilters =(next:UserFiltersState)=>{
  setFiltersState(next)
  setPage(1)
}
 
  const usersQuery = useQuery({
    queryKey: ["adminUsers", page, limit, filters],
    queryFn: () => adminUsersApi.list(page, limit, filters),
  });


  const updateUser = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof adminUsersApi.update>[1];
    }) => adminUsersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["adminUsers"],
      });
    },
  });

  const assignRole = useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      adminUsersApi.assignRole(userId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["adminUsers"],
      });
    },
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => adminUsersApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["adminUsers"],
      });
    },
  });
  const createUser = useMutation({
    mutationFn: (data: Parameters<typeof adminUsersApi.create>[0]) =>
      adminUsersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["adminUsers"],
      });
    },
  });
  const resendVerification = useMutation({
    mutationFn: (id: string) => adminUsersApi.resendVerification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["adminUsers"],
      });
    },
  });
  const updateStatus = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof adminUsersApi.updateStatus>[1];
    }) => adminUsersApi.updateStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["adminUsers"],
      });
    },
  });
  const startExport = async () => {
  const { jobId } = await adminUsersApi.startExport(filters);
  return jobId;
};


  return {
    users: usersQuery.data?.data ?? [],
meta: usersQuery.data?.meta ?? null,
    page,
    setPage,
    filters,
    setFilters,
    loading: usersQuery.isLoading,
    error: usersQuery.isError ? "Failed to load users" : "",
    updateUser: (
      id: string,
      data: Parameters<typeof adminUsersApi.update>[1],
    ) => updateUser.mutateAsync({ id, data }),
    assignRole: (userId: string, roleId: string) =>
      assignRole.mutateAsync({ userId, roleId }),
    createUser: (data: Parameters<typeof adminUsersApi.create>[0]) =>
      createUser.mutateAsync(data),
    deleteUser: (id: string) => deleteUser.mutateAsync(id),
    resendVerification: (id: string) => resendVerification.mutateAsync(id),
    updateStatus: (
      id: string,
      data: Parameters<typeof adminUsersApi.updateStatus>[1],
    ) => updateStatus.mutateAsync({ id, data }),
    refetch: usersQuery.refetch,
    startExport
  };
}
