import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Log to error reporting service if available
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // TODO: Integrate with error tracking service (e.g., Sentry, LogRocket)
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Store in localStorage as backup
    try {
      const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      errors.push(errorData);
      // Keep only last 10 errors
      localStorage.setItem('app_errors', JSON.stringify(errors.slice(-10)));
    } catch (e) {
      console.error('Failed to log error to localStorage', e);
    }
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="max-w-2xl w-full space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>
                The application encountered an unexpected error. This has been logged
                and our team will investigate.
              </AlertDescription>
            </Alert>

            <div className="bg-card border rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-lg">Error Details</h3>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Message:</p>
                <p className="text-sm font-mono bg-muted p-3 rounded">
                  {this.state.error?.message}
                </p>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
                <details className="space-y-2">
                  <summary className="text-sm font-medium text-muted-foreground cursor-pointer">
                    Stack Trace (Development Only)
                  </summary>
                  <pre className="text-xs font-mono bg-muted p-3 rounded overflow-auto max-h-64">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}

              <div className="flex gap-3 pt-4">
                <Button onClick={this.handleReset} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={this.handleReload}>
                  Reload Page
                </Button>
              </div>

              <p className="text-xs text-muted-foreground pt-2">
                If this problem persists, please contact support with the error details above.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
