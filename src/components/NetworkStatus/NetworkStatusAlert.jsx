import React from 'react';
import { useNetworkStatus } from '../../context/NetworkContext';

const NetworkStatusAlert = () => {
  const {
    isOnline,
    isWeak,
    wasOffline,
    downlink,
    effectiveType,
    isChecking,
    weakDismissed,
    dismissWeakWarning,
    checkConnection,
  } = useNetworkStatus();

  // If user is online, not weak (or dismissed), and not in reconnected state, show nothing
  const showOffline = !isOnline;
  const showBackOnline = isOnline && wasOffline;
  const showWeak = isOnline && isWeak && !weakDismissed && !wasOffline;

  if (!showOffline && !showBackOnline && !showWeak) {
    return null;
  }

  return (
    <aside
      aria-live="polite"
      role="alert"
      className="fixed top-16 md:top-20 left-1/2 -translate-x-1/2 z-[9990] w-[94%] max-w-lg transition-all duration-500 ease-out animate-in fade-in slide-in-from-top-4"
    >
      {/* ── 1. NO INTERNET / OFFLINE BANNER ── */}
      {showOffline && (
        <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#18080a]/95 via-[#1c080b]/95 to-[#150708]/95 border border-red-500/50 shadow-[0_12px_40px_rgba(229,9,20,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-2xl text-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-red-600/25 border border-red-500/40 text-[#E50914] shadow-[0_0_15px_rgba(229,9,20,0.5)] shrink-0">
              <span className="absolute inset-0 rounded-xl animate-ping bg-red-500/20" />
              <i className="fa-solid fa-wifi-slash text-base sm:text-lg" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs sm:text-sm font-bold text-white tracking-wide">
                  No Internet Connection
                </p>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                  Offline
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-300 truncate">
                Please check your Wi-Fi or cellular network settings.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => checkConnection()}
            disabled={isChecking}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-xs font-bold text-white transition-all shadow-[0_0_15px_rgba(229,9,20,0.4)] cursor-pointer disabled:opacity-60 shrink-0"
            title="Retry Internet Connection"
          >
            <i className={`fa-solid fa-arrows-rotate text-xs ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Checking...' : 'Retry'}</span>
          </button>
        </div>
      )}

      {/* ── 2. BACK ONLINE NOTIFICATION ── */}
      {showBackOnline && (
        <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#07190f]/95 via-[#082012]/95 to-[#06170d]/95 border border-emerald-500/50 shadow-[0_12px_40px_rgba(16,185,129,0.35),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-2xl text-emerald-100 animate-bounce-once">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)] shrink-0">
              <i className="fa-solid fa-circle-check text-base sm:text-lg" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs sm:text-sm font-bold text-white tracking-wide">
                  Back Online!
                </p>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Connected
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-emerald-200/90 truncate">
                Your internet connection has been successfully restored.
              </p>
            </div>
          </div>
          <div className="text-emerald-400 text-xs shrink-0 flex items-center gap-1 font-semibold">
            <i className="fa-solid fa-wifi text-xs" />
          </div>
        </div>
      )}

      {/* ── 3. WEAK INTERNET ALERT ── */}
      {showWeak && (
        <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#1c1306]/95 via-[#231707]/95 to-[#1a1105]/95 border border-amber-500/50 shadow-[0_12px_40px_rgba(245,158,11,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-2xl text-amber-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/25 border border-amber-500/40 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] shrink-0">
              <i className="fa-solid fa-gauge-simple-low text-base sm:text-lg animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs sm:text-sm font-bold text-white tracking-wide">
                  Weak Internet Connection
                </p>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/25 text-amber-300 border border-amber-500/30">
                  {effectiveType && effectiveType !== 'unknown' ? effectiveType.toUpperCase() : 'Slow'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-amber-200/80 truncate">
                {downlink ? `Speed ~${downlink} Mbps. ` : ''}
                Video streams may buffer or load in lower quality.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => checkConnection()}
              disabled={isChecking}
              className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-semibold transition border border-amber-500/30 cursor-pointer disabled:opacity-50"
              title="Test connection"
            >
              <i className={`fa-solid fa-arrows-rotate text-[11px] ${isChecking ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={dismissWeakWarning}
              className="p-1.5 rounded-lg text-amber-300/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
              aria-label="Dismiss weak network notice"
              title="Dismiss"
            >
              <i className="fa-solid fa-xmark text-sm" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default NetworkStatusAlert;
