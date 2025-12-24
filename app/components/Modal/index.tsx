import type { ComponentProps } from 'react';
import { createPortal } from 'react-dom';

export { useModal } from './useModal';

type Props = ComponentProps<'dialog'>;

export function Modal({ children, className, ...props }: Props) {
  return createPortal(
    <dialog className={['fr-modal', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </dialog>,
    document.body,
  );
}
