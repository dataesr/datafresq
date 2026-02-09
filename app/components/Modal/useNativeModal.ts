import { useCallback, useEffect, useId, useRef, useState } from 'react';

export function useNativeModal() {
  const id = useId().replace(/:/g, '-');
  const modalId = `modal${id}`;
  const modalRef = useRef<HTMLDialogElement | null>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const scrollYRef = useRef(0);
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    if (modalRef.current && !modalRef.current.open) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
      modalRef.current.classList.add('fr-modal--opened');
      modalRef.current.showModal();
      setIsOpen(true);
    }
  }, []);

  const close = useCallback(() => {
    if (modalRef.current?.open) {
      modalRef.current.classList.remove('fr-modal--opened');
      modalRef.current.close();
      setIsOpen(false);
    }
  }, []);

  // Scroll lock
  useEffect(() => {
    if (!isOpen) return;

    scrollYRef.current = window.scrollY;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollYRef.current}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';

      window.scrollTo(0, scrollYRef.current);
    };
  }, [isOpen]);

  const modalProps = {
    id: modalId,
    ref: modalRef,
    onCancel: (e: React.SyntheticEvent<HTMLDialogElement>) => {
      e.preventDefault();
      close();
    },
    onClick: (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === modalRef.current) {
        close();
      }
    },
  };

  return {
    modalProps,
    modalId,
    isOpen,
    open,
    close,
  };
}

export default useNativeModal;
