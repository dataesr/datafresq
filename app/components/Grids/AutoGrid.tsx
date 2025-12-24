import type { CSSProperties } from 'react';
import './styles.css';

export interface CustomCSSProperties extends CSSProperties {
  '--fx-grid-min': string;
}
// src/client/components/Grid.tsx
interface AutoGridProps {
  type?: 'fit' | 'fill';
  min?: number;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  className?: string;
}

export function AutoGrid({
  type = 'fit',
  min = 400,
  gap = 'md',
  children,
  className = '',
}: AutoGridProps) {
  return (
    <div
      className={`fx-grid--auto-${type} fx-grid--auto-${type}-${gap} ${className}`}
      style={{ '--fx-grid-min': `${min}px` } as CustomCSSProperties}
    >
      {children}
    </div>
  );
}
