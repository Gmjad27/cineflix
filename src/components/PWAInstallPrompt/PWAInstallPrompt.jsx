import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

export default function PWAInstallPrompt() {
    const [installPrompt, setInstallPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Listen for the install prompt
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setInstallPrompt(e);
            setShowPrompt(true);
        };

        // Listen for app installed event
        const handleAppInstalled = () => {
            setInstallPrompt(null);
            setShowPrompt(false);
            setIsInstalled(true);
        };

        // Check if PWA is already installed
        const checkInstalled = () => {
            const isStandalone =
                window.matchMedia('(display-mode: standalone)').matches ||
                (window.navigator).standalone === true;
            setIsInstalled(isStandalone);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);
        window.addEventListener('load', checkInstalled);

        checkInstalled();

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
            window.removeEventListener('load', checkInstalled);
        };
    }, []);

    const handleInstall = async () => {
        if (!installPrompt) return;

        installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;

        if (outcome === 'accepted') {
            setInstallPrompt(null);
            setShowPrompt(false);
            setIsInstalled(true);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
    };

    if (isInstalled || !showPrompt || !installPrompt) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg shadow-lg p-4 max-w-sm z-50 animate-slideUp">
            <div className="flex items-start gap-3">
                <Download className="w-6 h-6 flex-shrink-0 mt-1" />
                <div className="flex-grow">
                    <h3 className="font-semibold text-lg mb-1">Install CINEFLIX</h3>
                    <p className="text-sm text-red-100 mb-3">
                        Watch your favorite movies and shows offline. Install our app for a better experience!
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={handleInstall}
                            className="flex-1 bg-white text-red-600 font-semibold py-2 px-4 rounded hover:bg-red-50 transition-colors"
                        >
                            Install
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition-colors"
                        >
                            Remind Later
                        </button>
                    </div>
                </div>
                <button
                    onClick={handleDismiss}
                    className="text-red-200 hover:text-white flex-shrink-0"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}
