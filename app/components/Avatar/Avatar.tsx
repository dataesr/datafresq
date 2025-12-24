import cn from 'classnames';
import { useState } from 'react';

import './styles.css';

type Props = {
  className?: string;
  displayTitle?: boolean;
  name?: string | null;
  size?: number;
  src?: string | null;
} & React.HTMLAttributes<HTMLSpanElement>;

export default function Avatar({
  className = '',
  displayTitle = false,
  name,
  size = 48,
  src,
  ...rest
}: Props) {
  const [error, setError] = useState(false);

  return (
    <span
      className={cn(className, 'avatar-box')}
      style={{ width: size, height: size }}
      title={displayTitle && name ? name : undefined}
      {...rest}
    >
      {!src || error ? (
        <span
          className={cn('avatar-label', 'fr-text', 'fr-text--bold', 'fr-text--uppercase', 'fr-m-0')}
        >
          {name ? name.slice(0, 2).toUpperCase() : ''}
        </span>
      ) : (
        <img
          alt="avatar"
          className="avatar-img"
          onError={(e) => {
            console.error('error', e);
            setError(true);
          }}
          src={src}
        />
      )}
    </span>
  );
}
