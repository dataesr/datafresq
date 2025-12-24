import Avatar from './Avatar';

import './styles.css';

type User = {
  avatar?: string | null | undefined;
  firstName?: string | null | undefined;
  id: string;
  lastName?: string | null | undefined;
  email?: string | null | undefined;
};

export default function Avatars({ size = 36, users }: { size?: number; users: User[] }) {
  return (
    <ul className="avatars">
      {users.map((user) => (
        <li key={user.id} className="avatar">
          <Avatar displayTitle name={user.email} size={size} src={user.avatar} />
        </li>
      ))}
    </ul>
  );
}
