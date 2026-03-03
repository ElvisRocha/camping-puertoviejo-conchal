import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  // Track retries so we don't loop forever on a hard (non-transient) error.
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log the full error + component stack so it's visible in production
    // monitoring tools (Sentry, Datadog, browser console, etc.)
    console.error('[ErrorBoundary] Uncaught error:', error);
    console.error('[ErrorBoundary] Component stack:', info.componentStack);
  }

  handleReset = () => {
    // First try an in-app state reset (no full page reload).
    // This works for transient errors (chunk load failure, race condition).
    // If the error recurs immediately, the next click will do a hard reload.
    if (this.state.retryCount < 2) {
      this.setState((s) => ({
        hasError: false,
        error: null,
        retryCount: s.retryCount + 1,
      }));
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      const isRetrying = this.state.retryCount < 2;
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-8">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Something went wrong
            </h1>
            <p className="text-muted-foreground mb-6">
              We're sorry for the inconvenience. Please try refreshing the page.
            </p>
            <button
              onClick={this.handleReset}
              className="px-6 py-3 bg-forest text-white rounded-lg hover:bg-forest/90 transition-colors"
            >
              {isRetrying ? 'Try Again' : 'Refresh Page'}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
