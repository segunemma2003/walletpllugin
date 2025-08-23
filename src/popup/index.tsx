import React from 'react';
import { createRoot } from 'react-dom/client';
import PopupApp from './App';
import '../index.css';

console.log('PayCio Wallet starting...');

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught error:', error, errorInfo);
    if (window.showError) {
      window.showError(`React error: ${error.message}`);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '2rem',
          textAlign: 'center',
          background: '#fee2e2',
          color: '#dc2626'
        }}>
          <h2 style={{ marginBottom: '1rem' }}>Something went wrong</h2>
          <p style={{ marginBottom: '1rem' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1rem',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}
          >
            Reload Extension
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Initialize the React app
function initializeApp() {
  try {
    const rootElement = document.getElementById('root');
    
    if (!rootElement) {
      throw new Error('Root element not found');
    }

    console.log('Creating React root...');
    const root = createRoot(rootElement);

    console.log('Rendering React app...');
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <PopupApp />
        </ErrorBoundary>
      </React.StrictMode>
    );

    // Hide loading screen
    setTimeout(() => {
      if (window.hideLoading) {
        window.hideLoading();
      }
    }, 100);

    console.log('PayCio Wallet initialized successfully');
  } catch (error) {
    console.error('Failed to initialize React app:', error);
    if (window.showError) {
      window.showError(`Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Add global error handling
window.addEventListener('error', (event) => {
  console.error('Global error in popup:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection in popup:', event.reason);
});

// Export for debugging
if (typeof window !== 'undefined') {
  (window as any).debugWallet = {
    reload: () => window.location.reload(),
    version: '2.0.0'
  };
}