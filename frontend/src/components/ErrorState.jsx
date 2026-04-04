/**
 * Error State Components
 * Handles error display with retry functionality
 */

import React from 'react';
import './ErrorState.css';

// Generic Error State
export const ErrorState = ({ 
  title = 'Something went wrong',
  message = 'An error occurred while loading data.',
  onRetry = null,
  retryText = 'Retry',
  showRetry = true,
  icon = '⚠️'
}) => (
  <div className="error-state">
    <div className="error-icon">{icon}</div>
    <h3 className="error-title">{title}</h3>
    <p className="error-message">{message}</p>
    {showRetry && onRetry && (
      <button className="error-retry-btn" onClick={onRetry}>
        {retryText}
      </button>
    )}
  </div>
);

// Network Error
export const NetworkError = ({ onRetry }) => (
  <ErrorState
    title="Connection Lost"
    message="Unable to connect to the server. Please check your internet connection and try again."
    onRetry={onRetry}
    icon="📡"
  />
);

// Not Found Error
export const NotFoundError = ({ 
  resource = 'resource',
  onBack = null 
}) => (
  <ErrorState
    title="Not Found"
    message={`The ${resource} you're looking for doesn't exist or has been removed.`}
    onRetry={onBack}
    retryText="Go Back"
    showRetry={!!onBack}
    icon="🔍"
  />
);

// Permission Error
export const PermissionError = ({ onBack = null }) => (
  <ErrorState
    title="Access Denied"
    message="You don't have permission to view this content."
    onRetry={onBack}
    retryText="Go Back"
    showRetry={!!onBack}
    icon="🔒"
  />
);

// Server Error
export const ServerError = ({ onRetry }) => (
  <ErrorState
    title="Server Error"
    message="Our servers encountered an error. Our team has been notified. Please try again later."
    onRetry={onRetry}
    icon="🔧"
  />
);

// Empty State (not technically an error, but similar UI)
export const EmptyState = ({ 
  title = 'No data',
  message = 'No items to display.',
  actionText = null,
  onAction = null,
  icon = '📭'
}) => (
  <div className="empty-state">
    <div className="empty-icon">{icon}</div>
    <h3 className="empty-title">{title}</h3>
    <p className="empty-message">{message}</p>
    {actionText && onAction && (
      <button className="empty-action-btn" onClick={onAction}>
        {actionText}
      </button>
    )}
  </div>
);

// Error Boundary Fallback
export const ErrorBoundaryFallback = ({ error, resetError }) => (
  <div className="error-boundary-fallback">
    <ErrorState
      title="Application Error"
      message="The application encountered an unexpected error. Please refresh the page."
      onRetry={resetError}
      retryText="Reload Page"
      icon="💥"
    />
    {process.env.NODE_ENV === 'development' && (
      <details className="error-details">
        <summary>Error Details</summary>
        <pre>{error.toString()}</pre>
      </details>
    )}
  </div>
);

// Inline Error (for forms)
export const InlineError = ({ message }) => (
  <div className="inline-error">
    <span className="inline-error-icon">⚠️</span>
    <span className="inline-error-message">{message}</span>
  </div>
);

// Toast/Notification Error
export const ErrorToast = ({ message, onClose }) => (
  <div className="error-toast">
    <span className="error-toast-icon">❌</span>
    <span className="error-toast-message">{message}</span>
    <button className="error-toast-close" onClick={onClose}>
      ✕
    </button>
  </div>
);

// Component-level error wrapper
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Log to error tracking service (e.g., Sentry)
    if (window.errorTracker) {
      window.errorTracker.captureException(error, { errorInfo });
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorBoundaryFallback 
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

export default {
  ErrorState,
  NetworkError,
  NotFoundError,
  PermissionError,
  ServerError,
  EmptyState,
  ErrorBoundaryFallback,
  InlineError,
  ErrorToast,
  ErrorBoundary
};
