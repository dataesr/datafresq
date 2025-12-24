import './styles.css';

export default function PillsTitle({
  as = 'h2',
  children,
  icon,
  className = '',
}: React.PropsWithChildren<{ as: React.ElementType; icon?: string; className?: string }>) {
  const Tag = as;
  return (
    <Tag className={`fx-pills--title ${className}`}>
      {icon && <span className={`${icon} fr-mr-2v`} aria-hidden="true" />}
      {children}
    </Tag>
  );
}
