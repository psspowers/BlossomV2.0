
import { createRoot } from 'react-dom/client'
import { Component, type ReactNode } from 'react'
import App from './App.tsx'
import './index.css'
import './i18n'

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary] Caught error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <div className="text-sage-600 text-xl font-serif font-medium mb-3">Blossom</div>
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 mb-5">
              <p className="text-rose-700 text-sm font-medium mb-1">Something went wrong</p>
              <p className="text-rose-500 text-xs">
                {this.state.error?.message ?? 'An unexpected error occurred.'}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-slate-800 text-white rounded-2xl text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
