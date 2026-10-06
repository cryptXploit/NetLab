import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useWorkspaceStore } from '../../../app/store/useWorkspaceStore';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Reset to home safely
    useWorkspaceStore.getState().setTab('home');
  };

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-base p-6 text-primary absolute inset-0 z-[1000]">
          <div className="bg-surface border border-border-strong rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
            <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-danger" />
            </div>
            <h2 className="text-2xl font-black mb-3">System Crash</h2>
            <p className="text-secondary text-sm mb-6 leading-relaxed">
              NETLAB encountered an unexpected error. Your offline data vault is safe.
            </p>
            <div className="bg-elevated text-left p-3 rounded-xl mb-6 overflow-x-auto text-xs font-mono text-muted border border-border">
              {this.state.error?.message || 'Unknown exception'}
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={this.handleReset}
                className="w-full py-4 bg-accent text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-accent/90 transition-colors"
              >
                <Home className="w-5 h-5" />
                Return to Home
              </button>
              <button 
                onClick={this.handleReload}
                className="w-full py-4 bg-transparent border border-border text-primary font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-elevated transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Reload Application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
