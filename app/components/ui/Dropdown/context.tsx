import { createContext, useContext } from 'react';

export type DropdownSize = 'sm' | 'md' | 'lg';

export interface DropdownContextValue {
  close: () => void;
  size: DropdownSize;
  closeOnAction: boolean;
  isOpen: boolean;
}

export const DropdownContext = createContext<DropdownContextValue | null>(null);

export function useDropdownContext(): DropdownContextValue {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown compound components must be used within a Dropdown component');
  }
  return context;
}
