import { Activity, type ReactNode, Suspense } from 'react';
import ErrorBoundary from '@/components/errors/ErrorBoundary';
import PageContentLoader from '@/components/loaders/PageContentLoader';

interface TabPanelProps {
  mode: 'visible' | 'hidden';
  children: ReactNode;
}

export function TabActivityPanel({ mode, children }: TabPanelProps) {
  return (
    <Activity mode={mode}>
      <ErrorBoundary>
        <Suspense fallback={<PageContentLoader />}>{children}</Suspense>
      </ErrorBoundary>
    </Activity>
  );
}
