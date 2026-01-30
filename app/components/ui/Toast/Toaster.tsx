import { useSyncExternalStore } from 'react';
import { Portal } from '../Portal';
import { getToasts, subscribe, type Toast, type ToastPosition } from './store';
import { ToastItem } from './ToastItem';

const POSITION_CLASSES: Record<ToastPosition, string> = {
  'top-left': 'fx-toaster--top-left',
  'top-center': 'fx-toaster--top-center',
  'top-right': 'fx-toaster--top-right',
  'bottom-left': 'fx-toaster--bottom-left',
  'bottom-center': 'fx-toaster--bottom-center',
  'bottom-right': 'fx-toaster--bottom-right',
};

interface ToasterProps {
  position?: ToastPosition;
}

export function Toaster({ position: defaultPosition = 'bottom-right' }: ToasterProps) {
  const toasts = useSyncExternalStore(subscribe, getToasts, () => []);

  const groupedByPosition = toasts.reduce(
    (acc, t) => {
      const pos = t.position ?? defaultPosition;
      if (!acc[pos]) acc[pos] = [];
      acc[pos].push(t);
      return acc;
    },
    {} as Record<ToastPosition, Toast[]>,
  );

  return (
    <Portal>
      {Object.entries(groupedByPosition).map(([pos, positionToasts]) => (
        <div key={pos} className={`fx-toaster ${POSITION_CLASSES[pos as ToastPosition]}`}>
          {positionToasts.map((t) => (
            <div key={t.id} className="fx-toaster__item">
              <ToastItem toast={t} />
            </div>
          ))}
        </div>
      ))}
    </Portal>
  );
}
