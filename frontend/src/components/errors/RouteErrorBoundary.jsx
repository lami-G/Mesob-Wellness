import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Route-level Error Boundary
 * Provides fallback UI for individual route errors
 */
class RouteErrorBoundaryClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Route Error]', error, errorInfo);
    
    // Log to monitoring service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <RouteErrorFallback
          error={this.state.error}
          reset={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Fallback UI for route errors
 */
function RouteErrorFallback({ error, reset }) {
  const navigate = useNavigate();

  const handleGoHome = () => {
    reset();
    navigate('/');
  };

  const handleGoBack = () => {
    reset();
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-md p-8">
        {/* Error Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Error Title */}
        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
          Page Error
        </h2>

        {/* Error Description */}
        <p className="text-gray-600 text-center mb-6">
          This page encountered an error and couldn't load properly.
        </p>

        {/* Error Details (Development) */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mb-6 p-3 bg-gray-100 rounded text-sm font-mono text-red-600 overflow-auto max-h-32">
            {error.toString()}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={reset}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={handleGoBack}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Go Back
          </button>
        </div>

        {/* Secondary Action */}
        <div className="mt-4 text-center">
          <button
            onClick={handleGoHome}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Wrapper component to use hooks in error boundary
 */
export default function RouteErrorBoundary({ children, onError }) {
  return (
    <RouteErrorBoundaryClass onError={onError}>
      {children}
    </RouteErrorBoundaryClass>
  );
}
