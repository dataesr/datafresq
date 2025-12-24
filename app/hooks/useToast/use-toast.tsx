import { useContext } from 'react';
import { ToastContext } from './context-provider';
import type { ToastContextValue } from './types';

/**
 * Hook to access toast notification functionality
 *
 * @returns Toast context value with toast and remove functions
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { toast, remove } = useToast();
 *
 *   const showSuccess = () => {
 *     toast({
 *       type: 'success',
 *       title: 'Success!',
 *       description: 'Operation completed successfully',
 *     });
 *   };
 *
 *   const showError = () => {
 *     const id = toast({
 *       type: 'error',
 *       title: 'Error',
 *       description: 'Something went wrong',
 *       autoDismissAfter: 0, // Won't auto-dismiss
 *     });
 *
 *     // Manually remove later
 *     setTimeout(() => remove(id), 3000);
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={showSuccess}>Show Success</button>
 *       <button onClick={showError}>Show Error</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @throws {Error} If used outside of ToastContextProvider
 */
export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastContextProvider');
  }

  return context;
};
