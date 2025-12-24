import cn, { type Argument } from 'classnames';
import { useEffect, useState } from 'react';
import './styles.css';

type DebounceInputProps = {
  className?: Argument;
  debounce?: number;
  onChange: (value: string) => void;
  size?: 'sm' | 'md' | 'lg';
  value: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size' | 'className' | 'value'>;

export function DebouncedInput({
  debounce = 500,
  className,
  onChange,
  size = 'lg',
  value: initialValue,
  ...props
}: DebounceInputProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => setValue(initialValue), [initialValue]);

  useEffect(() => {
    if (debounce === 0) return onChange(value);
    const timeout = setTimeout(() => onChange(value), debounce);

    return () => clearTimeout(timeout);
  }, [debounce, onChange, value]);

  const classes = cn(
    'debounced-input-wrapper',
    'fr-btn',
    'fr-btn--tertiary',
    'fr-text-label--grey',
    'fr-icon-search-line',
    'fr-btn--icon-left',
    {
      [`fr-btn--${size}`]: size !== 'md',
    },
    className,
  );

  return (
    <div className={classes}>
      <input {...props} onChange={(e) => setValue(e.target?.value)} value={value} />
    </div>
  );
}
