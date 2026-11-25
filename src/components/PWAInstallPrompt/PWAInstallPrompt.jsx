import { useCallback, useEffect, useState } from 'react';

const DISMISSED_KEY = 'cineflix-pwa-install-dismissed';
const INSTALL_REQUEST_EVENT = 'cineflix-install-request';
const INSTALL_AVAILABILITY_EVENT = 'cineflix-install-availability';

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;

const PWAInstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const install = useCallback(async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setInstallPrompt(null);
  }, [installPrompt]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
      window.dispatchEvent(new CustomEvent(INSTALL_AVAILABILITY_EVENT, { detail: true }));
      if (!isStandalone() && localStorage.getItem(DISMISSED_KEY) !== 'true') {
        setIsVisible(true);
      }
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsVisible(false);
      window.dispatchEvent(new CustomEvent(INSTALL_AVAILABILITY_EVENT, { detail: false }));
    };

    const handleInstallRequest = () => {
      if (installPrompt) {
        install();
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener(INSTALL_REQUEST_EVENT, handleInstallRequest);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener(INSTALL_REQUEST_EVENT, handleInstallRequest);
    };
  }, [installPrompt, install]);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      className="fixed bottom-5 left-4 right-4 z-[9998] mx-auto flex max-w-md items-center gap-4 rounded-2xl border border-white/20 glass-modal p-4 text-white shadow-glass-lg"
      role="dialog"
      aria-label="Install CineFlix"
    >
      <img src="/icon.svg" alt="" className="h-10 w-10 rounded-xl object-contain glass-mirror p-1" />
      <div className="min-w-0 flex-1">
        <p className="font-bold text-sm">Install CineFlix</p>
        <p className="mt-0.5 text-xs text-gray-400">Get faster access to movies and live sports.</p>
      </div>
      <button
        type="button"
        onClick={install}
        className="shrink-0 rounded-xl glass-btn-primary px-4 py-2 text-xs font-bold transition shadow-neon-red cursor-pointer"
      >
        Install
      </button>
      <button
        type="button"
        onClick={dismiss}
        className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 glass-modal text-gray-300 hover:text-white cursor-pointer shadow-glass-sm"
        aria-label="Dismiss install prompt"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </aside>
  );
};

export default PWAInstallPrompt;
