/* ========================================
   ERROR BOUNDARY COMPONENT
   Ethiopian Federal Healthcare Platform
   ======================================== */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <AlertCircle size={40} style={{ color: '#ef4444' }} />
          </div>

          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#1f2937',
              marginBottom: '0.5rem',
            }}
          >
            Something went wrong
          </h2>

          <p
            style={{
              fontSize: '1rem',
              color: '#6b7280',
              marginBottom: '1.5rem',
              maxWidth: '500px',
            }}
          >
            We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
          </p>

          {import.meta.env.DEV && this.state.error && (
            <details
              style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                textAlign: 'left',
                maxWidth: '600px',
                width: '100%',
              }}
            >
              <summary
                style={{
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '0.5rem',
                }}
              >
                Error Details (Development Only)
              </summary>
              <pre
                style={{
                  fontSize: '0.875rem',
                  color: '#ef4444',
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {this.state.error.toString()}
                {'\n\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button
              variant="primary"
              leftIcon={<RefreshCw size={18} />}
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
            <Button variant="ghost" onClick={this.handleReset}>
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
