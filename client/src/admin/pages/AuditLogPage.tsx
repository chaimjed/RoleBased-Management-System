import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AppNavbar from "../../components/AppNavbar";
import Pagination from "../components/Pagination";
import { auditLogApi } from "../api/auditLogApi";

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["auditLogs", page],
    queryFn: () => auditLogApi.list(page, 25),
  });

  return (
    <>
      <AppNavbar />
      <div className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Activity Log
          </h1>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                  <tr>
                    <th className="px-4 py-3">When</th>
                    <th className="px-4 py-3">Actor</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {data?.data.map((entry) => (
                    <tr key={entry.id} className="bg-white dark:bg-gray-800">
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {new Date(entry.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white">
                        {entry.actor
                          ? `${entry.actor.firstName} ${entry.actor.lastName}`
                          : "System"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                          {entry.action}
                        </span>
                      </td>
<td className="px-4 py-3 text-gray-600 dark:text-gray-300">
  {entry.targetLabel
    ? `${entry.targetType}: ${entry.targetLabel}`
    : entry.targetType
      ? `${entry.targetType} #${entry.targetId?.slice(0, 8)}`
      : "—"}
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data?.meta && (
            <Pagination
              page={page}
              totalPages={data.meta.totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
    </>
  );
}
