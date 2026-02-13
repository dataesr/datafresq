import cn from 'classnames';
import { type CSSProperties, createContext, type ReactNode, useContext, useState } from 'react';
import { Link } from 'react-router';
import './styles.css';

type TabnavContextValue = {
  closeMenu: () => void;
};

const TabnavContext = createContext<TabnavContextValue | null>(null);

function useTabnavContext() {
  const context = useContext(TabnavContext);
  if (!context) throw new Error('Tabnav.Item must be used within Tabnav.Root');
  return context;
}

type BreakpointSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type RootProps = {
  children: ReactNode;
  className?: string;
  color?: string;
  currentLabel?: string;
  /**
   * Breakpoint size for when the tabnav collapses into a dropdown menu.
   * - xs: 480px (30rem)
   * - sm: 640px (40rem)
   * - md: 768px (48rem)
   * - lg: 960px (60rem) [default]
   * - xl: 1280px (80rem)
   */
  breakpoint?: BreakpointSize;
};

export function Tabnav({
  children,
  className,
  color,
  currentLabel = 'Menu',
  breakpoint = 'lg',
}: RootProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev);
  };

  const closeMenu = () => {
    setIsExpanded(false);
  };

  const style: CSSProperties | undefined = color
    ? ({
        '--tabnav-active-color': `var(--artwork-major-${color})`,
        '--tabnav-btn-color': `var(--artwork-major-${color})`,
        '--tabnav-btn-bg': `var(--artwork-background-${color})`,
      } as CSSProperties)
    : undefined;

  return (
    <TabnavContext.Provider value={{ closeMenu }}>
      <nav className={cn('tabnav', `tabnav--${breakpoint}`, className)} style={style}>
        <div className="tabnav__collapse">
          <button
            aria-expanded={isExpanded}
            type="button"
            className="tabnav__btn"
            onClick={toggleExpanded}
          >
            {currentLabel}
          </button>
        </div>
        <ul className={cn('tabnav__list', { 'tabnav__list--open': isExpanded })}>
          {children}
        </ul>
      </nav>
    </TabnavContext.Provider>
  );
}

type ItemProps = {
  to: string;
  children: ReactNode;
  icon?: string;
  iconActive?: string;
  grow?: boolean;
  active?: boolean;
  disabled?: boolean;
};

export function TabnavItem({ to, children, icon, iconActive, grow, active, disabled }: ItemProps) {
  const { closeMenu } = useTabnavContext();

  return (
    <li style={grow ? { flexGrow: 1 } : undefined}>
      {disabled ? (
        <span
          className="tabnav__tab tabnav__tab--disabled"
          aria-disabled="true"
          title="Bientôt disponible"
        >
          {icon && (
            <span
              className={cn('fr-icon--sm fr-mr-1w', icon)}
              aria-hidden="true"
            />
          )}
          {children}
        </span>
      ) : (
        <Link
          className="tabnav__tab"
          aria-current={active ? 'page' : undefined}
          to={to}
          onClick={closeMenu}
        >
          {(icon || iconActive) && (
            <span
              className={cn('fr-icon--sm fr-mr-1w', active ? iconActive : icon)}
              aria-hidden="true"
            />
          )}
          {children}
        </Link>
      )}
    </li>
  );
}
