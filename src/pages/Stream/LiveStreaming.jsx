import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import RailRow from '../../components/RailRow/RailRow';
import LiveTVCard from '../../components/Live/LiveTVCard';
import LiveMatchCard from '../../components/Live/LiveMatchCard';
import { useLiveFavorites } from '../../hooks/useLiveFavorites';
import { PlayerSkeleton } from '../../components/Skeleton/Skeleton';
import { useNetworkStatus } from '../../context/NetworkContext';
import {
  LIVE_CHANNELS,
  getLiveStreamOrMatchById,
  getCachedLiveMatches,
  getStreamEmbedUrl,
  formatViewerCount,
} from '../../content/liveStreams';

const LiveStreaming = () => {
  const { streamId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isFavorite, toggleFavorite } = useLiveFavorites();
  const { isOnline, isWeak, isChecking, checkConnection, downlink } = useNetworkStatus();

  const [copied, setCopied] = useState(false);
  const [playerKey, setPlayerKey] = useState(0);
  const [theaterMode, setTheaterMode] = useState(false);
  const [playerLoaded, setPlayerLoaded] = useState(false);

  // Mobile landscape lock/hint
  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 767px) and (pointer: coarse)');
    const orientation = window.screen?.orientation;

    if (!mobileQuery.matches || !orientation?.lock) return undefined;

    orientation.lock('landscape').catch(() => {});
    return () => {
      if (orientation.unlock) {
        orientation.unlock();
      }
    };
  }, []);

  // Resolve channel / match data from location.state or cache
  const channel = useMemo(() => {
    const fromState = location.state?.stream;
    if (
      fromState &&
      (String(fromState.streamId) === String(streamId) ||
        String(fromState.id) === String(streamId))
    ) {
      return fromState;
    }
    return (
      getLiveStreamOrMatchById(streamId) || {
        id: String(streamId),
        streamId: String(streamId),
        name: `Live Stream #${streamId}`,
        category: 'Live Broadcast',
        network: 'Live TV',
        embed: getStreamEmbedUrl(streamId),
        viewers: 'Live',
        hd: true,
      }
    );
  }, [streamId, location.state]);

  // Server sources selection
  const [activeSourceId, setActiveSourceId] = useState(
    () => channel?.sources?.[0]?.id || null
  );

  useEffect(() => {
    if (channel?.sources && channel.sources.length > 0) {
      setActiveSourceId(channel.sources[0].id);
    } else {
      setActiveSourceId(null);
    }
  }, [channel]);

  const activeEmbedUrl = useMemo(() => {
    if (activeSourceId && Array.isArray(channel?.sources)) {
      const found = channel.sources.find((s) => s.id === activeSourceId);
      if (found?.embed) return found.embed;
    }
    return channel?.embed || getStreamEmbedUrl(streamId);
  }, [channel, activeSourceId, streamId]);

  // Reset player loading overlay when stream URL or reload key changes
  useEffect(() => {
    setPlayerLoaded(false);
  }, [activeEmbedUrl, playerKey]);

  // Other live matches for quick switching
  const cachedMatches = useMemo(() => getCachedLiveMatches() || [], []);
  const otherMatches = useMemo(() => {
    return cachedMatches.filter(
      (m) =>
        String(m.id) !== String(streamId) &&
        String(m.streamId) !== String(streamId)
    );
  }, [cachedMatches, streamId]);

  // Other TV channels for quick switching
  const otherChannels = useMemo(() => {
    return LIVE_CHANNELS.filter(
      (ch) =>
        String(ch.streamId) !== String(streamId) &&
        String(ch.id) !== String(streamId)
    );
  }, [streamId]);

  const isMatch = Boolean(
    channel?.teams?.home || channel?.teams?.away || channel?.league
  );

  const handleShareStream = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Watch ${channel.name} Live on CineFlix`,
          url,
        });
      } catch {
        // user cancelled
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // clipboard blocked
      }
    }
  };

  const handleRefreshPlayer = () => {
    setPlayerKey((k) => k + 1);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/live');
    }
  };

  const handleSelectMatch = useCallback(
    (m) => {
      navigate(`/live-stream/${m.id}`, { state: { stream: m } });
    },
    [navigate]
  );

  const handleSelectChannel = useCallback(
    (ch) => {
      navigate(`/live-stream/${ch.streamId || ch.id}`, {
        state: { stream: ch },
      });
    },
    [navigate]
  );

  return (
    <div className="min-h-screen w-full bg-[#06060a] text-white flex flex-col select-none pb-24 md:pb-8">
      {/* ── Ambient Backdrop Glow ── */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full sm:w-3/4 h-[300px] bg-red-600/15 blur-[100px] sm:blur-[120px] rounded-full" />
      </div>

      {/* ── Top Bar with Navigation & Title ── */}
      <header className="h-14 sm:h-16 bg-[#07070d]/95 backdrop-blur-2xl border-b border-white/[0.08] px-3 sm:px-6 flex items-center justify-between gap-2 z-30 shrink-0 shadow-xl">
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Back to browse"
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 active:bg-white/20 md:hover:bg-white/15 active:scale-95 border border-white/10 text-white text-xs sm:text-sm font-bold cursor-pointer transition-all shrink-0"
          >
            <i className="fa-solid fa-arrow-left text-xs" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-block w-2 h-2 rounded-full bg-red-600 shrink-0 shadow-[0_0_8px_#e50914] animate-pulse" />
            <h1 className="text-xs sm:text-sm md:text-base font-black text-white truncate max-w-[150px] sm:max-w-md md:max-w-xl drop-shadow">
              {channel.name}
            </h1>
            <span className="text-[9px] font-bold text-gray-300 bg-white/[0.08] backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 shrink-0 hidden sm:inline-block">
              {channel.league ||
                channel.category_name ||
                channel.category ||
                `Stream #${channel.streamId || streamId}`}
            </span>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Favorite Button */}
          <button
            type="button"
            onClick={(e) => toggleFavorite(channel, e)}
            aria-label={
              isFavorite(channel) ? 'Remove from favorites' : 'Add to favorites'
            }
            title={
              isFavorite(channel) ? 'Remove from favorites' : 'Add to favorites'
            }
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer border active:scale-90 ${
              isFavorite(channel)
                ? 'bg-red-600 text-white border-red-500 shadow-md'
                : 'bg-white/[0.06] active:bg-white/15 md:hover:bg-white/15 text-gray-300 border-white/10'
            }`}
          >
            <i
              className={`fa-heart text-xs ${
                isFavorite(channel) ? 'fa-solid text-white' : 'fa-regular'
              }`}
            />
          </button>

          {/* Theater Mode Toggle (Desktop only) */}
          <button
            type="button"
            onClick={() => setTheaterMode((prev) => !prev)}
            aria-label={theaterMode ? 'Exit theater mode' : 'Theater mode'}
            title={theaterMode ? 'Exit theater mode' : 'Theater mode'}
            className="hidden md:flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.06] md:hover:bg-white/15 border border-white/10 text-gray-300 md:hover:text-white text-xs cursor-pointer transition-all"
          >
            <i
              className={`fa-solid ${
                theaterMode ? 'fa-compress' : 'fa-expand'
              } text-xs`}
            />
          </button>

          {/* Reload Stream */}
          <button
            type="button"
            onClick={handleRefreshPlayer}
            aria-label="Reload Video Stream"
            title="Reload Video Stream"
            className="flex items-center justify-center w-8 h-8 sm:w-auto sm:px-3 sm:py-1.5 rounded-xl bg-white/[0.06] active:bg-white/15 md:hover:bg-white/15 border border-white/10 text-gray-300 md:hover:text-white text-xs font-semibold cursor-pointer transition-all active:scale-90"
          >
            <i className="fa-solid fa-rotate-right text-[11px]" />
            <span className="hidden sm:inline ml-1.5">Reload</span>
          </button>

          {/* Share Stream */}
          <button
            type="button"
            onClick={handleShareStream}
            aria-label="Share stream link"
            title="Share stream link"
            className="flex items-center justify-center w-8 h-8 sm:w-auto sm:px-3 sm:py-1.5 rounded-xl bg-white/[0.06] active:bg-white/15 md:hover:bg-white/15 border border-white/10 text-gray-300 md:hover:text-white text-xs font-semibold cursor-pointer transition-all active:scale-90"
          >
            <i
              className={`fa-solid ${
                copied ? 'fa-check text-emerald-400' : 'fa-share-nodes'
              } text-[11px]`}
            />
            <span className="hidden sm:inline ml-1.5">
              {copied ? 'Copied' : 'Share'}
            </span>
          </button>

          {/* Viewers Pill */}
          {channel.viewers && (
            <span className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 font-extrabold text-[9px] sm:text-xs shadow-[0_0_10px_rgba(229,9,20,0.3)]">
              <i className="fa-solid fa-users text-[8px] sm:text-[9px]" />
              <span>{formatViewerCount(channel.viewers)}</span>
            </span>
          )}
        </div>
      </header>

      {/* ── Main Video Player Viewport (16:9 Aspect Ratio on Mobile) ── */}
      <main
        className={`relative w-full mx-auto transition-all duration-300 ${
          theaterMode
            ? 'max-w-none px-0 my-0'
            : 'max-w-7xl px-0 sm:px-4 md:px-6 sm:my-3'
        }`}
      >
        <div
          className={`relative w-full bg-black overflow-hidden shadow-2xl ${
            theaterMode
              ? 'h-[50vh] sm:h-[65vh] md:h-[75vh] lg:h-[82vh] rounded-none border-b border-white/10'
              : 'aspect-video sm:aspect-auto sm:h-[55vh] md:h-[68vh] lg:h-[75vh] rounded-none sm:rounded-2xl border-y sm:border border-white/10'
          }`}
        >
          {activeEmbedUrl ? (
            <>
              {!playerLoaded && (
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                  <PlayerSkeleton />
                </div>
              )}
              <iframe
                key={`${activeEmbedUrl}-${playerKey}`}
                src={activeEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                allow="accelerometer; autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope;"
                sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-top-navigation-by-user-activation"
                title={channel?.name || 'Live Channel Stream'}
                className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
                  playerLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setPlayerLoaded(true)}
              />
            </>
          ) : (
            <PlayerSkeleton />
          )}

          {/* Weak Network Floating HUD Indicator */}
          {isOnline && isWeak && (
            <div className="absolute top-3 left-3 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/85 border border-amber-500/40 text-amber-200 text-xs font-semibold backdrop-blur-xl shadow-lg">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Slow Connection {downlink ? `(~${downlink} Mbps)` : ''} • May Buffer</span>
            </div>
          )}

          {/* In-Player Offline Interruption Overlay */}
          {!isOnline && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-black/90 backdrop-blur-md text-white text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center mb-3 sm:mb-4 text-[#E50914] shadow-[0_0_25px_rgba(229,9,20,0.5)]">
                <i className="fa-solid fa-wifi-slash text-xl sm:text-2xl animate-pulse" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-1">Live Broadcast Paused • Offline</h3>
              <p className="text-xs sm:text-sm text-gray-300 max-w-sm mb-4 leading-relaxed">
                Live stream disconnected. Check your connection to resume the broadcast.
              </p>
              <button
                type="button"
                onClick={() => checkConnection()}
                disabled={isChecking}
                className="px-5 py-2 rounded-xl bg-red-600 md:hover:bg-red-700 active:scale-95 text-white font-bold text-xs tracking-wider transition-all shadow-[0_0_15px_rgba(229,9,20,0.4)] flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <i className={`fa-solid fa-arrows-rotate text-xs ${isChecking ? 'animate-spin' : ''}`} />
                <span>{isChecking ? 'Reconnecting...' : 'Retry Now'}</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ── Information Bar, Multi-Server Controls & Live Switcher ── */}
      <footer className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-3 sm:py-5 space-y-5">
        {/* Stream Details & Server Feed Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 sm:gap-4 p-3.5 sm:p-5 rounded-2xl bg-gradient-to-r from-[#12121e] to-[#0c0c14] border border-white/10 shadow-xl">
          {/* Match / Channel Details */}
          {isMatch ? (
            <div className="space-y-2 w-full md:w-auto">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 max-w-lg">
                {/* Home Team */}
                <div className="flex items-center gap-2 bg-black/50 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border border-white/10 min-w-0">
                  {channel.teams?.home?.badge ? (
                    <img
                      src={channel.teams.home.badge}
                      alt=""
                      className="w-5 h-5 sm:w-7 sm:h-7 object-contain shrink-0"
                    />
                  ) : (
                    <i className="fa-solid fa-shield text-xs text-gray-400 shrink-0" />
                  )}
                  <span className="font-bold text-xs sm:text-sm text-white truncate">
                    {channel.teams?.home?.name || 'Home'}
                  </span>
                </div>

                <span className="px-2 py-0.5 rounded-full bg-red-950/80 text-red-400 font-black text-[10px] sm:text-xs border border-red-500/40 shadow-sm shrink-0">
                  VS
                </span>

                {/* Away Team */}
                <div className="flex items-center gap-2 bg-black/50 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border border-white/10 min-w-0">
                  {channel.teams?.away?.badge ? (
                    <img
                      src={channel.teams.away.badge}
                      alt=""
                      className="w-5 h-5 sm:w-7 sm:h-7 object-contain shrink-0"
                    />
                  ) : (
                    <i className="fa-solid fa-shield text-xs text-gray-400 shrink-0" />
                  )}
                  <span className="font-bold text-xs sm:text-sm text-white truncate">
                    {channel.teams?.away?.name || 'Away'}
                  </span>
                </div>
              </div>

              {channel.league && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] sm:text-xs font-bold text-gray-300 bg-white/[0.08] backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10 flex items-center gap-1">
                    <i className="fa-solid fa-trophy text-amber-400 text-[9px]" />
                    <span>{channel.league}</span>
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              {channel.badge && (
                <div className="w-10 h-8 sm:w-14 sm:h-10 bg-black/80 rounded-xl p-1 border border-white/15 flex items-center justify-center shrink-0 shadow-lg">
                  <img
                    src={channel.badge}
                    alt={channel.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="font-bold text-xs sm:text-base text-white truncate">
                    {channel.name}
                  </h2>
                  <span className="text-[8px] sm:text-[9px] font-black text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full border border-amber-400/30">
                    HD
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-400 truncate">
                  {channel.currentShow || channel.category || '24/7 Live Broadcast'}
                </p>
              </div>
            </div>
          )}

          {/* Server Feeds Switcher */}
          {channel.sources && channel.sources.length > 1 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1 md:pt-0">
              <span className="text-[11px] text-gray-400 font-semibold flex items-center gap-1">
                <i className="fa-solid fa-server text-[9px]" />
                <span>Feeds:</span>
              </span>
              {channel.sources.map((s, idx) => {
                const isSelected = (activeSourceId || channel.sources[0].id) === s.id;
                return (
                  <button
                    key={s.id || idx}
                    type="button"
                    onClick={() => setActiveSourceId(s.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer border active:scale-95 ${
                      isSelected
                        ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white border-white/20 shadow-md'
                        : 'bg-white/[0.06] active:bg-white/15 md:hover:bg-white/15 text-gray-300 border-white/10'
                    }`}
                  >
                    <span>{s.name || `Server ${idx + 1}`}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Channel Surfer Rails */}
        <div className="space-y-5 pt-1">
          {/* Switch Live Match Rail */}
          {otherMatches.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">
                  <i className="fa-solid fa-trophy text-red-500 text-xs" />
                  <span>Other Live Matches</span>
                  <span className="text-[10px] text-gray-400 font-normal">
                    ({otherMatches.length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/live')}
                  className="text-[11px] sm:text-xs text-red-400 active:text-red-300 md:hover:text-red-300 font-semibold cursor-pointer active:scale-95"
                >
                  View All Hub →
                </button>
              </div>
              <RailRow
                items={otherMatches}
                eager={true}
                renderItem={(m) => (
                  <LiveMatchCard
                    key={m.id}
                    match={m}
                    onSelect={() => handleSelectMatch(m)}
                    isFavorite={isFavorite(m)}
                    onToggleFavorite={toggleFavorite}
                  />
                )}
              />
            </div>
          )}

          {/* Switch Channel Rail */}
          {otherChannels.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">
                  <i className="fa-solid fa-satellite-dish text-sky-400 text-xs" />
                  <span>24/7 Live Sports Television Channels</span>
                  <span className="text-[10px] text-gray-400 font-normal">
                    ({otherChannels.length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/live')}
                  className="text-[11px] sm:text-xs text-red-400 active:text-red-300 md:hover:text-red-300 font-semibold cursor-pointer active:scale-95"
                >
                  View All Hub →
                </button>
              </div>
              <RailRow
                items={otherChannels}
                eager={true}
                renderItem={(ch) => (
                  <LiveTVCard
                    key={ch.id}
                    channel={ch}
                    onSelect={() => handleSelectChannel(ch)}
                    isFavorite={isFavorite(ch)}
                    onToggleFavorite={toggleFavorite}
                  />
                )}
              />
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

export default React.memo(LiveStreaming);