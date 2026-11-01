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
      className="fixed bottom-5 left-4 right-4 z-[9998] mx-auto flex max-w-md items-center gap-4 rounded-2xl border border-white/10 bg-[#181818]/95 p-4 text-white shadow-2xl shadow-black/50 backdrop-blur-xl"
      role="dialog"
      aria-label="Install CineFlix"
    >
      <img src="/icon.svg" alt="" className="h-10 w-10 rounded object-contain" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">Install CineFlix</p>
        <p className="mt-1 text-xs text-gray-400">Get quicker access to your entertainment.</p>
      </div>
      <button
        type="button"
        onClick={install}
        className="shrink-0 rounded-lg bg-[#E50914] px-3 py-2 text-sm font-semibold transition hover:bg-[#f51b26]"
      >
        Install
      </button>
      <button
        type="button"
        onClick={dismiss}
        className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-[#292929] text-gray-300 hover:text-white"
        aria-label="Dismiss install prompt"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </aside>
  );
};

export default PWAInstallPrompt;
