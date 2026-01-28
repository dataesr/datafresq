export const ROLE_OPTIONS = [
  { id: 'viewer' as const, label: 'Lecteur' },
  { id: 'editor' as const, label: 'Éditeur' },
];

export type UserRole = 'viewer' | 'editor';

export function getDisplayName(user: {
  firstName?: string | null;
  lastName?: string | null;
  email: string;
}): string {
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
}

export function getRoleLabel(role: UserRole): string {
  return ROLE_OPTIONS.find((opt) => opt.id === role)?.label || 'Lecteur';
}
