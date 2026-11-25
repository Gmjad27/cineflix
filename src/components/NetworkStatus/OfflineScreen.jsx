import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNetworkStatus } from '../../context/NetworkContext';

const OfflineScreen = ({ onRetry, title, message }) => {
  const navigate = useNavigate();
  const { isOnline, checkConnection, isChecking } = useNetworkStatus();
  const [retryStatus, setRetryStatus] = useState(null);

  // Check if user has saved items in localStorage
  const hasSavedItems = (() => {
    try {
      const raw = localStorage.getItem('El');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) && parsed.length > 0;
    } catch {
      return false;
    }
  })();

  const handleRetry = async () => {
    setRetryStatus('checking');
    const result = await checkConnection();
    if (result.isOnline) {
      setRetryStatus('success');
      if (onRetry) {
        onRetry();
      } else {
        window.location.reload();
      }
    } else {
      setRetryStatus('failed');
      setTimeout(() => setRetryStatus(null), 3000);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-[#07070a] text-white">
      <div className="relative w-full max-w-lg p-6 sm:p-10 rounded-3xl glass-modal border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.85)] text-center overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-red-600/15 blur-3xl pointer-events-none" />

        {/* Radar / Offline Icon */}
        <div className="relative mx-auto mb-6 flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-red-950/80 to-black/80 border border-red-500/40 shadow-[0_0_35px_rgba(229,9,20,0.35)]">
          <span className="absolute inset-0 rounded-3xl animate-ping bg-red-600/10" />
          <i className="fa-solid fa-wifi-slash text-3xl sm:text-4xl text-[#E50914] drop-shadow-[0_0_12px_rgba(229,9,20,0.8)]" />
        </div>

        {/* Title & Description */}
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
          {title || "You're Offline"}
        </h1>
        <p className="text-sm sm:text-base text-gray-300/90 max-w-md mx-auto mb-6 leading-relaxed">
          {message ||
            "It looks like you've lost your internet connection. Cineflix requires an active connection to fetch movie details and live broadcasts."}
        </p>

        {/* Diagnostics Info Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-gray-400 mb-8 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span>Status: Disconnected</span>
          <span className="text-gray-600">•</span>
          <span>Offline Mode</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          <button
            type="button"
            onClick={handleRetry}
            disabled={isChecking || retryStatus === 'checking'}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:scale-95 text-white font-bold text-sm tracking-wide transition-all shadow-[0_0_25px_rgba(229,9,20,0.4)] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <i
              className={`fa-solid fa-arrows-rotate text-sm ${
                isChecking || retryStatus === 'checking' ? 'animate-spin' : ''
              }`}
            />
            <span>
              {isChecking || retryStatus === 'checking'
                ? 'Checking Network...'
                : retryStatus === 'failed'
                ? 'Still Offline, Retry?'
                : 'Try Again'}
            </span>
          </button>

          {hasSavedItems && (
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="w-full sm:w-auto px-5 py-3 rounded-xl glass-mirror hover:bg-white/10 active:scale-95 text-gray-200 hover:text-white font-semibold text-sm transition-all border border-white/15 cursor-pointer flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-bookmark text-xs text-red-500" />
              <span>Browse Saved List</span>
            </button>
          )}
        </div>

        {/* Troubleshooting Hints */}
        <div className="pt-6 border-t border-white/[0.08] text-left">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
            Quick Troubleshooting:
          </p>
          <ul className="text-xs text-gray-400 space-y-1.5 list-disc list-inside">
            <li>Ensure Wi-Fi or cellular mobile data is enabled</li>
            <li>Try turning Airplane mode on and off</li>
            <li>Check your router or hotspot connection</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OfflineScreen;
