import React, { Component, ErrorInfo, ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Guardiões das Chaves:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '1.5rem', fontFamily: 'sans-serif' }}>
          <div style={{ maxWidth: '420px', width: '100%', backgroundColor: '#ffffff', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
              !
            </div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
              Guardiões das Chaves
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Ocorreu uma instabilidade momentânea ao carregar os dados. Clique abaixo para reiniciar o aplicativo.
            </p>
            <button
              onClick={() => {
                try {
                  localStorage.clear();
                } catch (e) {
                  console.warn(e);
                }
                window.location.reload();
              }}
              style={{ width: '100%', backgroundColor: '#00995D', color: '#ffffff', border: 'none', borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Reiniciar Aplicativo
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
}
