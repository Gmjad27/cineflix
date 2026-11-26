import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import LiveHeroBanner from '../../components/Live/LiveHeroBanner';
import RailRow from '../../components/RailRow/RailRow';
import LiveMatchCard from '../../components/Live/LiveMatchCard';
import LiveTVCard from '../../components/Live/LiveTVCard';
import Footer from '../../components/Footer/Footer';
import { useLiveFavorites } from '../../hooks/useLiveFavorites';
import Skeleton, { ShimmerBlock } from '../../components/Skeleton/Skeleton';
import { useNetworkStatus } from '../../context/NetworkContext';
import OfflineScreen from '../../components/NetworkStatus/OfflineScreen';
import {
  LIVE_CHANNELS,
  fetchLiveStreamsData,
  getCachedLiveMatches,
} from '../../content/liveStreams';

const Live = () => {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useLiveFavorites();
  const { isOnline } = useNetworkStatus();

  // Data & Network States
  const [matches, setMatches] = useState(() => getCachedLiveMatches() || []);
  const [isLoading, setIsLoading] = useState(
    () => !(getCachedLiveMatches()?.length > 0)
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter & Search States
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const data = await fetchLiveStreamsData();
      if (Array.isArray(data?.matches)) {
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
    const interval = setInterval(() => loadData(false), 60000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Dynamic Category Counts
  const categoryList = useMemo(() => {
    const map = new Map();
    matches.forEach((m) => {
      const raw = (m.category_name || m.category || m.sport || '').trim();
      if (!raw) return;
      const key = raw.toLowerCase();
      if (map.has(key)) {
        map.get(key).count += 1;
      } else {
        const label =
          key === 'american-football' || key === 'american football'
            ? 'NFL'
            : raw.replace(/-/g, ' ');
        map.set(key, { id: key, label, count: 1 });
      }
    });
    return [{ id: 'all', label: 'All Sports', count: matches.length }, ...map.values()];
  }, [matches]);

  // Reset selectedCategory if that category ends
  useEffect(() => {
    if (
      selectedCategory !== 'all' &&
      !categoryList.some((c) => c.id === selectedCategory)
    ) {
      setSelectedCategory('all');
    }
  }, [categoryList, selectedCategory]);

  // Spotlight slides for HeroBanner (top live matches prioritized, fallback to channels)
  const spotlightSlides = useMemo(() => {
    const liveOnly = matches.filter(
      (m) =>
        m.status !== 'upcoming' &&
        m.category_name !== 'upcoming-matches' &&
        !(m.starts_at && m.starts_at * 1000 > Date.now())
    );
    const pool = liveOnly.length > 0 ? liveOnly : matches;
    const sorted = [...pool].sort((a, b) => (b.viewers || 0) - (a.viewers || 0));
    const topMatches = sorted.slice(0, 5);
    return topMatches.length > 0 ? topMatches : LIVE_CHANNELS.slice(0, 4);
  }, [matches]);

  // Filtered Matches & Channels based on category & search
  const filteredMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return matches.filter((m) => {
      const cat = (m.category_name || m.category || m.sport || '').trim().toLowerCase();
      const catOk = selectedCategory === 'all' || cat === selectedCategory;
      if (!catOk) return false;
      if (!q) return true;
      return (
        m.name?.toLowerCase().includes(q) ||
        m.league?.toLowerCase().includes(q) ||
        m.teams?.home?.name?.toLowerCase().includes(q) ||
        m.teams?.away?.name?.toLowerCase().includes(q)
      );
    });
  }, [matches, selectedCategory, searchQuery]);

  const filteredChannels = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return LIVE_CHANNELS;
    return LIVE_CHANNELS.filter(
      (ch) =>
        ch.name?.toLowerCase().includes(q) ||
        ch.category?.toLowerCase().includes(q) ||
        ch.network?.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Partition Matches into:
  // Row 1: Live Now
  // Row 2: Upcoming Matches
  const { liveNowMatches, upcomingMatches } = useMemo(() => {
    const live = [];
    const upcoming = [];

    filteredMatches.forEach((m) => {
      const isUp =
        m.status === 'upcoming' ||
        m.category_name === 'upcoming-matches' ||
        (m.starts_at && m.starts_at * 1000 > Date.now());

      if (isUp) {
        upcoming.push(m);
      } else {
        live.push(m);
      }
    });

    if (live.length > 0 && upcoming.length === 0 && filteredMatches.length > 4) {
      return {
        liveNowMatches: filteredMatches.slice(0, Math.ceil(filteredMatches.length / 2)),
        upcomingMatches: filteredMatches.slice(Math.ceil(filteredMatches.length / 2)),
      };
    }

    return {
      liveNowMatches: live.length > 0 ? live : filteredMatches.slice(0, 6),
      upcomingMatches: upcoming.length > 0 ? upcoming : filteredMatches.slice(6),
    };
  }, [filteredMatches]);

  const handleOpenStream = useCallback(
    (item) => {
      if (!item) return;
      navigate(`/live-stream/${item.streamId || item.id}`, {
        state: { stream: item },
      });
    },
    [navigate]
  );

  // Loading Skeleton State (Includes Live HeroBanner Skeleton)
  if (isLoading && matches.length === 0) {
    return (
      <div className="min-h-screen bg-[#07070a] text-white pt-[58px] md:pt-0 pb-24 md:pb-16 overflow-x-hidden">
        <Skeleton type="live-hero" />

        {/* Filter bar shimmer */}
        <div className="max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-12 flex items-center justify-between py-3.5 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <ShimmerBlock key={i} className="w-20 h-7 rounded-full shrink-0" />
            ))}
          </div>
          <ShimmerBlock className="w-56 h-8 rounded-xl hidden sm:block" />
        </div>

        {/* 3 Rail Shimmers matching layout */}
        <div className="max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-12 space-y-8">
          {[1, 2, 3].map((row) => (
            <div key={row} className="space-y-3">
              <div className="flex items-center justify-between">
                <ShimmerBlock className="w-40 h-6 rounded-md" />
                <div className="flex gap-2">
                  <ShimmerBlock className="w-8 h-8 rounded-full" />
                  <ShimmerBlock className="w-8 h-8 rounded-full" />
                </div>
              </div>
              <div className="flex gap-3 overflow-hidden">
                {[1, 2, 3, 4, 5].map((card) => (
                  <div key={card} className="w-[215px] sm:w-[260px] shrink-0 space-y-2">
                    <ShimmerBlock className="w-full aspect-video rounded-xl" />
                    <ShimmerBlock className="w-3/4 h-4 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Offline State
  if (!isLoading && !isOnline && matches.length === 0) {
    return (
      <div className="min-h-screen bg-[#07070a] pt-[58px] md:pt-[76px] pb-24">
        <OfflineScreen
          onRetry={() => loadData(true)}
          title="Live Sports & TV Offline"
          message="Live matches and channel streams require an active internet connection to load current schedules."
        />
      </div>
    );
  }

  const hasAnyResults =
    liveNowMatches.length > 0 ||
    upcomingMatches.length > 0 ||
    filteredChannels.length > 0;

  return (
    <div className="min-h-screen bg-[#07070a] text-white selection:bg-[#E50914] selection:text-white pt-[58px] overflow-x-hidden">
      {/* ── 1. LIVE SPOTLIGHT HERO BANNER (Mobile-Responsive + Swipeable) ── */}
      <LiveHeroBanner
        slides={spotlightSlides}
        onWatch={handleOpenStream}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
        onRefresh={() => loadData(true)}
        isRefreshing={isRefreshing}
      />

      {/* ── 2. STICKY CONTROL & SEARCH DOCK ── */}
      <div className="sticky top-[58px] md:top-[76px] z-30 bg-[#07070a]/95 backdrop-blur-2xl border-b border-white/[0.08] shadow-lg">
        <div className="max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-12 py-2.5 sm:py-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-4">
          {/* Sport Category Pills */}
          <div
            role="tablist"
            aria-label="Filter live sports"
            className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar touch-pan-x py-0.5"
          >
            {categoryList.map(({ id, label, count }) => {
              const isActive = selectedCategory === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSelectedCategory(id)}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all cursor-pointer select-none active:scale-95 ${
                    isActive
                      ? 'bg-[#E50914] text-white shadow-[0_0_15px_rgba(229,9,20,0.45)]'
                      : 'bg-white/[0.05] text-gray-300 border border-white/10 active:bg-white/15 md:hover:bg-white/[0.1]'
                  }`}
                >
                  <span>{label}</span>
                  {count > 0 && (
                    <span
                      className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 leading-none rounded-full ${
                        isActive ? 'bg-black/30 text-white' : 'bg-white/10 text-gray-400'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Input & Sync Controls */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64 lg:w-72">
              <i className="fa-solid fa-magnifying-glass text-xs text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search match, team or channel..."
                aria-label="Search match, team or channel"
                className="w-full bg-white/[0.06] focus:bg-white/[0.09] border border-white/10 focus:border-[#E50914] rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-white placeholder-gray-400 outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 active:text-white md:hover:text-white cursor-pointer"
                >
                  <i className="fa-solid fa-xmark text-xs" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              title="Refresh Live Streams"
              aria-label="Refresh Live Streams"
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 text-gray-300 md:hover:text-white md:hover:bg-white/15 transition active:scale-90 active:bg-white/15 cursor-pointer shrink-0 disabled:opacity-60"
            >
              <i
                className={`fa-solid fa-arrows-rotate text-xs ${
                  isRefreshing ? 'animate-spin text-red-500' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. MAIN BROADCAST RAILS ── */}
      <main className="max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-12 pt-5 sm:pt-7 space-y-6 sm:space-y-8">
        {hasAnyResults ? (
          <>
            {/* ROW 1: LIVE | Live Now */}
            <RailRow
              tag="LIVE"
              showAccentBar
              showExploreAll={false}
              headerArrows
              eager
              title="Live Now"
              items={liveNowMatches}
              renderItem={(match) => (
                <LiveMatchCard
                  key={match.id}
                  match={match}
                  variant="live"
                  onSelect={handleOpenStream}
                  isFavorite={isFavorite(match)}
                  onToggleFavorite={toggleFavorite}
                />
              )}
            />

            {/* ROW 2: | Upcoming Matches */}
            <RailRow
              tag={null}
              showAccentBar
              showExploreAll={false}
              headerArrows
              eager
              title="Upcoming Matches"
              items={upcomingMatches}
              renderItem={(match) => (
                <LiveMatchCard
                  key={match.id}
                  match={match}
                  variant="upcoming"
                  onSelect={handleOpenStream}
                  isFavorite={isFavorite(match)}
                  onToggleFavorite={toggleFavorite}
                />
              )}
            />

            {/* ROW 3: TV | Trending Channels */}
            <RailRow
              tag="TV"
              showAccentBar
              showExploreAll={false}
              headerArrows
              eager
              title="Trending Channels"
              items={filteredChannels}
              renderItem={(channel) => (
                <LiveTVCard
                  key={channel.id}
                  channel={channel}
                  onSelect={handleOpenStream}
                  isFavorite={isFavorite(channel)}
                  onToggleFavorite={toggleFavorite}
                />
              )}
            />
          </>
        ) : (
          <div className="my-12 py-12 px-4 text-center rounded-2xl bg-[#10101a] border border-white/10 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-red-600/15 border border-red-500/30 flex items-center justify-center mx-auto mb-3 text-red-500">
              <i className="fa-solid fa-satellite-dish text-lg" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-1">
              No streams found
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 mb-4">
              {searchQuery
                ? `Nothing matched "${searchQuery}". Try another team, league, or channel.`
                : 'No streams available in this category right now.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="px-5 py-2 rounded-xl bg-[#E50914] text-white text-xs font-bold active:scale-95 transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        <Footer />
      </main>
    </div>
  );
};

export default React.memo(Live);
