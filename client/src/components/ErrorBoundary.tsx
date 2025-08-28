import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Alert } from 'react-bootstrap';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      // Render fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="container mt-5">
          <Alert variant="danger">
            <Alert.Heading>Something went wrong</Alert.Heading>
            <p>
              We're sorry, but an unexpected error occurred. Our team has been notified.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-3">
                <h6>Error Details:</h6>
                <pre className="bg-dark text-light p-3 rounded">
                  {this.state.error?.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}
            <div className="mt-3">
              <Button variant="primary" onClick={this.handleReset} className="me-2">
                Try Again
              </Button>
              <Button variant="outline-secondary" onClick={this.handleReload}>
                Reload Page
              </Button>
            </div>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
