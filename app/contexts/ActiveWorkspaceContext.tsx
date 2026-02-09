import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { ReadWorkspace } from '~/schemas/workspaces';

const STORAGE_KEY = 'datafresq:activeWorkspaceId';

interface ActiveWorkspaceContextType {
  activeWorkspace: ReadWorkspace | null;
  activeWorkspaceId: string | null;
  setActiveWorkspace: (workspace: ReadWorkspace) => void;
  clearActiveWorkspace: () => void;
  isLoading: boolean;
}

const ActiveWorkspaceContext = createContext<ActiveWorkspaceContextType | null>(null);

interface ActiveWorkspaceProviderProps {
  children: ReactNode;
  workspaces: ReadWorkspace[];
}

export function ActiveWorkspaceProvider({ children, workspaces }: ActiveWorkspaceProviderProps) {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEY);
  });
  const [isLoading, setIsLoading] = useState(true);

  const activeWorkspace = activeWorkspaceId
    ? workspaces.find((ws) => ws.id === activeWorkspaceId) ?? null
    : null;

  useEffect(() => {
    const storedId = localStorage.getItem(STORAGE_KEY);
    if (storedId) {
      const exists = workspaces.some((ws) => ws.id === storedId);
      if (!exists) {
        localStorage.removeItem(STORAGE_KEY);
        setActiveWorkspaceId(null);
      }
    }
    setIsLoading(false);
  }, [workspaces]);

  const setActiveWorkspace = useCallback((workspace: ReadWorkspace) => {
    localStorage.setItem(STORAGE_KEY, workspace.id);
    setActiveWorkspaceId(workspace.id);
  }, []);

  const clearActiveWorkspace = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setActiveWorkspaceId(null);
  }, []);

  return (
    <ActiveWorkspaceContext.Provider
      value={{
        activeWorkspace,
        activeWorkspaceId,
        setActiveWorkspace,
        clearActiveWorkspace,
        isLoading,
      }}
    >
      {children}
    </ActiveWorkspaceContext.Provider>
  );
}

export function useActiveWorkspace(): ActiveWorkspaceContextType {
  const context = useContext(ActiveWorkspaceContext);
  if (!context) {
    throw new Error('useActiveWorkspace must be used within an ActiveWorkspaceProvider');
  }
  return context;
}
