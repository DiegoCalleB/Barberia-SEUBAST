import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    // @ts-ignore
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    // @ts-ignore
    if (this.state.hasError) {
      let errorMessage = 'Algo salió mal.';
      try {
        // @ts-ignore
        if (this.state.error?.message) {
          // @ts-ignore
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error) {
            errorMessage = `Error de base de datos: ${parsed.error}`;
          }
        }
      } catch (e) {
        // @ts-ignore
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-6">
            <h1 className="serif-display text-4xl text-primary">Lo sentimos</h1>
            <p className="text-on-surface-variant">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-on-primary px-8 py-3 rounded-sm font-label uppercase text-xs tracking-widest font-bold"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    // @ts-ignore
    return this.props.children;
  }
}
