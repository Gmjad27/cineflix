import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Lazy loading failed:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

            return (
                <div className="min-h-[50vh] flex items-center justify-center p-6 bg-[#07070a]">
                    <div className="glass-modal max-w-md p-8 rounded-3xl text-center border border-white/15 shadow-glass-lg">
                        <div className="w-16 h-16 rounded-2xl glass-mirror flex items-center justify-center mx-auto mb-4 text-[#E50914] shadow-neon-red">
                            <i className={`fa-solid ${isOffline ? 'fa-wifi-slash' : 'fa-triangle-exclamation'} text-2xl`} />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">
                            {isOffline ? 'Connection Lost' : 'Something went wrong loading this section.'}
                        </h2>
                        <p className="text-sm text-gray-400 mb-6">
                            {isOffline
                                ? 'Unable to load page assets while offline. Check your internet connection and reload.'
                                : 'A temporary error occurred while rendering the content.'}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="glass-btn-primary px-6 py-2.5 text-sm font-bold text-white rounded-xl shadow-neon-red cursor-pointer"
                        >
                            {isOffline ? 'Retry Connection' : 'Reload Page'}
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;