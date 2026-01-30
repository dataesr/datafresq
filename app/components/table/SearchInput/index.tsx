import cn, { type Argument } from 'classnames';
import './styles.css';

type SearchInputProps = {
  className?: Argument;
  onChange: (value: string) => void;
  size?: 'sm' | 'md' | 'lg';
  value: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size' | 'className' | 'value'>;

export function SearchInput({
  className,
  onChange,
  size = 'lg',
  value,
  ...props
}: SearchInputProps) {
  const classes = cn(
    'search-input-wrapper',
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
      <input {...props} onChange={(e) => onChange(e.target.value)} value={value} />
    </div>
  );
}
