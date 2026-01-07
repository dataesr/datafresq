interface SkeletonProps {
  width?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | number | string;
  height?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Skeleton component for loading states.
 * Displays an animated placeholder that mimics text or content.
 */
export function Skeleton({ width = 'md', height, className = '', style }: SkeletonProps) {
  const widthClass =
    typeof width === 'string' && ['sm', 'md', 'lg', 'xl', 'full'].includes(width)
      ? `skeleton-text--${width}`
      : '';

  const customWidth =
    typeof width === 'number'
      ? `${width}px`
      : typeof width === 'string' && !['sm', 'md', 'lg', 'xl', 'full'].includes(width)
        ? width
        : undefined;

  return (
    <span
      className={`skeleton-text ${widthClass} ${className}`.trim()}
      style={{
        ...(customWidth ? { width: customWidth } : {}),
        ...(height ? { height } : {}),
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

interface SkeletonTextProps {
  children: React.ReactNode;
  isLoading: boolean;
  width?: SkeletonProps['width'];
}

/**
 * Wrapper component that shows skeleton when loading, otherwise shows children.
 * Use this to wrap existing content that should show as skeleton during loading.
 */
export function SkeletonText({ children, isLoading, width = 'md' }: SkeletonTextProps) {
  if (isLoading) {
    return <Skeleton width={width} />;
  }
  return <>{children}</>;
}

export default Skeleton;
