import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Toast } from './toast';
import type { ToastConfig, ToastContextValue, ToastItem } from './types';

/**
 * Toast container component that wraps all active toasts
 */
function ToastContainer({ children }: { children: React.ReactNode }): React.ReactElement {
  return <div id="toaster-container">{children}</div>;
}

/**
 * Default context value
 */
const defaultContextValue: ToastContextValue = {
  toast: () => '',
  remove: () => {},
  toasts: [],
};

/**
 * Toast context for managing toast notifications
 */
export const ToastContext = createContext<ToastContextValue>(defaultContextValue);

ToastContext.displayName = 'ToastContext';

/**
 * Props for ToastContextProvider
 */
interface ToastContextProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component for toast notifications
 * @example
 * ```tsx
 * <ToastContextProvider>
 *   <App />
 * </ToastContextProvider>
 * ```
 */
export const ToastContextProvider = ({
  children,
}: ToastContextProviderProps): React.ReactElement => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [id, setId] = useState<number>(0);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Remove a toast by its ID
   */
  const remove = useCallback((toastId: string): void => {
    setToasts((toastList) => toastList.filter((t) => t.id !== toastId));
  }, []);

  /**
   * Add a new toast notification
   */
  const toast = useCallback(
    (toastConfig: ToastConfig): string => {
      const newId = toastConfig?.id ?? `toast-${id}`;
      const newToast: ToastItem = {
        autoDismissAfter: toastConfig.autoDismissAfter,
        description: toastConfig.description,
        title: toastConfig.title,
        type: toastConfig.type ?? 'success',
        id: newId,
      };

      setToasts((toastList) => [...toastList, newToast]);
      setId((prevId) => prevId + 1);

      return newId;
    },
    [id],
  );

  const value: ToastContextValue = useMemo<ToastContextValue>(
    () => ({
      remove,
      toast,
      toasts,
    }),
    [remove, toast, toasts],
  );

  const content = (
    <ToastContainer>
      {toasts.map((toastItem) => (
        <Toast key={toastItem.id} {...toastItem} />
      ))}
    </ToastContainer>
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof window !== 'undefined' && mounted && createPortal(content, document.body)}
    </ToastContext.Provider>
  );
};
