import { Avatar } from '@/components/Avatar';
import { Select } from '@/components/ui/Select';
import { getDisplayName, getRoleLabel, ROLE_OPTIONS, type UserRole } from './constants';

interface UserListItemProps {
  user: {
    userId: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  };
  role: UserRole;
  onRoleChange?: (role: UserRole) => void;
  onRemove?: () => void;
  disabled?: boolean;
}

export function UserListItem({
  user,
  role,
  onRoleChange,
  onRemove,
  disabled = false,
}: UserListItemProps) {
  const displayName = getDisplayName(user);
  const roleLabel = getRoleLabel(role);

  return (
    <li className="fx-flex fx-items-center fx-gap-3w fr-py-3v">
      <Avatar name={displayName} size={40} />
      <div className="fx-flex-grow">
        <p className="fr-text--bold fr-mb-0 fx-clamp">{displayName}</p>
        <p className="fr-text--sm fr-mb-0 fx-clamp">{user.email}</p>
      </div>
      {onRoleChange && (
        <Select label={roleLabel} size="sm" outline disabled={disabled}>
          {ROLE_OPTIONS.map((option) => (
            <Select.Radio
              key={option.id}
              value={option.id}
              name={`role-${user.userId}`}
              checked={role === option.id}
              onChange={() => onRoleChange(option.id)}
            >
              {option.label}
            </Select.Radio>
          ))}
        </Select>
      )}
      {onRemove && (
        <button
          type="button"
          className="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-icon-delete-line"
          title="Retirer"
          onClick={onRemove}
          disabled={disabled}
        >
          Retirer
        </button>
      )}
    </li>
  );
}
