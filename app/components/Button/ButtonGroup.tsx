import cn, { type Argument } from 'classnames';

type ButtonGroupProps = {
  align?: 'left' | 'right' | 'center';
  children?: React.ReactNode;
  className?: Argument;
  isInlineFrom?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  size?: 'sm' | 'md' | 'lg';
  noMargins?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export const ButtonGroup = ({
  align = 'left',
  children,
  className,
  isInlineFrom,
  size = 'md',
  noMargins = false,
  ...props
}: ButtonGroupProps) => {
  const _classes = cn(
    'fr-btns-group',
    {
      'btns-group--no-margins': noMargins,
      [`fr-btns-group--${size}`]: size !== 'md',
      [`fr-btns-group--${align}`]: align !== 'left',
      'fr-btns-group--inline': isInlineFrom === 'xs',
      [`fr-btns-group--inline-${isInlineFrom}`]: isInlineFrom && isInlineFrom !== 'xs',
    },
    className,
  );
  return (
    <div className={_classes} {...props}>
      {children}
    </div>
  );
};
