export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('[PWA] Service Workers not supported');
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    })
    .then((registration) => {
      console.log('[PWA] Service Worker registered successfully:', registration);

      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60000); // Check every 60 seconds

      // Listen for new service worker
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available
            console.log('[PWA] New version available');
            // You can notify the user here
            window.dispatchEvent(new CustomEvent('pwa-update-available'));
          }
        });
      });
    })
    .catch((error) => {
      console.error('[PWA] Service Worker registration failed:', error);
    });

    // Listen for service worker controller change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[PWA] Service Worker controller changed - app updated');
      window.location.reload();
    });
  });
}

export function promptInstallPWA() {
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event for later use
    deferredPrompt = e;
    console.log('[PWA] Install prompt available');
    // Dispatch custom event so components can listen
    window.dispatchEvent(new CustomEvent('pwa-installable', { detail: { prompt: deferredPrompt } }));
  });

  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed');
    deferredPrompt = null;
  });

  return () => deferredPrompt;
}

export async function installPWA(deferredPrompt) {
  if (!deferredPrompt) {
    console.log('[PWA] Installation prompt not available');
    return;
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`[PWA] User response to install prompt: ${outcome}`);
  return outcome === 'accepted';
}

export function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
}

export function isRunningAsPWA() {
  return isStandalone() || document.referrer.includes('android-app://');
}
