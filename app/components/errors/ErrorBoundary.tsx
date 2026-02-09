import { Component, type ErrorInfo, type ReactNode, useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { APIError } from '@/api/eden-treaty';
import Error403 from './Error403';
import Error404 from './Error404';
import Error500 from './Error500';

interface ErrorFallbackProps {
  error: Error;
}

function ErrorFallback({ error }: ErrorFallbackProps) {
  if (error instanceof APIError) {
    if (error.is(403)) return <Error403 />;
    if (error.is(404)) return <Error404 />;
  }

  return <Error500 />;
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((props: ErrorFallbackProps) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
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
    this.setState({ hasError: false, error: null });
  };

  override render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback({ error: this.state.error });
        }
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

function ErrorBoundaryWithRouteReset(props: Props) {
  const location = useLocation();
  const errorBoundaryRef = useRef<ErrorBoundaryClass>(null);
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;
      errorBoundaryRef.current?.resetError();
    }
  }, [location.pathname]);

  return <ErrorBoundaryClass ref={errorBoundaryRef} {...props} />;
}

export function ErrorBoundary(props: Props) {
  return <ErrorBoundaryWithRouteReset {...props} />;
}

export default ErrorBoundary;
