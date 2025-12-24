import { type HTMLProps, memo, useEffect, useRef } from 'react';

interface IndeterminateCheckboxProps extends Omit<HTMLProps<HTMLInputElement>, 'type'> {
  indeterminate?: boolean;
}

export const IndeterminateCheckbox = memo(function IndeterminateCheckbox({
  className = '',
  indeterminate,
  checked,
  ...rest
}: IndeterminateCheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current && typeof indeterminate === 'boolean') {
      ref.current.indeterminate = !checked && indeterminate;
    }
  }, [indeterminate, checked]);

  return (
    <input
      className={`${className} cursor-pointer fr-checkbox`}
      ref={ref}
      type="checkbox"
      checked={checked}
      {...rest}
    />
  );
});
