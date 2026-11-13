import { HiSearch, HiChevronDown } from "react-icons/hi";
import { useRoles } from "../hooks/useRole";
import type { UserFiltersState } from "../types/types";

interface Props {
  filters: UserFiltersState;
  onChange: (filters: UserFiltersState) => void;
  onAddUser?: () => void;
  showAddUser?: boolean;
}

const pillSelect =
  "appearance-none pl-3 pr-7 py-2 text-sm rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer";

export default function UserFilters({
  filters,
  onChange,

}: Props) {
  const { roles, loading: rolesLoading } = useRoles();

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <div className="relative flex-1 min-w-[180px]">
        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full pl-9 pr-3 py-2 text-sm rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="relative">
        <select
          value={filters.role}
          disabled={rolesLoading}
          onChange={(e) => onChange({ ...filters, role: e.target.value })}
          className={pillSelect}
        >
          <option value="ALL">Role</option>
          {roles.map((role) => (
            <option key={role.id} value={role.name}>
              {role.name}
            </option>
          ))}
        </select>
        <HiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
      </div>

      <div className="relative">
        <select
          value={filters.status}
          onChange={(e) =>
            onChange({
              ...filters,
              status: e.target.value as UserFiltersState["status"],
            })
          }
          className={pillSelect}
        >
          <option value="ALL">Status</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="BANNED">Banned</option>
        </select>
        <HiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
      </div>

      <div className="relative">
        <select
          value={filters.joinedAfter}
          onChange={(e) =>
            onChange({
              ...filters,
              joinedAfter: e.target.value as UserFiltersState["joinedAfter"],
            })
          }
          className={pillSelect}
        >
          <option value="ALL">Date</option>
          <option value="TODAY">Joined today</option>
          <option value="WEEK">Last 7 days</option>
          <option value="MONTH">Last 30 days</option>
        </select>
        <HiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}
