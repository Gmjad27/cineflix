import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

const NetworkContext = createContext(null);

export const NetworkProvider = ({ children }) => {
  // Base online status from navigator
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      return navigator.onLine;
    }
    return true;
  });

  // Network quality metrics
  const [effectiveType, setEffectiveType] = useState('unknown');
  const [downlink, setDownlink] = useState(null);
  const [rtt, setRtt] = useState(null);
  const [saveData, setSaveData] = useState(false);
  const [latency, setLatency] = useState(null);
  const [isWeak, setIsWeak] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Reconnection notification flag (true for 3.5s after returning online)
  const [wasOffline, setWasOffline] = useState(false);
  const prevOnlineRef = useRef(isOnline);

  // Weak warning dismiss state
  const [weakDismissed, setWeakDismissed] = useState(false);

  // Read Network Information API
  const readConnectionApi = useCallback(() => {
    if (typeof navigator === 'undefined') return;
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
      setEffectiveType(conn.effectiveType || 'unknown');
      setDownlink(typeof conn.downlink === 'number' ? conn.downlink : null);
      setRtt(typeof conn.rtt === 'number' ? conn.rtt : null);
      setSaveData(Boolean(conn.saveData));

      // Weak if 2g/slow-2g, low downlink (< 0.8 Mbps), or very high rtt (> 1400ms)
      const slowEffective = conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g';
      const slowDownlink = typeof conn.downlink === 'number' && conn.downlink > 0 && conn.downlink < 0.8;
      const highRtt = typeof conn.rtt === 'number' && conn.rtt > 1400;

      return slowEffective || slowDownlink || highRtt;
    }
    return false;
  }, []);

  // Active ping check with 4-second timeout to verify real reachability
  const checkConnection = useCallback(async () => {
    setIsChecking(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const startTime = performance.now();

    try {
      // Ping a static asset with cache-busting to bypass browser disk cache
      const response = await fetch(`/cineflix.png?_ping=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const measuredLatency = Math.round(performance.now() - startTime);
      setLatency(measuredLatency);

      const connIsWeak = readConnectionApi();
      const highLatency = measuredLatency > 2500;
      const detectedWeak = connIsWeak || highLatency;

      setIsOnline(true);
      setIsWeak(detectedWeak);
      setIsChecking(false);

      return {
        isOnline: true,
        isWeak: detectedWeak,
        latency: measuredLatency,
      };
    } catch (err) {
      clearTimeout(timeoutId);
      setIsChecking(false);

      // If navigator says offline, or if request failed completely, treat as offline
      const reallyOffline = !navigator.onLine || err.name === 'AbortError' || err instanceof TypeError;
      if (reallyOffline) {
        setIsOnline(false);
        setIsWeak(false);
      }

      return {
        isOnline: !reallyOffline,
        isWeak: true,
        latency: null,
      };
    }
  }, [readConnectionApi]);

  // Initial and reactive event listeners for online/offline and connection changes
  useEffect(() => {
    const handleOnline = () => {
      // Run quick ping check to confirm true internet reachability
      checkConnection().then((res) => {
        if (res.isOnline && !prevOnlineRef.current) {
          setWasOffline(true);
          // Auto-hide the "Back Online" notification after 3.5s
          setTimeout(() => {
            setWasOffline(false);
          }, 3500);
        }
        prevOnlineRef.current = res.isOnline;
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsWeak(false);
      prevOnlineRef.current = false;
      setWeakDismissed(false); // Reset dismiss so when user reconnects with weak internet, they get alerted
    };

    const handleConnectionChange = () => {
      const slow = readConnectionApi();
      setIsWeak(slow);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn && conn.addEventListener) {
      conn.addEventListener('change', handleConnectionChange);
    }

    // Initial inspection
    readConnectionApi();
    // Run an initial ping in background after a slight delay
    const initialTimer = setTimeout(() => {
      checkConnection();
    }, 1500);

    // Periodic heartbeat every 45s while window is visible
    const heartbeat = setInterval(() => {
      if (document.visibilityState === 'visible') {
        checkConnection();
      }
    }, 45000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (conn && conn.removeEventListener) {
        conn.removeEventListener('change', handleConnectionChange);
      }
      clearTimeout(initialTimer);
      clearInterval(heartbeat);
    };
  }, [checkConnection, readConnectionApi]);

  // User dismiss action for weak warning
  const dismissWeakWarning = useCallback(() => {
    setWeakDismissed(true);
  }, []);

  // Compute qualitative network state
  const networkQuality = !isOnline
    ? 'offline'
    : isWeak
    ? 'poor'
    : effectiveType === '3g'
    ? 'fair'
    : 'good';

  const value = {
    isOnline,
    isWeak,
    networkQuality,
    effectiveType,
    downlink,
    rtt,
    saveData,
    latency,
    isChecking,
    wasOffline,
    weakDismissed,
    dismissWeakWarning,
    checkConnection,
  };

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
};

export const useNetworkStatus = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    // Graceful fallback if used outside provider
    return {
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      isWeak: false,
      networkQuality: 'good',
      effectiveType: 'unknown',
      downlink: null,
      rtt: null,
      saveData: false,
      latency: null,
      isChecking: false,
      wasOffline: false,
      weakDismissed: false,
      dismissWeakWarning: () => {},
      checkConnection: async () => ({ isOnline: true }),
    };
  }
  return context;
};
