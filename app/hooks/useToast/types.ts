/**
 * Toast notification types and interfaces
 */

/**
 * Available toast notification types
 */
export type ToastVariant = 'error' | 'info' | 'success' | 'warning';

/**
 * Base toast configuration
 */
interface BaseToastConfig {
  /**
   * Auto dismiss duration in milliseconds. Set to 0 to disable auto dismiss.
   * @default 5000
   */
  autoDismissAfter?: number;

  /**
   * Description text for the toast notification
   */
  description?: string;

  /**
   * Title text for the toast notification
   */
  title?: string;

  /**
   * Visual variant of the toast
   * @default 'success'
   */
  type?: ToastVariant;
}

/**
 * Toast configuration provided by the user
 */
export interface ToastConfig extends BaseToastConfig {
  /**
   * Optional custom ID for the toast. If not provided, one will be generated.
   */
  id?: string;
}

/**
 * Internal toast representation with required ID
 */
export interface ToastItem extends BaseToastConfig {
  /**
   * Unique identifier for the toast
   */
  id: string;

  /**
   * Visual variant of the toast
   */
  type: ToastVariant;
}

/**
 * Toast context value
 */
export interface ToastContextValue {
  /**
   * Display a new toast notification
   * @param config - Toast configuration
   * @returns The ID of the created toast
   */
  toast: (config: ToastConfig) => string;

  /**
   * Remove a toast by ID
   * @param id - The toast ID to remove
   */
  remove: (id: string) => void;

  /**
   * List of currently active toasts
   */
  toasts: ToastItem[];
}
