import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import RailRow from '../../components/RailRow/RailRow';
import LiveTVCard from '../../components/Live/LiveTVCard';
import {
  LIVE_CHANNELS,
  getLiveChannelById,
  getStreamEmbedUrl,
  formatViewerCount,
} from '../../content/liveStreams';

const LiveStreaming = () => {
  const { streamId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [copied, setCopied] = useState(false);
  const [playerKey, setPlayerKey] = useState(0);

  // Landscape orientation lock on mobile devices
  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 767px) and (pointer: coarse)');
    const isMobile = mobileQuery.matches;
    const orientation = window.screen.orientation;

    if (!isMobile || !orientation?.lock) return undefined;

    orientation.lock('landscape').catch(() => { });
    return () => {
      if (orientation.unlock) {
        orientation.unlock();
      }
    };
  }, []);

  // Resolve channel information from location.state or LIVE_CHANNELS
  const channel = useMemo(() => {
    const fromState = location.state?.stream;
    if (fromState && (String(fromState.streamId) === String(streamId) || String(fromState.id) === String(streamId))) {
      return fromState;
    }
    return getLiveChannelById(streamId) || {
      id: String(streamId),
      streamId: String(streamId),
      name: `Channel ${streamId}`,
      category: 'Live Broadcast',
      network: 'Live TV',
      embed: getStreamEmbedUrl(streamId),
      viewers: 'Live',
      hd: true,
    };
  }, [streamId, location.state]);

  const embedUrl = useMemo(() => {
    return channel?.embed || getStreamEmbedUrl(streamId);
  }, [channel, streamId]);

  const iframeSnippet = useMemo(() => {
    return `<iframe src="${embedUrl}" width="100%" height="100%" style="border:0;" allowfullscreen></iframe>`;
  }, [embedUrl]);

  // Other channels for quick channel switching
  const otherChannels = useMemo(() => {
    return LIVE_CHANNELS.filter(
      (ch) => String(ch.streamId) !== String(streamId) && String(ch.id) !== String(streamId)
    );
  }, [streamId]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(iframeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleRefreshPlayer = () => {
    setPlayerKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-white flex flex-col select-none">
      {/* ── Top Bar with Navigation & Channel Title ── */}
      <header className="h-12 sm:h-14 md:h-16 bg-[#121212] border-b border-white/10 px-3 sm:px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/')}
            aria-label="Back to browse"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold transition-colors shrink-0"
          >
            <i className="fa-solid fa-arrow-left text-xs" />
            <span className="hidden xs:inline">Back</span>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-600 shrink-0 shadow-[0_0_8px_#e50914] animate-pulse" />
            <h1 className="text-xs sm:text-sm md:text-base font-bold text-white truncate max-w-[140px] xs:max-w-[200px] sm:max-w-md md:max-w-xl">
              {channel.name}
            </h1>
            <span className="text-[10px] font-semibold text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/10 shrink-0">
              Stream #{channel.streamId || streamId}
            </span>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRefreshPlayer}
            title="Reload Video Stream"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors"
          >
            <i className="fa-solid fa-arrows-rotate text-[11px]" />
            <span className="hidden sm:inline">Reload</span>
          </button>

          <button
            type="button"
            onClick={handleCopyCode}
            title="Copy iframe embed code"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors"
          >
            <i className={`fa-solid ${copied ? 'fa-check text-green-400' : 'fa-code'} text-[11px]`} />
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Embed'}</span>
          </button>

          {channel.viewers && (
            <span className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 rounded bg-red-950/60 border border-red-500/30 text-red-300 font-semibold text-[10px] sm:text-xs">
              <i className="fa-solid fa-users text-[9px] sm:text-[10px]" />
              {formatViewerCount(channel.viewers)}
              <span className="hidden xs:inline"> Watching</span>
            </span>
          )}
        </div>
      </header>

      {/* ── Main Video Player Viewport with the requested iframe ── */}
      <main className="relative flex-1 w-full bg-black h-[40vh] sm:min-h-[55vh] md:min-h-[70vh] max-h-[85vh] flex items-center justify-center">
        {embedUrl ? (
          <iframe
            key={`${embedUrl}-${playerKey}`}
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            allow="accelerometer; autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope;"
            sandbox="allow-scripts allow-same-origin"
            title={channel?.name || 'Live Channel Stream'}
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 gap-3 p-8">
            <i className="fa-solid fa-spinner animate-spin text-3xl text-red-500" />
            <p className="text-sm font-medium">Connecting to stream #{streamId}...</p>
          </div>
        )}
      </main>

      {/* ── Channel Information & Switcher Footer ── */}
      <footer className="bg-[#121212] border-t border-white/10 p-3 sm:p-5 md:p-6 shrink-0 space-y-4">
        {/* Channel Info Card */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#181818] border border-white/5">
          <div className="flex items-center gap-3 min-w-0">
            {channel.badge && (
              <div className="w-12 h-8 sm:w-14 sm:h-9 bg-black/80 rounded-md p-1 border border-white/10 flex items-center justify-center shrink-0">
                <img
                  src={channel.badge}
                  alt={channel.name}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm sm:text-base text-white truncate">
                  {channel.name}
                </h2>
                {channel.hd && (
                  <span className="text-[9px] font-black text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/30">
                    HD
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 truncate">
                {channel.currentShow || channel.category || '24/7 Live Broadcast'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            {channel.network && (
              <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[11px] font-medium text-gray-300">
                {channel.network}
              </span>
            )}
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5 text-[11px] sm:text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Stream Active
            </span>
          </div>
        </div>

        {/* Switch Channel Rail */}
        {otherChannels.length > 0 && (
          <div className="pt-2">
            <RailRow
              titleAlt={
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-300 uppercase tracking-wider">
                  <i className="fa-solid fa-satellite-dish text-red-500 text-xs" />
                  <span>Switch to Other Live Channels</span>
                </div>
              }
              items={otherChannels}
              eager={true}
              renderItem={(ch) => (
                <LiveTVCard
                  key={ch.id}
                  channel={ch}
                  onSelect={() =>
                    navigate(`/live-stream/${ch.streamId || ch.id}`, {
                      state: { stream: ch },
                    })
                  }
                />
              )}
            />
          </div>
        )}
      </footer>
    </div>
  );
};

export default React.memo(LiveStreaming);
