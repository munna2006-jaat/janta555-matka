import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Admin Portal:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAF7F2',
          padding: 20,
          fontFamily: 'Outfit, sans-serif'
        }}>
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: 28,
            maxWidth: 440,
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>⚠️</div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#DC2626', marginBottom: 8 }}>
              Dashboard Notice
            </h2>
            <p style={{ fontSize: 13, color: '#64748B', marginBottom: 18 }}>
              {this.state.error?.message || 'Something went wrong while displaying this section.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              style={{
                background: '#0F172A',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                padding: '10px 20px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Reload Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
