export const KEY_LABELS: Record<string, string> = {
  LOGIN_SUCCESS: 'Logged in',
  LOGIN_FAILED: 'Login failed',
  LOGIN_BLOCKED: 'Login blocked',
  USER_CREATED: 'User created',
  USER_DELETED: 'User deleted',
  USER_ACTIVE: 'User reactivated',
  USER_SUSPENDED: 'User suspended',
  USER_BANNED: 'User banned',
  USER_ROLE_ASSIGNED: 'Role assigned to user',
  ROLE_CREATED: 'Role created',
  ROLE_DELETED: 'Role deleted',
  ROLE_PERMISSIONS_UPDATED: 'Role permissions updated',
};

export function labelForKey(key: string): string {
  return KEY_LABELS[key] ?? key.replace(/_/g, ' ').toLowerCase();
}