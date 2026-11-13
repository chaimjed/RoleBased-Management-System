import api from "../../api/axios";

export interface AuditLogEntry {
  id: string;
  actorId: string | null;
  actor: { firstName: string; lastName: string; email: string } | null;
  key: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  targetLabel: string | null;
  metadata: any;
  createdAt: string;
}

export const auditLogApi = {
  list: (page: number, limit: number) =>
    api.get<{ data: AuditLogEntry[]; meta: any }>("/audit-logs", { params: { page, limit } })
      .then((res) => res.data),
};