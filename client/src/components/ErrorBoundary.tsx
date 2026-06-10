'use client';

import { Component, type ReactNode } from 'react';
import { captureError } from '@/utils/errorReporting';

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    captureError(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
          <p className="text-lg font-semibold text-slate-900 dark:text-white">Something went wrong.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-full bg-sky-500 px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
