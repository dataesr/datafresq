import type { ReactNode } from 'react';
import { NoDataMessage } from '@/components/NoDataMessage';
import './styles.css';

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
    <div className="blurred-no-data">
      <div className="blurred-no-data__content" aria-hidden="true">
        {children}
      </div>
      <div className="blurred-no-data__overlay fx-flex fx-items-center fx-justify-center fr-p-2w">
        <NoDataMessage icon={icon} message={message} />
      </div>
    </div>
  );
}
