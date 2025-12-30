import {
  Component,
  type ErrorInfo,
  forwardRef,
  type ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { useLocation } from 'react-router';
import { APIError } from '@/api/eden-treaty';
import Error403 from './Error403';
import Error404 from './Error404';
import Error500 from './Error500';

// =============================================================================
// ERROR FALLBACK
// =============================================================================

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  if (error instanceof APIError) {
    if (error.is(403)) return <Error403 />;
    if (error.is(404)) return <Error404 />;
  }

  return <Error500 resetError={resetError} />;
}

// =============================================================================
// ERROR BOUNDARY CLASS
// =============================================================================

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((props: ErrorFallbackProps) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryHandle {
  resetError: () => void;
}

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: null });
  };

  override render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback({
            error: this.state.error,
            resetError: this.resetError,
          });
        }
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

// =============================================================================
// ERROR BOUNDARY WITH ROUTE RESET
// =============================================================================

const ErrorBoundaryInner = forwardRef<ErrorBoundaryHandle, Props>(
  function ErrorBoundaryInner(props, ref) {
    const classRef = useRef<ErrorBoundaryClass>(null);

    useImperativeHandle(ref, () => ({
      resetError: () => {
        classRef.current?.resetError();
      },
    }));

    return <ErrorBoundaryClass ref={classRef} {...props} />;
  },
);

function ErrorBoundaryWithReset(props: Props) {
  const location = useLocation();
  const errorBoundaryRef = useRef<ErrorBoundaryHandle>(null);
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;
      errorBoundaryRef.current?.resetError();
    }
  }, [location.pathname]);

  return <ErrorBoundaryInner ref={errorBoundaryRef} {...props} />;
}

// =============================================================================
// EXPORTS
// =============================================================================

export function ErrorBoundary(props: Props) {
  return <ErrorBoundaryWithReset {...props} />;
}

export default ErrorBoundary;
