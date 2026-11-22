import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import LiveSection from '../../components/Live/LiveSection';
import LiveMatchCard from '../../components/Live/LiveMatchCard';
import LiveTVCard from '../../components/Live/LiveTVCard';
import RailRow from '../../components/RailRow/RailRow';
import Footer from '../../components/Footer/Footer';
import {
  LIVE_CHANNELS,
  fetchLiveStreamsData,
  getCachedLiveMatches,
  formatViewerCount,
} from '../../content/liveStreams';

const Live = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState(() => getCachedLiveMatches());
  const [channels] = useState(LIVE_CHANNELS);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const data = await fetchLiveStreamsData();
      if (Array.isArray(data.matches) && data.matches.length > 0) {
        setMatches(data.matches);
      }
    } catch (err) {
      console.error('Failed to load live sports data:', err);
    } finally {
      setIsLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(), 60000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Featured Hero Item: pick top match with teams or top channel
  const heroItem = useMemo(() => {
    if (matches.length > 0) {
      // Find match with highest viewers or first match with valid teams
      const sorted = [...matches].sort((a, b) => (b.viewers || 0) - (a.viewers || 0));
      return sorted[0];
    }
    return LIVE_CHANNELS[0] || null;
  }, [matches]);

  const isHeroMatch = Boolean(heroItem?.teams?.home);

  const handleOpenStream = (item) => {
    navigate(`/live-stream/${item.streamId || item.id}`, {
      state: { stream: item },
    });
  };

  return (
    <div className="relative min-h-screen bg-[#0e0e0e] text-white selection:bg-[#E50914] selection:text-white pt-[58px] md:pt-[82px]">
      {/* ===== HERO LIVE SHOWCASE ===== */}
      {heroItem && (
        <div className="relative w-full min-h-[400px] sm:min-h-[460px] md:min-h-[520px] flex items-center overflow-hidden bg-black">
          {/* Background backdrop */}
          <img
            src={
              heroItem.poster ||
              heroItem.bg ||
              'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1920&q=80'
            }
            alt={heroItem.name}
            className="absolute inset-0 w-full h-full object-cover brightness-[0.25]"
            onError={(e) => {
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1920&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0e0e0e] via-[#0e0e0e]/85 to-transparent" />

          {/* Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-8 sm:py-12 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10 w-full">
            <div className="flex flex-col space-y-3 sm:space-y-4 max-w-2xl w-full">
              {/* Badges */}
              <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-600 text-white font-extrabold text-[10px] sm:text-xs tracking-wider uppercase shadow-md shadow-red-900/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  FEATURED LIVE MATCH
                </span>

                {(heroItem.league || heroItem.category_name || heroItem.category) && (
                  <span className="px-2.5 py-1 rounded bg-white/10 text-[10px] sm:text-xs font-semibold text-gray-200 border border-white/10 uppercase">
                    {heroItem.league || heroItem.category_name || heroItem.category}
                  </span>
                )}

                {heroItem.viewers && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-black/80 text-[10px] sm:text-xs font-medium text-red-400 border border-white/10">
                    <i className="fa-solid fa-users text-[10px]" />
                    {formatViewerCount(heroItem.viewers)} Watching
                  </span>
                )}
              </div>

              {/* Matchup Center or Channel Title */}
              {isHeroMatch ? (
                <div className="flex flex-col gap-3 py-1">
                  <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
                    {/* Home Team */}
                    <div className="flex items-center gap-2 sm:gap-3 bg-black/40 px-3 py-2 rounded-xl border border-white/10">
                      {heroItem.teams?.home?.badge && (
                        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/5 p-1 flex items-center justify-center shrink-0">
                          <img
                            src={heroItem.teams.home.badge}
                            alt={heroItem.teams.home.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      )}
                      <span className="text-base sm:text-xl font-black text-white">
                        {heroItem.teams?.home?.name}
                      </span>
                    </div>

                    <span className="px-2 py-0.5 rounded bg-red-900/60 text-red-400 font-black text-xs sm:text-sm border border-red-500/30">
                      VS
                    </span>

                    {/* Away Team */}
                    <div className="flex items-center gap-2 sm:gap-3 bg-black/40 px-3 py-2 rounded-xl border border-white/10">
                      {heroItem.teams?.away?.badge && (
                        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/5 p-1 flex items-center justify-center shrink-0">
                          <img
                            src={heroItem.teams.away.badge}
                            alt={heroItem.teams.away.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      )}
                      <span className="text-base sm:text-xl font-black text-white">
                        {heroItem.teams?.away?.name}
                      </span>
                    </div>
                  </div>
                  <h1 className="text-xl sm:text-2xl text-gray-300 font-semibold truncate">
                    {heroItem.name}
                  </h1>
                </div>
              ) : (
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                  {heroItem.name}
                </h1>
              )}

              <p className="text-xs sm:text-sm text-gray-400 max-w-xl">
                {heroItem.league
                  ? `Live ${heroItem.league} broadcast with multiple high-definition servers and instant play.`
                  : heroItem.currentShow || 'Live streaming sports events and television feeds in full HD.'}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 sm:gap-4 pt-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleOpenStream(heroItem)}
                  className="flex items-center gap-2.5 px-6 sm:px-8 py-3 rounded-lg bg-[#E50914] hover:bg-[#f40612] text-white font-black text-xs sm:text-sm tracking-wider uppercase transition-colors shadow-lg shadow-red-900/40"
                >
                  <i className="fa-solid fa-play text-xs" />
                  <span>WATCH MATCH LIVE</span>
                </button>

                <button
                  type="button"
                  onClick={() => loadData(true)}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 transition-colors"
                >
                  <i className={`fa-solid fa-arrows-rotate text-xs ${isRefreshing ? 'animate-spin text-red-500' : ''}`} />
                  <span>{isRefreshing ? 'Refreshing...' : 'Refresh Matches'}</span>
                </button>
              </div>
            </div>

            {/* Right Quick Match / Channel Preview */}
            <div className="hidden lg:flex flex-col gap-2.5 w-80 shrink-0 bg-[#141414] p-3.5 rounded-xl border border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <i className="fa-solid fa-trophy text-red-500" />
                  Other Live Events
                </span>
                <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                  {matches.length} Live
                </span>
              </span>

              {matches.slice(1, 5).map((m) => (
                <div
                  key={m.id}
                  onClick={() => handleOpenStream(m)}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-[#1a1a1a] hover:bg-[#222222] border border-white/5 hover:border-red-500/50 cursor-pointer transition-colors group"
                >
                  <div className="w-10 h-10 rounded bg-black p-1 flex items-center justify-center border border-white/10 shrink-0">
                    {m.teams?.home?.badge ? (
                      <img src={m.teams.home.badge} alt="" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <i className="fa-solid fa-shield text-xs text-red-500" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white truncate group-hover:text-red-400 transition-colors">
                      {m.name}
                    </span>
                    <span className="text-[10px] text-gray-400 truncate">
                      {m.league || m.category_name} • {formatViewerCount(m.viewers)} viewers
                    </span>
                  </div>
                  <i className="fa-solid fa-play text-[10px] text-gray-400 group-hover:text-red-500 ml-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== MAIN CONTENT RAILS ===== */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 space-y-8 sm:space-y-12 pb-24 md:pb-16 mt-4 sm:mt-8">
        {/* Live Matches from API */}
        <LiveSection
          title="Live Sports Matches"
          subtitle="Real-time match broadcasts powered by ondemand.st API"
          defaultTab="matches"
          showAllLink={false}
        />

        {/* 24/7 Live Sports Channels */}
        <LiveSection
          title="24/7 Live Sports Channels"
          subtitle="Stream Willow, Sony Sports, Sky Sports, TNT Sports & Fox Sports around the clock"
          defaultTab="channels"
          showAllLink={false}
        />

        <Footer />
      </div>
    </div>
  );
};

export default React.memo(Live);
