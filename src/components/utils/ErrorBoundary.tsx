
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', color: 'red', backgroundColor: 'white', height: '100vh', overflow: 'auto' }}>
                    <h1>💥 Alguna cosa ha anat malament.</h1>
                    <h2 style={{ fontSize: '1.2em', marginTop: '20px' }}>Error:</h2>
                    <pre style={{ backgroundColor: '#fff0f0', padding: '10px', borderRadius: '5px' }}>
                        {this.state.error?.toString()}
                    </pre>
                    <h2 style={{ fontSize: '1.2em', marginTop: '20px' }}>Component Stack:</h2>
                    <pre style={{ fontSize: '0.8em', backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '5px' }}>
                        {this.state.errorInfo?.componentStack}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ marginTop: '20px', padding: '10px 20px', fontSize: '1.2em', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}
                    >
                        Recarregar App
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
