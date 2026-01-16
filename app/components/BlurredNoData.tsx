import type { ReactNode } from 'react';
import { NoDataMessage } from './NoDataMessage';

interface BlurredNoDataProps {
  children: ReactNode;
  noData: boolean;
  icon?: string;
  message?: string;
}

export function BlurredNoData({
  children,
  noData,
  icon = 'fr-icon-information-line',
  message = 'Aucune donnée disponible.',
}: BlurredNoDataProps) {
  if (!noData) {
    return <>{children}</>;
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        style={{
          filter: 'blur(4px)',
          opacity: 0.5,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
        aria-hidden="true"
      >
        {children}
      </div>

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <NoDataMessage icon={icon} message={message} />
      </div>
    </div>
  );
}
